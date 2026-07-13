from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import Optional, Dict
from app.services.db import get_db_connection

router = APIRouter()

class SettingsPayload(BaseModel):
    map_provider: str  # 'osm', 'mapbox', 'google'
    mapbox_token: Optional[str] = None
    google_key: Optional[str] = None

@router.get("/settings")
def get_settings():
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT key, value FROM system_settings")
        rows = cursor.fetchall()
        settings = {row["key"]: row["value"] for row in rows}
        
    # Mask sensitive keys for safety
    def mask_key(k: Optional[str]) -> Optional[str]:
        if not k:
            return ""
        if len(k) <= 8:
            return "****"
        return f"{k[:6]}...{k[-4:]}"

    return {
        "map_provider": settings.get("map_provider", "osm"),
        "mapbox_token": mask_key(settings.get("mapbox_token")),
        "google_key": mask_key(settings.get("google_key")),
        "has_mapbox_token": bool(settings.get("mapbox_token")),
        "has_google_key": bool(settings.get("google_key"))
    }

@router.post("/settings")
def save_settings(payload: SettingsPayload):
    if payload.map_provider not in ("osm", "mapbox", "google"):
        raise HTTPException(status_code=400, detail="Invalid map provider value.")
        
    with get_db_connection() as conn:
        cursor = conn.cursor()
        
        # Save map_provider
        cursor.execute(
            "INSERT OR REPLACE INTO system_settings (key, value) VALUES ('map_provider', ?)",
            (payload.map_provider,)
        )
        
        # For mapbox_token and google_key, if user sends a masked placeholder, don't overwrite the original stored secret!
        if payload.mapbox_token is not None:
            if not payload.mapbox_token.startswith("***") and "..." not in payload.mapbox_token:
                cursor.execute(
                    "INSERT OR REPLACE INTO system_settings (key, value) VALUES ('mapbox_token', ?)",
                    (payload.mapbox_token,)
                )
            elif payload.mapbox_token == "":
                cursor.execute("DELETE FROM system_settings WHERE key = 'mapbox_token'")
                
        if payload.google_key is not None:
            if not payload.google_key.startswith("***") and "..." not in payload.google_key:
                cursor.execute(
                    "INSERT OR REPLACE INTO system_settings (key, value) VALUES ('google_key', ?)",
                    (payload.google_key,)
                )
            elif payload.google_key == "":
                cursor.execute("DELETE FROM system_settings WHERE key = 'google_key'")
                
        conn.commit()
        
    return {"status": "success", "message": "Settings saved successfully."}
