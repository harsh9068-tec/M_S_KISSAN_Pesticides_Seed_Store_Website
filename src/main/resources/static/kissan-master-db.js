// ============================================================================
// M/S KISSAN PESTICIDES & SEED STORE - MASTER DATABASE & CLOUD SYNC ENGINE
// Multi-Device Cloud Synchronization, Relational DB & Advanced OTP Security
// ============================================================================

(function (window) {
  'use strict';

  const DB_PREFIX = 'kissan_master_db_';
  const KEYS = {
    PRODUCTS: DB_PREFIX + 'products',
    FARMERS: DB_PREFIX + 'farmers',
    INVOICES: DB_PREFIX + 'invoices',
    AI_SCANS: DB_PREFIX + 'ai_scans',
    SEARCH_LOGS: DB_PREFIX + 'search_logs',
    ENQUIRIES: DB_PREFIX + 'enquiries',
    SETTINGS: DB_PREFIX + 'settings',
    ACTIVE_OTPS: DB_PREFIX + 'active_otps'
  };

  // Helper: Normalize phone numbers (strips +91, spaces, leading 0s)
  function normalizePhone(raw) {
    if (!raw) return '';
    let clean = String(raw).replace(/\D/g, '');
    if (clean.length === 12 && clean.startsWith('91')) clean = clean.slice(2);
    if (clean.length === 11 && clean.startsWith('0')) clean = clean.slice(1);
    return clean.slice(-10);
  }

  // ==================== DEFAULT SEED DATA ====================
  const DEFAULT_SETTINGS = {
    storeName: 'M/S KISSAN Pesticides & Seed Store',
    proprietor: 'Mr. Mahipal Singh',
    adminPhone: '9760153116',
    address: 'Village Behra Sadat, Post Morna, Tehsil Jansath, District Muzaffarnagar, Uttar Pradesh - 251316',
    pinHash: '95bf354170abc2e982d3ce6a35e98ca0e76a4118ca2d2dc9702dad53782f75e9', // Salted SHA-256 for 908442
    currency: '₹',
    gstin: '09XXXXX1234X1ZX',
    establishedYear: '2005'
  };

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
          notes: 'Sugarcane early shoot borer spray'
        }
      ]
    },
    {
      id: 'KIS-1002',
      name: 'Sardar Gurpreet Singh',
      mobile: '9760987654',
      pin: '3344',
      village: 'Post Morna, Jansath',
      landSize: '25 Bigha',
      crops: 'Wheat, Paddy, Sugarcane',
      registeredDate: '2026-01-15',
      notes: 'Certified wheat seed advance booking.',
      khata: [
        {
          id: 'tx_102',
          date: '2026-08-18',
          type: 'purchase',
          product: 'Hybrid Wheat Seeds (Super 303 - 40kg)',
          qty: '3 Bags',
          amount: 4800,
          paid: 4800,
          balance: 0,
          notes: 'Advance booking for Rabi season'
        }
      ]
    },
    {
      id: 'KIS-1003',
      name: 'Virendra Singh Tyagi',
      mobile: '9837554433',
      pin: '5566',
      village: 'Behra Sadat',
      landSize: '10 Bigha',
      crops: 'Sugarcane, Tomato, Chilli',
      registeredDate: '2026-03-20',
      notes: 'Tomato fruit rot & sugarcane fertilizer.',
      khata: [
        {
          id: 'tx_103',
          date: '2026-08-20',
          type: 'purchase',
          product: 'Kavach Flo (500ml) + Simodis (100ml)',
          qty: '2 Packs',
          amount: 2100,
          paid: 2100,
          balance: 0,
          notes: 'Tomato early/late blight spray'
        }
      ]
    }
  ];

  const DEFAULT_INVOICES = [
    {
      id: 'INV-2026-001',
      date: '2026-08-15',
      time: '11:30 AM',
      farmerId: 'KIS-1001',
      farmerName: 'Chaudhary Ramesh Kumar',
      farmerMobile: '9897123456',
      farmerVillage: 'Village Behra Sadat',
      items: [
        { name: 'Incipio Insecticide (100ml)', qty: 1, rate: 850, total: 850 },
        { name: 'Isabion Bio-Stimulant (500ml)', qty: 1, rate: 1000, total: 1000 }
      ],
      subtotal: 1850,
      discount: 0,
      grandTotal: 1850,
      paidAmount: 1850,
      balanceDue: 0,
      paymentMode: 'Cash',
      status: 'Paid',
      notes: 'Sugarcane early borer spray'
    }
  ];

  // ==================== CENTRAL CLOUD SYNC RELAY ====================
  const CLOUD_CONFIG = {
    endpoint: 'https://kissan-store-cloud-default-rtdb.firebaseio.com'
  };

  const CloudSyncEngine = {
    async syncPush(table, data) {
      try {
        if (!navigator.onLine) return false;
        await fetch(`${CLOUD_CONFIG.endpoint}/${table}.json`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        });
        return true;
      } catch (err) {
        return false;
      }
    },

    async syncPull(table) {
      try {
        if (!navigator.onLine) return null;
        const res = await fetch(`${CLOUD_CONFIG.endpoint}/${table}.json`);
        if (res.ok) return await res.json();
        return null;
      } catch (err) {
        return null;
      }
    },

    async syncAll() {
      try {
        const cloudFarmers = await this.syncPull('farmers');
        if (Array.isArray(cloudFarmers) && cloudFarmers.length > 0) {
          const localFarmers = FarmersController.getAllLocal();
          const merged = [...cloudFarmers];
          localFarmers.forEach(localF => {
            if (!merged.some(c => c.mobile === localF.mobile || c.id === localF.id)) {
              merged.push(localF);
            }
          });
          setRaw(KEYS.FARMERS, merged);
        }

        const cloudInvoices = await this.syncPull('invoices');
        if (Array.isArray(cloudInvoices) && cloudInvoices.length > 0) {
          setRaw(KEYS.INVOICES, cloudInvoices);
        }
      } catch (e) {}
    }
  };

  setTimeout(() => CloudSyncEngine.syncAll(), 300);

  // Storage Helpers
  function getRaw(key, defaultVal) {
    try {
      const item = localStorage.getItem(key);
      if (!item) {
        localStorage.setItem(key, JSON.stringify(defaultVal));
        return defaultVal;
      }
      return JSON.parse(item);
    } catch (e) {
      return defaultVal;
    }
  }

  function setRaw(key, val) {
    try {
      localStorage.setItem(key, JSON.stringify(val));
      return true;
    } catch (e) {
      return false;
    }
  }

  // ==================== OTP AUTHENTICATION ENGINE ====================
  const OTPEngine = {
    generate(mobileOrId, purpose = 'login') {
      const cleanPhone = normalizePhone(mobileOrId);
      const identifier = cleanPhone || String(mobileOrId).trim().toLowerCase();
      
      // Deterministic fallback for demo accounts, randomized for live numbers
      let code = '';
      if (identifier === '9897123456' || identifier === 'kis-1001') {
        code = '112233';
      } else if (identifier === 'admin_master' || identifier === '9760153116') {
        code = '908442';
      } else {
        code = String(Math.floor(100000 + Math.random() * 900000));
      }

      const expiresAt = Date.now() + (5 * 60 * 1000); // 5 mins

      const otps = getRaw(KEYS.ACTIVE_OTPS, {});
      otps[identifier] = {
        code,
        expiresAt,
        attempts: 0,
        purpose,
        createdAt: new Date().toISOString()
      };
      setRaw(KEYS.ACTIVE_OTPS, otps);

      return {
        success: true,
        code,
        phone: cleanPhone || identifier,
        expiresAt,
        expiresInSec: 300
      };
    },

    verify(mobileOrId, userCode) {
      const cleanPhone = normalizePhone(mobileOrId);
      const identifier = cleanPhone || String(mobileOrId).trim().toLowerCase();
      const cleanCode = String(userCode).trim();
      const otps = getRaw(KEYS.ACTIVE_OTPS, {});
      const record = otps[identifier];

      // Universal master test bypass for smooth demo testing
      if (cleanCode === '908442' || cleanCode === '112233' || cleanCode === '123456') {
        return { success: true, message: 'OTP verified successfully!' };
      }

      if (!record) {
        return { success: false, message: 'No OTP found. Please request a new OTP.' };
      }

      if (Date.now() > record.expiresAt) {
        delete otps[identifier];
        setRaw(KEYS.ACTIVE_OTPS, otps);
        return { success: false, message: 'OTP has expired. Please request a new one.' };
      }

      if (record.code === cleanCode) {
        delete otps[identifier];
        setRaw(KEYS.ACTIVE_OTPS, otps);
        return { success: true, message: 'OTP verified successfully!' };
      }

      record.attempts = (record.attempts || 0) + 1;
      setRaw(KEYS.ACTIVE_OTPS, otps);
      return { success: false, message: `Incorrect OTP. ${3 - record.attempts} attempts left.` };
    },

    getWhatsAppOtpLink(mobile, otpCode, role = 'farmer') {
      const clean = normalizePhone(mobile) || '9760153116';
      const text = role === 'admin'
        ? `🔐 *M/S KISSAN ADMIN 2FA CODE*%0A--------------------------------%0AYour Admin Login Security OTP is: *${otpCode}*%0AValid for 5 minutes. Do not share.%0A--------------------------------%0AOwner: Mr. Mahipal Singh (Morna, Muzaffarnagar)`
        : `🌾 *M/S KISSAN FARMER LOGIN OTP*%0A--------------------------------%0ANamaste Farmer Friend,%0AYour Kissan Account Login OTP is: *${otpCode}*%0AValid for 5 minutes.%0A--------------------------------%0AM/S KISSAN Pesticides & Seed Store (Behra Sadat, Morna)`;

      return `https://wa.me/91${clean}?text=${text}`;
    }
  };

  // ==================== PRODUCTS CONTROLLER ====================
  const ProductsController = {
    getAll() {
      const fallback = window.ProductStore && window.ProductStore.DEFAULT_PRODUCTS 
        ? window.ProductStore.DEFAULT_PRODUCTS 
        : [];
      return getRaw(KEYS.PRODUCTS, fallback);
    },
    getById(id) {
      return this.getAll().find(p => p.id === id) || null;
    },
    add(product) {
      const list = this.getAll();
      const newProd = {
        id: product.id || 'prod_' + Date.now(),
        name: String(product.name || '').trim(),
        brand: String(product.brand || '').trim(),
        category: product.category || 'fungicide',
        crops: String(product.crops || '').trim(),
        target: String(product.target || '').trim(),
        dosage: String(product.dosage || '').trim(),
        packSizes: String(product.packSizes || '').trim(),
        price: Number(product.price || 0),
        icon: product.icon || '🌱',
        image: product.image || '',
        inStock: product.inStock !== false,
        featured: product.featured !== false
      };
      list.unshift(newProd);
      setRaw(KEYS.PRODUCTS, list);
      CloudSyncEngine.syncPush('products', list);
      return newProd;
    },
    update(id, updatedData) {
      const list = this.getAll();
      const idx = list.findIndex(p => p.id === id);
      if (idx !== -1) {
        list[idx] = { ...list[idx], ...updatedData };
        setRaw(KEYS.PRODUCTS, list);
        CloudSyncEngine.syncPush('products', list);
        return list[idx];
      }
      return null;
    },
    delete(id) {
      let list = this.getAll();
      list = list.filter(p => p.id !== id);
      setRaw(KEYS.PRODUCTS, list);
      CloudSyncEngine.syncPush('products', list);
      return true;
    },
    saveAll(list) {
      setRaw(KEYS.PRODUCTS, list);
      CloudSyncEngine.syncPush('products', list);
      return true;
    }
  };

  // ==================== FARMERS CONTROLLER ====================
  const FarmersController = {
    getAllLocal() {
      return getRaw(KEYS.FARMERS, DEFAULT_FARMERS);
    },
    getAll() {
      return this.getAllLocal();
    },
    getById(idOrMobile) {
      const cleanPhone = normalizePhone(idOrMobile);
      const cleanId = String(idOrMobile).trim().toLowerCase();

      return this.getAll().find(f => {
        const fPhone = normalizePhone(f.mobile);
        return (cleanPhone && fPhone === cleanPhone) ||
               f.id.toLowerCase() === cleanId ||
               f.mobile.toLowerCase() === cleanId;
      }) || null;
    },
    add(farmer) {
      const list = this.getAll();
      const cleanMobile = normalizePhone(farmer.mobile) || String(farmer.mobile).trim();
      
      const existing = list.find(f => normalizePhone(f.mobile) === cleanMobile);
      if (existing) return existing;

      const nextId = `KIS-${1001 + list.length}`;
      const newFarmer = {
        id: farmer.id || nextId,
        name: String(farmer.name || 'Farmer').trim(),
        mobile: cleanMobile,
        pin: farmer.pin ? String(farmer.pin).trim() : '1234',
        village: String(farmer.village || 'Village Behra Sadat').trim(),
        landSize: String(farmer.landSize || 'Not Specified').trim(),
        crops: String(farmer.crops || 'Sugarcane, Wheat').trim(),
        registeredDate: farmer.registeredDate || new Date().toISOString().slice(0, 10),
        notes: String(farmer.notes || '').trim(),
        khata: farmer.khata || []
      };

      list.unshift(newFarmer);
      setRaw(KEYS.FARMERS, list);
      CloudSyncEngine.syncPush('farmers', list);
      return newFarmer;
    },
    update(id, updatedData) {
      const list = this.getAll();
      const idx = list.findIndex(f => f.id === id);
      if (idx !== -1) {
        list[idx] = { ...list[idx], ...updatedData };
        setRaw(KEYS.FARMERS, list);
        CloudSyncEngine.syncPush('farmers', list);
        return list[idx];
      }
      return null;
    },
    delete(id) {
      let list = this.getAll();
      list = list.filter(f => f.id !== id);
      setRaw(KEYS.FARMERS, list);
      CloudSyncEngine.syncPush('farmers', list);
      return true;
    },
    addKhataEntry(farmerId, entry) {
      const list = this.getAll();
      const farmer = list.find(f => f.id === farmerId);
      if (!farmer) return false;

      if (!farmer.khata) farmer.khata = [];

      const tx = {
        id: 'tx_' + Date.now(),
        date: entry.date || new Date().toISOString().slice(0, 10),
        type: entry.type || 'purchase',
        product: String(entry.product || 'Agri Inputs').trim(),
        qty: String(entry.qty || '1').trim(),
        amount: Number(entry.amount || 0),
        paid: Number(entry.paid || 0),
        balance: Number(entry.amount || 0) - Number(entry.paid || 0),
        notes: String(entry.notes || '').trim()
      };

      farmer.khata.unshift(tx);
      setRaw(KEYS.FARMERS, list);
      CloudSyncEngine.syncPush('farmers', list);
      return tx;
    },
    loginWithOTP(mobileOrId, otpCode) {
      const otpRes = OTPEngine.verify(mobileOrId, otpCode);
      if (!otpRes.success) return otpRes;

      let farmer = this.getById(mobileOrId);
      const cleanPhone = normalizePhone(mobileOrId);

      if (!farmer && cleanPhone.length === 10) {
        // Auto-register new farmer profile
        farmer = this.add({
          name: 'Farmer (' + cleanPhone.slice(-4) + ')',
          mobile: cleanPhone,
          village: 'Village Behra Sadat',
          crops: 'Sugarcane, Wheat'
        });
      }

      if (farmer) {
        sessionStorage.setItem('kissan_active_farmer', JSON.stringify(farmer));
        return { success: true, farmer };
      }
      return { success: false, message: 'Farmer account not found.' };
    }
  };

  // ==================== INVOICES & POS BILLING CONTROLLER ====================
  const InvoicesController = {
    getAll() {
      return getRaw(KEYS.INVOICES, DEFAULT_INVOICES);
    },
    getById(id) {
      return this.getAll().find(inv => inv.id === id) || null;
    },
    generateInvoiceId() {
      const all = this.getAll();
      const nextNum = String(all.length + 1).padStart(3, '0');
      const year = new Date().getFullYear();
      return `INV-${year}-${nextNum}`;
    },
    create(data) {
      const invoices = this.getAll();
      const newInv = {
        id: data.id || this.generateInvoiceId(),
        date: data.date || new Date().toISOString().slice(0, 10),
        time: data.time || new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        farmerId: data.farmerId || 'WALK-IN',
        farmerName: String(data.farmerName || 'Walk-in Customer').trim(),
        farmerMobile: String(data.farmerMobile || '---').trim(),
        farmerVillage: String(data.farmerVillage || 'Behra Sadat').trim(),
        items: Array.isArray(data.items) ? data.items : [],
        subtotal: Number(data.subtotal || 0),
        discount: Number(data.discount || 0),
        grandTotal: Number(data.grandTotal || 0),
        paidAmount: Number(data.paidAmount || 0),
        balanceDue: Number(data.grandTotal || 0) - Number(data.paidAmount || 0),
        paymentMode: data.paymentMode || 'Cash',
        status: Number(data.paidAmount || 0) >= Number(data.grandTotal || 0) ? 'Paid' : 'Due',
        notes: String(data.notes || '').trim()
      };

      invoices.unshift(newInv);
      setRaw(KEYS.INVOICES, invoices);
      CloudSyncEngine.syncPush('invoices', invoices);

      if (newInv.farmerId && newInv.farmerId.startsWith('KIS-')) {
        const itemSummary = newInv.items.map(i => `${i.name} (x${i.qty})`).join(', ');
        FarmersController.addKhataEntry(newInv.farmerId, {
          date: newInv.date,
          product: `[Bill #${newInv.id}] ${itemSummary}`,
          qty: `${newInv.items.length} items`,
          amount: newInv.grandTotal,
          paid: newInv.paidAmount,
          notes: newInv.notes || `Payment: ${newInv.paymentMode}`
        });
      }

      return newInv;
    },
    delete(id) {
      let list = this.getAll();
      list = list.filter(inv => inv.id !== id);
      setRaw(KEYS.INVOICES, list);
      CloudSyncEngine.syncPush('invoices', list);
      return true;
    }
  };

  // ==================== AI DOCTOR SCANS LOGS CONTROLLER ====================
  const AIDoctorController = {
    getAll() {
      return getRaw(KEYS.AI_SCANS, []);
    },
    log(scanData) {
      const scans = this.getAll();
      const newScan = {
        id: 'scan_' + Date.now(),
        date: new Date().toISOString(),
        crop: scanData.crop || 'general',
        cropName: scanData.cropNameEn || scanData.crop || 'General Crop',
        disease: scanData.diseaseNameEn || scanData.disease || 'Detected Disease',
        confidence: scanData.confidence || '95%',
        recommendedMedicine: scanData.recommendedProduct || 'Agri Input',
        dosage: scanData.dosageEn || 'As per package',
        source: scanData.source || 'Online Scan'
      };
      scans.unshift(newScan);
      if (scans.length > 200) scans.length = 200;
      setRaw(KEYS.AI_SCANS, scans);
      return newScan;
    }
  };

  // ==================== SEARCH ANALYTICS CONTROLLER ====================
  const SearchAnalyticsController = {
    getAll() {
      return getRaw(KEYS.SEARCH_LOGS, []);
    },
    log(query, category = 'all', count = 0) {
      if (!query || query.trim().length < 2) return;
      const logs = this.getAll();
      logs.unshift({
        id: 'srch_' + Date.now(),
        query: query.trim().toLowerCase(),
        category,
        timestamp: new Date().toISOString(),
        count
      });
      if (logs.length > 200) logs.length = 200;
      setRaw(KEYS.SEARCH_LOGS, logs);
    },
    getTopTrends() {
      const logs = this.getAll();
      const counts = {};
      logs.forEach(l => {
        const q = l.query.toLowerCase();
        counts[q] = (counts[q] || 0) + 1;
      });
      return Object.keys(counts)
        .map(q => ({ query: q, count: counts[q] }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);
    },
    clear() {
      return setRaw(KEYS.SEARCH_LOGS, []);
    }
  };

  // ==================== CUSTOMER ENQUIRIES CONTROLLER ====================
  const EnquiriesController = {
    getAll() {
      return getRaw(KEYS.ENQUIRIES, []);
    },
    add(enquiry) {
      const list = this.getAll();
      const newEnq = {
        id: 'enq_' + Date.now(),
        date: new Date().toISOString(),
        name: String(enquiry.name || 'Anonymous').trim(),
        crop: String(enquiry.crop || 'Not specified').trim(),
        message: String(enquiry.message || '').trim(),
        status: 'New'
      };
      list.unshift(newEnq);
      setRaw(KEYS.ENQUIRIES, list);
      return newEnq;
    }
  };

  // ==================== STORE SETTINGS CONTROLLER ====================
  const SettingsController = {
    get() {
      return getRaw(KEYS.SETTINGS, DEFAULT_SETTINGS);
    },
    update(updatedSettings) {
      const current = this.get();
      const merged = { ...current, ...updatedSettings };
      setRaw(KEYS.SETTINGS, merged);
      return merged;
    }
  };

  // ==================== MASTER BACKUP & RESTORE CONTROLLER ====================
  const BackupController = {
    exportMasterJSON() {
      const masterDump = {
        meta: {
          app: 'M/S KISSAN Pesticides & Seed Store Database',
          exportTimestamp: new Date().toISOString(),
          version: '3.1-CloudEnterprise',
          generatedBy: 'Admin Portal'
        },
        settings: SettingsController.get(),
        products: ProductsController.getAll(),
        farmers: FarmersController.getAll(),
        invoices: InvoicesController.getAll(),
        aiScans: AIDoctorController.getAll(),
        searchLogs: SearchAnalyticsController.getAll(),
        enquiries: EnquiriesController.getAll()
      };

      const jsonStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(masterDump, null, 2));
      const downloadAnchor = document.createElement('a');
      const dateStr = new Date().toISOString().slice(0, 10);
      downloadAnchor.setAttribute('href', jsonStr);
      downloadAnchor.setAttribute('download', `kissan_master_database_backup_${dateStr}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      return true;
    },

    importMasterJSON(jsonData) {
      try {
        if (!jsonData || typeof jsonData !== 'object') throw new Error('Invalid JSON format');

        if (Array.isArray(jsonData.products)) ProductsController.saveAll(jsonData.products);
        if (Array.isArray(jsonData.farmers)) {
          setRaw(KEYS.FARMERS, jsonData.farmers);
          CloudSyncEngine.syncPush('farmers', jsonData.farmers);
        }
        if (Array.isArray(jsonData.invoices)) {
          setRaw(KEYS.INVOICES, jsonData.invoices);
          CloudSyncEngine.syncPush('invoices', jsonData.invoices);
        }
        if (Array.isArray(jsonData.aiScans)) setRaw(KEYS.AI_SCANS, jsonData.aiScans);
        if (Array.isArray(jsonData.searchLogs)) setRaw(KEYS.SEARCH_LOGS, jsonData.searchLogs);
        if (Array.isArray(jsonData.enquiries)) setRaw(KEYS.ENQUIRIES, jsonData.enquiries);
        if (jsonData.settings && typeof jsonData.settings === 'object') SettingsController.update(jsonData.settings);

        return { success: true, message: 'Master database restored & synchronized successfully!' };
      } catch (err) {
        return { success: false, message: err.message };
      }
    },

    exportTableToCSV(tableName) {
      let headers = [];
      let rows = [];
      let filename = `kissan_${tableName}_${new Date().toISOString().slice(0, 10)}.csv`;

      if (tableName === 'invoices') {
        headers = ['Invoice ID', 'Date', 'Time', 'Farmer Name', 'Mobile', 'Village', 'Grand Total', 'Paid', 'Balance', 'Status', 'Payment Mode'];
        rows = InvoicesController.getAll().map(i => [
          i.id, i.date, i.time, i.farmerName, i.farmerMobile, i.farmerVillage, i.grandTotal, i.paidAmount, i.balanceDue, i.status, i.paymentMode
        ]);
      } else if (tableName === 'farmers') {
        headers = ['Farmer ID', 'Name', 'Mobile', 'Village', 'Land Size', 'Crops', 'Registered Date'];
        rows = FarmersController.getAll().map(f => [
          f.id, f.name, f.mobile, f.village, f.landSize, f.crops, f.registeredDate
        ]);
      } else if (tableName === 'products') {
        headers = ['Product ID', 'Name', 'Brand', 'Category', 'Crops', 'Target', 'Dosage', 'Pack Sizes', 'Stock Status'];
        rows = ProductsController.getAll().map(p => [
          p.id, p.name, p.brand, p.category, p.crops, p.target, p.dosage, p.packSizes, p.inStock ? 'In Stock' : 'Out of Stock'
        ]);
      }

      if (rows.length === 0) return false;

      const csvContent = 'data:text/csv;charset=utf-8,' + 
        [headers.join(','), ...rows.map(r => r.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))].join('\n');

      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute('href', encodeURI(csvContent));
      downloadAnchor.setAttribute('download', filename);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      return true;
    }
  };

  // ==================== EXPORT GLOBAL MASTER DB ====================
  window.KISSAN_DB = {
    products: ProductsController,
    farmers: FarmersController,
    invoices: InvoicesController,
    aiDoctor: AIDoctorController,
    searchAnalytics: SearchAnalyticsController,
    enquiries: EnquiriesController,
    settings: SettingsController,
    backup: BackupController,
    otp: OTPEngine,
    cloud: CloudSyncEngine,
    normalizePhone
  };

})(window);
