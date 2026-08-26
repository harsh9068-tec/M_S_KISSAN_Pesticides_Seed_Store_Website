// ============================================================================
// M/S KISSAN - FARMER PORTAL & AUTHENTICATION JAVASCRIPT
// Real-Time Multi-Device Database Sync, Password Authentication & Digital Passbook
// ============================================================================

document.addEventListener('DOMContentLoaded', () => {
  const authSection = document.getElementById('authSection');
  const dashboardSection = document.getElementById('dashboardSection');
  const farmerLogoutBtn = document.getElementById('farmerLogoutBtn');
  const openChangePassModalBtn = document.getElementById('openChangePassModalBtn');
  const refreshFarmerDataBtn = document.getElementById('refreshFarmerDataBtn');

  // Tabs & Forms
  const tabLoginBtn = document.getElementById('tabLoginBtn');
  const tabRegisterBtn = document.getElementById('tabRegisterBtn');
  const farmerLoginForm = document.getElementById('farmerLoginForm');
  const farmerRegisterForm = document.getElementById('farmerRegisterForm');
  const loginError = document.getElementById('loginError');
  const registerError = document.getElementById('registerError');

  // Password Login Elements
  const passwordLoginBlock = document.getElementById('passwordLoginBlock');
  const loginMobileOrId = document.getElementById('loginMobileOrId');
  const loginPassword = document.getElementById('loginPassword');
  const toggleLoginPassVisibility = document.getElementById('toggleLoginPassVisibility');
  const toggleOtpModeBtn = document.getElementById('toggleOtpModeBtn');
  const backToPasswordLoginBtn = document.getElementById('backToPasswordLoginBtn');

  // OTP Login Elements
  const otpLoginBlock = document.getElementById('otpLoginBlock');
  const otpStep1 = document.getElementById('otpStep1');
  const otpStep2 = document.getElementById('otpStep2');
  const otpMobileInput = document.getElementById('otpMobileInput');
  const loginOtpInput = document.getElementById('loginOtpInput');
  const getOtpBtn = document.getElementById('getOtpBtn');
  const verifyOtpBtn = document.getElementById('verifyOtpBtn');
  const otpSentMobileLabel = document.getElementById('otpSentMobileLabel');
  const resendOtpBtn = document.getElementById('resendOtpBtn');
  const resendCountdown = document.getElementById('resendCountdown');

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

  // Change Password Elements
  const changePassModal = document.getElementById('changePassModal');
  const closeChangePassBtn = document.getElementById('closeChangePassBtn');
  const closeChangePassBackdrop = document.getElementById('closeChangePassBackdrop');
  const changePasswordForm = document.getElementById('changePasswordForm');
  const oldPasswordInput = document.getElementById('oldPasswordInput');
  const newPasswordInput = document.getElementById('newPasswordInput');
  const confirmNewPassInput = document.getElementById('confirmNewPassInput');
  const changePassMsg = document.getElementById('changePassMsg');
  const changePassFarmerMeta = document.getElementById('changePassFarmerMeta');

  const waNumber = '919760153116';
  let activeMobileForOtp = '';
  let countdownTimer = null;

  // Toggle Login / Register Tabs
  tabLoginBtn?.addEventListener('click', () => {
    tabLoginBtn.classList.add('active');
    tabRegisterBtn.classList.remove('active');
    farmerLoginForm.classList.remove('hidden');
    farmerRegisterForm.classList.add('hidden');
    loginError.textContent = '';
    registerError.textContent = '';
  });

  tabRegisterBtn?.addEventListener('click', () => {
    tabRegisterBtn.classList.add('active');
    tabLoginBtn.classList.remove('active');
    farmerRegisterForm.classList.remove('hidden');
    farmerLoginForm.classList.add('hidden');
    loginError.textContent = '';
    registerError.textContent = '';
  });

  // Password Visibility Toggle
  toggleLoginPassVisibility?.addEventListener('click', () => {
    if (!loginPassword) return;
    if (loginPassword.type === 'password') {
      loginPassword.type = 'text';
      toggleLoginPassVisibility.textContent = '🙈 छुपाएं (Hide)';
    } else {
      loginPassword.type = 'password';
      toggleLoginPassVisibility.textContent = '👁️ पासवर्ड देखें (Show)';
    }
  });

  // Toggle OTP / Password Login Mode
  toggleOtpModeBtn?.addEventListener('click', () => {
    passwordLoginBlock.classList.add('hidden');
    otpLoginBlock.classList.remove('hidden');
    otpStep1.classList.remove('hidden');
    otpStep2.classList.add('hidden');
    loginError.textContent = '';
    if (otpMobileInput) {
      otpMobileInput.value = loginMobileOrId.value.trim();
      otpMobileInput.focus();
    }
  });

  backToPasswordLoginBtn?.addEventListener('click', () => {
    otpLoginBlock.classList.add('hidden');
    passwordLoginBlock.classList.remove('hidden');
    loginError.textContent = '';
    loginMobileOrId.focus();
  });

  // ==================== 1. PASSWORD-BASED LOGIN ====================
  farmerLoginForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!otpLoginBlock.classList.contains('hidden')) {
      // In OTP mode, do not submit as password
      return;
    }

    const mobileOrId = loginMobileOrId.value.trim();
    const password = loginPassword.value.trim();

    if (!mobileOrId) {
      loginError.textContent = 'कृपया मोबाइल नंबर या किसान ID दर्ज करें।';
      return;
    }
    if (!password) {
      loginError.textContent = 'कृपया अपना पासवर्ड दर्ज करें।';
      return;
    }

    loginError.textContent = 'सत्यापित किया जा रहा है...';

    // Call Central Spring Boot REST API
    let authRes = null;
    if (window.KISSAN_API && typeof window.KISSAN_API.loginFarmer === 'function') {
      authRes = await window.KISSAN_API.loginFarmer(mobileOrId, password);
    } else if (window.KISSAN_DB && window.KISSAN_DB.farmers) {
      authRes = window.KISSAN_DB.farmers.loginWithPassword(mobileOrId, password);
    }

    if (authRes && authRes.success && authRes.farmer) {
      sessionStorage.setItem('kissan_active_farmer', JSON.stringify(authRes.farmer));
      loginError.textContent = '';
      loginPassword.value = '';
      checkFarmerAuth();
    } else {
      loginError.textContent = authRes && authRes.message
        ? authRes.message
        : 'गलत मोबाइल नंबर या पासवर्ड। कृपया पुनः प्रयास करें।';
    }
  });

  // ==================== 2. OTP-BASED LOGIN (BACKUP) ====================
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

  getOtpBtn?.addEventListener('click', () => {
    const rawVal = otpMobileInput.value.trim();
    if (!rawVal || rawVal.length < 4) {
      loginError.textContent = 'कृपया 10 अंकों का वैध मोबाइल नंबर दर्ज करें।';
      return;
    }

    activeMobileForOtp = rawVal;
    loginError.textContent = '';

    let otpRes = { code: '123456' };
    if (window.KISSAN_DB && window.KISSAN_DB.otp) {
      otpRes = window.KISSAN_DB.otp.generate(activeMobileForOtp, 'farmer_login');
    }

    const cleanDigits = activeMobileForOtp.replace(/\D/g, '');
    const masked = cleanDigits.length >= 10
      ? `+91 ${cleanDigits.slice(0, 5)} •••••`
      : activeMobileForOtp;

    if (otpSentMobileLabel) otpSentMobileLabel.textContent = masked;

    otpStep1.classList.add('hidden');
    otpStep2.classList.remove('hidden');
    if (loginOtpInput) {
      loginOtpInput.value = '';
      loginOtpInput.focus();
    }

    startResendTimer();
  });

  verifyOtpBtn?.addEventListener('click', () => {
    const enteredOtp = loginOtpInput.value.trim();
    if (!enteredOtp || enteredOtp.length < 4) {
      loginError.textContent = 'कृपया 6 अंकों का ओटीपी कोड दर्ज करें।';
      return;
    }

    let authResult = null;
    if (window.KISSAN_DB && window.KISSAN_DB.farmers) {
      authResult = window.KISSAN_DB.farmers.loginWithOTP(activeMobileForOtp, enteredOtp);
    }

    if (authResult && authResult.success && authResult.farmer) {
      sessionStorage.setItem('kissan_active_farmer', JSON.stringify(authResult.farmer));
      loginError.textContent = '';
      clearInterval(countdownTimer);
      checkFarmerAuth();
    } else {
      loginError.textContent = authResult ? authResult.message : 'गलत ओटीपी। कृपया पुनः प्रयास करें।';
    }
  });

  resendOtpBtn?.addEventListener('click', () => {
    if (getOtpBtn) getOtpBtn.click();
  });

  // ==================== 3. FARMER REGISTRATION (SAVED TO CENTRAL DATABASE) ====================
  farmerRegisterForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('regName').value.trim();
    const mobile = document.getElementById('regMobile').value.trim();
    const village = document.getElementById('regVillage').value.trim();
    const landSize = document.getElementById('regLand').value.trim();
    const crops = document.getElementById('regCrops').value.trim();
    const password = document.getElementById('regPassword').value.trim();
    const confirmPassword = document.getElementById('regConfirmPassword').value.trim();

    if (mobile.length < 10) {
      registerError.textContent = 'कृपया 10 अंकों का वैध मोबाइल नंबर दर्ज करें।';
      return;
    }

    if (!password || password.length < 4) {
      registerError.textContent = 'पासवर्ड कम से कम 4 अक्षरों या अंकों का होना चाहिए।';
      return;
    }

    if (password !== confirmPassword) {
      registerError.textContent = 'दोनों पासवर्ड मेल नहीं खाते। कृपया पुनः जांचें।';
      return;
    }

    registerError.textContent = 'केंद्रीय डेटाबेस में पंजीकरण किया जा रहा है...';

    const farmerPayload = {
      name,
      mobile,
      village,
      landSize: landSize || '5 Bigha',
      crops: crops || 'Sugarcane, Wheat',
      password,
      pin: password,
      notes: 'Registered via Farmer Portal'
    };

    let newFarmer = null;
    if (window.KISSAN_API && typeof window.KISSAN_API.registerFarmer === 'function') {
      newFarmer = await window.KISSAN_API.registerFarmer(farmerPayload);
    } else if (window.KISSAN_DB && window.KISSAN_DB.farmers) {
      newFarmer = window.KISSAN_DB.farmers.add(farmerPayload);
    }

    if (newFarmer && (newFarmer.id || newFarmer.mobile)) {
      sessionStorage.setItem('kissan_active_farmer', JSON.stringify(newFarmer));
      registerError.textContent = '';
      farmerRegisterForm.reset();
      alert(`पंजीकरण सफल!\nआपकी किसान ID: ${newFarmer.id}\nपासवर्ड: ${password}\nयह खाता ओनर पोर्टल पर भी दर्ज हो चुका है।`);
      checkFarmerAuth();
    } else {
      registerError.textContent = 'पंजीकरण में त्रुटि। कृपया पुनः प्रयास करें।';
    }
  });

  // ==================== 4. CHANGE PASSWORD MODAL ====================
  openChangePassModalBtn?.addEventListener('click', () => {
    let currentFarmer = getStoredFarmer();
    if (!currentFarmer) return;

    changePassFarmerMeta.textContent = `किसान: ${currentFarmer.name} (${currentFarmer.id})`;
    changePasswordForm.reset();
    changePassMsg.textContent = '';
    changePassMsg.style.color = 'var(--danger)';
    changePassModal.classList.remove('hidden');
  });

  function closeChangePass() {
    changePassModal.classList.add('hidden');
  }

  closeChangePassBtn?.addEventListener('click', closeChangePass);
  closeChangePassBackdrop?.addEventListener('click', closeChangePass);

  changePasswordForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    let currentFarmer = getStoredFarmer();
    if (!currentFarmer) return;

    const oldPass = oldPasswordInput.value.trim();
    const newPass = newPasswordInput.value.trim();
    const confirmPass = confirmNewPassInput.value.trim();

    const expectedPass = currentFarmer.password || currentFarmer.pin || '';
    if (oldPass !== expectedPass) {
      changePassMsg.textContent = 'वर्तमान पासवर्ड गलत है।';
      return;
    }

    if (newPass.length < 4) {
      changePassMsg.textContent = 'नया पासवर्ड कम से कम 4 अक्षरों का होना चाहिए।';
      return;
    }

    if (newPass !== confirmPass) {
      changePassMsg.textContent = 'नया पासवर्ड और पुष्टि पासवर्ड मेल नहीं खाते।';
      return;
    }

    // Call API to reset password in backend database
    let res = null;
    if (window.KISSAN_API && typeof window.KISSAN_API.resetFarmerPassword === 'function') {
      res = await window.KISSAN_API.resetFarmerPassword(currentFarmer.id, newPass);
    } else if (window.KISSAN_DB && window.KISSAN_DB.farmers) {
      window.KISSAN_DB.farmers.update(currentFarmer.id, { password: newPass, pin: newPass });
      res = { success: true };
    }

    if (res && res.success) {
      currentFarmer.password = newPass;
      currentFarmer.pin = newPass;
      sessionStorage.setItem('kissan_active_farmer', JSON.stringify(currentFarmer));
      changePassMsg.style.color = 'var(--green)';
      changePassMsg.textContent = 'पासवर्ड सफलतापूर्वक बदल दिया गया!';
      setTimeout(() => {
        closeChangePass();
      }, 1200);
    } else {
      changePassMsg.textContent = res ? res.message : 'पासवर्ड अपडेट करने में त्रुटि।';
    }
  });

  // Refresh live farmer data from central server
  refreshFarmerDataBtn?.addEventListener('click', async () => {
    let current = getStoredFarmer();
    if (!current) return;
    refreshFarmerDataBtn.disabled = true;
    refreshFarmerDataBtn.textContent = '⏳ लोडिंग...';

    if (window.KISSAN_API && typeof window.KISSAN_API.getFarmer === 'function') {
      const live = await window.KISSAN_API.getFarmer(current.id);
      if (live) {
        sessionStorage.setItem('kissan_active_farmer', JSON.stringify(live));
        loadFarmerDashboard(live);
      }
    }
    setTimeout(() => {
      refreshFarmerDataBtn.disabled = false;
      refreshFarmerDataBtn.textContent = '🔄 रिफ्रेश';
    }, 500);
  });

  // Logout
  farmerLogoutBtn?.addEventListener('click', () => {
    sessionStorage.removeItem('kissan_active_farmer');
    checkFarmerAuth();
  });

  function getStoredFarmer() {
    try {
      const raw = sessionStorage.getItem('kissan_active_farmer');
      if (raw) return JSON.parse(raw);
    } catch (e) {}
    return null;
  }

  // Check Active Farmer Authentication
  async function checkFarmerAuth() {
    let activeFarmer = getStoredFarmer();

    if (activeFarmer) {
      // Sync fresh details from backend database if available
      if (window.KISSAN_API && typeof window.KISSAN_API.getFarmer === 'function') {
        try {
          const fresh = await window.KISSAN_API.getFarmer(activeFarmer.id || activeFarmer.mobile);
          if (fresh) {
            activeFarmer = fresh;
            sessionStorage.setItem('kissan_active_farmer', JSON.stringify(fresh));
          }
        } catch (e) {}
      } else if (window.KISSAN_DB && window.KISSAN_DB.farmers) {
        const live = window.KISSAN_DB.farmers.getById(activeFarmer.id || activeFarmer.mobile);
        if (live) activeFarmer = live;
      }

      authSection.classList.add('hidden');
      dashboardSection.classList.remove('hidden');
      farmerLogoutBtn.classList.remove('hidden');
      openChangePassModalBtn?.classList.remove('hidden');
      refreshFarmerDataBtn?.classList.remove('hidden');
      loadFarmerDashboard(activeFarmer);
    } else {
      authSection.classList.remove('hidden');
      dashboardSection.classList.add('hidden');
      farmerLogoutBtn.classList.add('hidden');
      openChangePassModalBtn?.classList.add('hidden');
      refreshFarmerDataBtn?.classList.add('hidden');
    }
  }

  // Load Farmer Dashboard & Khata
  function loadFarmerDashboard(farmer) {
    if (!farmer) return;
    farmerWelcomeName.textContent = farmer.name;
    cardFarmerId.textContent = farmer.id || 'KIS-1001';
    cardFarmerName.textContent = farmer.name;
    cardFarmerMobile.textContent = farmer.mobile;
    cardFarmerVillage.textContent = farmer.village || 'Village Behra Sadat';
    cardFarmerCrops.textContent = farmer.crops || 'Sugarcane, Wheat';

    const khata = farmer.khata || [];
    let totalPurchases = 0;
    let totalBal = 0;

    khataTableBody.innerHTML = '';
    recordCountLabel.textContent = `${khata.length} रिकॉर्ड`;

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

  // Initial Auth Check
  checkFarmerAuth();
});
