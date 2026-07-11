import os
import json
import urllib.request
import urllib.error

class AIService:
    @staticmethod
    def generate_garden_advice(zip_code: str, soil: str, sun: str, plants: list, companions: list, antagonists: list, layout_analysis: dict = None) -> str:
        """Queries the Gemini API to analyze the garden plot configuration, falling back to a rules-engine."""
        api_key = os.environ.get("GEMINI_API_KEY")
        
        # Build layout statistics description if present
        stats_desc = ""
        if layout_analysis:
            stats_desc = f"""
Actual Layout Metrics & Statistics from Spaced Grid:
- Placed Instances Count: {layout_analysis.get('total_placed_instances', 0)}
- Realized Companion Pairings: {', '.join(layout_analysis.get('utilized_companions', [])) or 'None'}
- Realized Antagonist warnings (placed too close): {', '.join(layout_analysis.get('realized_antagonists', [])) or 'None'}
- Soil requirement mismatches: {', '.join(layout_analysis.get('soil_mismatches', [])) or 'None'}
- Sun requirement mismatches: {', '.join(layout_analysis.get('sun_mismatches', [])) or 'None'}
- Tall crops casting shade on South side: {', '.join(layout_analysis.get('shading_warnings', [])) or 'None'}
- Tropical potted plants needing overwintering: {layout_analysis.get('tropical_potted_count', 0)}
- USDA zone mismatches: {', '.join(layout_analysis.get('zone_mismatches', [])) or 'None'}
"""
        
        prompt = f"""
You are an expert horticulturist and ecological designer. Analyze the following garden design request:
- ZIP Code: {zip_code}
- Soil: {soil}
- Sun: {sun}
- Selected crops: {', '.join(plants)}
- Identified companions in selection: {', '.join([f"{c['plant']} + {c['companion']}" for c in companions]) if companions else 'None'}
- Identified antagonists/warnings in selection: {', '.join([f"{a['plant']} + {a['antagonist']}" for a in antagonists]) if antagonists else 'None'}
{stats_desc}

Provide a structured, highly comprehensive growing system guide tailored exactly to the actual layout metrics. Address the specific crops placed. Use exactly these markdown headers:

### Garden Layout Strategy
Detail how the layout successfully resolved or failed companion spacing (e.g. mention realized companion pairs vs antagonist warnings). Specify if any tall crops are casting shade from the south side and how to optimize it.

### Soil & Nutrition Plan
Analyze the soil type ({soil}) and specify nutrition upgrades. Detail fertilizing advice for the placed annuals and soil amendments/compost for perennials.

### Crop Care & Pruning Calendar
Provide specific timelines and pruning guidelines for the placed trees/perennials vs annual crops.

### Pest & Disease Control
Recommend organic pest control methods and companion-repellent strategies tailored to these specific crops.

### Rotational & Future Planning
Provide cover crop and rotation recommendations for next season based on the placed heavy feeders.
"""
        
        if api_key:
            try:
                # Set up connection to Gemini API
                url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={api_key}"
                headers = {"Content-Type": "application/json"}
                data = {
                    "contents": [{
                        "parts": [{"text": prompt}]
                    }]
                }
                
                req = urllib.request.Request(
                    url, 
                    data=json.dumps(data).encode("utf-8"), 
                    headers=headers, 
                    method="POST"
                )
                
                with urllib.request.urlopen(req, timeout=12) as response:
                    res_body = json.loads(response.read().decode("utf-8"))
                    text = res_body["candidates"][0]["content"]["parts"][0]["text"]
                    return text
            except Exception as e:
                print(f"Gemini API query failed (falling back to rules-engine): {e}")
 
        # Fallback to programmatic high-quality rules engine
        return AIService._get_fallback_advice(zip_code, soil, sun, plants, companions, antagonists, layout_analysis)
 
    @staticmethod
    def _get_fallback_advice(zip_code: str, soil: str, sun: str, plants: list, companions: list, antagonists: list, layout_analysis: dict = None) -> str:
        """Programmatically constructs high-fidelity ecological advice if no API key is available."""
        # Parse layout analysis
        realized_comp = []
        realized_antag = []
        soil_mismatch = []
        sun_mismatch = []
        shading = []
        potted_count = 0
        zone_mismatch = []
        
        if layout_analysis:
            realized_comp = layout_analysis.get('utilized_companions', [])
            realized_antag = layout_analysis.get('realized_antagonists', [])
            soil_mismatch = layout_analysis.get('soil_mismatches', [])
            sun_mismatch = layout_analysis.get('sun_mismatches', [])
            shading = layout_analysis.get('shading_warnings', [])
            potted_count = layout_analysis.get('tropical_potted_count', 0)
            zone_mismatch = layout_analysis.get('zone_mismatches', [])

        # 1. Layout Strategy
        layout_advice = ""
        if realized_comp:
            layout_advice += f"Your layout successfully utilized companion relationships like {', '.join(realized_comp)} to boost ecological synergies. "
        else:
            layout_advice += "We recommend adding companion pairings (such as Basil next to Tomatoes) to naturally enhance pest resistance. "
            
        if realized_antag:
            layout_advice += f"WARNING: Active antagonist warnings detected: {', '.join(realized_antag)} are placed too close to each other. Consider adjusting their layout to reduce growth suppression. "
        else:
            layout_advice += "Your layout successfully avoided any close antagonist proximity issues! "
            
        if shading:
            layout_advice += f"WARNING: Tall crops like {', '.join(shading)} are placed on the Southern half of your garden, which will cast shade on smaller crops. Consider relocating them to the far North. "
        else:
            layout_advice += "All tall crop varieties are positioned on the northern boundaries, maximizing sunlight exposure for lower-tier crops."

        # 2. Soil & Nutrition
        soil_low = soil.lower()
        nutrition_advice = f"Your {soil_low} soil needs structural attention. "
        if "clay" in soil_low:
            nutrition_advice += "Clay retains water and nutrients well but compacts easily. Incorporate gypsum, coarse compost, and organic mulch to open up drainage. "
        elif "sand" in soil_low:
            nutrition_advice += "Sandy soil drains rapidly, leaching nutrients. Apply heavy compost, leaf mold, and kelp meal to increase organic binding capacity. "
        else:
            nutrition_advice += "Loamy soil is ideal but requires regular maintenance. Apply a 2-inch layer of rich vermicompost before planting. "
            
        if soil_mismatch:
            nutrition_advice += f"Crops like {', '.join(soil_mismatch)} prefer different soil textures. Supplement their specific planting zones with custom compost blends."

        # 3. Crop Care & Pruning
        pruning_advice = "Pruning timelines vary by crop cycle. "
        annual_names = [p for p in plants if "tree" not in p.lower() and "berry" not in p.lower()]
        tree_names = [p for p in plants if "tree" in p.lower() or "chestnut" in p.lower() or "walnut" in p.lower()]
        if tree_names:
            pruning_advice += f"For perennial trees ({', '.join(tree_names)}), prune during late dormancy (winter) to stimulate spring growth. "
        if annual_names:
            pruning_advice += f"For annual crops like {', '.join(annual_names[:3])}, pinch early blossoms to encourage root establishment, and prune lower suckers on nightshades."

        # 4. Pest & Disease
        pest_advice = "Ecological pest prevention is highly recommended. "
        if plants:
            pest_advice += f"For {', '.join(plants[:3])}, spray neem oil or horticultural soap at the first sign of aphids. Use companion barrier plantings to mask scents. "
        if potted_count > 0:
            pest_advice += "Keep potted tropicals clear of indoor pests (spider mites) by washing leaves prior to overwintering."

        # 5. Rotational & Future Planning
        rotation_advice = f"To maintain your {soil_low} soil, plan a crop rotation. "
        rotation_advice += "Follow heavy nitrogen consumers (like corn, brassicas, or nightshades) with nitrogen-fixing cover crops such as Crimson Clover or Hairy Vetch next spring to naturally revitalize the soil."

        return f"""### Garden Layout Strategy
{layout_advice}

### Soil & Nutrition Plan
{nutrition_advice}

### Crop Care & Pruning Calendar
{pruning_advice}

### Pest & Disease Control
{pest_advice}

### Rotational & Future Planning
{rotation_advice}
"""

    @staticmethod
    def generate_custom_plant_info(plant_name: str) -> dict:
        """Queries Gemini to gather detailed botanical attributes for a custom plant, with an offline fallback."""
        api_key = os.environ.get("GEMINI_API_KEY")
        
        prompt = f"""
You are a botanical database expert. Provide structured JSON metadata for a plant/crop named "{plant_name}".
The JSON MUST follow this exact schema:
{{
    "scientific_name": "binomial scientific nomenclature",
    "type": "Must be exactly one of: Vegetable, Herb, Fruit Tree, Flower, Berry, Native, or Grain",
    "sun_requirements": "e.g. Full Sun, Partial Shade, Shade",
    "water_requirements": "e.g. Low, Moderate, High",
    "soil_preference": "e.g. Loam, Clay, Sand, Silt, Chalky",
    "usda_zones": "comma-separated list of compatible USDA zone numbers, e.g. '3,4,5,6,7,8,9'",
    "is_native": 0 or 1,
    "description": "A 1-2 sentence overview of its growth characteristics",
    "mature_height": estimated mature growth height in feet as a float/number (e.g. 15.0 for tree, 6.0 for tomato, 1.0 for greens),
    "mature_width": estimated mature growth spread/diameter in feet as a float/number (e.g. 8.0 for tree, 3.0 for tomato, 1.0 for greens),
    "min_radius": estimated minimum spacing requirement/radius in feet as a float/number (e.g. 3.0 for tree, 1.0 for tomato, 0.4 for greens),
    "max_radius": estimated maximum spacing requirement/radius in feet as a float/number (e.g. 5.0 for tree, 2.0 for tomato, 0.8 for greens),
    "foliage_color": "hex color code representing its leaves (e.g. #2e7d32)",
    "canopy_shape": "canopy growth habit, must be exactly one of: rounded, conical, weeping, columnar, vase, or spreading",
    "fruit_color": "hex color code representing its fruit/bloom, or null if not applicable"
}}
Return ONLY the raw JSON string. Do not wrap in markdown backticks or enclose in conversational text.
"""
        
        if api_key:
            try:
                url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={api_key}"
                headers = {"Content-Type": "application/json"}
                data = {
                    "contents": [{
                        "parts": [{"text": prompt}]
                    }]
                }
                
                req = urllib.request.Request(
                    url, 
                    data=json.dumps(data).encode("utf-8"), 
                    headers=headers, 
                    method="POST"
                )
                
                with urllib.request.urlopen(req, timeout=10) as response:
                    res_body = json.loads(response.read().decode("utf-8"))
                    text = res_body["candidates"][0]["content"]["parts"][0]["text"].strip()
                    
                    # Strip out any potential markdown code blocks if the model failed to follow instructions
                    if text.startswith("```"):
                        lines = text.split("\n")
                        if lines[0].startswith("```"):
                            lines = lines[1:]
                        if lines[-1].startswith("```"):
                            lines = lines[:-1]
                        text = "\n".join(lines).strip()
                        
                    parsed = json.loads(text)
                    name_lower = plant_name.lower()
                    is_tropical = any(k in name_lower for k in [
                        "betel", "areca", "citrus", "lemon", "lime", "orange", "palm", 
                        "banana", "mango", "avocado", "pomegranate", "hibiscus", 
                        "ginger", "jasmine", "olive", "fig", "tropical"
                    ])
                    if is_tropical:
                        parsed["usda_zones"] = "10,11"
                        if any(k in name_lower for k in ["tree", "palm", "citrus", "nut"]):
                            parsed["type"] = "Fruit Tree"
                    return parsed
            except Exception as e:
                print(f"Gemini custom plant lookup failed: {e}")
                
        # High-quality offline fallback heuristic generator
        name_lower = plant_name.lower()
        plant_type = "Vegetable"
        sun = "Full Sun"
        water = "Moderate"
        soil = "Loam"
        zones = "3,4,5,6,7,8,9,10"
        
        is_known_tree = any(k in name_lower for k in [
            "tree", "orchard", "chestnut", "walnut", "pecan", "hazelnut", 
            "oak", "maple", "pine", "cedar", "elm", "birch", "willow", 
            "fir", "spruce", "cypress", "redwood", "beech", "ash", "poplar", 
            "hickory", "alder", "linden", "paulownia", "cherry blossom", 
            "magnolia", "dogwood"
        ])
        
        is_tropical_plant = any(k in name_lower for k in [
            "betel", "areca", "citrus", "lemon", "lime", "orange", "palm", 
            "banana", "mango", "avocado", "pomegranate", "hibiscus", 
            "ginger", "jasmine", "olive", "fig", "tropical"
        ])
        
        if is_tropical_plant:
            zones = "10,11"
            if "tree" in name_lower or "palm" in name_lower or "citrus" in name_lower or "nut" in name_lower:
                plant_type = "Fruit Tree"
        elif is_known_tree:
            plant_type = "Fruit Tree"
            zones = "4,5,6,7,8,9"
        elif "berry" in name_lower or "strawberry" in name_lower or "raspberry" in name_lower or "blackberry" in name_lower:
            plant_type = "Berry"
            zones = "3,4,5,6,7,8"
        elif "flower" in name_lower or "rose" in name_lower or "marigold" in name_lower or "sunflower" in name_lower or "daisy" in name_lower or "nasturtium" in name_lower:
            plant_type = "Flower"
        elif "herb" in name_lower or "basil" in name_lower or "mint" in name_lower or "thyme" in name_lower or "oregano" in name_lower or "parsley" in name_lower or "sage" in name_lower or "rosemary" in name_lower:
            plant_type = "Herb"
            sun = "Full Sun, Partial Shade"
        elif "grass" in name_lower or "clover" in name_lower or "goldenrod" in name_lower or "milkweed" in name_lower:
            plant_type = "Native"
            zones = "3,4,5,6,7,8,9"

        # Apply standard dimension heuristics for offline fallback
        height = 1.0
        width = 1.0
        min_rad = 0.4
        max_rad = 0.8
        foliage_color = "#2e7d32"
        canopy_shape = "rounded"
        fruit_color = None

        type_lower = plant_type.lower()
        if "paulownia" in name_lower:
            plant_type = "Fruit Tree"
            height = 40.0
            width = 30.0
            min_rad = 12.0
            max_rad = 15.0
            canopy_shape = "rounded"
            foliage_color = "#4a7c59"
        elif any(k in name_lower for k in ["chestnut", "walnut", "oak", "maple", "pecan"]):
            plant_type = "Fruit Tree"
            height = 35.0
            width = 25.0
            min_rad = 10.0
            max_rad = 12.5
            canopy_shape = "rounded"
            foliage_color = "#3b7a57"
        elif "tree" in name_lower or type_lower == "fruit tree" or is_known_tree:
            height = 15.0
            width = 8.0
            min_rad = 3.0
            max_rad = 5.0
            canopy_shape = "rounded"
            foliage_color = "#3b7a57"
            if "apple" in name_lower: fruit_color = "#ef4444"
            elif "orange" in name_lower or "citrus" in name_lower: fruit_color = "#f97316"
            elif "lemon" in name_lower: fruit_color = "#eab308"
            elif "peach" in name_lower: fruit_color = "#fca5a5"
            elif "pear" in name_lower: fruit_color = "#84cc16"
            elif "cherry" in name_lower: fruit_color = "#be123c"
        elif any(k in name_lower for k in ["tomato", "cucumber", "pepper", "eggplant", "bean", "pea", "melon", "watermelon"]):
            height = 6.0
            width = 3.0
            min_rad = 1.0
            max_rad = 2.0
            foliage_color = "#4f825d"
            if "tomato" in name_lower: fruit_color = "#ef4444"
            elif "pepper" in name_lower: fruit_color = "#f59e0b"
            elif "eggplant" in name_lower: fruit_color = "#581c87"
            elif "cucumber" in name_lower: fruit_color = "#15803d"
        elif any(k in name_lower for k in ["squash", "zucchini", "pumpkin"]):
            height = 1.2
            width = 4.0
            min_rad = 1.5
            max_rad = 2.5
            foliage_color = "#1b4332"
        elif any(k in name_lower for k in ["potato", "okra", "broccoli", "cauliflower", "lavender", "rosemary", "sunflower", "marigold", "nasturtium", "flower"]):
            if "sunflower" in name_lower:
                height = 8.0
                width = 4.0
                min_rad = 1.5
                max_rad = 2.5
                fruit_color = "#eab308"
                canopy_shape = "columnar"
            elif "lavender" in name_lower:
                height = 3.0
                width = 2.0
                min_rad = 0.8
                max_rad = 1.5
                fruit_color = "#a855f7"
                canopy_shape = "vase"
            else:
                height = 3.0
                width = 2.0
                min_rad = 0.8
                max_rad = 1.5
                if "marigold" in name_lower: fruit_color = "#f59e0b"
                elif "nasturtium" in name_lower: fruit_color = "#ea580c"
            
        return {
            "scientific_name": f"{plant_name.capitalize()} vulgaris",
            "type": plant_type,
            "sun_requirements": sun,
            "water_requirements": water,
            "soil_preference": soil,
            "usda_zones": zones,
            "is_native": 0 if plant_type != "Native" else 1,
            "description": f"A newly added custom variety of {plant_type.lower()} ({plant_name}) tailored for your local zone.",
            "mature_height": height,
            "mature_width": width,
            "min_radius": min_rad,
            "max_radius": max_rad,
            "foliage_color": foliage_color,
            "canopy_shape": canopy_shape,
            "fruit_color": fruit_color
        }

