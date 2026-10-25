import logging
import sys
from app.database import SessionLocal
from app.models import User
from app.auth import get_password_hash
from app.services.dataset_loader import load_initial_dataset

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")
logger = logging.getLogger("seed_data")

def seed():
    db = SessionLocal()
    try:
        logger.info("Starting seed process...")
        
        # Ingest real dataset files into MySQL
        logger.info("Loading initial dataset into MySQL...")
        stats = load_initial_dataset(db, sample_limit=50000)
        logger.info(f"Dataset load results: {stats}")
        logger.info("Seed process completed successfully!")
    except Exception as e:
        logger.error(f"Seed process failed: {e}", exc_info=True)
        db.rollback()
        sys.exit(1)
    finally:
        db.close()

if __name__ == "__main__":
    seed()
