import sqlite3
import os

def seed_database():
    db_path = os.path.join(os.path.dirname(__file__), 'garden.db')
    schema_path = os.path.join(os.path.dirname(__file__), 'schema.sql')

    print(f"Initializing database at {db_path}...")
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()

    cursor.execute("DROP TABLE IF EXISTS relationships")
    cursor.execute("DROP TABLE IF EXISTS plants")

    # Read and execute schema
    with open(schema_path, 'r') as f:
        schema_sql = f.read()
    cursor.executescript(schema_sql)

    # 1. Prepare ~200 common garden plants, herbs, fruits, and native flowers
    # We will build a list of categories and varieties to reach 200+ entries.
    base_plants = []

    # --- VEGETABLES & VARIETIES (Total: 90) ---
    vegetable_templates = [
        ("Tomato", "Solanum lycopersicum", "Full", "Moderate", "Loam", "3,4,5,6,7,8,9,10,11",
         ["Beefsteak", "Roma", "Cherry", "Heirloom", "Early Girl", "San Marzano", "Yellow Pear", "Brandywine", "Celebrity", "Cherokee Purple"]),
        ("Pepper", "Capsicum annuum", "Full", "Moderate", "Loam", "4,5,6,7,8,9,10,11",
         ["Bell", "Jalapeno", "Habanero", "Cayenne", "Serrano", "Poblano", "Banana", "Shishito", "Ghost", "Thai Chili"]),
        ("Squash", "Cucurbita pepo", "Full", "Moderate", "Loam, Clay", "3,4,5,6,7,8,9,10",
         ["Zucchini", "Yellow", "Butternut", "Spaghetti", "Acorn", "Kabocha", "Delicata", "Pattypan"]),
        ("Potato", "Solanum tuberosum", "Full", "Moderate", "Sand, Loam", "3,4,5,6,7,8,9,10",
         ["Russet", "Yukon Gold", "Red Pontiac", "Sweet", "Fingerling", "Kennebec", "Purple Majesty"]),
        ("Onion", "Allium cepa", "Full", "Moderate", "Loam", "3,4,5,6,7,8,9",
         ["Red", "Yellow", "White", "Sweet", "Shallot", "Green", "Leek"]),
        ("Carrot", "Daucus carota", "Full", "Moderate", "Sand, Loam", "3,4,5,6,7,8,9,10",
         ["Nantes", "Danvers", "Imperator", "Chantenay", "Rainbow", "Parisian"]),
        ("Lettuce", "Lactuca sativa", "Partial, Full", "Moderate", "Loam", "3,4,5,6,7,8,9,10",
         ["Romaine", "Butterhead", "Iceberg", "Loose Leaf", "Oakleaf", "Arugula"]),
        ("Cabbage", "Brassica oleracea var. capitata", "Full", "Moderate", "Loam", "3,4,5,6,7,8,9,10",
         ["Red capitata", "Green capitata", "Savoy capitata", "Napa", "Bok Choy"]),
        ("Cucumber", "Cucumis sativus", "Full", "High", "Loam", "4,5,6,7,8,9,10,11",
         ["Slicing", "Pickling", "English", "Lemon", "Armenian", "Persian"]),
        ("Bean", "Phaseolus vulgaris", "Full", "Moderate", "Loam", "3,4,5,6,7,8,9,10",
         ["Green Bush", "Pole", "Lima", "Fava", "Black", "Kidney", "Pinto"]),
        ("Pea", "Pisum sativum", "Full, Partial", "Moderate", "Loam", "3,4,5,6,7,8,9",
         ["Sugar Snap", "Snow", "Garden", "Sweet Pea", "Chickpea"]),
        ("Radish", "Raphanus sativus", "Full, Partial", "Moderate", "Sand, Loam", "2,3,4,5,6,7,8,9,10",
         ["Cherry Belle", "French Breakfast", "Daikon", "Watermelon", "Black Spanish"]),
        ("Beet", "Beta vulgaris", "Full, Partial", "Moderate", "Loam", "3,4,5,6,7,8,9,10",
         ["Detroit Dark Red", "Golden", "Chioggia", "Sugar", "Bull's Blood"]),
        ("Broccoli", "Brassica oleracea var. italica", "Full", "Moderate", "Loam", "3,4,5,6,7,8,9,10",
         ["Calabrese", "Di Cicco", "Waltham 29", "Purple Sprouting"]),
        ("Cauliflower", "Brassica oleracea var. botrytis", "Full", "Moderate", "Loam", "3,4,5,6,7,8,9,10",
         ["Snowball Y", "Purple Graffiti", "Cheddar Yellow", "Romanesco"]),
        ("Okra", "Abelmoschus esculentus", "Full", "Moderate", "Loam, Sand", "5,6,7,8,9,10,11",
         ["Clemson Spineless", "Red Burgundy", "Emerald"]),
        ("Spinach", "Spinacia oleracea", "Partial, Full", "Moderate", "Loam", "2,3,4,5,6,7,8,9,10",
         ["Bloomsdale Long Standing", "Baby Leaf", "Giant Nobel"])
    ]

    for name, sci, sun, water, soil, zones, vars in vegetable_templates:
        for var in vars:
            fullname = f"{var} {name}" if name not in var else var
            base_plants.append({
                "name": fullname,
                "scientific_name": sci,
                "type": "Vegetable",
                "sun_requirements": sun,
                "water_requirements": water,
                "soil_preference": soil,
                "usda_zones": zones,
                "is_native": 0,
                "description": f"Popular {name.lower()} variety: '{var}'. Great for home gardens."
            })

    # --- HERBS & VARIETIES (Total: 40) ---
    herbs_templates = [
        ("Basil", "Ocimum basilicum", "Full", "Moderate", "Loam", "4,5,6,7,8,9,10,11",
         ["Sweet", "Genovese", "Thai", "Lemon", "Purple Ruffles", "Holy"]),
        ("Mint", "Mentha", "Partial, Shade", "High", "Clay, Loam", "3,4,5,6,7,8,9,10,11",
         ["Spearmint", "Peppermint", "Chocolate", "Apple", "Orange"]),
        ("Sage", "Salvia officinalis", "Full", "Low", "Sand, Loam", "4,5,6,7,8,9,10",
         ["Garden", "Pineapple", "Purple", "Tricolor", "White"]),
        ("Thyme", "Thymus vulgaris", "Full", "Low", "Sand", "3,4,5,6,7,8,9,10",
         ["Common", "Lemon", "Creeping", "Elfin"]),
        ("Rosemary", "Salvia rosmarinus", "Full", "Low", "Sand", "6,7,8,9,10,11",
         ["Tuscan Blue", "Prostrate", "Arp", "Gorizia"]),
        ("Lavender", "Lavandula", "Full", "Low", "Sand", "5,6,7,8,9,10",
         ["English", "French", "Spanish", "Munstead"]),
        ("Oregano", "Origanum vulgare", "Full", "Low", "Sand, Loam", "4,5,6,7,8,9,10",
         ["Greek", "Italian", "Syrian", "Golden"]),
        ("Parsley", "Petroselinum crispum", "Full, Partial", "Moderate", "Loam", "4,5,6,7,8,9,10",
         ["Flat-leaf Italian", "Curly-leaf", "Hamburg Root"]),
        ("Cilantro", "Coriandrum sativum", "Full, Partial", "Moderate", "Loam", "3,4,5,6,7,8,9,10",
         ["Coriander Cilantro", "Slo-Bolt"]),
        ("Dill", "Anethum graveolens", "Full", "Moderate", "Loam", "3,4,5,6,7,8,9,10,11",
         ["Bouquet", "Mammoth Long Island", "Fernleaf"])
    ]

    for name, sci, sun, water, soil, zones, vars in herbs_templates:
        for var in vars:
            fullname = f"{var} {name}" if name not in var else var
            base_plants.append({
                "name": fullname,
                "scientific_name": sci,
                "type": "Herb",
                "sun_requirements": sun,
                "water_requirements": water,
                "soil_preference": soil,
                "usda_zones": zones,
                "is_native": 0,
                "description": f"Flavorful {name.lower()} variety: '{var}'. Fits container gardening."
            })

    # --- FRUITS & FRUIT TREES (Total: 40) ---
    fruits_templates = [
        ("Apple Tree", "Malus domestica", "Full", "Moderate", "Loam", "3,4,5,6,7,8,9",
         ["Honeycrisp", "Gala", "Fuji", "Granny Smith", "Pink Lady", "McIntosh", "Golden Delicious"]),
        ("Peach Tree", "Prunus persica", "Full", "Moderate", "Sand, Loam", "5,6,7,8,9",
         ["Elberta", "Redhaven", "Georgia Belle", "Reliance"]),
        ("Strawberry", "Fragaria x ananassa", "Full", "High", "Loam", "3,4,5,6,7,8,9,10",
         ["Albion", "Chandler", "Eversweet", "Seascape", "Ozark Beauty"]),
        ("Blueberry", "Vaccinium corymbosum", "Full, Partial", "High", "Sand, Loam", "3,4,5,6,7,8",
         ["Duke", "Bluecrop", "Patriot", "Jersey", "Pink Lemonade"]),
        ("Raspberry", "Rubus idaeus", "Full, Partial", "Moderate", "Loam", "3,4,5,6,7,8",
         ["Heritage", "Caroline", "Fall Gold", "Latham"]),
        ("Cherry Tree", "Prunus avium", "Full", "Moderate", "Loam", "4,5,6,7,8,9",
         ["Bing", "Rainier", "Black Tartarian", "Montmorency"]),
        ("Pear Tree", "Pyrus communis", "Full", "Moderate", "Loam, Clay", "4,5,6,7,8,9",
         ["Bartlett", "Bosc", "D'Anjou", "Shinseiki Asian"]),
        ("Grapevine", "Vitis", "Full", "Moderate", "Sand, Loam", "4,5,6,7,8,9,10",
         ["Concord", "Thompson Seedless", "Cabernet Sauvignon", "Flame Seedless"]),
        ("Watermelon", "Citrullus lanatus", "Full", "Moderate", "Sand, Loam", "4,5,6,7,8,9,10,11",
         ["Sugar Baby", "Crimson Sweet", "Charleston Gray", "Jubilee"]),
        ("Lemon Tree", "Citrus limon", "Full", "Moderate", "Loam, Sand", "9,10,11",
         ["Meyer", "Eureka", "Lisbon"]),
        ("Orange Tree", "Citrus sinensis", "Full", "Moderate", "Loam, Sand", "9,10,11",
         ["Navel", "Valencia", "Blood Orange"])
    ]

    for name, sci, sun, water, soil, zones, vars in fruits_templates:
        for var in vars:
            fullname = f"{var} {name}" if name not in var else var
            base_plants.append({
                "name": fullname,
                "scientific_name": sci,
                "type": "Fruit",
                "sun_requirements": sun,
                "water_requirements": water,
                "soil_preference": soil,
                "usda_zones": zones,
                "is_native": 0,
                "description": f"Delicious {name.lower()} variety: '{var}'. Suitable for backyard orchards."
            })

    # --- NATIVE FLOWERS & COMPANIONS (Total: 40) ---
    natives_templates = [
        ("Coneflower", "Echinacea purpurea", "Full, Partial", "Low", "Loam, Sand", "3,4,5,6,7,8,9", 1,
         ["Purple", "White Swan", "Magnus", "Cheyenne Spirit"]),
        ("Black-Eyed Susan", "Rudbeckia hirta", "Full, Partial", "Low", "Loam, Sand, Clay", "3,4,5,6,7,8,9,10", 1,
         ["Goldstrum", "Hirta Common", "Cherokee Sunset"]),
        ("Milkweed", "Asclepias", "Full", "Low", "Sand, Clay", "3,4,5,6,7,8,9", 1,
         ["Common Milkweed", "Swamp Milkweed", "Butterfly Weed"]),
        ("Marigold", "Tagetes", "Full", "Moderate", "Loam, Sand", "2,3,4,5,6,7,8,9,10,11", 0,
         ["French", "African", "Signet", "Mexican Marigold"]),
        ("Nasturtium", "Tropaeolum majus", "Full", "Low", "Sand, Loam", "3,4,5,6,7,8,9,10,11", 0,
         ["Jewel Mix", "Empress of India", "Alaska Variegated"]),
        ("Sunflower", "Helianthus annuus", "Full", "Moderate", "Loam, Clay", "3,4,5,6,7,8,9,10", 1,
         ["Mammoth Grey", "Autumn Beauty", "Lemon Queen", "Teddy Bear"]),
        ("Aster", "Symphyotrichum", "Full, Partial", "Moderate", "Loam, Clay", "3,4,5,6,7,8", 1,
         ["New England", "Aromatic Aster", "Blue Wood Aster"]),
        ("Yarrow", "Achillea millefolium", "Full", "Low", "Sand, Loam, Clay", "3,4,5,6,7,8,9", 1,
         ["Common Yarrow", "Paprika", "Moonshine"]),
        ("Bee Balm", "Monarda fistulosa", "Full, Partial", "Moderate", "Loam, Clay", "3,4,5,6,7,8,9", 1,
         ["Wild Bergamot", "Jacob Cline", "Lemon Bee Balm"]),
        ("Coreopsis", "Coreopsis lanceolata", "Full", "Low", "Sand, Loam", "3,4,5,6,7,8,9", 1,
         ["Lanceleaf", "Early Sunrise", "Moonbeam"])
    ]

    for name, sci, sun, water, soil, zones, is_nat, vars in natives_templates:
        for var in vars:
            fullname = f"{var} {name}" if name not in var else var
            base_plants.append({
                "name": fullname,
                "scientific_name": sci,
                "type": "Flower" if is_nat == 0 else "Native",
                "sun_requirements": sun,
                "water_requirements": water,
                "soil_preference": soil,
                "usda_zones": zones,
                "is_native": is_nat,
                "description": f"Beautiful {name.lower()} variety: '{var}'. Great for pollinators and companion benefits."
            })

    # Ensure we insert exactly or above 200 entries (current count: ~210)
    print(f"Generated list of {len(base_plants)} plants to seed.")

    # Insert plants
    for p in base_plants:
        # Determine defaults dynamically based on plant name and type
        name_lower = p["name"].lower()
        type_lower = p["type"].lower()
        
        height = 1.0
        width = 1.0
        min_rad = 0.4
        max_rad = 0.8
        foliage_color = "#2e7d32"  # standard forest green
        canopy_shape = "rounded"
        fruit_color = None
        
        # 1. Fruit Trees
        if "tree" in name_lower or "orchard" in name_lower or type_lower == "fruit tree":
            height = 15.0
            width = 8.0
            min_rad = 3.0
            max_rad = 5.0
            canopy_shape = "rounded"
            foliage_color = "#3b7a57"
            if "apple" in name_lower:
                fruit_color = "#ef4444"
            elif "orange" in name_lower or "citrus" in name_lower:
                fruit_color = "#f97316"
            elif "lemon" in name_lower:
                fruit_color = "#eab308"
            elif "peach" in name_lower:
                fruit_color = "#fca5a5"
            elif "pear" in name_lower:
                fruit_color = "#84cc16"
            elif "cherry" in name_lower:
                fruit_color = "#be123c"
        # 2. Vine / staked climbing crops
        elif any(k in name_lower for k in ["tomato", "cucumber", "pepper", "eggplant", "bean", "pea", "melon", "watermelon"]):
            height = 6.0
            width = 3.0
            min_rad = 1.0
            max_rad = 2.0
            foliage_color = "#4f825d"
            if "tomato" in name_lower:
                fruit_color = "#ef4444"
            elif "pepper" in name_lower:
                fruit_color = "#f59e0b"
            elif "eggplant" in name_lower:
                fruit_color = "#581c87"
            elif "cucumber" in name_lower:
                fruit_color = "#15803d"
        # 3. Squash / sprawl crops
        elif any(k in name_lower for k in ["squash", "zucchini", "pumpkin"]):
            height = 1.2
            width = 4.0
            min_rad = 1.5
            max_rad = 2.5
            foliage_color = "#1b4332"
        # 4. Bushes, large herbs, flowers
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
                if "marigold" in name_lower:
                    fruit_color = "#f59e0b"
                elif "nasturtium" in name_lower:
                    fruit_color = "#ea580c"
        # 5. Herbs, greens, root vegetables
        else:
            height = 1.0
            width = 1.0
            min_rad = 0.4
            max_rad = 0.8
            foliage_color = "#556b2f"

        cursor.execute("""
            INSERT OR IGNORE INTO plants 
            (name, scientific_name, type, sun_requirements, water_requirements, soil_preference, usda_zones, is_native, description, mature_height, mature_width, min_radius, max_radius, foliage_color, canopy_shape, fruit_color)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            p["name"], p["scientific_name"], p["type"], p["sun_requirements"], p["water_requirements"], p["soil_preference"], p["usda_zones"], p["is_native"], p["description"],
            height, width, min_rad, max_rad, foliage_color, canopy_shape, fruit_color
        ))

    conn.commit()

    # 2. Build Relationships (Companions & Antagonists)
    # Fetch inserted plant IDs
    cursor.execute("SELECT id, name FROM plants")
    plant_map = {name: id for id, name in cursor.fetchall()}

    # Companion groups
    # We will build programmatic relationship mappings based on base name keywords (e.g. all tomatoes like all basils)
    def add_relationship(p1_keyword, p2_keyword, rel_type, desc):
        p1_ids = [pid for name, pid in plant_map.items() if p1_keyword.lower() in name.lower()]
        p2_ids = [pid for name, pid in plant_map.items() if p2_keyword.lower() in name.lower()]
        count = 0
        for id1 in p1_ids:
            for id2 in p2_ids:
                if id1 != id2:
                    cursor.execute("""
                        INSERT OR IGNORE INTO relationships (plant_id, target_id, type, description)
                        VALUES (?, ?, ?, ?)
                    """, (id1, id2, rel_type, desc))
                    count += 1
        return count

    rel_count = 0
    # Tomato relationships
    rel_count += add_relationship("Tomato", "Basil", "companion", "Basil repels thrips, flies, and hornworms, and improves tomato flavor.")
    rel_count += add_relationship("Tomato", "Marigold", "companion", "Marigolds repel nematodes, tomato hornworms, and other garden pests.")
    rel_count += add_relationship("Tomato", "Nasturtium", "companion", "Nasturtiums act as a trap crop for aphids and repel whiteflies.")
    rel_count += add_relationship("Tomato", "Potato", "antagonist", "Tomatoes and potatoes are both susceptible to early and late blight, and can infect each other.")
    rel_count += add_relationship("Tomato", "Fennel", "antagonist", "Fennel releases allelopathic chemicals that stunt the growth of nightshades like tomatoes.")

    # Bean & Pea relationships
    rel_count += add_relationship("Bean", "Carrot", "companion", "Beans enrich the soil with nitrogen, which benefits root crops like carrots.")
    rel_count += add_relationship("Bean", "Corn", "companion", "Corn acts as a natural trellis for pole beans, while beans fix nitrogen for the corn.")
    rel_count += add_relationship("Bean", "Onion", "antagonist", "Allium family members (onions, garlic) inhibit the growth of nitrogen-fixing bacteria on bean roots.")
    rel_count += add_relationship("Pea", "Carrot", "companion", "Peas fix nitrogen, boosting the growth of nearby carrots.")
    rel_count += add_relationship("Pea", "Onion", "antagonist", "Onions inhibit the growth of peas and beans.")

    # Carrot relationships
    rel_count += add_relationship("Carrot", "Lettuce", "companion", "Carrots and lettuce have different root depths and do not compete for space.")
    rel_count += add_relationship("Carrot", "Dill", "antagonist", "Dill can cross-pollinate with carrots and stunt their growth.")

    # Cucumber relationships
    rel_count += add_relationship("Cucumber", "Radish", "companion", "Radishes repel cucumber beetles and act as a companion trap crop.")
    rel_count += add_relationship("Cucumber", "Sage", "antagonist", "Sage stunts the growth of cucumbers.")
    rel_count += add_relationship("Cucumber", "Potato", "antagonist", "Potato blight can easily transfer to cucumbers and vice-versa.")

    # Potato relationships
    rel_count += add_relationship("Potato", "Marigold", "companion", "Marigolds protect potato crops from pests.")
    rel_count += add_relationship("Potato", "Sunflower", "antagonist", "Sunflowers can stunt potato growth and increase susceptibility to potato blight.")

    # Squash relationships
    rel_count += add_relationship("Squash", "Marigold", "companion", "Marigolds repel squash bugs and beetles.")
    rel_count += add_relationship("Squash", "Nasturtium", "companion", "Nasturtiums repel squash bugs and cucumber beetles.")
    rel_count += add_relationship("Squash", "Corn", "companion", "Part of the Three Sisters: squash leaves shade the ground to prevent weeds and retain moisture.")

    # Apple & Fruit Tree relationships
    rel_count += add_relationship("Apple", "Lavender", "companion", "Lavender attracts pollinators like bees, essential for apple blossom fruit set.")
    rel_count += add_relationship("Cherry", "Lavender", "companion", "Attracts key pollinators to cherry blossoms.")
    rel_count += add_relationship("Peach", "Lavender", "companion", "Attracts key pollinators and repels peach tree pests with strong scent.")

    conn.commit()
    print(f"Successfully seeded {rel_count} relationship entries.")

    # Quick check count
    cursor.execute("SELECT COUNT(*) FROM plants")
    total_plants = cursor.fetchone()[0]
    cursor.execute("SELECT COUNT(*) FROM relationships")
    total_rels = cursor.fetchone()[0]

    print(f"Verification: {total_plants} plants and {total_rels} relationships inside database/garden.db.")
    conn.close()

if __name__ == '__main__':
    seed_database()
