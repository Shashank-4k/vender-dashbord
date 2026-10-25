import os
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    PROJECT_NAME: str = os.getenv("PROJECT_NAME", "Vendor Performance Analytics")
    PORT: int = int(os.getenv("PORT", "8000"))
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL", 
        "mysql+pymysql://root:@localhost:3306/vendor_analytics_db?charset=utf8mb4"
    )
    SECRET_KEY: str = os.getenv("SECRET_KEY", "super-secret-vendor-analytics-key-2026")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "15"))
    REFRESH_TOKEN_EXPIRE_DAYS: int = int(os.getenv("REFRESH_TOKEN_EXPIRE_DAYS", "7"))
    CORS_ORIGINS: str = os.getenv(
        "CORS_ORIGINS", 
        "http://localhost:5173,http://127.0.0.1:5173,http://localhost:3000,http://127.0.0.1:3000"
    )
    DATASET_DIR: str = os.getenv("DATASET_DIR", r"C:\Users\91938\Downloads\venderdataset")
    UPLOAD_DIR: str = os.getenv("UPLOAD_DIR", os.path.join(os.path.dirname(__file__), "..", "uploads_temp"))

    model_config = SettingsConfigDict(
        env_file=".env",
        extra="allow"
    )

settings = Settings()
os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
