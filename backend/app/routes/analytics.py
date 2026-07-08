from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.services.db import get_db_connection

router = APIRouter()

class VisitorHit(BaseModel):
    country_code: str
    country_name: str

@router.post("/analytics/hit")
def record_visitor_hit(hit: VisitorHit):
    """Records a unique site load session geolocated by country."""
    code = hit.country_code.strip().upper()
    name = hit.country_name.strip()
    
    if not code or not name:
        raise HTTPException(status_code=400, detail="Country code and name are required")
        
    try:
        with get_db_connection() as conn:
            cursor = conn.cursor()
            # Upsert behavior: increment if exists, insert if new
            cursor.execute("SELECT visit_count FROM visitor_countries WHERE country_code = ?", (code,))
            row = cursor.fetchone()
            if row:
                cursor.execute("UPDATE visitor_countries SET visit_count = visit_count + 1 WHERE country_code = ?", (code,))
            else:
                cursor.execute("INSERT INTO visitor_countries (country_code, country_name, visit_count) VALUES (?, ?, 1)", (code, name))
            conn.commit()
        return {"status": "success", "country_code": code}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

@router.get("/analytics/stats")
def get_visitor_stats():
    """Returns aggregated visitor session metrics grouped by country."""
    try:
        with get_db_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("""
                SELECT country_code, country_name, visit_count 
                FROM visitor_countries 
                ORDER BY visit_count DESC
            """)
            rows = cursor.fetchall()
            return [dict(r) for r in rows]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")
