// State Management
let allPlants = [];
let selectedCrops = [];
let lastDesignResponse = null;
let disabledAntagonists = new Set();

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
    const hue = (plantId * 67) % 360; // 67 step for beautiful separation
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
const btnLayoutView = document.getElementById('btn-layout-view');
const btn3dView = document.getElementById('btn-3d-view');
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

btnLayoutView.addEventListener('click', () => {
    btnLayoutView.classList.add('active');
    btn3dView.classList.remove('active');
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
    }

    is3DMode = false;
    update3DCompass();
    renderLayoutGrid(currentWidth, currentHeight);
});

btn3dView.addEventListener('click', () => {
    btn3dView.classList.add('active');
    btnLayoutView.classList.remove('active');
    cadViewport.classList.add('hidden');
    canvas3dContainer.classList.remove('hidden');
    
    init3D();
    resize3D();
    trigger3DRender();

    is3DMode = true;
    update3DCompass();
});

function update3DCompass() {
    const needle = document.getElementById('compass-needle');
    if (!needle) return;

    if (is3DMode) {
        let angle = 0;
        if (gardenGroup3d) {
            angle = -gardenGroup3d.rotation.y;
        }
        needle.style.transform = `rotate(${angle * 180 / Math.PI}deg)`;
    } else {
        needle.style.transform = 'rotate(0deg)';
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
    const defaultQty = nameLower.includes("tree") ? 1 : (nameLower.includes("zucchini") || nameLower.includes("squash") ? 4 : 6);
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
        yieldPerPlant: yieldPer
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
function initMultiPresets() {
    const presetCards = document.querySelectorAll('.preset-card');
    const popover = document.getElementById('presets-popover');
    const popoverTitle = document.getElementById('presets-popover-title');
    const popoverDesc = document.getElementById('presets-popover-desc');
    const popoverPlants = document.getElementById('presets-popover-plants');
    const popoverClose = document.getElementById('presets-popover-close');

    if (presetCards.length === 0) return;

    let activeHoveredPreset = null;
    let isPresetPopoverPinned = false;

    const showPresetPopover = (presetKey, card) => {
        const details = presetDescriptions[presetKey];
        if (popover && details && card) {
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

            // Set fixed layout and positioning coordinates
            popover.style.display = 'block';
            popover.style.position = 'fixed';
            popover.style.left = '0px';
            popover.style.top = '0px';
            
            const rect = card.getBoundingClientRect();
            const popoverWidth = popover.offsetWidth;
            const popoverHeight = popover.offsetHeight;
            
            // Center horizontally relative to preset card
            let leftPos = rect.left + rect.width / 2 - popoverWidth / 2;
            leftPos = Math.max(16, Math.min(window.innerWidth - popoverWidth - 16, leftPos));
            
            // Try placing below the card by default
            let topPos = rect.bottom + 8;
            // Auto-Flip: if placing below overflows the screen bottom, place it above the card instead
            if (topPos + popoverHeight > window.innerHeight - 16) {
                topPos = rect.top - popoverHeight - 8;
            }

            popover.style.left = leftPos + 'px';
            popover.style.top = topPos + 'px';

            requestAnimationFrame(() => {
                popover.style.opacity = '1';
                popover.style.transform = 'translateY(0)';
            });
        }
    };

    const hidePresetPopover = () => {
        if (popover && !isPresetPopoverPinned) {
            popover.style.opacity = '0';
            popover.style.transform = 'translateX(-10px)';
            setTimeout(() => {
                if (!isPresetPopoverPinned && popover.style.opacity === '0') {
                    popover.style.display = 'none';
                }
            }, 200);
            activeHoveredPreset = null;
        }
    };

    if (popoverClose) {
        popoverClose.addEventListener('click', (e) => {
            e.stopPropagation();
            isPresetPopoverPinned = false;
            hidePresetPopover();
        });
    }

    document.addEventListener('click', (e) => {
        if (isPresetPopoverPinned && popover && !popover.contains(e.target) && !e.target.closest('.preset-card')) {
            isPresetPopoverPinned = false;
            hidePresetPopover();
        }
    });
    
    presetCards.forEach(card => {
        const checkbox = card.querySelector('.preset-toggle');
        const pctContainer = card.querySelector('.preset-pct-container');
        const presetKey = card.dataset.preset;
        if (!checkbox) return;
        
        checkbox.addEventListener('change', (e) => {
            e.stopPropagation();
            if (checkbox.checked) {
                card.style.background = 'rgba(16, 185, 129, 0.05)';
                card.style.borderColor = 'var(--accent-emerald)';
                if (pctContainer) pctContainer.style.display = 'flex';
            } else {
                card.style.background = 'rgba(255, 255, 255, 0.02)';
                card.style.borderColor = 'var(--border-color)';
                if (pctContainer) pctContainer.style.display = 'none';
            }
            
            // Auto-balance all active/checked presets to sum to exactly 100%
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
        });

        // Hover events
        card.addEventListener('mouseenter', () => {
            if (isPresetPopoverPinned) return;
            activeHoveredPreset = presetKey;
            showPresetPopover(presetKey, card);
        });

        card.addEventListener('mouseleave', () => {
            if (isPresetPopoverPinned) return;
            hidePresetPopover();
        });

        // Click card toggles checkbox and pins popover details
        card.addEventListener('click', (e) => {
            if (e.target.closest('.preset-toggle') || e.target.closest('.preset-pct')) return;
            checkbox.checked = !checkbox.checked;
            checkbox.dispatchEvent(new Event('change'));

            activeHoveredPreset = presetKey;
            isPresetPopoverPinned = true;
            showPresetPopover(presetKey, card);

            if (popover) {
                popover.style.borderColor = '#10b981';
                setTimeout(() => {
                    if (isPresetPopoverPinned) popover.style.borderColor = 'var(--accent-emerald)';
                }, 300);
            }
        });
    });

    // Auto-Balance button listener
    const btnNormalize = document.getElementById('btn-normalize-presets');
    if (btnNormalize) {
        btnNormalize.addEventListener('click', () => {
            const activeCards = Array.from(presetCards).filter(c => c.querySelector('.preset-toggle').checked);
            if (activeCards.length === 0) return;
            
            const balancedPct = Math.round(100 / activeCards.length);
            activeCards.forEach(card => {
                const input = card.querySelector('.preset-pct');
                if (input) input.value = balancedPct;
            });
        });
    }

    // Apply Selected Plans button listener
    const btnApply = document.getElementById('btn-apply-selected-presets');
    if (btnApply) {
        btnApply.addEventListener('click', () => {
            const activeCards = Array.from(presetCards).filter(c => c.querySelector('.preset-toggle').checked);
            const errMsg = document.getElementById('presets-error-msg');
            
            if (activeCards.length === 0) {
                if (errMsg) {
                    errMsg.textContent = "Please select at least one preset garden plan to apply!";
                    errMsg.style.display = 'block';
                }
                return;
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

            if (totalPct === 0) return;

            // Get current garden dimensions
            const width = parseFloat(document.getElementById('input-width').value) || 20;
            const height = parseFloat(document.getElementById('input-height').value) || 30;
            const totalArea = width * height;
            const targetFootprint = totalArea * 0.8; // Allow 20% path spaces

            // Aggregate crop allocations case-insensitively
            const aggregatedCrops = {}; // cropName -> { plant, footprint }

            selectedList.forEach(item => {
                const ratio = item.pct / totalPct; // relative ratio of this preset
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

            if (rawItems.length === 0) return;

            // Scale if total footprint exceeds total garden area
            let totalFootprint = rawItems.reduce((sum, item) => sum + (item.quantity * item.cellArea), 0);
            if (totalFootprint > totalArea) {
                const scale = totalArea / totalFootprint;
                rawItems.forEach(item => {
                    item.quantity = Math.max(1, Math.floor(item.quantity * scale));
                });
            }

            // Set as active selections
            selectedCrops = [];
            rawItems.forEach(item => {
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
            submitDesign(true); // Smooth scroll to 3D canvas viewport on preset load
        });
    }
}

// Render Crop Tags in container as editable quantity rows (with climate zone validation warnings)
function renderCropTags() {
    selectedCropsContainer.innerHTML = '';
    
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

        let spreadText = `${getPlantDiameter(crop)} ft`;
        if (settingsDimUnit === 'm') {
            spreadText = `${(getPlantDiameter(crop) * 0.3048).toFixed(1)} m`;
        }

        const row = document.createElement('div');
        row.className = 'crop-quantity-row';
        row.innerHTML = `
            <div class="crop-info">
                <div style="display: flex; align-items: center; flex-wrap: wrap; gap: 4px;">
                    <strong class="crop-name">${crop.name}</strong>
                    ${zoneWarningHtml}
                </div>
                <span class="crop-type-badge">${crop.type} (Spread: ${spreadText})</span>
            </div>
            <div class="crop-inputs">
                <div class="input-qty-group">
                    <label>Plants</label>
                    <input type="number" class="qty-input" value="${crop.quantity}" min="1" max="1000" data-idx="${index}" data-type="qty">
                </div>
                <div class="input-qty-group">
                    <label>Est. Yield (${settingsWeightUnit})</label>
                    <input type="number" class="yield-input" value="${Math.round(crop.yield)}" min="1" max="10000" data-idx="${index}" data-type="yield">
                </div>
            </div>
            <button class="remove-crop-row-btn" data-idx="${index}"><i class="fa-solid fa-trash"></i></button>
        `;
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
            submitDesign();
        });
    });
    
    // Add Event Listener to Remove buttons
    selectedCropsContainer.querySelectorAll('.remove-crop-row-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const idx = parseInt(e.currentTarget.dataset.idx);
            selectedCrops.splice(idx, 1);
            renderCropTags();
            submitDesign();
        });
    });
}

// Submit Design Request
async function submitDesign(shouldScroll = false) {
    shouldResetCamera3D = true;
    if (selectedCrops.length === 0) {
        alert("Please search and add at least one crop to design your garden!");
        return;
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
            renderLayoutGrid(payload.garden_width, payload.garden_height);
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
        alert("Failed to connect to backend server. Make sure FastAPI is running.");
        console.error(e);
    } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<i class="fa-solid fa-wand-magic-sparkles"></i> Design My Garden';
    }
}

// Helper to get estimated full grown diameter (in feet)
function getPlantDiameter(plant) {
    if (plant && plant.mature_width) {
        return parseFloat(plant.mature_width);
    }
    const name = plant.name.toLowerCase();
    
    if (name.includes("tree")) return 8;       // Large fruit trees: 8x8 ft
    if (name.includes("sunflower")) return 4;  // Sunflowers: 4x4 ft
    if (name.includes("squash") || name.includes("zucchini") || name.includes("pumpkin") || name.includes("melon") || name.includes("watermelon")) return 4; // Sprawling: 4x4 ft
    if (name.includes("tomato") || name.includes("cucumber")) return 3; // Stakes: 3x3 ft
    if (name.includes("pepper") || name.includes("potato") || name.includes("eggplant") || name.includes("okra") || name.includes("broccoli") || name.includes("cauliflower") || name.includes("lavender") || name.includes("rosemary")) return 2; // Bushes: 2x2 ft
    return 1; // Herbs and small greens: 1x1 ft
}

// Helper to get estimated full grown height (in feet) for sun shading optimization
function getPlantHeight(plant) {
    if (plant && plant.mature_height) {
        return parseFloat(plant.mature_height);
    }
    const name = plant.name.toLowerCase();
    const category = plant.type ? plant.type.toLowerCase() : "";
    
    if (name.includes("tree") || category.includes("tree")) return 15;        // Tall fruit trees: 15 ft
    if (name.includes("sunflower")) return 8;                                 // Sunflowers: 8 ft
    if (name.includes("tomato") || name.includes("cucumber")) return 6;        // Vines / staked climbing crops: 6 ft
    if (name.includes("pepper") || name.includes("eggplant") || name.includes("broccoli") || name.includes("corn") || name.includes("okra")) return 3; // Medium bushes: 3 ft
    return 1; // Leafy greens, herbs, root crops, onions, garlic: 1 ft
}

let zoomScale = 1.0;

// Generate Layout Grid Layout with Growth Spacing and Diameter Scaling
function renderLayoutGrid(width, height) {
    const isDistributed = document.getElementById('chk-distribute-layout')?.checked || false;
    gardenGrid.innerHTML = '';
    
    // Grid cells represent 1x1 ft space
    const cols = Math.round(width);
    const rows = Math.round(height);
    
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

    if (isManualEdit && currentGridArray) {
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

    // 3. Scan and place instances of crops with antagonist separation, companion attraction, and dynamic spacing buffers
    sortedCrops.forEach(plant => {
        const diameter = getPlantDiameter(plant);
        let placeDiameter = diameter;
        
        // Miyawaki and Direct Seeding enable high-density packing
        if (isMiyawaki || isDirectSeeding) {
            placeDiameter = Math.max(1, Math.floor(diameter * 0.7));
        }

        let targetCount = plant.quantity || 1;

        // Determine starting spacing buffer: try to space out plants of the same type if isDistributed is active
        let spacingBuffer = 0;
        if (isDistributed && !isMiyawaki && !isDirectSeeding) {
            if (diameter >= 8) spacingBuffer = 4;
            else if (diameter >= 3) spacingBuffer = 2;
            else if (diameter >= 2) spacingBuffer = 2;
            else spacingBuffer = 1;
        }

        let success = false;
        let cropPlacedCenters = [];

        // Try to place all instances of this crop with the current spacingBuffer.
        // If it doesn't fit, decrement the spacingBuffer and retry until it fits (down to 0, which is compact).
        while (!success && spacingBuffer >= 0) {
            cropPlacedCenters = [];
            let tempGrid = Array(rows).fill(null).map((_, r) => [...gridArray[r]]);
            let tempPlacedCenters = [...placedCenters];
            let placedCount = 0;
            let failed = false;

            for (let i = 0; i < targetCount; i++) {
                // Find all candidates where this plant size can physically fit
                let candidates = [];
                for (let r = 0; r <= rows - placeDiameter; r++) {
                    for (let c = 0; c <= cols - placeDiameter; c++) {
                        let clear = true;
                        for (let dr = 0; dr < placeDiameter; dr++) {
                            for (let dc = 0; dc < placeDiameter; dc++) {
                                const cell = tempGrid[r + dr][c + dc];
                                if (cell !== null) {
                                    if (isFoodForest) {
                                        // Food Forest Permaculture: Allow small understory crops to grow under tall tree canopy
                                        const isUnderstory = (placeDiameter <= 1.5 && getPlantHeight(plant) <= 2.5);
                                        const isOverheadTree = (cell.type === 'crop' && (cell.plant.type === 'Fruit Tree' || getPlantHeight(cell.plant) >= 12));
                                        if (isUnderstory && isOverheadTree) {
                                            // Allow overlap
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
                        }
                    }
                }

                if (candidates.length === 0) {
                    failed = true;
                    break;
                }

                // Evaluate penalties for candidates in this trial
                candidates.forEach(cand => {
                    const candCenterR = cand.r + placeDiameter / 2;
                    const candCenterC = cand.c + placeDiameter / 2;

                    // 1. Packing Pressure: forces sequential placement towards the top-left (North)
                    let penalty = isDistributed ? 
                        (cand.r * cols + cand.c) * 0.05 : // Small tie-breaker for distributed mode
                        (cand.r * cols + cand.c) * 1.5;   // High packing pressure for compact mode

                    // 2. Syntropic Agroforestry row allocation constraint
                    if (isSyntropic) {
                        const rowMod = cand.r % 4;
                        const isPerennial = (plant.type === "Fruit Tree" || getPlantHeight(plant) >= 12 || getPlantDiameter(plant) >= 6);
                        if (isPerennial && rowMod !== 0) {
                            penalty += 15000; // Force trees/perennials to canopy row 0
                        } else if (!isPerennial && rowMod !== 2) {
                            penalty += 15000; // Force annual crop species to alley row 2
                        }
                    }

                    // 3. Applied Nucleation tree clustering constraint
                    if (isNucleation && (plant.type === "Fruit Tree" || getPlantHeight(plant) >= 12)) {
                        const nucleus1R = rows * 0.3;
                        const nucleus1C = cols * 0.3;
                        const nucleus2R = rows * 0.7;
                        const nucleus2C = cols * 0.7;
                        const dist1 = Math.sqrt((candCenterR - nucleus1R)**2 + (candCenterC - nucleus1C)**2);
                        const dist2 = Math.sqrt((candCenterR - nucleus2R)**2 + (candCenterC - nucleus2C)**2);
                        const minDistToNucleus = Math.min(dist1, dist2);
                        penalty += minDistToNucleus * 250; // Pulls trees toward island nuclei
                    }

                    // 4. Proximity to placed crops of the SAME type (forces tight contiguous clustering)
                    const sameTypePlaced = cropPlacedCenters;
                    if (sameTypePlaced.length > 0) {
                        let tooClose = false;
                        let minDist = Infinity;
                        sameTypePlaced.forEach(p => {
                            const dist = Math.sqrt((candCenterR - p.r)**2 + (candCenterC - p.c)**2);
                            if (dist < minDist) minDist = dist;
                            if (dist < placeDiameter + spacingBuffer - 0.01) {
                                tooClose = true;
                            }
                        });
                        if (tooClose) {
                            penalty += 50000; // Strong penalty block if violating spacing buffer
                        } else {
                            penalty += minDist * 800; // Keeps same-crop block contiguous
                        }
                    } else if (tempPlacedCenters.length > 0) {
                        // First plant of this crop type
                        if (isDistributed) {
                            // Repel from ALL previously placed different crop types to separate blocks into different beds
                            tempPlacedCenters.forEach(placed => {
                                const dist = Math.sqrt((candCenterR - placed.r)**2 + (candCenterC - placed.c)**2);
                                penalty -= dist * 25; // Negative penalty: larger distance = lower penalty
                            });
                        } else {
                            // Attract to the last placed crop instance to keep blocks contiguous with no empty spaces/gaps
                            const lastPlaced = tempPlacedCenters[tempPlacedCenters.length - 1];
                            const dist = Math.sqrt((candCenterR - lastPlaced.r)**2 + (candCenterC - lastPlaced.c)**2);
                            penalty += dist * 50;
                        }
                    }

                    // 5. Antagonist avoidance, Companion clustering, and Bed sharing
                    tempPlacedCenters.forEach(placed => {
                        const key = [plant.name, placed.plantName].sort().join('::');
                        const dist = Math.sqrt((candCenterR - placed.r)**2 + (candCenterC - placed.c)**2);

                        const isAntagonist = lastDesignResponse && lastDesignResponse.antagonists && 
                            lastDesignResponse.antagonists.some(a => 
                                (a.plant === plant.name && a.antagonist === placed.plantName) ||
                                (a.plant === placed.plantName && a.antagonist === plant.name)
                            );
                        if (isAntagonist && !disabledAntagonists.has(key)) {
                            penalty += 1500 / (dist + 0.1); // Strong repulsion for antagonists
                        }

                        const isCompanion = lastDesignResponse && lastDesignResponse.companions && 
                            lastDesignResponse.companions.some(c => 
                                (c.plant === plant.name && c.companion === placed.plantName) ||
                                (c.plant === placed.plantName && c.companion === plant.name)
                            );
                        if (isCompanion) {
                            penalty -= 300 / (dist + 0.1); // High attraction bonus for companions
                        }

                        // Hard non-companion bed sharing prevention (prevents mixed beds)
                        if (placed.plantName !== plant.name && !isCompanion && !isFoodForest) {
                            const candBed = Math.floor(candCenterC / 6);
                            const placedBed = Math.floor(placed.c / 6);
                            if (candBed === placedBed) {
                                penalty += 800; // Strong penalty if sharing the same physical bed columns
                            }
                        }
                    });

                    cand.penalty = penalty;
                });

                // Sort candidates
                candidates.sort((a, b) => {
                    if (Math.abs(a.penalty - b.penalty) > 0.001) {
                        return a.penalty - b.penalty;
                    }
                    if (a.r !== b.r) return a.r - b.r;
                    return a.c - b.c;
                });

                // If the best candidate is blocked, this trial failed
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

                // Commit to temporary grid
                for (let dr = 0; dr < placeDiameter; dr++) {
                    for (let dc = 0; dc < placeDiameter; dc++) {
                        const cellR = best.r + dr;
                        const cellC = best.c + dc;
                        const existingCell = tempGrid[cellR][cellC];
                        
                        if (existingCell && existingCell.type === 'crop') {
                            // Food Forest Layering: Register greens/roots as understory rather than overriding tree
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

            if (!failed && placedCount === targetCount) {
                // Success! Commit temporary grid and placed centers to the main layout variables
                gridArray = tempGrid;
                placedCenters = tempPlacedCenters;
                success = true;
            } else {
                // Failed to fit with this spacing buffer, reduce spacing buffer and try again
                spacingBuffer--;
            }
        }
    });
}

    // 4. Save grid state for 3D view caching
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
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            const cellData = gridArray[r][c];
            const cell = document.createElement('div');
            cell.className = 'grid-cell';

            if (cellData === null) {
                cell.classList.add('empty');
            } else if (cellData.type === 'path') {
                cell.classList.add('path');
                cell.textContent = 'P';
                cell.title = "Walkway Path";
            } else if (cellData.type === 'crop') {
                cell.classList.add('crop');
                cell.dataset.instanceId = cellData.instanceId;

                // Highlight footprint if the crop instance is in the active selection
                const isSelected = selectedPlantGroups.some(g => g.userData.instanceId === cellData.instanceId);
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
                                for (let r = minR; r <= maxR; r++) {
                                    for (let c = minC; c <= maxC; c++) {
                                        const cell = currentGridArray[r]?.[c];
                                        if (cell && cell.type === 'crop' && !seenInstances.has(cell.instanceId)) {
                                            seenInstances.add(cell.instanceId);
                                            
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

                // Apply organic raised-bed borders to outline the plant's footprint space
                const dr = r - cellData.startR;
                const dc = c - cellData.startC;
                if (dr === 0) cell.classList.add('bed-border-top');
                if (dr === cellData.diameter - 1) cell.classList.add('bed-border-bottom');
                if (dc === 0) cell.classList.add('bed-border-left');
                if (dc === cellData.diameter - 1) cell.classList.add('bed-border-right');

                // Add exactly one top-down leaf graphic SVG spanning the full growth footprint
                if (cellData.isTopLeft || cellData.diameter === 1) {
                    const svgWrapper = document.createElement('div');
                    svgWrapper.className = 'plant-svg-wrapper';
                    svgWrapper.style.position = 'absolute';
                    svgWrapper.style.top = '0';
                    svgWrapper.style.left = '0';
                    svgWrapper.style.width = `calc(${cellData.diameter}00% + ${(cellData.diameter - 1) * 1}px)`;
                    svgWrapper.style.height = `calc(${cellData.diameter}00% + ${(cellData.diameter - 1) * 1}px)`;
                    svgWrapper.style.zIndex = '1';
                    svgWrapper.style.pointerEvents = 'none';
                    svgWrapper.innerHTML = getPlantSVG(cellData.plant);
                    cell.appendChild(svgWrapper);
                }

                // Footprint highlights on hover
                cell.addEventListener('mouseenter', () => {
                    document.querySelectorAll(`[data-instance-id="${cellData.instanceId}"]`).forEach(el => {
                        el.classList.add('hovered-footprint');
                    });
                });
                cell.addEventListener('mouseleave', () => {
                    document.querySelectorAll(`[data-instance-id="${cellData.instanceId}"]`).forEach(el => {
                        el.classList.remove('hovered-footprint');
                    });
                });

                // Render plant initials badge only in the center of the block
                if (cellData.isCenter || cellData.diameter === 1) {
                    const colors = getPlantColor(cellData.plant.id);
                    const initials = cellData.plant.name.split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase();
                    const initialsBadge = document.createElement('div');
                    initialsBadge.className = 'crop-initials-pill';
                    initialsBadge.style.color = colors.text;
                    initialsBadge.style.borderColor = colors.border;
                    initialsBadge.textContent = initials;
                    cell.appendChild(initialsBadge);

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
                renderLayoutGrid(currentWidth, currentHeight);
                renderRecommendations();
                trigger3DRender();
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
let scene3d, camera3d, renderer3d, gardenGroup3d;
let currentRenderMode = 'auto';
let current2DRenderId = 0;
let raycaster3d, mouse3d;
let lastHoveredGroup = null;
let isDragging3d = false;
let dragButton3d = 0; // 0 for left (rotation), 2 for right (panning)
let cameraTarget3d = null;
let previousMousePosition3d = { x: 0, y: 0 };

// 3D Layout Editor Global States
let isEditModeActive = false;
let selectedPlantGroups = [];
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

function resize3D() {
    const container = document.getElementById('3d-canvas-container');
    if (container && renderer3d && camera3d) {
        const width = container.clientWidth;
        const height = container.clientHeight;
        if (width > 0 && height > 0) {
            camera3d.aspect = width / height;
            camera3d.updateProjectionMatrix();
            renderer3d.setSize(width, height);
            renderer3d.render(scene3d, camera3d);
        }
    }
}

// Handle window resize events for both 2D and 3D views
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
    container.innerHTML = '';
    
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

    const dirLight = new THREE.DirectionalLight(0xffffff, 0.75);
    dirLight.position.set(20, 50, 20);
    dirLight.castShadow = true;
    scene3d.add(dirLight);

    // Group Container
    gardenGroup3d = new THREE.Group();
    scene3d.add(gardenGroup3d);

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
        } else {
            // Normal view orbiting/panning camera moves
            isDragging3d = true;
            dragButton3d = e.button; // 0 for left (orbit), 2 for right (pan)
        }

        previousMousePosition3d = {
            x: e.offsetX,
            y: e.offsetY
        };
    });

    renderer3d.domElement.addEventListener('mousemove', (e) => {
        const deltaMove = {
            x: e.offsetX - previousMousePosition3d.x,
            y: e.offsetY - previousMousePosition3d.y
        };

        const rect = renderer3d.domElement.getBoundingClientRect();
        mouse3d.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        mouse3d.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

        if (isDraggingPlant) {
            // Project ray onto ground plane and translate all selected plant meshes in local space
            raycaster3d.setFromCamera(mouse3d, camera3d);
            const intersectPt = new THREE.Vector3();
            raycaster3d.ray.intersectPlane(dragPlane3d, intersectPt);
            const localIntersectPt = intersectPt.clone();
            gardenGroup3d.worldToLocal(localIntersectPt);

            selectedPlantGroups.forEach(g => {
                const targetPos = new THREE.Vector3().addVectors(localIntersectPt, g.userData.dragOffset);
                targetPos.y = 0; // Force Y coordinate to be exactly 0 (no dipping below garden plane)
                g.position.copy(targetPos);
            });

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
        } else if (isDragging3d) {
            // View camera orbits and translation pans
            if (dragButton3d === 0) {
                gardenGroup3d.rotation.y += deltaMove.x * 0.007;
                gardenGroup3d.rotation.x += deltaMove.y * 0.007;
                gardenGroup3d.rotation.x = Math.max(-Math.PI / 3, Math.min(Math.PI / 6, gardenGroup3d.rotation.x));
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
            x: e.offsetX,
            y: e.offsetY
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

function build3DPlantModel(plant, diameter) {
    const plantGroup = new THREE.Group();
    const name = plant.name.toLowerCase();
    const category = plant.type ? plant.type.toLowerCase() : "";

    // Get color theme matching the plant category/type
    const colors = getPlantColor(plant.id);
    const leafColor = plant.foliage_color ? new THREE.Color(plant.foliage_color) : new THREE.Color(colors.border);
    const leafMat = new THREE.MeshStandardMaterial({ color: leafColor, roughness: 0.8 });
    const stalkMat = new THREE.MeshStandardMaterial({ color: 0x2e7d32, roughness: 0.8 }); // Green stalk
    const trunkMat = new THREE.MeshStandardMaterial({ color: 0x5c4033, roughness: 0.95 }); // Brown wood

    // 1. FRUIT TREES (Apple, Peach, Pear, Cherry, Orange, etc.)
    if (name.includes("tree") || category.includes("tree")) {
        // Trunk
        const trunkGeo = new THREE.CylinderGeometry(0.15 * diameter, 0.22 * diameter, 2.5, 8);
        const trunk = new THREE.Mesh(trunkGeo, trunkMat);
        trunk.position.y = 1.25;
        plantGroup.add(trunk);

        // Foliage Canopy (built of 3 overlapping spheres for organic look, or custom shape)
        const canopyGroup = new THREE.Group();
        canopyGroup.position.y = 2.8;

        if (plant.canopy_shape === 'conical') {
            const conical = new THREE.Mesh(new THREE.ConeGeometry(1.5, 3.0, 8), leafMat);
            conical.position.y = 0.5;
            canopyGroup.add(conical);
        } else if (plant.canopy_shape === 'weeping') {
            const weeping = new THREE.Mesh(new THREE.SphereGeometry(1.4, 8, 8), leafMat);
            weeping.scale.set(1.0, 1.6, 1.0);
            weeping.position.y = 0.3;
            canopyGroup.add(weeping);
        } else if (plant.canopy_shape === 'columnar') {
            const columnar = new THREE.Mesh(new THREE.CylinderGeometry(0.8, 0.8, 3.2, 8), leafMat);
            columnar.position.y = 0.6;
            canopyGroup.add(columnar);
        } else if (plant.canopy_shape === 'vase') {
            const vase = new THREE.Mesh(new THREE.CylinderGeometry(1.4, 0.5, 3.0, 8), leafMat);
            vase.position.y = 0.5;
            canopyGroup.add(vase);
        } else {
            // rounded / spreading / default
            const mainCanopy = new THREE.Mesh(new THREE.SphereGeometry(1.4, 8, 8), leafMat);
            canopyGroup.add(mainCanopy);

            const leftCanopy = new THREE.Mesh(new THREE.SphereGeometry(1.0, 8, 8), leafMat);
            leftCanopy.position.set(-0.8, 0.3, 0.2);
            canopyGroup.add(leftCanopy);

            const rightCanopy = new THREE.Mesh(new THREE.SphereGeometry(1.0, 8, 8), leafMat);
            rightCanopy.position.set(0.8, 0.1, -0.3);
            canopyGroup.add(rightCanopy);
        }

        plantGroup.add(canopyGroup);

        // Hanging Fruits
        let fruitColorVal = 0xef4444; // Apple red by default
        if (plant.fruit_color) {
            fruitColorVal = new THREE.Color(plant.fruit_color);
        } else {
            if (name.includes("orange") || name.includes("citrus")) fruitColorVal = 0xf97316; // Orange
            if (name.includes("lemon")) fruitColorVal = 0xeab308; // Lemon yellow
            if (name.includes("peach")) fruitColorVal = 0xfca5a5; // Peach pink
            if (name.includes("pear")) fruitColorVal = 0x84cc16; // Pear lime
        }

        const treeFruitMat = new THREE.MeshStandardMaterial({ color: fruitColorVal, roughness: 0.5 });
        for (let i = 0; i < 6; i++) {
            const fruit = new THREE.Mesh(new THREE.SphereGeometry(0.14, 6, 6), treeFruitMat);
            const angle = (i / 6) * Math.PI * 2 + Math.random() * 0.5;
            const radius = 0.9 + Math.random() * 0.4;
            fruit.position.set(
                radius * Math.cos(angle),
                2.4 + (Math.random() - 0.5) * 0.6,
                radius * Math.sin(angle)
            );
            plantGroup.add(fruit);
        }
    }
    // 2. TALL VINES / STAKED CROPS (Tomato, Pepper, Eggplant, Cucumber, Beans, Peas)
    else if (name.includes("tomato") || name.includes("cucumber") || name.includes("pepper") || name.includes("eggplant") || name.includes("bean") || name.includes("pea")) {
        // Vertical supporting wooden stake
        const stakeGeo = new THREE.BoxGeometry(0.06, 2.0, 0.06);
        const stake = new THREE.Mesh(stakeGeo, trunkMat);
        stake.position.y = 1.0;
        plantGroup.add(stake);

        // Main climbing vine stalk
        const stalkGeo = new THREE.CylinderGeometry(0.04, 0.04, 1.8, 6);
        const stalk = new THREE.Mesh(stalkGeo, stalkMat);
        stalk.position.y = 0.9;
        plantGroup.add(stalk);

        // Foliage levels along the stake
        for (let l = 0; l < 3; l++) {
            const levelY = 0.4 + l * 0.5;
            const numLeaves = 3 + l;
            for (let i = 0; i < numLeaves; i++) {
                const leafGeo = new THREE.SphereGeometry(0.24, 6, 6);
                const leaf = new THREE.Mesh(leafGeo, leafMat);
                const angle = (i / numLeaves) * Math.PI * 2;
                leaf.position.set(
                    0.25 * Math.cos(angle),
                    levelY + (Math.random() - 0.5) * 0.15,
                    0.25 * Math.sin(angle)
                );
                // Flatten leaves slightly
                leaf.scale.set(1.4, 0.4, 0.8);
                plantGroup.add(leaf);
            }
        }

        // Hanging Crops
        let cropColor = 0xef4444; // Tomato Red
        let isCapsule = false;
        let cropSize = 0.15;
        let cropCount = 4;

        if (plant.fruit_color) {
            cropColor = new THREE.Color(plant.fruit_color);
            if (name.includes("cucumber") || name.includes("pepper") || name.includes("eggplant") || name.includes("bean") || name.includes("pea")) {
                isCapsule = true;
            }
        } else {
            if (name.includes("cucumber")) {
                cropColor = 0x15803d; // Cucumber dark green
                isCapsule = true;
                cropCount = 3;
            } else if (name.includes("pepper")) {
                cropColor = name.includes("bell") ? 0xef4444 : (name.includes("jalapeno") ? 0x16a34a : 0xf59e0b); // Red/Green/Yellow
                isCapsule = true;
                cropCount = 4;
            } else if (name.includes("eggplant")) {
                cropColor = 0x581c87; // Eggplant dark purple
                isCapsule = true;
                cropSize = 0.22;
                cropCount = 2;
            } else if (name.includes("bean") || name.includes("pea")) {
                cropColor = 0x84cc16; // Lime green pod
                isCapsule = true;
                cropSize = 0.08;
                cropCount = 5;
            }
        }

        const cropMat = new THREE.MeshStandardMaterial({ color: cropColor, roughness: 0.6 });
        for (let i = 0; i < cropCount; i++) {
            let veggie;
            if (isCapsule) {
                // Cylindrical veggie
                veggie = new THREE.Mesh(new THREE.CylinderGeometry(cropSize * 0.5, cropSize * 0.5, cropSize * 2.2, 5), cropMat);
                veggie.rotation.z = Math.PI / 4 + Math.random() * 0.2;
            } else {
                // Spherical veggie
                veggie = new THREE.Mesh(new THREE.SphereGeometry(cropSize, 6, 6), cropMat);
            }
            const angle = (i / cropCount) * Math.PI * 2 + 0.3;
            veggie.position.set(
                0.22 * Math.cos(angle),
                0.5 + Math.random() * 1.0,
                0.22 * Math.sin(angle)
            );
            plantGroup.add(veggie);
        }
    }
    // 3. GREEN ONIONS, ONIONS, GARLIC, SHALLOTS, CHIVES (Tall vertical shoots + base bulb)
    else if (name.includes("onion") || name.includes("garlic") || name.includes("shallot") || name.includes("chive") || name.includes("leek")) {
        // Base bulb sitting right in the soil
        let bulbColor = 0xffffff; // Garlic white
        if (plant.fruit_color) {
            bulbColor = new THREE.Color(plant.fruit_color);
        } else {
            if (name.includes("onion") && (name.includes("red") || name.includes("purple"))) bulbColor = 0x800080; // Red onion purple
            else if (name.includes("onion") && name.includes("yellow")) bulbColor = 0xd8a060; // Yellow onion
            else if (name.includes("onion") || name.includes("chive")) bulbColor = 0xf0fff0; // White bulb / green base
        }
        
        const bulbMat = new THREE.MeshStandardMaterial({ color: bulbColor, roughness: 0.9 });
        const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.18, 8, 8), bulbMat);
        bulb.position.y = 0.06;
        bulb.scale.set(1.0, 1.3, 1.0); // Slightly tall bulb shape
        plantGroup.add(bulb);

        // Multiple vertical green hollow shoots (tapering upwards)
        const shootCount = name.includes("chive") ? 8 : (name.includes("leek") ? 3 : 5);
        for (let i = 0; i < shootCount; i++) {
            const shootGeo = new THREE.CylinderGeometry(0.01, 0.035, 1.0 + Math.random() * 0.4, 5);
            const shoot = new THREE.Mesh(shootGeo, stalkMat);
            
            const angle = (i / shootCount) * Math.PI * 2;
            const spreadRad = 0.06;
            shoot.position.set(spreadRad * Math.cos(angle), 0.5, spreadRad * Math.sin(angle));
            
            // Tilt them slightly outward from the center
            shoot.rotation.z = -(Math.cos(angle) * 0.18 + (Math.random() - 0.5) * 0.05);
            shoot.rotation.x = Math.sin(angle) * 0.18 + (Math.random() - 0.5) * 0.05;
            
            plantGroup.add(shoot);
        }
    }
    // 4. ROOT VEGETABLES (Carrot, Radish, Turnip, Beet, Potato, Sweet Potato, Parsnip)
    else if (name.includes("carrot") || name.includes("radish") || name.includes("turnip") || name.includes("beet") || name.includes("potato") || name.includes("parsnip")) {
        // Root crown peaking out of soil
        let rootColor = 0xd97706; // Carrot Orange
        if (plant.fruit_color) {
            rootColor = new THREE.Color(plant.fruit_color);
        } else {
            if (name.includes("radish")) rootColor = 0xdc2626; // Radish Red
            if (name.includes("beet")) rootColor = 0x701a75; // Beet deep purple
            if (name.includes("turnip")) rootColor = 0xf5f3ff; // Turnip whitish
            if (name.includes("potato")) rootColor = 0x78350f; // Potato brown
        }
        
        const rootMat = new THREE.MeshStandardMaterial({ color: rootColor, roughness: 0.9 });
        const rootCrown = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.08, 0.18, 8), rootMat);
        rootCrown.position.y = 0.06;
        plantGroup.add(rootCrown);

        // Feathery root greens foliage
        const leafCount = 4 + Math.round(Math.random() * 3);
        for (let i = 0; i < leafCount; i++) {
            const leafGeo = new THREE.ConeGeometry(0.04, 0.7, 5);
            const leaf = new THREE.Mesh(leafGeo, leafMat);
            const angle = (i / leafCount) * Math.PI * 2;
            
            // Position at top of crown
            leaf.position.set(0.04 * Math.cos(angle), 0.4, 0.04 * Math.sin(angle));
            
            // Tilt outwards
            leaf.rotation.z = -(Math.cos(angle) * 0.35);
            leaf.rotation.x = Math.sin(angle) * 0.35;
            
            plantGroup.add(leaf);
        }
    }
    // 5. ROSETTE LEAFY GREENS (Lettuce, Spinach, Cabbage, Kale, Chard, Collards, Bok Choy)
    else if (category.includes("green") || name.includes("lettuce") || name.includes("spinach") || name.includes("cabbage") || name.includes("kale") || name.includes("chard") || name.includes("greens") || name.includes("bok choy")) {
        // Form a leafy rosette with multiple overlapping flat leafy boxes rotated around center
        const leavesGroup = new THREE.Group();
        leavesGroup.position.y = 0.1;

        const petalsCount = 6;
        for (let i = 0; i < petalsCount; i++) {
            const leaf = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.04, 0.7), leafMat);
            const angle = (i / petalsCount) * Math.PI * 2;
            
            // Position offset outward
            leaf.position.set(0.18 * Math.cos(angle), 0.08, 0.18 * Math.sin(angle));
            
            // Rotation to form rosette
            leaf.rotation.y = -angle + Math.PI / 2;
            leaf.rotation.x = 0.45; // angle upwards
            
            leavesGroup.add(leaf);
        }

        // Central leaf ball cluster
        const centerBall = new THREE.Mesh(new THREE.SphereGeometry(0.24, 6, 6), leafMat);
        centerBall.position.set(0, 0.12, 0);
        leavesGroup.add(centerBall);

        plantGroup.add(leavesGroup);
    }
    // 6. BUSHY SHRUBS & BERRIES (Strawberry, Raspberry, Blackberry, Blueberry)
    else if (category.includes("berry") || name.includes("strawberry") || name.includes("raspberry") || name.includes("blackberry") || name.includes("blueberry")) {
        // Low bushy foliage
        const bushGeo = new THREE.SphereGeometry(0.38, 8, 8);
        const bush = new THREE.Mesh(bushGeo, leafMat);
        bush.position.y = 0.22;
        bush.scale.set(1.4, 0.9, 1.2); // flat bush
        plantGroup.add(bush);

        // Scattered colorful berries
        let berryColor = 0xef4444; // Red strawberry/raspberry
        if (plant.fruit_color) {
            berryColor = new THREE.Color(plant.fruit_color);
        } else {
            if (name.includes("blueberry")) berryColor = 0x2563eb; // Blue
            if (name.includes("blackberry")) berryColor = 0x0f172a; // Black
        }

        const shrubBerryMat = new THREE.MeshStandardMaterial({ color: berryColor, roughness: 0.6 });
        for (let i = 0; i < 6; i++) {
            const berry = new THREE.Mesh(new THREE.SphereGeometry(0.06, 5, 5), shrubBerryMat);
            const angle = (i / 6) * Math.PI * 2;
            berry.position.set(
                0.32 * Math.cos(angle) * (0.8 + Math.random() * 0.4),
                0.16 + Math.random() * 0.2,
                0.28 * Math.sin(angle) * (0.8 + Math.random() * 0.4)
            );
            plantGroup.add(berry);
        }
    }
    // 7. COMPANION FLOWERS (Marigold, Nasturtium, Sunflower, Lavender, Flower)
    else if (category.includes("flower") || name.includes("marigold") || name.includes("sunflower") || name.includes("lavender") || name.includes("nasturtium") || name.includes("flower") || plant.type === "Flower") {
        // Stem
        const stemGeo = new THREE.CylinderGeometry(0.03, 0.03, 0.8, 6);
        const stem = new THREE.Mesh(stemGeo, stalkMat);
        stem.position.y = 0.4;
        plantGroup.add(stem);

        // Broad green foundation leaves
        const foundationGeo = new THREE.SphereGeometry(0.24, 6, 6);
        const foundation = new THREE.Mesh(foundationGeo, leafMat);
        foundation.position.y = 0.15;
        foundation.scale.set(1.3, 0.4, 1.0);
        plantGroup.add(foundation);

        // Colorful flower petals disk
        let flowerColor = 0xf59e0b; // Gold/orange marigold
        let petSize = 0.22;
        if (plant.fruit_color) {
            flowerColor = new THREE.Color(plant.fruit_color);
        } else {
            if (name.includes("sunflower")) {
                flowerColor = 0xeab308; // Bright yellow
                petSize = 0.45;
            } else if (name.includes("lavender")) {
                flowerColor = 0xa855f7; // Purple
                petSize = 0.14;
            }
        }

        const bloomMat = new THREE.MeshStandardMaterial({ color: flowerColor, roughness: 0.6 });
        const flower = new THREE.Mesh(new THREE.SphereGeometry(petSize, 8, 8), bloomMat);
        flower.position.set(0, 0.8, 0);
        
        if (name.includes("sunflower")) {
            flower.scale.set(1.0, 0.2, 1.0); // flat face
            flower.rotation.x = Math.PI / 6;
            stem.scale.set(1.5, 1.8, 1.5); // taller stem
            stem.position.y = 0.9;
            flower.position.set(0, 1.8, 0.1);
        } else if (name.includes("lavender")) {
            flower.scale.set(0.6, 2.8, 0.6); // tall spike
        }
        
        plantGroup.add(flower);
    }
    // 8. GENERAL HERBS & SMALL BUSHES (Basil, Rosemary, Thyme, Cilantro, Oregano, Sage, Parsley)
    else {
        // Rosette stem branches
        const herbGroup = new THREE.Group();
        herbGroup.position.y = 0.1;

        const branchCount = 3;
        for (let i = 0; i < branchCount; i++) {
            const branch = new THREE.Mesh(new THREE.SphereGeometry(0.2, 6, 6), leafMat);
            const angle = (i / branchCount) * Math.PI * 2;
            branch.position.set(
                0.14 * Math.cos(angle),
                0.12,
                0.14 * Math.sin(angle)
            );
            // Slightly offset scales
            branch.scale.set(1.1, 0.85, 1.1);
            herbGroup.add(branch);
        }

        const centerHerb = new THREE.Mesh(new THREE.SphereGeometry(0.22, 6, 6), leafMat);
        centerHerb.position.set(0, 0.2, 0);
        herbGroup.add(centerHerb);

        plantGroup.add(herbGroup);
    }

    // Scale the entire group based on mature dimensions compared to category baselines
    let baseH = 1.0;
    let baseW = 1.0;

    if (name.includes("tree") || category.includes("tree")) {
        baseH = 15.0;
        baseW = 8.0;
    } else if (name.includes("tomato") || name.includes("cucumber") || name.includes("pepper") || name.includes("eggplant") || name.includes("bean") || name.includes("pea")) {
        baseH = 6.0;
        baseW = 3.0;
    } else if (name.includes("onion") || name.includes("garlic") || name.includes("shallot") || name.includes("chive") || name.includes("leek")) {
        baseH = 1.0;
        baseW = 1.0;
    } else if (name.includes("carrot") || name.includes("radish") || name.includes("turnip") || name.includes("beet") || name.includes("potato") || name.includes("parsnip")) {
        baseH = 1.0;
        baseW = 1.0;
    } else if (category.includes("green") || name.includes("lettuce") || name.includes("spinach") || name.includes("cabbage") || name.includes("kale") || name.includes("chard") || name.includes("greens") || name.includes("bok choy")) {
        baseH = 1.0;
        baseW = 1.0;
    } else if (category.includes("berry") || name.includes("strawberry") || name.includes("raspberry") || name.includes("blackberry") || name.includes("blueberry")) {
        baseH = 1.0;
        baseW = 1.0;
    } else if (category.includes("flower") || name.includes("marigold") || name.includes("sunflower") || name.includes("lavender") || name.includes("nasturtium") || name.includes("flower") || plant.type === "Flower") {
        if (name.includes("sunflower")) {
            baseH = 8.0;
            baseW = 4.0;
        } else if (name.includes("lavender")) {
            baseH = 3.0;
            baseW = 2.0;
        } else {
            baseH = 3.0;
            baseW = 2.0;
        }
    } else {
        baseH = 1.0;
        baseW = 1.0;
    }

    const matureH = plant.mature_height ? parseFloat(plant.mature_height) : getPlantHeight(plant);
    const matureW = plant.mature_width ? parseFloat(plant.mature_width) : getPlantDiameter(plant);

    const scaleX = baseW > 0 ? matureW / baseW : 1.0;
    const scaleY = baseH > 0 ? matureH / baseH : 1.0;
    
    plantGroup.scale.set(scaleX, scaleY, scaleX);

    return plantGroup;
}

let plantTextureCache = new Map();

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
    if (!gardenGroup3d) return;
    gardenGroup3d.traverse(node => {
        if (node instanceof THREE.Mesh) {
            disposeNode(node);
        }
    });
    // Dispose textures to free GPU memory
    plantTextureCache.forEach(texture => {
        texture.dispose();
    });
    plantTextureCache.clear();
    
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
    const coneGroup = new THREE.Group();
    const colors = getPlantColor(plant.id);
    
    // Determine radii and heights (converted to feet / grid units)
    const maxRad = plant.max_radius ? parseFloat(plant.max_radius) : diameter / 2;
    const minRad = plant.min_radius ? parseFloat(plant.min_radius) : maxRad * 0.25;
    const height = plant.mature_height ? parseFloat(plant.mature_height) : 3.0;

    // Cylinder: CylinderGeometry(radiusTop, radiusBottom, height, radialSegments, heightSegments, openEnded)
    const coneGeo = new THREE.CylinderGeometry(maxRad, minRad, height, 8);
    
    // Materials
    const sideMat = new THREE.MeshStandardMaterial({
        color: colors.border,
        transparent: true,
        opacity: 0.6,
        roughness: 0.8,
        side: THREE.DoubleSide
    });

    const textureCacheKey = `${plant.id}_${colors.border}_${colors.background}`;
    if (!plantTextureCache.has(textureCacheKey)) {
        const emoji = getPlantEmoji(plant.name);
        const texture = createPlantTextureCanvas(plant.name, emoji, colors);
        plantTextureCache.set(textureCacheKey, texture);
    }
    const canvasTexture = plantTextureCache.get(textureCacheKey);
    
    const topCapMat = new THREE.MeshStandardMaterial({
        map: canvasTexture,
        roughness: 0.5
    });

    const materials = [sideMat, topCapMat, sideMat];
    const coneMesh = new THREE.Mesh(coneGeo, materials);
    
    coneMesh.position.y = height / 2;
    coneGroup.add(coneMesh);

    return coneGroup;
}

function update3DLayout(width, height, gridArray) {
    if (!scene3d || !gardenGroup3d) return;

    // Clear previous elements with proper memory disposal
    clearGarden3D();

    const cols = gridArray[0].length;
    const rows = gridArray.length;

    // Adjust camera height and target dynamically to frame the entire garden space
    if (camera3d && shouldResetCamera3D) {
        const maxDim = Math.max(cols, rows);
        camera3d.position.set(0, maxDim * 1.2 + 8, maxDim * 1.4 + 12);
        if (cameraTarget3d) {
            cameraTarget3d.set(0, 0, 0);
        }
        camera3d.lookAt(cameraTarget3d || new THREE.Vector3(0, 0, 0));
        shouldResetCamera3D = false;
    }

    // Ground plane grass lawn card
    const groundGeo = new THREE.BoxGeometry(cols, 0.2, rows);
    const groundMat = new THREE.MeshStandardMaterial({ color: 0x142015, roughness: 0.95 }); // Moss green grass
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.position.y = -0.1;
    gardenGroup3d.add(ground);

    // Count total crops to determine auto-performance switch
    let totalCropsCount = 0;
    const preCountSet = new Set();
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            const cellData = gridArray[r][c];
            if (cellData && cellData.type === 'crop' && !preCountSet.has(cellData.instanceId)) {
                preCountSet.add(cellData.instanceId);
                totalCropsCount++;
            }
        }
    }

    const isSimplifiedMode = currentRenderMode === 'simplified' || 
        (currentRenderMode === 'auto' && totalCropsCount > 500);

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
                const pathGeo = new THREE.BoxGeometry(0.98, 0.12, 0.98);
                const pathMat = new THREE.MeshStandardMaterial({ color: 0x5a4537, roughness: 0.95 });
                const pathTile = new THREE.Mesh(pathGeo, pathMat);
                pathTile.position.set(item.x, 0.06, item.z);
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
                instanceGroup.add(frame);

                // 2. Black soil compost surface
                const soilGeo = new THREE.BoxGeometry(diameter * 0.94, 0.06, diameter * 0.94);
                const soilMat = new THREE.MeshStandardMaterial({ color: 0x160f0a, roughness: 0.98 });
                const soil = new THREE.Mesh(soilGeo, soilMat);
                soil.position.set(0, 0.18, 0);
                instanceGroup.add(soil);

                // 3. Center the 3D plant model (realistic or simplified octagonal cone)
                let plant3d;
                if (isSimplifiedMode) {
                    plant3d = buildSimplifiedConeModel(item.cellData.plant, diameter);
                } else {
                    plant3d = build3DPlantModel(item.cellData.plant, diameter);
                }
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
        }
    }

    requestAnimationFrame(renderNext3DChunk);
}

// Initialize on window load
window.addEventListener('load', () => {
    loadPlants();
    initPreferences();
    initMultiPresets();
    initAgentHub();
    
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
    const distributeInput = document.getElementById('chk-distribute-layout');
    if (distributeInput) {
        distributeInput.addEventListener('change', () => {
            if (selectedCrops.length > 0) submitDesign();
        });
    }

    // Render Mode select change listener
    const renderModeSelect = document.getElementById('select-render-mode');
    if (renderModeSelect) {
        renderModeSelect.addEventListener('change', (e) => {
            currentRenderMode = e.target.value;
            trigger3DRender();
        });
    }

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

    const methodCheckboxes = document.querySelectorAll('.methodology-checkbox');
    const popover = document.getElementById('methodology-popover');
    const popoverTitle = document.getElementById('methodology-popover-title');
    const popoverText = document.getElementById('methodology-popover-text');
    const popoverClose = document.getElementById('methodology-popover-close');

    let activeHoveredMethod = null;
    let isPopoverPinned = false;

    const showPopover = (methodKey, targetEl) => {
        const details = methodologyDetails[methodKey];
        if (popover && details && targetEl) {
            popoverTitle.textContent = details.title;
            popoverText.textContent = details.text;
            
            popover.style.display = 'block';
            popover.style.position = 'fixed';
            
            const rect = targetEl.getBoundingClientRect();
            let leftPos = rect.right + 12;
            
            // Prevent going off screen right
            if (leftPos + popover.offsetWidth > window.innerWidth - 16) {
                leftPos = rect.left - popover.offsetWidth - 12;
            }
            
            let topPos = rect.top;
            // Prevent going off screen bottom
            if (topPos + popover.offsetHeight > window.innerHeight - 16) {
                topPos = window.innerHeight - popover.offsetHeight - 16;
            }
            
            popover.style.left = leftPos + 'px';
            popover.style.top = topPos + 'px';
            
            // Trigger animation frame for transition
            requestAnimationFrame(() => {
                popover.style.opacity = '1';
                popover.style.transform = 'translateX(0)';
            });
        }
    };

    const hidePopover = () => {
        if (popover && !isPopoverPinned) {
            popover.style.opacity = '0';
            popover.style.transform = 'translateX(-10px)';
            // Hide after transition completes
            setTimeout(() => {
                if (!isPopoverPinned && popover.style.opacity === '0') {
                    popover.style.display = 'none';
                }
            }, 200);
            activeHoveredMethod = null;
        }
    };

    if (popoverClose) {
        popoverClose.addEventListener('click', (e) => {
            e.stopPropagation();
            isPopoverPinned = false;
            hidePopover();
        });
    }

    // Clicking anywhere else on the document closes a pinned popover
    document.addEventListener('click', (e) => {
        if (isPopoverPinned && popover && !popover.contains(e.target) && !e.target.closest('.method-checkbox-item')) {
            isPopoverPinned = false;
            hidePopover();
        }
    });

    methodCheckboxes.forEach(cb => {
        cb.addEventListener('change', (e) => {
            const method = e.target.id.replace('chk-method-', '');
            
            if (e.target.checked) {
                if (method === 'block') {
                    // Uncheck all others
                    methodCheckboxes.forEach(other => {
                        if (other !== e.target) other.checked = false;
                    });
                } else {
                    // Uncheck block if selecting another
                    const blockCb = document.getElementById('chk-method-block');
                    if (blockCb) blockCb.checked = false;
                }
            } else {
                // If all are unchecked, default check Block
                const anyChecked = Array.from(methodCheckboxes).some(c => c.checked);
                if (!anyChecked) {
                    const blockCb = document.getElementById('chk-method-block');
                    if (blockCb) blockCb.checked = true;
                }
            }
            if (selectedCrops.length > 0) {
                submitDesign();
            }
        });

        // Hover events
        const parentItem = cb.closest('.method-checkbox-item');
        if (parentItem) {
            const methodKey = parentItem.dataset.method;

            parentItem.addEventListener('mouseenter', () => {
                if (isPopoverPinned) return;
                activeHoveredMethod = methodKey;
                showPopover(methodKey, parentItem);
            });

            parentItem.addEventListener('mouseleave', () => {
                if (isPopoverPinned) return;
                hidePopover();
            });

            // Click triggers pinning
            parentItem.addEventListener('click', (e) => {
                // Ignore if clicking the checkbox input directly
                if (e.target === cb) return;
                
                e.stopPropagation();
                activeHoveredMethod = methodKey;
                isPopoverPinned = true;
                showPopover(methodKey, parentItem);
                
                // Visual feedback: briefly flash border
                if (popover) {
                    popover.style.borderColor = '#10b981';
                    setTimeout(() => {
                        if (isPopoverPinned) popover.style.borderColor = 'var(--accent-emerald)';
                    }, 300);
                }
            });
        }
    });

    // Default check Block Plantation initially
    const initBlockCb = document.getElementById('chk-method-block');
    if (initBlockCb) initBlockCb.checked = true;

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
