from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel
from typing import Optional
from app.services.db import get_db_connection
import urllib.request
import json

router = APIRouter()

class VisitorHit(BaseModel):
    country_code: Optional[str] = None
    country_name: Optional[str] = None

@router.post("/analytics/hit")
def record_visitor_hit(request: Request, hit: Optional[VisitorHit] = None):
    """Records a unique site load session geolocated by country."""
    # 1. Determine client IP from headers or connection
    x_forwarded_for = request.headers.get("x-forwarded-for")
    if x_forwarded_for:
        client_ip = x_forwarded_for.split(",")[0].strip()
    else:
        client_ip = request.client.host if request.client else "127.0.0.1"

    # Default fallback
    code = "US"
    name = "United States"

    # Check if this is a local development IP
    is_local = client_ip in ["127.0.0.1", "localhost", "::1"] or client_ip.startswith("192.168.") or client_ip.startswith("10.") or client_ip.startswith("172.16.")
    
    if not is_local:
        try:
            # Server-side lookup avoids client-side CORS issues!
            url = f"https://freeipapi.com/api/json/{client_ip}"
            req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
            with urllib.request.urlopen(req, timeout=3) as response:
                if response.getcode() == 200:
                    geo_data = json.loads(response.read().decode('utf-8'))
                    if geo_data.get("countryCode") and geo_data.get("countryName"):
                        # Only override if we resolved a valid non-empty country code
                        c_code = geo_data["countryCode"].strip().upper()
                        c_name = geo_data["countryName"].strip()
                        if c_code != "-" and c_code != "":
                            code = c_code
                            name = c_name
        except Exception as e:
            print(f"Server-side IP geolocation failed for {client_ip}: {e}")
            # If server-side lookup fails, fall back to whatever client reported (if provided)
            if hit and hit.country_code and hit.country_name:
                code = hit.country_code.strip().upper()
                name = hit.country_name.strip()
    else:
        # If client-side geolocation succeeded despite local dev IP, use it
        if hit and hit.country_code and hit.country_name:
            code = hit.country_code.strip().upper()
            name = hit.country_name.strip()
            
    code = code.strip().upper()
    name = name.strip()
    
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
