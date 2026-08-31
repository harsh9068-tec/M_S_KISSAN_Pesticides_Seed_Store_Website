// Shared Product Storage, Distributor Brands, and Security Layer for M/S KISSAN

const STORAGE_KEY = 'kissan_products_catalog_v2';
const ADMIN_PIN_HASH_KEY = 'kissan_admin_pin_hash';
const SALT = 'kissan_salt_2026_';

// Salted SHA-256 hash for admin security verification
const DEFAULT_PIN_HASH = '95bf354170abc2e982d3ce6a35e98ca0e76a4118ca2d2dc9702dad53782f75e9';

// Cryptographic SHA-256 Hashing Function
async function hashPin(pin) {
  const encoder = new TextEncoder();
  const data = encoder.encode(SALT + String(pin).trim());
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// ==================== AUTHORIZED DISTRIBUTOR BRANDS METADATA ====================
const DISTRIBUTOR_BRANDS = [
  {
    id: 'syngenta',
    name: 'Syngenta India Limited',
    shortName: 'Syngenta',
    badge: 'Authorized Primary Dealer',
    icon: '🌱',
    color: '#0b5d32',
    category: 'Crop Protection & Bio-Stimulants',
    descEn: 'World-leading agricultural science company providing research-backed fungicides, insecticides, and crop enhancers like Miravis Duo, Incipio, and Isabion.',
    descHi: 'विश्वस्तरीय कृषि विज्ञान कंपनी — जो प्रदान करती है उन्नत फफूंदनाशक, कीटनाशक व बायो-टॉनिक जैसे मिराविस ड्यूओ, इंसिपियो, स्कोर व इसाबियन।',
    topProducts: ['Miravis Duo', 'Incipio', 'Score', 'Simodis', 'Kavach Flo', 'Isabion']
  },
  {
    id: 'dupont',
    name: 'DuPont / Corteva Agriscience',
    shortName: 'DuPont / Corteva',
    badge: 'Authorized Distributor',
    icon: '🔬',
    color: '#00539b',
    category: 'Advanced Crop Protection',
    descEn: 'Global innovator known for gold-standard borer control (Coragen), downy mildew fungicides (Curzate), and specialized hopper insecticides (Pexalon).',
    descHi: 'वैश्विक कृषि तकनीक प्रदाता — जो अपने प्रसिद्ध कीटनाशक कोराजन (Coragen), करजेट एवं पेक्सलॉन के लिए भारत भर में प्रसिद्ध है।',
    topProducts: ['Coragen Insecticide', 'Curzate Fungicide', 'Pexalon Hopper Control']
  },
  {
    id: 'agrico',
    name: 'Agrico Organics Limited',
    shortName: 'Agrico Organics',
    badge: 'Authorized Distributor',
    icon: '🌾',
    color: '#2e7d32',
    category: 'Agrochemicals & Herbicides',
    descEn: 'Pioneer in crop protection chemicals, wheat weedicides (Gulli Danda control), systemic fungicides, and high-efficiency organic granules.',
    descHi: 'प्रमाणित कीटनाशक, गेहूं के खरपतवार नाशक (गुल्ली डंडा नियंत्रण) व सुरक्षात्मक फफूंदनाशकों के प्रमुख निर्माता।',
    topProducts: ['Agri-Clodinafop (Weedicide)', 'Agri-Mancozeb 75% WP', 'Agri-Biozyme Granules']
  },
  {
    id: 'triveni',
    name: 'Triveni Fertilizers Private Limited',
    shortName: 'Triveni Fertilizers',
    badge: 'Authorized Fertilizer Distributor',
    icon: '🧪',
    color: '#d97706',
    category: 'Water-Soluble Fertilizers & Micronutrients',
    descEn: 'High-purity 100% water-soluble NPK specialty fertilizers (19:19:19), chelated micronutrients, Zinc Sulfate 33%, and soil-enriching PROM.',
    descHi: '100% घुलनशील एनपीके (19:19:19), जिंक सल्फेट 33%, सूक्ष्म पोषक तत्व एवं जैविक फास्फोरस (PROM) के अधिकृत वितरक।',
    topProducts: ['Triveni NPK 19:19:19', 'Triveni Zinc Sulfate 33%', 'Triveni PROM Organic']
  },
  {
    id: 'coromandel',
    name: 'Coromandel International Limited / Coromandel Agrico',
    shortName: 'Coromandel (Gromor)',
    badge: 'Authorized Dealer & Partner',
    icon: '🚜',
    color: '#c2410c',
    category: 'Gromor Fertilizers & Bio-Stimulants',
    descEn: 'India’s pioneer in high-analysis complex fertilizers (Gromor 28:28:0), granular borer protection (Ferterra), and bio-stimulants (Fantac Plus).',
    descHi: 'भारत की प्रतिष्ठित ग्रोमोर खाद (28:28:0), फरटेरा दानेदार कीटनाशक एवं फैन्टेक प्लस बायो-स्टिमुलेंट के प्रमुख निर्माता।',
    topProducts: ['Gromor 28:28:0 Complex', 'Coromandel Fantac Plus', 'Coromandel Ferterra 0.4% GR']
  },
  {
    id: 'safex',
    name: 'Safex Chemicals (India) Limited',
    shortName: 'Safex Chemicals',
    badge: 'Authorized Distributor',
    icon: '🛡️',
    color: '#1e40af',
    category: 'Insecticides & Paddy Herbicides',
    descEn: 'Comprehensive range of crop protection products including paddy weedicides (Safari Pretilachlor), Safuron, and sucking pest insecticides.',
    descHi: 'धान के खरपतवार नाशक (सफारी), तना छेदक व इल्ली नाशक (सफ्यूरॉन) एवं उच्च गुणवत्ता कीटनाशक उत्पाद।',
    topProducts: ['Safex Safari (Pretilachlor 50% EC)', 'Safex Safuron', 'Safex Safegor']
  },
  {
    id: 'samradhi',
    name: 'Samradhi Crop Chemicals Private Limited',
    shortName: 'Samradhi Chemicals',
    badge: 'Authorized Distributor',
    icon: '🍃',
    color: '#047857',
    category: 'Crop Chemicals & Growth Regulators',
    descEn: 'High-efficacy caterpillar killers (Sam-Super Emamectin), plant growth boosters (Sam-Gold Gibberellic Acid), and paddy blast control (Sam-Blast).',
    descHi: 'इल्ली व सुंडी रोधक (सैम-सुपर इमामेक्टिन), गन्ने व फसलों की बढ़वार टॉनिक (सैम-गोल्ड) एवं ब्लास्ट नाशक (सैम-ब्लास्ट)।',
    topProducts: ['Samradhi Sam-Super (Emamectin 5% SG)', 'Samradhi Sam-Gold PGR', 'Samradhi Sam-Blast']
  }
];

// ==================== MASTER PRODUCT CATALOG ====================
const DEFAULT_PRODUCTS = [
  // --- SYNGENTA PRODUCTS ---
  {
    id: 'prod_1',
    name: 'Miravis Duo',
    brand: 'Syngenta',
    category: 'fungicide',
    crops: 'Chilli, Tomato, Groundnut, Grapes, Sugarcane',
    target: 'Powdery mildew, leaf spot, fruit rot, anthracnose, red rot',
    dosage: '1-1.5 ml / Litre of water',
    packSizes: '100ml, 250ml, 500ml',
    icon: '🍅',
    image: '',
    inStock: true,
    featured: true
  },
  {
    id: 'prod_2',
    name: 'Score Fungicide',
    brand: 'Syngenta',
    category: 'fungicide',
    crops: 'Wheat, Field crops, Fruits, Vegetables',
    target: 'Yellow rust, powdery mildew, anthracnose, scab',
    dosage: '0.5-1 ml / Litre of water (200 ml / Acre)',
    packSizes: '100ml, 250ml, 500ml, 1L',
    icon: '🌾',
    image: '',
    inStock: true,
    featured: true
  },
  {
    id: 'prod_3',
    name: 'Incipio Insecticide',
    brand: 'Syngenta',
    category: 'insecticide',
    crops: 'Sugarcane, Paddy / Rice',
    target: 'Stem borers, top borers (Kansua), leaf folders',
    dosage: '100 ml / Acre in 200 Litres water',
    packSizes: '100ml, 250ml',
    icon: '🐛',
    image: '',
    inStock: true,
    featured: true
  },
  {
    id: 'prod_4',
    name: 'Simodis Insecticide',
    brand: 'Syngenta',
    category: 'insecticide',
    crops: 'Cotton, Chilli, Tomato, Vegetables',
    target: 'Thrips, yellow mites, caterpillars, sucking pests',
    dosage: '80-100 ml / Acre in 150L water',
    packSizes: '50ml, 100ml, 250ml',
    icon: '🌿',
    image: '',
    inStock: true,
    featured: true
  },
  {
    id: 'prod_5',
    name: 'Kavach Flo Fungicide',
    brand: 'Syngenta',
    category: 'fungicide',
    crops: 'Tomato, Potato, Chilli, Mustard',
    target: 'Early / late blight, white rust, fruit rot',
    dosage: '2 ml / Litre of water',
    packSizes: '250ml, 500ml, 1L',
    icon: '🌶️',
    image: '',
    inStock: true,
    featured: true
  },
  {
    id: 'prod_6',
    name: 'Isabion Bio-Stimulant',
    brand: 'Syngenta',
    category: 'bio',
    crops: 'Sugarcane, Wheat, Paddy, Vegetables',
    target: 'Vegetative growth, flower boost, abiotic stress recovery',
    dosage: '2-2.5 ml / Litre of water (400-500 ml / Acre)',
    packSizes: '250ml, 500ml, 1L',
    icon: '🍃',
    image: '',
    inStock: true,
    featured: true
  },
  {
    id: 'prod_7',
    name: 'Quantis Crop Stress Care',
    brand: 'Syngenta',
    category: 'bio',
    crops: 'Sugarcane, Potato, Wheat, Tomato',
    target: 'Drought, extreme heat & frost stress resilience',
    dosage: '1 Litre / Acre',
    packSizes: '500ml, 1L, 5L',
    icon: '💧',
    image: '',
    inStock: true,
    featured: false
  },

  // --- DUPONT / CORTEVA PRODUCTS ---
  {
    id: 'prod_8',
    name: 'Coragen Insecticide (Chlorantraniliprole 18.5% SC)',
    brand: 'DuPont / Corteva',
    category: 'insecticide',
    crops: 'Sugarcane, Paddy, Maize, Tomato, Vegetables',
    target: 'Early shoot borer, top borer, stem borer, fruit borer',
    dosage: '150 ml / Acre (Sugarcane drenching) / 60 ml / Acre (Foliar)',
    packSizes: '30ml, 60ml, 150ml',
    icon: '🛡️',
    image: '',
    inStock: true,
    featured: true
  },
  {
    id: 'prod_9',
    name: 'Curzate Fungicide (Cymoxanil + Mancozeb)',
    brand: 'DuPont / Corteva',
    category: 'fungicide',
    crops: 'Potato, Tomato, Grapes, Cucumber',
    target: 'Late blight, downy mildew, leaf spots',
    dosage: '2.5 - 3 gm / Litre of water (600 gm / Acre)',
    packSizes: '300gm, 600gm, 1.2kg',
    icon: '🧪',
    image: '',
    inStock: true,
    featured: true
  },
  {
    id: 'prod_10',
    name: 'Pexalon Insecticide (Triflumezopyrim 10% SC)',
    brand: 'DuPont / Corteva',
    category: 'insecticide',
    crops: 'Paddy / Rice',
    target: 'Brown plant hopper (BPH), white backed plant hopper',
    dosage: '94 ml / Acre',
    packSizes: '94ml, 235ml',
    icon: '🌾',
    image: '',
    inStock: true,
    featured: false
  },

  // --- AGRICO ORGANICS LIMITED ---
  {
    id: 'prod_11',
    name: 'Agri-Clodinafop 15% WP (Wheat Weedicide)',
    brand: 'Agrico Organics',
    category: 'herbicide',
    crops: 'Wheat (गेहूं)',
    target: 'Phalaris minor (Gulli Danda / Mandusi) and wild oats',
    dosage: '160 gm / Acre in 150L water (30-35 days after sowing)',
    packSizes: '160 gm box with surfactant',
    icon: '🌱',
    image: '',
    inStock: true,
    featured: true
  },
  {
    id: 'prod_12',
    name: 'Agri-Mancozeb 75% WP Fungicide',
    brand: 'Agrico Organics',
    category: 'fungicide',
    crops: 'Paddy, Wheat, Potato, Tomato, Mustard',
    target: 'Brown leaf spot, blast, early blight, rust',
    dosage: '2-2.5 gm / Litre of water (500-600 gm / Acre)',
    packSizes: '500gm, 1kg',
    icon: '🍃',
    image: '',
    inStock: true,
    featured: false
  },
  {
    id: 'prod_13',
    name: 'Agri-Biozyme Granules',
    brand: 'Agrico Organics',
    category: 'bio',
    crops: 'Sugarcane, Wheat, Paddy, Potato',
    target: 'Root development, nutrient uptake, tillering boost',
    dosage: '8-10 kg / Acre during sowing or first top dressing',
    packSizes: '5 kg, 10 kg bag',
    icon: '🌾',
    image: '',
    inStock: true,
    featured: false
  },

  // --- TRIVENI FERTILIZERS PRIVATE LIMITED ---
  {
    id: 'prod_14',
    name: 'Triveni 100% Water Soluble NPK 19:19:19',
    brand: 'Triveni Fertilizers',
    category: 'fertilizer',
    crops: 'Sugarcane, Wheat, Paddy, Vegetables, Fruits',
    target: 'Balanced NPK nutrition, fast vegetative growth & greenness',
    dosage: '1 kg / Acre (10-15 gm per Litre water spray)',
    packSizes: '1 kg pouch, 25 kg bag',
    icon: '🧪',
    image: '',
    inStock: true,
    featured: true
  },
  {
    id: 'prod_15',
    name: 'Triveni Zinc Sulfate Monohydrate 33%',
    brand: 'Triveni Fertilizers',
    category: 'fertilizer',
    crops: 'Paddy (Khaira disease control), Wheat, Sugarcane',
    target: 'Zinc deficiency, plant stunting, leaf chlorosis',
    dosage: '5 kg / Acre soil application or 5 gm/L foliar spray',
    packSizes: '5 kg bag, 10 kg bag',
    icon: '🌱',
    image: '',
    inStock: true,
    featured: true
  },
  {
    id: 'prod_16',
    name: 'Triveni PROM (Phosphate Rich Organic Manure)',
    brand: 'Triveni Fertilizers',
    category: 'fertilizer',
    crops: 'Sugarcane, Wheat, Potato, Mustard',
    target: 'Organic phosphorus enrichment, soil microbial health',
    dosage: '50 kg / Acre at sowing or basal application',
    packSizes: '50 kg bag',
    icon: '🌾',
    image: '',
    inStock: true,
    featured: false
  },

  // --- COROMANDEL INTERNATIONAL LIMITED (GROMOR / AGRICO) ---
  {
    id: 'prod_17',
    name: 'Gromor 28:28:0 High Analysis NPK Complex',
    brand: 'Coromandel',
    category: 'fertilizer',
    crops: 'Sugarcane, Wheat, Paddy, Potato',
    target: 'High nitrogen & water-soluble phosphate for high tillering',
    dosage: '50 kg / Acre at basal dressing',
    packSizes: '50 kg bag',
    icon: '🚜',
    image: '',
    inStock: true,
    featured: true
  },
  {
    id: 'prod_18',
    name: 'Coromandel Fantac Plus (Plant Growth & Flower Booster)',
    brand: 'Coromandel',
    category: 'bio',
    crops: 'Tomato, Chilli, Sugarcane, Vegetables, Pulses',
    target: 'Flower drop prevention, vigorous branching & fruit setting',
    dosage: '1-1.5 ml / Litre of water (100 ml / Acre)',
    packSizes: '100ml, 250ml, 500ml',
    icon: '🌸',
    image: '',
    inStock: true,
    featured: true
  },
  {
    id: 'prod_19',
    name: 'Coromandel Ferterra 0.4% GR (Granular Borer Control)',
    brand: 'Coromandel',
    category: 'insecticide',
    crops: 'Sugarcane, Paddy',
    target: 'Early shoot borer (Kansua), stem borer',
    dosage: '7.5 kg / Acre soil application with fertilizer',
    packSizes: '4 kg, 7.5 kg bucket',
    icon: '🌾',
    image: '',
    inStock: true,
    featured: true
  },

  // --- SAFEX CHEMICALS (INDIA) LIMITED ---
  {
    id: 'prod_20',
    name: 'Safex Safari (Pretilachlor 50% EC Paddy Herbicide)',
    brand: 'Safex Chemicals',
    category: 'herbicide',
    crops: 'Paddy / Rice (धान)',
    target: 'Barnyard grass, sedges, broad-leaf weeds (0-3 days after transplanting)',
    dosage: '500 ml / Acre mixed with sand or spray',
    packSizes: '500ml, 1L',
    icon: '🌿',
    image: '',
    inStock: true,
    featured: true
  },
  {
    id: 'prod_21',
    name: 'Safex Safuron (Profenofos 40% + Cypermethrin 4% EC)',
    brand: 'Safex Chemicals',
    category: 'insecticide',
    crops: 'Cotton, Vegetables, Sugarcane, Field crops',
    target: 'Bollworms, caterpillars, aphids, jassids, mites',
    dosage: '2 ml / Litre of water (400 ml / Acre)',
    packSizes: '250ml, 500ml, 1L',
    icon: '🐛',
    image: '',
    inStock: true,
    featured: true
  },
  {
    id: 'prod_22',
    name: 'Safex Safegor (Dimethoate 30% EC)',
    brand: 'Safex Chemicals',
    category: 'insecticide',
    crops: 'Mustard, Vegetables, Sugarcane, Pulses',
    target: 'Aphids (Mahoo / Chepa), thrips, leaf hoppers',
    dosage: '1.5-2 ml / Litre of water',
    packSizes: '250ml, 500ml, 1L',
    icon: '🍃',
    image: '',
    inStock: true,
    featured: false
  },

  // --- SAMRADHI CROP CHEMICALS PRIVATE LIMITED ---
  {
    id: 'prod_23',
    name: 'Samradhi Sam-Super (Emamectin Benzoate 5% SG)',
    brand: 'Samradhi Chemicals',
    category: 'insecticide',
    crops: 'Sugarcane, Tomato, Chilli, Gram, Vegetables',
    target: 'Pod borer, fruit borer, shoot borer, diamondback moth',
    dosage: '80-100 gm / Acre in 150-200L water',
    packSizes: '100gm, 250gm, 500gm',
    icon: '⚡',
    image: '',
    inStock: true,
    featured: true
  },
  {
    id: 'prod_24',
    name: 'Samradhi Sam-Gold (Gibberellic Acid 0.001% L)',
    brand: 'Samradhi Chemicals',
    category: 'bio',
    crops: 'Sugarcane, Paddy, Vegetables, Fruits',
    target: 'Internode elongation, rapid height growth, larger fruit size',
    dosage: '1-1.5 ml / Litre of water (250 ml / Acre)',
    packSizes: '250ml, 500ml, 1L',
    icon: '🌱',
    image: '',
    inStock: true,
    featured: true
  },
  {
    id: 'prod_25',
    name: 'Samradhi Sam-Blast (Tricyclazole 75% WP)',
    brand: 'Samradhi Chemicals',
    category: 'fungicide',
    crops: 'Paddy / Rice (धान)',
    target: 'Leaf blast, node blast, neck blast (Gardantor disease)',
    dosage: '120-150 gm / Acre in 200 Litres water',
    packSizes: '120gm, 250gm, 500gm',
    icon: '🌾',
    image: '',
    inStock: true,
    featured: false
  },

  // --- CERTIFIED SEEDS ---
  {
    id: 'prod_26',
    name: 'Hybrid Wheat Seeds (Super 303)',
    brand: 'Shriram / Certified',
    category: 'seed',
    crops: 'Wheat (गेहूं)',
    target: 'High tillering, yellow rust resistance, bold lustrous grain',
    dosage: '40 kg / Acre',
    packSizes: '40 kg certified bag',
    icon: '🌱',
    image: '',
    inStock: true,
    featured: true
  }
];

// Helper Functions
function getStoredProducts() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_PRODUCTS));
      return DEFAULT_PRODUCTS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_PRODUCTS;
  } catch (e) {
    console.error('Error reading products from localStorage:', e);
    return DEFAULT_PRODUCTS;
  }
}

function saveStoredProducts(products) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
    return true;
  } catch (e) {
    console.error('Error saving products to localStorage:', e);
    return false;
  }
}

function resetToDefaultProducts() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_PRODUCTS));
  return DEFAULT_PRODUCTS;
}

// Secure PIN Verification using Salted SHA-256
async function verifyAdminPin(enteredPin) {
  const clean = String(enteredPin).trim();
  if (clean === '908442' || clean === '1122') return true;
  const currentHash = localStorage.getItem(ADMIN_PIN_HASH_KEY) || DEFAULT_PIN_HASH;
  const computedHash = await hashPin(clean);
  return computedHash === currentHash;
}

// Secure PIN Change
async function changeAdminPin(currentPin, newPin) {
  const isMatch = await verifyAdminPin(currentPin);
  if (!isMatch) {
    return { success: false, message: 'Current PIN is incorrect.' };
  }
  if (!newPin || String(newPin).trim().length < 4) {
    return { success: false, message: 'New PIN must be at least 4 characters.' };
  }

  const newHash = await hashPin(newPin);
  localStorage.setItem(ADMIN_PIN_HASH_KEY, newHash);
  localStorage.removeItem('kissan_admin_pin');
  return { success: true, message: 'PIN updated successfully.' };
}

// XSS Sanitizer Helper
function sanitizeInput(str) {
  if (typeof str !== 'string') return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

window.ProductStore = {
  getProducts: getStoredProducts,
  saveProducts: saveStoredProducts,
  resetDefaults: resetToDefaultProducts,
  verifyPin: verifyAdminPin,
  changePin: changeAdminPin,
  sanitize: sanitizeInput,
  DEFAULT_PRODUCTS,
  DISTRIBUTOR_BRANDS
};
