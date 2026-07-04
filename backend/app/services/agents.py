import os
import json
import urllib.request
import urllib.error

class SpecialistAgent:
    def __init__(self, key: str, name: str, role: str, icon: str, description: str):
        self.key = key
        self.name = name
        self.role = role
        self.icon = icon
        self.description = description

    def analyze(self, query: str, soil: str, sun: str, zone: str, crops: list) -> str:
        """Analyze the user query based on the agent's specialty, utilizing Gemini if available, or a fallback rules engine."""
        api_key = os.environ.get("GEMINI_API_KEY")
        if api_key:
            return self._analyze_llm(api_key, query, soil, sun, zone, crops)
        else:
            return self._analyze_rules(query, soil, sun, zone, crops)

    def _analyze_llm(self, api_key: str, query: str, soil: str, sun: str, zone: str, crops: list) -> str:
        system_instructions = self._get_system_instructions(soil, sun, zone, crops)
        prompt = f"""
Query: {query}
Soil: {soil}
Sun exposure: {sun}
Climate Zone: {zone}
Selected Crops: {', '.join(crops) if crops else 'None'}

Provide your specialized analysis in 2-4 clean sentences. Do not mention other agents by name. Write in first-person as a professional expert.
"""
        try:
            url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={api_key}"
            headers = {"Content-Type": "application/json"}
            data = {
                "contents": [{
                    "role": "user",
                    "parts": [{"text": f"{system_instructions}\n\n{prompt}"}]
                }]
            }
            req = urllib.request.Request(
                url,
                data=json.dumps(data).encode("utf-8"),
                headers=headers,
                method="POST"
            )
            with urllib.request.urlopen(req, timeout=8) as response:
                res_data = json.loads(response.read().decode("utf-8"))
                text = res_data["contents"][0]["parts"][0]["text"].strip()
                return text
        except Exception as e:
            print(f"Error querying Gemini for agent {self.name}: {e}")
            return self._analyze_rules(query, soil, sun, zone, crops)

    def _get_system_instructions(self, soil: str, sun: str, zone: str, crops: list) -> str:
        raise NotImplementedError

    def _analyze_rules(self, query: str, soil: str, sun: str, zone: str, crops: list) -> str:
        raise NotImplementedError


class TomatoSpecialist(SpecialistAgent):
    def __init__(self):
        super().__init__(
            key="tomato",
            name="Tomato Specialist",
            role="Nightshade Horticulturist",
            icon="🍅",
            description="Expert in yellowing leaves, rot, early/late blight, and calcium requirements for nightshades."
        )

    def _get_system_instructions(self, soil: str, sun: str, zone: str, crops: list) -> str:
        return "You are a professional Nightshade Horticulturist specializing in tomatoes, peppers, and eggplants. Diagnose growth issues, leaf yellowing, blight pathogens, and fruit end-rot from a horticultural perspective."

    def _analyze_rules(self, query: str, soil: str, sun: str, zone: str, crops: list) -> str:
        q = query.lower()
        if "yellow" in q or "chlorosis" in q:
            return "From a nightshade perspective, yellowing lower leaves usually indicate early signs of Nitrogen deficiency or root stress due to moisture fluctuations. If there are concentric dark rings, it is likely Early Blight (Alternaria solani). I recommend deep, infrequent watering at the base of the plant, removing the bottom 12 inches of foliage, and applying an organic calcium-rich foliar feed."
        elif "rot" in q or "black" in q or "bottom" in q:
            return "Blackening at the bottom of the fruit is classic Blossom-End Rot. This is not a pathogen, but rather a structural calcium deficiency in the developing fruit, usually caused by inconsistent watering. Ensure the soil remains evenly damp and add organic gypsum or bone meal to stabilize soil calcium availability."
        elif "bug" in q or "pest" in q or "eat" in q or "hole" in q:
            return "If you notice large chunks of tomato leaves missing overnight, check for Hornworms. Their camouflage is superb; inspect the undersides of stems. Smaller holes point to Flea Beetles or Spider Mites. Introduce companion African Marigolds to repel them naturally."
        else:
            return f"As a nightshade specialist, I recommend keeping tomatoes in full sun ({sun} exposure) with well-draining soil. Avoid planting them directly next to potatoes to reduce cross-pathogen vulnerability. Proper staking will maximize air circulation and reduce disease risk."


class SoilScientist(SpecialistAgent):
    def __init__(self):
        super().__init__(
            key="soil",
            name="Soil Scientist",
            role="Pedologist & Agronomist",
            icon="🧪",
            description="Analyzes soil sand/clay texture ratios, drainage washouts, organic matter, and compost inputs."
        )

    def _get_system_instructions(self, soil: str, sun: str, zone: str, crops: list) -> str:
        return "You are an expert Soil Pedologist. Analyze soil structures, clay drainage limits, sandy nutrient washouts, organic compost applications, and N-P-K mineral adjustments."

    def _analyze_rules(self, query: str, soil: str, sun: str, zone: str, crops: list) -> str:
        q = query.lower()
        if "clay" in q or "drain" in q or "water" in q or "wet" in q:
            return f"Heavy clay soil restricts root aeration and holds water too long, causing root rot. In your '{soil}' soil, adding raw sand will create concrete-like conditions; instead, incorporate organic compost, leaf mold, or expanded shale to aggregate the clay particles and improve drainage structure."
        elif "yellow" in q or "chlorosis" in q:
            return f"Yellowing leaves are frequently caused by nutrient lockout in clay or leaching in sandy soil. With your '{soil}' soil, heavy rains may have washed away mobile nitrogen. I suggest applying an organic compost top-dressing to buffer soil chemistry and slowly release essential nitrogen and iron."
        elif "compost" in q or "fertilizer" in q or "organic" in q:
            return "Building soil organic matter is key. I recommend applying a 2-inch layer of well-rotted leaf compost or worm castings. This feeds the soil microbiome, builds aggregate stability, and naturally regulates water retention."
        else:
            return f"Your soil type is classified as '{soil}'. To optimize root aeration and microbial activity, incorporate aged organic matter and avoid mechanical compaction when wet. Conduct a slurry pH test to ensure it sits between 6.0 and 7.0 for optimal mineral availability."


class PestEntomologist(SpecialistAgent):
    def __init__(self):
        super().__init__(
            key="pest",
            name="Pest Entomologist",
            role="Agricultural Entomologist",
            icon="🐛",
            description="Identifies chewing/sucking insects, aphids, mites, and prescribes organic neem and companion controls."
        )

    def _get_system_instructions(self, soil: str, sun: str, zone: str, crops: list) -> str:
        return "You are a professional Agricultural Entomologist. Identify insect damage (aphids, mites, beetles, caterpillars) and prescribe organic integrated pest management (IPM) techniques."

    def _analyze_rules(self, query: str, soil: str, sun: str, zone: str, crops: list) -> str:
        q = query.lower()
        if "yellow" in q or "spot" in q:
            return "Leaf speckling or yellowing can be caused by sucking pests like Spider Mites or Aphids on the leaf undersides. Spraying plants with a strong stream of water will dislodge them. For persistent infestations, apply a 1% dilution of organic cold-pressed neem oil during evening hours."
        elif "hole" in q or "eat" in q or "bite" in q or "chew" in q:
            return "Irregular holes in leaves suggest chewing pests such as Hornworms, Flea Beetles, or Slugs. Handpick larger caterpillars at dusk. Dusting the base with food-grade diatomaceous earth will form a protective physical barrier against crawling insects like beetles and slugs."
        else:
            return "Integrated Pest Management (IPM) is best. I recommend planting companion Nasturtiums and Sweet Alyssum as trap crops to draw pests away from your main crops, while attracting beneficial predators like ladybugs and lacewings."


class RegenerativeAgronomist(SpecialistAgent):
    def __init__(self):
        super().__init__(
            key="regen",
            name="Regenerative Agronomist",
            role="Agroecologist",
            icon="🌾",
            description="Specializes in cover crops, nitrogen-fixing polycultures, and low-till soil regeneration."
        )

    def _get_system_instructions(self, soil: str, sun: str, zone: str, crops: list) -> str:
        return "You are a Regenerative Agroecologist. Analyze polycultures, cover cropping, nitrogen-fixing symbiosis, low-till biology, and long-term soil health."

    def _analyze_rules(self, query: str, soil: str, sun: str, zone: str, crops: list) -> str:
        q = query.lower()
        if "yellow" in q or "fertilizer" in q or "nitrogen" in q:
            return "To address nitrogen depletion without chemical inputs, integrate leguminous companion crops like Peas or Clover. Their root nodules form symbiotic relationships with Rhizobium bacteria to fix atmospheric nitrogen directly into your root zone."
        elif "clay" in q or "weed" in q or "till" in q:
            return "Minimize soil tilling to protect the delicate mycorrhizal fungal networks. In heavy soils, use deep-rooting cover crops like Daikon Radish to drill through compacted zones naturally, leaving the decaying roots in place to build organic channels."
        else:
            return "Polyculture design is essential. Rather than clean rows, utilize the Three Sisters approach (Squash, Beans, and tall supports) or plant dense cover crops. This keeps the soil covered, suppresses weeds, retains moisture, and feeds the biological food web."


class MicroClimateAdvisor(SpecialistAgent):
    def __init__(self):
        super().__init__(
            key="climate",
            name="Climate Advisor",
            role="Biometeorologist",
            icon="🌦️",
            description="Reviews USDA cold hardiness zones, frost timelines, heat stress, and light exposure."
        )

    def _get_system_instructions(self, soil: str, sun: str, zone: str, crops: list) -> str:
        return "You are a Biometeorologist and climate expert. Analyze plant health relative to USDA cold hardiness zones, frost thresholds, heat indexes, and sun exposure."

    def _analyze_rules(self, query: str, soil: str, sun: str, zone: str, crops: list) -> str:
        q = query.lower()
        if "frost" in q or "cold" in q or "winter" in q:
            return f"In USDA Climate {zone}, watch out for late spring frost events. If temperatures dip close to freezing, cover tender nightshades and melons with floating row covers. Do not plant warm-season crops until night temperatures consistently stay above 50°F (10°C)."
        elif "sun" in q or "hot" in q or "summer" in q or "dry" in q:
            return f"Under '{sun}' conditions, warm-season plants will transpire rapidly. High heat indexes can scorch young leaves and cause tomato blossoms to drop. Apply a thick straw mulch layer to cool the soil surface and protect roots from thermal shock."
        else:
            return f"Your garden is mapped to Climate {zone} with '{sun}' sun exposure. Align your planting schedule to local frost-free dates, and provide afternoon shade cloth for cool-season greens like lettuce and spinach during peak summer heat."


class CoordinatorAgent:
    @staticmethod
    def synthesize(query: str, active_agents: list, specialists_data: dict, soil: str, sun: str, zone: str) -> dict:
        """Synthesizes reports from active experts into a final cohesive diagnostic summary card."""
        api_key = os.environ.get("GEMINI_API_KEY")
        
        # Build synthesis prompt
        discussion_summary = ""
        for name, msg in specialists_data.items():
            discussion_summary += f"- {name}: {msg}\n"

        prompt = f"""
You are the Lead Coordinator Agent for an advanced agricultural AI system. Synthesize the findings from our specialized expert panel:
Query: {query}
Soil: {soil}
Sun: {sun}
Zone: {zone}

Expert Panel Recommendations:
{discussion_summary}

Provide a structured markdown response with exactly these sections:
### 📋 Consensus Diagnosis
Write 2 sentences summarizing the root cause of the user's issue based on the experts' agreement.

### 🎯 Confidence Rating
Specify exactly one: **High**, **Medium**, or **Low** with a brief 1-sentence explanation of why.

### 🛠️ Actionable Strategy
Provide 3 bulleted recommendations (1-2 sentences each) ordered by priority.
"""
        if api_key:
            try:
                url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={api_key}"
                headers = {"Content-Type": "application/json"}
                data = {
                    "contents": [{
                        "role": "user",
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
                    res_data = json.loads(response.read().decode("utf-8"))
                    text = res_data["contents"][0]["parts"][0]["text"].strip()
                    
                    # Extract confidence level from response
                    confidence = "Medium"
                    if "high" in text.lower():
                        confidence = "High"
                    elif "low" in text.lower():
                        confidence = "Low"
                        
                    return {
                        "confidence": confidence,
                        "summary": text
                    }
            except Exception as e:
                print(f"Error querying Gemini for synthesis: {e}")
                return CoordinatorAgent._synthesize_rules(query, specialists_data, soil, sun)
        else:
            return CoordinatorAgent._synthesize_rules(query, specialists_data, soil, sun)

    @staticmethod
    def _synthesize_rules(query: str, specialists_data: dict, soil: str, sun: str) -> dict:
        q = query.lower()
        confidence = "Medium"
        
        if "tomato" in specialists_data and ("yellow" in q or "chlorosis" in q):
            confidence = "High"
            summary = """### 📋 Consensus Diagnosis
The expert panel agrees that leaf yellowing is primarily caused by **nitrogen availability stress** or waterlogged soil conditions disrupting nutrient uptake in nightshades.

### 🎯 Confidence Rating
**High** - Symptoms align closely with classic nitrogen chlorosis and soil saturation patterns in standard agricultural models.

### 🛠️ Actionable Strategy
1. **Regulate Irrigation**: Water deeply but infrequently (1-2 times a week at the base) to prevent root suffocation.
2. **Apply Organic Compost**: Incorporate a 2-inch top-dressing of nitrogen-rich leaf compost or worm castings around the plant base.
3. **Prune Lower Stems**: Trim off lower leaves touching the ground to reduce risk of early blight infection.
"""
        elif "rot" in q or "black" in q:
            confidence = "High"
            summary = """### 📋 Consensus Diagnosis
The primary issue is identified as **Blossom-End Rot**, which is a calcium uptake deficiency caused by uneven watering and root transpiration stress.

### 🎯 Confidence Rating
**High** - Blossom-end rot leaves a highly distinct dry black lesion at the base of developed nightshade fruits.

### 🛠️ Actionable Strategy
1. **Stabilize Watering**: Keep soil evenly damp using organic straw mulches to insulate root zones.
2. **Add Calcium Amendments**: Apply agricultural gypsum or bone meal to the soil to provide accessible calcium.
3. **Avoid Excess Nitrogen**: Do not apply heavy nitrogen fertilizers, as they stimulate leaf growth at the expense of calcium transport to the fruit.
"""
        elif "bug" in q or "pest" in q or "eat" in q or "hole" in q:
            confidence = "Medium"
            summary = """### 📋 Consensus Diagnosis
The panel diagnoses insect chewing damage, likely due to caterpillars (like Hornworms) or climbing beetles.

### 🎯 Confidence Rating
**Medium** - Visual confirmation is needed to identify the exact insect species, but feeding marks point to active foliage pests.

### 🛠️ Actionable Strategy
1. **Handpick at Dusk**: Inspect leaf undersides and hand-remove caterpillars during evening hours.
2. **Create Barriers**: Apply food-grade diatomaceous earth around the base to repel crawling pests.
3. **Biological Repellents**: Plant companion African Marigolds to naturally deter beetles and attract helpful predators.
"""
        else:
            summary = f"""### 📋 Consensus Diagnosis
The panel notes mild physiological stress. In your '{soil}' soil under '{sun}' light, plants require balanced organic fertilization and structured water tables.

### 🎯 Confidence Rating
**Medium** - General diagnostic parameters indicate soil moisture transitions or minor climatic adaptations.

### 🛠️ Actionable Strategy
1. **Organic Top-Dressing**: Apply well-rotted leaf compost or organic mulch to build soil microbial activity.
2. **Water Monitoring**: Ensure watering happens early in the morning to reduce leaf moisture evaporation loss.
3. **Companion Integration**: Introduce diverse companion crops (herbs and flowers) to build local ecological resilience.
"""
        return {
            "confidence": confidence,
            "summary": summary
        }
