// ============================================================================
// M/S KISSAN - FARMER PORTAL & OTP AUTHENTICATION JAVASCRIPT
// Multi-Device Cloud Sync & Digital Passbook
// ============================================================================

document.addEventListener('DOMContentLoaded', () => {
  const authSection = document.getElementById('authSection');
  const dashboardSection = document.getElementById('dashboardSection');
  const farmerLogoutBtn = document.getElementById('farmerLogoutBtn');

  // Tabs & Forms
  const tabLoginBtn = document.getElementById('tabLoginBtn');
  const tabRegisterBtn = document.getElementById('tabRegisterBtn');
  const farmerLoginForm = document.getElementById('farmerLoginForm');
  const farmerRegisterForm = document.getElementById('farmerRegisterForm');
  const loginError = document.getElementById('loginError');
  const registerError = document.getElementById('registerError');

  // OTP Elements
  const otpStep1 = document.getElementById('otpStep1');
  const otpStep2 = document.getElementById('otpStep2');
  const loginMobileOrId = document.getElementById('loginMobileOrId');
  const loginOtpInput = document.getElementById('loginOtpInput');
  const getOtpBtn = document.getElementById('getOtpBtn');
  const otpSentMobileLabel = document.getElementById('otpSentMobileLabel');
  const openWaOtpBtn = document.getElementById('openWaOtpBtn');
  const resendOtpBtn = document.getElementById('resendOtpBtn');
  const resendCountdown = document.getElementById('resendCountdown');
  const changeMobileBtn = document.getElementById('changeMobileBtn');

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
  let activeMobileForOtp = '';
  let countdownTimer = null;

  // Toggle Login / Register Tabs
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

  // ==================== OTP LOGIN STEP 1: REQUEST OTP ====================
  function startResendTimer() {
    let timeLeft = 30;
    if (resendOtpBtn) resendOtpBtn.disabled = true;
    if (resendCountdown) resendCountdown.textContent = timeLeft;

    clearInterval(countdownTimer);
    countdownTimer = setInterval(() => {
      timeLeft--;
      if (resendCountdown) resendCountdown.textContent = timeLeft;

      if (timeLeft <= 0) {
        clearInterval(countdownTimer);
        if (resendOtpBtn) {
          resendOtpBtn.disabled = false;
          resendOtpBtn.textContent = '🔄 पुनः ओटीपी भेजें (Resend OTP)';
        }
      }
    }, 1000);
  }

  function handleSendOtp() {
    const rawVal = loginMobileOrId.value.trim();
    if (!rawVal || rawVal.length < 4) {
      loginError.textContent = 'कृपया 10 अंकों का मोबाइल नंबर या किसान ID दर्ज करें।';
      return;
    }

    activeMobileForOtp = rawVal;
    loginError.textContent = '';

    // Generate 6-digit OTP via Master DB engine
    let otpRes = { code: '123456' };
    if (window.KISSAN_DB && window.KISSAN_DB.otp) {
      otpRes = window.KISSAN_DB.otp.generate(activeMobileForOtp, 'farmer_login');
    }

    // Update UI to Step 2
    otpSentMobileLabel.textContent = activeMobileForOtp;
    const popupOtpCode = document.getElementById('popupOtpCode');
    if (popupOtpCode) {
      popupOtpCode.textContent = otpRes.code;
    }

    otpStep1.classList.add('hidden');
    otpStep2.classList.remove('hidden');
    loginOtpInput.value = '';
    loginOtpInput.focus();

    // Set WhatsApp OTP delivery link
    if (openWaOtpBtn && window.KISSAN_DB && window.KISSAN_DB.otp) {
      openWaOtpBtn.href = window.KISSAN_DB.otp.getWhatsAppOtpLink(activeMobileForOtp, otpRes.code, 'farmer');
    }

    startResendTimer();
  }

  // 1-Click Auto-Fill OTP button
  const autoFillOtpBtn = document.getElementById('autoFillOtpBtn');
  autoFillOtpBtn?.addEventListener('click', () => {
    const popupOtpCode = document.getElementById('popupOtpCode');
    if (popupOtpCode && loginOtpInput) {
      loginOtpInput.value = popupOtpCode.textContent.trim();
      loginOtpInput.focus();
    }
  });

  getOtpBtn?.addEventListener('click', handleSendOtp);

  loginMobileOrId?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSendOtp();
    }
  });

  resendOtpBtn?.addEventListener('click', () => {
    handleSendOtp();
  });

  changeMobileBtn?.addEventListener('click', () => {
    clearInterval(countdownTimer);
    otpStep2.classList.add('hidden');
    otpStep1.classList.remove('hidden');
    loginMobileOrId.focus();
  });

  // ==================== OTP LOGIN STEP 2: VERIFY & AUTHENTICATE ====================
  farmerLoginForm?.addEventListener('submit', (e) => {
    e.preventDefault();
    const enteredOtp = loginOtpInput.value.trim();

    if (!enteredOtp || enteredOtp.length < 4) {
      loginError.textContent = 'कृपया 6 अंकों का ओटीपी दर्ज करें।';
      return;
    }

    let authResult = null;
    if (window.KISSAN_DB && window.KISSAN_DB.farmers) {
      authResult = window.KISSAN_DB.farmers.loginWithOTP(activeMobileForOtp, enteredOtp);
    }

    if (authResult && authResult.success) {
      loginError.textContent = '';
      clearInterval(countdownTimer);
      checkFarmerAuth();
    } else {
      loginError.textContent = authResult ? authResult.message : 'गलत ओटीपी। कृपया पुनः प्रयास करें।';
    }
  });

  // ==================== FARMER REGISTRATION (CLOUD SYNCED) ====================
  farmerRegisterForm?.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('regName').value.trim();
    const mobile = document.getElementById('regMobile').value.trim();
    const village = document.getElementById('regVillage').value.trim();
    const landSize = document.getElementById('regLand').value.trim();
    const crops = document.getElementById('regCrops').value.trim();

    if (mobile.length < 10) {
      registerError.textContent = 'कृपया 10 अंकों का वैध मोबाइल नंबर दर्ज करें।';
      return;
    }

    let newFarmer = null;
    if (window.KISSAN_DB && window.KISSAN_DB.farmers) {
      newFarmer = window.KISSAN_DB.farmers.add({
        name,
        mobile,
        village,
        landSize,
        crops
      });
    }

    if (newFarmer) {
      sessionStorage.setItem('kissan_active_farmer', JSON.stringify(newFarmer));
      registerError.textContent = '';
      alert(`पंजीकरण सफल! आपकी किसान ID: ${newFarmer.id}\nअब आप किसी भी फोन पर अपने मोबाइल से लॉगिन कर सकते हैं।`);
      checkFarmerAuth();
    }
  });

  // Logout
  farmerLogoutBtn?.addEventListener('click', () => {
    sessionStorage.removeItem('kissan_active_farmer');
    checkFarmerAuth();
  });

  // Check Active Farmer Authentication
  function checkFarmerAuth() {
    let activeFarmer = null;
    try {
      const raw = sessionStorage.getItem('kissan_active_farmer');
      if (raw) activeFarmer = JSON.parse(raw);
    } catch (e) {}

    // Cross-verify with current database
    if (activeFarmer && window.KISSAN_DB && window.KISSAN_DB.farmers) {
      const live = window.KISSAN_DB.farmers.getById(activeFarmer.id || activeFarmer.mobile);
      if (live) activeFarmer = live;
    }

    if (activeFarmer) {
      authSection.classList.add('hidden');
      dashboardSection.classList.remove('hidden');
      farmerLogoutBtn.classList.remove('hidden');
      loadFarmerDashboard(activeFarmer);
    } else {
      authSection.classList.remove('hidden');
      dashboardSection.classList.add('hidden');
      farmerLogoutBtn.classList.add('hidden');
    }
  }

  // Load Farmer Dashboard & Khata
  function loadFarmerDashboard(farmer) {
    farmerWelcomeName.textContent = farmer.name;
    cardFarmerId.textContent = farmer.id;
    cardFarmerName.textContent = farmer.name;
    cardFarmerMobile.textContent = farmer.mobile;
    cardFarmerVillage.textContent = farmer.village || 'Village Behra Sadat';
    cardFarmerCrops.textContent = farmer.crops || 'Sugarcane, Wheat';

    const khata = farmer.khata || [];
    let totalPurchases = 0;
    let totalBal = 0;

    khataTableBody.innerHTML = '';
    recordCountLabel.textContent = `${khata.length} प्रविष्टियां`;

    if (khata.length === 0) {
      noKhataMsg.classList.remove('hidden');
    } else {
      noKhataMsg.classList.add('hidden');
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
        khataTableBody.appendChild(row);
      });
    }

    statTotalPurchases.textContent = `₹${totalPurchases.toLocaleString('en-IN')}`;
    statCurrentBalance.textContent = `₹${totalBal.toLocaleString('en-IN')}`;

    // Direct WhatsApp consultation
    if (directWaBtn) {
      directWaBtn.onclick = () => {
        const text = `नमस्ते श्री महीपाल सिंह जी (मैसर्स किसान स्टोर),%0Aमैं किसान ${farmer.name} (किसान आईडी: ${farmer.id}, गांव: ${farmer.village || 'बेहड़ा सादात'}) बोल रहा हूँ। मेरी फसल (${farmer.crops}) के संबंध में मुझे परामर्श चाहिए।`;
        window.open(`https://wa.me/${waNumber}?text=${text}`, '_blank');
      };
    }

    // Load personalized recommendations
    renderTailoredRecommendations(farmer);
  }

  // Load Tailored Product Advice based on Farmer's Crops
  function renderTailoredRecommendations(farmer) {
    if (!recommendedProductsGrid) return;
    const allProducts = window.KISSAN_DB ? window.KISSAN_DB.products.getAll() : [];
    const farmerCropsStr = (farmer.crops || '').toLowerCase();

    const matched = allProducts.filter(p => {
      const prodCrops = (p.crops || '').toLowerCase();
      return farmerCropsStr.split(',').some(c => prodCrops.includes(c.trim().toLowerCase()));
    });

    const displayList = matched.length > 0 ? matched.slice(0, 4) : allProducts.slice(0, 4);

    recommendedProductsGrid.innerHTML = '';
    displayList.forEach(p => {
      const card = document.createElement('div');
      card.className = 'recommended-card';
      card.innerHTML = `
        <div style="font-size:24px; margin-bottom:6px;">${p.icon || '🌱'}</div>
        <h4 style="font-size:14px; font-family:Montserrat; margin-bottom:4px;">${p.name}</h4>
        <small style="display:block; color:var(--green); font-weight:700; margin-bottom:4px;">${p.brand || 'Agri Input'}</small>
        <p style="font-size:11.5px; color:var(--muted); margin-bottom:8px;">${p.target || 'फसल सुरक्षा एवं पैदावार'}</p>
        <button class="btn btn-secondary btn-full btn-enquire-rec" style="font-size:11px; padding:6px;">दुकान से पूछें (WhatsApp)</button>
      `;

      card.querySelector('.btn-enquire-rec').addEventListener('click', () => {
        const text = `नमस्ते मैसर्स किसान स्टोर, मुझे अपनी फसल (${farmer.crops}) के लिए "${p.name}" की उपलब्धता और रेट जानना है।`;
        window.open(`https://wa.me/${waNumber}?text=${encodeURIComponent(text)}`, '_blank');
      });

      recommendedProductsGrid.appendChild(card);
    });
  }

  // Check initial login state on page load
  checkFarmerAuth();
});
