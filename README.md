# global-agri-mind-ai 🌍🌱

An ecosystem design engine and intelligent garden planner. This system is designed to build sustainable, optimized planting layouts, companion recommendations, and planting timelines based on local climate data (such as USDA hardiness zones, soil types, and dimensions).

## Project Structure

- `backend/`: FastAPI local server providing decision-making endpoints and database integrations.
- `database/`: Database configuration and schema files (SQLite/PostgreSQL).
- `frontend/`: Interactive graphical user interface (web/desktop).
- `docs/`: Product designs, architectural blueprints, and setup documentation.

## Phase 1 Setup (Local API Server)

### Prerequisites
- Python 3.8+
- `pip`

### Running the Backend

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
3. Run the development server:
   ```bash
   python -m uvicorn app.main:app --reload
   ```
4. Access the API documentation at [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs).
