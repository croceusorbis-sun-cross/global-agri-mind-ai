from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional

class CompanionMatch(BaseModel):
    plant: str
    companion: str
    description: str

class AntagonistWarning(BaseModel):
    plant: str
    antagonist: str
    description: str

class DesignRequest(BaseModel):
    zip: str = Field(..., description="5-digit ZIP code", pattern=r"^\d{5}$")
    garden_width: float = Field(..., description="Garden width in feet", gt=0)
    garden_height: float = Field(..., description="Garden height in feet", gt=0)
    soil: str = Field(..., description="Soil type (e.g., Clay, Sand, Loam, Unknown)")
    sun: str = Field(..., description="Sun exposure (e.g., Full, Partial, Shade)")
    plants: List[str] = Field(..., description="List of desired plants/crops")
    layout_analysis: Optional[Dict[str, Any]] = Field(None, description="Detailed layout analysis stats from the client")

class DesignResponse(BaseModel):
    success: bool
    companions: List[CompanionMatch] = Field(default_factory=list, description="Matched companions from selected plants")
    antagonists: List[AntagonistWarning] = Field(default_factory=list, description="Matched antagonists (warnings) from selected plants")
    suggested_companions: List[str] = Field(default_factory=list, description="Additional recommended plants to consider adding")
    ai_advice: str = Field("", description="AI-generated garden design advice, layout strategies, and rotation tips")
