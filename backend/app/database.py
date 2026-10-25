from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from app.config import settings

# Normalize PostgreSQL URL if needed (e.g. postgres:// -> postgresql://)
raw_db_url = settings.DATABASE_URL
if raw_db_url.startswith("postgres://"):
    raw_db_url = raw_db_url.replace("postgres://", "postgresql://", 1)

# Connection engine with pool recycling
is_sqlite = raw_db_url.startswith("sqlite")
connect_args = {"check_same_thread": False} if is_sqlite else {}

engine = create_engine(
    raw_db_url,
    pool_pre_ping=True,
    pool_recycle=300,
    connect_args=connect_args
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
