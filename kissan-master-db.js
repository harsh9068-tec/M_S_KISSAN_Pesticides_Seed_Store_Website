// ============================================================================
// M/S KISSAN PESTICIDES & SEED STORE - MASTER DATABASE ENGINE (KISSAN_DB)
// Unified Relational Database for Products, Farmers, Invoices, Khata & Analytics
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
    SETTINGS: DB_PREFIX + 'settings'
  };

  // ==================== DEFAULT SEED DATA ====================
  const DEFAULT_SETTINGS = {
    storeName: 'M/S KISSAN Pesticides & Seed Store',
    proprietor: 'Mr. Mahipal Singh',
    phone: '9760153116',
    address: 'Village Behra Sadat, Post Morna, Tehsil Jansath, District Muzaffarnagar, Uttar Pradesh - 251316',
    pinHash: '95bf354170abc2e982d3ce6a35e98ca0e76a4118ca2d2dc9702dad53782f75e9', // Salted SHA-256 for 908442
    currency: '₹',
    gstin: '09XXXXX1234X1ZX',
    establishedYear: '2005',
    lastBackup: null
  };

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
    },
    {
      id: 'INV-2026-002',
      date: '2026-08-18',
      time: '04:15 PM',
      farmerId: 'KIS-1002',
      farmerName: 'Sardar Gurpreet Singh',
      farmerMobile: '9760987654',
      farmerVillage: 'Post Morna, Jansath',
      items: [
        { name: 'Hybrid Wheat Seeds (Super 303 - 40kg)', qty: 3, rate: 1600, total: 4800 }
      ],
      subtotal: 4800,
      discount: 0,
      grandTotal: 4800,
      paidAmount: 4800,
      balanceDue: 0,
      paymentMode: 'UPI',
      status: 'Paid',
      notes: 'Certified wheat seed advance'
    },
    {
      id: 'INV-2026-003',
      date: '2026-08-20',
      time: '02:40 PM',
      farmerId: 'KIS-1003',
      farmerName: 'Virendra Singh Tyagi',
      farmerMobile: '9837554433',
      farmerVillage: 'Behra Sadat',
      items: [
        { name: 'Kavach Flo Fungicide (500ml)', qty: 1, rate: 1200, total: 1200 },
        { name: 'Simodis Insecticide (100ml)', qty: 1, rate: 900, total: 900 }
      ],
      subtotal: 2100,
      discount: 0,
      grandTotal: 2100,
      paidAmount: 2100,
      balanceDue: 0,
      paymentMode: 'Cash',
      status: 'Paid',
      notes: 'Tomato fruit rot spray'
    }
  ];

  const DEFAULT_AI_SCANS = [
    {
      id: 'scan_101',
      date: '2026-08-24T10:15:00Z',
      crop: 'sugarcane',
      cropName: 'Sugarcane (गन्ना)',
      disease: 'Early Shoot Borer (कंसुआ)',
      confidence: '96%',
      recommendedMedicine: 'Incipio Insecticide (Syngenta)',
      dosage: '100 ml / Acre in 200L water',
      source: 'Storefront AI Doctor'
    },
    {
      id: 'scan_102',
      date: '2026-08-24T14:30:00Z',
      crop: 'wheat',
      cropName: 'Wheat (गेहूं)',
      disease: 'Yellow Rust (पीला रतुआ)',
      confidence: '97%',
      recommendedMedicine: 'Score Fungicide (Syngenta)',
      dosage: '1 ml / Litre of water',
      source: 'Farmer Portal AI Doctor'
    }
  ];

  const DEFAULT_ENQUIRIES = [
    {
      id: 'enq_101',
      date: '2026-08-24T12:00:00Z',
      name: 'Pawan Tyagi',
      crop: 'Sugarcane',
      message: 'Need 5 packs of Coragen and 2 bags of Gromor 28:28:0 for 10 bigha cane field.',
      status: 'Resolved'
    },
    {
      id: 'enq_102',
      date: '2026-08-25T16:20:00Z',
      name: 'Kuldeep Singh',
      crop: 'Paddy',
      message: 'Looking for Super 303 Wheat Seed booking and Pretilachlor weedicide rate.',
      status: 'New'
    }
  ];

  // ==================== STORAGE HELPERS ====================
  function getRaw(key, defaultVal) {
    try {
      const item = localStorage.getItem(key);
      if (!item) {
        localStorage.setItem(key, JSON.stringify(defaultVal));
        return defaultVal;
      }
      return JSON.parse(item);
    } catch (e) {
      console.error(`Error reading ${key}:`, e);
      return defaultVal;
    }
  }

  function setRaw(key, val) {
    try {
      localStorage.setItem(key, JSON.stringify(val));
      return true;
    } catch (e) {
      console.error(`Error writing ${key}:`, e);
      return false;
    }
  }

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
      return newProd;
    },
    update(id, updatedData) {
      const list = this.getAll();
      const idx = list.findIndex(p => p.id === id);
      if (idx !== -1) {
        list[idx] = { ...list[idx], ...updatedData };
        setRaw(KEYS.PRODUCTS, list);
        return list[idx];
      }
      return null;
    },
    delete(id) {
      let list = this.getAll();
      list = list.filter(p => p.id !== id);
      setRaw(KEYS.PRODUCTS, list);
      return true;
    },
    saveAll(list) {
      return setRaw(KEYS.PRODUCTS, list);
    }
  };

  // ==================== FARMERS CONTROLLER ====================
  const FarmersController = {
    getAll() {
      const fallback = window.FarmerDB && window.FarmerDB.DEFAULT_FARMERS
        ? window.FarmerDB.DEFAULT_FARMERS
        : [];
      return getRaw(KEYS.FARMERS, fallback);
    },
    getById(id) {
      const clean = String(id).trim().toLowerCase();
      return this.getAll().find(f => f.id.toLowerCase() === clean || f.mobile === clean) || null;
    },
    add(farmer) {
      const list = this.getAll();
      const nextId = `KIS-${1001 + list.length}`;
      const newFarmer = {
        id: farmer.id || nextId,
        name: String(farmer.name || '').trim(),
        mobile: String(farmer.mobile || '').trim(),
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
      return newFarmer;
    },
    update(id, updatedData) {
      const list = this.getAll();
      const idx = list.findIndex(f => f.id === id);
      if (idx !== -1) {
        list[idx] = { ...list[idx], ...updatedData };
        setRaw(KEYS.FARMERS, list);
        return list[idx];
      }
      return null;
    },
    delete(id) {
      let list = this.getAll();
      list = list.filter(f => f.id !== id);
      setRaw(KEYS.FARMERS, list);
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
      return tx;
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

      // If attached to a registered farmer, automatically update their Khata passbook
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
      return true;
    }
  };

  // ==================== AI DOCTOR SCANS LOGS CONTROLLER ====================
  const AIDoctorController = {
    getAll() {
      return getRaw(KEYS.AI_SCANS, DEFAULT_AI_SCANS);
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
      return getRaw(KEYS.ENQUIRIES, DEFAULT_ENQUIRIES);
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
    // 1-Click Complete Multi-Table Database Dump to JSON
    exportMasterJSON() {
      const masterDump = {
        meta: {
          app: 'M/S KISSAN Pesticides & Seed Store Database',
          exportTimestamp: new Date().toISOString(),
          version: '2.0-Enterprise',
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

      SettingsController.update({ lastBackup: new Date().toISOString() });
      return true;
    },

    // 1-Click Restore Full Database from JSON
    importMasterJSON(jsonData) {
      try {
        if (!jsonData || typeof jsonData !== 'object') throw new Error('Invalid JSON format');

        if (Array.isArray(jsonData.products)) ProductsController.saveAll(jsonData.products);
        if (Array.isArray(jsonData.farmers)) setRaw(KEYS.FARMERS, jsonData.farmers);
        if (Array.isArray(jsonData.invoices)) setRaw(KEYS.INVOICES, jsonData.invoices);
        if (Array.isArray(jsonData.aiScans)) setRaw(KEYS.AI_SCANS, jsonData.aiScans);
        if (Array.isArray(jsonData.searchLogs)) setRaw(KEYS.SEARCH_LOGS, jsonData.searchLogs);
        if (Array.isArray(jsonData.enquiries)) setRaw(KEYS.ENQUIRIES, jsonData.enquiries);
        if (jsonData.settings && typeof jsonData.settings === 'object') SettingsController.update(jsonData.settings);

        return { success: true, message: 'Master database restored successfully!' };
      } catch (err) {
        return { success: false, message: err.message };
      }
    },

    // CSV Exporter for Excel Accounting
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

  // ==================== FINANCIAL AGGREGATORS ====================
  function getFinancialSummary() {
    const invoices = InvoicesController.getAll();
    const farmers = FarmersController.getAll();

    let totalRevenue = 0;
    let totalCash = 0;
    let totalUPI = 0;
    let totalOutstanding = 0;

    invoices.forEach(inv => {
      totalRevenue += Number(inv.grandTotal || 0);
      if (inv.paymentMode === 'UPI') totalUPI += Number(inv.paidAmount || 0);
      else totalCash += Number(inv.paidAmount || 0);
    });

    farmers.forEach(f => {
      (f.khata || []).forEach(tx => {
        totalOutstanding += Number(tx.balance || 0);
      });
    });

    return {
      totalRevenue,
      totalCash,
      totalUPI,
      totalOutstanding,
      totalInvoices: invoices.length,
      totalFarmers: farmers.length,
      totalProducts: ProductsController.getAll().length
    };
  }

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
    getFinancialSummary
  };

  // Sync initial product catalog if empty
  if (ProductsController.getAll().length === 0 && window.ProductStore && window.ProductStore.DEFAULT_PRODUCTS) {
    ProductsController.saveAll(window.ProductStore.DEFAULT_PRODUCTS);
  }

})(window);
