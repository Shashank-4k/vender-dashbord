import logging
from sqlalchemy import text
from app.config import settings
from app.database import engine

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("migration")

def run_migrations():
    """
    Applies schema migrations to ensure the users table meets all requirements
    using the configured DATABASE_URL (supports local and managed cloud MySQL).
    """
    logger.info("Executing schema migrations via configured DATABASE_URL...")
    with engine.begin() as conn:
        # 1. Ensure users table exists with required fields
        conn.execute(text("""
            CREATE TABLE IF NOT EXISTS `users` (
                `user_id` INT AUTO_INCREMENT PRIMARY KEY,
                `name` VARCHAR(150) NOT NULL,
                `email` VARCHAR(255) NOT NULL UNIQUE,
                `password_hash` VARCHAR(255) NOT NULL,
                `role` VARCHAR(50) NOT NULL DEFAULT 'user',
                `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                INDEX `idx_users_email` (`email`)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
        """))

        # 2. Add updated_at column if not present
        res = conn.execute(text("SHOW COLUMNS FROM users LIKE 'updated_at';")).fetchone()
        if not res:
            conn.execute(text("ALTER TABLE users ADD COLUMN updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;"))
            logger.info("Added updated_at column to users table.")

        # 3. Update default role to 'user'
        conn.execute(text("ALTER TABLE users MODIFY COLUMN role VARCHAR(50) NOT NULL DEFAULT 'user';"))
        logger.info("Users table migration completed successfully.")
        
        # Verify columns
        columns = conn.execute(text("DESCRIBE users;")).fetchall()
        for col in columns:
            logger.info(f"Verified Column: {col[0]} | Type: {col[1]} | Default: {col[4]}")

if __name__ == "__main__":
    run_migrations()
