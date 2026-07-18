import os
import sys
import unittest
from fastapi.testclient import TestClient

# Ensure root directory is on PATH so app can be imported
root_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
if root_dir not in sys.path:
    sys.path.insert(0, root_dir)

from backend.app.main import app

class TestMapAndSettingsAPI(unittest.TestCase):
    def setUp(self):
        from backend.app.services.db import init_db_tables
        init_db_tables()
        self.client = TestClient(app)

    def test_settings_save_and_retrieve(self):
        # 1. Save osm map settings configuration
        payload = {
            "map_provider": "osm"
        }
        res = self.client.post("/api/v1/settings", json=payload)
        self.assertEqual(res.status_code, 200)
        self.assertEqual(res.json()["status"], "success")

        # 2. Retrieve osm map settings
        res = self.client.get("/api/v1/settings")
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertEqual(data["map_provider"], "osm")
        self.assertFalse(data["has_mapbox_token"])

    def test_geocode_fallback_nominatim(self):
        # 3. Test Nominatim geocoding lookup
        res = self.client.get("/api/v1/map/geocode?q=Ann+Arbor")
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertTrue(isinstance(data, list))
        if len(data) > 0:
            self.assertTrue("lat" in data[0])
            self.assertTrue("lng" in data[0])

    def test_tile_proxy_esri_fallback(self):
        # 4. Test tile proxy fetch
        res = self.client.get("/api/v1/map/tile/18/69389/101232")
        self.assertEqual(res.status_code, 200)
        self.assertTrue(res.headers["content-type"].startswith("image/"))

    def test_static_map_proxy(self):
        # 5. Test static map export proxy fetch
        res = self.client.get("/api/v1/map/static?bbox=-83.748,42.279,-83.740,42.282&width=400&height=300")
        self.assertEqual(res.status_code, 200)
        self.assertTrue(res.headers["content-type"].startswith("image/"))

if __name__ == "__main__":
    unittest.main()
