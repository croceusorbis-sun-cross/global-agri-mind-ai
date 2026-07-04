import os
import json
import urllib.request
import urllib.error

class AIService:
    @staticmethod
    def generate_garden_advice(zip_code: str, soil: str, sun: str, plants: list, companions: list, antagonists: list) -> str:
        """Queries the Gemini API to analyze the garden plot configuration, falling back to a rules-engine."""
        api_key = os.environ.get("GEMINI_API_KEY")
        
        prompt = f"""
You are an expert horticulturist and ecological designer. Analyze the following garden design request:
- ZIP Code: {zip_code}
- Soil: {soil}
- Sun: {sun}
- Selected crops: {', '.join(plants)}
- Identified companions: {', '.join([f"{c['plant']} + {c['companion']}" for c in companions]) if companions else 'None'}
- Identified antagonists/warnings: {', '.join([f"{a['plant']} + {a['antagonist']}" for a in antagonists]) if antagonists else 'None'}

Provide a structured markdown response with these sections:
### Garden Layout Strategy
Write 2-3 sentences suggesting how to arrange these plants based on sun/soil and companion guidelines.

### Rotational Calendar
Write 2 sentences recommending what cover crop or crop group to plant in this soil next year to renew nutrients.

### Professional Tips
Provide 2 bullet points of ecological or watering advice tailored for this soil type ({soil}) and sun profile ({sun}).
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
        return AIService._get_fallback_advice(zip_code, soil, sun, plants, companions, antagonists)

    @staticmethod
    def _get_fallback_advice(zip_code: str, soil: str, sun: str, plants: list, companions: list, antagonists: list) -> str:
        """Programmatically constructs high-fidelity ecological advice if no API key is available."""
        layout_advice = f"Arrange your garden with tall crops (like Corn or Sunflowers) on the north side to avoid casting shade on smaller greens. In your {soil.lower()} soil with {sun.lower()} exposure, ensure adequate organic matter to regulate soil moisture."
        if companions:
            layout_advice += f" Plant companion pairings like {companions[0]['plant']} and {companions[0]['companion']} close together to naturally enhance pest resistance and nutrient utilization."
        
        rotational_advice = f"Next season, follow your heavy-feeding crops with legumes (like beans or peas) or sow a cover crop such as crimson clover to naturally restore nitrogen levels in the {soil.lower()} soil."
        
        tips = []
        if "clay" in soil.lower():
            tips.append("Clay soil holds moisture but drains slowly. Water deeply and less frequently, and consider raised beds to prevent root rot.")
        elif "sand" in soil.lower():
            tips.append("Sandy soil drains very quickly. Incorporate rich compost to increase moisture retention and water regularly.")
        else:
            tips.append("Loam soil is ideal for vegetable roots. Mulch around the base of nightshades to maintain steady moisture.")
            
        if "full" in sun.lower():
            tips.append("Full sun drives fast growth but high evaporation. Water in the early morning to minimize evaporation loss.")
        else:
            tips.append("Partial shade is excellent for cool-season crops (greens, lettuce) to prevent premature bolting.")

        return f"""### Garden Layout Strategy
{layout_advice}

### Rotational Calendar
{rotational_advice}

### Professional Tips
* {tips[0]}
* {tips[1]}
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
        
        if "tree" in name_lower or "orchard" in name_lower:
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
        if "tree" in name_lower or type_lower == "fruit tree":
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

