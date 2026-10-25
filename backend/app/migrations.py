import logging
import pymysql
from app.config import settings

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("migration")

def run_migrations():
    """Applies schema migrations to ensure the users table meets all requirements."""
    # Parse connection info from DATABASE_URL or settings
    conn = pymysql.connect(
        host="127.0.0.1",
        port=3306,
        user="root",
        password="",
        db="vendor_analytics_db",
        cursorclass=pymysql.cursors.DictCursor
    )
    try:
        with conn.cursor() as cursor:
            # 1. Ensure users table exists with required fields
            cursor.execute("""
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
            """)

            # 2. Add updated_at column if not present
            cursor.execute("SHOW COLUMNS FROM users LIKE 'updated_at';")
            if not cursor.fetchone():
                cursor.execute("ALTER TABLE users ADD COLUMN updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;")
                logger.info("Added updated_at column to users table.")

            # 3. Update default role to 'user'
            cursor.execute("ALTER TABLE users MODIFY COLUMN role VARCHAR(50) NOT NULL DEFAULT 'user';")
            
            conn.commit()
            logger.info("Users table migration completed successfully.")
            
            # Print table schema
            cursor.execute("DESCRIBE users;")
            columns = cursor.fetchall()
            for col in columns:
                logger.info(f"Column: {col['Field']} | Type: {col['Type']} | Default: {col['Default']}")
    finally:
        conn.close()

if __name__ == "__main__":
    run_migrations()
