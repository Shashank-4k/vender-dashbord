import hashlib
import bcrypt
from datetime import datetime, timedelta
from typing import Optional, Dict, Any
import jwt
from fastapi import Depends, HTTPException, status, Query
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from app.config import settings
from app.database import get_db
from app.models import User

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login", auto_error=False)

def get_password_hash(password: str) -> str:
    """
    Hashes a password using bcrypt with standard salt rounds.
    Never stores plain-text passwords.
    """
    salt = bcrypt.gensalt(rounds=12)
    return bcrypt.hashpw(password.encode("utf-8"), salt).decode("utf-8")

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Verifies a plain-text password against a stored secure password hash.
    Supports bcrypt and handles SHA-256 legacy hashes if present.
    Never allows plaintext fallback.
    """
    if not hashed_password or not plain_password:
        return False
    try:
        # Check if bcrypt hash ($2b$ or $2a$)
        if hashed_password.startswith("$2b$") or hashed_password.startswith("$2a$"):
            return bcrypt.checkpw(plain_password.encode("utf-8"), hashed_password.encode("utf-8"))
        
        # Check standard sha256 (64 hex characters)
        if len(hashed_password) == 64 and all(c in "0123456789abcdefABCDEF" for c in hashed_password):
            return hashlib.sha256(plain_password.encode("utf-8")).hexdigest() == hashed_password
    except Exception:
        return False
    return False

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """Generates a short-lived access JWT token."""
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire, "token_type": "access"})
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)

def create_refresh_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """Generates a long-lived refresh JWT token."""
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS))
    to_encode.update({"exp": expire, "token_type": "refresh"})
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)

def decode_token(token: str, expected_type: str = "access") -> Optional[Dict[str, Any]]:
    """Decodes and validates a JWT token ensuring type and expiration match."""
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        token_type = payload.get("token_type")
        if token_type and token_type != expected_type:
            return None
        return payload
    except jwt.PyJWTError:
        return None

def get_current_user(token: Optional[str] = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> Optional[User]:
    """Retrieves the current authenticated user from database via valid access token."""
    if not token:
        return None
    payload = decode_token(token, expected_type="access")
    if not payload:
        return None
    email: str = payload.get("sub")
    if not email:
        return None
    user = db.query(User).filter(User.email == email).first()
    return user

def require_auth(user: Optional[User] = Depends(get_current_user)) -> User:
    """Enforces authentication; raises HTTP 401 if token is missing or invalid."""
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication credentials were not provided or have expired",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return user

def require_admin(user: User = Depends(require_auth)) -> User:
    """Backward compatibility alias for require_auth."""
    return user

def require_auth_flexible(
    token: Optional[str] = Query(None, description="Optional access token passed as query parameter for direct downloads"),
    bearer_token: Optional[str] = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
) -> User:
    """
    Enforces authentication via either:
    1. Standard 'Authorization: Bearer <token>' header.
    2. 'token=<jwt>' query parameter (for direct browser file download links).
    Raises HTTP 401 if neither credential is valid.
    """
    effective_token = bearer_token or token
    if not effective_token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication credentials were not provided or have expired",
            headers={"WWW-Authenticate": "Bearer"},
        )
    payload = decode_token(effective_token, expected_type="access")
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired access token",
            headers={"WWW-Authenticate": "Bearer"},
        )
    email: str = payload.get("sub")
    if not email:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token payload is invalid",
            headers={"WWW-Authenticate": "Bearer"},
        )
    user = db.query(User).filter(User.email == email).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return user
