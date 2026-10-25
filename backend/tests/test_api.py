from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_health_check():
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert data["database"] == "connected"

def test_dashboard_summary():
    response = client.get("/api/dashboard/summary")
    assert response.status_code == 200
    data = response.json()
    assert "kpis" in data
    assert data["kpis"]["total_vendors"] > 0
    assert "top_vendors_by_spend" in data

def test_vendors_list():
    response = client.get("/api/vendors?page=1&page_size=10")
    assert response.status_code == 200
    data = response.json()
    assert "vendors" in data
    assert len(data["vendors"]) > 0
    assert data["total_count"] > 0
    first_vendor = data["vendors"][0]
    assert "vendor_name" in first_vendor
    assert "vendor_score" in first_vendor

def test_purchasing_analytics():
    response = client.get("/api/analytics/purchasing")
    assert response.status_code == 200
    data = response.json()
    assert data["total_spend"] > 0
    assert "bulk_purchasing_tiers" in data
    assert "pareto_procurement" in data

def test_sales_analytics():
    response = client.get("/api/analytics/sales")
    assert response.status_code == 200
    data = response.json()
    assert "monthly_sales_trend" in data
    assert "top_selling_brands" in data

def test_inventory_analytics():
    response = client.get("/api/analytics/inventory")
    assert response.status_code == 200
    data = response.json()
    assert "begin_inventory_value" in data
    assert "end_inventory_value" in data

def test_vendor_comparison():
    # First get 2 vendor IDs
    v_resp = client.get("/api/vendors?page=1&page_size=2")
    vendors = v_resp.json()["vendors"]
    assert len(vendors) >= 2
    v1_id = vendors[0]["vendor_id"]
    v2_id = vendors[1]["vendor_id"]

    resp = client.post("/api/analytics/vendor-comparison", json={"vendor_ids": [v1_id, v2_id]})
    assert resp.status_code == 200
    data = resp.json()
    assert len(data["selected_vendors"]) == 2
    assert "radar_comparison" in data
    assert "head_to_head_table" in data
    assert len(data["analytical_insights"]) > 0

def test_reports_export_unauthenticated_fails():
    response = client.get("/api/reports/export?report_type=vendors")
    assert response.status_code == 401

def test_reports_export_authenticated_via_bearer_and_query_token():
    from app.database import SessionLocal
    from app.models import User
    from app.auth import create_access_token

    db = SessionLocal()
    user = db.query(User).first()
    db.close()
    assert user is not None
    token = create_access_token(data={"sub": user.email})

    # Test via Authorization Bearer header
    resp_header = client.get("/api/reports/export?report_type=vendors", headers={"Authorization": f"Bearer {token}"})
    assert resp_header.status_code == 200
    assert "text/csv" in resp_header.headers["content-type"]
    assert "attachment; filename=vendors_report.csv" in resp_header.headers["content-disposition"]

    # Test via query parameter (?token=...)
    resp_param = client.get(f"/api/reports/export?report_type=vendors&token={token}")
    assert resp_param.status_code == 200
    assert "text/csv" in resp_param.headers["content-type"]

