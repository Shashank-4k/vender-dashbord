import time
import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.database import SessionLocal
from app.models import User

client = TestClient(app)

@pytest.fixture(scope="module")
def unique_email():
    return f"procurement_user_{int(time.time())}@analyticsenterprise.com"

def test_user_registration_success(unique_email):
    payload = {
        "name": "Jane Procurement Specialist",
        "email": unique_email,
        "password": "SecurePassword123!",
        "confirm_password": "SecurePassword123!"
    }
    response = client.post("/api/auth/signup", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert "access_token" in data
    assert "refresh_token" in data
    assert data["token_type"] == "bearer"
    assert data["user"]["email"] == unique_email.lower()
    assert data["user"]["name"] == "Jane Procurement Specialist"

    # Verify password hash in MySQL is secure bcrypt (never plain text)
    db = SessionLocal()
    user_in_db = db.query(User).filter(User.email == unique_email.lower()).first()
    assert user_in_db is not None
    assert user_in_db.password_hash.startswith("$2b$") or user_in_db.password_hash.startswith("$2a$")
    assert "SecurePassword123!" not in user_in_db.password_hash
    db.close()

def test_registration_duplicate_email_rejected(unique_email):
    payload = {
        "name": "Duplicate User",
        "email": unique_email,
        "password": "AnotherPassword456!",
        "confirm_password": "AnotherPassword456!"
    }
    response = client.post("/api/auth/signup", json=payload)
    assert response.status_code == 400
    assert "already exists" in response.json()["detail"].lower()

def test_registration_password_mismatch_rejected():
    payload = {
        "name": "Mismatch User",
        "email": "mismatch@analyticsenterprise.com",
        "password": "PasswordAAA123",
        "confirm_password": "PasswordBBB999"
    }
    response = client.post("/api/auth/signup", json=payload)
    assert response.status_code == 400
    assert "do not match" in response.json()["detail"].lower()

def test_login_successful_with_registered_credentials(unique_email):
    payload = {
        "email": unique_email,
        "password": "SecurePassword123!"
    }
    response = client.post("/api/auth/login", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert "refresh_token" in data
    assert data["token_type"] == "bearer"
    assert data["user"]["email"] == unique_email.lower()

def test_login_incorrect_password_rejected(unique_email):
    payload = {
        "email": unique_email,
        "password": "WrongPasswordXyz999"
    }
    response = client.post("/api/auth/login", json=payload)
    assert response.status_code == 401
    assert "invalid email or password" in response.json()["detail"].lower()

def test_login_nonexistent_user_rejected():
    payload = {
        "email": "nonexistent_user_xyz@analyticsenterprise.com",
        "password": "SomeRandomPassword123"
    }
    response = client.post("/api/auth/login", json=payload)
    assert response.status_code == 401

def test_token_refresh_workflow(unique_email):
    # 1. Login to obtain tokens
    login_res = client.post("/api/auth/login", json={
        "email": unique_email,
        "password": "SecurePassword123!"
    })
    tokens = login_res.json()
    refresh_token = tokens["refresh_token"]
    assert refresh_token is not None

    # 2. Call refresh endpoint
    refresh_res = client.post("/api/auth/refresh", json={"refresh_token": refresh_token})
    assert refresh_res.status_code == 200
    refreshed_data = refresh_res.json()
    assert "access_token" in refreshed_data
    assert "refresh_token" in refreshed_data
    assert refreshed_data["user"]["email"] == unique_email.lower()

def test_protected_route_without_token():
    response = client.get("/api/auth/me")
    assert response.status_code == 401

def test_protected_route_with_valid_token(unique_email):
    login_res = client.post("/api/auth/login", json={
        "email": unique_email,
        "password": "SecurePassword123!"
    })
    access_token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {access_token}"}

    response = client.get("/api/auth/me", headers=headers)
    assert response.status_code == 200
    assert response.json()["email"] == unique_email.lower()

def test_logout_endpoint():
    response = client.post("/api/auth/logout")
    assert response.status_code == 200
    assert response.json()["status"] == "success"
