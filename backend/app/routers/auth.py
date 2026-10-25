from datetime import timedelta
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import User
from app.schemas import UserCreate, UserLogin, TokenResponse, UserResponse, RefreshTokenRequest
from app.auth import (
    verify_password, get_password_hash, create_access_token, 
    create_refresh_token, decode_token, get_current_user, require_auth
)

router = APIRouter(prefix="/api/auth", tags=["Authentication"])

@router.post("/signup", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
def signup(user_in: UserCreate, db: Session = Depends(get_db)):
    """
    Registers a new application user.
    - Validates name, email, password, and confirm_password.
    - Ensures email is globally unique.
    - Hashes password securely using bcrypt before storing in MySQL.
    - Never stores plain-text passwords.
    """
    normalized_email = str(user_in.email).strip().lower()

    # Confirm password check if provided
    if user_in.confirm_password is not None and user_in.password != user_in.confirm_password:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password and confirm password do not match."
        )

    # Check for existing email in MySQL
    existing = db.query(User).filter(User.email == normalized_email).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this email address already exists. Please log in or use a different email."
        )

    # Create new user record
    new_user = User(
        name=user_in.name.strip(),
        email=normalized_email,
        password_hash=get_password_hash(user_in.password),
        role="user"
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    # Issue access and refresh tokens
    access_token = create_access_token({"sub": new_user.email, "name": new_user.name})
    refresh_token = create_refresh_token({"sub": new_user.email, "name": new_user.name})

    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
        "user": new_user
    }


@router.post("/login", response_model=TokenResponse)
def login(credentials: UserLogin, db: Session = Depends(get_db)):
    """
    Authenticates a registered user using email and password.
    - Verifies credentials against secure bcrypt hash in MySQL.
    - Never permits hardcoded or bypass credentials.
    - Issues short-lived access token and refresh token.
    """
    normalized_email = str(credentials.email).strip().lower()
    user = db.query(User).filter(User.email == normalized_email).first()

    if not user or not verify_password(credentials.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password. Please verify your credentials.",
            headers={"WWW-Authenticate": "Bearer"}
        )

    access_token = create_access_token({"sub": user.email, "name": user.name})
    refresh_token = create_refresh_token({"sub": user.email, "name": user.name})

    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
        "user": user
    }


@router.post("/refresh", response_model=TokenResponse)
def refresh_token(request: RefreshTokenRequest, db: Session = Depends(get_db)):
    """
    Refreshes an expired access token using a valid refresh token.
    Ensures user account is still active in MySQL.
    """
    payload = decode_token(request.refresh_token, expected_type="refresh")
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired refresh token. Please sign in again.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    email: str = payload.get("sub")
    if not email:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Malformed token payload.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    user = db.query(User).filter(User.email == email).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User account no longer exists.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    new_access_token = create_access_token({"sub": user.email, "name": user.name})
    new_refresh_token = create_refresh_token({"sub": user.email, "name": user.name})

    return {
        "access_token": new_access_token,
        "refresh_token": new_refresh_token,
        "token_type": "bearer",
        "user": user
    }


@router.post("/logout")
def logout():
    """Confirms user session termination."""
    return {"status": "success", "message": "Successfully logged out."}


@router.get("/me", response_model=UserResponse)
def get_me(user: User = Depends(require_auth)):
    """Returns the authenticated user's profile."""
    return user
