// M/S KISSAN Pesticides & Seed Store - Storefront Logic, Bilingual Engine & AI Crop Doctor

document.addEventListener('DOMContentLoaded', () => {
  // Navigation & Mobile Menu
  const menuToggle = document.querySelector('.menu-toggle');
  const nav = document.querySelector('.nav');

  menuToggle?.addEventListener('click', () => {
    const open = nav.classList.toggle('open');
    menuToggle.setAttribute('aria-expanded', String(open));
  });

  document.querySelectorAll('.nav a').forEach(link => {
    link.addEventListener('click', () => nav.classList.remove('open'));
  });

  // State & Store Variables
  const waNumber = '919760153116';
  const productGrid = document.getElementById('productGrid');
  const searchInput = document.getElementById('clientSearchInput');
  const noResultsMsg = document.getElementById('clientNoResults');
  const tabs = document.querySelectorAll('.tab');
  const langToggleBtn = document.getElementById('langToggleBtn');
  const langBtnLabel = document.getElementById('langBtnLabel');

  let activeCategory = 'all';
  let currentLang = window.I18n ? window.I18n.getLang() : 'en';
  let products = window.ProductStore ? window.ProductStore.getProducts() : [];
  let currentAiDiagnosis = null;

  // ==================== BILINGUAL TRANSLATION LOGIC ====================
  function applyLanguage(lang) {
    if (!window.I18n || !window.I18n.TRANSLATIONS[lang]) return;

    currentLang = lang;
    window.I18n.setLang(lang);
    const dict = window.I18n.TRANSLATIONS[lang];

    // Update all elements with data-i18n attribute
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.dataset.i18n;
      if (dict[key]) {
        el.innerHTML = dict[key];
      }
    });

    // Update Input Placeholders
    if (searchInput && dict.search_placeholder) {
      searchInput.placeholder = dict.search_placeholder;
    }

    const formNameInput = document.getElementById('formNameInput');
    if (formNameInput && dict.form_name_ph) {
      formNameInput.placeholder = dict.form_name_ph;
    }

    const formCropInput = document.getElementById('formCropInput');
    if (formCropInput && dict.form_crop_ph) {
      formCropInput.placeholder = dict.form_crop_ph;
    }

    const formMsgInput = document.getElementById('formMsgInput');
    if (formMsgInput && dict.form_msg_ph) {
      formMsgInput.placeholder = dict.form_msg_ph;
    }

    const aiSymptomsInput = document.getElementById('aiSymptomsInput');
    if (aiSymptomsInput && dict.ai_symptoms_ph) {
      aiSymptomsInput.placeholder = dict.ai_symptoms_ph;
    }

    // Update Language Toggle Button Label
    if (langBtnLabel) {
      langBtnLabel.textContent = lang === 'hi' ? 'Switch to English' : 'हिंदी में देखें';
    }

    // Re-render product catalog in selected language
    renderStoreProducts();

    // Re-render active AI Diagnosis if open
    if (currentAiDiagnosis) {
      displayAiDiagnosis(currentAiDiagnosis);
    }
  }

  // Toggle Language Click
  langToggleBtn?.addEventListener('click', () => {
    const newLang = currentLang === 'hi' ? 'en' : 'hi';
    applyLanguage(newLang);
  });

  // ==================== DYNAMIC PRODUCT CATALOG ====================
  function renderStoreProducts() {
    if (!productGrid) return;

    if (window.ProductStore) {
      products = window.ProductStore.getProducts();
    }

    const dict = window.I18n ? window.I18n.TRANSLATIONS[currentLang] : {};
    const query = searchInput ? searchInput.value.toLowerCase().trim() : '';

    const filtered = products.filter(p => {
      const matchCategory = activeCategory === 'all' || p.category === activeCategory;
      const matchQuery = !query ||
        p.name.toLowerCase().includes(query) ||
        (p.brand && p.brand.toLowerCase().includes(query)) ||
        (p.crops && p.crops.toLowerCase().includes(query)) ||
        (p.target && p.target.toLowerCase().includes(query));

      return matchCategory && matchQuery;
    });

    productGrid.innerHTML = '';

    if (filtered.length === 0) {
      noResultsMsg?.classList.remove('hidden');
    } else {
      noResultsMsg?.classList.add('hidden');
      filtered.forEach(p => {
        const card = createStoreProductCard(p, dict);
        productGrid.appendChild(card);
      });
    }
  }

  // Create Individual Product Card HTML
  function createStoreProductCard(p, dict) {
    const card = document.createElement('article');
    card.className = 'product-card';
    card.dataset.category = p.category;

    const categoryBadgeKeys = {
      seed: currentLang === 'hi' ? 'बीज (SEED)' : 'SEEDS',
      insecticide: currentLang === 'hi' ? 'कीटनाशक' : 'INSECTICIDE',
      fungicide: currentLang === 'hi' ? 'फफूंदनाशक' : 'FUNGICIDE',
      bio: currentLang === 'hi' ? 'बायो टॉनिक' : 'BIO PRODUCT',
      herbicide: currentLang === 'hi' ? 'खरपतवार नाशक' : 'HERBICIDE',
      fertilizer: currentLang === 'hi' ? 'पोषक तत्व' : 'NUTRIENTS',
      all: currentLang === 'hi' ? 'कृषि उत्पाद' : 'AGRI INPUT'
    };

    const badgeText = categoryBadgeKeys[p.category] || p.category.toUpperCase();
    const iconContent = p.image 
      ? `<img src="${p.image}" alt="${p.name}" class="product-thumb-img" />` 
      : `<i>${p.icon || '🌱'}</i>`;

    const cropsLabel = dict.card_crops_label || '🌾 Crops:';
    const targetLabel = dict.card_target_label || '🎯 Target:';
    const packLabel = dict.card_pack_label || '📦 Pack Sizes:';
    const enquireBtnText = dict.btn_enquire_card || 'Enquire on WhatsApp →';

    card.innerHTML = `
      <div class="product-top">
        <span>${badgeText}</span>
        <div class="product-icon-wrap">${iconContent}</div>
      </div>
      <h3>${p.name}</h3>
      ${p.brand ? `<p class="product-brand-tag">${currentLang === 'hi' ? 'निर्माता: ' : 'By '}${p.brand}</p>` : ''}
      <p><b>${cropsLabel}</b> ${p.crops || (currentLang === 'hi' ? 'सभी मुख्य फसलें' : 'All seasonal crops')}</p>
      <p><b>${targetLabel}</b> ${p.target || (currentLang === 'hi' ? 'फसल सुरक्षा एवं पैदावार' : 'General crop protection')}</p>
      ${p.packSizes ? `<p><b>${packLabel}</b> ${p.packSizes}</p>` : ''}
      <button class="enquire" data-product="${p.name}">${enquireBtnText}</button>
    `;

    // Bind WhatsApp Click
    card.querySelector('.enquire').addEventListener('click', () => {
      const msgEn = `Hello M/S KISSAN Pesticides & Seed Store, I want to enquire about "${p.name}" (For ${p.crops || 'Crops'}). Please confirm price and availability.`;
      const msgHi = `नमस्ते मैसर्स किसान स्टोर, मुझे "${p.name}" (फसल: ${p.crops || 'फसल'}) के बारे में जानकारी और रेट चाहिए। क्या यह उपलब्ध है?`;
      const message = currentLang === 'hi' ? msgHi : msgEn;
      window.open(`https://wa.me/${waNumber}?text=${encodeURIComponent(message)}`, '_blank');
    });

    return card;
  }

  // Category Filter Tab Clicks
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      activeCategory = tab.dataset.filter || 'all';
      renderStoreProducts();
    });
  });

  // Search Input Listener with Search Analytics Logging
  let searchDebounceTimer = null;
  searchInput?.addEventListener('input', () => {
    renderStoreProducts();
    const query = searchInput.value.trim();
    if (query.length >= 2 && window.FarmerDB) {
      clearTimeout(searchDebounceTimer);
      searchDebounceTimer = setTimeout(() => {
        const count = productGrid ? productGrid.querySelectorAll('.product-card').length : 0;
        window.FarmerDB.logSearch(query, activeCategory, count);
      }, 700);
    }
  });

  // ==================== AI CROP DOCTOR & SCANNER LOGIC ====================
  const aiImageInput = document.getElementById('aiImageInput');
  const dropzonePrompt = document.getElementById('dropzonePrompt');
  const dropzonePreviewWrap = document.getElementById('dropzonePreviewWrap');
  const aiPreviewImg = document.getElementById('aiPreviewImg');
  const scannerLaser = document.getElementById('scannerLaser');
  const removePhotoBtn = document.getElementById('removePhotoBtn');
  const aiCropSelect = document.getElementById('aiCropSelect');
  const aiSymptomsInput = document.getElementById('aiSymptomsInput');
  const runAiScanBtn = document.getElementById('runAiScanBtn');
  const scanBtnText = document.getElementById('scanBtnText');
  const aiPlaceholderView = document.getElementById('aiPlaceholderView');
  const aiResultView = document.getElementById('aiResultView');
  const aiWaConsultBtn = document.getElementById('aiWaConsultBtn');

  // Handle Photo Upload / Capture
  aiImageInput?.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      aiPreviewImg.src = event.target.result;
      dropzonePrompt.classList.add('hidden');
      dropzonePreviewWrap.classList.remove('hidden');
    };
    reader.readAsDataURL(file);
  });

  // Remove Photo
  removePhotoBtn?.addEventListener('click', (e) => {
    e.stopPropagation();
    aiImageInput.value = '';
    aiPreviewImg.src = '';
    dropzonePreviewWrap.classList.add('hidden');
    dropzonePrompt.classList.remove('hidden');
  });

  // Run AI Scan
  runAiScanBtn?.addEventListener('click', () => {
    const selectedCrop = aiCropSelect ? aiCropSelect.value : 'all';
    const symptoms = aiSymptomsInput ? aiSymptomsInput.value.trim() : '';
    const hasPhoto = Boolean(aiPreviewImg && aiPreviewImg.src && !dropzonePreviewWrap.classList.contains('hidden'));

    if (selectedCrop === 'all' && !symptoms && !hasPhoto) {
      alert(currentLang === 'hi' 
        ? 'कृपया फसल का चयन करें या पत्ती का फोटो अपलोड करें।' 
        : 'Please select a crop or upload a plant photo to scan.');
      return;
    }

    // Start Scanning Animation
    if (scannerLaser) scannerLaser.classList.remove('hidden');
    if (scanBtnText) {
      scanBtnText.textContent = currentLang === 'hi' 
        ? '⚡ AI द्वारा पत्ती व बीमारी की जांच जारी है...' 
        : '⚡ AI Analyzing Crop & Leaf Symptoms...';
    }
    runAiScanBtn.disabled = true;

    // Simulate AI Neural Engine processing
    setTimeout(() => {
      if (window.CropAIDoctor) {
        currentAiDiagnosis = window.CropAIDoctor.diagnose({
          crop: selectedCrop,
          symptomsText: symptoms,
          hasImage: hasPhoto
        });

        displayAiDiagnosis(currentAiDiagnosis);

        // Log in Master Database AI Doctor scans collection
        if (window.KISSAN_DB) {
          window.KISSAN_DB.aiDoctor.log({
            ...currentAiDiagnosis,
            source: 'Storefront AI Doctor'
          });
          window.KISSAN_DB.searchAnalytics.log(`[AI Doctor] ${currentAiDiagnosis.diseaseNameEn} (${currentAiDiagnosis.cropNameEn})`, currentAiDiagnosis.crop, 1);
        } else if (window.FarmerDB) {
          window.FarmerDB.logSearch(`[AI Doctor] ${currentAiDiagnosis.diseaseNameEn} (${currentAiDiagnosis.cropNameEn})`, currentAiDiagnosis.crop, 1);
        }
      }

      // Stop Scanning Animation
      if (scannerLaser) scannerLaser.classList.add('hidden');
      if (scanBtnText) {
        scanBtnText.textContent = currentLang === 'hi' 
          ? '🔬 पुनः जांचें (Scan Another)' 
          : '🔬 Scan Crop & Get AI Solution';
      }
      runAiScanBtn.disabled = false;

      // Smooth scroll to results
      aiResultView.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 1200);
  });

  function displayAiDiagnosis(res) {
    if (!aiResultView || !res) return;

    aiPlaceholderView?.classList.add('hidden');
    aiResultView.classList.remove('hidden');

    const rxDiseaseName = document.getElementById('rxDiseaseName');
    const rxCropName = document.getElementById('rxCropName');
    const rxConfidence = document.getElementById('rxConfidence');
    const rxSymptoms = document.getElementById('rxSymptoms');
    const rxCause = document.getElementById('rxCause');
    const rxMedName = document.getElementById('rxMedName');
    const rxDosage = document.getElementById('rxDosage');
    const rxAdvisory = document.getElementById('rxAdvisory');

    const isHi = currentLang === 'hi';

    if (rxDiseaseName) rxDiseaseName.textContent = isHi ? res.diseaseNameHi : res.diseaseNameEn;
    if (rxCropName) rxCropName.textContent = `${isHi ? 'फसल: ' : 'Crop: '}${isHi ? res.cropNameHi : res.cropNameEn}`;
    if (rxConfidence) rxConfidence.textContent = res.confidence || '95%';
    if (rxSymptoms) rxSymptoms.textContent = isHi ? res.symptomsHi : res.symptomsEn;
    if (rxCause) rxCause.textContent = isHi ? res.causeHi : res.causeEn;
    if (rxMedName) rxMedName.textContent = `${res.recommendedProduct} (${res.brand})`;
    if (rxDosage) rxDosage.textContent = isHi ? res.dosageHi : res.dosageEn;
    if (rxAdvisory) rxAdvisory.textContent = isHi ? res.advisoryHi : res.advisoryEn;

    // Setup WhatsApp Confirmation
    if (aiWaConsultBtn) {
      aiWaConsultBtn.onclick = () => {
        const diseaseTitle = isHi ? res.diseaseNameHi : res.diseaseNameEn;
        const cropTitle = isHi ? res.cropNameHi : res.cropNameEn;
        const medTitle = `${res.recommendedProduct} (${res.brand})`;

        const text = isHi
          ? `नमस्ते श्री महीपाल सिंह जी (मैसर्स किसान स्टोर),%0Aमैंने वेबसाइट AI डॉक्टर से फसल रोग की जांच की है:%0A- फसल: ${cropTitle}%0A- पहचानी गई बीमारी: ${diseaseTitle}%0A- अनुशंसित दवा: ${medTitle}%0Aकृपया इस दवा की उपलब्धता एवं उचित मूल्य बताएं। धन्यवाद!`
          : `Hello Mr. Mahipal Singh (M/S KISSAN Store),%0AI used your website AI Crop Doctor to scan my crop:%0A- Crop: ${cropTitle}%0A- Detected Disease: ${diseaseTitle}%0A- Prescribed Medicine: ${medTitle}%0APlease confirm availability and price. Thank you!`;

        window.open(`https://wa.me/${waNumber}?text=${text}`, '_blank');
      };
    }
  }

  // Initial Language Setup & Render
  applyLanguage(currentLang);

  // Handle URL query parameters (e.g. ?search=Syngenta or ?brand=DuPont)
  const urlParams = new URLSearchParams(window.location.search);
  const searchParam = urlParams.get('search') || urlParams.get('brand');
  if (searchParam && searchInput) {
    searchInput.value = searchParam;
    renderStoreProducts();
    const prodSec = document.getElementById('products');
    if (prodSec) {
      setTimeout(() => prodSec.scrollIntoView({ behavior: 'smooth' }), 300);
    }
  }

  // Contact Enquiry Form Submit
  document.getElementById('enquiryForm')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const data = new FormData(e.target);
    const name = data.get('name');
    const crop = data.get('crop');
    const message = data.get('message');

    // Save in Master DB enquiries collection
    if (window.KISSAN_DB) {
      window.KISSAN_DB.enquiries.add({ name, crop, message });
    }

    const text = currentLang === 'hi'
      ? `नमस्ते मैसर्स किसान पेस्टिसाइड्स एवं बीज स्टोर,%0A%0Aनाम: ${name}%0Aफसल: ${crop || 'विवरण नहीं'}%0Aपूछताछ: ${message}`
      : `Hello M/S KISSAN Pesticides and Seed Store,%0A%0AName: ${name}%0ACrop: ${crop || 'Not specified'}%0AEnquiry: ${message}`;
    window.open(`https://wa.me/${waNumber}?text=${encodeURIComponent(text)}`, '_blank');
  });

  // Footer Year
  const yearElem = document.getElementById('year');
  if (yearElem) {
    yearElem.textContent = new Date().getFullYear();
  }
});
