-- Table: plants
CREATE TABLE IF NOT EXISTS plants (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    scientific_name TEXT,
    type TEXT NOT NULL, -- e.g., Vegetable, Herb, Fruit, Flower, Native
    sun_requirements TEXT NOT NULL, -- e.g., Full, Partial, Shade
    water_requirements TEXT NOT NULL, -- e.g., Low, Moderate, High
    soil_preference TEXT NOT NULL, -- e.g., Clay, Sand, Loam, Unknown
    usda_zones TEXT NOT NULL, -- comma-separated e.g. "3,4,5,6,7,8,9,10"
    is_native INTEGER NOT NULL DEFAULT 0, -- 1 = Yes, 0 = No
    description TEXT,
    mature_height REAL,
    mature_width REAL,
    min_radius REAL,
    max_radius REAL,
    foliage_color TEXT,
    canopy_shape TEXT,
    fruit_color TEXT
);

-- Table: relationships (Companions & Antagonists)
CREATE TABLE IF NOT EXISTS relationships (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    plant_id INTEGER NOT NULL,
    target_id INTEGER NOT NULL,
    type TEXT NOT NULL, -- companion or antagonist
    description TEXT,
    FOREIGN KEY (plant_id) REFERENCES plants (id) ON DELETE CASCADE,
    FOREIGN KEY (target_id) REFERENCES plants (id) ON DELETE CASCADE,
    UNIQUE(plant_id, target_id, type)
);
