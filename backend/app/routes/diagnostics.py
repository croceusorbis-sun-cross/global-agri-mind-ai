from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional
from app.services.agents import (
    TomatoSpecialist,
    SoilScientist,
    PestEntomologist,
    RegenerativeAgronomist,
    MicroClimateAdvisor,
    CoordinatorAgent
)

router = APIRouter()

# Instantiate the pluggable expert roster
ROSTER = {
    "tomato": TomatoSpecialist(),
    "soil": SoilScientist(),
    "pest": PestEntomologist(),
    "regen": RegenerativeAgronomist(),
    "climate": MicroClimateAdvisor()
}

class DiagnoseRequest(BaseModel):
    query: str
    active_agents: List[str]
    soil: str
    sun: str
    zone: str
    crops: List[str]

class TranscriptItem(BaseModel):
    agent_key: str
    agent_name: str
    agent_role: str
    agent_icon: str
    message: str

class DiagnoseResponse(BaseModel):
    transcript: List[TranscriptItem]
    confidence: str
    summary: str

@router.post("/diagnose", response_model=DiagnoseResponse)
def diagnose_garden_issues(payload: DiagnoseRequest):
    """Orchestrates a collaborative panel discussion between selected specialist agents and synthesizes a final report."""
    if not payload.query.strip():
        raise HTTPException(status_code=400, detail="Query string cannot be empty.")
    
    if not payload.active_agents:
        raise HTTPException(status_code=400, detail="At least one specialist agent must be selected.")

    # 1. Gather messages from consulted experts
    transcript = []
    specialists_data = {}

    for key in payload.active_agents:
        agent = ROSTER.get(key)
        if agent:
            try:
                # Trigger analysis
                message = agent.analyze(
                    query=payload.query,
                    soil=payload.soil,
                    sun=payload.sun,
                    zone=payload.zone,
                    crops=payload.crops
                )
                transcript.append(TranscriptItem(
                    agent_key=agent.key,
                    agent_name=agent.name,
                    agent_role=agent.role,
                    agent_icon=agent.icon,
                    message=message
                ))
                specialists_data[agent.key] = message
            except Exception as e:
                print(f"Error executing agent {key} analysis: {e}")

    # 2. Coordinator synthesizes all panel messages
    try:
        synthesis = CoordinatorAgent.synthesize(
            query=payload.query,
            active_agents=payload.active_agents,
            specialists_data=specialists_data,
            soil=payload.soil,
            sun=payload.sun,
            zone=payload.zone
        )
    except Exception as e:
        print(f"Error in Coordinator synthesis: {e}")
        synthesis = {
            "confidence": "Medium",
            "summary": "### Consensus Report\nFailed to synthesize expert recommendations. Please review individual statements."
        }

    return DiagnoseResponse(
        transcript=transcript,
        confidence=synthesis.get("confidence", "Medium"),
        summary=synthesis.get("summary", "")
    )
