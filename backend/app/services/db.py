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
