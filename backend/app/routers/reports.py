from typing import Optional
from fastapi import APIRouter, Depends, Query, Response
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import User
from app.auth import require_auth_flexible
from app.services.export_service import export_data_to_csv

router = APIRouter(prefix="/api/reports", tags=["Reports & Export"])

@router.get("/export")
def export_report(
    report_type: str = Query("vendors", description="Report category (vendors, purchases, inventory, invoices)"),
    vendor_id: Optional[int] = Query(None, description="Optional filter by vendor ID"),
    format: str = Query("csv", description="Export format (csv)"),
    current_user: User = Depends(require_auth_flexible),
    db: Session = Depends(get_db)
):
    """
    Generates and downloads a clean, verified CSV export of live database records.
    Protected endpoint: Requires valid Bearer JWT header or token query parameter.
    """
    csv_buffer = export_data_to_csv(db, report_type=report_type, vendor_id=vendor_id)
    filename = f"{report_type}_report.csv"
    
    return Response(
        content=csv_buffer.getvalue(),
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )
