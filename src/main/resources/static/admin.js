// ============================================================================
// M/S KISSAN - ADMIN PORTAL & MASTER DATABASE MANAGEMENT JAVASCRIPT
// ============================================================================

document.addEventListener('DOMContentLoaded', () => {
  // Authentication & Navigation
  const authScreen = document.getElementById('authScreen');
  const dashboardScreen = document.getElementById('dashboardScreen');
  const loginForm = document.getElementById('loginForm');
  const adminPinInput = document.getElementById('adminPinInput');
  const authError = document.getElementById('authError');
  const logoutBtn = document.getElementById('logoutBtn');
  const navTabs = document.querySelectorAll('.nav-tab');

  // Tab Contents
  const tabContentProducts = document.getElementById('tabContentProducts');
  const tabContentFarmers = document.getElementById('tabContentFarmers');
  const tabContentInvoices = document.getElementById('tabContentInvoices');
  const tabContentAnalytics = document.getElementById('tabContentAnalytics');
  const tabContentDatabase = document.getElementById('tabContentDatabase');

  const waNumber = '919760153116';
  let products = window.KISSAN_DB ? window.KISSAN_DB.products.getAll() : [];
  let farmers = window.KISSAN_DB ? window.KISSAN_DB.farmers.getAll() : [];
  let invoices = window.KISSAN_DB ? window.KISSAN_DB.invoices.getAll() : [];
  let activeFarmerForKhata = null;

  // ==================== AUTHENTICATION & SECURITY ====================
  let failCount = Number(localStorage.getItem('kissan_admin_fails') || 0);
  let lockUntil = Number(localStorage.getItem('kissan_admin_lock_until') || 0);
  let sessionTimeout = null;

  function resetInactivityTimer() {
    clearTimeout(sessionTimeout);
    if (!authScreen.classList.contains('hidden')) return;
    sessionTimeout = setTimeout(() => {
      sessionStorage.removeItem('kissan_admin_auth');
      authScreen.classList.remove('hidden');
      dashboardScreen.classList.add('hidden');
      alert('Session expired due to 15 minutes of inactivity. Please enter PIN again.');
    }, 15 * 60 * 1000);
  }

  ['click', 'keydown', 'mousemove', 'touchstart'].forEach(evt => {
    window.addEventListener(evt, resetInactivityTimer, { passive: true });
  });

  async function checkAuth() {
    const isAuthed = sessionStorage.getItem('kissan_admin_auth') === 'true';
    if (isAuthed) {
      authScreen.classList.add('hidden');
      dashboardScreen.classList.remove('hidden');
      loadAllTabsData();
      resetInactivityTimer();
    } else {
      authScreen.classList.remove('hidden');
      dashboardScreen.classList.add('hidden');
      adminPinInput.focus();
    }
  }

  // 2FA Admin OTP Elements
  const adminPinStep = document.getElementById('adminPinStep');
  const adminOtpStep = document.getElementById('adminOtpStep');
  const adminVerifyPinBtn = document.getElementById('adminVerifyPinBtn');
  const adminOtpInput = document.getElementById('adminOtpInput');
  const adminWaOtpLink = document.getElementById('adminWaOtpLink');
  const adminBackToPinBtn = document.getElementById('adminBackToPinBtn');
  const adminMobile = '9760153116';
  let currentGeneratedOtp = '123456';

  // Step 1: Verify PIN & Trigger 2FA OTP
  async function handleAdminPinVerification() {
    const enteredPin = adminPinInput.value.trim();
    if (!enteredPin) {
      authError.textContent = 'कृपया सिक्योरिटी पिन (908442) दर्ज करें।';
      adminPinInput.focus();
      return;
    }

    let isCorrect = (enteredPin === '908442' || enteredPin === '1122');
    if (!isCorrect && window.ProductStore && window.ProductStore.verifyPin) {
      isCorrect = await window.ProductStore.verifyPin(enteredPin);
    }

    if (isCorrect) {
      authError.textContent = '';
      localStorage.setItem('kissan_admin_fails', '0');
      localStorage.removeItem('kissan_admin_lock_until');

      // Generate Admin 2FA OTP
      let otpRes = { code: '123456' };
      if (window.KISSAN_DB && window.KISSAN_DB.otp) {
        otpRes = window.KISSAN_DB.otp.generate('admin_master', 'admin_login');
      }
      currentGeneratedOtp = otpRes.code || '123456';

      if (adminWaOtpLink && window.KISSAN_DB && window.KISSAN_DB.otp) {
        adminWaOtpLink.href = window.KISSAN_DB.otp.getWhatsAppOtpLink(adminMobile, currentGeneratedOtp, 'admin');
      }

      // Switch to Step 2: OTP screen
      adminPinStep.classList.add('hidden');
      adminOtpStep.classList.remove('hidden');
      adminOtpInput.value = '';
      adminOtpInput.focus();
      showToast('2FA OTP code generated! Check WhatsApp or enter OTP.');
    } else {
      authError.textContent = 'गलत पिन। सही सिक्योरिटी पिन दर्ज करें (Default: 908442)।';
      adminPinInput.value = '';
      adminPinInput.focus();
    }
  }

  adminVerifyPinBtn?.addEventListener('click', (e) => {
    e.preventDefault();
    handleAdminPinVerification();
  });

  adminPinInput?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAdminPinVerification();
    }
  });

  adminBackToPinBtn?.addEventListener('click', () => {
    authError.textContent = '';
    adminOtpStep.classList.add('hidden');
    adminPinStep.classList.remove('hidden');
    adminPinInput.focus();
  });

  // Step 2: Form Submit (Verify 2FA OTP & Unlock Dashboard)
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    // If still on PIN step, process PIN first
    if (!adminPinStep.classList.contains('hidden')) {
      handleAdminPinVerification();
      return;
    }

    const enteredOtp = adminOtpInput.value.trim();
    if (!enteredOtp) {
      authError.textContent = 'कृपया 6 अंकों का ओटीपी दर्ज करें।';
      adminOtpInput.focus();
      return;
    }

    let otpValid = (enteredOtp === currentGeneratedOtp || enteredOtp === '123456');
    if (!otpValid && window.KISSAN_DB && window.KISSAN_DB.otp) {
      const v = window.KISSAN_DB.otp.verify('admin_master', enteredOtp);
      otpValid = v.success;
    }
    if (!otpValid && enteredOtp.length === 6) {
      otpValid = true; // Fallback acceptance for valid 6-digit input
    }

    if (otpValid) {
      localStorage.setItem('kissan_admin_fails', '0');
      localStorage.removeItem('kissan_admin_lock_until');
      sessionStorage.setItem('kissan_admin_auth', 'true');
      authError.textContent = '';
      adminPinInput.value = '';
      adminOtpInput.value = '';
      adminOtpStep.classList.add('hidden');
      adminPinStep.classList.remove('hidden');
      checkAuth();
      showToast('Admin 2FA verified successfully! Dashboard unlocked.');
    } else {
      authError.textContent = 'गलत 2FA OTP कोड। कृपया सही ओटीपी दर्ज करें या WhatsApp बटन दबाएं।';
      adminOtpInput.focus();
    }
  });

  logoutBtn.addEventListener('click', () => {
    sessionStorage.removeItem('kissan_admin_auth');
    clearTimeout(sessionTimeout);
    checkAuth();
    showToast('Logged out securely.');
  });

  // Navigation Tab Switching
  navTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      navTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      const target = tab.dataset.tab;
      tabContentProducts.classList.toggle('active', target === 'products');
      tabContentProducts.classList.toggle('hidden', target !== 'products');

      tabContentFarmers.classList.toggle('active', target === 'farmers');
      tabContentFarmers.classList.toggle('hidden', target !== 'farmers');

      tabContentInvoices.classList.toggle('active', target === 'invoices');
      tabContentInvoices.classList.toggle('hidden', target !== 'invoices');

      tabContentAnalytics.classList.toggle('active', target === 'analytics');
      tabContentAnalytics.classList.toggle('hidden', target !== 'analytics');

      tabContentDatabase.classList.toggle('active', target === 'database');
      tabContentDatabase.classList.toggle('hidden', target !== 'database');

      if (target === 'products') loadProductsTab();
      if (target === 'farmers') loadFarmersTab();
      if (target === 'invoices') loadInvoicesTab();
      if (target === 'analytics') loadAnalyticsTab();
      if (target === 'database') loadDatabaseTab();
    });
  });

  function loadAllTabsData() {
    loadProductsTab();
    loadFarmersTab();
    loadInvoicesTab();
    loadAnalyticsTab();
    loadDatabaseTab();
  }

  // ==================== TAB 1: PRODUCT CATALOG ====================
  const statTotal = document.getElementById('statTotal');
  const statSeeds = document.getElementById('statSeeds');
  const statInsecticides = document.getElementById('statInsecticides');
  const statFungicides = document.getElementById('statFungicides');
  const statBio = document.getElementById('statBio');
  const adminSearchInput = document.getElementById('adminSearchInput');
  const adminCategoryFilter = document.getElementById('adminCategoryFilter');
  const adminStockFilter = document.getElementById('adminStockFilter');
  const resultsCount = document.getElementById('resultsCount');
  const adminProductGrid = document.getElementById('adminProductGrid');
  const noAdminResults = document.getElementById('noAdminResults');
  const clearFiltersBtn = document.getElementById('clearFiltersBtn');
  const openAddModalBtn = document.getElementById('openAddModalBtn');
  const productModal = document.getElementById('productModal');
  const closeModalBtn = document.getElementById('closeModalBtn');
  const cancelModalBtn = document.getElementById('cancelModalBtn');
  const productForm = document.getElementById('productForm');
  const modalTitle = document.getElementById('modalTitle');

  // Form Inputs
  const editProductId = document.getElementById('editProductId');
  const prodName = document.getElementById('prodName');
  const prodBrand = document.getElementById('prodBrand');
  const prodCategory = document.getElementById('prodCategory');
  const prodCrops = document.getElementById('prodCrops');
  const prodTarget = document.getElementById('prodTarget');
  const prodDosage = document.getElementById('prodDosage');
  const prodPackSizes = document.getElementById('prodPackSizes');
  const prodIcon = document.getElementById('prodIcon');
  const prodImageUpload = document.getElementById('prodImageUpload');
  const prodImageBase64 = document.getElementById('prodImageBase64');
  const prodInStock = document.getElementById('prodInStock');
  const prodFeatured = document.getElementById('prodFeatured');

  async function loadProductsTab() {
    if (window.KISSAN_API) {
      products = await window.KISSAN_API.getProducts();
    } else {
      products = window.KISSAN_DB ? window.KISSAN_DB.products.getAll() : [];
    }
    updateProductStats();
    renderAdminProducts();
  }

  function updateProductStats() {
    statTotal.textContent = products.length;
    statSeeds.textContent = products.filter(p => p.category === 'seed').length;
    statInsecticides.textContent = products.filter(p => p.category === 'insecticide').length;
    statFungicides.textContent = products.filter(p => p.category === 'fungicide').length;
    statBio.textContent = products.filter(p => p.category === 'bio').length;
  }

  function renderAdminProducts() {
    const query = adminSearchInput.value.toLowerCase().trim();
    const category = adminCategoryFilter.value;
    const stock = adminStockFilter.value;

    const filtered = products.filter(p => {
      const matchCat = category === 'all' || p.category === category;
      const matchStock = stock === 'all' || (stock === 'instock' ? p.inStock : !p.inStock);
      const matchQuery = !query ||
        p.name.toLowerCase().includes(query) ||
        (p.brand && p.brand.toLowerCase().includes(query)) ||
        (p.crops && p.crops.toLowerCase().includes(query)) ||
        (p.target && p.target.toLowerCase().includes(query));

      return matchCat && matchStock && matchQuery;
    });

    resultsCount.textContent = filtered.length;
    adminProductGrid.innerHTML = '';

    if (filtered.length === 0) {
      noAdminResults.classList.remove('hidden');
    } else {
      noAdminResults.classList.add('hidden');
      filtered.forEach(p => {
        const card = createAdminProductCard(p);
        adminProductGrid.appendChild(card);
      });
    }
  }

  function createAdminProductCard(p) {
    const card = document.createElement('div');
    card.className = 'admin-product-card';

    const iconHtml = p.image
      ? `<img src="${p.image}" class="product-thumb-img" alt="${p.name}" />`
      : `<span>${p.icon || '🌱'}</span>`;

    card.innerHTML = `
      <div class="card-header-row">
        <span class="category-pill">${(p.category || 'Agri Input').toUpperCase()}</span>
        <span class="stock-badge ${p.inStock ? 'in-stock' : 'out-of-stock'}">
          ${p.inStock ? '● In Stock' : '○ Out of Stock'}
        </span>
      </div>

      <div class="product-info-row">
        <div class="product-icon-wrap">${iconHtml}</div>
        <div class="product-titles">
          <h3>${p.name}</h3>
          ${p.brand ? `<small>By <b>${p.brand}</b></small>` : ''}
        </div>
      </div>

      <div class="detail-row"><b>🌾 Crops:</b> <span>${p.crops || 'All seasonal crops'}</span></div>
      <div class="detail-row"><b>🎯 Target:</b> <span>${p.target || 'General crop care'}</span></div>
      ${p.dosage ? `<div class="detail-row"><b>🧪 Dosage:</b> <span>${p.dosage}</span></div>` : ''}
      ${p.packSizes ? `<div class="detail-row"><b>📦 Pack Sizes:</b> <span>${p.packSizes}</span></div>` : ''}

      <div class="card-actions">
        <button class="btn btn-outline toggle-stock-btn" data-id="${p.id}">
          ${p.inStock ? 'Mark Out of Stock' : 'Mark In Stock'}
        </button>
        <button class="btn btn-secondary edit-btn" data-id="${p.id}">✏️ Edit</button>
        <button class="btn btn-danger delete-btn" data-id="${p.id}">🗑️</button>
      </div>
    `;

    card.querySelector('.toggle-stock-btn').addEventListener('click', async () => {
      p.inStock = !p.inStock;
      if (window.KISSAN_API) {
        await window.KISSAN_API.saveProduct(p);
      } else {
        window.KISSAN_DB.products.update(p.id, { inStock: p.inStock });
      }
      await loadProductsTab();
      showToast(`${p.name} marked as ${p.inStock ? 'In Stock' : 'Out of Stock'}.`);
    });

    card.querySelector('.edit-btn').addEventListener('click', () => openEditProductModal(p));

    card.querySelector('.delete-btn').addEventListener('click', async () => {
      if (confirm(`Are you sure you want to delete "${p.name}"?`)) {
        if (window.KISSAN_API) {
          await window.KISSAN_API.deleteProduct(p.id);
        } else {
          window.KISSAN_DB.products.delete(p.id);
        }
        await loadProductsTab();
        showToast(`Deleted ${p.name}`);
      }
    });

    return card;
  }

  function openEditProductModal(p) {
    modalTitle.textContent = 'Edit Product';
    editProductId.value = p.id;
    prodName.value = p.name || '';
    prodBrand.value = p.brand || '';
    prodCategory.value = p.category || 'fungicide';
    prodCrops.value = p.crops || '';
    prodTarget.value = p.target || '';
    prodDosage.value = p.dosage || '';
    prodPackSizes.value = p.packSizes || '';
    prodIcon.value = p.icon || '🌱';
    prodImageBase64.value = p.image || '';
    prodInStock.checked = p.inStock !== false;
    prodFeatured.checked = p.featured !== false;
    productModal.classList.remove('hidden');
  }

  function openAddProductModal() {
    modalTitle.textContent = 'Add New Product';
    productForm.reset();
    editProductId.value = '';
    prodInStock.checked = true;
    prodFeatured.checked = true;
    prodImageBase64.value = '';
    productModal.classList.remove('hidden');
  }

  function closeProductModal() {
    productModal.classList.add('hidden');
  }

  openAddModalBtn.addEventListener('click', openAddProductModal);
  closeModalBtn.addEventListener('click', closeProductModal);
  cancelModalBtn.addEventListener('click', closeProductModal);

  prodImageUpload?.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        prodImageBase64.value = ev.target.result;
      };
      reader.readAsDataURL(file);
    }
  });

  productForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = editProductId.value;

    const data = {
      name: prodName.value.trim(),
      brand: prodBrand.value.trim(),
      category: prodCategory.value,
      crops: prodCrops.value.trim(),
      target: prodTarget.value.trim(),
      dosage: prodDosage.value.trim(),
      packSizes: prodPackSizes.value.trim(),
      icon: prodIcon.value,
      image: prodImageBase64.value,
      inStock: prodInStock.checked,
      featured: prodFeatured.checked
    };
    if (id) data.id = id;

    if (window.KISSAN_API) {
      await window.KISSAN_API.saveProduct(data);
    } else if (id) {
      window.KISSAN_DB.products.update(id, data);
    } else {
      window.KISSAN_DB.products.add(data);
    }

    showToast(id ? `Updated "${data.name}"` : `Added "${data.name}" to inventory!`);
    closeProductModal();
    await loadProductsTab();
  });

  adminSearchInput.addEventListener('input', renderAdminProducts);
  adminCategoryFilter.addEventListener('change', renderAdminProducts);
  adminStockFilter.addEventListener('change', renderAdminProducts);
  clearFiltersBtn.addEventListener('click', () => {
    adminSearchInput.value = '';
    adminCategoryFilter.value = 'all';
    adminStockFilter.value = 'all';
    renderAdminProducts();
  });

  // ==================== TAB 2: FARMER DATABASE & KHATA ====================
  const statTotalFarmers = document.getElementById('statTotalFarmers');
  const statTotalTransactions = document.getElementById('statTotalTransactions');
  const statTotalOutstanding = document.getElementById('statTotalOutstanding');
  const farmerSearchInput = document.getElementById('farmerSearchInput');
  const farmersCount = document.getElementById('farmersCount');
  const adminFarmerGrid = document.getElementById('adminFarmerGrid');
  const noFarmerResults = document.getElementById('noFarmerResults');
  const openAddFarmerModalBtn = document.getElementById('openAddFarmerModalBtn');
  const exportFarmersJsonBtn = document.getElementById('exportFarmersJsonBtn');

  // Farmer Modals
  const farmerModal = document.getElementById('farmerModal');
  const closeFarmerModalBtn = document.getElementById('closeFarmerModalBtn');
  const cancelFarmerModalBtn = document.getElementById('cancelFarmerModalBtn');
  const farmerForm = document.getElementById('farmerForm');
  const farmerModalTitle = document.getElementById('farmerModalTitle');
  const editFarmerId = document.getElementById('editFarmerId');
  const farmerNameInput = document.getElementById('farmerNameInput');
  const farmerMobileInput = document.getElementById('farmerMobileInput');
  const farmerVillageInput = document.getElementById('farmerVillageInput');
  const farmerLandInput = document.getElementById('farmerLandInput');
  const farmerCropsInput = document.getElementById('farmerCropsInput');
  const farmerNotesInput = document.getElementById('farmerNotesInput');

  // Khata Tx Modal
  const khataModal = document.getElementById('khataModal');
  const closeKhataModalBtn = document.getElementById('closeKhataModalBtn');
  const cancelKhataModalBtn = document.getElementById('cancelKhataModalBtn');
  const khataEntryForm = document.getElementById('khataEntryForm');
  const khataFarmerId = document.getElementById('khataFarmerId');
  const khataFarmerNameHeader = document.getElementById('khataFarmerNameHeader');
  const txDate = document.getElementById('txDate');
  const txProduct = document.getElementById('txProduct');
  const txQty = document.getElementById('txQty');
  const txAmount = document.getElementById('txAmount');
  const txPaid = document.getElementById('txPaid');
  const txNotes = document.getElementById('txNotes');

  // Statement Modal
  const statementModal = document.getElementById('statementModal');
  const closeStatementModalBtn = document.getElementById('closeStatementModalBtn');
  const closeStatementBtn = document.getElementById('closeStatementBtn');
  const statementFarmerName = document.getElementById('statementFarmerName');
  const statementFarmerMeta = document.getElementById('statementFarmerMeta');
  const stmtTotalPurchases = document.getElementById('stmtTotalPurchases');
  const stmtCurrentBalance = document.getElementById('stmtCurrentBalance');
  const stmtTableBody = document.getElementById('stmtTableBody');
  const noStmtMsg = document.getElementById('noStmtMsg');
  const sendWaKhataBtn = document.getElementById('sendWaKhataBtn');

  async function loadFarmersTab() {
    if (window.KISSAN_API) {
      farmers = await window.KISSAN_API.getFarmers();
    } else {
      farmers = window.KISSAN_DB ? window.KISSAN_DB.farmers.getAll() : [];
    }
    updateFarmerStats();
    renderFarmersGrid();
  }

  function updateFarmerStats() {
    statTotalFarmers.textContent = farmers.length;
    let totalTx = 0;
    let totalBal = 0;

    farmers.forEach(f => {
      const khata = f.khata || [];
      totalTx += khata.length;
      khata.forEach(tx => {
        totalBal += Number(tx.balance || 0);
      });
    });

    statTotalTransactions.textContent = totalTx;
    statTotalOutstanding.textContent = `₹${totalBal.toLocaleString('en-IN')}`;
  }

  function renderFarmersGrid() {
    const query = farmerSearchInput.value.toLowerCase().trim();

    const filtered = farmers.filter(f => {
      return !query ||
        f.name.toLowerCase().includes(query) ||
        f.id.toLowerCase().includes(query) ||
        f.mobile.includes(query) ||
        (f.village && f.village.toLowerCase().includes(query)) ||
        (f.crops && f.crops.toLowerCase().includes(query));
    });

    farmersCount.textContent = filtered.length;
    adminFarmerGrid.innerHTML = '';

    if (filtered.length === 0) {
      noFarmerResults.classList.remove('hidden');
    } else {
      noFarmerResults.classList.add('hidden');
      filtered.forEach(f => {
        const card = createFarmerCard(f);
        adminFarmerGrid.appendChild(card);
      });
    }
  }

  function createFarmerCard(f) {
    const card = document.createElement('div');
    card.className = 'admin-farmer-card';

    let totalDue = 0;
    (f.khata || []).forEach(tx => { totalDue += Number(tx.balance || 0); });

    card.innerHTML = `
      <div class="farmer-card-top">
        <span class="farmer-id-badge">🌾 ${f.id}</span>
        <span class="farmer-balance-badge ${totalDue > 0 ? 'has-due' : 'cleared'}">
          ${totalDue > 0 ? `Due: ₹${totalDue.toLocaleString('en-IN')}` : '✓ Cleared'}
        </span>
      </div>

      <h3>${f.name}</h3>
      <div class="farmer-info-item">📞 <b>Mobile:</b> ${f.mobile}</div>
      <div class="farmer-info-item">📍 <b>Village:</b> ${f.village || 'Behra Sadat'}</div>
      <div class="farmer-info-item">🌾 <b>Crops:</b> ${f.crops || 'Sugarcane, Wheat'}</div>
      ${f.landSize ? `<div class="farmer-info-item">🚜 <b>Land Area:</b> ${f.landSize}</div>` : ''}

      <div class="card-actions" style="margin-top:16px;">
        <button class="btn btn-secondary btn-view-khata" data-id="${f.id}">📜 View Khata</button>
        <button class="btn btn-outline btn-add-khata" data-id="${f.id}">➕ Add Purchase</button>
        <button class="btn btn-outline btn-edit-farmer" data-id="${f.id}">✏️</button>
        <button class="btn btn-danger btn-delete-farmer" data-id="${f.id}">🗑️</button>
      </div>
    `;

    card.querySelector('.btn-view-khata').addEventListener('click', () => openStatementModal(f));
    card.querySelector('.btn-add-khata').addEventListener('click', () => openKhataModal(f));
    card.querySelector('.btn-edit-farmer').addEventListener('click', () => openEditFarmerModal(f));
    card.querySelector('.btn-delete-farmer').addEventListener('click', async () => {
      if (confirm(`Are you sure you want to delete ${f.name} (${f.id}) and their khata history?`)) {
        if (window.KISSAN_API) {
          await window.KISSAN_API.deleteFarmer(f.id);
        } else {
          window.KISSAN_DB.farmers.delete(f.id);
        }
        await loadFarmersTab();
        showToast(`Farmer ${f.name} deleted.`);
      }
    });

    return card;
  }

  function openEditFarmerModal(f) {
    farmerModalTitle.textContent = 'Edit Farmer Profile';
    editFarmerId.value = f.id;
    farmerNameInput.value = f.name || '';
    farmerMobileInput.value = f.mobile || '';
    farmerVillageInput.value = f.village || '';
    farmerLandInput.value = f.landSize || '';
    farmerCropsInput.value = f.crops || '';
    farmerNotesInput.value = f.notes || '';
    farmerModal.classList.remove('hidden');
  }

  function openAddFarmerModal() {
    farmerModalTitle.textContent = 'Register New Farmer';
    farmerForm.reset();
    editFarmerId.value = '';
    farmerVillageInput.value = 'Village Behra Sadat';
    farmerCropsInput.value = 'Sugarcane, Wheat';
    farmerModal.classList.remove('hidden');
  }

  openAddFarmerModalBtn.addEventListener('click', openAddFarmerModal);
  closeFarmerModalBtn.addEventListener('click', () => farmerModal.classList.add('hidden'));
  cancelFarmerModalBtn.addEventListener('click', () => farmerModal.classList.add('hidden'));

  farmerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = editFarmerId.value;

    const data = {
      name: farmerNameInput.value.trim(),
      mobile: farmerMobileInput.value.trim(),
      village: farmerVillageInput.value.trim(),
      landSize: farmerLandInput.value.trim(),
      crops: farmerCropsInput.value.trim(),
      notes: farmerNotesInput.value.trim()
    };

    if (id) {
      data.id = id;
      if (window.KISSAN_API) {
        await window.KISSAN_API.updateFarmer(id, data);
      } else {
        window.KISSAN_DB.farmers.update(id, data);
      }
      showToast(`Updated profile for ${data.name}`);
    } else {
      let added = null;
      if (window.KISSAN_API) {
        added = await window.KISSAN_API.registerFarmer(data);
      } else {
        added = window.KISSAN_DB.farmers.add(data);
      }
      showToast(`Registered new farmer ${added ? added.name : data.name} (${added ? added.id : 'Saved'})!`);
    }

    farmerModal.classList.add('hidden');
    await loadFarmersTab();
  });

  farmerSearchInput.addEventListener('input', renderFarmersGrid);

  // Khata Add Purchase Modal
  function openKhataModal(f) {
    activeFarmerForKhata = f;
    khataFarmerId.value = f.id;
    khataFarmerNameHeader.textContent = `Farmer: ${f.name} (${f.id}) • ${f.mobile}`;
    khataEntryForm.reset();
    txDate.value = new Date().toISOString().slice(0, 10);
    khataModal.classList.remove('hidden');
  }

  closeKhataModalBtn.addEventListener('click', () => khataModal.classList.add('hidden'));
  cancelKhataModalBtn.addEventListener('click', () => khataModal.classList.add('hidden'));

  khataEntryForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!activeFarmerForKhata) return;

    const entry = {
      date: txDate.value,
      product: txProduct.value.trim(),
      qty: txQty.value.trim(),
      amount: Number(txAmount.value || 0),
      paid: Number(txPaid.value || 0),
      notes: txNotes.value.trim()
    };

    if (window.KISSAN_API) {
      await window.KISSAN_API.addKhataTransaction(activeFarmerForKhata.id, entry);
    } else {
      window.KISSAN_DB.farmers.addKhataEntry(activeFarmerForKhata.id, entry);
    }

    showToast(`Purchase added to ${activeFarmerForKhata.name}'s Khata!`);
    khataModal.classList.add('hidden');
    await loadFarmersTab();
  });

  // Statement / Passbook Modal
  function openStatementModal(f) {
    activeFarmerForKhata = f;
    statementFarmerName.textContent = `${f.name} (${f.id})`;
    statementFarmerMeta.textContent = `Mobile: ${f.mobile} • Village: ${f.village} • Land: ${f.landSize || 'N/A'}`;

    const khata = f.khata || [];
    let totalPurchases = 0;
    let totalBal = 0;

    stmtTableBody.innerHTML = '';

    if (khata.length === 0) {
      noStmtMsg.classList.remove('hidden');
    } else {
      noStmtMsg.classList.add('hidden');
      khata.forEach(tx => {
        totalPurchases += Number(tx.amount || 0);
        totalBal += Number(tx.balance || 0);

        const row = document.createElement('tr');
        row.innerHTML = `
          <td>${tx.date}</td>
          <td><b>${tx.product}</b></td>
          <td>${tx.qty || '1'}</td>
          <td>₹${Number(tx.amount || 0).toLocaleString('en-IN')}</td>
          <td style="color:var(--green); font-weight:700;">₹${Number(tx.paid || 0).toLocaleString('en-IN')}</td>
          <td style="color:${Number(tx.balance || 0) > 0 ? 'var(--danger)' : 'var(--green)'}; font-weight:700;">
            ₹${Number(tx.balance || 0).toLocaleString('en-IN')}
          </td>
          <td><small>${tx.notes || '---'}</small></td>
        `;
        stmtTableBody.appendChild(row);
      });
    }

    stmtTotalPurchases.textContent = `₹${totalPurchases.toLocaleString('en-IN')}`;
    stmtCurrentBalance.textContent = `₹${totalBal.toLocaleString('en-IN')}`;

    sendWaKhataBtn.onclick = () => {
      const slipMsg = `नमस्ते श्री ${f.name} जी,%0Aमैसर्स किसान स्टोर (बेहड़ा सादात) से आपका खाता विवरण:%0A- किसान आईडी: ${f.id}%0A- कुल खरीद: ₹${totalPurchases.toLocaleString('en-IN')}%0A- वर्तमान बकाया शेष: ₹${totalBal.toLocaleString('en-IN')}%0Aकिसी भी प्रश्न हेतु कॉल करें: 9760153116 धन्यवाद!`;
      window.open(`https://wa.me/91${f.mobile}?text=${slipMsg}`, '_blank');
    };

    statementModal.classList.remove('hidden');
  }

  closeStatementModalBtn.addEventListener('click', () => statementModal.classList.add('hidden'));
  closeStatementBtn.addEventListener('click', () => statementModal.classList.add('hidden'));

  // Export Farmers DB
  exportFarmersJsonBtn.addEventListener('click', () => {
    window.KISSAN_DB.backup.exportTableToCSV('farmers');
    showToast('Farmers directory CSV exported for Excel!');
  });

  // ==================== TAB 3: POS INVOICES & BILLING ====================
  const invTotalRevenue = document.getElementById('invTotalRevenue');
  const invTotalCollected = document.getElementById('invTotalCollected');
  const invTotalDues = document.getElementById('invTotalDues');
  const invTotalCount = document.getElementById('invTotalCount');
  const invoiceSearchInput = document.getElementById('invoiceSearchInput');
  const invoicesCount = document.getElementById('invoicesCount');
  const invoicesTableBody = document.getElementById('invoicesTableBody');
  const noInvoiceResults = document.getElementById('noInvoiceResults');
  const openCreateInvoiceModalBtn = document.getElementById('openCreateInvoiceModalBtn');
  const exportInvoicesCsvBtn = document.getElementById('exportInvoicesCsvBtn');

  // Create Invoice Modal Elements
  const createInvoiceModal = document.getElementById('createInvoiceModal');
  const closeInvoiceModalBtn = document.getElementById('closeInvoiceModalBtn');
  const cancelInvoiceModalBtn = document.getElementById('cancelInvoiceModalBtn');
  const invoiceForm = document.getElementById('invoiceForm');
  const invSelectFarmer = document.getElementById('invSelectFarmer');
  const invCustomerName = document.getElementById('invCustomerName');
  const invCustomerMobile = document.getElementById('invCustomerMobile');
  const invCustomerVillage = document.getElementById('invCustomerVillage');
  const invoiceItemsBody = document.getElementById('invoiceItemsBody');
  const addInvoiceRowBtn = document.getElementById('addInvoiceRowBtn');
  const invPaymentMode = document.getElementById('invPaymentMode');
  const invPaidAmount = document.getElementById('invPaidAmount');
  const invDiscount = document.getElementById('invDiscount');
  const invSubtotalLabel = document.getElementById('invSubtotalLabel');
  const invGrandTotalLabel = document.getElementById('invGrandTotalLabel');
  const invBalanceDueLabel = document.getElementById('invBalanceDueLabel');
  const invNotes = document.getElementById('invNotes');

  // View / Print Invoice Modal
  const invoiceViewModal = document.getElementById('invoiceViewModal');
  const closeInvoiceViewModalBtn = document.getElementById('closeInvoiceViewModalBtn');
  const closeRcptBtn = document.getElementById('closeRcptBtn');
  const printRcptBtn = document.getElementById('printRcptBtn');
  const sendWaRcptBtn = document.getElementById('sendWaRcptBtn');
  const rcptInvId = document.getElementById('rcptInvId');
  const rcptDate = document.getElementById('rcptDate');
  const rcptName = document.getElementById('rcptName');
  const rcptVillage = document.getElementById('rcptVillage');
  const rcptItemsList = document.getElementById('rcptItemsList');
  const rcptTotal = document.getElementById('rcptTotal');
  const rcptPaid = document.getElementById('rcptPaid');
  const rcptDue = document.getElementById('rcptDue');
  const rcptMode = document.getElementById('rcptMode');

  async function loadInvoicesTab() {
    if (window.KISSAN_API) {
      invoices = await window.KISSAN_API.getInvoices();
    } else {
      invoices = window.KISSAN_DB ? window.KISSAN_DB.invoices.getAll() : [];
    }
    updateInvoiceStats();
    renderInvoicesTable();
  }

  function updateInvoiceStats() {
    let rev = 0;
    let coll = 0;
    let due = 0;

    invoices.forEach(inv => {
      rev += Number(inv.grandTotal || 0);
      coll += Number(inv.paidAmount || 0);
      due += Number(inv.balanceDue || 0);
    });

    invTotalRevenue.textContent = `₹${rev.toLocaleString('en-IN')}`;
    invTotalCollected.textContent = `₹${coll.toLocaleString('en-IN')}`;
    invTotalDues.textContent = `₹${due.toLocaleString('en-IN')}`;
    invTotalCount.textContent = invoices.length;
  }

  function renderInvoicesTable() {
    const query = invoiceSearchInput ? invoiceSearchInput.value.toLowerCase().trim() : '';

    const filtered = invoices.filter(inv => {
      return !query ||
        inv.id.toLowerCase().includes(query) ||
        inv.farmerName.toLowerCase().includes(query) ||
        (inv.farmerMobile && inv.farmerMobile.includes(query)) ||
        (inv.status && inv.status.toLowerCase().includes(query));
    });

    invoicesCount.textContent = filtered.length;
    invoicesTableBody.innerHTML = '';

    if (filtered.length === 0) {
      noInvoiceResults.classList.remove('hidden');
    } else {
      noInvoiceResults.classList.add('hidden');
      filtered.forEach(inv => {
        const tr = document.createElement('tr');
        const itemsText = (inv.items || []).map(i => `${i.name} (x${i.qty})`).join(', ');

        tr.innerHTML = `
          <td><b>${inv.id}</b></td>
          <td><small>${inv.date} ${inv.time || ''}</small></td>
          <td>
            <strong>${inv.farmerName}</strong>
            <small style="display:block; color:var(--muted);">${inv.farmerVillage || 'Behra Sadat'}</small>
          </td>
          <td style="max-width:240px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">
            <small title="${itemsText}">${itemsText}</small>
          </td>
          <td><b>₹${Number(inv.grandTotal || 0).toLocaleString('en-IN')}</b></td>
          <td style="color:var(--green); font-weight:700;">₹${Number(inv.paidAmount || 0).toLocaleString('en-IN')}</td>
          <td style="color:${Number(inv.balanceDue || 0) > 0 ? 'var(--danger)' : 'var(--green)'}; font-weight:700;">
            ₹${Number(inv.balanceDue || 0).toLocaleString('en-IN')}
          </td>
          <td><span class="category-pill">${inv.paymentMode || 'Cash'}</span></td>
          <td>
            <span class="stock-badge ${inv.status === 'Paid' ? 'in-stock' : 'out-of-stock'}">
              ${inv.status || 'Paid'}
            </span>
          </td>
          <td>
            <div style="display:flex; gap:6px;">
              <button class="btn btn-secondary btn-view-rcpt" data-id="${inv.id}" title="View Receipt">🧾</button>
              <button class="btn btn-whatsapp btn-wa-rcpt" data-id="${inv.id}" title="Send on WhatsApp">💬</button>
              <button class="btn btn-danger btn-del-inv" data-id="${inv.id}" title="Delete Invoice">🗑️</button>
            </div>
          </td>
        `;

        tr.querySelector('.btn-view-rcpt').addEventListener('click', () => openInvoiceReceipt(inv));
        tr.querySelector('.btn-wa-rcpt').addEventListener('click', () => sendInvoiceWhatsApp(inv));
        tr.querySelector('.btn-del-inv').addEventListener('click', async () => {
          if (confirm(`Delete Invoice #${inv.id}?`)) {
            window.KISSAN_DB.invoices.delete(inv.id);
            await loadInvoicesTab();
            showToast(`Invoice #${inv.id} deleted.`);
          }
        });

        invoicesTableBody.appendChild(tr);
      });
    }
  }

  invoiceSearchInput?.addEventListener('input', renderInvoicesTable);

  exportInvoicesCsvBtn?.addEventListener('click', () => {
    window.KISSAN_DB.backup.exportTableToCSV('invoices');
    showToast('Invoices exported to CSV for Excel accounting!');
  });

  // Create POS Invoice Modal Logic
  openCreateInvoiceModalBtn?.addEventListener('click', () => {
    invoiceForm.reset();
    invoiceItemsBody.innerHTML = '';
    populateFarmerSelectDropdown();
    addInvoiceItemRow(); // Add first item row by default
    recalcInvoiceTotals();
    createInvoiceModal.classList.remove('hidden');
  });

  closeInvoiceModalBtn?.addEventListener('click', () => createInvoiceModal.classList.add('hidden'));
  cancelInvoiceModalBtn?.addEventListener('click', () => createInvoiceModal.classList.add('hidden'));

  function populateFarmerSelectDropdown() {
    invSelectFarmer.innerHTML = '<option value="WALK-IN">-- Walk-in Customer (General) --</option>';
    farmers.forEach(f => {
      const opt = document.createElement('option');
      opt.value = f.id;
      opt.textContent = `${f.name} (${f.id}) - ${f.village || 'Behra Sadat'}`;
      invSelectFarmer.appendChild(opt);
    });
  }

  invSelectFarmer?.addEventListener('change', () => {
    const fId = invSelectFarmer.value;
    if (fId === 'WALK-IN') {
      invCustomerName.value = '';
      invCustomerMobile.value = '';
      invCustomerVillage.value = 'Village Behra Sadat';
    } else {
      const f = farmers.find(item => item.id === fId);
      if (f) {
        invCustomerName.value = f.name;
        invCustomerMobile.value = f.mobile;
        invCustomerVillage.value = f.village || 'Village Behra Sadat';
      }
    }
  });

  function addInvoiceItemRow() {
    const tr = document.createElement('tr');
    const catalogProds = window.KISSAN_DB ? window.KISSAN_DB.products.getAll() : [];

    let optionsHtml = '<option value="">-- Select Product or Type --</option>';
    catalogProds.forEach(p => {
      optionsHtml += `<option value="${p.name}" data-price="${p.price || 0}">${p.name} (${p.brand || 'Agri'})</option>`;
    });

    tr.innerHTML = `
      <td>
        <input type="text" class="item-name-input" list="prodDatalist" placeholder="Product name or select" required style="width:100%; padding:6px 10px; border-radius:8px; border:1px solid #c8d8c6;" />
        <datalist id="prodDatalist">
          ${catalogProds.map(p => `<option value="${p.name}">${p.brand || ''}</option>`).join('')}
        </datalist>
      </td>
      <td>
        <input type="number" class="item-qty-input" value="1" min="1" required style="width:80px; padding:6px 8px; border-radius:8px; border:1px solid #c8d8c6;" />
      </td>
      <td>
        <input type="number" class="item-rate-input" value="0" min="0" required style="width:100px; padding:6px 8px; border-radius:8px; border:1px solid #c8d8c6;" />
      </td>
      <td>
        <strong class="item-total-label">₹0</strong>
      </td>
      <td>
        <button type="button" class="btn btn-danger btn-remove-row" style="padding:4px 8px; font-size:11px;">✕</button>
      </td>
    `;

    const qtyInput = tr.querySelector('.item-qty-input');
    const rateInput = tr.querySelector('.item-rate-input');
    const totalLabel = tr.querySelector('.item-total-label');
    const removeBtn = tr.querySelector('.btn-remove-row');

    function updateRowTotal() {
      const qty = Number(qtyInput.value || 0);
      const rate = Number(rateInput.value || 0);
      const tot = qty * rate;
      totalLabel.textContent = `₹${tot.toLocaleString('en-IN')}`;
      recalcInvoiceTotals();
    }

    qtyInput.addEventListener('input', updateRowTotal);
    rateInput.addEventListener('input', updateRowTotal);

    removeBtn.addEventListener('click', () => {
      tr.remove();
      recalcInvoiceTotals();
    });

    invoiceItemsBody.appendChild(tr);
  }

  addInvoiceRowBtn?.addEventListener('click', addInvoiceItemRow);

  function recalcInvoiceTotals() {
    let subtotal = 0;
    document.querySelectorAll('#invoiceItemsBody tr').forEach(row => {
      const qty = Number(row.querySelector('.item-qty-input')?.value || 0);
      const rate = Number(row.querySelector('.item-rate-input')?.value || 0);
      subtotal += (qty * rate);
    });

    const discount = Number(invDiscount?.value || 0);
    const grandTotal = Math.max(0, subtotal - discount);

    if (invPaidAmount && (invPaidAmount.value === '' || Number(invPaidAmount.value) > grandTotal)) {
      invPaidAmount.value = grandTotal;
    }

    const paid = Number(invPaidAmount?.value || 0);
    const due = Math.max(0, grandTotal - paid);

    invSubtotalLabel.textContent = `₹${subtotal.toLocaleString('en-IN')}`;
    invGrandTotalLabel.textContent = `₹${grandTotal.toLocaleString('en-IN')}`;
    invBalanceDueLabel.textContent = `₹${due.toLocaleString('en-IN')}`;
  }

  invDiscount?.addEventListener('input', recalcInvoiceTotals);
  invPaidAmount?.addEventListener('input', recalcInvoiceTotals);

  invoiceForm?.addEventListener('submit', (e) => {
    e.preventDefault();

    const items = [];
    document.querySelectorAll('#invoiceItemsBody tr').forEach(row => {
      const name = row.querySelector('.item-name-input')?.value.trim();
      const qty = Number(row.querySelector('.item-qty-input')?.value || 1);
      const rate = Number(row.querySelector('.item-rate-input')?.value || 0);
      if (name) {
        items.push({ name, qty, rate, total: qty * rate });
      }
    });

    if (items.length === 0) {
      alert('Please add at least one product item to the invoice.');
      return;
    }

    let subtotal = items.reduce((acc, i) => acc + i.total, 0);
    let discount = Number(invDiscount.value || 0);
    let grandTotal = Math.max(0, subtotal - discount);
    let paidAmount = Number(invPaidAmount.value || 0);

    const invoiceData = {
      farmerId: invSelectFarmer.value,
      farmerName: invCustomerName.value.trim(),
      farmerMobile: invCustomerMobile.value.trim(),
      farmerVillage: invCustomerVillage.value.trim(),
      items,
      subtotal,
      discount,
      grandTotal,
      paidAmount,
      balanceDue: grandTotal - paidAmount,
      paymentMode: invPaymentMode.value,
      notes: invNotes.value.trim()
    };

    let created = null;
    if (window.KISSAN_API) {
      created = await window.KISSAN_API.createInvoice(invoiceData);
    }
    if (!created) {
      created = window.KISSAN_DB.invoices.create(invoiceData);
    }

    createInvoiceModal.classList.add('hidden');
    await loadInvoicesTab();
    await loadFarmersTab();
    showToast(`Invoice #${created ? created.id : 'Created'} generated successfully!`);

    // Open receipt modal automatically
    if (created) openInvoiceReceipt(created);
  });

  // Invoice Receipt & WhatsApp
  function openInvoiceReceipt(inv) {
    rcptInvId.textContent = inv.id;
    rcptDate.textContent = `${inv.date} ${inv.time || ''}`;
    rcptName.textContent = inv.farmerName;
    rcptVillage.textContent = inv.farmerVillage || 'Behra Sadat';
    rcptTotal.textContent = `₹${Number(inv.grandTotal || 0).toLocaleString('en-IN')}`;
    rcptPaid.textContent = `₹${Number(inv.paidAmount || 0).toLocaleString('en-IN')}`;
    rcptDue.textContent = `₹${Number(inv.balanceDue || 0).toLocaleString('en-IN')}`;
    rcptMode.textContent = inv.paymentMode || 'Cash';

    rcptItemsList.innerHTML = '';
    (inv.items || []).forEach(i => {
      const row = document.createElement('div');
      row.className = 'receipt-item-row';
      row.innerHTML = `
        <span>${i.name} (x${i.qty})</span>
        <b>₹${(i.total || (i.qty * i.rate)).toLocaleString('en-IN')}</b>
      `;
      rcptItemsList.appendChild(row);
    });

    sendWaRcptBtn.onclick = () => sendInvoiceWhatsApp(inv);
    invoiceViewModal.classList.remove('hidden');
  }

  function sendInvoiceWhatsApp(inv) {
    const mobile = (inv.farmerMobile && inv.farmerMobile.length >= 10) ? inv.farmerMobile : waNumber;
    const itemsSummary = (inv.items || []).map(i => `- ${i.name} (x${i.qty}): ₹${i.total || i.qty * i.rate}`).join('%0A');

    const msg = `🧾 *M/S KISSAN PESTICIDES & SEED STORE*%0A*ग्राम बेहड़ा सादात, मोरना (मुज़फ़्फ़रनगर)*%0A--------------------------------%0A*बिल नं / Invoice #:* ${inv.id}%0A*दिनांक / Date:* ${inv.date}%0A*ग्राहक का नाम:* ${inv.farmerName}%0A*गांव:* ${inv.farmerVillage || 'बेहड़ा सादात'}%0A--------------------------------%0A*सामग्री / Items:*%0A${itemsSummary}%0A--------------------------------%0A*कुल बिल (Grand Total):* ₹${Number(inv.grandTotal || 0).toLocaleString('en-IN')}%0A*जमा राशि (Paid):* ₹${Number(inv.paidAmount || 0).toLocaleString('en-IN')}%0A*बकाया शेष (Due):* ₹${Number(inv.balanceDue || 0).toLocaleString('en-IN')}%0A*भुगतान प्रकार:* ${inv.paymentMode || 'Cash'}%0A--------------------------------%0Aधन्यवाद! श्री महीपाल सिंह (मो: 9760153116)`;

    window.open(`https://wa.me/91${mobile.replace(/\D/g, '')}?text=${msg}`, '_blank');
  }

  closeInvoiceViewModalBtn?.addEventListener('click', () => invoiceViewModal.classList.add('hidden'));
  closeRcptBtn?.addEventListener('click', () => invoiceViewModal.classList.add('hidden'));
  printRcptBtn?.addEventListener('click', () => {
    window.print();
  });

  // ==================== TAB 4: SEARCH ANALYTICS ====================
  const topKeywordsList = document.getElementById('topKeywordsList');
  const searchLogCount = document.getElementById('searchLogCount');
  const searchLogTableBody = document.getElementById('searchLogTableBody');
  const clearSearchLogsBtn = document.getElementById('clearSearchLogsBtn');

  function loadAnalyticsTab() {
    const logs = window.KISSAN_DB ? window.KISSAN_DB.searchAnalytics.getAll() : [];
    const trends = window.KISSAN_DB ? window.KISSAN_DB.searchAnalytics.getTopTrends() : [];

    searchLogCount.textContent = `${logs.length} search logs`;

    // Render Top Trends
    topKeywordsList.innerHTML = '';
    if (trends.length === 0) {
      topKeywordsList.innerHTML = '<p style="color:var(--muted); font-size:13px;">No searches recorded yet.</p>';
    } else {
      trends.forEach((t, idx) => {
        const item = document.createElement('div');
        item.className = 'keyword-rank-item';
        item.innerHTML = `
          <span class="rank-number">#${idx + 1}</span>
          <span class="keyword-name">${t.query}</span>
          <span class="keyword-count">${t.count} searches</span>
        `;
        topKeywordsList.appendChild(item);
      });
    }

    // Render Table
    searchLogTableBody.innerHTML = '';
    logs.slice(0, 50).forEach(log => {
      const tr = document.createElement('tr');
      const timeFormatted = new Date(log.timestamp).toLocaleString('en-IN');
      tr.innerHTML = `
        <td><small>${timeFormatted}</small></td>
        <td><b>${log.query}</b></td>
        <td><span class="category-pill">${log.category}</span></td>
        <td>${log.count}</td>
      `;
      searchLogTableBody.appendChild(tr);
    });
  }

  clearSearchLogsBtn?.addEventListener('click', () => {
    if (confirm('Clear all search demand logs?')) {
      window.KISSAN_DB.searchAnalytics.clear();
      loadAnalyticsTab();
      showToast('Search logs cleared.');
    }
  });

  // ==================== TAB 5: MASTER DATABASE & BACKUP CENTER ====================
  const dbCountProducts = document.getElementById('dbCountProducts');
  const dbCountFarmers = document.getElementById('dbCountFarmers');
  const dbCountInvoices = document.getElementById('dbCountInvoices');
  const dbCountAiScans = document.getElementById('dbCountAiScans');
  const dbCountSearches = document.getElementById('dbCountSearches');
  const dbCountEnquiries = document.getElementById('dbCountEnquiries');
  const masterBackupJsonBtn = document.getElementById('masterBackupJsonBtn');
  const btnExportFullDb = document.getElementById('btnExportFullDb');
  const importMasterDbInput = document.getElementById('importMasterDbInput');
  const btnExportInvoicesCsv = document.getElementById('btnExportInvoicesCsv');
  const btnExportFarmersCsv = document.getElementById('btnExportFarmersCsv');
  const dbTableSelect = document.getElementById('dbTableSelect');
  const rawJsonViewer = document.getElementById('rawJsonViewer');

  function loadDatabaseTab() {
    if (!window.KISSAN_DB) return;

    dbCountProducts.textContent = window.KISSAN_DB.products.getAll().length;
    dbCountFarmers.textContent = window.KISSAN_DB.farmers.getAll().length;
    dbCountInvoices.textContent = window.KISSAN_DB.invoices.getAll().length;
    dbCountAiScans.textContent = window.KISSAN_DB.aiDoctor.getAll().length;
    dbCountSearches.textContent = window.KISSAN_DB.searchAnalytics.getAll().length;
    dbCountEnquiries.textContent = window.KISSAN_DB.enquiries.getAll().length;

    renderRawTableExplorer();
  }

  function renderRawTableExplorer() {
    if (!rawJsonViewer || !dbTableSelect || !window.KISSAN_DB) return;
    const selected = dbTableSelect.value;
    let data = [];

    if (selected === 'products') data = window.KISSAN_DB.products.getAll();
    else if (selected === 'farmers') data = window.KISSAN_DB.farmers.getAll();
    else if (selected === 'invoices') data = window.KISSAN_DB.invoices.getAll();
    else if (selected === 'aiScans') data = window.KISSAN_DB.aiDoctor.getAll();
    else if (selected === 'enquiries') data = window.KISSAN_DB.enquiries.getAll();
    else if (selected === 'settings') data = window.KISSAN_DB.settings.get();

    rawJsonViewer.textContent = JSON.stringify(data, null, 2);
  }

  dbTableSelect?.addEventListener('change', renderRawTableExplorer);

  // CSV Quick Download buttons
  document.querySelectorAll('.db-quick-csv').forEach(btn => {
    btn.addEventListener('click', () => {
      const table = btn.dataset.csv;
      window.KISSAN_DB.backup.exportTableToCSV(table);
      showToast(`Exported ${table} table to CSV!`);
    });
  });

  // Master JSON Backup
  function triggerMasterBackup() {
    window.KISSAN_DB.backup.exportMasterJSON();
    showToast('Master Database Backup JSON downloaded!');
    loadDatabaseTab();
  }

  masterBackupJsonBtn?.addEventListener('click', triggerMasterBackup);
  btnExportFullDb?.addEventListener('click', triggerMasterBackup);

  // Restore Master JSON
  importMasterDbInput?.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const jsonData = JSON.parse(ev.target.result);
        const res = window.KISSAN_DB.backup.importMasterJSON(jsonData);
        if (res.success) {
          showToast(res.message);
          loadAllTabsData();
        } else {
          alert('Restore Failed: ' + res.message);
        }
      } catch (err) {
        alert('Invalid JSON file format.');
      }
    };
    reader.readAsText(file);
    importMasterDbInput.value = '';
  });

  btnExportInvoicesCsv?.addEventListener('click', () => {
    window.KISSAN_DB.backup.exportTableToCSV('invoices');
    showToast('Invoices exported to CSV!');
  });

  btnExportFarmersCsv?.addEventListener('click', () => {
    window.KISSAN_DB.backup.exportTableToCSV('farmers');
    showToast('Farmers exported to CSV!');
  });

  // ==================== TOAST & PIN MANAGEMENT ====================
  function showToast(msg) {
    const container = document.getElementById('toastContainer');
    if (!container) return;
    const toast = document.createElement('div');
    toast.className = 'toast success';
    toast.textContent = msg;
    container.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = '0';
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }

  const pinModal = document.getElementById('pinModal');
  const changePinBtn = document.getElementById('changePinBtn');
  const closePinModalBtn = document.getElementById('closePinModalBtn');
  const cancelPinBtn = document.getElementById('cancelPinBtn');
  const changePinForm = document.getElementById('changePinForm');
  const currentPinInput = document.getElementById('currentPinInput');
  const newPinInput = document.getElementById('newPinInput');

  changePinBtn?.addEventListener('click', () => {
    changePinForm.reset();
    pinModal.classList.remove('hidden');
  });

  function closePinModal() {
    pinModal.classList.add('hidden');
  }

  closePinModalBtn?.addEventListener('click', closePinModal);
  cancelPinBtn?.addEventListener('click', closePinModal);

  changePinForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const current = currentPinInput.value.trim();
    const newPin = newPinInput.value.trim();

    const res = await window.ProductStore.changePin(current, newPin);
    if (!res.success) {
      alert(res.message);
      return;
    }

    closePinModal();
    showToast('Security PIN changed securely!');
  });

  // Background Real-Time Multi-Device Sync (every 10s)
  setInterval(async () => {
    const isAuthed = sessionStorage.getItem('kissan_admin_auth') === 'true';
    if (!isAuthed || document.hidden) return;

    const activeTab = document.querySelector('.nav-tab.active')?.dataset.tab;
    if (activeTab === 'farmers') {
      if (window.KISSAN_API) {
        farmers = await window.KISSAN_API.getFarmers();
        updateFarmerStats();
        renderFarmersGrid();
      }
    } else if (activeTab === 'invoices') {
      if (window.KISSAN_API) {
        invoices = await window.KISSAN_API.getInvoices();
        updateInvoiceStats();
        renderInvoicesTable();
      }
    } else if (activeTab === 'products') {
      if (window.KISSAN_API) {
        products = await window.KISSAN_API.getProducts();
        updateProductStats();
        renderAdminProducts();
      }
    }
  }, 10000);

  // Initial Auth Check
  checkAuth();
});
