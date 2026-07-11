// State Management
let allPlants = [];
let selectedCrops = [];
let lastDesignResponse = null;
let disabledAntagonists = new Set();
let highlightedPlantName = null;
let active3DHighlightHelpers = [];

// ZIP Code Lookup Mapping
const zipCodeInfo = {
    "48195": { city: "Southgate, MI", zone: "Zone 6b" },
    "48133": { city: "Erie, MI", zone: "Zone 6b" },
    "48103": { city: "Ann Arbor, MI", zone: "Zone 6a" },
    "48104": { city: "Ann Arbor, MI", zone: "Zone 6a" },
    "48105": { city: "Ann Arbor, MI", zone: "Zone 6a" },
    "48108": { city: "Ann Arbor, MI", zone: "Zone 6a" }
};

// Crop Yield per Plant lookup (lbs)
function getYieldPerPlant(plant) {
    const name = plant.name.toLowerCase();
    if (name.includes("tree")) return 50;
    if (name.includes("zucchini") || name.includes("squash") || name.includes("pumpkin")) return 10;
    if (name.includes("tomato") || name.includes("cucumber")) return 15;
    if (name.includes("pepper") || name.includes("eggplant")) return 8;
    if (name.includes("potato")) return 5;
    if (name.includes("basil") || name.includes("mint") || name.includes("herb")) return 1;
    return 2;
}

// // Dynamic highly-realistic top-down vector drawings for each crop category
function getPlantSVG(plant) {
    if (!plant || !plant.name) {
        return `<svg viewBox="0 0 100 100" class="botanical-svg"><circle cx="50" cy="50" r="40" fill="#15803d" /></svg>`;
    }
    const name = plant.name.toLowerCase();
    
    // Shared botanical sketch filter and definitions
    const filterDefs = `
        <defs>
            <filter id="botanical-sketch" x="-20%" y="-20%" width="140%" height="140%">
                <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="3" result="noise" />
                <feDisplacementMap in="SourceGraphic" in2="noise" scale="1.3" xChannelSelector="R" yChannelSelector="G" />
            </filter>
            <radialGradient id="sunflower-petal-grad" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stop-color="#fbbf24" stop-opacity="0.9" />
                <stop offset="100%" stop-color="#d97706" stop-opacity="0.8" />
            </radialGradient>
            <radialGradient id="sunflower-petal-light-grad" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stop-color="#fef08a" stop-opacity="0.9" />
                <stop offset="100%" stop-color="#eab308" stop-opacity="0.8" />
            </radialGradient>
            <radialGradient id="tree-leaves-grad-1" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stop-color="#3f6212" stop-opacity="0.9" />
                <stop offset="100%" stop-color="#1a2e05" stop-opacity="0.85" />
            </radialGradient>
            <radialGradient id="tree-leaves-grad-2" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stop-color="#4d7c0f" stop-opacity="0.9" />
                <stop offset="100%" stop-color="#1e3a0a" stop-opacity="0.85" />
            </radialGradient>
            <radialGradient id="tree-leaves-grad-3" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stop-color="#65a30d" stop-opacity="0.9" />
                <stop offset="100%" stop-color="#14532d" stop-opacity="0.8" />
            </radialGradient>
            <radialGradient id="squash-leaf-grad" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stop-color="#2d6a4f" stop-opacity="0.95" />
                <stop offset="100%" stop-color="#1b4332" stop-opacity="0.9" />
            </radialGradient>
            <radialGradient id="watermelon-grad" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stop-color="#52b788" />
                <stop offset="100%" stop-color="#1b4332" />
            </radialGradient>
            <radialGradient id="pumpkin-grad" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stop-color="#f97316" />
                <stop offset="100%" stop-color="#c2410c" />
            </radialGradient>
            <radialGradient id="tomato-leaves-grad" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stop-color="#1e3a0a" />
                <stop offset="100%" stop-color="#0f1f05" />
            </radialGradient>
            <radialGradient id="tomato-fruit-grad" cx="40%" cy="40%" r="50%">
                <stop offset="0%" stop-color="#fca5a5" />
                <stop offset="70%" stop-color="#ef4444" />
                <stop offset="100%" stop-color="#991b1b" />
            </radialGradient>
            <radialGradient id="cucumber-leaf-grad" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stop-color="#344e41" />
                <stop offset="100%" stop-color="#1a3024" />
            </radialGradient>
            <linearGradient id="cuke-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stop-color="#2d6a4f" />
                <stop offset="100%" stop-color="#081c15" />
            </linearGradient>
            <radialGradient id="brassica-leaf-grad" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stop-color="#1e3f20" />
                <stop offset="100%" stop-color="#0b1d0c" />
            </radialGradient>
            <radialGradient id="broc-grad" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stop-color="#386b52" />
                <stop offset="100%" stop-color="#1b4332" />
            </radialGradient>
            <radialGradient id="cauli-grad" cx="40%" cy="40%" r="50%">
                <stop offset="0%" stop-color="#fcfcf9" />
                <stop offset="100%" stop-color="#dcdcd0" />
            </radialGradient>
            <radialGradient id="root-leaf-grad" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stop-color="#556b2f" />
                <stop offset="100%" stop-color="#2f4f4f" />
            </radialGradient>
        </defs>
    `;

    // 1. SUNFLOWER
    if (name.includes("sunflower")) {
        return `
            <svg viewBox="0 0 100 100" class="plant-svg">
                ${filterDefs}
                <g filter="url(#botanical-sketch)">
                    <!-- Organic background shading -->
                    <circle cx="50" cy="50" r="42" fill="rgba(217, 119, 6, 0.05)" />
                    <!-- Outer flower petal ring -->
                    <g fill="url(#sunflower-petal-grad)">
                        ${Array.from({length: 16}).map((_, i) => `
                            <path d="M50 16 C45 32 55 32 50 50 C55 32 45 32 50 16" transform="rotate(${i * 22.5} 50 50)" stroke="#78350f" stroke-width="0.3" />
                        `).join('')}
                    </g>
                    <!-- Inner flower petal ring -->
                    <g fill="url(#sunflower-petal-light-grad)" transform="scale(0.85) translate(8.8 8.8)">
                        ${Array.from({length: 16}).map((_, i) => `
                            <path d="M50 16 C45 32 55 32 50 50 C55 32 45 32 50 16" transform="rotate(${i * 22.5 + 11.25} 50 50)" stroke="#78350f" stroke-width="0.3" />
                        `).join('')}
                    </g>
                    <!-- Dark center disk with fine seed circles -->
                    <circle cx="50" cy="50" r="14" fill="#3d2314" stroke="#26160c" stroke-width="0.8" />
                    <circle cx="50" cy="50" r="10" fill="#2b180d" stroke-dasharray="1,1.5" stroke="#78350f" stroke-width="0.6" />
                </g>
            </svg>
        `;
    }

    // 2. FRUIT TREES (Apple, Peach, Cherry, Pear, Lemon, Orange)
    if (name.includes("tree")) {
        let fruitColor = "#c2410c"; // Peach/Apple default rustic red
        if (name.includes("lemon")) fruitColor = "#eab308"; // Muted yellow
        if (name.includes("orange")) fruitColor = "#d97706"; // Ochre orange
        if (name.includes("peach")) fruitColor = "#fca5a5"; // Peach pink
        if (name.includes("pear")) fruitColor = "#84cc16"; // Pear lime
        
        return `
            <svg viewBox="0 0 100 100" class="plant-svg">
                ${filterDefs}
                <g filter="url(#botanical-sketch)">
                    <!-- Organic shadow base -->
                    <circle cx="50" cy="50" r="45" fill="rgba(40, 60, 20, 0.08)" />
                    <!-- Overlapping leaves -->
                    <circle cx="45" cy="42" r="23" fill="url(#tree-leaves-grad-1)" stroke="#1a2e05" stroke-width="0.3" />
                    <circle cx="56" cy="45" r="21" fill="url(#tree-leaves-grad-2)" stroke="#1e3a0a" stroke-width="0.3" />
                    <circle cx="47" cy="58" r="19" fill="url(#tree-leaves-grad-1)" stroke="#1a2e05" stroke-width="0.3" />
                    <circle cx="51" cy="50" r="17" fill="url(#tree-leaves-grad-3)" stroke="#14532d" stroke-width="0.3" />
                    <!-- Branch structure sketches -->
                    <path d="M50 82 Q51 68 50 62 M50 63 Q42 55 43 51 M50 59 Q58 52 57 47" stroke="#451a03" stroke-width="1.8" stroke-linecap="round" fill="none" opacity="0.8" />
                    
                    <!-- Muted botanical fruit berries -->
                    <g fill="${fruitColor}" stroke="rgba(0,0,0,0.15)" stroke-width="0.3">
                        <circle cx="36" cy="38" r="3.5" />
                        <circle cx="62" cy="41" r="3.5" />
                        <circle cx="44" cy="52" r="3.5" />
                        <circle cx="55" cy="62" r="3.5" />
                        <circle cx="49" cy="32" r="3.5" />
                        <circle cx="59" cy="52" r="3.5" />
                    </g>
                </g>
            </svg>
        `;
    }

    // 3. WATERMELON / PUMPKIN / SQUASH / ZUCCHINI
    if (name.includes("watermelon") || name.includes("squash") || name.includes("zucchini") || name.includes("pumpkin") || name.includes("melon")) {
        let fruitShape = '';
        if (name.includes("watermelon")) {
            fruitShape = `
                <ellipse cx="50" cy="50" rx="14" ry="9.5" fill="url(#watermelon-grad)" stroke="#0f2e1e" stroke-width="0.8" />
                <path d="M37 50 Q50 43 63 50 M38 52 Q50 57 62 52 M39 48 Q50 43 61 48" stroke="#166534" stroke-width="0.8" fill="none" opacity="0.5" />
            `;
        } else if (name.includes("zucchini") || name.includes("squash")) {
            fruitShape = `
                <path d="M41 41 Q50 47 59 53 Q56 57 48 49 Z" fill="#1b4332" stroke="#081c15" stroke-width="0.5" />
                <path d="M47 37 Q55 43 63 49 Q60 53 52 45 Z" fill="#2d6a4f" stroke="#081c15" stroke-width="0.5" />
            `;
        } else if (name.includes("pumpkin")) {
            fruitShape = `
                <circle cx="50" cy="50" r="10.5" fill="url(#pumpkin-grad)" stroke="#7c2d12" stroke-width="0.6" />
                <ellipse cx="50" cy="50" rx="5" ry="10.5" fill="none" stroke="#9a3412" stroke-width="0.5" />
            `;
        }

        return `
            <svg viewBox="0 0 100 100" class="plant-svg">
                ${filterDefs}
                <g filter="url(#botanical-sketch)">
                    <!-- Twisting vine path -->
                    <path d="M15 50 Q30 33 50 50 T85 50 M30 75 Q50 58 70 25" stroke="#40916c" stroke-width="1.2" fill="none" opacity="0.6" />
                    <!-- Lobed textured leaves -->
                    <g fill="url(#squash-leaf-grad)" stroke="#1b4332" stroke-width="0.4">
                        <path d="M25 35 C13 23 8 38 23 43 C33 46 28 36 25 35 Z" />
                        <path d="M75 35 C87 23 92 38 77 43 C67 46 72 36 75 35 Z" />
                        <path d="M50 73 C38 83 62 83 50 67 Z" />
                        <path d="M48 23 C36 12 60 12 48 29 Z" />
                    </g>
                    <!-- Muted ochre flowers -->
                    <polygon points="28,32 32,38 38,38 33,42 35,48 28,44 21,48 23,42 18,38 24,38" fill="#d97706" stroke="#b45309" stroke-width="0.4" />
                    <polygon points="72,32 76,38 82,38 77,42 79,48 72,44 65,48 67,42 62,38 68,38" fill="#d97706" stroke="#b45309" stroke-width="0.4" />
                    ${fruitShape}
                </g>
            </svg>
        `;
    }

    // 4. TOMATO
    if (name.includes("tomato")) {
        return `
            <svg viewBox="0 0 100 100" class="plant-svg">
                ${filterDefs}
                <g filter="url(#botanical-sketch)">
                    <circle cx="50" cy="50" r="28" fill="rgba(40, 60, 20, 0.08)" />
                    <!-- Cage supporting frames -->
                    <circle cx="50" cy="50" r="23" fill="none" stroke="#4b5563" stroke-width="0.8" opacity="0.4" />
                    <circle cx="50" cy="50" r="14" fill="none" stroke="#4b5563" stroke-width="0.8" opacity="0.4" />
                    
                    <!-- Vine leaves -->
                    <g fill="url(#tomato-leaves-grad)" stroke="#0f1f05" stroke-width="0.4">
                        <path d="M50 50 C40 37 28 44 33 30 C41 26 48 38 50 50 Z" />
                        <path d="M50 50 C60 37 72 44 67 30 C59 26 52 38 50 50 Z" />
                        <path d="M50 50 C60 63 72 56 67 70 C59 74 52 62 50 50 Z" />
                        <path d="M50 50 C40 63 28 56 33 70 C41 74 48 62 50 50 Z" />
                    </g>
                    
                    <!-- Ripling red tomatoes -->
                    <g fill="url(#tomato-fruit-grad)" stroke="#7f1d1d" stroke-width="0.4">
                        <circle cx="36" cy="38" r="4.2" />
                        <circle cx="41" cy="33" r="3.2" />
                        <circle cx="64" cy="41" r="4.2" />
                        <circle cx="59" cy="46" r="3.2" />
                        <circle cx="47" cy="62" r="4.2" />
                        <circle cx="53" cy="57" r="3.2" />
                    </g>
                </g>
            </svg>
        `;
    }

    // 5. CUCUMBERS
    if (name.includes("cucumber")) {
        return `
            <svg viewBox="0 0 100 100" class="plant-svg">
                ${filterDefs}
                <g filter="url(#botanical-sketch)">
                    <path d="M20 50 C35 30 65 30 80 50 S35 70 50 85" fill="none" stroke="#2d6a4f" stroke-width="1.0" stroke-dasharray="1,1" />
                    <circle cx="35" cy="42" r="9" fill="url(#cucumber-leaf-grad)" stroke="#1a3024" stroke-width="0.3" />
                    <circle cx="65" cy="58" r="9" fill="url(#cucumber-leaf-grad)" stroke="#1a3024" stroke-width="0.3" />
                    <circle cx="50" cy="30" r="7" fill="url(#cucumber-leaf-grad)" stroke="#1a3024" stroke-width="0.3" />
                    
                    <g fill="url(#cuke-grad)" stroke="#081c15" stroke-width="0.4">
                        <rect x="44" y="42" width="6" height="18" rx="3" transform="rotate(-15 47 51)" />
                        <rect x="58" y="32" width="5" height="15" rx="2.5" transform="rotate(25 60 39)" />
                    </g>
                    <circle cx="43" cy="61" r="1.8" fill="#d97706" />
                    <circle cx="63" cy="29" r="1.5" fill="#d97706" />
                </g>
            </svg>
        `;
    }

    // 6. BROCCOLI / CAULIFLOWER / OKRA
    if (name.includes("broccoli") || name.includes("cauliflower") || name.includes("okra")) {
        let centerObject = '';
        if (name.includes("broccoli")) {
            centerObject = `
                <circle cx="50" cy="50" r="10" fill="url(#broc-grad)" stroke="#1b4332" stroke-width="0.4" />
                <circle cx="47" cy="46" r="4.5" fill="#1b4332" opacity="0.6" />
                <circle cx="53" cy="52" r="4.2" fill="#2d6a4f" opacity="0.6" />
            `;
        } else if (name.includes("cauliflower")) {
            centerObject = `
                <circle cx="50" cy="50" r="9.5" fill="url(#cauli-grad)" stroke="#bbbba0" stroke-width="0.4" />
                <circle cx="48" cy="48" r="4.2" fill="#f4f4f0" opacity="0.8" />
            `;
        } else if (name.includes("okra")) {
            centerObject = `
                <path d="M48 34 Q50 50 46 64 Q50 58 54 34 Z" fill="#84cc16" stroke="#4d7c0f" stroke-width="0.4" />
                <path d="M54 40 Q55 54 52 68 Q56 60 58 40 Z" fill="#4d7c0f" stroke="#365e0d" stroke-width="0.4" />
            `;
        }

        return `
            <svg viewBox="0 0 100 100" class="plant-svg">
                ${filterDefs}
                <g filter="url(#botanical-sketch)">
                    <!-- Wavy brassica outer leaves -->
                    <g fill="url(#brassica-leaf-grad)" stroke="#0b1d0c" stroke-width="0.4">
                        <path d="M50 24 C36 30 36 70 50 76 C32 58 32 42 50 24 Z" />
                        <path d="M50 24 C64 30 64 70 50 76 C68 58 68 42 50 24 Z" />
                        <path d="M24 50 C30 36 70 36 76 50 C58 32 42 32 24 50 Z" />
                        <path d="M24 50 C30 62 70 62 76 50 C58 66 42 66 24 50 Z" />
                    </g>
                    ${centerObject}
                </g>
            </svg>
        `;
    }

    // 7. FLOWERS
    if (name.includes("marigold") || name.includes("flower") || name.includes("nasturtium") || (plant && plant.type === "Flower")) {
        let petalColor = "#d97706"; // warm ochre orange
        let centerColor = "#451a03"; // dark warm center
        if (name.includes("coneflower")) {
            petalColor = "#db2777"; // dark rose coneflower
            centerColor = "#270e02";
        } else if (name.includes("nasturtium")) {
            petalColor = "#dc2626"; // brick red
            centerColor = "#f59e0b"; // warm yellow throat
        }
        
        return `
            <svg viewBox="0 0 100 100" class="plant-svg">
                ${filterDefs}
                <g filter="url(#botanical-sketch)">
                    <circle cx="50" cy="50" r="21" fill="rgba(40, 60, 20, 0.08)" />
                    <path d="M50 50 C38 38 32 48 37 37" stroke="#3f6212" stroke-width="1.0" fill="none" />
                    <path d="M50 50 C62 38 68 48 63 37" stroke="#3f6212" stroke-width="1.0" fill="none" />
                    
                    <!-- Rotated petals -->
                    <g fill="${petalColor}" stroke="rgba(0,0,0,0.12)" stroke-width="0.3">
                        <circle cx="50" cy="39" r="8" />
                        <circle cx="50" cy="61" r="8" />
                        <circle cx="39" cy="50" r="8" />
                        <circle cx="61" cy="50" r="8" />
                        <circle cx="42" cy="42" r="8" />
                        <circle cx="58" cy="42" r="8" />
                        <circle cx="42" cy="58" r="8" />
                        <circle cx="58" cy="58" r="8" />
                    </g>
                    <!-- Center seed head -->
                    <circle cx="50" cy="50" r="6" fill="${centerColor}" stroke="rgba(0,0,0,0.2)" stroke-width="0.4" />
                </g>
            </svg>
        `;
    }

    // 8. ROOT CROPS
    if (name.includes("potato") || name.includes("carrot") || name.includes("beet") || name.includes("onion") || name.includes("radish")) {
        let rootColor = "#451a03"; // Potato brown/umber
        if (name.includes("carrot")) rootColor = "#ea580c"; // Muted orange
        if (name.includes("beet")) rootColor = "#4c0519"; // Wine burgundy
        if (name.includes("radish")) rootColor = "#be185d"; // Muted magenta rose
        if (name.includes("onion")) rootColor = "#e5e7eb"; // White onion bulb
        
        return `
            <svg viewBox="0 0 100 100" class="plant-svg">
                ${filterDefs}
                <g filter="url(#botanical-sketch)">
                    <!-- Organic leaf stems -->
                    <path d="M50 50 Q38 27 35 17 Q50 32 50 50" fill="url(#root-leaf-grad)" stroke="#2f4f4f" stroke-width="0.4" />
                    <path d="M50 50 Q62 27 65 17 Q50 32 50 50" fill="url(#root-leaf-grad)" stroke="#2f4f4f" stroke-width="0.4" />
                    <path d="M50 50 Q44 22 48 12 Q50 27 50 50" fill="url(#root-leaf-grad)" stroke="#2f4f4f" stroke-width="0.4" />
                    <!-- Muted color bulb showing top-down root -->
                    <ellipse cx="50" cy="51" rx="6.5" ry="4" fill="${rootColor}" stroke="rgba(0,0,0,0.15)" stroke-width="0.4" />
                </g>
            </svg>
        `;
    }

    // 9. SPINACH / LETTUCE
    if (name.includes("spinach") || name.includes("lettuce") || name.includes("cabbage")) {
        return `
            <svg viewBox="0 0 100 100" class="plant-svg">
                ${filterDefs}
                <g filter="url(#botanical-sketch)">
                    <!-- Multi-layered botanical greens -->
                    <g fill="url(#spinach-leaf-grad)" stroke="#14532d" stroke-width="0.3">
                        <path d="M50 50 C35 34 53 24 50 50 Z" />
                        <path d="M50 50 C65 34 47 24 50 50 Z" />
                        <path d="M50 50 C33 48 23 66 50 50 Z" />
                        <path d="M50 50 C67 48 77 66 50 50 Z" />
                        <path d="M50 50 C47 68 34 78 50 50 Z" />
                        <path d="M50 50 C54 68 66 78 50 50 Z" />
                    </g>
                    <circle cx="50" cy="50" r="5" fill="#a7f3d0" opacity="0.5" />
                </g>
                <defs>
                    <radialGradient id="spinach-leaf-grad" cx="50%" cy="50%" r="50%">
                        <stop offset="0%" stop-color="#2d6a4f" />
                        <stop offset="100%" stop-color="#1b4332" />
                    </radialGradient>
                </defs>
            </svg>
        `;
    }

    // DEFAULT LEAF ROSETTE
    return `
        <svg viewBox="0 0 100 100" class="plant-svg">
            ${filterDefs}
            <g filter="url(#botanical-sketch)" fill="rgba(40, 90, 60, 0.25)" stroke="#1a3a2a" stroke-width="0.4">
                <path d="M50 50 C42 32 58 32 50 50 Z" />
                <path d="M50 50 C32 42 32 58 50 50 Z" />
                <path d="M50 50 C42 68 58 68 50 50 Z" />
                <path d="M50 50 C68 42 68 58 50 50 Z" />
            </g>
        </svg>
    `;
}

// Generate unique, stable colors for each plant category using HSL
function getPlantColor(plantId) {
    const id = typeof plantId === 'number' ? plantId : 99;
    const hue = (id * 67) % 360; // 67 step for beautiful separation
    return {
        background: `hsla(${hue}, 40%, 12%, 0.85)`,
        border: `hsla(${hue}, 50%, 35%, 1)`,
        text: `hsla(${hue}, 75%, 70%, 1)`
    };
}

// Tab Routing Configuration
const tabs = document.querySelectorAll('.nav-item');
const panes = document.querySelectorAll('.tab-pane');
const tabTitle = document.getElementById('tab-title');
const tabSubtitle = document.getElementById('tab-subtitle');

tabs.forEach(tab => {
    tab.addEventListener('click', () => {
        switchTab(tab.dataset.tab);
    });
});

function switchTab(tabId) {
    let paneId = tabId;
    if (!tabId.endsWith('-tab')) {
        paneId = tabId + '-tab';
    }

    // Remove active classes
    tabs.forEach(t => t.classList.remove('active'));
    panes.forEach(p => p.classList.remove('active'));

    // Set active nav link
    const targetTab = document.querySelector(`[data-tab="${paneId}"]`);
    if (targetTab) {
        targetTab.classList.add('active');
    }

    // Set active content panel
    const targetPane = document.getElementById(paneId);
    if (targetPane) {
        targetPane.classList.add('active');
    }

    updateHeaders(paneId);

    if (paneId === 'dashboard-tab') {
        setTimeout(resize3D, 50);
    }
}

function updateHeaders(tabId) {
    switch (tabId) {
        case 'dashboard-tab':
            tabTitle.textContent = "Dashboard";
            tabSubtitle.textContent = "Welcome back! Here is your garden status.";
            break;
        case 'design-tab':
            tabTitle.textContent = "Garden Design";
            tabSubtitle.textContent = "Configure dimensions, soil types, and draw planting layouts.";
            break;
        case 'recs-tab':
            tabTitle.textContent = "Recommendations";
            tabSubtitle.textContent = "Detailed companion links, antagonist alerts, and expert AI advice.";
            break;
        case 'calendar-tab':
            tabTitle.textContent = "Calendar & Timeline";
            tabSubtitle.textContent = "Personalized seasonal calendar and planting logs.";
            break;
        case 'settings-tab':
            tabTitle.textContent = "Settings";
            tabSubtitle.textContent = "Configure connection models and helper rules.";
            break;
    }
}

// 3D/2D View Toggle
// 3D/2D View Toggle Segmented Control
const btnView3D = document.getElementById('btn-view-3d');
const btnView2D = document.getElementById('btn-view-2d');
const gardenGrid = document.getElementById('garden-grid');
const cadViewport = document.getElementById('cad-viewport-container');
const canvas3dContainer = document.getElementById('3d-canvas-container');

// Global cache for 3D state
let currentGridArray = null;
let currentWidth = 20;
let currentHeight = 30;
let is3DMode = true;
let settingsDimUnit = localStorage.getItem('settingsDimUnit') || 'ft';
let settingsWeightUnit = localStorage.getItem('settingsWeightUnit') || 'lbs';

function switchViewMode(mode3d) {
    is3DMode = mode3d;
    if (is3DMode) {
        if (btnView3D) btnView3D.classList.add('active');
        if (btnView2D) btnView2D.classList.remove('active');
        
        cadViewport.classList.add('hidden');
        canvas3dContainer.classList.remove('hidden');
        
        init3D();
        resize3D();
        trigger3DRender();
        update3DCompass();
    } else {
        if (btnView3D) btnView3D.classList.remove('active');
        if (btnView2D) btnView2D.classList.add('active');
        
        cadViewport.classList.remove('hidden');
        canvas3dContainer.classList.add('hidden');
        
        // Deactivate 3D layout edit mode when leaving the 3D viewport
        if (isEditModeActive) {
            isEditModeActive = false;
            const editBtn = document.getElementById('btn-edit-mode');
            if (editBtn) {
                editBtn.classList.remove('active');
                editBtn.innerHTML = '<i class="fa-solid fa-pencil" style="margin-right: 4px;"></i> Edit Layout';
                editBtn.style.borderColor = 'rgba(16, 185, 129, 0.4)';
                editBtn.style.color = '';
            }
            selectedPlantGroups = [];
            update3DSelectionHighlights();
        }

        update3DCompass();
        renderLayoutGrid(currentWidth, currentHeight);
    }
}

if (btnView3D) {
    btnView3D.addEventListener('click', () => switchViewMode(true));
}
if (btnView2D) {
    btnView2D.addEventListener('click', () => switchViewMode(false));
}

// Sun Path Animation Toggle
const btnSunAnimate = document.getElementById('btn-sun-animate');
if (btnSunAnimate) {
    btnSunAnimate.addEventListener('click', () => {
        isSunPathActive = !isSunPathActive;
        isSunAnimationPlaying = isSunPathActive;
        
        if (isSunPathActive) {
            btnSunAnimate.classList.add('active');
            // Make sure we are in 3D Mode to see the sun path
            if (!is3DMode) {
                switchViewMode(true);
            }
            drawSunPath(currentWidth || 30, currentHeight || 30);
            
            // Adjust camera orbit and zoom out to frame the celestial sun path in view
            if (camera3d && cameraTarget3d) {
                const target = cameraTarget3d || new THREE.Vector3(0, 0, 0);
                const currentDist = camera3d.position.distanceTo(target);
                const maxDim = Math.max(currentWidth || 30, currentHeight || 30);
                const newDist = Math.max(currentDist, maxDim * 2.1);
                
                // Tilt the camera up (flatter angle) to look at the sky/horizon
                cameraOrbitAngleX = -Math.PI / 8; // -22.5 degrees (looking towards horizon)
                
                // Calculate position relative to target based on cameraOrbitAngleY and cameraOrbitAngleX
                const x = target.x + newDist * Math.sin(cameraOrbitAngleY) * Math.cos(cameraOrbitAngleX);
                const y = target.y + newDist * Math.sin(-cameraOrbitAngleX);
                const z = target.z + newDist * Math.cos(cameraOrbitAngleY) * Math.cos(cameraOrbitAngleX);
                
                camera3d.position.set(x, y, z);
                camera3d.lookAt(target);
                
                if (visualsParentGroup) {
                    visualsParentGroup.rotation.set(cameraOrbitAngleX, cameraOrbitAngleY, 0);
                }
                update3DCompass();
            }

            // Show overlays
            const solarControls = document.getElementById('3d-solar-controls');
            const solarClock = document.getElementById('3d-solar-clock');
            if (solarControls) solarControls.style.display = 'flex';
            if (solarClock) solarClock.style.display = 'flex';
        } else {
            btnSunAnimate.classList.remove('active');
            // Hide overlays
            const solarControls = document.getElementById('3d-solar-controls');
            const solarClock = document.getElementById('3d-solar-clock');
            if (solarControls) solarControls.style.display = 'none';
            if (solarClock) solarClock.style.display = 'none';

            // Clear path & sphere
            if (sunArcLine) {
                if (visualsParentGroup) visualsParentGroup.remove(sunArcLine);
                sunArcLine = null;
            }
            if (sunSphereMesh) {
                if (visualsParentGroup) visualsParentGroup.remove(sunSphereMesh);
                sunSphereMesh = null;
            }
            // Reset lights and colors to default static states
            if (dirLight) {
                dirLight.position.set(20, 50, 20);
                dirLight.intensity = 0.75;
                dirLight.color.setRGB(1.0, 1.0, 1.0);
                dirLight.castShadow = true;
            }
            const ambient = scene3d?.children.find(c => c.isAmbientLight);
            if (ambient) {
                ambient.intensity = 0.45;
            }
        }
        
        // Request a render update to commit changes
        if (scene3d && camera3d && renderer3d) {
            renderer3d.render(scene3d, camera3d);
        }
    });
}

// Wire Solar Arc range input slider controls
const sliderShadowStretch = document.getElementById('slider-shadow-stretch');
const lblShadowStretch = document.getElementById('lbl-shadow-stretch');
if (sliderShadowStretch && lblShadowStretch) {
    sliderShadowStretch.addEventListener('input', (e) => {
        shadowStretchVal = parseFloat(e.target.value);
        lblShadowStretch.textContent = `${shadowStretchVal.toFixed(1)}x`;
    });
}

const sliderShadowContrast = document.getElementById('slider-shadow-contrast');
const lblShadowContrast = document.getElementById('lbl-shadow-contrast');
if (sliderShadowContrast && lblShadowContrast) {
    sliderShadowContrast.addEventListener('input', (e) => {
        const valPercent = parseInt(e.target.value);
        shadowContrastVal = valPercent / 100;
        lblShadowContrast.textContent = `${valPercent}%`;
    });
}

const sliderSunSpeed = document.getElementById('slider-sun-speed');
const lblSunSpeed = document.getElementById('lbl-sun-speed');
if (sliderSunSpeed && lblSunSpeed) {
    sliderSunSpeed.addEventListener('input', (e) => {
        sunSpeedVal = parseFloat(e.target.value);
        lblSunSpeed.textContent = `${sunSpeedVal.toFixed(1)}x`;
    });
}

function update3DCompass() {
    const needle = document.getElementById('compass-needle');
    const outerRing = document.getElementById('compass-outer-ring');
    const angleDisplay = document.getElementById('compass-angle-display');
    if (!needle) return;

    if (is3DMode) {
        // Outer Ring shows Environment Cardinal markings: N always points to screenspace North
        const viewNorthAngleDeg = -cameraOrbitAngleY * 180 / Math.PI;
        if (outerRing) {
            outerRing.style.transform = `rotate(${viewNorthAngleDeg}deg)`;
        }

        // Needle points to Garden Orientation relative to screenspace: viewNorth + gardenOrientationAngle
        const needleAngle = viewNorthAngleDeg + gardenOrientationAngle;
        needle.style.transform = `rotate(${needleAngle}deg)`;

        // Show angle text display
        if (angleDisplay) {
            const displayAngle = Math.round((gardenOrientationAngle % 360 + 360) % 360);
            let cardinalText = "N";
            if (displayAngle > 22.5 && displayAngle <= 67.5) cardinalText = "NE";
            else if (displayAngle > 67.5 && displayAngle <= 112.5) cardinalText = "E";
            else if (displayAngle > 112.5 && displayAngle <= 157.5) cardinalText = "SE";
            else if (displayAngle > 157.5 && displayAngle <= 202.5) cardinalText = "S";
            else if (displayAngle > 202.5 && displayAngle <= 247.5) cardinalText = "SW";
            else if (displayAngle > 247.5 && displayAngle <= 292.5) cardinalText = "W";
            else if (displayAngle > 292.5 && displayAngle <= 337.5) cardinalText = "NW";
            angleDisplay.textContent = `Orient: ${displayAngle}° ${cardinalText}`;
        }
    } else {
        needle.style.transform = 'rotate(0deg)';
        if (outerRing) outerRing.style.transform = 'rotate(0deg)';
        if (angleDisplay) angleDisplay.textContent = 'Orient: 0° N';
    }
}
function initCompassDrag() {
    const dial = document.querySelector('.compass-dial');
    const widget = document.querySelector('.compass-widget');
    if (!dial || !widget) return;

    let isDraggingDial = false;

    dial.addEventListener('mousedown', (e) => {
        e.stopPropagation();
        e.preventDefault();
        isDraggingDial = true;
        document.body.style.cursor = 'grabbing';
    });

    window.addEventListener('mousemove', (e) => {
        if (!isDraggingDial) return;

        const rect = widget.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        const dx = e.clientX - centerX;
        const dy = e.clientY - centerY;

        let angleRad = Math.atan2(dy, dx); // radians
        let angleDeg = angleRad * 180 / Math.PI;

        // Shift by 90 degrees so that 12 o'clock (North) is 0 degrees
        let orientationDeg = (angleDeg + 90 + 360) % 360;

        // Calculate physical garden orientation relative to North
        const viewNorthAngleDeg = -cameraOrbitAngleY * 180 / Math.PI;
        gardenOrientationAngle = (orientationDeg - viewNorthAngleDeg + 360) % 360;

        // Update gardenGroup3d rotation (negative to rotate clockwise matching compass headings)
        if (gardenGroup3d) {
            gardenGroup3d.rotation.y = -gardenOrientationAngle * Math.PI / 180;
        }

        // Sync 2D CAD North Arrow
        const cadNorthArrowIcon = document.querySelector('#cad-north-arrow i');
        if (cadNorthArrowIcon) {
            cadNorthArrowIcon.style.transform = `rotate(${-gardenOrientationAngle}deg)`;
        }

        update3DCompass();
        
        // Request frame update
        if (scene3d && camera3d && renderer3d) {
            renderer3d.render(scene3d, camera3d);
        }
    });

    window.addEventListener('mouseup', () => {
        if (isDraggingDial) {
            isDraggingDial = false;
            document.body.style.cursor = '';
        }
    });
}

function update3DSelectionHighlights() {
    // Clear previous helper meshes
    selectionHelpers3D.forEach(helper => {
        scene3d.remove(helper);
        if (helper.geometry) helper.geometry.dispose();
        if (helper.material) helper.material.dispose();
    });
    selectionHelpers3D = [];

    if (!isEditModeActive || !scene3d) return;

    selectedPlantGroups.forEach(group => {
        // 1. BoxHelper outline for high perspective visibility
        const boxHelper = new THREE.BoxHelper(group, 0x34d399);
        scene3d.add(boxHelper);
        selectionHelpers3D.push(boxHelper);

        // 2. Glowing ground footprint ring (matches actual plant diameter)
        const diameter = group.userData.spread || 1;
        const ringGeo = new THREE.RingGeometry(diameter/2 * 0.96, diameter/2 * 1.04, 32);
        ringGeo.rotateX(-Math.PI / 2);
        const ringMat = new THREE.MeshBasicMaterial({ color: 0x34d399, side: THREE.DoubleSide });
        const ring = new THREE.Mesh(ringGeo, ringMat);
        ring.position.set(group.position.x, 0.04, group.position.z);
        scene3d.add(ring);
        selectionHelpers3D.push(ring);
    });
}

function getLatitudeFromZip(zipString) {
    if (!zipString || zipString.length < 5) return 40;
    const firstDigit = zipString.charAt(0);
    switch (firstDigit) {
        case '0': return 42; // Northeast (NJ/NY/MA/ME/VT/NH)
        case '1': return 41; // NY/PA/DE
        case '2': return 37; // MD/VA/NC/SC/WV
        case '3': return 31; // FL/GA/AL/MS/TN
        case '4': return 42; // MI/OH/IN/KY
        case '5': return 45; // WI/MN/ND/SD/MT/IA
        case '6': return 40; // IL/MO/KS/NE
        case '7': return 32; // TX/OK/AR/LA
        case '8': return 38; // CO/WY/ID/UT/NV/AZ/NM
        case '9': return 38; // CA/OR/WA/AK/HI
        default: return 40;
    }
}

function createNorthArrowTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');
    
    // Clear to transparent
    ctx.clearRect(0, 0, 128, 128);
    
    // Draw red triangle pointer
    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.moveTo(64, 4); // Tip
    ctx.lineTo(20, 124); // Bottom Left
    ctx.lineTo(108, 124); // Bottom Right
    ctx.closePath();
    ctx.fill();
    
    // Draw black N letter in the middle
    ctx.fillStyle = '#000000';
    ctx.font = 'bold 55px Outfit, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('N', 64, 80);
    
    const texture = new THREE.CanvasTexture(canvas);
    texture.minFilter = THREE.LinearFilter;
    return texture;
}

function createStaticEnvironmentNorthArrow(radius) {
    const group = new THREE.Group();
    group.name = "envCompassRose";
    
    // 1. Outer Ring
    const ringGeo = new THREE.RingGeometry(radius * 0.98, radius * 1.02, 64);
    ringGeo.rotateX(-Math.PI / 2);
    const ringMat = new THREE.MeshBasicMaterial({
        color: 0x334155, // slate-700
        transparent: true,
        opacity: 0.35,
        side: THREE.DoubleSide
    });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    group.add(ring);

    // 2. North Pointer (triangle pointing North with black "N")
    const arrowTex = createNorthArrowTexture();
    const arrowGeo = new THREE.PlaneGeometry(radius * 0.16, radius * 0.12);
    arrowGeo.rotateX(-Math.PI / 2);
    const arrowMat = new THREE.MeshBasicMaterial({
        map: arrowTex,
        transparent: true,
        side: THREE.DoubleSide
    });
    const arrow = new THREE.Mesh(arrowGeo, arrowMat);
    // Position slightly above the ring (0.05 height) to prevent Z-fighting artifacts
    arrow.position.set(0, 0.05, -radius * 1.02);
    group.add(arrow);

    // 3. Central crosshairs (North-South, East-West lines)
    const lineMat = new THREE.LineBasicMaterial({
        color: 0x334155,
        transparent: true,
        opacity: 0.2
    });
    
    const nsPoints = [new THREE.Vector3(0, 0.01, -radius), new THREE.Vector3(0, 0.01, radius)];
    const nsGeo = new THREE.BufferGeometry().setFromPoints(nsPoints);
    const nsLine = new THREE.Line(nsGeo, lineMat);
    group.add(nsLine);

    const ewPoints = [new THREE.Vector3(-radius, 0.01, 0), new THREE.Vector3(radius, 0.01, 0)];
    const ewGeo = new THREE.BufferGeometry().setFromPoints(ewPoints);
    const ewLine = new THREE.Line(ewGeo, lineMat);
    group.add(ewLine);

    return group;
}

function drawSunPath(width, height) {
    // Clear old sun path if they exist
    if (sunArcLine) {
        if (visualsParentGroup) visualsParentGroup.remove(sunArcLine);
        if (sunArcLine.geometry) sunArcLine.geometry.dispose();
        if (sunArcLine.material) sunArcLine.material.dispose();
        sunArcLine = null;
    }
    if (sunSphereMesh) {
        if (visualsParentGroup) visualsParentGroup.remove(sunSphereMesh);
        if (sunSphereMesh.geometry) sunSphereMesh.geometry.dispose();
        if (sunSphereMesh.material) sunSphereMesh.material.dispose();
        sunSphereMesh = null;
    }

    if (!isSunPathActive || !scene3d || !visualsParentGroup) return;

    const zipInput = document.getElementById('input-zip')?.value || "48195";
    const latitude = getLatitudeFromZip(zipInput);
    const latRad = latitude * Math.PI / 180;
    
    const radius = Math.max(width, height) * 1.5; // Radius scaled to garden size!
    const arcPoints = [];

    // Arc from sunrise (t=0) to sunset (t=PI)
    for (let t = 0; t <= Math.PI + 0.01; t += 0.05) {
        const x = -radius * Math.cos(t);
        const y = radius * Math.sin(t) * Math.cos(latRad);
        const z = radius * Math.sin(t) * Math.sin(latRad); // Deflect towards South (+Z)
        arcPoints.push(new THREE.Vector3(x, y, z));
    }

    const arcGeo = new THREE.BufferGeometry().setFromPoints(arcPoints);
    const arcMat = new THREE.LineDashedMaterial({
        color: 0xf59e0b,
        dashSize: 1.5,
        gapSize: 0.8,
        transparent: true,
        opacity: 0.6
    });
    sunArcLine = new THREE.Line(arcGeo, arcMat);
    sunArcLine.computeLineDistances();
    visualsParentGroup.add(sunArcLine);

    // Sun Sphere
    const sunGeo = new THREE.SphereGeometry(radius * 0.04, 16, 16);
    const sunMat = new THREE.MeshBasicMaterial({ color: 0xffd700 });
    sunSphereMesh = new THREE.Mesh(sunGeo, sunMat);
    
    // Position at noon initially (t = PI / 2)
    const initX = 0;
    const initY = radius * Math.cos(latRad);
    const initZ = radius * Math.sin(latRad);
    sunSphereMesh.position.set(initX, initY, initZ);
    visualsParentGroup.add(sunSphereMesh);

    if (dirLight) {
        dirLight.position.set(initX, initY / shadowStretchVal, initZ);
        dirLight.castShadow = true;
    }
}

// Load Plants on initialization
async function loadPlants() {
    try {
        const response = await fetch('/api/v1/plants');
        if (response.ok) {
            allPlants = await response.json();
            console.log(`Loaded ${allPlants.length} plants successfully.`);
        } else {
            console.error("Failed to load plants from database.");
        }
    } catch (e) {
        console.error("Network error fetching plants database:", e);
    }
}

// Live Search & Autocomplete
const cropSearch = document.getElementById('crop-search');
const cropSuggestions = document.getElementById('crop-suggestions');
const selectedCropsContainer = document.getElementById('selected-crops');

let activeSuggestionIndex = -1;
let matchingSuggestions = [];

cropSearch.addEventListener('input', () => {
    const query = cropSearch.value.trim().toLowerCase();
    cropSuggestions.innerHTML = '';
    activeSuggestionIndex = -1;
    matchingSuggestions = [];
    
    if (!query) {
        cropSuggestions.classList.add('hidden');
        return;
    }

    // Filter matching plants from global database
    const matches = allPlants.filter(p => 
        p.name.toLowerCase().includes(query) && 
        !selectedCrops.some(sc => sc.id === p.id)
    ).slice(0, 8);

    matchingSuggestions = [...matches];

    matches.forEach((plant, index) => {
        const div = document.createElement('div');
        div.className = 'suggestion-item';
        div.dataset.index = index;
        div.textContent = `${plant.name} (${plant.type})`;
        
        div.addEventListener('click', () => {
            addCropTag(plant);
            cropSearch.value = '';
            cropSuggestions.classList.add('hidden');
            activeSuggestionIndex = -1;
        });

        div.addEventListener('mouseenter', () => {
            activeSuggestionIndex = index;
            updateSuggestionsHighlighting();
        });
        
        cropSuggestions.appendChild(div);
    });

    // Add dynamic AI-powered plant creation option at the bottom
    const addCustomDiv = document.createElement('div');
    addCustomDiv.className = 'suggestion-item custom-add-item';
    addCustomDiv.dataset.index = matches.length;
    addCustomDiv.style.borderTop = '1px solid var(--border-color)';
    addCustomDiv.style.color = 'var(--accent-emerald)';
    addCustomDiv.style.fontWeight = '700';
    addCustomDiv.innerHTML = `✨ Add "${cropSearch.value.trim()}" using GardenAI...`;

    const customQuery = cropSearch.value.trim();
    matchingSuggestions.push({ isCustomAddTrigger: true, name: customQuery });

    const triggerCustomAdd = async () => {
        addCustomDiv.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Researching botanical data...';
        addCustomDiv.style.pointerEvents = 'none';
        try {
            const response = await fetch('/api/v1/plants/custom', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: customQuery })
            });
            if (response.ok) {
                const newPlant = await response.json();
                allPlants.push(newPlant);
                addCropTag(newPlant);
                cropSearch.value = '';
                cropSuggestions.classList.add('hidden');
                activeSuggestionIndex = -1;
            } else {
                alert("Failed to analyze plant details. Try a different name.");
                addCustomDiv.innerHTML = `✨ Add "${customQuery}" using GardenAI...`;
                addCustomDiv.style.pointerEvents = 'auto';
            }
        } catch (err) {
            alert("Connection error searching botanical catalog.");
            addCustomDiv.innerHTML = `✨ Add "${customQuery}" using GardenAI...`;
            addCustomDiv.style.pointerEvents = 'auto';
        }
    };

    addCustomDiv.addEventListener('click', triggerCustomAdd);
    addCustomDiv.addEventListener('mouseenter', () => {
        activeSuggestionIndex = matches.length;
        updateSuggestionsHighlighting();
    });

    cropSuggestions.appendChild(addCustomDiv);
    cropSuggestions.classList.remove('hidden');
});

// Update suggestions highlight state
function updateSuggestionsHighlighting() {
    const items = cropSuggestions.querySelectorAll('.suggestion-item');
    items.forEach((item, idx) => {
        if (idx === activeSuggestionIndex) {
            item.classList.add('highlighted');
            item.scrollIntoView({ block: 'nearest' });
        } else {
            item.classList.remove('highlighted');
        }
    });
}

// Keyboard arrow navigation and Enter selection
cropSearch.addEventListener('keydown', (e) => {
    const isVisible = !cropSuggestions.classList.contains('hidden');
    if (!isVisible || matchingSuggestions.length === 0) return;

    switch (e.key) {
        case 'ArrowDown':
            e.preventDefault();
            activeSuggestionIndex = (activeSuggestionIndex + 1) % matchingSuggestions.length;
            updateSuggestionsHighlighting();
            break;
            
        case 'ArrowUp':
            e.preventDefault();
            activeSuggestionIndex = activeSuggestionIndex - 1;
            if (activeSuggestionIndex < 0) {
                activeSuggestionIndex = matchingSuggestions.length - 1;
            }
            updateSuggestionsHighlighting();
            break;
            
        case 'Enter':
            if (activeSuggestionIndex >= 0 && activeSuggestionIndex < matchingSuggestions.length) {
                e.preventDefault();
                const selected = matchingSuggestions[activeSuggestionIndex];
                if (selected.isCustomAddTrigger) {
                    const customBtn = cropSuggestions.querySelector('.custom-add-item');
                    if (customBtn) customBtn.click();
                } else {
                    addCropTag(selected);
                    cropSearch.value = '';
                    cropSuggestions.classList.add('hidden');
                    activeSuggestionIndex = -1;
                }
            }
            break;
            
        case 'Escape':
            cropSuggestions.classList.add('hidden');
            activeSuggestionIndex = -1;
            cropSearch.blur();
            break;
    }
});

// Dismiss suggestions when clicking outside
document.addEventListener('click', (e) => {
    if (!cropSearch.contains(e.target) && !cropSuggestions.contains(e.target)) {
        cropSuggestions.classList.add('hidden');
        activeSuggestionIndex = -1;
    }
});


// Add Crop Tag
function addCropTag(plant) {
    const nameLower = plant.name.toLowerCase();
    const isTree = nameLower.includes("tree") || nameLower.includes("chestnut") || nameLower.includes("walnut") || nameLower.includes("oak") || nameLower.includes("maple") || nameLower.includes("pecan") || nameLower.includes("paulownia") || (plant.type && plant.type.toLowerCase().includes("tree"));
    const defaultQty = isTree ? 1 : (nameLower.includes("zucchini") || nameLower.includes("squash") ? 4 : 6);
    let yieldPer = getYieldPerPlant(plant);
    if (settingsWeightUnit === 'kg') {
        yieldPer = yieldPer * 0.453592;
    }
    
    // Prevent duplicate entries
    if (selectedCrops.some(sc => sc.id === plant.id)) return;
    
    selectedCrops.push({
        ...plant,
        quantity: defaultQty,
        yield: defaultQty * yieldPer,
        yieldPerPlant: yieldPer,
        manuallyAdded: true
    });
    renderCropTags();
}

// Presets Configuration representing 12 diverse plans for cooks, researchers, and farmers
const presetsConfig = {
    pizza: [
        { query: "Beefsteak Tomato", weight: 0.4 },
        { query: "Genovese Basil", weight: 0.2 },
        { query: "Italian Oregano", weight: 0.2 },
        { query: "Bell Pepper", weight: 0.2 }
    ],
    salad: [
        { query: "Loose Leaf Lettuce", weight: 0.3 },
        { query: "Baby Leaf Spinach", weight: 0.3 },
        { query: "Arugula Lettuce", weight: 0.2 },
        { query: "Curly-leaf Parsley", weight: 0.2 }
    ],
    berry: [
        { query: "Albion Strawberry", weight: 0.4 },
        { query: "Caroline Raspberry", weight: 0.3 },
        { query: "Bluecrop Blueberry", weight: 0.3 }
    ],
    stew: [
        { query: "Danvers Carrot", weight: 0.25 },
        { query: "Yukon Gold Potato", weight: 0.25 },
        { query: "Yellow Onion", weight: 0.2 },
        { query: "Common Thyme", weight: 0.15 },
        { query: "Arp Rosemary", weight: 0.15 }
    ],
    orchard: [
        { query: "Gala Apple Tree", weight: 0.4 },
        { query: "Redhaven Peach Tree", weight: 0.3 },
        { query: "Bartlett Pear Tree", weight: 0.3 }
    ],
    salsa: [
        { query: "Cherokee Purple Tomato", weight: 0.4 },
        { query: "Cayenne Pepper", weight: 0.2 },
        { query: "Coriander Cilantro", weight: 0.2 },
        { query: "Red Onion", weight: 0.2 }
    ],
    wellness: [
        { query: "English Lavender", weight: 0.3 },
        { query: "Peppermint Mint", weight: 0.3 },
        { query: "Jacob Cline Bee Balm", weight: 0.2 },
        { query: "Common Yarrow", weight: 0.2 }
    ],
    pollinator: [
        { query: "Autumn Beauty Sunflower", weight: 0.3 },
        { query: "Common Milkweed", weight: 0.3 },
        { query: "Jacob Cline Bee Balm", weight: 0.2 },
        { query: "English Lavender", weight: 0.2 }
    ],
    threesisters: [
        { query: "Acorn Squash", weight: 0.4 },
        { query: "Black Bean", weight: 0.3 },
        { query: "Autumn Beauty Sunflower", weight: 0.3 }
    ],
    supergreens: [
        { query: "Baby Leaf Spinach", weight: 0.3 },
        { query: "Calabrese Broccoli", weight: 0.3 },
        { query: "Loose Leaf Lettuce", weight: 0.2 },
        { query: "Bok Choy Cabbage", weight: 0.2 }
    ],
    covercrop: [
        { query: "Garden Pea", weight: 0.4 },
        { query: "Black Bean", weight: 0.3 },
        { query: "Common Yarrow", weight: 0.3 }
    ],
    nitrofix: [
        { query: "Garden Pea", weight: 0.3 },
        { query: "Snow Pea", weight: 0.3 },
        { query: "Black Bean", weight: 0.2 },
        { query: "Chickpea Pea", weight: 0.2 }
    ]
};

// Human-readable descriptions for all 12 preset plans
const presetDescriptions = {
    pizza: {
        title: "🍕 Pizza Sauce Production",
        desc: "Designed for cooks wanting rich, flavorful tomato sauce, sweet bell peppers, oregano, and fresh basil.",
        plants: ["Beefsteak Tomato", "Genovese Basil", "Italian Oregano", "Bell Pepper"]
    },
    salad: {
        title: "🥗 Salad Greens",
        desc: "Fast-growing, tender leaf greens, baby spinach, arugula, and curly parsley for fresh summer harvesting.",
        plants: ["Loose Leaf Lettuce", "Baby Leaf Spinach", "Arugula Lettuce", "Curly-leaf Parsley"]
    },
    berry: {
        title: "🍓 Berry Patch",
        desc: "A sweet mix of perennial berry shrubs and strawberries for summer dessert harvesting.",
        plants: ["Albion Strawberry", "Caroline Raspberry", "Bluecrop Blueberry"]
    },
    stew: {
        title: "🍲 Stew Staples",
        desc: "Hearty root crops, onions, and woodsy aromatic culinary herbs for slow-cooked winter dishes.",
        plants: ["Danvers Carrot", "Yukon Gold Potato", "Yellow Onion", "Common Thyme", "Arp Rosemary"]
    },
    orchard: {
        title: "🍎 Fruit Orchard",
        desc: "Perennial fruit trees providing fresh tree fruits. Perfect for canopy layers in agroforestry layouts.",
        plants: ["Gala Apple Tree", "Redhaven Peach Tree", "Bartlett Pear Tree"]
    },
    salsa: {
        title: "🌶️ Salsa Garden",
        desc: "A colorful, spicy assembly of dark heirloom tomatoes, hot peppers, cilantro, and sweet red onions.",
        plants: ["Cherokee Purple Tomato", "Cayenne Pepper", "Coriander Cilantro", "Red Onion"]
    },
    wellness: {
        title: "🩹 Wellness & Medicinal",
        desc: "Soothing, aromatic herbs and flowers traditionally used for teas, essential oils, and health topicals.",
        plants: ["English Lavender", "Peppermint Mint", "Jacob Cline Bee Balm", "Common Yarrow"]
    },
    pollinator: {
        title: "🦋 Pollinator Haven",
        desc: "Showy wildflowers and host plants selected to feed native bees, monarchs, and ladybugs.",
        plants: ["Autumn Beauty Sunflower", "Common Milkweed", "Jacob Cline Bee Balm", "English Lavender"]
    },
    threesisters: {
        title: "🌽 Three Sisters",
        desc: "Traditional companion setup using climbing beans (nitrogen fixer), squash (ground mulch), and sunflowers (vertical support).",
        plants: ["Acorn Squash", "Black Bean", "Autumn Beauty Sunflower"]
    },
    supergreens: {
        title: "🥬 Super Greens",
        desc: "Iron-rich, dense cruciferous greens and cabbage varieties engineered for high nutrient density.",
        plants: ["Baby Leaf Spinach", "Calabrese Broccoli", "Loose Leaf Lettuce", "Bok Choy Cabbage"]
    },
    covercrop: {
        title: "🍀 Cover Crops",
        desc: "Nitrogen-building leguminous vines and yarrow designed to suppress weeds and protect fallow soil beds.",
        plants: ["Garden Pea", "Black Bean", "Common Yarrow"]
    },
    nitrofix: {
        title: "🧪 Nitrogen Fix",
        desc: "Dedicated pulse and pea cluster optimized to return essential nitrogen compounds back into poor soil beds.",
        plants: ["Garden Pea", "Snow Pea", "Black Bean", "Chickpea Pea"]
    }
};

// Initialize multi-select presets UI logic
// Function to update Selected Presets Badge Pills (Creative and Space-saving)
function updatePresetBadges() {
    const container = document.getElementById('presets-badges-container');
    if (!container) return;
    container.innerHTML = '';
    const presetCards = document.querySelectorAll('.custom-dropdown-menu#presets-dropdown-menu .preset-card');
    const activeCards = Array.from(presetCards).filter(c => c.querySelector('.preset-toggle').checked);
    
    if (activeCards.length === 0) {
        document.getElementById('presets-dropdown-placeholder').textContent = "Select Plans...";
        return;
    }
    
    document.getElementById('presets-dropdown-placeholder').textContent = `${activeCards.length} Plan(s) Selected`;
    
    activeCards.forEach(c => {
        const labelText = c.querySelector('span').textContent;
        const pctInput = c.querySelector('.preset-pct');
        const pctVal = pctInput ? pctInput.value : 50;
        
        const pill = document.createElement('div');
        pill.className = 'selected-pill';
        pill.style.cssText = 'display: inline-flex; align-items: center; gap: 6px; padding: 4px 10px; background: rgba(16,185,129,0.12); border: 1px solid var(--accent-emerald); color: var(--text-primary); border-radius: 12px; font-size: 11px; font-weight: 600; box-shadow: var(--shadow-sm);';
        
        pill.innerHTML = `
            <span>${labelText}</span>
            <input type="number" class="preset-pill-pct" value="${pctVal}" min="5" max="100" style="width: 38px; height: 16px; padding: 0 2px; text-align: center; border: 1px solid rgba(255,255,255,0.2); background: rgba(0,0,0,0.4); color: #fff; font-size: 10px; border-radius: var(--radius-sm); box-sizing: border-box;">
            <span style="font-size: 9px; color: var(--text-secondary); margin-left:-2px;">%</span>
            <i class="fa-solid fa-circle-xmark remove-pill" style="cursor: pointer; opacity: 0.7; font-size: 12px; margin-left: 2px;"></i>
        `;
        
        // Sync pill input value back to dropdown input
        const pillInput = pill.querySelector('.preset-pill-pct');
        if (pctInput && pillInput) {
            pillInput.addEventListener('input', (e) => {
                pctInput.value = e.target.value;
                pctInput.dispatchEvent(new Event('input'));
                if (!isAutoBalanceEnabled) {
                    applySelectedPresets();
                }
            });
        }
        
        // Remove pill handler
        pill.querySelector('.remove-pill').addEventListener('click', (e) => {
            e.stopPropagation();
            const cb = c.querySelector('.preset-toggle');
            if (cb) {
                cb.checked = false;
                cb.dispatchEvent(new Event('change'));
            }
        });
        
        container.appendChild(pill);
    });
}

function initMultiPresets() {
    const selectBox = document.getElementById('presets-dropdown-select');
    const menu = document.getElementById('presets-dropdown-menu');
    const presetCards = menu.querySelectorAll('.preset-card');
    const popover = document.getElementById('presets-popover');
    const popoverTitle = document.getElementById('presets-popover-title');
    const popoverDesc = document.getElementById('presets-popover-desc');
    const popoverPlants = document.getElementById('presets-popover-plants');
    const popoverClose = document.getElementById('presets-popover-close');

    if (!selectBox || !menu) return;

    // Toggle dropdown open/close
    selectBox.addEventListener('click', (e) => {
        e.stopPropagation();
        const isOpen = menu.style.display === 'block';
        menu.style.display = isOpen ? 'none' : 'block';
        // Close methodologies dropdown if open
        const otherMenu = document.getElementById('methods-dropdown-menu');
        if (otherMenu) otherMenu.style.display = 'none';
    });

    document.addEventListener('click', (e) => {
        if (!e.target.closest('#presets-dropdown-container')) {
            menu.style.display = 'none';
        }
        if (popover && !popover.contains(e.target) && !e.target.closest('.custom-option-item')) {
            popover.style.display = 'none';
        }
    });

    let activeHoveredPreset = null;

    const showPresetPopover = (presetKey, itemEl) => {
        const details = presetDescriptions[presetKey];
        if (popover && details && itemEl) {
            popoverTitle.textContent = details.title;
            popoverDesc.textContent = details.desc;
            
            // Build crops list
            popoverPlants.innerHTML = '';
            const crops = presetsConfig[presetKey] || [];
            crops.forEach(c => {
                const li = document.createElement('li');
                li.style.marginBottom = '2px';
                li.style.color = 'var(--text-secondary)';
                li.textContent = `${c.query} (${Math.round(c.weight * 100)}%)`;
                popoverPlants.appendChild(li);
            });
            
            popover.style.display = 'block';
            popover.style.position = 'fixed';
            
            const rect = itemEl.getBoundingClientRect();
            let leftPos = rect.right + 12;
            
            if (leftPos + popover.offsetWidth > window.innerWidth - 16) {
                leftPos = rect.left - popover.offsetWidth - 12;
            }
            
            let topPos = rect.top;
            if (topPos + popover.offsetHeight > window.innerHeight - 16) {
                topPos = window.innerHeight - popover.offsetHeight - 16;
            }
            
            popover.style.left = leftPos + 'px';
            popover.style.top = topPos + 'px';
            
            requestAnimationFrame(() => {
                popover.style.opacity = '1';
                popover.style.transform = 'translateX(0)';
            });
        }
    };

    presetCards.forEach(card => {
        const checkbox = card.querySelector('.preset-toggle');
        const pctContainer = card.querySelector('.preset-pct-container');
        const presetKey = card.dataset.preset;
        if (!checkbox) return;
        
        checkbox.addEventListener('change', (e) => {
            e.stopPropagation();
            if (checkbox.checked) {
                card.style.background = 'rgba(16, 185, 129, 0.08)';
                if (pctContainer) pctContainer.style.display = 'flex';
            } else {
                card.style.background = 'transparent';
                if (pctContainer) pctContainer.style.display = 'none';
            }
            
            // Auto-balance all active/checked presets to sum to exactly 100%
            if (isAutoBalanceEnabled) {
                const activeCards = Array.from(presetCards).filter(c => c.querySelector('.preset-toggle').checked);
                if (activeCards.length > 0) {
                    const basePct = Math.floor(100 / activeCards.length);
                    const remainder = 100 % activeCards.length;
                    activeCards.forEach((c, idx) => {
                        const input = c.querySelector('.preset-pct');
                        if (input) {
                            input.value = basePct + (idx < remainder ? 1 : 0);
                        }
                    });
                }
            }
            updatePresetBadges();
        });

        // Hover events
        card.addEventListener('mouseenter', () => {
            activeHoveredPreset = presetKey;
            showPresetPopover(presetKey, card);
        });

        card.addEventListener('mouseleave', () => {
            if (popover) {
                popover.style.opacity = '0';
                popover.style.display = 'none';
            }
            activeHoveredPreset = null;
        });

        // Click card toggles checkbox
        card.addEventListener('click', (e) => {
            if (e.target.closest('.preset-toggle') || e.target.closest('.preset-pct')) return;
            checkbox.checked = !checkbox.checked;
            checkbox.dispatchEvent(new Event('change'));
        });
    });

    // Auto-Balance button listener
    const btnNormalize = document.getElementById('btn-normalize-presets');
    if (btnNormalize) {
        btnNormalize.addEventListener('click', () => {
            isAutoBalanceEnabled = !isAutoBalanceEnabled;
            
            // Toggle highlight visual style
            if (isAutoBalanceEnabled) {
                btnNormalize.style.background = 'rgba(16, 185, 129, 0.15)';
                btnNormalize.style.borderColor = 'var(--accent-emerald)';
                btnNormalize.style.color = 'var(--accent-emerald)';
                
                // Immediately auto-balance
                const activeCards = Array.from(presetCards).filter(c => c.querySelector('.preset-toggle').checked);
                if (activeCards.length > 0) {
                    const basePct = Math.floor(100 / activeCards.length);
                    const remainder = 100 % activeCards.length;
                    activeCards.forEach((c, idx) => {
                        const input = c.querySelector('.preset-pct');
                        if (input) {
                            input.value = basePct + (idx < remainder ? 1 : 0);
                        }
                    });
                }
                updatePresetBadges();
            } else {
                btnNormalize.style.background = 'rgba(255, 255, 255, 0.02)';
                btnNormalize.style.borderColor = 'var(--border-color)';
                btnNormalize.style.color = 'var(--text-secondary)';
            }
        });
    }

    // Scroll listener to update popover dynamically during wheel scroll
    menu.addEventListener('scroll', () => {
        const items = menu.querySelectorAll('.custom-option-item');
        items.forEach(item => {
            const rect = item.getBoundingClientRect();
            if (window.mouseX >= rect.left && window.mouseX <= rect.right &&
                window.mouseY >= rect.top && window.mouseY <= rect.bottom) {
                const key = item.dataset.preset;
                if (activeHoveredPreset !== key) {
                    activeHoveredPreset = key;
                    showPresetPopover(key, item);
                }
            }
        });
    });
}
// Function to generate crops from active presets and calculate quantities
function applySelectedPresets(shouldSubmit = true) {
    const presetCards = document.querySelectorAll('.preset-card');
    const activeCards = Array.from(presetCards).filter(c => c.querySelector('.preset-toggle').checked);
    const errMsg = document.getElementById('presets-error-msg');
    
    if (activeCards.length === 0) {
        if (errMsg) {
            errMsg.textContent = "Please select at least one preset garden plan to apply!";
            errMsg.style.display = 'block';
        }
        return false;
    }
    if (errMsg) errMsg.style.display = 'none';

    // Gather selected presets and their percentage weights
    let totalPct = 0;
    const selectedList = [];
    activeCards.forEach(card => {
        const presetKey = card.dataset.preset;
        const pct = parseInt(card.querySelector('.preset-pct').value) || 0;
        totalPct += pct;
        selectedList.push({ key: presetKey, pct: pct });
    });

    if (totalPct === 0) return false;

    // Get current garden dimensions
    const width = parseFloat(document.getElementById('input-width').value) || 20;
    const height = parseFloat(document.getElementById('input-height').value) || 30;
    const totalArea = width * height;
    const targetFootprint = totalArea * 0.8; // Allow 20% path spaces

    // Aggregate crop allocations case-insensitively
    const aggregatedCrops = {}; // cropName -> { plant, footprint }
    const scaleDenom = Math.max(100, totalPct);
    selectedList.forEach(item => {
        const ratio = item.pct / scaleDenom; // relative ratio of this preset, respecting below-100% total coverage
        const presetFootprint = targetFootprint * ratio;
        const cropsList = presetsConfig[item.key] || [];

        cropsList.forEach(crop => {
            const match = allPlants.find(p => p.name.toLowerCase() === crop.query.toLowerCase()) ||
                          allPlants.find(p => p.name.toLowerCase().includes(crop.query.toLowerCase()));
            
            if (match) {
                const keyName = match.name;
                const cropAllocatedFootprint = presetFootprint * crop.weight;
                
                if (!aggregatedCrops[keyName]) {
                    aggregatedCrops[keyName] = {
                        plant: match,
                        footprint: 0
                    };
                }
                aggregatedCrops[keyName].footprint += cropAllocatedFootprint;
            }
        });
    });

    // Convert footprints to plant quantities
    const rawItems = [];
    for (const name in aggregatedCrops) {
        const data = aggregatedCrops[name];
        const spread = getPlantDiameter(data.plant);
        const cellArea = spread * spread;
        let qty = Math.floor(data.footprint / cellArea);
        qty = Math.max(1, qty); // Ensure at least 1 plant
        
        rawItems.push({
            plant: data.plant,
            spread: spread,
            cellArea: cellArea,
            quantity: qty
        });
    }

    if (rawItems.length === 0) return false;

    // Scale if total footprint exceeds total garden area
    let totalFootprint = rawItems.reduce((sum, item) => sum + (item.quantity * item.cellArea), 0);
    if (totalFootprint > totalArea) {
        const scale = totalArea / totalFootprint;
        rawItems.forEach(item => {
            item.quantity = Math.max(1, Math.floor(item.quantity * scale));
        });
    }

    // Set as active selections, preserving manually added ones
    const manualCrops = selectedCrops.filter(c => c.manuallyAdded);
    selectedCrops = [...manualCrops];
    
    rawItems.forEach(item => {
        // Skip adding preset crop if it's already in the manual crops list to avoid duplication
        if (selectedCrops.some(sc => sc.id === item.plant.id)) {
            return;
        }
        
        let yieldPer = getYieldPerPlant(item.plant);
        if (settingsWeightUnit === 'kg') {
            yieldPer = yieldPer * 0.453592;
        }
        selectedCrops.push({
            ...item.plant,
            quantity: item.quantity,
            yield: item.quantity * yieldPer,
            yieldPerPlant: yieldPer
        });
    });
    renderCropTags();
    if (shouldSubmit) {
        submitDesign();
    }
    return true;
}

    // Apply Selected Plans button listener
    const btnApply = document.getElementById('btn-apply-selected-presets');
    if (btnApply) {
        btnApply.addEventListener('click', () => {
            applySelectedPresets();
        });
    }

// Render Crop Tags in container as editable quantity rows (with climate zone validation warnings)
function renderCropTags() {
    selectedCropsContainer.innerHTML = '';
    
    // Hide floating botanical tooltip to prevent frozen tooltip artifact when nodes are deleted
    const tooltip = document.getElementById('crop-info-tooltip');
    if (tooltip) {
        tooltip.style.display = 'none';
        tooltip.style.opacity = '0';
    }
    
    // Sort crops by diameter: smallest (e.g. 1 ft greens) at top, largest (e.g. 8 ft trees) at bottom
    selectedCrops.sort((a, b) => getPlantDiameter(a) - getPlantDiameter(b));
    
    // Compute allocation capacity space indicator
    const width = parseFloat(document.getElementById('input-width').value) || 20;
    const height = parseFloat(document.getElementById('input-height').value) || 30;
    const totalGardenArea = width * height;
    
    let allocatedArea = 0;
    selectedCrops.forEach(crop => {
        const diameter = getPlantDiameter(crop);
        const dimVal = settingsDimUnit === 'm' ? diameter * 0.3048 : diameter;
        allocatedArea += (crop.quantity || 0) * (dimVal * dimVal);
    });
    
    const capacityMeter = document.getElementById('capacity-meter');
    const pctLabel = document.getElementById('capacity-allocated-pct');
    const statusText = document.getElementById('capacity-status-text');
    const fillBar = document.getElementById('capacity-fill');
    
    if (capacityMeter && pctLabel && statusText && fillBar) {
        if (selectedCrops.length === 0) {
            capacityMeter.style.display = 'none';
        } else {
            capacityMeter.style.display = 'block';
            const pct = totalGardenArea > 0 ? (allocatedArea / totalGardenArea) * 100 : 0;
            pctLabel.textContent = `${pct.toFixed(1)}%`;
            fillBar.style.width = `${Math.min(100, pct)}%`;
            
            const areaUnit = settingsDimUnit === 'ft' ? 'sq ft' : 'sq m';
            if (allocatedArea <= totalGardenArea) {
                const remaining = totalGardenArea - allocatedArea;
                statusText.textContent = `${allocatedArea.toFixed(1)} / ${totalGardenArea.toFixed(1)} ${areaUnit} (${remaining.toFixed(1)} ${areaUnit} remaining)`;
                pctLabel.style.color = 'var(--accent-emerald)';
                fillBar.style.backgroundColor = 'var(--accent-emerald)';
            } else {
                const excess = allocatedArea - totalGardenArea;
                statusText.textContent = `${allocatedArea.toFixed(1)} / ${totalGardenArea.toFixed(1)} ${areaUnit} (${excess.toFixed(1)} ${areaUnit} over capacity!)`;
                pctLabel.style.color = '#ef4444';
                fillBar.style.backgroundColor = '#ef4444';
            }
        }
    }
    
    if (selectedCrops.length === 0) {
        selectedCropsContainer.innerHTML = '<p class="placeholder-text text-center py-4">No crops selected yet. Use the search bar above.</p>';
        return;
    }
    
    // Extract current USDA zone number
    const zoneElement = document.getElementById('hdr-zone');
    const zoneText = zoneElement ? zoneElement.textContent : "Zone 6a";
    const zoneMatch = zoneText.match(/\d+/);
    const currentZoneNum = zoneMatch ? parseInt(zoneMatch[0]) : 6;
    
    selectedCrops.forEach((crop, index) => {
        // Validate suitability for selected USDA zone
        let zoneWarningHtml = '';
        if (crop.usda_zones) {
            const allowedZones = crop.usda_zones.split(',').map(z => parseInt(z.trim()));
            if (!allowedZones.includes(currentZoneNum)) {
                zoneWarningHtml = `
                    <span class="crop-zone-warning-badge" style="
                        background-color: rgba(239, 68, 68, 0.1);
                        border: 1px solid rgba(239, 68, 68, 0.35);
                        color: #f87171;
                        font-size: 9px;
                        padding: 1px 6px;
                        border-radius: 4px;
                        margin-left: 6px;
                        display: inline-flex;
                        align-items: center;
                        gap: 3px;
                        font-weight: 700;
                    " title="This variety typically thrives in USDA zones ${crop.usda_zones}, but your location is in Zone ${currentZoneNum}.">
                        <i class="fa-solid fa-triangle-exclamation"></i> Zone Warning
                    </span>
                `;
            }
        }

        const isTropical = isTropicalPotted(crop, currentZoneNum);
        let pottedBadgeHtml = '';
        if (isTropical) {
            pottedBadgeHtml = `
                <span class="crop-potted-badge" style="
                    background-color: rgba(245, 158, 11, 0.1);
                    border: 1px solid rgba(245, 158, 11, 0.35);
                    color: #f59e0b;
                    font-size: 9px;
                    padding: 1px 6px;
                    border-radius: 4px;
                    margin-left: 6px;
                    display: inline-flex;
                    align-items: center;
                    gap: 3px;
                    font-weight: 700;
                " title="Tropical plant! Must be grown in a pot and brought indoors during winter in Zone ${currentZoneNum}.">
                    <i class="fa-solid fa-bucket"></i> Potted Tropical
                </span>
            `;
            zoneWarningHtml = ''; // Replace generic red zone warning with potted advice
        }

        let spreadText = `${getPlantDiameter(crop)} ft`;
        const diameter = getPlantDiameter(crop);
        const dimVal = settingsDimUnit === 'm' ? diameter * 0.3048 : diameter;
        if (settingsDimUnit === 'm') {
            spreadText = `${dimVal.toFixed(1)} m`;
        }

        const totalAreaReq = (crop.quantity || 0) * (dimVal * dimVal);
        const areaUnitText = settingsDimUnit === 'm' ? "sq m" : "sq ft";
        const areaText = `${totalAreaReq.toFixed(0)} ${areaUnitText}`;

        const nameLower = crop.name.toLowerCase();
        const isTree = nameLower.includes("tree") || nameLower.includes("chestnut") || nameLower.includes("walnut") || nameLower.includes("oak") || nameLower.includes("maple") || nameLower.includes("pecan") || nameLower.includes("paulownia") || (crop.type && crop.type.toLowerCase().includes("tree"));
        const qtyLabel = isTree ? "Trees" : "Plants";

        const row = document.createElement('div');
        row.className = 'crop-quantity-row';
        row.dataset.plantName = crop.name;
        
        if (highlightedPlantName === crop.name) {
            row.classList.add('active-highlight');
            row.style.border = '2px solid #eab308';
            row.style.boxShadow = '0 0 10px rgba(234, 179, 8, 0.4)';
        }

        row.innerHTML = `
            <div class="crop-header-row">
                <button class="remove-crop-row-btn" data-idx="${index}"><i class="fa-solid fa-trash"></i></button>
                <div class="crop-info" style="cursor: pointer;">
                    <strong class="crop-name">${crop.name}</strong>
                    ${zoneWarningHtml}
                    ${pottedBadgeHtml}
                </div>
            </div>
            <div class="crop-inputs-grid">
                <div class="input-qty-group">
                    <label>${qtyLabel}</label>
                    <input type="number" class="qty-input" value="${crop.quantity}" min="1" max="1000" data-idx="${index}" data-type="qty">
                </div>
                <div class="input-qty-group">
                    <label>Req. Space</label>
                    <div class="readonly-box">${areaText}</div>
                </div>
                <div class="input-qty-group">
                    <label>Est. Yield (${settingsWeightUnit})</label>
                    <input type="number" class="yield-input" value="${Math.round(crop.yield)}" min="1" max="10000" data-idx="${index}" data-type="yield">
                </div>
            </div>
            <div class="crop-sub-desc">
                <i class="fa-solid fa-seedling" style="color: var(--accent-emerald); font-size: 10px;"></i>
                <span>${crop.type} | Spread: ${spreadText}</span>
            </div>
        `;
        
        const infoDiv = row.querySelector('.crop-info');
        infoDiv.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleCropHighlight(crop.name);
        });

        // Botanical Detailed Tooltip Listeners
        const tooltip = document.getElementById('crop-info-tooltip');
        row.addEventListener('mouseenter', (e) => {
            if (!tooltip) return;
            
            const warningText = isTropical ? `
                <div class="floating-tooltip-warning">
                    <i class="fa-solid fa-temperature-arrow-down"></i> <strong>Potted Winter Shelter Required</strong><br>
                    This is a tropical plant not hardy in Zone ${currentZoneNum}. To keep it alive, grow it in a pot/container and move it indoors before winter freezing.
                </div>
            ` : '';
            
            tooltip.innerHTML = `
                <div class="floating-tooltip-title">${crop.name}</div>
                <div class="floating-tooltip-sci">${crop.scientific_name || "Botanical species"}</div>
                <div class="floating-tooltip-meta">
                    <span style="color: var(--accent-emerald);">Type:</span> ${crop.type} | 
                    <span style="color: var(--accent-emerald);">Sun:</span> ${crop.sun_requirements || "Full Sun"} | 
                    <span style="color: var(--accent-emerald);">Water:</span> ${crop.water_requirements || "Moderate"} | 
                    <span style="color: var(--accent-emerald);">Soil:</span> ${crop.soil_preference || "Loam"} | 
                    <span style="color: var(--accent-emerald);">Zones:</span> ${crop.usda_zones || "Any"}
                </div>
                <div class="floating-tooltip-desc">${crop.description || "Interactive botanical crop."}</div>
                ${warningText}
            `;
            
            tooltip.style.display = 'block';
            setTimeout(() => {
                tooltip.style.opacity = '1';
            }, 10);
        });

        row.addEventListener('mousemove', (e) => {
            if (!tooltip) return;
            
            const tooltipWidth = 260;
            const tooltipHeight = tooltip.offsetHeight || 140;
            
            let left = e.clientX + 15;
            let top = e.clientY - tooltipHeight / 2;
            
            // Adjust bounds relative to viewport
            if (left + tooltipWidth > window.innerWidth) {
                left = e.clientX - tooltipWidth - 15;
            }
            if (top + tooltipHeight > window.innerHeight) {
                top = window.innerHeight - tooltipHeight - 15;
            }
            if (top < 10) {
                top = 10;
            }
            
            tooltip.style.left = `${left}px`;
            tooltip.style.top = `${top}px`;
        });

        row.addEventListener('mouseleave', () => {
            if (!tooltip) return;
            tooltip.style.display = 'none';
            tooltip.style.opacity = '0';
        });

        selectedCropsContainer.appendChild(row);
    });
    // Add Event Listeners to Inputs
    selectedCropsContainer.querySelectorAll('input').forEach(input => {
        input.addEventListener('change', (e) => {
            const idx = parseInt(e.target.dataset.idx);
            const type = e.target.dataset.type;
            const val = Math.max(1, parseInt(e.target.value) || 1);
            
            if (type === 'qty') {
                selectedCrops[idx].quantity = val;
                selectedCrops[idx].yield = val * selectedCrops[idx].yieldPerPlant;
            } else if (type === 'yield') {
                selectedCrops[idx].yield = val;
                selectedCrops[idx].quantity = Math.ceil(val / selectedCrops[idx].yieldPerPlant);
            }
            
            renderCropTags();
        });
    });
    
    // Add Event Listener to Remove buttons
    selectedCropsContainer.querySelectorAll('.remove-crop-row-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const idx = parseInt(e.currentTarget.dataset.idx);
            selectedCrops.splice(idx, 1);
            renderCropTags();
        });
    });
}

function toggleCropHighlight(plantName) {
    if (highlightedPlantName === plantName) {
        highlightedPlantName = null;
    } else {
        highlightedPlantName = plantName;
    }
    
    // 1. Update crop tags active borders
    document.querySelectorAll('.crop-quantity-row').forEach(row => {
        const pName = row.dataset.plantName;
        if (pName === highlightedPlantName) {
            row.classList.add('active-highlight');
            row.style.border = '2px solid #eab308';
            row.style.boxShadow = '0 0 10px rgba(234, 179, 8, 0.4)';
        } else {
            row.classList.remove('active-highlight');
            row.style.border = '';
            row.style.boxShadow = '';
        }
    });

    // 2. Update 2D grid cell gold outlines
    document.querySelectorAll('.grid-cell.crop').forEach(cell => {
        const cellData = currentGridArray?.[parseInt(cell.dataset.instanceId?.split('_')[1])]?.[parseInt(cell.dataset.instanceId?.split('_')[2])];
        const pName = cell.dataset.plantName || (cellData && cellData.plant && cellData.plant.name);
        
        if (highlightedPlantName && pName === highlightedPlantName) {
            cell.classList.add('gold-highlight-2d');
            cell.style.outline = '3px solid #eab308';
            cell.style.outlineOffset = '-3px';
            cell.style.boxShadow = '0 0 12px rgba(234, 179, 8, 0.8)';
            cell.style.zIndex = '5';
        } else {
            cell.classList.remove('gold-highlight-2d');
            cell.style.outline = '';
            cell.style.outlineOffset = '';
            cell.style.boxShadow = '';
            cell.style.zIndex = '';
        }
    });

    // 3. Update 3D wireframe outline helpers
    update3DHighlights();
}

function update3DHighlights() {
    if (!scene3d || !gardenGroup3d) return;

    // Dispose old highlight wireframes
    active3DHighlightHelpers.forEach(helper => {
        scene3d.remove(helper);
        if (helper.geometry) helper.geometry.dispose();
        if (helper.material) helper.material.dispose();
    });
    active3DHighlightHelpers = [];

    if (!highlightedPlantName) {
        return;
    }

    // Add gold BoxHelper to each matching 3D cropInstance group
    gardenGroup3d.traverse(node => {
        if (node.name === "cropInstance" && node.userData && node.userData.name === highlightedPlantName) {
            const helper = new THREE.BoxHelper(node, 0xeab308);
            helper.name = "highlightHelper";
            
            if (helper.material) {
                helper.material.transparent = true;
                helper.material.opacity = 0.8;
                helper.material.depthWrite = false;
                helper.material.linewidth = 2.5;
            }
            
            scene3d.add(helper);
            active3DHighlightHelpers.push(helper);
        }
    });
}

async function submitDesign(shouldScroll = false) {
    shouldResetCamera3D = true;
    
    // Auto-apply selected presets to ensure they are synchronized with the design request
    applySelectedPresets(false);

    if (selectedCrops.length === 0) {
        alert("Please search and add at least one crop to design your garden!");
        return;
    }

    // Over-Capacity Resolution Logic
    const resolutionMode = document.getElementById('select-overcapacity')?.value || 'none';
    if (resolutionMode === 'scale-down') {
        const wInputVal = parseFloat(document.getElementById('input-width').value) || 20;
        const hInputVal = parseFloat(document.getElementById('input-height').value) || 30;
        const wFt = settingsDimUnit === 'm' ? wInputVal / 0.3048 : wInputVal;
        const hFt = settingsDimUnit === 'm' ? hInputVal / 0.3048 : hInputVal;
        const totalArea = wFt * hFt;
        const targetFootprint = totalArea * 0.8;

        let totalFootprint = selectedCrops.reduce((sum, c) => sum + (c.quantity * getPlantDiameter(c) * getPlantDiameter(c)), 0);
        if (totalFootprint > targetFootprint) {
            const scale = targetFootprint / totalFootprint;
            selectedCrops.forEach(c => {
                if (c.manuallyAdded) {
                    c.quantity = Math.max(1, Math.floor(c.quantity * scale));
                } else {
                    c.quantity = Math.floor(c.quantity * scale);
                }
                c.yield = c.quantity * c.yieldPerPlant;
            });
            selectedCrops = selectedCrops.filter(c => c.quantity > 0);
            renderCropTags();
        }
    } else if (resolutionMode === 'expand') {
        const widthInput = document.getElementById('input-width');
        const heightInput = document.getElementById('input-height');
        if (widthInput && heightInput) {
            const wInputVal = parseFloat(widthInput.value) || 20;
            const hInputVal = parseFloat(heightInput.value) || 30;
            let wFt = settingsDimUnit === 'm' ? wInputVal / 0.3048 : wInputVal;
            let hFt = settingsDimUnit === 'm' ? hInputVal / 0.3048 : hInputVal;

            let maxDiameter = 0;
            let totalFootprint = 0;
            selectedCrops.forEach(c => {
                const diam = getPlantDiameter(c);
                if (diam > maxDiameter) maxDiameter = diam;
                totalFootprint += (c.quantity || 1) * diam * diam;
            });

            const targetArea = totalFootprint / 0.8;

            if (wFt < maxDiameter) wFt = maxDiameter;
            if (hFt < maxDiameter) hFt = maxDiameter;

            while (wFt * hFt < targetArea) {
                wFt += 2;
                hFt += 2;
            }

            const wTarget = settingsDimUnit === 'm' ? Math.round(wFt * 0.3048 * 2) / 2 : Math.round(wFt);
            const hTarget = settingsDimUnit === 'm' ? Math.round(hFt * 0.3048 * 2) / 2 : Math.round(hFt);

            if (wTarget !== wInputVal || hTarget !== hInputVal) {
                widthInput.value = wTarget;
                heightInput.value = hTarget;
                
                // Re-sync metrics display labels immediately
                const area = wTarget * hTarget;
                const plantArea = Math.round(area * 0.8);
                const pathsArea = Math.round(area * 0.2);
                
                if (settingsDimUnit === 'm') {
                    const totalHa = (area / 10000).toFixed(4);
                    const plantHa = (plantArea / 10000).toFixed(4);
                    const pathsHa = (pathsArea / 10000).toFixed(4);
                    document.getElementById('lbl-total-area').textContent = `${area.toFixed(1)} sq m (${totalHa} ha)`;
                    document.getElementById('lbl-planting-area').textContent = `${plantArea.toFixed(1)} sq m (${plantHa} ha)`;
                    document.getElementById('lbl-paths-area').textContent = `${pathsArea.toFixed(1)} sq m (${pathsHa} ha)`;
                } else {
                    document.getElementById('lbl-total-area').textContent = `${area} sq ft`;
                    document.getElementById('lbl-planting-area').textContent = `${plantArea} sq ft`;
                    document.getElementById('lbl-paths-area').textContent = `${pathsArea} sq ft`;
                }

                // Re-trigger layout capacity updates
                renderCropTags();
            }
        }
    }

    const submitBtn = document.getElementById('btn-submit-design');
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Analyzing Ecosystem...';

    const wInput = parseFloat(document.getElementById('input-width').value);
    const hInput = parseFloat(document.getElementById('input-height').value);

    const payload = {
        zip: document.getElementById('input-zip').value,
        garden_width: settingsDimUnit === 'm' ? wInput / 0.3048 : wInput,
        garden_height: settingsDimUnit === 'm' ? hInput / 0.3048 : hInput,
        soil: document.getElementById('select-soil').value,
        sun: document.getElementById('select-sun').value,
        plants: selectedCrops.map(sc => sc.name)
    };

    try {
        const response = await fetch('/api/v1/design', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (response.ok) {
            lastDesignResponse = await response.json();
            
            // Update Headers & Sync Summary
            const info = zipCodeInfo[payload.zip] || { city: "Ann Arbor, MI", zone: "Zone 6a" };
            document.getElementById('hdr-zip').textContent = `${payload.zip} (${info.city})`;
            document.getElementById('hdr-zone').textContent = info.zone;
            const userZoneElement = document.querySelector('.user-zone');
            if (userZoneElement) {
                userZoneElement.textContent = info.zone;
            }

            const area = wInput * hInput;
            const plantArea = Math.round(area * 0.8);
            const pathsArea = Math.round(area * 0.2);

            if (settingsDimUnit === 'm') {
                const totalHa = (area / 10000).toFixed(4);
                const plantHa = (plantArea / 10000).toFixed(4);
                const pathsHa = (pathsArea / 10000).toFixed(4);

                document.getElementById('lbl-total-area').textContent = `${area.toFixed(1)} sq m (${totalHa} ha)`;
                document.getElementById('lbl-planting-area').textContent = `${plantArea.toFixed(1)} sq m (${plantHa} ha)`;
                document.getElementById('lbl-paths-area').textContent = `${pathsArea.toFixed(1)} sq m (${pathsHa} ha)`;
            } else {
                const acreage = (area / 43560).toFixed(3);
                const plantAcreage = (plantArea / 43560).toFixed(3);
                const pathsAcreage = (pathsArea / 43560).toFixed(3);

                document.getElementById('lbl-total-area').textContent = `${Math.round(area)} sq ft (${acreage} ac)`;
                document.getElementById('lbl-planting-area').textContent = `${Math.round(plantArea)} sq ft (${plantAcreage} ac)`;
                document.getElementById('lbl-paths-area').textContent = `${Math.round(pathsArea)} sq ft (${pathsAcreage} ac)`;
            }
            
            const totalQty = selectedCrops.reduce((sum, sc) => sum + (sc.quantity || 0), 0);
            document.getElementById('lbl-placed-count').textContent = totalQty;
            
            const totalYield = selectedCrops.reduce((sum, sc) => sum + (sc.yield || 0), 0);
            document.getElementById('lbl-yield').textContent = `${Math.round(totalYield)} ${settingsWeightUnit}`;
            
            let waterLevel = "Moderate";
            if (payload.soil === "Sand" || payload.soil === "Rocky") waterLevel = "High";
            if (payload.soil === "Clay") waterLevel = "Low";
            document.getElementById('lbl-water-needs').textContent = waterLevel;

            // Sync quick metrics
            document.getElementById('stat-total-plants').textContent = totalQty;
            document.getElementById('stat-companions').textContent = lastDesignResponse.companions.length;
            document.getElementById('stat-warnings').textContent = lastDesignResponse.antagonists.length;

            // Render components
            submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Spacing Crops... 0%';
            updateProgressBar(0, 'Initializing...', true);
            
            const result = await generateLayoutGridAsync(payload.garden_width, payload.garden_height, (pct, plantName) => {
                submitBtn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Spacing: ${pct}% (${plantName})`;
                updateProgressBar(pct, plantName, true);
            });
            updateProgressBar(100, 'Done', false);
            
            currentGridArray = result.gridArray;
            placedCenters = result.placedCenters;
            currentWidth = payload.garden_width;
            currentHeight = payload.garden_height;
            
            isManualEdit = true;
            renderLayoutGrid(payload.garden_width, payload.garden_height);
            isManualEdit = false;
            
            renderRecommendations();
            renderCalendarTimeline();
            updateBenefitsSection();

            // Auto-render 3D view as it is the primary default view
            init3D();
            trigger3DRender();

            // Smoothly focus/scroll down to the Plot Layout Preview if explicitly triggered
            if (shouldScroll) {
                const layoutPanel = document.querySelector('.layout-panel');
                if (layoutPanel) {
                    layoutPanel.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            }
        } else {
            alert("Error designing garden. Please verify parameters.");
        }
    } catch (e) {
        alert("Failed to design: " + e.message + "\n" + e.stack);
        console.error(e);
    } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<i class="fa-solid fa-wand-magic-sparkles"></i> Design My Garden';
    }
}

// Helper to determine if a plant is a tropical variety requiring container potting for a cold zone
function isTropicalPotted(plant, currentZoneNum) {
    if (!plant || !plant.usda_zones) return false;
    const allowedZones = plant.usda_zones.split(',').map(z => parseInt(z.trim())).filter(z => !isNaN(z));
    if (allowedZones.length === 0) return false;
    
    const minZone = Math.min(...allowedZones);
    const isCompatible = allowedZones.includes(currentZoneNum);
    
    // Flag as tropical potted if minimum zone >= 9 and it is not compatible with our colder local zone
    return (minZone >= 9 && !isCompatible && currentZoneNum < minZone);
}

// Helper to get estimated full grown diameter (in feet)
function getPlantDiameter(plant) {
    if (!plant) return 1;
    const name = (plant.name || "").toLowerCase();
    
    if (name.includes("paulownia")) return 30; // True width: 30 ft
    if (name.includes("chestnut") || name.includes("walnut") || name.includes("oak") || name.includes("maple") || name.includes("pecan")) return 25; // Large trees: 25 ft
    if (name.includes("tree")) return 8;       // Large fruit trees: 8x8 ft
    if (name.includes("sunflower")) return 4;  // Sunflowers: 4x4 ft
    if (name.includes("squash") || name.includes("zucchini") || name.includes("pumpkin") || name.includes("melon") || name.includes("watermelon")) return 4; // Sprawling: 4x4 ft
    if (name.includes("tomato") || name.includes("cucumber")) return 3; // Stakes: 3x3 ft
    if (name.includes("pepper") || name.includes("potato") || name.includes("eggplant") || name.includes("okra") || name.includes("broccoli") || name.includes("cauliflower") || name.includes("lavender") || name.includes("rosemary")) return 2; // Bushes: 2x2 ft
    
    if (plant.mature_width) {
        return parseFloat(plant.mature_width);
    }
    return 1; // Herbs and small greens: 1x1 ft
}

// Helper to get estimated full grown height (in feet) for sun shading optimization
function getPlantHeight(plant) {
    if (!plant) return 1;
    const name = (plant.name || "").toLowerCase();
    const category = plant.type ? plant.type.toLowerCase() : "";
    
    if (name.includes("paulownia")) return 40; // True height: 40 ft
    if (name.includes("chestnut") || name.includes("walnut") || name.includes("oak") || name.includes("maple") || name.includes("pecan")) return 35; // Large trees: 35 ft
    if (name.includes("tree") || category.includes("tree")) return 15;        // Tall fruit trees: 15 ft
    if (name.includes("sunflower")) return 8;                                 // Sunflowers: 8 ft
    if (name.includes("tomato") || name.includes("cucumber")) return 6;        // Vines / staked climbing crops: 6 ft
    if (name.includes("pepper") || name.includes("eggplant") || name.includes("broccoli") || name.includes("corn") || name.includes("okra")) return 3; // Medium bushes: 3 ft
    
    if (plant.mature_height) {
        return parseFloat(plant.mature_height);
    }
    return 1; // Leafy greens, herbs, root crops, onions, garlic: 1 ft
}

let zoomScale = 1.0;

function generateLayoutGridAsync(width, height, onProgress) {
    return new Promise((resolve) => {
        const isDistributed = document.getElementById('chk-distribute-layout')?.checked || false;
        const cols = Math.round(width);
        const rows = Math.round(height);
        
        let gridArray = Array(rows).fill(null).map(() => Array(cols).fill(null));
        let placedCenters = [];

        const isMiyawaki = document.getElementById('chk-method-miyawaki')?.checked || false;
        const isSyntropic = document.getElementById('chk-method-syntropic')?.checked || false;
        const isFoodForest = document.getElementById('chk-method-foodforest')?.checked || false;
        const isNucleation = document.getElementById('chk-method-nucleation')?.checked || false;
        const isDirectSeeding = document.getElementById('chk-method-directseeding')?.checked || false;

        // 1. Mark walkway paths (skip completely for Miyawaki Pocket Forest)
        if (!isMiyawaki) {
            for (let r = 0; r < rows; r++) {
                for (let c = 0; c < cols; c++) {
                    if (isSyntropic) {
                        // Syntropic uses horizontal rows for compost and walkway lines
                        if (r % 4 === 1 || r % 4 === 3) {
                            gridArray[r][c] = { type: 'path' };
                        }
                    } else {
                        // Default block column walkways
                        if (c % 6 === 0) {
                            gridArray[r][c] = { type: 'path' };
                        }
                    }
                }
            }
        }

        // 2. Sort selected crops by growth height (tallest north-facing first) and diameter (packing efficiency)
        let sortedCrops = [...selectedCrops].sort((a, b) => {
            const heightA = getPlantHeight(a);
            const heightB = getPlantHeight(b);
            if (heightA !== heightB) return heightB - heightA; // Tallest first (North)
            return getPlantDiameter(b) - getPlantDiameter(a);  // Largest diameter first
        });

        let cropIndex = 0;

        function processNextCrop() {
            if (cropIndex >= sortedCrops.length) {
                resolve({ gridArray, placedCenters });
                return;
            }

            const plant = sortedCrops[cropIndex];
            if (onProgress) {
                const pct = Math.round((cropIndex / sortedCrops.length) * 100);
                onProgress(pct, plant.name);
            }

            const companionsSet = new Set();
            if (lastDesignResponse && lastDesignResponse.companions) {
                lastDesignResponse.companions.forEach(c => {
                    if (c.plant === plant.name) companionsSet.add(c.companion);
                    if (c.companion === plant.name) companionsSet.add(c.plant);
                });
            }

            const antagonistsSet = new Set();
            if (lastDesignResponse && lastDesignResponse.antagonists) {
                lastDesignResponse.antagonists.forEach(a => {
                    if (a.plant === plant.name) antagonistsSet.add(a.antagonist);
                    if (a.antagonist === plant.name) antagonistsSet.add(a.plant);
                });
            }

            const diameter = getPlantDiameter(plant);
            let placeDiameter = diameter;
            
            if (isMiyawaki || isDirectSeeding) {
                placeDiameter = Math.max(1, Math.floor(diameter * 0.7));
            }
            let targetCount = plant.quantity || 1;

            let spacingBuffer = 0;
            if (isDistributed && !isMiyawaki && !isDirectSeeding) {
                if (diameter >= 8) spacingBuffer = 4;
                else if (diameter >= 3) spacingBuffer = 2;
                else if (diameter >= 2) spacingBuffer = 2;
                else spacingBuffer = 1;
            }

            let cropPlacedCenters = [];
            let tempGrid = Array(rows).fill(null).map((_, r) => [...gridArray[r]]);
            let tempPlacedCenters = [...placedCenters];
            let placedCount = 0;

            function placeInstancesStep() {
                const batchLimit = Math.min(placedCount + 20, targetCount);
                let failed = false;

                for (let i = placedCount; i < batchLimit; i++) {
                    let candidates = [];
                    const maxCandidates = 150;
                    const stride = (rows * cols > 5000) ? Math.max(1, Math.floor(placeDiameter / 2)) : 1;

                    outerScan:
                    for (let r = 0; r <= rows - placeDiameter; r += stride) {
                        for (let c = 0; c <= cols - placeDiameter; c += stride) {
                            let clear = true;
                            for (let dr = 0; dr < placeDiameter; dr++) {
                                for (let dc = 0; dc < placeDiameter; dc++) {
                                    const cell = tempGrid[r + dr][c + dc];
                                    if (cell !== null) {
                                        const isLargePlant = (plant.type === 'Fruit Tree' || getPlantHeight(plant) >= 12 || diameter >= 6);
                                        if (cell.type === 'path' && isLargePlant) {
                                            // OK
                                        } else if (isFoodForest) {
                                            const isUnderstory = (placeDiameter <= 1.5 && getPlantHeight(plant) <= 2.5);
                                            const isOverheadTree = (cell.type === 'crop' && (cell.plant.type === 'Fruit Tree' || getPlantHeight(cell.plant) >= 12));
                                            if (isUnderstory && isOverheadTree) {
                                                // OK
                                            } else {
                                                clear = false;
                                                break;
                                            }
                                        } else {
                                            clear = false;
                                            break;
                                        }
                                    }
                                }
                                if (!clear) break;
                            }
                            if (clear) {
                                candidates.push({ r, c, penalty: 0 });
                                if (candidates.length >= maxCandidates) {
                                    break outerScan;
                                }
                            }
                        }
                    }

                    if (candidates.length === 0) {
                        failed = true;
                        break;
                    }

                    candidates.forEach(cand => {
                        const candCenterR = cand.r + placeDiameter / 2;
                        const candCenterC = cand.c + placeDiameter / 2;
                        const thetaRad = gardenOrientationAngle * Math.PI / 180;
                        const dy = candCenterR - rows / 2;
                        const dx = candCenterC - cols / 2;
                        const northness = -dx * Math.sin(thetaRad) - dy * Math.cos(thetaRad);
                        const maxPossibleDist = Math.sqrt(cols * cols + rows * rows) / 2;
                        const distFromNorth = maxPossibleDist - northness;

                        let penalty = isDistributed ? distFromNorth * 0.05 : distFromNorth * 1.5;

                        if (isSyntropic) {
                            const rowMod = cand.r % 4;
                            const isPerennial = (plant.type === "Fruit Tree" || getPlantHeight(plant) >= 12 || getPlantDiameter(plant) >= 6);
                            if (isPerennial && rowMod !== 0) {
                                penalty += 15000;
                            } else if (!isPerennial && rowMod !== 2) {
                                penalty += 15000;
                            }
                        }

                        if (isNucleation && (plant.type === "Fruit Tree" || getPlantHeight(plant) >= 12)) {
                            const nucleus1R = rows * 0.3;
                            const nucleus1C = cols * 0.3;
                            const nucleus2R = rows * 0.7;
                            const nucleus2C = cols * 0.7;
                            const dist1 = Math.sqrt((candCenterR - nucleus1R)**2 + (candCenterC - nucleus1C)**2);
                            const dist2 = Math.sqrt((candCenterR - nucleus2R)**2 + (candCenterC - nucleus2C)**2);
                            const minDistToNucleus = Math.min(dist1, dist2);
                            penalty += minDistToNucleus * 250;
                        }

                        const sameTypePlaced = cropPlacedCenters;
                        if (sameTypePlaced.length > 0) {
                            let tooClose = false;
                            let minDist = Infinity;
                            
                            // Check from the end of the array (most recently placed crops)
                            const scanLimit = Math.min(sameTypePlaced.length, 100);
                            for (let idx = sameTypePlaced.length - 1; idx >= sameTypePlaced.length - scanLimit; idx--) {
                                const p = sameTypePlaced[idx];
                                const dR = Math.abs(candCenterR - p.r);
                                const dC = Math.abs(candCenterC - p.c);
                                if (dR > 100 || dC > 100) continue;
                                
                                const dist = Math.sqrt(dR*dR + dC*dC);
                                if (dist < minDist) minDist = dist;
                                if (dist < placeDiameter + spacingBuffer - 0.01) {
                                    tooClose = true;
                                    break;
                                }
                            }
                            if (tooClose) {
                                penalty += 50000;
                            } else {
                                penalty += minDist * 800;
                            }
                        } else if (tempPlacedCenters.length > 0) {
                            if (isDistributed) {
                                const scanLimit = Math.min(tempPlacedCenters.length, 100);
                                for (let idx = tempPlacedCenters.length - 1; idx >= tempPlacedCenters.length - scanLimit; idx--) {
                                    const placed = tempPlacedCenters[idx];
                                    const dR = Math.abs(candCenterR - placed.r);
                                    const dC = Math.abs(candCenterC - placed.c);
                                    if (dR > 50 || dC > 50) continue;
                                    const dist = Math.sqrt(dR*dR + dC*dC);
                                    penalty -= dist * 25;
                                }
                            } else {
                                const lastPlaced = tempPlacedCenters[tempPlacedCenters.length - 1];
                                const dist = Math.sqrt((candCenterR - lastPlaced.r)**2 + (candCenterC - lastPlaced.c)**2);
                                penalty += dist * 50;
                            }
                        }

                        tempPlacedCenters.forEach(placed => {
                            const dRow = Math.abs(candCenterR - placed.r);
                            const dCol = Math.abs(candCenterC - placed.c);
                            
                            const maxDist = isDistributed ? 50 : 15;
                            if (dRow > maxDist || dCol > maxDist) {
                                return;
                            }
                            
                            const dist = Math.sqrt(dRow * dRow + dCol * dCol);
                            if (isDistributed && placed.plantName !== plant.name) {
                                penalty -= dist * 25;
                            }
                            
                            if (dRow <= 15 && dCol <= 15) {
                                const key = [plant.name, placed.plantName].sort().join('::');
                                const isAntagonist = antagonistsSet.has(placed.plantName);
                                if (isAntagonist && !disabledAntagonists.has(key)) {
                                    penalty += 1500 / (dist + 0.1);
                                }
                                const isCompanion = companionsSet.has(placed.plantName);
                                if (isCompanion) {
                                    penalty -= 300 / (dist + 0.1);
                                }
                                if (placed.plantName !== plant.name && !isCompanion && !isFoodForest) {
                                    const candBed = Math.floor(candCenterC / 6);
                                    const placedBed = Math.floor(placed.c / 6);
                                    if (candBed === placedBed) {
                                        penalty += 800;
                                    }
                                }
                            }
                        });

                        cand.penalty = penalty;
                    });

                    candidates.sort((a, b) => {
                        if (Math.abs(a.penalty - b.penalty) > 0.001) {
                            return a.penalty - b.penalty;
                        }
                        if (a.r !== b.r) return a.r - b.r;
                        return a.c - b.c;
                    });

                    if (candidates[0].penalty >= 40000) {
                        failed = true;
                        break;
                    }

                    const best = candidates[0];
                    const instanceId = `${plant.id}_${best.r}_${best.c}`;
                    const centerPt = {
                        r: best.r + placeDiameter / 2,
                        c: best.c + placeDiameter / 2,
                        plantName: plant.name
                    };

                    for (let dr = 0; dr < placeDiameter; dr++) {
                        for (let dc = 0; dc < placeDiameter; dc++) {
                            const cellR = best.r + dr;
                            const cellC = best.c + dc;
                            const existingCell = tempGrid[cellR][cellC];
                            if (existingCell && existingCell.type === 'crop') {
                                existingCell.understory = plant;
                                existingCell.understoryInstanceId = instanceId;
                            } else {
                                tempGrid[cellR][cellC] = {
                                    type: 'crop',
                                    plant: plant,
                                    instanceId: instanceId,
                                    isCenter: (dr === Math.floor(placeDiameter / 2) && dc === Math.floor(placeDiameter / 2)),
                                    isTopLeft: (dr === 0 && dc === 0),
                                    diameter: placeDiameter,
                                    startR: best.r,
                                    startC: best.c
                                };
                            }
                        }
                    }
                    cropPlacedCenters.push(centerPt);
                    tempPlacedCenters.push(centerPt);
                    placedCount++;
                }

                if (failed) {
                    spacingBuffer--;
                    if (spacingBuffer >= 0) {
                        cropPlacedCenters = [];
                        tempGrid = Array(rows).fill(null).map((_, r) => [...gridArray[r]]);
                        tempPlacedCenters = [...placedCenters];
                        placedCount = 0;
                        setTimeout(placeInstancesStep, 0);
                    } else {
                        cropIndex++;
                        setTimeout(processNextCrop, 0);
                    }
                } else if (placedCount === targetCount) {
                    gridArray = tempGrid;
                    placedCenters = tempPlacedCenters;
                    cropIndex++;
                    setTimeout(processNextCrop, 0);
                } else {
                    if (onProgress) {
                        const totalCropsPlaced = placedCenters.length + placedCount;
                        const totalTargetInstances = sortedCrops.reduce((sum, c) => sum + (c.quantity || 1), 0);
                        const pct = Math.min(99, Math.round((totalCropsPlaced / totalTargetInstances) * 100));
                        onProgress(pct, `${plant.name} (${placedCount}/${targetCount})`);
                    }
                    setTimeout(placeInstancesStep, 0);
                }
            }

            placeInstancesStep();
        }

        processNextCrop();
    });
}

function updateProgressBar(pct, plantName, show = true) {
    const container = document.getElementById('layout-progress-container');
    const bar = document.getElementById('layout-progress-bar');
    const status = document.getElementById('layout-progress-status');
    const percent = document.getElementById('layout-progress-percent');
    if (!container) return;

    if (show) {
        container.style.display = 'block';
        if (bar) bar.style.width = `${pct}%`;
        if (status) status.textContent = `Spacing: ${plantName}`;
        if (percent) percent.textContent = `${pct}%`;
    } else {
        container.style.display = 'none';
        if (bar) bar.style.width = `0%`;
        if (percent) percent.textContent = `0%`;
    }
}

async function recalculateLayout() {
    const submitBtn = document.getElementById('btn-submit-design');
    if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Spacing Crops... 0%';
    }
    updateProgressBar(0, 'Initializing...', true);

    const result = await generateLayoutGridAsync(currentWidth || 80, currentHeight || 50, (pct, plantName) => {
        if (submitBtn) {
            submitBtn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Spacing: ${pct}% (${plantName})`;
        }
        updateProgressBar(pct, plantName, true);
    });
    updateProgressBar(100, 'Done', false);

    currentGridArray = result.gridArray;
    placedCenters = result.placedCenters;

    isManualEdit = true;
    renderLayoutGrid(currentWidth || 80, currentHeight || 50);
    isManualEdit = false;

    if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<i class="fa-solid fa-wand-magic-sparkles"></i> Design My Garden';
    }

    trigger3DRender();
}

function renderLayoutGrid(width, height) {
    const isDistributed = document.getElementById('chk-distribute-layout')?.checked || false;
    gardenGrid.innerHTML = '';
    
    // Grid cells represent 1x1 ft space
    const cols = Math.round(width);
    const rows = Math.round(height);
    
    // Extract current USDA zone number
    const zoneElement = document.getElementById('hdr-zone');
    const zoneText = zoneElement ? zoneElement.textContent : "Zone 6a";
    const zoneMatch = zoneText.match(/\d+/);
    const currentZoneNum = zoneMatch ? parseInt(zoneMatch[0]) : 6;
    
    document.getElementById('grid-dim-text').textContent = `${width} ft x ${height} ft (1 cell = 1 sq ft)`;

    // Set dynamic base cell size to fit the entire layout inside the viewport on startup
    const scrollPane = document.getElementById('layout-scroll-pane');
    const paneWidth = scrollPane ? scrollPane.clientWidth : 600;
    const paneHeight = scrollPane ? scrollPane.clientHeight : 480;

    // Minimum 2px per cell to prevent invisible layouts at extreme farm scales
    const fitCellSize = Math.max(2, Math.min((paneWidth - 20) / cols, (paneHeight - 20) / rows));
    const currentCellSize = fitCellSize * zoomScale;

    gardenGrid.style.width = `${cols * currentCellSize}px`;
    gardenGrid.style.height = `${rows * currentCellSize}px`;
    gardenGrid.style.display = 'grid';
    gardenGrid.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
    gardenGrid.style.gridTemplateRows = `repeat(${rows}, 1fr)`;

    // Initialize 2D grid array representing layout space
    let gridArray;
    let placedCenters = [];

    if (currentGridArray) {
        gridArray = currentGridArray;
        // Re-populate placedCenters from gridArray for secondary calculations
        const placedSet = new Set();
        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                const cell = gridArray[r][c];
                if (cell && cell.type === 'crop' && !placedSet.has(cell.instanceId)) {
                    placedSet.add(cell.instanceId);
                    const centerR = cell.startR + cell.diameter / 2;
                    const centerC = cell.startC + cell.diameter / 2;
                    placedCenters.push({ r: centerR, c: centerC, plantName: cell.plant.name });
                }
            }
        }
    } else {
        gridArray = Array(rows).fill(null).map(() => Array(cols).fill(null));
    }

    currentGridArray = gridArray;
    currentWidth = width;
    currentHeight = height;

    // Defer 2D DOM grid rendering if the user is currently looking at the 3D View.
    // This allows instant garden generation without creating thousands of DOM elements.
    if (is3DMode) {
        return;
    }

    // Increment active 2D render ID to cancel any pending chunk draws
    const activeRenderId = ++current2DRenderId;

    // 5. Build grid elements list to render asynchronously in chunks
    const cellsQueue = [];
    const isMiyawaki = document.getElementById('chk-method-miyawaki')?.checked || false;
    const isSyntropic = document.getElementById('chk-method-syntropic')?.checked || false;

    // A. Render grouped walkways as single long strips to dramatically save DOM nodes
    if (!isMiyawaki) {
        if (isSyntropic) {
            for (let r = 0; r < rows; r++) {
                if (r % 4 === 1 || r % 4 === 3) {
                    const pathEl = document.createElement('div');
                    pathEl.className = 'grid-cell path';
                    pathEl.style.gridRow = `${r + 1} / span 1`;
                    pathEl.style.gridColumn = `1 / span ${cols}`;
                    pathEl.textContent = 'P';
                    pathEl.title = "Walkway Path";
                    pathEl.style.display = 'flex';
                    pathEl.style.alignItems = 'center';
                    pathEl.style.justifyContent = 'center';
                    cellsQueue.push(pathEl);
                }
            }
        } else {
            for (let c = 0; c < cols; c++) {
                if (c % 6 === 0) {
                    const pathEl = document.createElement('div');
                    pathEl.className = 'grid-cell path';
                    pathEl.style.gridRow = `1 / span ${rows}`;
                    pathEl.style.gridColumn = `${c + 1} / span 1`;
                    pathEl.textContent = 'P';
                    pathEl.title = "Walkway Path";
                    pathEl.style.display = 'flex';
                    pathEl.style.alignItems = 'center';
                    pathEl.style.justifyContent = 'center';
                    cellsQueue.push(pathEl);
                }
            }
        }
    }

    // B. Render exactly one CSS Grid spanned element per crop footprint
    const renderedInstances = new Set();
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            const cellData = gridArray[r][c];
            if (!cellData || cellData.type !== 'crop') continue;
            if (renderedInstances.has(cellData.instanceId)) continue;
            renderedInstances.add(cellData.instanceId);

            const cell = document.createElement('div');
            cell.className = 'grid-cell crop';
            cell.dataset.instanceId = cellData.instanceId;
            cell.dataset.plantId = cellData.plant.id;
            cell.dataset.plantName = cellData.plant.name;

            // Size the element to occupy the crop's complete footprint via CSS Grid Spans
            cell.style.gridRow = `${cellData.startR + 1} / span ${cellData.diameter}`;
            cell.style.gridColumn = `${cellData.startC + 1} / span ${cellData.diameter}`;

            const isTropical = isTropicalPotted(cellData.plant, currentZoneNum);
            if (isTropical) {
                cell.classList.add('potted-tropical-cell');
            }

            // Highlight plant if it belongs to the highlighted category
            if (highlightedPlantName === cellData.plant.name) {
                cell.classList.add('gold-highlight-2d');
                cell.style.outline = '3px solid #eab308';
                cell.style.outlineOffset = '-3px';
                cell.style.boxShadow = '0 0 12px rgba(234, 179, 8, 0.8)';
                cell.style.zIndex = '5';
            }

            // Highlight footprint if the crop instance is in the active selection
            const isSelected = selectedPlantGroups.some(g => g && g.userData && g.userData.instanceId === cellData.instanceId);
            if (isSelected) {
                cell.classList.add('selected-footprint');
            }

            if (isEditModeActive) {
                cell.style.cursor = 'grab';
                cell.draggable = false;
                cell.addEventListener('mousedown', (e) => {
                    if (e.button !== 0) return;
                    e.stopPropagation();

                    let hitGroup = gardenGroup3d?.children.find(child => child.name === "cropInstance" && child.userData.instanceId === cellData.instanceId);

                    if (!hitGroup) {
                        hitGroup = {
                            position: new THREE.Vector3(
                                cellData.startC - cols/2 + cellData.diameter/2,
                                0,
                                cellData.startR - rows/2 + cellData.diameter/2
                            ),
                            userData: {
                                name: cellData.plant.name,
                                instanceId: cellData.instanceId,
                                spread: cellData.diameter,
                                drag2DStartR: cellData.startR,
                                drag2DStartC: cellData.startC,
                                originalGridR: cellData.startR,
                                originalGridC: cellData.startC,
                                plant: cellData.plant
                            }
                        };
                    }

                    if (hitGroup) {
                        if (e.shiftKey && selectionAnchorGroup && selectionAnchorGroup !== hitGroup) {
                            const r1 = Math.round(selectionAnchorGroup.position.z + rows/2 - selectionAnchorGroup.userData.spread/2);
                            const c1 = Math.round(selectionAnchorGroup.position.x + cols/2 - selectionAnchorGroup.userData.spread/2);
                            const r2 = Math.round(hitGroup.position.z + rows/2 - hitGroup.userData.spread/2);
                            const c2 = Math.round(hitGroup.position.x + cols/2 - hitGroup.userData.spread/2);

                            const minR = Math.min(r1, r2);
                            const maxR = Math.max(r1, r2);
                            const minC = Math.min(c1, c2);
                            const maxC = Math.max(c1, c2);

                            selectedPlantGroups = [];
                            const seenInstances = new Set();
                            for (let gr = minR; gr <= maxR; gr++) {
                                for (let gc = minC; gc <= maxC; gc++) {
                                    const cellD = currentGridArray[gr]?.[gc];
                                    if (cellD && cellD.type === 'crop' && !seenInstances.has(cellD.instanceId)) {
                                        seenInstances.add(cellD.instanceId);
                                        
                                        let meshGroup = gardenGroup3d?.children.find(child => child.name === "cropInstance" && child.userData.instanceId === cellD.instanceId);
                                        if (!meshGroup) {
                                            meshGroup = {
                                                position: new THREE.Vector3(
                                                    cellD.startC - cols/2 + cellD.diameter/2,
                                                    0,
                                                    cellD.startR - rows/2 + cellD.diameter/2
                                                ),
                                                userData: {
                                                    name: cellD.plant.name,
                                                    instanceId: cellD.instanceId,
                                                    spread: cellD.diameter,
                                                    drag2DStartR: cellD.startR,
                                                    drag2DStartC: cellD.startC,
                                                    originalGridR: cellD.startR,
                                                    originalGridC: cellD.startC,
                                                    plant: cellD.plant
                                                }
                                            };
                                        }
                                        selectedPlantGroups.push(meshGroup);
                                    }
                                }
                            }
                        } else if (e.ctrlKey) {
                            const isAlreadySelected = selectedPlantGroups.some(item => item.userData.instanceId === hitGroup.userData.instanceId);
                            if (isAlreadySelected) {
                                selectedPlantGroups = selectedPlantGroups.filter(item => item.userData.instanceId !== hitGroup.userData.instanceId);
                            } else {
                                selectedPlantGroups.push(hitGroup);
                            }
                            selectionAnchorGroup = hitGroup;
                        } else {
                            const isAlreadySelected = selectedPlantGroups.some(item => item.userData.instanceId === hitGroup.userData.instanceId);
                            if (!isAlreadySelected) {
                                selectedPlantGroups = [hitGroup];
                            }
                            selectionAnchorGroup = hitGroup;
                        }

                        // Update selection highlights in place
                        document.querySelectorAll('.grid-cell.crop').forEach(el => {
                            const instId = el.dataset.instanceId;
                            const isSel = selectedPlantGroups.some(g => g.userData.instanceId === instId);
                            el.classList.toggle('selected-footprint', isSel);
                        });
                    }

                    isDragging2D = true;
                    dragged2DInstanceId = cellData.instanceId;
                    dragged2DCrop = cellData.plant;
                    dragged2DStartR = cellData.startR;
                    dragged2DStartC = cellData.startC;
                    dragged2DDiam = cellData.diameter;

                    const gridRect = gardenGrid.getBoundingClientRect();
                    const cellWidth = gridRect.width / cols;
                    const cellHeight = gridRect.height / rows;

                    const clickX = e.clientX - gridRect.left;
                    const clickY = e.clientY - gridRect.top;
                    const clickC = Math.floor(clickX / cellWidth);
                    const clickR = Math.floor(clickY / cellHeight);

                    dragged2DOffsetC = clickC - cellData.startC;
                    dragged2DOffsetR = clickR - cellData.startR;

                    selectedPlantGroups.forEach(g => {
                        const gr = g.userData.originalGridR;
                        const gc = g.userData.originalGridC;
                        g.userData.drag2DStartR = gr;
                        g.userData.drag2DStartC = gc;
                    });

                    selectedPlantGroups.forEach(g => {
                        document.querySelectorAll(`[data-instance-id="${g.userData.instanceId}"]`).forEach(el => {
                            el.style.opacity = '0.5';
                            el.style.border = '2px dashed #f59e0b';
                        });
                    });
                });
            }

            // Apply organic raised-bed borders around the footprint bounding box
            cell.classList.add('bed-border-top', 'bed-border-bottom', 'bed-border-left', 'bed-border-right');

            // Add exactly one top-down leaf graphic SVG spanning the full growth footprint
            const svgWrapper = document.createElement('div');
            svgWrapper.className = 'plant-svg-wrapper';
            svgWrapper.style.position = 'absolute';
            svgWrapper.style.top = '0';
            svgWrapper.style.left = '0';
            svgWrapper.style.width = '100%';
            svgWrapper.style.height = '100%';
            svgWrapper.style.zIndex = '1';
            svgWrapper.style.pointerEvents = 'none';
            svgWrapper.innerHTML = getPlantSVG(cellData.plant);
            cell.appendChild(svgWrapper);

            // Footprint highlights on hover
            cell.addEventListener('mouseenter', () => {
                cell.classList.add('hovered-footprint');
            });
            cell.addEventListener('mouseleave', () => {
                cell.classList.remove('hovered-footprint');
            });

            // Render plant initials badge in the center
            const colors = getPlantColor(cellData.plant.id);
            const initials = cellData.plant.name.split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase();
            const initialsBadge = document.createElement('div');
            initialsBadge.className = 'crop-initials-pill';
            initialsBadge.style.color = colors.text;
            initialsBadge.style.borderColor = colors.border;
            initialsBadge.textContent = initials;
            cell.appendChild(initialsBadge);

            if (isTropical) {
                cell.title = `${cellData.plant.name} (Potted Tropical - Spread: ${cellData.diameter} ft)`;
            } else {
                cell.title = `${cellData.plant.name} (Spread: ${cellData.diameter} ft)`;
            }

            if (cellData.understory) {
                const underBadge = document.createElement('div');
                underBadge.className = 'understory-badge';
                underBadge.style.position = 'absolute';
                underBadge.style.bottom = '2px';
                underBadge.style.right = '2px';
                underBadge.style.width = '14px';
                underBadge.style.height = '14px';
                underBadge.style.zIndex = '3';
                underBadge.style.borderRadius = '50%';
                underBadge.style.background = 'rgba(16, 185, 129, 0.95)';
                underBadge.style.border = '1px solid #fff';
                underBadge.style.display = 'flex';
                underBadge.style.alignItems = 'center';
                underBadge.style.justifyContent = 'center';
                underBadge.style.fontSize = '7px';
                underBadge.style.fontWeight = '800';
                underBadge.style.color = '#fff';
                
                const uInitials = cellData.understory.name.split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase();
                underBadge.textContent = uInitials;
                underBadge.title = `Understory layer: ${cellData.understory.name}`;
                cell.appendChild(underBadge);
            }

            cellsQueue.push(cell);
        }
    }

    let currentIndex = 0;
    const chunkSize = 1000; // Render 1000 cells per frame to keep browser tab fully responsive

    function renderNext2DChunk() {
        if (activeRenderId !== current2DRenderId) return;

        const limit = Math.min(currentIndex + chunkSize, cellsQueue.length);
        for (let i = currentIndex; i < limit; i++) {
            gardenGrid.appendChild(cellsQueue[i]);
        }

        currentIndex = limit;

        if (currentIndex < cellsQueue.length) {
            requestAnimationFrame(renderNext2DChunk);
        } else {
            // Render rulers once all cells have finished loading into the DOM
            renderRulers(cols, rows, currentCellSize);
        }
    }

    requestAnimationFrame(renderNext2DChunk);
}

// Render static ruler coordinate ticks (Feet & Meters)
function renderRulers(cols, rows, cellWidth) {
    const xRuler = document.getElementById('x-ruler');
    const yRuler = document.getElementById('y-ruler');
    if (!xRuler || !yRuler) return;
    
    // Add 3px margin offsets to perfectly align ticks with outer grid borders
    xRuler.style.marginLeft = '3px';
    yRuler.style.marginTop = '3px';
    
    xRuler.innerHTML = '';
    yRuler.innerHTML = '';
    
    // X-Ruler (Horizontal coordinate ticks)
    for (let i = 0; i <= cols; i++) {
        const tick = document.createElement('div');
        tick.className = 'ruler-tick x-tick';
        tick.style.width = i === cols ? '1px' : `${cellWidth}px`;
        tick.style.flexShrink = '0';
        
        let primary, secondary;
        if (settingsDimUnit === 'm') {
            primary = `${(i * 0.3048).toFixed(1)}m`;
            secondary = `${i}'`;
        } else {
            primary = `${i}'`;
            secondary = `${(i * 0.3048).toFixed(1)}m`;
        }

        tick.innerHTML = `
            <span class="feet-lbl">${primary}</span>
            <span class="meter-lbl">${secondary}</span>
            <div class="tick-line"></div>
        `;
        xRuler.appendChild(tick);
    }
    
    // Y-Ruler (Vertical coordinate ticks)
    for (let i = 0; i <= rows; i++) {
        const tick = document.createElement('div');
        tick.className = 'ruler-tick y-tick';
        tick.style.height = i === rows ? '1px' : `${cellWidth}px`;
        tick.style.flexShrink = '0';
        
        let primary, secondary;
        if (settingsDimUnit === 'm') {
            primary = `${(i * 0.3048).toFixed(1)}m`;
            secondary = `${i}'`;
        } else {
            primary = `${i}'`;
            secondary = `${(i * 0.3048).toFixed(1)}m`;
        }

        tick.innerHTML = `
            <span class="meter-lbl">${secondary}</span>
            <span class="feet-lbl">${primary}</span>
            <div class="tick-line"></div>
        `;
        yRuler.appendChild(tick);
    }
}

// Render Recommendations list & AI advice
function renderRecommendations() {
    const compContainer = document.getElementById('companion-list');
    const antContainer = document.getElementById('antagonist-list');
    const sugContainer = document.getElementById('suggestions-list');
    const aiContainer = document.getElementById('ai-advice-content');

    compContainer.innerHTML = '';
    antContainer.innerHTML = '';
    sugContainer.innerHTML = '';

    // Render companions
    if (lastDesignResponse.companions && lastDesignResponse.companions.length > 0) {
        lastDesignResponse.companions.forEach(c => {
            const item = document.createElement('div');
            item.className = 'rec-item';
            item.innerHTML = `
                <h4><i class="fa-solid fa-heart text-success"></i> ${c.plant} + ${c.companion}</h4>
                <p>${c.description}</p>
            `;
            compContainer.appendChild(item);
        });
    } else {
        compContainer.innerHTML = '<p class="placeholder-text">No companions matched from selection.</p>';
    }

    // Render antagonists with check box toggles as compact bubbles (tooltips on hover)
    if (lastDesignResponse.antagonists && lastDesignResponse.antagonists.length > 0) {
        lastDesignResponse.antagonists.forEach(a => {
            const key = [a.plant, a.antagonist].sort().join('::');
            const isActive = !disabledAntagonists.has(key);
            
            const tag = document.createElement('span');
            tag.className = `tag-large interactive`;
            tag.style.cursor = 'pointer';
            tag.style.display = 'inline-flex';
            tag.style.alignItems = 'center';
            tag.style.gap = '6px';
            tag.title = a.description; // Native tooltip on hover
            
            if (isActive) {
                tag.style.borderColor = 'rgba(239, 68, 68, 0.4)';
                tag.style.backgroundColor = 'rgba(239, 68, 68, 0.08)';
                tag.style.color = '#f87171';
                tag.innerHTML = `<i class="fa-solid fa-square-check" style="color: #ef4444;"></i> ${a.plant} + ${a.antagonist}`;
            } else {
                tag.style.borderColor = 'var(--border-color)';
                tag.style.backgroundColor = 'transparent';
                tag.style.color = 'var(--text-secondary)';
                tag.style.textDecoration = 'line-through';
                tag.innerHTML = `<i class="fa-regular fa-square" style="color: var(--text-secondary);"></i> ${a.plant} + ${a.antagonist}`;
            }
            
            tag.addEventListener('click', () => {
                if (isActive) {
                    disabledAntagonists.add(key);
                } else {
                    disabledAntagonists.delete(key);
                }
                
                // Immediately update layouts with the new separation settings!
                recalculateLayout().then(() => {
                    renderRecommendations();
                });
            });
            antContainer.appendChild(tag);
        });
    } else {
        antContainer.innerHTML = '<p class="placeholder-text">No warnings. Everything looks compatible!</p>';
    }

    // Render suggested additions as toggle checkboxes (add/remove)
    if (lastDesignResponse.suggested_companions && lastDesignResponse.suggested_companions.length > 0) {
        lastDesignResponse.suggested_companions.forEach(sug => {
            const plantObj = allPlants.find(p => p.name === sug);
            const isSelected = plantObj && selectedCrops.some(sc => sc.id === plantObj.id);
            
            const tag = document.createElement('span');
            tag.className = `tag-large interactive ${isSelected ? 'active-sug-tag' : ''}`;
            tag.style.cursor = 'pointer';
            tag.style.display = 'inline-flex';
            tag.style.alignItems = 'center';
            tag.style.gap = '4px';
            
            if (isSelected) {
                tag.innerHTML = `<i class="fa-solid fa-circle-check" style="color: var(--accent-emerald);"></i> ${sug}`;
                tag.style.borderColor = 'var(--accent-emerald)';
                tag.style.backgroundColor = 'rgba(16, 185, 129, 0.1)';
            } else {
                tag.innerHTML = `<i class="fa-solid fa-circle-plus"></i> ${sug}`;
            }
            
            tag.addEventListener('click', () => {
                if (!plantObj) return;
                
                if (isSelected) {
                    const idx = selectedCrops.findIndex(sc => sc.id === plantObj.id);
                    if (idx !== -1) {
                        selectedCrops.splice(idx, 1);
                    }
                } else {
                    addCropTag(plantObj);
                }
                
                renderCropTags();
                submitDesign();
            });
            sugContainer.appendChild(tag);
        });
    } else {
        sugContainer.innerHTML = '<p class="placeholder-text">No suggestions available.</p>';
    }

    // Render AI Advice (simple Markdown to HTML converter)
    if (lastDesignResponse.ai_advice) {
        let html = lastDesignResponse.ai_advice;
        // Basic Markdown replacement for headers, bullets, and bold text
        html = html.replace(/### (.*)/g, '<h3>$1</h3>');
        html = html.replace(/\* (.*)/g, '<li>$1</li>');
        html = html.replace(/- (.*)/g, '<li>$1</li>');
        html = html.replace(/(\* .*?\n)/g, '<ul>$1</ul>');
        html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        html = html.replace(/\n/g, '<br>');
        aiContainer.innerHTML = html;
    } else {
        aiContainer.innerHTML = '<p class="placeholder-text">No AI advice received.</p>';
    }
}

// Update UI Design Summary benefits checklist
function updateBenefitsSection() {
    const box = document.getElementById('benefits-box');
    if (!box) return;
    box.innerHTML = '';

    box.innerHTML += '<li><i class="fa-solid fa-check"></i> Structured planting rows</li>';
    box.innerHTML += '<li><i class="fa-solid fa-check"></i> Standard walkways aligned</li>';

    if (lastDesignResponse && lastDesignResponse.companions.length > 0) {
        box.innerHTML += '<li><i class="fa-solid fa-circle-check text-success"></i> Companion planting active</li>';
    }
    if (lastDesignResponse && lastDesignResponse.antagonists.length > 0) {
        box.innerHTML += '<li><i class="fa-solid fa-triangle-exclamation text-danger"></i> Suspend nightshade proximity</li>';
    }
}

// Render Calendar Timeline Gantt chart
function renderCalendarTimeline() {
    const timelineBody = document.getElementById('timeline-body');
    timelineBody.innerHTML = '';

    if (selectedCrops.length === 0) {
        timelineBody.innerHTML = '<p class="placeholder-text text-center py-4">Add crops and generate a design to display your planting calendar.</p>';
        return;
    }

    // Planting lifecycle templates by plant type
    const lifecycleConfigs = {
        "Vegetable": { start: 2, sow: 2, grow: 2, bloom: 0, harvest: 3, soil: 1 },  // Start Mar, sow Mar-Apr, grow May-Jun, harvest Jul-Sep, soil Oct
        "Herb": { start: 3, sow: 1, grow: 4, bloom: 1, harvest: 3, soil: 0 },
        "Fruit": { start: 1, sow: 0, grow: 4, bloom: 2, harvest: 2, soil: 1 },
        "Flower": { start: 3, sow: 2, grow: 2, bloom: 3, harvest: 0, soil: 1 },
        "Native": { start: 2, sow: 2, grow: 3, bloom: 3, harvest: 0, soil: 1 }
    };

    selectedCrops.forEach(crop => {
        const row = document.createElement('div');
        row.className = 'timeline-row';

        const nameCol = document.createElement('div');
        nameCol.className = 'timeline-cell name-col';
        nameCol.textContent = crop.name;
        row.appendChild(nameCol);

        // Get lifecycle config based on type
        const config = lifecycleConfigs[crop.type] || lifecycleConfigs["Vegetable"];
        
        // Generate Gantt layout segment
        // We will represent monthly slots as grid-column offsets inside the container
        const barContainer = document.createElement('div');
        barContainer.className = 'timeline-bar-container';

        let currentOffset = 0;

        // Sowing segment
        if (config.sow > 0) {
            const segment = document.createElement('div');
            segment.className = 'timeline-bar-segment sowing';
            segment.style.left = `${(currentOffset / 12) * 100}%`;
            segment.style.width = `${(config.sow / 12) * 100}%`;
            barContainer.appendChild(segment);
            currentOffset += config.sow;
        }

        // Growing segment
        if (config.grow > 0) {
            const segment = document.createElement('div');
            segment.className = 'timeline-bar-segment growing';
            segment.style.left = `${(currentOffset / 12) * 100}%`;
            segment.style.width = `${(config.grow / 12) * 100}%`;
            barContainer.appendChild(segment);
            currentOffset += config.grow;
        }

        // Blooming segment
        if (config.bloom > 0) {
            const segment = document.createElement('div');
            segment.className = 'timeline-bar-segment blooming';
            segment.style.left = `${(currentOffset / 12) * 100}%`;
            segment.style.width = `${(config.bloom / 12) * 100}%`;
            barContainer.appendChild(segment);
            currentOffset += config.bloom;
        }

        // Harvesting segment
        if (config.harvest > 0) {
            const segment = document.createElement('div');
            segment.className = 'timeline-bar-segment harvesting';
            segment.style.left = `${(currentOffset / 12) * 100}%`;
            segment.style.width = `${(config.harvest / 12) * 100}%`;
            barContainer.appendChild(segment);
            currentOffset += config.harvest;
        }

        // Soil Care segment
        if (config.soil > 0) {
            const segment = document.createElement('div');
            segment.className = 'timeline-bar-segment soilcare';
            segment.style.left = `${(currentOffset / 12) * 100}%`;
            segment.style.width = `${(config.soil / 12) * 100}%`;
            barContainer.appendChild(segment);
        }

        row.appendChild(barContainer);
        timelineBody.appendChild(row);
    });
}

// ==================== THREE.JS 3D LAYOUT SYSTEM ====================
let scene3d, camera3d, renderer3d, gardenGroup3d, dirLight, visualsParentGroup;
let current2DRenderId = 0;
let current3DRenderId = 0;
let isAutoBalanceEnabled = true;
let isSunAnimationPlaying = false;
let shadowStretchVal = 1.0;
let shadowContrastVal = 0.8;
let sunSpeedVal = 1.0;
const plantTextureCache = new Map();
const plantModelCache = new Map();
let raycaster3d, mouse3d;
let lastHoveredGroup = null;
let isDragging3d = false;
let dragButton3d = 0; // 0 for left (rotation), 2 for right (panning)
let cameraTarget3d = null;
let previousMousePosition3d = { x: 0, y: 0 };
let cameraOrbitAngleY = 0; // in radians
let cameraOrbitAngleX = 0; // in radians
let gardenOrientationAngle = 0; // in degrees
let isSunPathActive = false;
let sunArcLine = null;
let sunSphereMesh = null;
let sunTime = 0; // 0 to PI
let staticEnvCompass = null;

// 3D Layout Editor Global States
let isEditModeActive = false;
let selectedPlantGroups = [];
let selectionHelpers3D = [];
let isDraggingPlant = false;
let dragPlane3d = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
let isDrawingSelectionBox = false;
let selectionBoxStart = new THREE.Vector2();
let selectionBoxEnd = new THREE.Vector2();
let isManualEdit = false;
let shouldResetCamera3D = true;
let selectionAnchorGroup = null;

// 2D CAD Layout Dragging Global States
let isDragging2D = false;
let dragged2DInstanceId = null;
let dragged2DCrop = null;
let dragged2DStartR = 0;
let dragged2DStartC = 0;
let dragged2DDiam = 0;
let dragged2DOffsetR = 0;
let dragged2DOffsetC = 0;
let lastMouse2D = { x: 0, y: 0 };
let isDrawingSelectionBox2D = false;
let selectionBoxStart2D = new THREE.Vector2();
let selectionBoxEnd2D = new THREE.Vector2();

// Delayed Drag snap preview states
let dragPreviewTimeout = null;
let previewHelpers3D = [];

let canvasResizeObserver = null;

function setupResizeObservers() {
    if (canvasResizeObserver) return;
    
    const container3d = document.getElementById('3d-canvas-container');
    const viewport2d = document.getElementById('cad-viewport-container');
    
    if (typeof ResizeObserver !== 'undefined') {
        canvasResizeObserver = new ResizeObserver((entries) => {
            requestAnimationFrame(() => {
                for (let entry of entries) {
                    if (entry.target === container3d) {
                        resize3D();
                    } else if (entry.target === viewport2d) {
                        if (viewport2d && !viewport2d.classList.contains('hidden') && currentWidth && currentHeight) {
                            renderLayoutGrid(currentWidth, currentHeight);
                        }
                    }
                }
            });
        });
        
        if (container3d) canvasResizeObserver.observe(container3d);
        if (viewport2d) canvasResizeObserver.observe(viewport2d);
    }
}

function resize3D() {
    const container = document.getElementById('3d-canvas-container');
    if (container && renderer3d && camera3d) {
        const width = container.clientWidth;
        const height = container.clientHeight;
        console.log("[DEBUG resize3D] container clientWidth:", width, "clientHeight:", height);
        if (width > 0 && height > 0) {
            camera3d.aspect = width / height;
            camera3d.updateProjectionMatrix();
            renderer3d.setSize(width, height);
            renderer3d.render(scene3d, camera3d);
        }
    }
}

// Handle window resize events for both 2D and 3D views as fallback
window.addEventListener('resize', () => {
    resize3D();
    
    // Rescale 2D CAD blueprint layout if visible
    const viewport = document.getElementById('cad-viewport-container');
    if (viewport && !viewport.classList.contains('hidden') && currentWidth && currentHeight) {
        renderLayoutGrid(currentWidth, currentHeight);
    }
});

function init3D() {
    const container = document.getElementById('3d-canvas-container');
    console.log("[DEBUG init3D] container exists:", !!container);
    if (container) {
        console.log("[DEBUG init3D] client size:", container.clientWidth, "x", container.clientHeight, "display style:", window.getComputedStyle(container).display);
    }
    if (!container || !window.THREE || scene3d) {
        // Even if scene3d is initialized, container resize might have happened
        if (scene3d) resize3D();
        return; 
    }

    cameraTarget3d = new THREE.Vector3(0, 0, 0);

    // Create scene, camera, renderer
    scene3d = new THREE.Scene();
    scene3d.background = new THREE.Color(0x060909); // Matches visual theme background!

    camera3d = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 1, 1000);
    camera3d.position.set(0, 35, 55);

    renderer3d = new THREE.WebGLRenderer({ antialias: true });
    renderer3d.setSize(container.clientWidth, container.clientHeight);
    renderer3d.shadowMap.enabled = true;
    // Preserve overlays defined in HTML
    const clock = document.getElementById('3d-solar-clock');
    const controls = document.getElementById('3d-solar-controls');
    
    container.innerHTML = '';
    if (clock) container.appendChild(clock);
    if (controls) container.appendChild(controls);
    
    // Recreate the glassmorphic tooltip programmatically to prevent container-clear deletion
    const tooltip = document.createElement('div');
    tooltip.id = '3d-tooltip';
    tooltip.style.position = 'absolute';
    tooltip.style.display = 'none';
    tooltip.style.background = 'rgba(12, 16, 15, 0.94)';
    tooltip.style.border = '1px solid var(--accent-emerald)';
    tooltip.style.borderRadius = 'var(--radius-md)';
    tooltip.style.padding = '10px 14px';
    tooltip.style.fontSize = '11px';
    tooltip.style.zIndex = '1000';
    tooltip.style.pointerEvents = 'none';
    tooltip.style.boxShadow = 'var(--shadow-lg)';
    tooltip.style.width = 'max-content';
    tooltip.style.maxWidth = '240px';
    tooltip.style.color = 'var(--text-primary)';
    tooltip.style.transition = 'opacity 0.15s';
    tooltip.innerHTML = `
        <strong id="tooltip-name" style="color: var(--accent-emerald); display: block; font-size: 12px; margin-bottom: 2px;">Plant</strong>
        <span id="tooltip-meta" style="color: var(--text-secondary); font-size: 10px; display: block; margin-bottom: 4px; font-weight: 600;">Type</span>
        <p id="tooltip-desc" style="margin: 0; line-height: 1.35; color: rgba(255,255,255,0.75);">Description</p>
    `;
    container.appendChild(tooltip);
    container.appendChild(renderer3d.domElement);

    // Light Setup
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.45);
    scene3d.add(ambientLight);

    dirLight = new THREE.DirectionalLight(0xffffff, 0.75);
    dirLight.position.set(20, 50, 20);
    dirLight.castShadow = true;

    // Group Containers
    visualsParentGroup = new THREE.Group();
    scene3d.add(visualsParentGroup);

    visualsParentGroup.add(dirLight);
    visualsParentGroup.add(dirLight.target);

    gardenGroup3d = new THREE.Group();
    visualsParentGroup.add(gardenGroup3d);

    // Initialize Raycaster and Mouse vector
    raycaster3d = new THREE.Raycaster();
    mouse3d = new THREE.Vector2(-9999, -9999);

    // Prevent default context menu (right click) inside the 3D WebGL viewport
    renderer3d.domElement.addEventListener('contextmenu', (e) => e.preventDefault());

    // Recreate screenspace selection box overlay for multi-selection dragging
    const boxDiv = document.createElement('div');
    boxDiv.id = 'selection-box-overlay';
    boxDiv.style.position = 'absolute';
    boxDiv.style.border = '1.5px dashed #f59e0b';
    boxDiv.style.backgroundColor = 'rgba(245, 158, 11, 0.15)';
    boxDiv.style.display = 'none';
    boxDiv.style.pointerEvents = 'none';
    boxDiv.style.zIndex = '999';
    container.appendChild(boxDiv);

    // Mouse drag rotation (left click), panning (right click) and raycast selection/dragging tracking
    renderer3d.domElement.addEventListener('mousedown', (e) => {
        const rect = renderer3d.domElement.getBoundingClientRect();
        mouse3d.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        mouse3d.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

        if (isEditModeActive && e.button === 0) { // Left click in Edit Layout Mode
            raycaster3d.setFromCamera(mouse3d, camera3d);
            const intersects = raycaster3d.intersectObjects(gardenGroup3d.children, true);
            let hitGroup = null;

            for (let i = 0; i < intersects.length; i++) {
                let obj = intersects[i].object;
                while (obj && obj !== scene3d) {
                    if (obj.parent === gardenGroup3d && obj.name === "cropInstance") {
                        hitGroup = obj;
                        break;
                    }
                    obj = obj.parent;
                }
                if (hitGroup) break;
            }

            if (hitGroup) {
                // Clicked an actual plant
                isDraggingPlant = true;

                // Update selection lists supporting Shift-range select and Ctrl-toggle select
                const cols = currentGridArray[0].length;
                const rows = currentGridArray.length;

                if (e.shiftKey && selectionAnchorGroup && selectionAnchorGroup !== hitGroup) {
                    const r1 = Math.round(selectionAnchorGroup.position.z + rows/2 - selectionAnchorGroup.userData.spread/2);
                    const c1 = Math.round(selectionAnchorGroup.position.x + cols/2 - selectionAnchorGroup.userData.spread/2);
                    const r2 = Math.round(hitGroup.position.z + rows/2 - hitGroup.userData.spread/2);
                    const c2 = Math.round(hitGroup.position.x + cols/2 - hitGroup.userData.spread/2);

                    const minR = Math.min(r1, r2);
                    const maxR = Math.max(r1, r2);
                    const minC = Math.min(c1, c2);
                    const maxC = Math.max(c1, c2);

                    selectedPlantGroups = [];
                    gardenGroup3d.children.forEach(child => {
                        if (child.name === "cropInstance") {
                            const cr = Math.round(child.position.z + rows/2 - child.userData.spread/2);
                            const cc = Math.round(child.position.x + cols/2 - child.userData.spread/2);
                            if (cr >= minR && cr <= maxR && cc >= minC && cc <= maxC) {
                                if (!selectedPlantGroups.includes(child)) {
                                    selectedPlantGroups.push(child);
                                }
                            }
                        }
                    });
                } else if (e.ctrlKey) {
                    if (selectedPlantGroups.includes(hitGroup)) {
                        const idx = selectedPlantGroups.indexOf(hitGroup);
                        selectedPlantGroups.splice(idx, 1);
                    } else {
                        selectedPlantGroups.push(hitGroup);
                    }
                    selectionAnchorGroup = hitGroup;
                } else {
                    if (!selectedPlantGroups.includes(hitGroup)) {
                        selectedPlantGroups = [hitGroup];
                    }
                    selectionAnchorGroup = hitGroup;
                }

                // Project hit position onto the ground drag plane and convert to local space
                const intersectPt = new THREE.Vector3();
                raycaster3d.ray.intersectPlane(dragPlane3d, intersectPt);
                const localIntersectPt = intersectPt.clone();
                gardenGroup3d.worldToLocal(localIntersectPt);

                // Setup drag starts and relative offset distances in local coordinate space
                selectedPlantGroups.forEach(g => {
                    g.userData.dragStartPos = g.position.clone();
                    g.userData.dragOffset = new THREE.Vector3().subVectors(g.position, localIntersectPt);

                    const cols = currentGridArray[0].length;
                    const rows = currentGridArray.length;
                    g.userData.originalGridR = Math.round(g.position.z + rows/2 - g.userData.spread/2);
                    g.userData.originalGridC = Math.round(g.position.x + cols/2 - g.userData.spread/2);
                });
            } else {
                // Clicked on grass lawn: start screenspace selection box drawing
                isDrawingSelectionBox = true;
                selectionBoxStart.set(e.clientX - rect.left, e.clientY - rect.top);
                selectionBoxEnd.copy(selectionBoxStart);

                if (!e.shiftKey && !e.ctrlKey) {
                    selectedPlantGroups = [];
                }
            }
            update3DSelectionHighlights();
        } else {
            // Normal view orbiting/panning camera moves
            isDragging3d = true;
            dragButton3d = e.button; // 0 for left (orbit), 2 for right (pan)
        }

        previousMousePosition3d = {
            x: e.clientX,
            y: e.clientY
        };
    });

    renderer3d.domElement.addEventListener('mousemove', (e) => {
        const deltaMove = {
            x: e.clientX - previousMousePosition3d.x,
            y: e.clientY - previousMousePosition3d.y
        };

        const rect = renderer3d.domElement.getBoundingClientRect();
        mouse3d.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        mouse3d.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

        if (isDraggingPlant) {
            // Project ray onto ground plane and translate all selected plant meshes in local space
            raycaster3d.setFromCamera(mouse3d, camera3d);
            const intersectPt = new THREE.Vector3();
            if (raycaster3d.ray.intersectPlane(dragPlane3d, intersectPt)) {
                const localIntersectPt = intersectPt.clone();
                gardenGroup3d.worldToLocal(localIntersectPt);

                selectedPlantGroups.forEach(g => {
                    const targetPos = new THREE.Vector3().addVectors(localIntersectPt, g.userData.dragOffset);
                    targetPos.y = 0; // Force Y coordinate to be exactly 0 (no dipping below garden plane)
                    g.position.copy(targetPos);
                });
                
                update3DSelectionHighlights();
            }

            // Clear preview snap-highlights and hide them while moving
            clearTimeout(dragPreviewTimeout);
            previewHelpers3D.forEach(h => { h.visible = false; });

            // Start snap-highlight preview timer
            dragPreviewTimeout = setTimeout(() => {
                if (!isDraggingPlant) return;

                const cols = currentGridArray[0].length;
                const rows = currentGridArray.length;

                // Deep copy grid layout state
                let tempGrid = Array(rows).fill(null).map((_, r) => [...currentGridArray[r]]);

                // Clear original footprints of dragged plants
                selectedPlantGroups.forEach(g => {
                    const origR = g.userData.originalGridR;
                    const origC = g.userData.originalGridC;
                    const diam = g.userData.spread;
                    for (let dr = 0; dr < diam; dr++) {
                        for (let dc = 0; dc < diam; dc++) {
                            if (origR + dr < rows && origC + dc < cols) {
                                if (tempGrid[origR + dr][origC + dc]?.instanceId === g.userData.instanceId) {
                                    tempGrid[origR + dr][origC + dc] = null;
                                }
                            }
                        }
                    }
                });

                // Position and display 3D translucent snap helpers
                selectedPlantGroups.forEach((g, idx) => {
                    const newStartC = Math.round(g.position.x + cols/2 - g.userData.spread/2);
                    const newStartR = Math.round(g.position.z + rows/2 - g.userData.spread/2);
                    const diam = g.userData.spread;

                    const inBounds = (newStartR >= 0 && newStartR + diam <= rows && newStartC >= 0 && newStartC + diam <= cols);
                    let valid = inBounds;

                    if (inBounds) {
                        for (let dr = 0; dr < diam; dr++) {
                            for (let dc = 0; dc < diam; dc++) {
                                if (tempGrid[newStartR + dr][newStartC + dc] !== null) {
                                    valid = false;
                                    break;
                                }
                            }
                            if (!valid) break;
                        }
                    }

                    // Get or create helper mesh
                    let helper = previewHelpers3D[idx];
                    if (!helper) {
                        const geom = new THREE.PlaneGeometry(1, 1);
                        geom.rotateX(-Math.PI / 2);
                        const mat = new THREE.MeshBasicMaterial({
                            color: 0x10b981,
                            transparent: true,
                            opacity: 0.35,
                            side: THREE.DoubleSide
                        });
                        helper = new THREE.Mesh(geom, mat);
                        scene3d.add(helper);
                        previewHelpers3D[idx] = helper;
                    }

                    // Update helper position at snapped grid coordinate center (slightly elevated at y=0.03 to avoid z-fighting)
                    const snappedX = newStartC - cols/2 + diam/2;
                    const snappedZ = newStartR - rows/2 + diam/2;
                    helper.position.set(snappedX, 0.03, snappedZ);
                    helper.scale.set(diam, 1, diam);
                    helper.material.color.setHex(valid ? 0x10b981 : 0xef4444);
                    helper.visible = true;

                    // Temporarily occupy in tempGrid to prevent overlaps with other dragged groups
                    if (inBounds) {
                        for (let dr = 0; dr < diam; dr++) {
                            for (let dc = 0; dc < diam; dc++) {
                                tempGrid[newStartR + dr][newStartC + dc] = { occupied: true };
                            }
                        }
                    }
                });
            }, 350);
        } else if (isDrawingSelectionBox) {
            // Draw screenspace selection box and check mesh screen projection coordinates
            selectionBoxEnd.set(e.clientX - rect.left, e.clientY - rect.top);

            const box = document.getElementById('selection-box-overlay');
            if (box) {
                const left = Math.min(selectionBoxStart.x, selectionBoxEnd.x);
                const top = Math.min(selectionBoxStart.y, selectionBoxEnd.y);
                const width = Math.abs(selectionBoxStart.x - selectionBoxEnd.x);
                const height = Math.abs(selectionBoxStart.y - selectionBoxEnd.y);
                box.style.left = `${left}px`;
                box.style.top = `${top}px`;
                box.style.width = `${width}px`;
                box.style.height = `${height}px`;
                box.style.display = 'block';
            }

            const minX = Math.min(selectionBoxStart.x, selectionBoxEnd.x);
            const maxX = Math.max(selectionBoxStart.x, selectionBoxEnd.x);
            const minY = Math.min(selectionBoxStart.y, selectionBoxEnd.y);
            const maxY = Math.max(selectionBoxStart.y, selectionBoxEnd.y);

            gardenGroup3d.children.forEach(g => {
                if (g.name === "cropInstance") {
                    const pos = new THREE.Vector3();
                    g.getWorldPosition(pos);
                    pos.project(camera3d);

                    const screenX = ((pos.x + 1) * rect.width) / 2;
                    const screenY = (-(pos.y - 1) * rect.height) / 2;

                    if (screenX >= minX && screenX <= maxX && screenY >= minY && screenY <= maxY) {
                        if (!selectedPlantGroups.includes(g)) {
                            selectedPlantGroups.push(g);
                        }
                    } else if (!e.shiftKey && !e.ctrlKey) {
                        const idx = selectedPlantGroups.indexOf(g);
                        if (idx !== -1) selectedPlantGroups.splice(idx, 1);
                    }
                }
            });
            update3DSelectionHighlights();
        } else if (isDragging3d) {
            // View camera orbits and translation pans
            if (dragButton3d === 0) {
                cameraOrbitAngleY += deltaMove.x * 0.007;
                cameraOrbitAngleX += deltaMove.y * 0.007;
                cameraOrbitAngleX = Math.max(-Math.PI / 3, Math.min(Math.PI / 6, cameraOrbitAngleX));
                
                if (visualsParentGroup) {
                    visualsParentGroup.rotation.y = cameraOrbitAngleY;
                    visualsParentGroup.rotation.x = cameraOrbitAngleX;
                }
                update3DCompass();
            } else if (dragButton3d === 2) {
                const dist = camera3d.position.distanceTo(cameraTarget3d);
                const panSpeed = Math.max(0.01, dist * 0.0018);
                const rightVec = new THREE.Vector3(1, 0, 0).applyQuaternion(camera3d.quaternion);
                const upVec = new THREE.Vector3(0, 1, 0).applyQuaternion(camera3d.quaternion);
                const panX = -deltaMove.x * panSpeed;
                const panY = deltaMove.y * panSpeed;
                const translation = new THREE.Vector3()
                    .addScaledVector(rightVec, panX)
                    .addScaledVector(upVec, panY);
                camera3d.position.add(translation);
                cameraTarget3d.add(translation);
                camera3d.lookAt(cameraTarget3d);
            }
        }

        previousMousePosition3d = {
            x: e.clientX,
            y: e.clientY
        };

        const tooltip = document.getElementById('3d-tooltip');
        if (tooltip && !isEditModeActive) {
            tooltip.style.left = `${e.clientX - rect.left + 15}px`;
            tooltip.style.top = `${e.clientY - rect.top + 15}px`;
        }
    });

    renderer3d.domElement.addEventListener('mouseleave', () => {
        const tooltip = document.getElementById('3d-tooltip');
        if (tooltip) tooltip.style.display = 'none';
        mouse3d.set(-9999, -9999);
    });

    window.addEventListener('blur', () => {
        isDragging3d = false;
        if (typeof isDraggingDial !== 'undefined') isDraggingDial = false;
        isDraggingPlant = false;
        isDrawingSelectionBox = false;
        document.body.style.cursor = '';
    });

    window.addEventListener('mouseup', (e) => {
        isDragging3d = false;

        // Clear snap preview timer, helper meshes, and CSS grid overlays
        clearTimeout(dragPreviewTimeout);
        previewHelpers3D.forEach(h => { h.visible = false; });
        document.querySelectorAll('.grid-cell').forEach(el => {
            el.classList.remove('drag-preview-valid', 'drag-preview-invalid');
        });

        if (isDrawingSelectionBox) {
            isDrawingSelectionBox = false;
            const box = document.getElementById('selection-box-overlay');
            if (box) box.style.display = 'none';
        }

        if (isDraggingPlant) {
            isDraggingPlant = false;
            const cols = currentGridArray[0].length;
            const rows = currentGridArray.length;

            let canMoveAll = true;
            let newPlacements = [];

            // Temporary grid deep-copy for movement collision validation checks
            let tempGrid = Array(rows).fill(null).map((_, r) => [...currentGridArray[r]]);

            // Clear original grid locations of the dragged plants to allow self-overlap snapping
            selectedPlantGroups.forEach(g => {
                const origR = g.userData.originalGridR;
                const origC = g.userData.originalGridC;
                const diam = g.userData.spread;
                for (let dr = 0; dr < diam; dr++) {
                    for (let dc = 0; dc < diam; dc++) {
                        if (origR + dr < rows && origC + dc < cols) {
                            if (tempGrid[origR + dr][origC + dc]?.instanceId === g.userData.instanceId ||
                                tempGrid[origR + dr][origC + dc]?.name === g.userData.name) {
                                tempGrid[origR + dr][origC + dc] = null;
                            }
                        }
                    }
                }
            });

            // Validate snapped boundaries, path intersections, and non-companion overlaps
            selectedPlantGroups.forEach(g => {
                const newStartC = Math.round(g.position.x + cols/2 - g.userData.spread/2);
                const newStartR = Math.round(g.position.z + rows/2 - g.userData.spread/2);
                const diam = g.userData.spread;

                if (newStartR < 0 || newStartR + diam > rows || newStartC < 0 || newStartC + diam > cols) {
                    canMoveAll = false;
                    return;
                }

                for (let dr = 0; dr < diam; dr++) {
                    for (let dc = 0; dc < diam; dc++) {
                        if (tempGrid[newStartR + dr][newStartC + dc] !== null) {
                            canMoveAll = false; // Grid space is occupied by path or other crop block
                            return;
                        }
                    }
                }

                // Occupy temp cells to prevent multi-selection overlaps blocking each other
                for (let dr = 0; dr < diam; dr++) {
                    for (let dc = 0; dc < diam; dc++) {
                        tempGrid[newStartR + dr][newStartC + dc] = { occupied: true };
                    }
                }

                newPlacements.push({
                    group: g,
                    r: newStartR,
                    c: newStartC
                });
            });

            if (canMoveAll) {
                // Clear old coordinates in main database grid array
                selectedPlantGroups.forEach(g => {
                    const origR = g.userData.originalGridR;
                    const origC = g.userData.originalGridC;
                    const diam = g.userData.spread;
                    for (let dr = 0; dr < diam; dr++) {
                        for (let dc = 0; dc < diam; dc++) {
                            if (origR + dr < rows && origC + dc < cols) {
                                currentGridArray[origR + dr][origC + dc] = null;
                            }
                        }
                    }
                });

                // Write new snapped placements to main database grid array
                newPlacements.forEach(placement => {
                    const g = placement.group;
                    const newR = placement.r;
                    const newC = placement.c;
                    const diam = g.userData.spread;

                    const plantObj = allPlants.find(p => p.name === g.userData.name);
                    const instanceId = `${plantObj?.id || 'manual'}_${newR}_${newC}`;

                    for (let dr = 0; dr < diam; dr++) {
                        for (let dc = 0; dc < diam; dc++) {
                            currentGridArray[newR + dr][newC + dc] = {
                                type: 'crop',
                                plant: plantObj,
                                instanceId: instanceId,
                                isCenter: (dr === Math.floor(diam / 2) && dc === Math.floor(diam / 2)),
                                isTopLeft: (dr === 0 && dc === 0),
                                diameter: diam,
                                startR: newR,
                                startC: newC
                            };
                        }
                    }

                    // Move mesh position to exact snapped coordinates center
                    const snappedX = newC - cols/2 + diam/2;
                    const snappedZ = newR - rows/2 + diam/2;
                    g.position.set(snappedX, 0, snappedZ);

                    // Sync metadata
                    g.userData.originalGridR = newR;
                    g.userData.originalGridC = newC;
                    g.userData.instanceId = instanceId;
                });

                // Update 2D CAD Blueprint view
                isManualEdit = true;
                renderLayoutGrid(currentWidth, currentHeight);
                isManualEdit = false;

                // Re-render 3D viewport scene to redraw frame/soil meshes and update metrics
                trigger3DRender();
            } else {
                // Invalid: Snap mesh coordinates back to original starting positions
                selectedPlantGroups.forEach(g => {
                    const origX = g.userData.originalGridC - cols/2 + g.userData.spread/2;
                    const origZ = g.userData.originalGridR - rows/2 + g.userData.spread/2;
                    g.position.set(origX, 0, origZ);
                });
            }
        }
        update3DSelectionHighlights();
    });

    // Zooming inside 3D viewport relative to the dynamic cameraTarget3d focus
    renderer3d.domElement.addEventListener('wheel', (e) => {
        e.preventDefault();
        const target = cameraTarget3d;
        const dir = new THREE.Vector3().subVectors(target, camera3d.position).normalize();
        
        // Dynamically scale speed relative to distance to make zooming smooth
        const currentDist = camera3d.position.distanceTo(cameraTarget3d);
        const zoomSpeed = Math.max(8, currentDist * 0.12);
        const zoomAmount = (e.deltaY < 0 ? 1 : -1) * zoomSpeed * 0.35;
        
        const newPos = camera3d.position.clone().addScaledVector(dir, zoomAmount);
        
        // Clamp distance bounds between 8 ft and 800 ft
        const dist = newPos.distanceTo(cameraTarget3d);
        if (dist > 8 && dist < 800) {
            camera3d.position.copy(newPos);
        }
        camera3d.lookAt(cameraTarget3d);
    }, { passive: false });

    animate3D();
}

function animate3D() {
    if (!renderer3d) return;
    requestAnimationFrame(animate3D);

    // Pulsate the gold highlight helper wireframes in 3D
    if (active3DHighlightHelpers.length > 0) {
        const pulse = 0.35 + 0.45 * Math.sin(Date.now() * 0.005);
        active3DHighlightHelpers.forEach(helper => {
            if (helper.material) {
                helper.material.opacity = pulse;
            }
        });
    }

    // Sun Animation Track Playback
    if (isSunAnimationPlaying && isSunPathActive && sunSphereMesh && dirLight) {
        // Increment sunTime smoothly based on simulation speed slider
        sunTime += 0.008 * sunSpeedVal;
        if (sunTime > Math.PI) {
            sunTime = 0; // Wrap around sunrise to sunset
        }

        const zipInput = document.getElementById('input-zip')?.value || "48195";
        const latitude = getLatitudeFromZip(zipInput);
        const latRad = latitude * Math.PI / 180;
        
        const cols = (typeof currentWidth !== 'undefined' ? currentWidth : 30);
        const rows = (typeof currentHeight !== 'undefined' ? currentHeight : 30);
        const radius = Math.max(cols, rows) * 1.5;

        // Calculate sun position along tilted celestial arc
        const x = -radius * Math.cos(sunTime);
        const y = radius * Math.sin(sunTime) * Math.cos(latRad);
        const z = radius * Math.sin(sunTime) * Math.sin(latRad);

        // Update sun sphere mesh position (always stays on original celestial path)
        sunSphereMesh.position.set(x, y, z);

        // Update directional light position to cast shadows from the sun's position.
        // We divide the height (Y) by the shadow stretch multiplier to lower the light's height,
        // which physically stretches the cast shadows horizontally!
        dirLight.position.set(x, y / shadowStretchVal, z);

        // Dynamic light color and intensity adjustments based on altitude
        const sinAlt = y / radius; // sin of sun altitude
        
        // Ambient light adjusts down to create high-contrast shadows based on Shadow Contrast slider
        const ambient = scene3d.children.find(c => c.isAmbientLight);
        if (ambient) {
            const baseAmbient = 0.45 * (1 - shadowContrastVal);
            ambient.intensity = baseAmbient + 0.35 * Math.max(0, sinAlt);
        }

        if (sinAlt > 0) {
            // Exaggerate directional light intensity if contrast is high to make shadows look extra bold
            dirLight.intensity = (0.1 + 0.8 * sinAlt) * (1 + shadowContrastVal * 0.4);

            // Warm orange/yellow for sunrise/sunset, crisp white for solar noon
            const r = 1.0;
            const g = 0.6 + 0.4 * Math.max(0, sinAlt);
            const b = 0.2 + 0.8 * Math.max(0, sinAlt);
            dirLight.color.setRGB(r, g, b);
            
            dirLight.castShadow = true;
        } else {
            // Sun is below horizon (night)
            dirLight.intensity = 0.0;
            dirLight.castShadow = false;
        }

        // Clock time display mapping sunTime (0 to PI) to 6:00 AM - 6:00 PM
        const totalMins = 6 * 60 + (sunTime / Math.PI) * 12 * 60;
        const hour = Math.floor(totalMins / 60) % 24;
        const mins = Math.floor(totalMins % 60);

        const ampm = hour >= 12 ? 'PM' : 'AM';
        const dispHour = hour % 12 === 0 ? 12 : hour % 12;
        const dispMins = mins < 10 ? '0' + mins : mins;
        const clockText = `${dispHour}:${dispMins} ${ampm}`;
        const clockEl = document.getElementById('solar-clock-text');
        if (clockEl) clockEl.textContent = clockText;
    }

    // Raycast intersections lookup for plant labels and specs
    if (raycaster3d && camera3d && gardenGroup3d && mouse3d.x > -9900) {
        raycaster3d.setFromCamera(mouse3d, camera3d);
        const intersects = raycaster3d.intersectObjects(gardenGroup3d.children, true);
        
        let foundGroup = null;
        for (let i = 0; i < intersects.length; i++) {
            let obj = intersects[i].object;
            while (obj && obj !== scene3d) {
                if (obj.parent === gardenGroup3d && obj.name === "cropInstance") {
                    foundGroup = obj;
                    break;
                }
                obj = obj.parent;
            }
            if (foundGroup) break;
        }

        const tooltip = document.getElementById('3d-tooltip');
        
        if (foundGroup) {
            // Apply hover visual highlighting
            if (foundGroup !== lastHoveredGroup) {
                lastHoveredGroup = foundGroup;
            }

            if (tooltip && !isEditModeActive) {
                const info = foundGroup.userData;
                document.getElementById('tooltip-name').textContent = info.name;
                let spreadVal = `${info.spread} ft`;
                if (settingsDimUnit === 'm') {
                    spreadVal = `${(info.spread * 0.3048).toFixed(1)} m`;
                }
                document.getElementById('tooltip-meta').textContent = `${info.type} • Spread: ${spreadVal} • Sun: ${info.sun}`;
                document.getElementById('tooltip-desc').textContent = info.description || "No description available.";
                tooltip.style.display = 'block';
            }
        } else {
            lastHoveredGroup = null;
            if (tooltip) {
                tooltip.style.display = 'none';
            }
        }
    }

    // Color highlights based on Selection (yellow) and Hover (emerald) state
    if (gardenGroup3d) {
        gardenGroup3d.children.forEach(g => {
            if (g.name === "cropInstance") {
                const isSelected = selectedPlantGroups.includes(g);
                const isHovered = (g === lastHoveredGroup);

                if (isSelected) {
                    g.userData.frame.material.color.setHex(0xf59e0b); // Gold wood border
                    g.userData.soil.material.color.setHex(0x3a2e12);  // Gold compost soil surface
                } else if (isHovered) {
                    g.userData.frame.material.color.setHex(0x10b981); // Emerald wood border
                    g.userData.soil.material.color.setHex(0x1a3322);  // Forest green soil surface
                } else {
                    g.userData.frame.material.color.setHex(0x3d2b22); // Default retaining frame wood
                    g.userData.soil.material.color.setHex(0x160f0a);  // Default organic dark soil compost
                }
            }
        });
    }

    update3DCompass();
    renderer3d.render(scene3d, camera3d);
}

function trigger3DRender() {
    if (currentGridArray) {
        update3DLayout(currentWidth, currentHeight, currentGridArray);
    }
}

function disposeNode(node) {
    if (node.geometry) node.geometry.dispose();
    if (node.material) {
        if (Array.isArray(node.material)) {
            node.material.forEach(m => {
                if (m.map) m.map.dispose();
                m.dispose();
            });
        } else {
            if (node.material.map) node.material.map.dispose();
            node.material.dispose();
        }
    }
}

function clearGarden3D() {
    const disposedGeometries = new Set();
    const disposedMaterials = new Set();
    
    const safeDisposeNode = (node) => {
        const geom = node.geometry;
        const mat = node.material;
        
        if (geom && !disposedGeometries.has(geom)) {
            geom.dispose();
            disposedGeometries.add(geom);
        }
        
        if (mat) {
            const matArr = Array.isArray(mat) ? mat : [mat];
            matArr.forEach(m => {
                if (m && !disposedMaterials.has(m)) {
                    if (m.map) m.map.dispose();
                    m.dispose();
                    disposedMaterials.add(m);
                }
            });
        }
    };

    // Clear selection helpers
    selectionHelpers3D.forEach(helper => {
        scene3d.remove(helper);
        safeDisposeNode(helper);
    });
    selectionHelpers3D = [];

    // Clear environment compass rose and solar path meshes
    if (staticEnvCompass) {
        if (visualsParentGroup) visualsParentGroup.remove(staticEnvCompass);
        staticEnvCompass.traverse(node => {
            safeDisposeNode(node);
        });
        staticEnvCompass = null;
    }
    if (sunArcLine) {
        if (visualsParentGroup) visualsParentGroup.remove(sunArcLine);
        safeDisposeNode(sunArcLine);
        sunArcLine = null;
    }
    if (sunSphereMesh) {
        if (visualsParentGroup) visualsParentGroup.remove(sunSphereMesh);
        safeDisposeNode(sunSphereMesh);
        sunSphereMesh = null;
    }

    if (!gardenGroup3d) return;

    gardenGroup3d.traverse(node => {
        if (node instanceof THREE.Mesh) {
            safeDisposeNode(node);
        }
    });

    // Dispose textures to free GPU memory
    plantTextureCache.forEach(texture => {
        texture.dispose();
    });
    plantTextureCache.clear();

    // Dispose cached 3D models to free GPU memory
    plantModelCache.forEach(group => {
        group.traverse(node => {
            if (node instanceof THREE.Mesh) {
                safeDisposeNode(node);
            }
        });
    });
    plantModelCache.clear();
    
    while (gardenGroup3d.children.length > 0) {
        gardenGroup3d.remove(gardenGroup3d.children[0]);
    }
}

function getPlantEmoji(plantName) {
    const name = plantName.toLowerCase();
    if (name.includes("tomato")) return "🍅";
    if (name.includes("basil")) return "🌿";
    if (name.includes("oregano")) return "🍃";
    if (name.includes("thyme")) return "🌱";
    if (name.includes("rosemary")) return "🌿";
    if (name.includes("mint")) return "🌱";
    if (name.includes("sage")) return "🌱";
    if (name.includes("lavender")) return "🪻";
    if (name.includes("marigold")) return "🌼";
    if (name.includes("sunflower")) return "🌻";
    if (name.includes("corn")) return "🌽";
    if (name.includes("bean") || name.includes("pea")) return "🫛";
    if (name.includes("squash") || name.includes("pumpkin") || name.includes("zucchini")) return "🎃";
    if (name.includes("carrot")) return "🥕";
    if (name.includes("potato")) return "🥔";
    if (name.includes("onion") || name.includes("garlic")) return "🧅";
    if (name.includes("lettuce") || name.includes("salad") || name.includes("spinach") || name.includes("kale") || name.includes("chard")) return "🥬";
    if (name.includes("pepper") || name.includes("chili") || name.includes("jalapeno")) return "🫑";
    if (name.includes("apple")) return "🍎";
    if (name.includes("peach")) return "🍑";
    if (name.includes("pear")) return "🍐";
    if (name.includes("cherry")) return "🍒";
    if (name.includes("plum")) return "🍑";
    if (name.includes("orange") || name.includes("citrus") || name.includes("lemon")) return "🍊";
    if (name.includes("strawberry") || name.includes("berry") || name.includes("raspberry") || name.includes("blackberry") || name.includes("blueberry")) return "🍓";
    if (name.includes("grape")) return "🍇";
    if (name.includes("melon") || name.includes("watermelon")) return "🍉";
    if (name.includes("tree")) return "🌳";
    if (name.includes("shrub") || name.includes("bush")) return "🌿";
    if (name.includes("grass") || name.includes("clover") || name.includes("alfalfa") || name.includes("vetch")) return "🍀";
    return "🌱";
}

function adjustColorBrightness(hex, percent) {
    if (!hex || hex.charAt(0) !== '#') return hex;
    let R = parseInt(hex.substring(1, 3), 16) || 0;
    let G = parseInt(hex.substring(3, 5), 16) || 0;
    let B = parseInt(hex.substring(5, 7), 16) || 0;

    R = parseInt(R * (1 + percent));
    G = parseInt(G * (1 + percent));
    B = parseInt(B * (1 + percent));

    R = Math.max(0, Math.min(255, R));
    G = Math.max(0, Math.min(255, G));
    B = Math.max(0, Math.min(255, B));

    const rHex = R.toString(16).padStart(2, '0');
    const gHex = G.toString(16).padStart(2, '0');
    const bHex = B.toString(16).padStart(2, '0');

    return `#${rHex}${gHex}${bHex}`;
}

function createPlantTextureCanvas(plantName, emoji, colors) {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');

    // Draw background disk
    ctx.fillStyle = colors.background || '#142015';
    ctx.beginPath();
    ctx.arc(128, 128, 120, 0, 2 * Math.PI);
    ctx.fill();

    // Draw border ring
    ctx.strokeStyle = colors.border || '#10b981';
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.arc(128, 128, 120, 0, 2 * Math.PI);
    ctx.stroke();

    // Draw Emoji symbol in center
    ctx.font = '100px serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(emoji, 128, 110);

    // Draw variety name text at the bottom half
    ctx.font = 'bold 22px Outfit, sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.fillText(plantName.substring(0, 18), 128, 200);

    const texture = new THREE.CanvasTexture(canvas);
    texture.minFilter = THREE.LinearFilter;
    
    return texture;
}

function buildSimplifiedConeModel(plant, diameter) {
    // Resolve current USDA zone number dynamically
    const zoneElement = document.getElementById('hdr-zone');
    const zoneText = zoneElement ? zoneElement.textContent : "Zone 6a";
    const zoneMatch = zoneText.match(/\d+/);
    const currentZoneNum = zoneMatch ? parseInt(zoneMatch[0]) : 6;

    const modelCacheKey = `${plant.id}_${diameter}_${currentZoneNum}`;
    if (plantModelCache.has(modelCacheKey)) {
        return plantModelCache.get(modelCacheKey).clone();
    }

    const coneGroup = new THREE.Group();
    const colors = getPlantColor(plant.id);
    
    const height = plant.mature_height ? parseFloat(plant.mature_height) : 3.0;
    const isTree = (plant.type === 'Fruit Tree' || height >= 12 || diameter >= 6);

    // Resolve specific foliage color from database if present
    const sideColor = plant.foliage_color || colors.border;
    const bgColor = plant.foliage_color ? adjustColorBrightness(plant.foliage_color, -0.6) : colors.background;
    const borderCol = plant.foliage_color || colors.border;
    
    const displayColors = {
        background: bgColor,
        border: borderCol,
        text: colors.text
    };

    const isTropical = isTropicalPotted(plant, currentZoneNum);
    let plantBaseY = 0;

    if (isTropical) {
        // 1. Create clay container pot mesh
        const potHeight = Math.max(0.4, height * 0.15); // scale pot to plant size
        const potTopRad = Math.max(0.3, diameter * 0.25);
        const potBotRad = potTopRad * 0.75;
        
        const potGeo = new THREE.CylinderGeometry(potTopRad, potBotRad, potHeight, 10);
        const potMat = new THREE.MeshStandardMaterial({ 
            color: 0xc2410c, // Terracotta/clay color
            roughness: 0.85,
            metalness: 0.1
        });
        const potMesh = new THREE.Mesh(potGeo, potMat);
        potMesh.position.y = potHeight / 2;
        potMesh.castShadow = true;
        potMesh.receiveShadow = true;
        coneGroup.add(potMesh);
        
        // 2. Add soil/dirt surface inside the pot
        const dirtGeo = new THREE.CylinderGeometry(potTopRad * 0.95, potTopRad * 0.95, 0.04, 10);
        const dirtMat = new THREE.MeshStandardMaterial({ color: 0x4a3525, roughness: 0.9 });
        const dirtMesh = new THREE.Mesh(dirtGeo, dirtMat);
        dirtMesh.position.y = potHeight - 0.02;
        coneGroup.add(dirtMesh);
        
        // 3. Offset subsequent plant parts to grow out of the pot
        plantBaseY = potHeight - 0.05;
    }

    if (isTree) {
        // --- 1. Trunk (Brown Cylinder) ---
        const trunkHeight = height * 0.35;
        const trunkRad = Math.max(0.2, Math.min(1.5, diameter * 0.05));
        const trunkGeo = new THREE.CylinderGeometry(trunkRad * 0.8, trunkRad, trunkHeight, 6);
        const trunkMat = new THREE.MeshStandardMaterial({ color: 0x5c4033, roughness: 0.9 });
        const trunkMesh = new THREE.Mesh(trunkGeo, trunkMat);
        trunkMesh.position.y = plantBaseY + trunkHeight / 2;
        trunkMesh.castShadow = true;
        trunkMesh.receiveShadow = true;
        coneGroup.add(trunkMesh);

        // --- 2. Canopy (Green Cone/Cylinder) ---
        const canopyHeight = height * 0.65;
        const maxRad = plant.max_radius ? parseFloat(plant.max_radius) : diameter / 2;
        const minRad = plant.min_radius ? parseFloat(plant.min_radius) : maxRad * 0.25;
        
        const canopyGeo = new THREE.CylinderGeometry(minRad, maxRad, canopyHeight, 8);
        
        const sideMat = new THREE.MeshStandardMaterial({
            color: sideColor,
            roughness: 0.8,
            side: THREE.DoubleSide
        });

        const textureCacheKey = `${plant.id}_${displayColors.border}_${displayColors.background}`;
        if (!plantTextureCache.has(textureCacheKey)) {
            const emoji = getPlantEmoji(plant.name);
            const texture = createPlantTextureCanvas(plant.name, emoji, displayColors);
            plantTextureCache.set(textureCacheKey, texture);
        }
        const canvasTexture = plantTextureCache.get(textureCacheKey);
        
        const topCapMat = new THREE.MeshStandardMaterial({
            map: canvasTexture,
            roughness: 0.5
        });

        const materials = [sideMat, topCapMat, sideMat];
        const canopyMesh = new THREE.Mesh(canopyGeo, materials);
        canopyMesh.castShadow = true;
        canopyMesh.receiveShadow = true;
        
        canopyMesh.position.y = plantBaseY + trunkHeight + canopyHeight / 2;
        coneGroup.add(canopyMesh);
    } else {
        // --- Standard plant cone model ---
        const maxRad = plant.max_radius ? parseFloat(plant.max_radius) : diameter / 2;
        const minRad = plant.min_radius ? parseFloat(plant.min_radius) : maxRad * 0.25;

        const coneGeo = new THREE.CylinderGeometry(maxRad, minRad, height, 8);
        
        const sideMat = new THREE.MeshStandardMaterial({
            color: sideColor,
            roughness: 0.8,
            side: THREE.DoubleSide
        });

        const textureCacheKey = `${plant.id}_${displayColors.border}_${displayColors.background}`;
        if (!plantTextureCache.has(textureCacheKey)) {
            const emoji = getPlantEmoji(plant.name);
            const texture = createPlantTextureCanvas(plant.name, emoji, displayColors);
            plantTextureCache.set(textureCacheKey, texture);
        }
        const canvasTexture = plantTextureCache.get(textureCacheKey);
        
        const topCapMat = new THREE.MeshStandardMaterial({
            map: canvasTexture,
            roughness: 0.5
        });

        const materials = [sideMat, topCapMat, sideMat];
        const coneMesh = new THREE.Mesh(coneGeo, materials);
        coneMesh.castShadow = true;
        coneMesh.receiveShadow = true;
        
        coneMesh.position.y = plantBaseY + height / 2;
        coneGroup.add(coneMesh);
    }

    plantModelCache.set(modelCacheKey, coneGroup);
    return coneGroup.clone();
}

function update3DLayout(width, height, gridArray) {
    if (!scene3d || !gardenGroup3d) {
        console.log("[DEBUG update3DLayout] skipped, scene3d:", !!scene3d, "gardenGroup3d:", !!gardenGroup3d);
        return;
    }
    // Clear previous elements with proper memory disposal
    clearGarden3D();

    const cols = gridArray[0].length;
    const rows = gridArray.length;

    const sharedPathGeo = new THREE.BoxGeometry(0.98, 0.12, 0.98);
    const sharedPathMat = new THREE.MeshStandardMaterial({ color: 0x5a4537, roughness: 0.95 });

    // Adjust camera height and target dynamically to frame the entire garden space
    if (camera3d && shouldResetCamera3D) {
        const maxDim = Math.max(cols, rows);
        camera3d.position.set(0, maxDim * 1.2 + 8, maxDim * 1.4 + 12);
        if (cameraTarget3d) {
            cameraTarget3d.set(0, 0, 0);
        }
        camera3d.lookAt(cameraTarget3d || new THREE.Vector3(0, 0, 0));
        shouldResetCamera3D = false;
        
        // Reset orbit angles, preserving current orientation angle
        cameraOrbitAngleY = 0;
        cameraOrbitAngleX = 0;
        if (visualsParentGroup) {
            visualsParentGroup.rotation.set(cameraOrbitAngleX, cameraOrbitAngleY, 0);
        }
        if (gardenGroup3d) {
            gardenGroup3d.rotation.set(0, -gardenOrientationAngle * Math.PI / 180, 0);
        }
        update3DCompass();
    }

    // Ground plane grass lawn card
    const groundGeo = new THREE.BoxGeometry(cols, 0.2, rows);
    const groundMat = new THREE.MeshStandardMaterial({ color: 0x142015, roughness: 0.95 }); // Moss green grass
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.position.y = -0.1;
    ground.receiveShadow = true;
    gardenGroup3d.add(ground);

    // Adjust shadow map camera frustum to fit the garden size perfectly
    if (dirLight) {
        const maxDim = Math.max(cols, rows);
        dirLight.shadow.mapSize.width = 2048;
        dirLight.shadow.mapSize.height = 2048;
        dirLight.shadow.camera.near = 1.0;
        dirLight.shadow.camera.far = maxDim * 6.0;
        
        const bounds = maxDim * 1.6;
        dirLight.shadow.camera.left = -bounds;
        dirLight.shadow.camera.right = bounds;
        dirLight.shadow.camera.top = bounds;
        dirLight.shadow.camera.bottom = -bounds;
        dirLight.shadow.camera.updateProjectionMatrix();
    }

    // Static Floor Compass Rose (Environment North) setup
    if (staticEnvCompass) {
        visualsParentGroup.remove(staticEnvCompass);
        staticEnvCompass.traverse(node => {
            if (node.geometry) node.geometry.dispose();
            if (node.material) {
                if (node.material.map) node.material.map.dispose();
                node.material.dispose();
            }
        });
    }
    const roseRadius = Math.max(cols, rows) * 0.7;
    staticEnvCompass = createStaticEnvironmentNorthArrow(roseRadius);
    visualsParentGroup.add(staticEnvCompass);

    // Sync 2D CAD North Arrow Rotation
    const cadNorthArrowIcon = document.querySelector('#cad-north-arrow i');
    if (cadNorthArrowIcon) {
        cadNorthArrowIcon.style.transform = `rotate(${-gardenOrientationAngle}deg)`;
    }

    // Render Sun Path Trajectory
    drawSunPath(cols, rows);



    // Increment active 3D render ID task to cancel any older draws
    const activeRenderId = ++current3DRenderId;

    // Collect all elements (boardwalk paths and crops) to build in an async queue
    const renderQueue = [];
    const placedInstances = new Set();

    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            const cellData = gridArray[r][c];
            if (cellData === null) continue;

            const x = c - cols/2 + 0.5;
            const z = r - rows/2 + 0.5;

            if (cellData.type === 'path') {
                renderQueue.push({
                    type: 'path',
                    x: x,
                    z: z
                });
            } else if (cellData.type === 'crop') {
                if (!placedInstances.has(cellData.instanceId)) {
                    placedInstances.add(cellData.instanceId);
                    renderQueue.push({
                        type: 'crop',
                        cellData: cellData,
                        diameter: cellData.diameter,
                        startR: cellData.startR,
                        startC: cellData.startC
                    });
                }
                if (cellData.understory && !placedInstances.has(cellData.understoryInstanceId)) {
                    placedInstances.add(cellData.understoryInstanceId);
                    const parts = cellData.understoryInstanceId.split('_');
                    const startR = parseInt(parts[1]);
                    const startC = parseInt(parts[2]);
                    const understoryCellData = {
                        type: 'crop',
                        plant: cellData.understory,
                        instanceId: cellData.understoryInstanceId,
                        diameter: getPlantDiameter(cellData.understory),
                        startR: startR,
                        startC: startC
                    };
                    renderQueue.push({
                        type: 'crop',
                        cellData: understoryCellData,
                        diameter: understoryCellData.diameter,
                        startR: startR,
                        startC: startC
                    });
                }
            }
        }
    }
    let currentIndex = 0;
    const chunkSize = 200; // Build 200 items per frame to keep browser tab fully responsive

    function renderNext3DChunk() {
        if (activeRenderId !== current3DRenderId) return;

        const limit = Math.min(currentIndex + chunkSize, renderQueue.length);
        for (let i = currentIndex; i < limit; i++) {
            const item = renderQueue[i];

            if (item.type === 'path') {
                const pathTile = new THREE.Mesh(sharedPathGeo, sharedPathMat);
                pathTile.position.set(item.x, 0.06, item.z);
                pathTile.castShadow = true;
                pathTile.receiveShadow = true;
                gardenGroup3d.add(pathTile);
            } else if (item.type === 'crop') {
                const diameter = item.diameter;
                const startR = item.startR;
                const startC = item.startC;
                
                const centerX = startC - cols/2 + diameter/2;
                const centerZ = startR - rows/2 + diameter/2;

                const instanceGroup = new THREE.Group();
                instanceGroup.name = "cropInstance";
                instanceGroup.position.set(centerX, 0, centerZ);

                // 1. Wood retaining frame wrapper
                const frameGeo = new THREE.BoxGeometry(diameter * 0.99, 0.18, diameter * 0.99);
                const frameMat = new THREE.MeshStandardMaterial({ color: 0x3d2b22, roughness: 0.9 });
                const frame = new THREE.Mesh(frameGeo, frameMat);
                frame.position.set(0, 0.09, 0);
                frame.castShadow = true;
                frame.receiveShadow = true;
                instanceGroup.add(frame);

                // 2. Black soil compost surface
                const soilGeo = new THREE.BoxGeometry(diameter * 0.94, 0.06, diameter * 0.94);
                const soilMat = new THREE.MeshStandardMaterial({ color: 0x160f0a, roughness: 0.98 });
                const soil = new THREE.Mesh(soilGeo, soilMat);
                soil.position.set(0, 0.18, 0);
                soil.receiveShadow = true;
                instanceGroup.add(soil);

                // 3. Center the 3D plant model (simplified octagonal cone)
                const plant3d = buildSimplifiedConeModel(item.cellData.plant, diameter);
                plant3d.position.set(0, 0.20, 0);
                instanceGroup.add(plant3d);

                // Metadata details
                const plantData = {
                    name: item.cellData.plant.name,
                    type: item.cellData.plant.type,
                    spread: diameter,
                    description: item.cellData.plant.description,
                    sun: item.cellData.plant.sun_requirements,
                    water: item.cellData.plant.water_requirements,
                    frame: frame,
                    soil: soil
                };
                
                instanceGroup.userData = plantData;
                frame.userData = plantData;
                soil.userData = plantData;
                plant3d.userData = plantData;

                gardenGroup3d.add(instanceGroup);
            }
        }

        currentIndex = limit;
        renderer3d.render(scene3d, camera3d);

        if (currentIndex < renderQueue.length) {
            requestAnimationFrame(renderNext3DChunk);
        } else {
            update3DHighlights();
        }
    }

    requestAnimationFrame(renderNext3DChunk);
}

window.addEventListener('load', () => {
    loadPlants();
    initPreferences();
    setupResizeObservers();
    
    // Fetch system health and git status
    fetch('/api/health')
        .then(res => res.json())
        .then(data => {
            if (data && data.git) {
                const dateEl = document.getElementById('lbl-last-changes-date');
                const versionEl = document.getElementById('lbl-git-version');
                if (dateEl && data.git.date) {
                    dateEl.textContent = data.git.date;
                }
                if (versionEl && data.git.commit) {
                    versionEl.textContent = data.git.commit;
                }
            }
        })
        .catch(err => console.error("Error fetching system info:", err));
    initMultiPresets();
    initAgentHub();
    initCompassDrag();
    initVisitorNetwork();
    initPestsHub();
    initCompostCalculator();
    initWildForaging();
    
    // Setup Mobile Sidebar Drawer Toggle and Close logic
    const sidebar = document.querySelector('.sidebar');
    const mobileSetupToggle = document.getElementById('btn-mobile-setup-toggle');
    const sidebarClose = document.getElementById('btn-sidebar-close');

    if (mobileSetupToggle && sidebar) {
        mobileSetupToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            sidebar.classList.toggle('open');
        });
    }

    if (sidebarClose && sidebar) {
        sidebarClose.addEventListener('click', (e) => {
            e.stopPropagation();
            sidebar.classList.remove('open');
        });
    }

    // Auto-close sidebar drawer when clicking outside it on mobile
    document.addEventListener('click', (e) => {
        if (sidebar && sidebar.classList.contains('open') && !sidebar.contains(e.target) && e.target !== mobileSetupToggle && !e.target.closest('#btn-mobile-setup-toggle')) {
            sidebar.classList.remove('open');
        }
    });

    // Auto-close sidebar drawer when navigating tabs on mobile
    const allNavItems = document.querySelectorAll('.nav-item');
    allNavItems.forEach(item => {
        item.addEventListener('click', () => {
            if (sidebar) sidebar.classList.remove('open');
        });
    });
    
    // Update capacity meter dynamically when garden size inputs change
    const widthInput = document.getElementById('input-width');
    const heightInput = document.getElementById('input-height');
    if (widthInput) widthInput.addEventListener('input', renderCropTags);
    if (heightInput) heightInput.addEventListener('input', renderCropTags);
    
    // Trigger design refresh immediately on toggling layout distribution




    // Setup Planting Methodology Checkboxes logic
    const methodologyDetails = {
        Miyawaki: {
            title: "Miyawaki Pocket Forest",
            text: "Optimized for rapid growth, carbon capture, and soil restoration. Plants native trees and shrubs extremely close together (spacing is reduced and walkways are removed) to simulate a natural climax forest."
        },
        Syntropic: {
            title: "Syntropic Agroforestry",
            text: "Optimized for structured, high-yield perennial and crop systems. Organizes plants into distinct canopy bands and crop alleys, separated by walkways, to accelerate soil regeneration."
        },
        FoodForest: {
            title: "Food Forest (Permaculture)",
            text: "Optimized for self-sustaining edible yields and vertical layering. Allows vertical overlap so small herbaceous crops and root crops can grow directly inside/underneath tall canopy tree cells."
        },
        Nucleation: {
            title: "Applied Nucleation (Patterned)",
            text: "Optimized for cost-effective reforestation. Clusters trees tightly around circular 'island nuclei' to act as stepping stones for natural organic spread into empty areas."
        },
        DirectSeeding: {
            title: "Direct Seeding (High Density)",
            text: "Optimized for low-budget planting. Sows seeds directly into the soil in high-density layout configurations with compacted spacing (0.6x diameter) to support natural selection."
        },
        Block: {
            title: "Block Plantation (Conventional)",
            text: "Optimized for easy conventional maintenance and mechanical harvesting. Plants crops in organized, spaced blocks with standardized walkways."
        }
    };

    function updateMethodologyBadges() {
        const container = document.getElementById('methods-badges-container');
        if (!container) return;
        container.innerHTML = '';
        const methodItems = document.querySelectorAll('.custom-dropdown-menu#methods-dropdown-menu .method-checkbox-item');
        const activeMethods = Array.from(methodItems).filter(c => c.querySelector('.methodology-checkbox').checked);
        
        if (activeMethods.length === 0) {
            document.getElementById('methods-dropdown-placeholder').textContent = "Select Methodologies...";
            return;
        }
        
        document.getElementById('methods-dropdown-placeholder').textContent = `${activeMethods.length} Method(s) Selected`;
        
        activeMethods.forEach(c => {
            const labelText = c.querySelector('label').textContent;
            
            const pill = document.createElement('div');
            pill.className = 'selected-pill';
            pill.style.cssText = 'display: inline-flex; align-items: center; gap: 6px; padding: 4px 10px; background: rgba(59,130,246,0.12); border: 1px solid #3b82f6; color: var(--text-primary); border-radius: 12px; font-size: 11px; font-weight: 600; box-shadow: var(--shadow-sm);';
            
            pill.innerHTML = `
                <span>${labelText}</span>
                <i class="fa-solid fa-circle-xmark remove-pill" style="cursor: pointer; opacity: 0.7; font-size: 12px; margin-left: 2px;"></i>
            `;
            
            pill.querySelector('.remove-pill').addEventListener('click', (e) => {
                e.stopPropagation();
                const cb = c.querySelector('.methodology-checkbox');
                if (cb) {
                    cb.checked = false;
                    cb.dispatchEvent(new Event('change'));
                }
            });
            
            container.appendChild(pill);
        });
    }

    const selectBoxM = document.getElementById('methods-dropdown-select');
    const menuM = document.getElementById('methods-dropdown-menu');
    const methodCheckboxes = menuM.querySelectorAll('.methodology-checkbox');
    const popoverM = document.getElementById('methodology-popover');
    const popoverTitleM = document.getElementById('methodology-popover-title');
    const popoverTextM = document.getElementById('methodology-popover-text');
    const popoverImgM = document.getElementById('methodology-popover-img');
    const popoverCloseM = document.getElementById('methodology-popover-close');

    if (selectBoxM && menuM) {
        selectBoxM.addEventListener('click', (e) => {
            e.stopPropagation();
            const isOpen = menuM.style.display === 'block';
            menuM.style.display = isOpen ? 'none' : 'block';
            // Close presets dropdown if open
            const otherMenu = document.getElementById('presets-dropdown-menu');
            if (otherMenu) otherMenu.style.display = 'none';
        });

        document.addEventListener('click', (e) => {
            if (!e.target.closest('#methods-dropdown-container')) {
                menuM.style.display = 'none';
            }
            if (popoverM && !popoverM.contains(e.target) && !e.target.closest('.custom-option-item')) {
                popoverM.style.display = 'none';
            }
        });
    }

    let activeHoveredMethod = null;

    const showPopoverM = (methodKey, itemEl) => {
        const details = methodologyDetails[methodKey];
        if (popoverM && details && itemEl) {
            popoverTitleM.textContent = details.title;
            popoverTextM.textContent = details.text;
            
            // Large realistic image loading
            if (popoverImgM) {
                const imgMap = {
                    Miyawaki: '/miyawaki.jpg',
                    Syntropic: '/syntropic.jpg',
                    FoodForest: '/foodforest.jpg',
                    Nucleation: '/nucleation.jpg',
                    DirectSeeding: '/directseeding.jpg',
                    Block: '/block.jpg'
                };
                if (imgMap[methodKey]) {
                    popoverImgM.src = imgMap[methodKey];
                    popoverImgM.style.display = 'block';
                } else {
                    popoverImgM.style.display = 'none';
                }
            }
            
            popoverM.style.display = 'block';
            popoverM.style.position = 'fixed';
            
            const rect = itemEl.getBoundingClientRect();
            let leftPos = rect.right + 12;
            
            if (leftPos + popoverM.offsetWidth > window.innerWidth - 16) {
                leftPos = rect.left - popoverM.offsetWidth - 12;
            }
            
            let topPos = rect.top;
            if (topPos + popoverM.offsetHeight > window.innerHeight - 16) {
                topPos = window.innerHeight - popoverM.offsetHeight - 16;
            }
            
            popoverM.style.left = leftPos + 'px';
            popoverM.style.top = topPos + 'px';
            
            requestAnimationFrame(() => {
                popoverM.style.opacity = '1';
                popoverM.style.transform = 'translateX(0)';
            });
        }
    };

    if (popoverCloseM) {
        popoverCloseM.addEventListener('click', (e) => {
            e.stopPropagation();
            if (popoverM) {
                popoverM.style.opacity = '0';
                popoverM.style.display = 'none';
            }
        });
    }

    methodCheckboxes.forEach(cb => {
        const parentItem = cb.closest('.method-checkbox-item');
        const methodKey = parentItem ? parentItem.dataset.method : null;

        cb.addEventListener('change', (e) => {
            const method = methodKey || cb.id.replace('chk-method-', '');
            const methodNormalized = method.toLowerCase();
            
            if (cb.checked) {
                if (methodNormalized === 'block') {
                    // Uncheck all others
                    methodCheckboxes.forEach(other => {
                        if (other !== cb) {
                            other.checked = false;
                            const otherCard = other.closest('.method-checkbox-item');
                            if (otherCard) otherCard.style.background = 'transparent';
                        }
                    });
                } else {
                    // Uncheck block if selecting another
                    const blockCb = document.getElementById('chk-method-block');
                    if (blockCb) {
                        blockCb.checked = false;
                        const blockCard = blockCb.closest('.method-checkbox-item');
                        if (blockCard) blockCard.style.background = 'transparent';
                    }
                }
                if (parentItem) parentItem.style.background = 'rgba(59, 130, 246, 0.08)';
            } else {
                if (parentItem) parentItem.style.background = 'transparent';
                
                // If all are unchecked, default check Block
                const anyChecked = Array.from(methodCheckboxes).some(c => c.checked);
                if (!anyChecked) {
                    const blockCb = document.getElementById('chk-method-block');
                    if (blockCb) {
                        blockCb.checked = true;
                        const blockCard = blockCb.closest('.method-checkbox-item');
                        if (blockCard) blockCard.style.background = 'rgba(59, 130, 246, 0.08)';
                    }
                }
            }
            updateMethodologyBadges();
            

        });

        if (parentItem) {
            // Hover events
            parentItem.addEventListener('mouseenter', () => {
                activeHoveredMethod = methodKey;
                showPopoverM(methodKey, parentItem);
            });

            parentItem.addEventListener('mouseleave', () => {
                if (popoverM) {
                    popoverM.style.opacity = '0';
                    popoverM.style.display = 'none';
                }
                activeHoveredMethod = null;
            });

            // Click card toggles checkbox
            parentItem.addEventListener('click', (e) => {
                if (e.target === cb) return;
                cb.checked = !cb.checked;
                cb.dispatchEvent(new Event('change'));
            });
        }
    });

    // Default check Block Plantation initially and trigger update
    const initBlockCb = document.getElementById('chk-method-block');
    if (initBlockCb) {
        initBlockCb.checked = true;
        const blockCard = initBlockCb.closest('.method-checkbox-item');
        if (blockCard) blockCard.style.background = 'rgba(59, 130, 246, 0.08)';
    }
    updateMethodologyBadges();
    updatePresetBadges(); // Also call presets badge update on startup!

    // Scroll listener for wheel updates
    if (menuM) {
        menuM.addEventListener('scroll', () => {
            const items = menuM.querySelectorAll('.custom-option-item');
            items.forEach(item => {
                const rect = item.getBoundingClientRect();
                if (window.mouseX >= rect.left && window.mouseX <= rect.right &&
                    window.mouseY >= rect.top && window.mouseY <= rect.bottom) {
                    const key = item.dataset.method;
                    if (activeHoveredMethod !== key) {
                        activeHoveredMethod = key;
                        showPopoverM(key, item);
                    }
                }
            });
        });
    }

    // Track global mouse coordinates for custom scroll updates
    if (!window.hasGlobalMouseTracker) {
        window.hasGlobalMouseTracker = true;
        window.mouseX = 0;
        window.mouseY = 0;
        window.addEventListener('mousemove', (e) => {
            window.mouseX = e.clientX;
            window.mouseY = e.clientY;
        });
    }

    // Bind Edit Layout button click listener
    const editBtn = document.getElementById('btn-edit-mode');
    if (editBtn) {
        editBtn.addEventListener('click', () => {
            isEditModeActive = !isEditModeActive;
            if (isEditModeActive) {
                editBtn.classList.add('active');
                editBtn.innerHTML = '<i class="fa-solid fa-floppy-disk" style="margin-right: 4px;"></i> Save Layout';
                editBtn.style.borderColor = '#eab308';
                editBtn.style.color = '#eab308';
                
                // Hide 3D tooltip when editing layout
                const tooltip = document.getElementById('3d-tooltip');
                if (tooltip) tooltip.style.display = 'none';
            } else {
                editBtn.classList.remove('active');
                editBtn.innerHTML = '<i class="fa-solid fa-pencil" style="margin-right: 4px;"></i> Edit Layout';
                editBtn.style.borderColor = 'rgba(16, 185, 129, 0.4)';
                editBtn.style.color = '';
                
                // Deselect all on save and clear snap preview highlights
                selectedPlantGroups = [];
                clearTimeout(dragPreviewTimeout);
                previewHelpers3D.forEach(h => { h.visible = false; });
                document.querySelectorAll('.grid-cell').forEach(el => {
                    el.classList.remove('drag-preview-valid', 'drag-preview-invalid');
                });
            }

            // Redraw 2D layout grid to attach/detach edit grab cursors and drag listeners
            isManualEdit = true;
            renderLayoutGrid(currentWidth, currentHeight);
            isManualEdit = false;
            update3DSelectionHighlights();
        });
    }
    
    // Set default tab header titles
    updateHeaders('design-tab');
    
    // Autofocus cursor in the Desired Crops search bar
    const searchBar = document.getElementById('crop-search');
    if (searchBar) {
        searchBar.focus();
    }

    // Bind Design My Garden button click listener (with form validation check)
    const submitBtn = document.getElementById('btn-submit-design');
    if (submitBtn) {
        submitBtn.addEventListener('click', (e) => {
            e.preventDefault();
            const form = document.getElementById('design-form');
            if (form && form.reportValidity()) {
                // Auto-apply checked presets if the crop list is currently empty
                if (selectedCrops.length === 0) {
                    const hasCheckedPreset = Array.from(document.querySelectorAll('.preset-toggle')).some(cb => cb.checked);
                    if (hasCheckedPreset) {
                        const ok = applySelectedPresets();
                        if (!ok) return;
                    }
                }
                submitDesign(true);
            }
        });
    }

    // 2D CAD Blueprint Plot Layout Viewport scroll, pan and zoom controls
    const scrollPane = document.getElementById('layout-scroll-pane');
    const xRulerPane = document.getElementById('x-ruler-pane');
    const yRulerPane = document.getElementById('y-ruler-pane');

    if (scrollPane) {
        // Prevent context menu (right click) inside viewport
        scrollPane.addEventListener('contextmenu', (e) => e.preventDefault());

        // Synchronize static rulers scrolling position in lockstep
        scrollPane.addEventListener('scroll', () => {
            if (xRulerPane) xRulerPane.scrollLeft = scrollPane.scrollLeft;
            if (yRulerPane) yRulerPane.scrollTop = scrollPane.scrollTop;
        });

        let isPanning = false;
        let startX, startY;
        let startScrollLeft, startScrollTop;

        // Right-click drag to pan the viewport internally
        scrollPane.addEventListener('mousedown', (e) => {
            if (e.button === 2) { // Right click
                isPanning = true;
                startX = e.clientX;
                startY = e.clientY;
                startScrollLeft = scrollPane.scrollLeft;
                startScrollTop = scrollPane.scrollTop;
                scrollPane.style.cursor = 'grabbing';
            }
        });

        scrollPane.addEventListener('mousemove', (e) => {
            if (!isPanning) return;
            const dx = e.clientX - startX;
            const dy = e.clientY - startY;
            scrollPane.scrollLeft = startScrollLeft - dx;
            scrollPane.scrollTop = startScrollTop - dy;
        });

        const endPan = () => {
            if (isPanning) {
                isPanning = false;
                scrollPane.style.cursor = 'auto';
            }
        };
        scrollPane.addEventListener('mouseup', endPan);
        scrollPane.addEventListener('mouseleave', endPan);

        // Mouse wheel scroll to zoom layout in and out (adapts base sizing)
        scrollPane.addEventListener('wheel', (e) => {
            e.preventDefault();
            const cols = Math.round(currentWidth) || 20;
            const rows = Math.round(currentHeight) || 30;
            
            const paneWidth = scrollPane.clientWidth || 600;
            const paneHeight = scrollPane.clientHeight || 480;

            const fitCellSize = Math.max(2, Math.min((paneWidth - 20) / cols, (paneHeight - 20) / rows));
            
            if (e.deltaY < 0) {
                // Zoom In (increase cell multiplier)
                zoomScale = Math.min(20.0, zoomScale + 0.1); // Increased max zoom to 20x to support seeing detail on huge farm acreages!
            } else {
                // Zoom Out (clamped to 0.9 min zoom to keep it fill the viewport margins cleanly)
                zoomScale = Math.max(0.9, zoomScale - 0.1);
            }
            
            const currentCellSize = fitCellSize * zoomScale;

            // Adjust grid actual bounds
            if (gardenGrid) {
                gardenGrid.style.width = `${cols * currentCellSize}px`;
                gardenGrid.style.height = `${rows * currentCellSize}px`;
            }

            // Instantly rebuild static ruler ticks to match new cell width/height
            renderRulers(cols, rows, currentCellSize);

            // Sync ruler scrollbars right after rendering
            if (xRulerPane) xRulerPane.scrollLeft = scrollPane.scrollLeft;
            if (yRulerPane) yRulerPane.scrollTop = scrollPane.scrollTop;
        }, { passive: false });
    }

    // 2D selection box overlay elements creation
    let boxDiv2D = document.getElementById('selection-box-overlay-2d');
    if (!boxDiv2D && gardenGrid) {
        boxDiv2D = document.createElement('div');
        boxDiv2D.id = 'selection-box-overlay-2d';
        boxDiv2D.style.position = 'absolute';
        boxDiv2D.style.border = '1.5px dashed #f59e0b';
        boxDiv2D.style.backgroundColor = 'rgba(245, 158, 11, 0.15)';
        boxDiv2D.style.display = 'none';
        boxDiv2D.style.pointerEvents = 'none';
        boxDiv2D.style.zIndex = '999';
        gardenGrid.appendChild(boxDiv2D);
    }

    if (gardenGrid) {
        gardenGrid.addEventListener('mousedown', (e) => {
            if (!isEditModeActive || e.button !== 0) return;

            const clickedCrop = e.target.closest('.grid-cell.crop');
            if (!clickedCrop) {
                isDrawingSelectionBox2D = true;
                const rect = gardenGrid.getBoundingClientRect();
                selectionBoxStart2D.set(e.clientX - rect.left, e.clientY - rect.top);
                selectionBoxEnd2D.set(e.clientX - rect.left, e.clientY - rect.top);

                // Clear active selection list unless Ctrl/Shift modifier keys are held
                if (!e.ctrlKey && !e.shiftKey) {
                    selectedPlantGroups = [];
                    document.querySelectorAll('.grid-cell.crop').forEach(el => {
                        el.classList.remove('selected-footprint');
                    });
                }
            }
        });
    }

    // Global 2D Drag-and-Drop Editor mousemove & mouseup listeners
    window.addEventListener('mousemove', (e) => {
        if (isDrawingSelectionBox2D && gardenGrid && boxDiv2D) {
            const rect = gardenGrid.getBoundingClientRect();
            selectionBoxEnd2D.set(e.clientX - rect.left, e.clientY - rect.top);

            const left = Math.min(selectionBoxStart2D.x, selectionBoxEnd2D.x);
            const top = Math.min(selectionBoxStart2D.y, selectionBoxEnd2D.y);
            const width = Math.abs(selectionBoxStart2D.x - selectionBoxEnd2D.x);
            const height = Math.abs(selectionBoxStart2D.y - selectionBoxEnd2D.y);

            boxDiv2D.style.left = `${left}px`;
            boxDiv2D.style.top = `${top}px`;
            boxDiv2D.style.width = `${width}px`;
            boxDiv2D.style.height = `${height}px`;
            boxDiv2D.style.display = 'block';

            const cols = currentGridArray[0].length;
            const rows = currentGridArray.length;

            // Clear temp select list and project bounds of each grid cell
            let boxSelectedIds = new Set();
            for (let r = 0; r < rows; r++) {
                for (let c = 0; c < cols; c++) {
                    const cellData = currentGridArray[r][c];
                    if (cellData && cellData.type === 'crop') {
                        const cellEl = gardenGrid.children[r * cols + c];
                        if (cellEl) {
                            const cellLeft = cellEl.offsetLeft;
                            const cellTop = cellEl.offsetTop;
                            const cellWidth = cellEl.offsetWidth;
                            const cellHeight = cellEl.offsetHeight;

                            const cellCX = cellLeft + cellWidth / 2;
                            const cellCY = cellTop + cellHeight / 2;

                            if (cellCX >= left && cellCX <= left + width &&
                                cellCY >= top && cellCY <= top + height) {
                                boxSelectedIds.add(cellData.instanceId);
                            }
                        }
                    }
                }
            }

            // Sync active selectedPlantGroups using grid array cells
            const seenIds = new Set();
            for (let r = 0; r < rows; r++) {
                for (let c = 0; c < cols; c++) {
                    const cell = currentGridArray[r][c];
                    if (cell && cell.type === 'crop' && boxSelectedIds.has(cell.instanceId) && !seenIds.has(cell.instanceId)) {
                        seenIds.add(cell.instanceId);
                        
                        let meshGroup = gardenGroup3d?.children.find(child => child.name === "cropInstance" && child.userData.instanceId === cell.instanceId);
                        if (!meshGroup) {
                            meshGroup = {
                                position: new THREE.Vector3(
                                    cell.startC - cols/2 + cell.diameter/2,
                                    0,
                                    cell.startR - rows/2 + cell.diameter/2
                                ),
                                userData: {
                                    name: cell.plant.name,
                                    instanceId: cell.instanceId,
                                    spread: cell.diameter,
                                    drag2DStartR: cell.startR,
                                    drag2DStartC: cell.startC,
                                    originalGridR: cell.startR,
                                    originalGridC: cell.startC,
                                    plant: cell.plant
                                }
                            };
                        }
                        if (!selectedPlantGroups.some(item => item.userData.instanceId === cell.instanceId)) {
                            selectedPlantGroups.push(meshGroup);
                        }
                    }
                }
            }

            // Remove non-selected items from selectedPlantGroups if not holding Ctrl or Shift
            if (!e.ctrlKey && !e.shiftKey) {
                selectedPlantGroups = selectedPlantGroups.filter(item => boxSelectedIds.has(item.userData.instanceId));
            }

            // Update DOM highlights in real-time
            document.querySelectorAll('.grid-cell.crop').forEach(el => {
                const instId = el.dataset.instanceId;
                const isSel = selectedPlantGroups.some(g => g.userData.instanceId === instId);
                el.classList.toggle('selected-footprint', isSel);
            });
        }

        if (!isDragging2D) return;

        lastMouse2D.x = e.clientX;
        lastMouse2D.y = e.clientY;

        const cols = currentGridArray[0].length;
        const rows = currentGridArray.length;

        const gridRect = gardenGrid.getBoundingClientRect();
        const cellWidth = gridRect.width / cols;
        const cellHeight = gridRect.height / rows;

        const currentX = lastMouse2D.x - gridRect.left;
        const currentY = lastMouse2D.y - gridRect.top;

        const currentC = Math.floor(currentX / cellWidth);
        const currentR = Math.floor(currentY / cellHeight);

        const targetC = currentC - dragged2DOffsetC;
        const targetR = currentR - dragged2DOffsetR;

        const dr = targetR - dragged2DStartR;
        const dc = targetC - dragged2DStartC;

        // Instantly slide selected crop elements to follow the mouse pointer in real-time
        selectedPlantGroups.forEach(g => {
            document.querySelectorAll(`[data-instance-id="${g.userData.instanceId}"]`).forEach(el => {
                el.style.transform = `translate(${dc * cellWidth}px, ${dr * cellHeight}px)`;
                el.style.zIndex = '100'; // Bring dragged elements to the front
            });
        });

        // Clear previous snapped footprint highlight timeout while moving
        clearTimeout(dragPreviewTimeout);
        document.querySelectorAll('.grid-cell').forEach(el => {
            el.classList.remove('drag-preview-valid', 'drag-preview-invalid');
        });

        // Set debounced snapping footprint highlight timer (350ms delay)
        dragPreviewTimeout = setTimeout(() => {
            if (!isDragging2D) return;

            const cols = currentGridArray[0].length;
            const rows = currentGridArray.length;

            const gridRect = gardenGrid.getBoundingClientRect();
            const cellWidth = gridRect.width / cols;
            const cellHeight = gridRect.height / rows;

            const releaseX = lastMouse2D.x - gridRect.left;
            const releaseY = lastMouse2D.y - gridRect.top;

            const releaseC = Math.floor(releaseX / cellWidth);
            const releaseR = Math.floor(releaseY / cellHeight);

            const targetC = releaseC - dragged2DOffsetC;
            const targetR = releaseR - dragged2DOffsetR;

            const dr = targetR - dragged2DStartR;
            const dc = targetC - dragged2DStartC;

            let tempGrid = Array(rows).fill(null).map((_, r) => [...currentGridArray[r]]);

            // Clear old footprints of the dragged plants in temp grid check
            selectedPlantGroups.forEach(g => {
                const origR = g.userData.drag2DStartR;
                const origC = g.userData.drag2DStartC;
                const diam = g.userData.spread;
                for (let tr = 0; tr < diam; tr++) {
                    for (let tc = 0; tc < diam; tc++) {
                        const r = origR + tr;
                        const c = origC + tc;
                        if (r < rows && c < cols) {
                            if (tempGrid[r][c]?.instanceId === g.userData.instanceId) {
                                tempGrid[r][c] = null;
                            }
                        }
                    }
                }
            });

            // Outline footprint snap cells for all selected plants
            selectedPlantGroups.forEach(g => {
                const newR = g.userData.drag2DStartR + dr;
                const newC = g.userData.drag2DStartC + dc;
                const diam = g.userData.spread;

                for (let tr = 0; tr < diam; tr++) {
                    for (let tc = 0; tc < diam; tc++) {
                        const r = newR + tr;
                        const c = newC + tc;

                        if (r >= 0 && r < rows && c >= 0 && c < cols) {
                            const cellEl = gardenGrid.children[r * cols + c];
                            if (cellEl) {
                                const isBlocked = (tempGrid[r][c] !== null);
                                cellEl.classList.add(isBlocked ? 'drag-preview-invalid' : 'drag-preview-valid');
                            }
                        }
                    }
                }

                // Temporarily occupy in temp grid to prevent overlapping selections from blocking each other
                if (newR >= 0 && newR + diam <= rows && newC >= 0 && newC + diam <= cols) {
                    for (let tr = 0; tr < diam; tr++) {
                        for (let tc = 0; tc < diam; tc++) {
                            tempGrid[newR + tr][newC + tc] = { occupied: true };
                        }
                    }
                }
            });
        }, 350);
    });

    window.addEventListener('mouseup', (e) => {
        if (isDrawingSelectionBox2D) {
            isDrawingSelectionBox2D = false;
            if (boxDiv2D) boxDiv2D.style.display = 'none';
        }

        if (!isDragging2D) return;
        isDragging2D = false;

        clearTimeout(dragPreviewTimeout);
        document.querySelectorAll('.grid-cell').forEach(el => {
            el.classList.remove('drag-preview-valid', 'drag-preview-invalid');
            el.style.opacity = '';
            el.style.border = '';
        });

        // Reset visual styles and translation transforms of all selected plants
        selectedPlantGroups.forEach(g => {
            document.querySelectorAll(`[data-instance-id="${g.userData.instanceId}"]`).forEach(el => {
                el.style.opacity = '';
                el.style.border = '';
                el.style.transform = '';
                el.style.zIndex = '';
            });
        });

        const cols = currentGridArray[0].length;
        const rows = currentGridArray.length;

        const gridRect = gardenGrid.getBoundingClientRect();
        const cellWidth = gridRect.width / cols;
        const cellHeight = gridRect.height / rows;

        const releaseX = e.clientX - gridRect.left;
        const releaseY = e.clientY - gridRect.top;

        const releaseC = Math.floor(releaseX / cellWidth);
        const releaseR = Math.floor(releaseY / cellHeight);

        const targetC = releaseC - dragged2DOffsetC;
        const targetR = releaseR - dragged2DOffsetR;

        const dr = targetR - dragged2DStartR;
        const dc = targetC - dragged2DStartC;

        let canMoveAll = true;
        let newPlacements = [];
        let tempGrid = Array(rows).fill(null).map((_, r) => [...currentGridArray[r]]);

        // 1. Clear old footprints of the dragged plants in temp validation grid
        selectedPlantGroups.forEach(g => {
            const origR = g.userData.drag2DStartR;
            const origC = g.userData.drag2DStartC;
            const diam = g.userData.spread;
            for (let tr = 0; tr < diam; tr++) {
                for (let tc = 0; tc < diam; tc++) {
                    const r = origR + tr;
                    const c = origC + tc;
                    if (r < rows && c < cols) {
                        if (tempGrid[r][c]?.instanceId === g.userData.instanceId) {
                            tempGrid[r][c] = null;
                        }
                    }
                }
            }
        });

        // 2. Validate bounds and collisions for all selection meshes
        selectedPlantGroups.forEach(g => {
            const newR = g.userData.drag2DStartR + dr;
            const newC = g.userData.drag2DStartC + dc;
            const diam = g.userData.spread;

            if (newR < 0 || newR + diam > rows || newC < 0 || newC + diam > cols) {
                canMoveAll = false;
                return;
            }

            for (let tr = 0; tr < diam; tr++) {
                for (let tc = 0; tc < diam; tc++) {
                    if (tempGrid[newR + tr][newC + tc] !== null) {
                        canMoveAll = false;
                        return;
                    }
                }
            }

            // Temporarily occupy cell
            for (let tr = 0; tr < diam; tr++) {
                for (let tc = 0; tc < diam; tc++) {
                    tempGrid[newR + tr][newC + tc] = { occupied: true };
                }
            }

            newPlacements.push({
                group: g,
                r: newR,
                c: newC
            });
        });

        if (canMoveAll) {
            // Commit changes
            // Clear old coordinates in main database grid array
            selectedPlantGroups.forEach(g => {
                const origR = g.userData.drag2DStartR;
                const origC = g.userData.drag2DStartC;
                const diam = g.userData.spread;
                for (let tr = 0; tr < diam; tr++) {
                    for (let tc = 0; tc < diam; tc++) {
                        const r = origR + tr;
                        const c = origC + tc;
                        if (r < rows && c < cols) {
                            currentGridArray[r][c] = null;
                        }
                    }
                }
            });

            // Write new coordinates to database grid array and update Three.js meshes
            newPlacements.forEach(placement => {
                const g = placement.group;
                const newR = placement.r;
                const newC = placement.c;
                const diam = g.userData.spread;

                const plantObj = allPlants.find(p => p.name === g.userData.name);
                const newInstanceId = `${plantObj?.id || 'manual'}_${newR}_${newC}`;

                for (let tr = 0; tr < diam; tr++) {
                    for (let tc = 0; tc < diam; tc++) {
                        currentGridArray[newR + tr][newC + tc] = {
                            type: 'crop',
                            plant: plantObj,
                            instanceId: newInstanceId,
                            isCenter: (tr === Math.floor(diam / 2) && tc === Math.floor(diam / 2)),
                            isTopLeft: (tr === 0 && tc === 0),
                            diameter: diam,
                            startR: newR,
                            startC: newC
                        };
                    }
                }

                // Sync Three.js metadata
                g.userData.originalGridR = newR;
                g.userData.originalGridC = newC;
                g.userData.instanceId = newInstanceId;

                // Shift 3D mesh position
                const snappedX = newC - cols/2 + diam/2;
                const snappedZ = newR - rows/2 + diam/2;
                g.position.set(snappedX, 0, snappedZ);
            });

            isManualEdit = true;
            renderLayoutGrid(currentWidth, currentHeight);
            isManualEdit = false;

            trigger3DRender();
        } else {
            isManualEdit = true;
            renderLayoutGrid(currentWidth, currentHeight);
            isManualEdit = false;
        }
    });
});

window.addEventListener('keydown', (e) => {
    if (!isEditModeActive) return;
    if (e.key === 'Delete' || e.key === 'Backspace') {
        const activeNode = document.activeElement;
        if (activeNode && (activeNode.tagName === 'INPUT' || activeNode.tagName === 'TEXTAREA' || activeNode.isContentEditable)) {
            return; // Ignore if focused inside input
        }
        e.preventDefault();
        if (selectedPlantGroups.length > 0) {
            deleteSelectedCrops();
        }
    }
});

function deleteSelectedCrops() {
    if (selectedPlantGroups.length === 0 || !currentGridArray) return;

    const cols = currentGridArray[0].length;
    const rows = currentGridArray.length;

    selectedPlantGroups.forEach(g => {
        const instId = g.userData.instanceId;
        const origR = g.userData.originalGridR !== undefined ? g.userData.originalGridR : g.userData.drag2DStartR;
        const origC = g.userData.originalGridC !== undefined ? g.userData.originalGridC : g.userData.drag2DStartC;
        const diam = g.userData.spread;

        // 1. Clear footprints in currentGridArray
        for (let tr = 0; tr < diam; tr++) {
            for (let tc = 0; tc < diam; tc++) {
                const r = origR + tr;
                const c = origC + tc;
                if (r >= 0 && r < rows && c >= 0 && c < cols) {
                    if (currentGridArray[r][c]?.instanceId === instId) {
                        currentGridArray[r][c] = null;
                    }
                }
            }
        }

        // 2. Decrement quantity in selectedCrops list
        const plant = g.userData.plant;
        if (plant) {
            const matchedIdx = selectedCrops.findIndex(sc => sc.id === plant.id || sc.name === plant.name);
            if (matchedIdx !== -1) {
                selectedCrops[matchedIdx].quantity--;
                selectedCrops[matchedIdx].yield = selectedCrops[matchedIdx].quantity * selectedCrops[matchedIdx].yieldPerPlant;
                
                if (selectedCrops[matchedIdx].quantity <= 0) {
                    selectedCrops.splice(matchedIdx, 1);
                }
            }
        }
    });

    // Clear selection state
    selectedPlantGroups = [];
    selectionAnchorGroup = null;

    // Refresh layout, tags list, and Three.js canvas
    renderCropTags();
    
    isManualEdit = true;
    renderLayoutGrid(currentWidth, currentHeight);
    isManualEdit = false;

    trigger3DRender();
}

function updateAppUnits() {
    const lblHeight = document.getElementById('lbl-height-unit');
    const lblWidth = document.getElementById('lbl-width-unit');
    if (lblHeight) lblHeight.textContent = `Length (${settingsDimUnit})`;
    if (lblWidth) lblWidth.textContent = `Width (${settingsDimUnit})`;

    updateFencingPerimeter();
    renderCropTags();
    
    if (currentGridArray) {
        const cols = currentGridArray[0].length;
        const rows = currentGridArray.length;
        
        const scrollPane = document.getElementById('layout-scroll-pane');
        if (scrollPane) {
            const paneWidth = scrollPane.clientWidth;
            const paneHeight = scrollPane.clientHeight;
            const fitCellSize = Math.max(2, Math.min((paneWidth - 20) / cols, (paneHeight - 20) / rows));
            const currentCellSize = fitCellSize * zoomScale;
            renderRulers(cols, rows, currentCellSize);
        }
    }
}

function updateFencingPerimeter() {
    const heightVal = parseFloat(document.getElementById('input-height').value) || 0;
    const widthVal = parseFloat(document.getElementById('input-width').value) || 0;
    const perimeter = 2 * (heightVal + widthVal);
    
    const fencingDisp = document.getElementById('fencing-perimeter-display');
    if (fencingDisp) {
        fencingDisp.textContent = `Fencing Perimeter: ${perimeter.toFixed(1)} ${settingsDimUnit}`;
    }
}

function initPreferences() {
    const dimSelect = document.getElementById('settings-dim-unit');
    const weightSelect = document.getElementById('settings-weight-unit');

    if (dimSelect) {
        dimSelect.value = settingsDimUnit;
        dimSelect.addEventListener('change', (e) => {
            settingsDimUnit = e.target.value;
            localStorage.setItem('settingsDimUnit', settingsDimUnit);
            updateAppUnits();
        });
    }

    if (weightSelect) {
        weightSelect.value = settingsWeightUnit;
        weightSelect.addEventListener('change', (e) => {
            const oldUnit = settingsWeightUnit;
            settingsWeightUnit = e.target.value;
            localStorage.setItem('settingsWeightUnit', settingsWeightUnit);
            
            // Convert yields in selectedCrops list
            selectedCrops.forEach(crop => {
                if (settingsWeightUnit === 'kg' && oldUnit === 'lbs') {
                    crop.yield = Math.round(crop.yield * 0.453592);
                    crop.yieldPerPlant = crop.yieldPerPlant * 0.453592;
                } else if (settingsWeightUnit === 'lbs' && oldUnit === 'kg') {
                    crop.yield = Math.round(crop.yield / 0.453592);
                    crop.yieldPerPlant = crop.yieldPerPlant / 0.453592;
                }
            });
            updateAppUnits();
        });
    }

    const heightInput = document.getElementById('input-height');
    const widthInput = document.getElementById('input-width');
    if (heightInput && widthInput) {
        heightInput.addEventListener('input', updateFencingPerimeter);
        widthInput.addEventListener('input', updateFencingPerimeter);
    }

    updateAppUnits();
}

// Live Expert Agent Diagnostics Hub script
function initAgentHub() {
    const rosterItems = document.querySelectorAll('.roster-item');
    const toggles = document.querySelectorAll('.agent-toggle');
    const form = document.getElementById('diagnostics-form');
    const queryInput = document.getElementById('input-diagnostic-query');
    const chatPane = document.getElementById('diagnostic-chat-pane');
    const activeCountText = document.getElementById('diagnostic-active-count');
    const synthesisCard = document.getElementById('final-diagnosis-card');
    const synthesisContent = document.getElementById('diagnostic-synthesis-content');
    const confidenceBadge = document.getElementById('diagnostic-confidence-badge');

    // Update roster count and styles
    const updateRosterUI = () => {
        let count = 0;
        rosterItems.forEach(item => {
            const cb = item.querySelector('.agent-toggle');
            if (cb.checked) {
                item.classList.add('active-agent');
                count++;
            } else {
                item.classList.remove('active-agent');
            }
        });
        if (activeCountText) {
            activeCountText.textContent = `${count} Agent${count !== 1 ? 's' : ''} active`;
        }
    };

    toggles.forEach(toggle => {
        toggle.addEventListener('change', updateRosterUI);
    });

    rosterItems.forEach(item => {
        item.addEventListener('click', (e) => {
            if (e.target.closest('.agent-toggle')) return;
            const cb = item.querySelector('.agent-toggle');
            cb.checked = !cb.checked;
            cb.dispatchEvent(new Event('change'));
        });
    });

    updateRosterUI();

    // Preset helper
    window.askExpertPreset = (text) => {
        if (queryInput) {
            queryInput.value = text;
            if (form) {
                // Trigger form submission cleanly
                form.dispatchEvent(new Event('submit'));
            }
        }
    };

    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const query = queryInput.value.trim();
            if (!query) return;

            const activeAgents = Array.from(toggles)
                .filter(t => t.checked)
                .map(t => t.dataset.agent);

            if (activeAgents.length === 0) {
                alert("Please select at least one expert agent to consult!");
                return;
            }

            // Clear previous chats except coordinator welcome
            const welcomeMsg = chatPane.querySelector('.coordinator-bubble');
            chatPane.innerHTML = '';
            if (welcomeMsg) chatPane.appendChild(welcomeMsg);
            if (synthesisCard) synthesisCard.style.display = 'none';

            // Disable input while communicating
            queryInput.disabled = true;
            const submitBtn = form.querySelector('button[type="submit"]');
            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Consulting...';
            }

            // Append live typing indicator
            const typingInd = document.createElement('div');
            typingInd.className = 'typing-indicator';
            typingInd.innerHTML = `
                <span>Expert panel is discussing</span>
                <span class="typing-dot"></span>
                <span class="typing-dot"></span>
                <span class="typing-dot"></span>
            `;
            chatPane.appendChild(typingInd);
            chatPane.scrollTop = chatPane.scrollHeight;

            const zipCode = document.getElementById('input-zip')?.value || "48104";
            const soil = document.getElementById('select-soil')?.value || "Clay";
            const sun = document.getElementById('select-sun')?.value || "Full Sun";
            const crops = selectedCrops.map(sc => sc.name);

            try {
                const response = await fetch('/api/v1/diagnose', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        query: query,
                        active_agents: activeAgents,
                        soil: soil,
                        sun: sun,
                        zone: zipCodeInfo[zipCode]?.zone || "Zone 6a",
                        crops: crops
                    })
                });

                if (response.ok) {
                    const data = await response.json();
                    
                    // Remove typing indicator
                    if (typingInd.parentNode) typingInd.parentNode.removeChild(typingInd);

                    // Animate sequential messages from consulted experts to make it feel like a live debate!
                    for (let i = 0; i < data.transcript.length; i++) {
                        const item = data.transcript[i];
                        
                        // Wait 1.2s between messages to simulate reading/writing
                        if (i > 0) await new Promise(resolve => setTimeout(resolve, 1200));

                        const msgBubble = document.createElement('div');
                        msgBubble.className = 'chat-message';
                        msgBubble.style.display = 'flex';
                        msgBubble.style.gap = '10px';
                        msgBubble.style.background = 'rgba(255, 255, 255, 0.015)';
                        msgBubble.style.border = '1px solid var(--border-color)';
                        msgBubble.style.padding = '12px';
                        msgBubble.style.borderRadius = 'var(--radius-md)';
                        msgBubble.style.marginBottom = '8px';

                        // Set custom color tags based on agent key
                        let avatarColor = 'rgba(239, 68, 68, 0.1)';
                        let roleColor = '#ef4444';
                        if (item.agent_key === 'soil') {
                            avatarColor = 'rgba(16, 185, 129, 0.1)';
                            roleColor = '#10b981';
                        } else if (item.agent_key === 'pest') {
                            avatarColor = 'rgba(245, 158, 11, 0.1)';
                            roleColor = '#f59e0b';
                        } else if (item.agent_key === 'regen') {
                            avatarColor = 'rgba(59, 130, 246, 0.1)';
                            roleColor = '#3b82f6';
                        } else if (item.agent_key === 'climate') {
                            avatarColor = 'rgba(168, 85, 247, 0.1)';
                            roleColor = '#a855f7';
                        }

                        msgBubble.innerHTML = `
                            <div style="font-size: 20px; display: flex; align-items: center; justify-content: center; width: 32px; height: 32px; background: ${avatarColor}; border-radius: 50%; flex-shrink: 0;">${item.agent_icon}</div>
                            <div>
                                <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 3px;">
                                    <span style="font-size: 11px; font-weight: 700; color: var(--text-primary);">${item.agent_name}</span>
                                    <span style="font-size: 8px; text-transform: uppercase; color: ${roleColor}; font-weight: 700;">${item.agent_role}</span>
                                </div>
                                <p style="font-size: 11px; color: rgba(255,255,255,0.85); margin: 0; line-height: 1.45;">${item.message}</p>
                            </div>
                        `;
                        chatPane.appendChild(msgBubble);
                        chatPane.scrollTop = chatPane.scrollHeight;
                    }

                    // Display synthesized diagnosis at the end with a small delay
                    await new Promise(resolve => setTimeout(resolve, 1000));
                    
                    if (synthesisCard && synthesisContent) {
                        synthesisContent.innerHTML = data.summary
                            .replace(/### (.*)/g, '<strong style="color: var(--text-primary); display: block; margin-top: 8px; margin-bottom: 4px; font-size: 11px;">$1</strong>')
                            .replace(/## (.*)/g, '<strong style="color: var(--text-primary); display: block; margin-top: 8px; margin-bottom: 4px; font-size: 11px;">$1</strong>')
                            .replace(/\*\*(.*?)\*\*/g, '<strong style="color: var(--accent-emerald); font-weight: 600;">$1</strong>')
                            .replace(/- (.*)/g, '<li style="margin-left: 10px; margin-bottom: 4px; list-style: square;">$1</li>');
                        
                        if (confidenceBadge) {
                            confidenceBadge.textContent = data.confidence;
                            if (data.confidence === 'High') {
                                confidenceBadge.style.background = 'var(--accent-emerald)';
                                confidenceBadge.style.color = '#121918';
                            } else if (data.confidence === 'Medium') {
                                confidenceBadge.style.background = '#f59e0b';
                                confidenceBadge.style.color = '#121918';
                            } else {
                                confidenceBadge.style.background = '#ef4444';
                                confidenceBadge.style.color = '#fff';
                            }
                        }

                        synthesisCard.style.display = 'block';
                        synthesisCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                    }

                } else {
                    alert("Error consulting expert panel. Please retry.");
                }
            } catch (err) {
                alert("Failed to connect to diagnostics server. Make sure backend is online.");
                console.error(err);
            } finally {
                // Restore input and button
                queryInput.disabled = false;
                queryInput.value = '';
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.innerHTML = '<i class="fa-solid fa-magnifying-glass-chart"></i> Consult Panel';
                }
            }
        });
    }
}

function getCountryFlag(countryCode) {
    if (!countryCode) return "🏳️";
    const codePoints = countryCode
        .toUpperCase()
        .split('')
        .map(char => 127397 + char.charCodeAt(0));
    try {
        return String.fromCodePoint(...codePoints);
    } catch (e) {
        return "🏳️";
    }
}

async function initVisitorNetwork() {
    const container = document.getElementById('visitor-list-container');
    if (!container) return;

    let geoPayload = null;

    // 1. Try to fetch visitor's geolocation client-side
    try {
        const geoRes = await fetch('https://freeipapi.com/api/json');
        if (geoRes.ok) {
            const geoData = await geoRes.json();
            if (geoData && geoData.countryCode && geoData.countryName) {
                geoPayload = {
                    country_code: geoData.countryCode,
                    country_name: geoData.countryName
                };
            }
        }
    } catch (err) {
        console.warn("Client geolocation blocked/failed. Relying on server-side IP country lookup.");
    }

    // 2. Report hit to local backend (backend will resolve IP if payload is empty)
    try {
        await fetch('/api/v1/analytics/hit', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(geoPayload || {})
        });
    } catch (err) {
        console.error("Failed to report visitor hit:", err);
    }

    // 3. Retrieve stats from local backend and render
    try {
        const statsRes = await fetch('/api/v1/analytics/stats');
        if (statsRes.ok) {
            const stats = await statsRes.json();
            if (!stats || stats.length === 0) {
                container.innerHTML = '<p class="placeholder-text">No visitor stats recorded yet.</p>';
                return;
            }
            
            // Calculate total visits to compute percentages
            const totalVisits = stats.reduce((sum, item) => sum + item.visit_count, 0);
            
            container.innerHTML = '';
            stats.forEach(item => {
                const percentage = totalVisits > 0 ? Math.round((item.visit_count / totalVisits) * 100) : 0;
                const flag = getCountryFlag(item.country_code);
                
                const row = document.createElement('div');
                row.style.display = 'flex';
                row.style.flexDirection = 'column';
                row.style.gap = '4px';
                
                row.innerHTML = `
                    <div style="display: flex; justify-content: space-between; align-items: center; font-size: 11px;">
                        <span style="color: var(--text-primary); font-weight: 600;">
                            <span style="margin-right: 6px; font-size: 14px;">${flag}</span>${item.country_name}
                        </span>
                        <span style="color: var(--text-secondary); font-size: 10px; font-weight: 500;">
                            ${item.visit_count} ${item.visit_count === 1 ? 'visit' : 'visits'} (${percentage}%)
                        </span>
                    </div>
                    <div style="width: 100%; height: 6px; background: rgba(255,255,255,0.04); border-radius: 3px; overflow: hidden; position: relative;">
                        <div style="width: ${percentage}%; height: 100%; background: linear-gradient(90deg, var(--accent-emerald), #34d399); border-radius: 3px; transition: width 0.5s ease-out;"></div>
                    </div>
                `;
                container.appendChild(row);
            });
        } else {
            container.innerHTML = '<p class="placeholder-text">Failed to load visitor stats.</p>';
        }
    } catch (err) {
        console.error("Error loading visitor network stats:", err);
        container.innerHTML = '<p class="placeholder-text">Failed to fetch network stats.</p>';
    }
}

// ----------------------------------------------------
// DISEASE & PEST RESISTANCE HUB
// ----------------------------------------------------

const pestsData = [
    {
        id: "aphid",
        name: "Aphids",
        scientific: "Aphidoidea",
        category: "insect",
        icon: "🐛",
        symptoms: "Stunted growth, curled or yellowing leaves, sticky honeydew residue, black sooty mold.",
        remedy: "Spray plants with a strong stream of water to dislodge them. Apply a 1% solution of organic insecticidal soap or cold-pressed neem oil during evening hours.",
        companions: "Plant companion **Nasturtiums** or **Sweet Alyssum** (as trap crops), and aromatic herbs like **Garlic**, **Chives**, or **Mint** to repel them.",
        entomology: "Attract beneficial predatory insects such as **Ladybugs (Ladybird Beetles)**, **Green Lacewings**, and **Hoverfly larvae**."
    },
    {
        id: "spider-mite",
        name: "Spider Mites",
        scientific: "Tetranychidae",
        category: "insect",
        icon: "🕷️",
        symptoms: "Fine webbing on undersides of leaves, yellow speckled stippling, leaf bronzing and eventual drop.",
        remedy: "Maintain high humidity (mites love dry conditions). Spray foliage with water or apply organic rosemary oil or neem oil weekly.",
        companions: "Plant **Dill**, **Chives**, or **Chrysanthemums** to deter them; avoid planting crop rows in dusty or extremely dry zones.",
        entomology: "Introduce predatory mites (**Phytoseiulus persimilis**) which aggressively hunt spider mites."
    },
    {
        id: "tomato-hornworm",
        name: "Tomato Hornworm",
        scientific: "Manduca quinquemaculata",
        category: "insect",
        icon: "🐛",
        symptoms: "Large sections of nightshade leaves eaten overnight, defoliated stems, dark green/black droppings (frass) on lower foliage.",
        remedy: "Handpick the caterpillars (inspect undersides of stems at dusk or use a UV flashlight, under which they glow fluorescent green).",
        companions: "Plant **Marigolds**, **Basil**, or **Borage** next to tomatoes to repel the adult moths from laying eggs.",
        entomology: "Preserve hornworms that have white egg-like cocoons on their backs—these are beneficial **Braconid parasite wasps**."
    },
    {
        id: "cucumber-beetle",
        name: "Cucumber Beetles",
        scientific: "Diabrotica undecimpunctata",
        category: "insect",
        icon: "🪲",
        symptoms: "Chewed cotyledons and leaves, holes in blossoms, transmission of bacterial wilt (which causes plants to suddenly collapse).",
        remedy: "Use floating row covers on young seedlings. Apply organic kaolin clay to leaves or dust with diatomaceous earth around stem bases.",
        companions: "Plant **Radishes** or **Nasturtiums** as companion trap crops; avoid planting cucumbers directly next to sage.",
        entomology: "Attract beneficial nematodes to target larvae in the soil, and encourage soldier beetles."
    },
    {
        id: "squash-bug",
        name: "Squash Bugs",
        scientific: "Anasa tristis",
        category: "insect",
        icon: "🪲",
        symptoms: "Yellow spots on leaves that turn brown and wither, small copper-colored egg clusters on leaf undersides, vine wilting.",
        remedy: "Scrape egg clusters off leaves immediately. Place boards on the soil at night; bugs will aggregate under them, allowing easy collection in the morning.",
        companions: "Intercrop with **Tansy**, **Nasturtiums**, or **French Marigolds** to repel them naturally.",
        entomology: "Encourage tachinid flies which act as natural parasites to adult squash bugs."
    },
    {
        id: "slug",
        name: "Slugs & Snails",
        scientific: "Gastropoda",
        category: "insect",
        icon: "🐌",
        symptoms: "Large, smooth holes in foliage, shredded seedling leaves, silvery slime trails left on soil and leaves.",
        remedy: "Set beer trap cups level with the soil. Create barriers using crushed eggshells, coarse sand, or copper tape around raised beds.",
        companions: "Plant strongly aromatic herbs like **Rosemary**, **Thyme**, or **Fennel** which slugs dislike.",
        entomology: "Encourage ground beetles, frogs, toads, and garter snakes by providing small rock piles or water features."
    },
    {
        id: "early-blight",
        name: "Early Blight",
        scientific: "Alternaria solani",
        category: "disease",
        icon: "🍄",
        symptoms: "Target-like dark brown concentric rings on lower leaves, leaf yellowing, stem lesions, and premature defoliation.",
        remedy: "Prune off infected lower leaves touching the ground. Apply copper fungicide or organic bio-fungicides (Bacillus subtilis).",
        companions: "Plant **Basil** or **Marigolds** to improve soil microbiology and air flow; ensure wide spacing between nightshade rows.",
        entomology: "Maintain healthy soil organic matter to support beneficial Trichoderma fungi that compete with blight pathogens."
    },
    {
        id: "powdery-mildew",
        name: "Powdery Mildew",
        scientific: "Erysiphales",
        category: "disease",
        icon: "🌬️",
        symptoms: "White or gray powdery coating on leaf surfaces, leaf puckering, yellowing, and drying out under humid/warm shade.",
        remedy: "Spray foliage with a mixture of 1 tbsp baking soda, 1 tsp liquid soap, and 1 gallon of water, or diluted milk spray in sun.",
        companions: "Plant in full sun zones with ample wind circulation. Intercrop with chives or garlic.",
        entomology: "Not applicable (fungal pathogen); focus on supporting healthy leaf bacteria through compost tea sprays."
    },
    {
        id: "deer",
        name: "White-Tailed Deer",
        scientific: "Odocoileus virginianus",
        category: "animal",
        icon: "🦌",
        symptoms: "Cleanly sliced, ripped crop tops, missing host branches overnight, hoof prints in soil.",
        remedy: "Install an 8-foot deer fence or double 4-foot fences. Apply organic blood-meal or hot pepper sprays to foliage.",
        companions: "Surround sensitive vegetable beds with a dense border of deer-resistant herbs like **Lavender**, **Rosemary**, **Mint**, or **Sage**.",
        entomology: "Not applicable; focus on physical barriers and olfactory repellents."
    },
    {
        id: "rabbit",
        name: "Wild Rabbits",
        scientific: "Leporidae",
        category: "animal",
        icon: "🐇",
        symptoms: "Neatly chewed green shoots at a 45-degree angle near the ground, missing young seedlings, pea/bean damage.",
        remedy: "Install a 2-foot chicken wire fence buried 6 inches deep to prevent burrowing. Use wire cages around young fruit tree trunks.",
        companions: "Plant **Onions**, **Garlic**, **Marigolds**, or **Lavender** as border buffers to mask the scent of tender crops.",
        entomology: "Not applicable; domestic/predatory dogs or motion-activated sprinklers help deter rabbits."
    }
];

function initPestsHub() {
    const container = document.getElementById('pests-grid-container');
    const searchInput = document.getElementById('pest-search');
    const filterButtons = document.querySelectorAll('.pests-filter-btn');

    if (!container) return;

    let activeFilter = 'all';
    let searchQuery = '';

    function renderPests() {
        container.innerHTML = '';
        const filtered = pestsData.filter(pest => {
            const matchesFilter = activeFilter === 'all' || pest.category === activeFilter;
            const matchesSearch = !searchQuery || 
                pest.name.toLowerCase().includes(searchQuery) ||
                pest.symptoms.toLowerCase().includes(searchQuery) ||
                pest.companions.toLowerCase().includes(searchQuery) ||
                pest.remedy.toLowerCase().includes(searchQuery);
            return matchesFilter && matchesSearch;
        });

        if (filtered.length === 0) {
            container.innerHTML = '<p class="placeholder-text" style="grid-column: 1/-1; text-align: center; padding: 40px 0;">No matching pests or diseases found.</p>';
            return;
        }

        filtered.forEach(pest => {
            const card = document.createElement('div');
            card.className = 'pest-card';
            
            // Highlight format helper
            const formatBold = text => text.replace(/\*\*(.*?)\*\*/g, '<strong style="color: var(--accent-emerald);">$1</strong>');

            card.innerHTML = `
                <div class="pest-card-header">
                    <div class="pest-title"><span>${pest.icon}</span> ${pest.name}</div>
                    <span class="pest-badge ${pest.category}">${pest.category === 'insect' ? 'Pest' : pest.category === 'disease' ? 'Disease' : 'Animal'}</span>
                </div>
                <div style="font-size: 10px; font-style: italic; color: var(--text-secondary); margin-top: -8px;">${pest.scientific}</div>
                
                <div>
                    <div class="pest-section-title"><i class="fa-solid fa-triangle-exclamation"></i> Symptoms & Damage</div>
                    <p class="pest-section-desc">${pest.symptoms}</p>
                </div>
                
                <div>
                    <div class="pest-section-title"><i class="fa-solid fa-flask"></i> Organic Remedy</div>
                    <p class="pest-section-desc">${pest.remedy}</p>
                </div>
                
                <div>
                    <div class="pest-section-title"><i class="fa-solid fa-seedling"></i> Companion Repellents</div>
                    <p class="pest-section-desc">${formatBold(pest.companions)}</p>
                </div>

                ${pest.entomology !== 'Not applicable' && pest.category !== 'animal' ? `
                <div>
                    <div class="pest-section-title"><i class="fa-solid fa-bug"></i> Entomology Controls</div>
                    <p class="pest-section-desc">${formatBold(pest.entomology)}</p>
                </div>
                ` : ''}
            `;
            container.appendChild(card);
        });
    }

    // Set up search listener
    if (searchInput) {
        searchInput.addEventListener('input', () => {
            searchQuery = searchInput.value.trim().toLowerCase();
            renderPests();
        });
    }

    // Set up filter buttons
    filterButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            filterButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            activeFilter = btn.dataset.filter;
            renderPests();
        });
    });

    renderPests();
}

// ----------------------------------------------------
// SOIL COMPOSTING & NUTRITION CALCULATOR
// ----------------------------------------------------

function initCompostCalculator() {
    const sliders = {
        leaves: document.getElementById('input-leaves'),
        woodchips: document.getElementById('input-woodchips'),
        straw: document.getElementById('input-straw'),
        scraps: document.getElementById('input-scraps'),
        grass: document.getElementById('input-grass'),
        coffee: document.getElementById('input-coffee')
    };

    const ratioDisplay = document.getElementById('compost-ratio-display');
    const statusBadge = document.getElementById('compost-status-badge');
    const adviceText = document.getElementById('compost-advice-text');

    if (!ratioDisplay) return;

    // Mathematical N & C values:
    // Carbon weight = W * c, Nitrogen weight = W * n
    const compostMaterials = {
        leaves: { c: 0.48, n: 0.008 },
        woodchips: { c: 0.40, n: 0.001 },
        straw: { c: 0.40, n: 0.005 },
        scraps: { c: 0.30, n: 0.020 },
        grass: { c: 0.40, n: 0.020 },
        coffee: { c: 0.40, n: 0.020 }
    };

    function calculateCompost() {
        let totalCarbon = 0;
        let totalNitrogen = 0;
        let totalWeight = 0;

        for (const [key, slider] of Object.entries(sliders)) {
            if (!slider) continue;
            const weight = parseFloat(slider.value);
            totalWeight += weight;

            // Update DOM label
            const label = document.getElementById(`val-${key}`);
            if (label) label.textContent = `${weight} lbs`;

            // Calculate carbon & nitrogen
            const specs = compostMaterials[key];
            totalCarbon += weight * specs.c;
            totalNitrogen += weight * specs.n;
        }

        if (totalWeight === 0) {
            ratioDisplay.textContent = "--";
            statusBadge.textContent = "Empty Pile";
            statusBadge.className = "compost-ratio-status optimal";
            adviceText.textContent = "Adjust the sliders to add Browns and Greens to your compost pile.";
            return;
        }

        if (totalNitrogen === 0) {
            ratioDisplay.textContent = "∞:1";
            statusBadge.textContent = "Too High Carbon";
            statusBadge.className = "compost-ratio-status high-cn";
            adviceText.textContent = "Your pile contains only Carbon (Browns). Add Nitrogen-rich Greens like Food Scraps or fresh Grass Clippings to kickstart decomposition.";
            return;
        }

        const ratio = totalCarbon / totalNitrogen;
        ratioDisplay.textContent = `${Math.round(ratio)}:1`;

        // Update UI based on ratio
        if (ratio >= 25 && ratio <= 35) {
            statusBadge.textContent = "Optimal Balance";
            statusBadge.className = "compost-ratio-status optimal";
            adviceText.textContent = "Perfect starting C:N ratio! Your compost pile has the ideal nutritional balance for beneficial microbes to generate heat and decompose quickly. Keep damp (like a wrung-out sponge) and turn weekly.";
        } else if (ratio < 25) {
            statusBadge.textContent = "Low C:N (Too much Greens)";
            statusBadge.className = "compost-ratio-status low-cn";
            adviceText.textContent = "Too much nitrogen! The pile will break down rapidly but will likely turn soggy, compact, and release a foul ammonia odor. Mix in more dry Carbon (Browns) like Autumn Leaves or Straw.";
        } else {
            statusBadge.textContent = "High C:N (Too much Browns)";
            statusBadge.className = "compost-ratio-status high-cn";
            adviceText.textContent = "Too much carbon! The pile is carbon-heavy and will decompose extremely slowly. Add more Nitrogen-rich Greens (Food Scraps, Grass Clippings, Coffee Grounds) to feed the composting bacteria.";
        }
    }

    // Set up listeners
    for (const slider of Object.values(sliders)) {
        if (slider) {
            slider.addEventListener('input', calculateCompost);
        }
    }

    calculateCompost();
}

// ----------------------------------------------------
// LOCAL WILD FORAGING HUB
// ----------------------------------------------------

function initWildForaging() {
    const container = document.getElementById('forage-grid-container');
    const zipTitle = document.getElementById('forage-zone-title');
    const zipSubtitle = document.getElementById('forage-zone-subtitle');
    const zipDisplayLabel = document.getElementById('lbl-forage-zip');
    const zipInput = document.getElementById('input-zip');

    if (!container) return;

    function renderForage() {
        const zip = zipInput ? zipInput.value.trim() : "48195";
        const location = zipCodeInfo[zip] || { city: "Ann Arbor, MI", zone: "Zone 6a" };
        
        // Update header info labels
        if (zipDisplayLabel) zipDisplayLabel.textContent = zip;
        if (zipTitle) zipTitle.textContent = `Edibles Local to ${location.city}`;
        if (zipSubtitle) zipSubtitle.textContent = `USDA Hardiness ${location.zone}`;

        // Get hardiness digit (e.g. 6)
        const digitMatch = location.zone.match(/\d+/);
        const activeZoneDigit = digitMatch ? parseInt(digitMatch[0]) : 6;

        container.innerHTML = '';

        // Filter wild edibles by active zone
        const foragePlants = allPlants.filter(p => {
            if (p.type !== 'Wild Edible') return false;
            const zones = p.usda_zones.split(',').map(z => parseInt(z.trim()));
            return zones.includes(activeZoneDigit);
        });

        if (foragePlants.length === 0) {
            container.innerHTML = '<p class="placeholder-text" style="grid-column: 1/-1; text-align: center; padding: 40px 0;">No wild foraging data seeded for your climate zone.</p>';
            return;
        }

        foragePlants.forEach(plant => {
            const card = document.createElement('div');
            card.className = 'forage-card';
            card.innerHTML = `
                <div class="forage-header">
                    <div class="forage-title-container">
                        <div class="forage-name">🌿 ${plant.name}</div>
                        <div class="forage-scientific">${plant.scientific_name}</div>
                    </div>
                    <span class="forage-tag">Wild Edible</span>
                </div>
                <p style="font-size: 11px; line-height: 1.45; color: var(--text-secondary); margin: 0;">${plant.description}</p>
                
                <div style="display: flex; flex-direction: column; gap: 8px; margin-top: 4px;">
                    <div class="forage-detail-row edible">
                        <span class="pest-section-title"><i class="fa-solid fa-utensils"></i> Forage & Edibility Use</span>
                        <span style="font-size: 11px; color: rgba(255,255,255,0.85); line-height: 1.45;">
                            ${plant.name === "Purslane" ? "Extremely rich in Omega-3 fatty acids. Juicy leaves have a crisp, lemony, and slightly salty crunch. Eat fresh in salads, stir-fries, or pickled." : 
                              plant.name === "Lamb's Quarters" ? "Often called wild spinach. Highly mineral-rich greens. Steamed leaves are identical to spinach but more nutrient-dense. Harvest before flowers develop." :
                              plant.name === "Dandelion" ? "Young bitter leaves make mineral-rich salad greens. Yellow flowers can be fried in batter. Root can be roasted for a caffeine-free coffee substitute." :
                              plant.name === "Stinging Nettle" ? "Boiling completely neutralizes the stinging micro-hairs. Strained liquid makes a rich tea, and cooked leaves make a delicious nettle pesto or soup." :
                              plant.name === "Chickweed" ? "Delicate spring green with a mild taste of sweet corn. Eat raw in sandwiches, pestos, or fresh garden salads. Leaves wilt rapidly after harvest." :
                              "Delicate clover-like leaves with a bright, refreshing sour lemon flavor. High in vitamin C. Delicious garnish for salads, soups, or fish dishes."}
                        </span>
                    </div>

                    <div class="forage-detail-row harvest">
                        <span class="pest-section-title"><i class="fa-solid fa-hand"></i> Harvesting Guidelines</span>
                        <span style="font-size: 11px; color: rgba(255,255,255,0.85); line-height: 1.45;">
                            ${plant.name === "Purslane" ? "Pinch off the top 2-3 inches of stems. Leave the main roots intact to encourage new growth. Best harvested in the morning when moisture content is high." : 
                              plant.name === "Lamb's Quarters" ? "Pick young tender leaves and shoots under 12 inches tall. Avoid older plants as their stems become woody and dry." :
                              plant.name === "Dandelion" ? "Harvest young leaves from areas free of pesticides. Dig deep to pull up the whole taproot if roasting." :
                              plant.name === "Stinging Nettle" ? "Always wear thick gardening gloves and long sleeves! Pinch the tender top 4 leaves of young plants before they flower." :
                              plant.name === "Chickweed" ? "Harvest the lush, green growing tips with scissors. Avoid harvesting brown, seeding stems." :
                              "Harvest leaves and stems in partial shade. Consume fresh as they wilt quickly."}
                        </span>
                    </div>

                    <div class="forage-detail-row role">
                        <span class="pest-section-title"><i class="fa-solid fa-earth-americas"></i> Ecological Role in Your Garden</span>
                        <span style="font-size: 11px; color: rgba(255,255,255,0.85); line-height: 1.45;">
                            ${plant.name === "Purslane" ? "Acts as a structural living mulch. Its low succulent canopy covers soil, reduces water evaporation, and keeps soil temperatures cool." : 
                              plant.name === "Lamb's Quarters" ? "Its roots loosen compacted soils and bring up deep trace minerals. Composts rapidly into nitrogen-rich humus." :
                              plant.name === "Dandelion" ? "Strong taproot drills deep into heavy clay, improving aeration and bringing up calcium from deep subsoil layers." :
                              plant.name === "Stinging Nettle" ? "Attracts beneficial ladybugs and red admiral butterflies. Excellent compost activator due to high nitrogen content." :
                              plant.name === "Chickweed" ? "Forming low mats, it prevents soil erosion and maintains humidity. Attracts ground beetles." :
                              "Indicates moderately acidic, loamy soil. Keeps the soil shaded and composts easily."}
                        </span>
                    </div>
                </div>
            `;
            container.appendChild(card);
        });
    }

    // Set up live trigger on zip code change
    if (zipInput) {
        zipInput.addEventListener('input', renderForage);
    }

    // Run forage render when we switch tabs
    const tabNavs = document.querySelectorAll('.nav-item');
    tabNavs.forEach(btn => {
        btn.addEventListener('click', () => {
            if (btn.dataset.tab === 'wild-harvest-tab') {
                renderForage();
            }
        });
    });

    // Also run initially
    setTimeout(renderForage, 200);
}



