from fastapi import APIRouter, Query, HTTPException
from typing import List, Optional
from app.services.db import get_db_connection

router = APIRouter()

@router.get("/plants")
def get_plants(
    type: Optional[str] = Query(None, description="Filter by plant type (e.g., Vegetable, Herb, Fruit, Flower, Native)"),
    is_native: Optional[bool] = Query(None, description="Filter by native status")
):
    """Retrieves all seeded plants in the database, with optional filtering options."""
    query = "SELECT * FROM plants WHERE 1=1"
    params = []

    if type:
        query += " AND type = ?"
        params.append(type)

    if is_native is not None:
        query += " AND is_native = ?"
        params.append(1 if is_native else 0)

    query += " ORDER BY name ASC"

    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute(query, params)
        rows = cursor.fetchall()
        return [dict(row) for row in rows]

@router.get("/plants/{plant_id}")
def get_plant_by_id(plant_id: int):
    """Retrieves detailed information for a single plant, including its companion/antagonist links."""
    with get_db_connection() as conn:
        cursor = conn.cursor()
        
        # Fetch target plant metadata
        cursor.execute("SELECT * FROM plants WHERE id = ?", (plant_id,))
        plant_row = cursor.fetchone()
        if not plant_row:
            raise HTTPException(status_code=404, detail="Plant not found")
        
        plant = dict(plant_row)

        # Fetch companion/antagonist links
        cursor.execute("""
            SELECT r.type, r.description, p.name AS target_name, p.id AS target_id
            FROM relationships r
            JOIN plants p ON r.target_id = p.id
            WHERE r.plant_id = ?
        """, (plant_id,))
        plant["relationships"] = [dict(row) for row in cursor.fetchall()]
        
        return plant

import sqlite3
from pydantic import BaseModel
from app.services.ai import AIService

class CustomPlantPayload(BaseModel):
    name: str

@router.post("/plants/custom")
def add_custom_plant(payload: CustomPlantPayload):
    """Dynamically registers a custom crop in the SQLite database by fetching its properties via AIService."""
    name = payload.name.strip()
    if not name:
        raise HTTPException(status_code=400, detail="Plant name cannot be empty")
    
    # 1. Gather detailed botanical properties
    plant_info = AIService.generate_custom_plant_info(name)
    
    # 2. Insert into sqlite database
    with get_db_connection() as conn:
        cursor = conn.cursor()
        try:
            cursor.execute("""
                INSERT INTO plants (name, scientific_name, type, sun_requirements, water_requirements, soil_preference, usda_zones, is_native, description, mature_height, mature_width, min_radius, max_radius, foliage_color, canopy_shape, fruit_color)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                name,
                plant_info.get("scientific_name", f"{name} vulgaris"),
                plant_info.get("type", "Vegetable"),
                plant_info.get("sun_requirements", "Full Sun"),
                plant_info.get("water_requirements", "Moderate"),
                plant_info.get("soil_preference", "Loam"),
                plant_info.get("usda_zones", "3,4,5,6,7,8,9,10"),
                int(plant_info.get("is_native", 0)),
                plant_info.get("description", ""),
                plant_info.get("mature_height", 1.0),
                plant_info.get("mature_width", 1.0),
                plant_info.get("min_radius", 0.4),
                plant_info.get("max_radius", 0.8),
                plant_info.get("foliage_color", "#2e7d32"),
                plant_info.get("canopy_shape", "rounded"),
                plant_info.get("fruit_color")
            ))
            conn.commit()
            new_id = cursor.lastrowid
            
            # Fetch the newly created plant row
            cursor.execute("SELECT * FROM plants WHERE id = ?", (new_id,))
            row = cursor.fetchone()
            return dict(row)
        except sqlite3.IntegrityError:
            # Handle duplicate key entry (fetch existing plant and return it)
            cursor.execute("SELECT * FROM plants WHERE name LIKE ?", (name,))
            row = cursor.fetchone()
            if row:
                return dict(row)
            raise HTTPException(status_code=400, detail="Plant variety already exists in catalog.")
