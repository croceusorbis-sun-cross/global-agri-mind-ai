import sqlite3
import os
from contextlib import contextmanager

# Database file location relative to this service file
# backend/app/services/db.py -> backend/app/services -> backend/app -> backend -> root -> database/garden.db
DB_PATH = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "..", "database", "garden.db"))

@contextmanager
def get_db_connection():
    """Provides a thread-safe connection to the SQLite database with Row factory enabled."""
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row  # Returns query results as dictionary-like Row objects
    try:
        yield conn
    finally:
        conn.close()

def init_db_tables():
    """Initializes standard application tables if they do not exist."""
    # First, check and create visitor_countries table
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS visitor_countries (
                country_code TEXT PRIMARY KEY,
                country_name TEXT NOT NULL,
                visit_count INTEGER DEFAULT 1
            );
        """)
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS system_settings (
                key TEXT PRIMARY KEY,
                value TEXT NOT NULL,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        """)
        conn.commit()

        # Check if the plants table exists in the database
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='plants'")
        table_exists = cursor.fetchone()

        if not table_exists:
            print("Plants table not found. Auto-seeding database from schema...")
            try:
                # Add project root to sys.path to allow importing database.seed
                import sys
                root_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", ".."))
                if root_dir not in sys.path:
                    sys.path.insert(0, root_dir)
                
                from database.seed import seed_database
                seed_database()
                print("Database auto-seeded successfully!")
            except Exception as err:
                print(f"Error auto-seeding database on startup: {err}")


