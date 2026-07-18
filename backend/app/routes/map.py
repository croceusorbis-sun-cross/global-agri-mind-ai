from fastapi import APIRouter, HTTPException, Response
import urllib.request
import urllib.parse
import json
from app.services.db import get_db_connection

router = APIRouter()

def get_secret_keys():
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT key, value FROM system_settings")
        rows = cursor.fetchall()
        settings = {row["key"]: row["value"] for row in rows}
    return settings

@router.get("/map/geocode")
def geocode_address(q: str):
    if not q:
        raise HTTPException(status_code=400, detail="Query string 'q' is required.")
        
    settings = get_secret_keys()
    provider = settings.get("map_provider", "osm")
    
    # 1. Mapbox Geocoding
    if provider == "mapbox" and settings.get("mapbox_token"):
        token = settings.get("mapbox_token")
        safe_q = urllib.parse.quote(q)
        url = f"https://api.mapbox.com/search/geocode/v6/forward?q={safe_q}&access_token={token}&limit=5"
        try:
            req = urllib.request.Request(url, headers={"User-Agent": "global-agri-mind-ai/1.0"})
            with urllib.request.urlopen(req, timeout=5) as response:
                data = json.loads(response.read().decode())
            features = []
            for feat in data.get("features", []):
                coords = feat.get("geometry", {}).get("coordinates", [0, 0])
                features.append({
                    "name": feat.get("properties", {}).get("full_address") or feat.get("properties", {}).get("name") or q,
                    "lat": coords[1],
                    "lng": coords[0]
                })
            return features
        except Exception as e:
            # Fallback to Nominatim if Mapbox API fails
            pass

    # 2. Google Maps Geocoding
    if provider == "google" and settings.get("google_key"):
        key = settings.get("google_key")
        safe_q = urllib.parse.quote(q)
        url = f"https://maps.googleapis.com/maps/api/geocode/json?address={safe_q}&key={key}"
        try:
            req = urllib.request.Request(url, headers={"User-Agent": "global-agri-mind-ai/1.0"})
            with urllib.request.urlopen(req, timeout=5) as response:
                data = json.loads(response.read().decode())
            features = []
            for res in data.get("results", []):
                loc = res.get("geometry", {}).get("location", {})
                features.append({
                    "name": res.get("formatted_address") or q,
                    "lat": loc.get("lat", 0),
                    "lng": loc.get("lng", 0)
                })
            return features
        except Exception as e:
            pass

    # 3. OpenStreetMap Nominatim Geocoding (Default / Fallback)
    safe_q = urllib.parse.quote(q)
    url = f"https://nominatim.openstreetmap.org/search?q={safe_q}&format=json&limit=5"
    try:
        req = urllib.request.Request(url, headers={"User-Agent": "global-agri-mind-ai/1.0"})
        with urllib.request.urlopen(req, timeout=5) as response:
            data = json.loads(response.read().decode())
        features = []
        for item in data:
            features.append({
                "name": item.get("display_name") or q,
                "lat": float(item.get("lat", 0)),
                "lng": float(item.get("lon", 0))
            })
        return features
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Geocoding service unavailable: {str(e)}")

@router.get("/map/tile/{z}/{x}/{y}")
def get_map_tile(z: int, x: int, y: int):
    settings = get_secret_keys()
    provider = settings.get("map_provider", "osm")
    
    # 1. Mapbox Satellite Tile
    if provider == "mapbox" and settings.get("mapbox_token"):
        token = settings.get("mapbox_token")
        url = f"https://api.mapbox.com/v4/mapbox.satellite/{z}/{x}/{y}.png?access_token={token}"
        try:
            req = urllib.request.Request(url, headers={"User-Agent": "global-agri-mind-ai/1.0"})
            with urllib.request.urlopen(req, timeout=5) as response:
                tile_data = response.read()
            return Response(content=tile_data, media_type="image/png")
        except Exception:
            # Fallback to Esri if Mapbox tile fetch fails
            pass

    # 2. Google Maps satellite tiles
    if provider == "google":
        # Google Maps tiles don't require credentials for proxying vt/lyrs endpoint, but we fall back to Esri for stability
        pass
        
    # 3. Esri World Imagery (OSM satellite standard)
    url = f"https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
    try:
        req = urllib.request.Request(url, headers={"User-Agent": "global-agri-mind-ai/1.0"})
        with urllib.request.urlopen(req, timeout=5) as response:
            tile_data = response.read()
        return Response(content=tile_data, media_type="image/jpeg")
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Tile service unavailable: {str(e)}")

@router.get("/map/static")
def get_static_map(bbox: str, width: int, height: int):
    # bbox format: "minLng,minLat,maxLng,maxLat"
    settings = get_secret_keys()
    provider = settings.get("map_provider", "osm")
    
    if provider == "mapbox" and settings.get("mapbox_token"):
        token = settings.get("mapbox_token")
        url = f"https://api.mapbox.com/styles/v1/mapbox/satellite-v9/static/[{bbox}]/{width}x{height}?access_token={token}"
    else:
        url = f"https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/export?bbox={bbox}&bboxSR=4326&size={width},{height}&format=png&f=image"
        
    try:
        req = urllib.request.Request(url, headers={"User-Agent": "global-agri-mind-ai/1.0"})
        with urllib.request.urlopen(req, timeout=8) as response:
            image_data = response.read()
        return Response(content=image_data, media_type="image/png")
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Static map fetch failed: {str(e)}")
