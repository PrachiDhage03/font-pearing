// State variables
let lockedFonts = { 1: false, 2: false, 3: false };
let currentFonts = { 1: null, 2: null, 3: null };
let contrastLevel = 50;

// Variable to track which font slot is being edited
let currentEditingFont = null;

// DOM elements
const generateBtn = document.getElementById('generate-btn');
const contrastSlider = document.getElementById('contrast-slider');
const font1Text = document.getElementById('font1-text');
const font2Text = document.getElementById('font2-text');
const font3Text = document.getElementById('font3-text');
const lockBtns = document.querySelectorAll('.lock-btn');
const themeToggle = document.getElementById('theme-toggle');
const menuBtns = document.querySelectorAll('.menu-btn');
const menuPanel = document.getElementById('menuPanel');
const menuTitle = document.getElementById('menuTitle');
const fontGrid = document.getElementById('fontGrid');

// Fonts array and API key
let fonts = [];
const API_KEY = 'AIzaSyBqBFl2yJaZFCYoqkHGWFlSzuqwuGb-F58';

// Utility function to load font
function loadFont(fontName) {
    const link = document.createElement('link');
    link.href = `https://fonts.googleapis.com/css2?family=${fontName.replace(' ', '+')}&display=swap`;
    link.rel = 'stylesheet';
    document.head.appendChild(link);
}

// Fetch fonts from API
async function fetchFonts() {
    try {
        const response = await fetch(`https://www.googleapis.com/webfonts/v1/webfonts?key=${API_KEY}`);
        const data = await response.json();
        fonts = data.items.map(font => ({
            name: font.family,
            category: font.category
        }));
        console.log('Fonts loaded:', fonts.length);
    } catch (error) {
        console.error('Error fetching fonts:', error);
        fonts = [
            { name: 'Arial', category: 'sans-serif' },
            { name: 'Times New Roman', category: 'serif' },
            { name: 'Courier New', category: 'monospace' },
            { name: 'Georgia', category: 'serif' },
            { name: 'Verdana', category: 'sans-serif' },
            { name: 'Comic Sans MS', category: 'handwriting' },
            { name: 'Impact', category: 'display' },
        ];
    }
}

// Get random font with category filtering
function getRandomFont(preferredCategory = null, lockedFont = null) {
    if (lockedFont) return lockedFont;
    
    let filteredFonts = fonts;
    if (preferredCategory) {
        filteredFonts = fonts.filter(f => f.category === preferredCategory);
        if (filteredFonts.length === 0) filteredFonts = fonts;
    }
    
    const randomFont = filteredFonts[Math.floor(Math.random() * filteredFonts.length)];
    loadFont(randomFont.name);
    return randomFont;
}

// Get contrast-based category
function getContrastCategory(fontCategory, contrastLevel) {
    const categories = ['serif', 'sans-serif', 'monospace', 'handwriting', 'display'];
    if (contrastLevel < 34) return fontCategory;
    else if (contrastLevel < 67) {
        const similarPairs = {
            'serif': 'sans-serif',
            'sans-serif': 'serif',
            'monospace': 'sans-serif',
            'handwriting': 'display',
            'display': 'handwriting'
        };
        return similarPairs[fontCategory] || categories[Math.floor(Math.random() * categories.length)];
    } else {
        const contrastPairs = {
            'serif': 'display',
            'sans-serif': 'handwriting',
            'monospace': 'serif',
            'handwriting': 'sans-serif',
            'display': 'monospace'
        };
        return contrastPairs[fontCategory] || categories[Math.floor(Math.random() * categories.length)];
    }
}

// Update font label text
function updateFontLabel(index, font) {
    const label = document.querySelector(`.menu-font-${index}`);
    if (label) {
        label.textContent = font.name;
        console.log(`Updated h2 for Font ${index} to: ${font.name}`);  // Debug log
    } else {
        console.log(`h2 for Font ${index} not found!`);  // Debug if not found
    }
}

// Get contrast label
function getContrastLabel(value) {
    if (value <= 20) return 'Very Similar';
    if (value <= 40) return 'More Similarity';
    if (value <= 60) return 'Balanced';
    if (value <= 80) return 'More Contrast';
    return 'High Contrast';
}

// Generate font pairings
function generatePairings() {
    const font1 = getRandomFont(null, lockedFonts[1] ? currentFonts[1] : null);
    const font2Category = getContrastCategory(font1.category, contrastLevel);
    const font2 = getRandomFont(font2Category, lockedFonts[2] ? currentFonts[2] : null);
    const font3Category = getContrastCategory(font2.category, contrastLevel);
    const font3 = getRandomFont(font3Category, lockedFonts[3] ? currentFonts[3] : null);
    
    currentFonts[1] = font1;
    currentFonts[2] = font2;
    currentFonts[3] = font3;
    
    // Update font styles and headings
    [font1Text, font2Text, font3Text].forEach((textEl, i) => {
        textEl.style.fontFamily = currentFonts[i + 1].name;
        updateFontLabel(i + 1, currentFonts[i + 1]);  // This ensures Section 1 h2 updates
    });
}

// Build font grid
function buildFontGrid(filteredFonts) {
    if (!fontGrid) return;
    fontGrid.innerHTML = '';
    
    filteredFonts.forEach(font => {
        loadFont(font.name);
        const box = document.createElement('div');
        box.className = 'font-box';
        box.textContent = 'A';
        box.style.fontFamily = font.name;
        box.dataset.font = font.name;
        
        // Add click event to select font
        box.addEventListener('click', () => {
            selectFont(font);
        });
        
        fontGrid.appendChild(box);
    });
}

// Show similar fonts in menu
function showSimilar(targetFont, level) {
    if (!targetFont) return;
    
    let filtered = fonts.filter(f => f.category === targetFont.category);
    filtered.sort((a, b) => a.name.localeCompare(b.name));
    
    buildFontGrid(filtered);
}

// Open menu with specific type
function openMenu(type) {
    currentEditingFont = parseInt(type);  // Convert string to number (e.g., "2" -> 2)
    const fontMap = { 1: currentFonts[1], 2: currentFonts[1], 3: currentFonts[2], 4: currentFonts[3] };
    const titleMap = {
        1: ` ${fontMap[1]?.name}(Very Similar )`,
        2: `${fontMap[2]?.name}(most to least similar)`,
        3: `${fontMap[3]?.name}(most to least similar)`,
        4: `${fontMap[4]?.name}(most to least similar)`
    };
    
    menuTitle.textContent = titleMap[type];
    showSimilar(fontMap[type], type === 1 ? 'very' : 'all');
    menuPanel.style.display = 'block';
}

// Function to select and apply the font
function selectFont(selectedFont) {
    if (!currentEditingFont) return;
    
    // Map the editing slot to the font index
    const fontIndex = currentEditingFont === 2 ? 1 : currentEditingFont === 3 ? 2 : currentEditingFont === 4 ? 3 : 1;
    
    console.log('Selecting font for slot:', fontIndex, 'Font name:', selectedFont.name);  // Debug log
    
    // Update the current font
    currentFonts[fontIndex] = selectedFont;
    
    // Update the preview text in Section 2 (fontFamily)
    const textEl = document.getElementById(`font${fontIndex}-text`);
    if (textEl) {
        textEl.style.fontFamily = selectedFont.name;
        console.log('Updated Section 2 text for font', fontIndex);  // Debug log
    }
    
    // Update the label in Section 1 (h2 text) - Use updateFontLabel for consistency
    updateFontLabel(fontIndex, selectedFont);
    console.log('Updated Section 1 h2 for font', fontIndex);  // Debug log
    
    // Close the menu
    menuPanel.style.display = 'none';
    currentEditingFont = null; // Reset
}

// Force hide menu on page load to prevent auto-open
document.addEventListener('DOMContentLoaded', () => {
    if (menuPanel) {
        menuPanel.style.display = 'none';
        console.log('Menu panel hidden on load');
    }
});

// Apply theme
function applyTheme(theme) {
    document.body.classList.toggle('dark-mode', theme === 'dark');
    if (themeToggle) {
        themeToggle.textContent = theme === 'dark' ? '☀️' : '🌙';
    }
    localStorage.setItem('theme', theme);
    console.log('Theme applied:', theme);
}

// Initialize app
fetchFonts().then(() => {
    // Set default fonts on load (no random generation)
    const defaultFonts = [
        { name: 'Arial', category: 'sans-serif' },
        { name: 'Times New Roman', category: 'serif' },
        { name: 'Georgia', category: 'serif' }
    ];
    currentFonts[1] = defaultFonts[0];
    currentFonts[2] = defaultFonts[1];
    currentFonts[3] = defaultFonts[2];
    
    // Load fonts and update UI with defaults
    loadFont(currentFonts[1].name);
    loadFont(currentFonts[2].name);
    loadFont(currentFonts[3].name);
    
    // Update UI with default fonts
    [font1Text, font2Text, font3Text].forEach((textEl, i) => {
        textEl.style.fontFamily = currentFonts[i + 1].name;
        updateFontLabel(i + 1, currentFonts[i + 1]);
    });
    
    // Set initial lock icons
    lockBtns.forEach(btn => {
        const fontNum = btn.dataset.font;
        btn.innerHTML = lockedFonts[fontNum] ? '<i class="ri-lock-2-fill"></i>' : '<i class="ri-lock-unlock-line"></i>';
    });
});

// Event listeners
if (generateBtn) generateBtn.addEventListener('click', generatePairings);

if (contrastSlider) {
    contrastSlider.addEventListener('input', (e) => {
        contrastLevel = e.target.value;
        contrastSlider.title = getContrastLabel(contrastLevel);
    });
}

// Corrected lock button event listener
lockBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
        const targetBtn = e.target.closest('.lock-btn');
        const fontNum = targetBtn.dataset.font;
        lockedFonts[fontNum] = !lockedFonts[fontNum];
        targetBtn.classList.toggle('locked');
        targetBtn.innerHTML = lockedFonts[fontNum] ? '<i class="ri-lock-2-fill"></i>' : '<i class="ri-lock-unlock-line"></i>';
    });
});

// Theme toggle (consolidated)
if (themeToggle) {
    const savedTheme = localStorage.getItem('theme') || 'light';
    applyTheme(savedTheme);
    themeToggle.addEventListener('click', () => {
        const newTheme = document.body.classList.contains('dark-mode') ? 'light' : 'dark';
        applyTheme(newTheme);
    });
}

menuBtns.forEach(btn => {
    btn.addEventListener('click', () => openMenu(btn.dataset.menu));
});

if (document.getElementById('closeMenu')) {
    document.getElementById('closeMenu').addEventListener('click', () => {
        menuPanel.style.display = 'none';
    });
}

const searchFonts = document.getElementById('searchFonts');
if (searchFonts) {
    searchFonts.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase();
        let filtered = fonts.filter(font => font.name.toLowerCase().includes(query));
        
        // If editing a specific font, prioritize fonts in the same category
        if (currentEditingFont) {
            const targetFont = currentFonts[currentEditingFont === 2 ? 1 : currentEditingFont === 3 ? 2 : currentEditingFont === 4 ? 3 : 1];  // Now currentEditingFont is a number
            if (targetFont) {
                filtered = filtered.filter(font => font.category === targetFont.category);
            }
        }
        
        // Sort: Matching fonts first, then others
        filtered.sort((a, b) => {
            const aStarts = a.name.toLowerCase().startsWith(query);
            const bStarts = b.name.toLowerCase().startsWith(query);
            if (aStarts && !bStarts) return -1;
            if (!aStarts && bStarts) return 1;
            return a.name.localeCompare(b.name); // Alphabetical fallback
        });
        
        buildFontGrid(filtered);
    });
}
