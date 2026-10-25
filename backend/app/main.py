import os
from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import text
from app.config import settings
from app.database import get_db
from app.routers import (
    auth, dashboard, vendors, purchases_sales, 
    inventory, performance, uploads, reports
)

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Vendor Performance Analytics REST API powered by FastAPI and PostgreSQL",
    version="1.0.0",
    redirect_slashes=False
)

# Parse CORS Configuration dynamically from environment settings
raw_origins = settings.CORS_ORIGINS
if isinstance(raw_origins, str):
    origins = [orig.strip() for orig in raw_origins.split(",") if orig.strip()]
elif isinstance(raw_origins, list):
    origins = [str(orig).strip() for orig in raw_origins if str(orig).strip()]
else:
    origins = []

# Preserve standard local development addresses
for default_origin in ["http://localhost:5173", "http://127.0.0.1:5173", "http://localhost:3000", "http://127.0.0.1:3000"]:
    if default_origin not in origins:
        origins.append(default_origin)

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_origin_regex=r"https://.*\.vercel\.app",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(auth.router)
app.include_router(dashboard.router)
app.include_router(vendors.router)
app.include_router(purchases_sales.router)
app.include_router(inventory.router)
app.include_router(performance.router)
app.include_router(uploads.router)
app.include_router(reports.router)

@app.get("/health", tags=["Health"])
@app.get("/api/health", tags=["Health"])
def health_check(db: Session = Depends(get_db)):
    try:
        db.execute(text("SELECT 1;"))
        db_status = "connected"
    except Exception as e:
        db_status = f"error: {str(e)}"

    return {
        "status": "healthy",
        "service": settings.PROJECT_NAME,
        "database": db_status,
        "version": "1.0.0"
    }

@app.get("/", tags=["Root"])
@app.get("/api", tags=["Root"])
@app.get("/api/index", tags=["Root"])
@app.get("/api/index.py", tags=["Root"])
def root():
    return {
        "message": "Vendor Performance Analytics API is operational",
        "docs_url": "/docs",
        "health_check": "/api/health"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=settings.PORT, reload=False)
