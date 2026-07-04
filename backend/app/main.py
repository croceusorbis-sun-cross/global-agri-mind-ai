import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from app.routes import design, plants, diagnostics

load_dotenv()

app = FastAPI(
    title="global-agri-mind-ai API",
    description="Ecosystem design engine and intelligent garden planner backend.",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

# Register routes
app.include_router(design.router, prefix="/api/v1", tags=["design"])
app.include_router(plants.router, prefix="/api/v1", tags=["plants"])
app.include_router(diagnostics.router, prefix="/api/v1", tags=["diagnostics"])

# Mount static files to serve UI
from fastapi.staticfiles import StaticFiles
frontend_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "frontend"))
app.mount("/", StaticFiles(directory=frontend_dir, html=True), name="frontend")

@app.get("/api/health")
def health_check():
    return {
        "status": "online",
        "message": "Welcome to global-agri-mind-ai API"
    }
