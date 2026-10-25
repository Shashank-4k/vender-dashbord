import time
import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.database import SessionLocal
from app.models import User, Vendor
from app.auth import get_password_hash, create_access_token

client = TestClient(app)

@pytest.fixture(scope="module")
def auth_headers():
    db = SessionLocal()
    test_email = "vendor_tester@analyticsenterprise.com"
    user = db.query(User).filter(User.email == test_email).first()
    if not user:
        user = User(
            name="Vendor Tester",
            email=test_email,
            password_hash=get_password_hash("TestPassword123!"),
            role="user"
        )
        db.add(user)
        db.commit()
        db.refresh(user)
    
    # Clean up test vendors if they already exist
    db.query(Vendor).filter(Vendor.vendor_number.in_([999101, 999102])).delete(synchronize_session=False)
    db.commit()
    db.close()

    token = create_access_token({"sub": test_email})
    return {"Authorization": f"Bearer {token}"}

def test_authenticated_user_can_add_vendor(auth_headers):
    # Get initial total vendors from dashboard summary
    dash_res_before = client.get("/api/dashboard/summary")
    initial_count = dash_res_before.json()["kpis"]["total_vendors"]

    unique_vendor_num = 999101
    payload = {
        "vendor_number": unique_vendor_num,
        "vendor_name": "Apex Spirits Distributing Co.",
        "category": "Spirits & Hard Liquor"
    }

    # Add vendor as authenticated user
    response = client.post("/api/vendors", json=payload, headers=auth_headers)
    assert response.status_code == 201
    data = response.json()
    assert data["vendor_number"] == unique_vendor_num
    assert data["vendor_name"] == "Apex Spirits Distributing Co."
    assert "successfully added" in data["message"]
    assert data["total_vendors_count"] == initial_count + 1

    # Verify dashboard total vendor count updated from MySQL
    dash_res_after = client.get("/api/dashboard/summary")
    new_count = dash_res_after.json()["kpis"]["total_vendors"]
    assert new_count == initial_count + 1

def test_unified_access_without_role_rejection(auth_headers):
    payload = {
        "vendor_number": 999102,
        "vendor_name": "Standard Distributing Corp",
        "category": "Wine & Champagne"
    }

    response = client.post("/api/vendors", json=payload, headers=auth_headers)
    assert response.status_code == 201

def test_unauthenticated_cannot_add_vendor():
    # No token
    payload = {
        "vendor_number": 999003,
        "vendor_name": "No Auth Vendor Inc"
    }
    response = client.post("/api/vendors", json=payload)
    assert response.status_code == 401

def test_duplicate_vendor_number_rejected(auth_headers):
    payload = {
        "vendor_number": 999101,  # Already created above
        "vendor_name": "Duplicate Vendor Test"
    }
    response = client.post("/api/vendors", json=payload, headers=auth_headers)
    assert response.status_code == 400
    assert "already exists" in response.json()["detail"]

