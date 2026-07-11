from fastapi import APIRouter
from app.models.design import DesignRequest, DesignResponse, CompanionMatch, AntagonistWarning
from app.services.db import get_db_connection
from app.services.ai import AIService

router = APIRouter()

@router.post("/design", response_model=DesignResponse)
def create_garden_design(request: DesignRequest):
    """Calculates companion and antagonist relationships dynamically, and generates AI advice."""
    resolved_plants = []
    
    with get_db_connection() as conn:
        cursor = conn.cursor()
        # Resolve user plant names to database plants (using substring matching)
        for p_name in request.plants:
            cursor.execute("SELECT id, name FROM plants WHERE name LIKE ? OR name = ?", (f"%{p_name}%", p_name))
            rows = cursor.fetchall()
            for row in rows:
                resolved_plants.append({"id": row["id"], "name": row["name"]})

    companions = []
    antagonists = []
    suggested_companions = []

    if resolved_plants:
        resolved_ids = [rp["id"] for rp in resolved_plants]
        id_to_name = {rp["id"]: rp["name"] for rp in resolved_plants}
        
        # Build query placeholders
        placeholders = ",".join("?" for _ in resolved_ids)
        
        with get_db_connection() as conn:
            cursor = conn.cursor()
            
            # Query relationships among the selected plants
            rel_query = f"""
                SELECT plant_id, target_id, type, description
                FROM relationships
                WHERE plant_id IN ({placeholders}) AND target_id IN ({placeholders})
            """
            cursor.execute(rel_query, resolved_ids + resolved_ids)
            for row in cursor.fetchall():
                p1_name = id_to_name[row["plant_id"]]
                p2_name = id_to_name[row["target_id"]]
                rel_type = row["type"]
                desc = row["description"]
                
                if rel_type == "companion":
                    companions.append(CompanionMatch(plant=p1_name, companion=p2_name, description=desc))
                elif rel_type == "antagonist":
                    antagonists.append(AntagonistWarning(plant=p1_name, antagonist=p2_name, description=desc))
            
            # Query suggested companions (companions of selected plants that weren't selected)
            sug_query = f"""
                SELECT DISTINCT p.name
                FROM relationships r
                JOIN plants p ON r.target_id = p.id
                WHERE r.plant_id IN ({placeholders})
                  AND r.type = 'companion'
                  AND r.target_id NOT IN ({placeholders})
                LIMIT 8
            """
            cursor.execute(sug_query, resolved_ids + resolved_ids)
            for row in cursor.fetchall():
                suggested_companions.append(row["name"])

    # Phase 3: Run AI advice generator (includes rules-engine fallback)
    companions_dict = [{"plant": c.plant, "companion": c.companion, "description": c.description} for c in companions]
    antagonists_dict = [{"plant": a.plant, "antagonist": a.antagonist, "description": a.description} for a in antagonists]
    
    ai_advice = AIService.generate_garden_advice(
        zip_code=request.zip,
        soil=request.soil,
        sun=request.sun,
        plants=request.plants,
        companions=companions_dict,
        antagonists=antagonists_dict,
        layout_analysis=request.layout_analysis
    )

    return DesignResponse(
        success=True,
        companions=companions,
        antagonists=antagonists,
        suggested_companions=suggested_companions,
        ai_advice=ai_advice
    )
