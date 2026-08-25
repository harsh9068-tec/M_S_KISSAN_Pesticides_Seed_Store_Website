// Farmer Database, Khata CRM & Search Analytics Engine for M/S KISSAN

const FARMERS_STORAGE_KEY = 'kissan_farmers_db';
const SEARCH_LOGS_KEY = 'kissan_search_logs';
const CURRENT_FARMER_SESSION = 'kissan_active_farmer';

// Initial Demo Farmers (Local to Behra Sadat / Morna area)
const DEFAULT_FARMERS = [
  {
    id: 'KIS-1001',
    name: 'Chaudhary Ramesh Kumar',
    mobile: '9897123456',
    pin: '1122',
    village: 'Village Behra Sadat',
    landSize: '15 Bigha',
    crops: 'Sugarcane, Wheat, Mustard',
    registeredDate: '2025-11-10',
    notes: 'Regular customer for sugarcane borer spray & certified wheat seeds.',
    khata: [
      {
        id: 'tx_101',
        date: '2026-08-15',
        type: 'purchase',
        product: 'Incipio (100ml) + Isabion (500ml)',
        qty: '2 Packs',
        amount: 1850,
        paid: 1850,
        balance: 0,
        notes: 'Spray for early borer & growth boost'
      },
      {
        id: 'tx_102',
        date: '2026-08-02',
        type: 'purchase',
        product: 'Miravis Duo (250ml)',
        qty: '1 Bottle',
        amount: 1450,
        paid: 1000,
        balance: 450,
        notes: 'Fungicide spray for tomato & vegetables'
      }
    ]
  },
  {
    id: 'KIS-1002',
    name: 'Sardar Gurpreet Singh',
    mobile: '9760987654',
    pin: '2233',
    village: 'Post Morna, Jansath',
    landSize: '30 Bigha',
    crops: 'Paddy / Rice, Wheat, Sugarcane',
    registeredDate: '2025-12-05',
    notes: 'Requires large pack quantities for paddy stem borer.',
    khata: [
      {
        id: 'tx_201',
        date: '2026-08-18',
        type: 'purchase',
        product: 'Super 303 Wheat Seeds (40kg) Advance Booking',
        qty: '3 Bags',
        amount: 4800,
        paid: 4800,
        balance: 0,
        notes: 'Certified seed reservation'
      }
    ]
  },
  {
    id: 'KIS-1003',
    name: 'Virendra Singh Tyagi',
    mobile: '9837554433',
    pin: '3344',
    village: 'Behra Sadat',
    landSize: '10 Bigha',
    crops: 'Sugarcane, Tomato, Chilli',
    registeredDate: '2026-01-20',
    notes: 'Vegetable disease consultation & fungicide recommendations.',
    khata: [
      {
        id: 'tx_301',
        date: '2026-08-10',
        type: 'purchase',
        product: 'Kavach Flo (500ml) + Simodis (100ml)',
        qty: '2 Packs',
        amount: 2100,
        paid: 2100,
        balance: 0,
        notes: 'Tomato fruit rot & sucking pest spray'
      }
    ]
  }
];

// Initial Demo Search Logs
const DEFAULT_SEARCH_LOGS = [
  { id: 'srch_1', query: 'sugarcane borer', category: 'insecticide', timestamp: '2026-08-24T09:15:00Z', count: 2 },
  { id: 'srch_2', query: 'wheat seed 303', category: 'seed', timestamp: '2026-08-24T10:30:00Z', count: 1 },
  { id: 'srch_3', query: 'miravis duo', category: 'fungicide', timestamp: '2026-08-24T11:45:00Z', count: 1 },
  { id: 'srch_4', query: 'paddy stem borer', category: 'insecticide', timestamp: '2026-08-24T13:20:00Z', count: 1 },
  { id: 'srch_5', query: 'bio tonic', category: 'bio', timestamp: '2026-08-24T14:10:00Z', count: 2 }
];

// ==================== FARMER DB OPERATIONS ====================

function getStoredFarmers() {
  try {
    const raw = localStorage.getItem(FARMERS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(FARMERS_STORAGE_KEY, JSON.stringify(DEFAULT_FARMERS));
      return DEFAULT_FARMERS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_FARMERS;
  } catch (e) {
    console.error('Error loading farmers from storage:', e);
    return DEFAULT_FARMERS;
  }
}

function saveStoredFarmers(farmers) {
  try {
    localStorage.setItem(FARMERS_STORAGE_KEY, JSON.stringify(farmers));
    return true;
  } catch (e) {
    console.error('Error saving farmers to storage:', e);
    return false;
  }
}

function generateFarmerId() {
  const farmers = getStoredFarmers();
  const nextNum = 1001 + farmers.length;
  return `KIS-${nextNum}`;
}

function addFarmer(data) {
  const farmers = getStoredFarmers();
  const newFarmer = {
    id: data.id || generateFarmerId(),
    name: data.name.trim(),
    mobile: data.mobile.trim(),
    pin: data.pin ? String(data.pin).trim() : '1234',
    village: data.village.trim() || 'Village Behra Sadat',
    landSize: data.landSize ? data.landSize.trim() : 'Not Specified',
    crops: data.crops ? data.crops.trim() : 'General Crops',
    registeredDate: new Date().toISOString().slice(0, 10),
    notes: data.notes ? data.notes.trim() : '',
    khata: data.khata || []
  };

  farmers.unshift(newFarmer);
  saveStoredFarmers(farmers);
  return newFarmer;
}

function updateFarmer(id, updatedData) {
  const farmers = getStoredFarmers();
  const index = farmers.findIndex(f => f.id === id);
  if (index !== -1) {
    farmers[index] = { ...farmers[index], ...updatedData };
    saveStoredFarmers(farmers);
    return farmers[index];
  }
  return null;
}

function deleteFarmer(id) {
  let farmers = getStoredFarmers();
  farmers = farmers.filter(f => f.id !== id);
  saveStoredFarmers(farmers);
  return true;
}

function addKhataEntry(farmerId, entry) {
  const farmers = getStoredFarmers();
  const farmer = farmers.find(f => f.id === farmerId);
  if (!farmer) return false;

  if (!farmer.khata) {
    farmer.khata = [];
  }

  const tx = {
    id: 'tx_' + Date.now(),
    date: entry.date || new Date().toISOString().slice(0, 10),
    type: entry.type || 'purchase',
    product: entry.product || 'Agri Inputs',
    qty: entry.qty || '1',
    amount: Number(entry.amount || 0),
    paid: Number(entry.paid || 0),
    balance: Number(entry.amount || 0) - Number(entry.paid || 0),
    notes: entry.notes || ''
  };

  farmer.khata.unshift(tx);
  saveStoredFarmers(farmers);
  return tx;
}

// ==================== FARMER AUTHENTICATION ====================

function loginFarmer(mobileOrId, pin) {
  const farmers = getStoredFarmers();
  const cleanInput = String(mobileOrId).trim().toLowerCase();
  const cleanPin = String(pin).trim();

  const farmer = farmers.find(f => 
    (f.mobile === cleanInput || f.id.toLowerCase() === cleanInput) &&
    (f.pin === cleanPin || (!f.pin && cleanPin === '1234'))
  );

  if (farmer) {
    sessionStorage.setItem(CURRENT_FARMER_SESSION, JSON.stringify(farmer));
    return { success: true, farmer };
  }
  return { success: false, message: 'Invalid Farmer ID / Mobile or PIN.' };
}

function getActiveFarmer() {
  try {
    const raw = sessionStorage.getItem(CURRENT_FARMER_SESSION);
    if (!raw) return null;
    const sessionFarmer = JSON.parse(raw);
    // Refresh from DB
    const farmers = getStoredFarmers();
    return farmers.find(f => f.id === sessionFarmer.id) || sessionFarmer;
  } catch (e) {
    return null;
  }
}

function logoutFarmer() {
  sessionStorage.removeItem(CURRENT_FARMER_SESSION);
}

// ==================== SEARCH LOGS & DEMAND ANALYTICS ====================

function getSearchLogs() {
  try {
    const raw = localStorage.getItem(SEARCH_LOGS_KEY);
    if (!raw) {
      localStorage.setItem(SEARCH_LOGS_KEY, JSON.stringify(DEFAULT_SEARCH_LOGS));
      return DEFAULT_SEARCH_LOGS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : DEFAULT_SEARCH_LOGS;
  } catch (e) {
    return DEFAULT_SEARCH_LOGS;
  }
}

function logSearch(query, category = 'all', count = 0) {
  if (!query || query.trim().length < 2) return;
  const cleanQuery = query.trim().toLowerCase();

  const logs = getSearchLogs();
  const newLog = {
    id: 'srch_' + Date.now(),
    query: cleanQuery,
    category: category,
    timestamp: new Date().toISOString(),
    count: count
  };

  logs.unshift(newLog);
  // Keep last 150 search records
  if (logs.length > 150) {
    logs.length = 150;
  }

  try {
    localStorage.setItem(SEARCH_LOGS_KEY, JSON.stringify(logs));
  } catch (e) {}
}

function getTopSearches() {
  const logs = getSearchLogs();
  const counts = {};

  logs.forEach(log => {
    const q = log.query.toLowerCase();
    counts[q] = (counts[q] || 0) + 1;
  });

  const sorted = Object.keys(counts)
    .map(q => ({ query: q, count: counts[q] }))
    .sort((a, b) => b.count - a.count);

  return sorted.slice(0, 10);
}

function clearSearchLogs() {
  localStorage.setItem(SEARCH_LOGS_KEY, JSON.stringify([]));
  return true;
}

// Export Global FarmerDB
window.FarmerDB = {
  getFarmers: getStoredFarmers,
  saveFarmers: saveStoredFarmers,
  addFarmer,
  updateFarmer,
  deleteFarmer,
  addKhataEntry,
  loginFarmer,
  getActiveFarmer,
  logoutFarmer,
  getSearchLogs,
  logSearch,
  getTopSearches,
  clearSearchLogs,
  DEFAULT_FARMERS
};
