// Farmer Portal Logic & Interactive Passbook

document.addEventListener('DOMContentLoaded', () => {
  const authSection = document.getElementById('authSection');
  const dashboardSection = document.getElementById('dashboardSection');
  const farmerLogoutBtn = document.getElementById('farmerLogoutBtn');

  // Tabs
  const tabLoginBtn = document.getElementById('tabLoginBtn');
  const tabRegisterBtn = document.getElementById('tabRegisterBtn');
  const farmerLoginForm = document.getElementById('farmerLoginForm');
  const farmerRegisterForm = document.getElementById('farmerRegisterForm');
  const loginError = document.getElementById('loginError');
  const registerError = document.getElementById('registerError');

  // Dashboard Elements
  const farmerWelcomeName = document.getElementById('farmerWelcomeName');
  const cardFarmerId = document.getElementById('cardFarmerId');
  const cardFarmerName = document.getElementById('cardFarmerName');
  const cardFarmerMobile = document.getElementById('cardFarmerMobile');
  const cardFarmerVillage = document.getElementById('cardFarmerVillage');
  const cardFarmerCrops = document.getElementById('cardFarmerCrops');
  const statTotalPurchases = document.getElementById('statTotalPurchases');
  const statCurrentBalance = document.getElementById('statCurrentBalance');
  const khataTableBody = document.getElementById('khataTableBody');
  const noKhataMsg = document.getElementById('noKhataMsg');
  const recordCountLabel = document.getElementById('recordCountLabel');
  const recommendedProductsGrid = document.getElementById('recommendedProductsGrid');
  const directWaBtn = document.getElementById('directWaBtn');

  const waNumber = '919760153116';

  // Toggle Tab
  tabLoginBtn?.addEventListener('click', () => {
    tabLoginBtn.classList.add('active');
    tabRegisterBtn.classList.remove('active');
    farmerLoginForm.classList.remove('hidden');
    farmerRegisterForm.classList.add('hidden');
  });

  tabRegisterBtn?.addEventListener('click', () => {
    tabRegisterBtn.classList.add('active');
    tabLoginBtn.classList.remove('active');
    farmerRegisterForm.classList.remove('hidden');
    farmerLoginForm.classList.add('hidden');
  });

  // Login Form Submit
  farmerLoginForm?.addEventListener('submit', (e) => {
    e.preventDefault();
    const mobileOrId = document.getElementById('loginMobileOrId').value.trim();
    const pin = document.getElementById('loginPin').value.trim();

    const res = window.FarmerDB.loginFarmer(mobileOrId, pin);
    if (res.success) {
      loginError.textContent = '';
      checkFarmerAuth();
    } else {
      loginError.textContent = res.message || 'लॉगिन असफल। सही मोबाइल/ID और पिन दर्ज करें।';
    }
  });

  // Register Form Submit
  farmerRegisterForm?.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('regName').value.trim();
    const mobile = document.getElementById('regMobile').value.trim();
    const village = document.getElementById('regVillage').value.trim();
    const landSize = document.getElementById('regLand').value.trim();
    const crops = document.getElementById('regCrops').value.trim();
    const pin = document.getElementById('regPin').value.trim();

    if (mobile.length < 10) {
      registerError.textContent = 'कृपया 10 अंकों का वैध मोबाइल नंबर दर्ज करें।';
      return;
    }

    const newFarmer = window.FarmerDB.addFarmer({
      name,
      mobile,
      village,
      landSize,
      crops,
      pin
    });

    // Auto login
    window.FarmerDB.loginFarmer(newFarmer.mobile, newFarmer.pin);
    registerError.textContent = '';
    alert(`पंजीकरण सफल! आपकी किसान ID: ${newFarmer.id}`);
    checkFarmerAuth();
  });

  // Logout
  farmerLogoutBtn?.addEventListener('click', () => {
    window.FarmerDB.logoutFarmer();
    checkFarmerAuth();
  });

  // Check Active Farmer
  function checkFarmerAuth() {
    const farmer = window.FarmerDB.getActiveFarmer();
    if (farmer) {
      authSection.classList.add('hidden');
      dashboardSection.classList.remove('hidden');
      farmerLogoutBtn.classList.remove('hidden');
      loadFarmerDashboard(farmer);
    } else {
      authSection.classList.remove('hidden');
      dashboardSection.classList.add('hidden');
      farmerLogoutBtn.classList.add('hidden');
    }
  }

  // Load Farmer Dashboard
  function loadFarmerDashboard(farmer) {
    farmerWelcomeName.textContent = farmer.name;
    cardFarmerId.textContent = farmer.id;
    cardFarmerName.textContent = farmer.name;
    cardFarmerMobile.textContent = farmer.mobile;
    cardFarmerVillage.textContent = farmer.village || 'Behra Sadat';
    cardFarmerCrops.textContent = farmer.crops || 'मुख्य फसलें';

    // Calculate Khata totals
    const khata = farmer.khata || [];
    let totalPurchases = 0;
    let currentBalance = 0;

    khataTableBody.innerHTML = '';

    if (khata.length === 0) {
      noKhataMsg.classList.remove('hidden');
      recordCountLabel.textContent = '0 रिकॉर्ड';
    } else {
      noKhataMsg.classList.add('hidden');
      recordCountLabel.textContent = `${khata.length} रिकॉर्ड`;

      khata.forEach(tx => {
        totalPurchases += Number(tx.amount || 0);
        currentBalance += Number(tx.balance || 0);

        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td><b>${tx.date || '---'}</b></td>
          <td>${tx.product || 'Agri Item'}</td>
          <td>${tx.qty || '1'}</td>
          <td>₹${Number(tx.amount || 0).toLocaleString('en-IN')}</td>
          <td style="color:#0b5d32;">₹${Number(tx.paid || 0).toLocaleString('en-IN')}</td>
          <td style="color:${Number(tx.balance || 0) > 0 ? '#d9383a' : '#0b5d32'}; font-weight:700;">
            ₹${Number(tx.balance || 0).toLocaleString('en-IN')}
          </td>
          <td><small>${tx.notes || '---'}</small></td>
        `;
        khataTableBody.appendChild(tr);
      });
    }

    statTotalPurchases.textContent = `₹${totalPurchases.toLocaleString('en-IN')}`;
    statCurrentBalance.textContent = `₹${currentBalance.toLocaleString('en-IN')}`;

    // Direct WhatsApp enquiry button
    directWaBtn.onclick = () => {
      const msg = `नमस्ते मैसर्स किसान स्टोर, मैं किसान ${farmer.name} (ID: ${farmer.id}, गांव: ${farmer.village})। मेरी फसल (${farmer.crops}) के लिए दवा की जानकारी व सलाह चाहिए।`;
      window.open(`https://wa.me/${waNumber}?text=${encodeURIComponent(msg)}`, '_blank');
    };

    // Load Recommended Products based on Farmer Crops
    loadCropRecommendations(farmer.crops);
  }

  function loadCropRecommendations(farmerCrops) {
    if (!recommendedProductsGrid) return;
    const allProducts = window.ProductStore ? window.ProductStore.getProducts() : [];
    const cropsLower = (farmerCrops || '').toLowerCase();

    const matched = allProducts.filter(p => {
      if (!p.crops) return false;
      const pCropsLower = p.crops.toLowerCase();
      // Match keywords e.g. sugarcane, wheat, paddy, tomato
      return cropsLower.split(',').some(cropWord => {
        const word = cropWord.trim();
        return word.length > 2 && pCropsLower.includes(word);
      });
    });

    const displayList = matched.length > 0 ? matched.slice(0, 4) : allProducts.slice(0, 4);

    recommendedProductsGrid.innerHTML = '';
    displayList.forEach(p => {
      const div = document.createElement('div');
      div.className = 'rec-card';
      div.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <h4>${p.name}</h4>
          <span style="font-size:20px;">${p.icon || '🌱'}</span>
        </div>
        <p><b>🌾 उपयुक्त:</b> ${p.crops || 'सभी फसलें'}</p>
        <p><b>🎯 लाभ:</b> ${p.target || 'फसल सुरक्षा'}</p>
        <a href="https://wa.me/${waNumber}?text=${encodeURIComponent('नमस्ते मैसर्स किसान स्टोर, मुझे ' + p.name + ' के बारे में जानकारी चाहिए।')}" target="_blank" class="btn btn-primary" style="margin-top:auto; padding:7px 12px; font-size:12px;">
          व्हाट्सएप पर पूछें →
        </a>
      `;
      recommendedProductsGrid.appendChild(div);
    });
  }

  // Initial Auth Check
  checkFarmerAuth();
});
