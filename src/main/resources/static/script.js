// ============================================================================
// M/S KISSAN - STOREFRONT APP JAVASCRIPT
// Dual-Language I18n, Dynamic Catalog, Central Database Sync & AI Crop Doctor
// ============================================================================

document.addEventListener('DOMContentLoaded', () => {
  const searchInput = document.getElementById('search');
  const tabs = document.querySelectorAll('.tab');
  const productGrid = document.querySelector('.product-grid');
  const noResultsMsg = document.getElementById('noResults');
  const langToggleBtn = document.getElementById('langToggleBtn');
  const langLabel = document.getElementById('langLabel');

  const waNumber = '919760153116';
  let currentLang = localStorage.getItem('kissan_lang') || localStorage.getItem('kissan_preferred_language') || 'hi';
  let activeCategory = 'all';
  let products = [];
  let currentAiDiagnosis = null;

  // ==================== BILINGUAL TRANSLATION ENGINE ====================
  function applyLanguage(lang) {
    currentLang = lang;
    localStorage.setItem('kissan_lang', lang);
    localStorage.setItem('kissan_preferred_language', lang);

    if (window.I18n && typeof window.I18n.setLang === 'function') {
      window.I18n.setLang(lang);
    }

    if (langLabel) {
      langLabel.textContent = lang === 'hi' ? 'English' : 'हिंदी';
    }

    if (!window.I18n) return;
    const dict = window.I18n.TRANSLATIONS[lang] || {};

    // 1. Translation Text & HTML Updates
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      if (dict[key] !== undefined) {
        const val = String(dict[key]);
        // If translation contains HTML tags (e.g. <br>, <span>, <strong>), render with innerHTML so raw tags do not appear as text
        if (val.includes('<') && val.includes('>')) {
          el.innerHTML = val;
        } else {
          el.textContent = val;
        }
      }
    });

    // 2. Explicit HTML Content Updates
    document.querySelectorAll('[data-i18n-html]').forEach(el => {
      const key = el.getAttribute('data-i18n-html');
      if (dict[key] !== undefined) {
        el.innerHTML = dict[key];
      }
    });

    // 3. Placeholders Updates
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
      const key = el.getAttribute('data-i18n-placeholder');
      if (dict[key] !== undefined) {
        el.placeholder = dict[key];
      }
    });

    // 4. Update segmented buttons in Theme / Settings Modal
    if (window.ThemeManager && typeof window.ThemeManager.updateLangButtons === 'function') {
      window.ThemeManager.updateLangButtons(lang);
    }

    // Re-render dynamic components in the active language
    renderStoreProducts();
    if (currentAiDiagnosis) {
      displayAiDiagnosis(currentAiDiagnosis);
    }
  }

  // Export applyLanguage globally so ThemeManager / Settings Modal can invoke it
  window.applyStoreLanguage = applyLanguage;

  // Toggle button event
  langToggleBtn?.addEventListener('click', (e) => {
    e.preventDefault();
    const newLang = currentLang === 'hi' ? 'en' : 'hi';
    applyLanguage(newLang);
    window.dispatchEvent(new CustomEvent('kissan-language-change', { detail: { lang: newLang } }));
  });

  // Listen to language change from settings modal
  window.addEventListener('kissan-language-change', (e) => {
    if (e.detail && e.detail.lang && e.detail.lang !== currentLang) {
      applyLanguage(e.detail.lang);
    }
  });

  // ==================== DYNAMIC PRODUCT CATALOG ====================
  function renderStoreProducts() {
    if (!productGrid) return;

    if (window.ProductStore) {
      products = window.ProductStore.getProducts();
    } else if (window.KISSAN_DB) {
      products = window.KISSAN_DB.products.getAll();
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

    const badgeText = categoryBadgeKeys[p.category] || (p.category ? p.category.toUpperCase() : 'PRODUCT');
    const iconContent = p.image 
      ? `<img src="${p.image}" alt="${p.name}" class="product-thumb-img" />` 
      : `<i>${p.icon || '🌱'}</i>`;

    const cropsLabel = dict.card_crops_label || (currentLang === 'hi' ? '🌾 फसल:' : '🌾 Crops:');
    const targetLabel = dict.card_target_label || (currentLang === 'hi' ? '🎯 काम:' : '🎯 Target:');
    const packLabel = dict.card_pack_label || (currentLang === 'hi' ? '📦 पैक साइज:' : '📦 Pack Sizes:');
    const enquireBtnText = dict.btn_enquire_card || (currentLang === 'hi' ? 'दुकान से पूछें (WhatsApp) →' : 'Enquire on WhatsApp →');

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
    if (query.length >= 2) {
      clearTimeout(searchDebounceTimer);
      searchDebounceTimer = setTimeout(() => {
        const count = productGrid ? productGrid.querySelectorAll('.product-card').length : 0;
        if (window.KISSAN_API) {
          window.KISSAN_API.logSearch(query, activeCategory, count);
        }
        if (window.KISSAN_DB) {
          window.KISSAN_DB.searchAnalytics.log(query, activeCategory, count);
        }
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
    setTimeout(async () => {
      if (window.CropAIDoctor) {
        currentAiDiagnosis = window.CropAIDoctor.diagnose({
          crop: selectedCrop,
          symptomsText: symptoms,
          hasImage: hasPhoto
        });

        displayAiDiagnosis(currentAiDiagnosis);

        const scanLogPayload = {
          crop: currentAiDiagnosis.crop,
          cropName: currentAiDiagnosis.cropNameEn,
          disease: currentAiDiagnosis.diseaseNameEn,
          confidence: currentAiDiagnosis.confidence || '95%',
          recommendedMedicine: currentAiDiagnosis.recommendedProduct,
          dosage: currentAiDiagnosis.dosageEn,
          source: 'Storefront AI Doctor'
        };

        // Log in Central Backend Database & Local Store
        if (window.KISSAN_API) {
          await window.KISSAN_API.logAIScan(scanLogPayload);
          window.KISSAN_API.logSearch(`[AI Doctor] ${currentAiDiagnosis.diseaseNameEn} (${currentAiDiagnosis.cropNameEn})`, currentAiDiagnosis.crop, 1);
        }
        if (window.KISSAN_DB) {
          window.KISSAN_DB.aiDoctor.log(scanLogPayload);
          window.KISSAN_DB.searchAnalytics.log(`[AI Doctor] ${currentAiDiagnosis.diseaseNameEn} (${currentAiDiagnosis.cropNameEn})`, currentAiDiagnosis.crop, 1);
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
  document.getElementById('enquiryForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const data = new FormData(e.target);
    const name = data.get('name') || '';
    const phone = data.get('phone') || '';
    const crop = data.get('crop') || '';
    const message = data.get('message') || '';

    const enquiryPayload = {
      name: String(name).trim(),
      phone: String(phone).trim(),
      crop: String(crop).trim(),
      message: String(message).trim()
    };

    // Save in Central Database via REST API & Master DB
    if (window.KISSAN_API) {
      await window.KISSAN_API.submitEnquiry(enquiryPayload);
    }
    if (window.KISSAN_DB) {
      window.KISSAN_DB.enquiries.add(enquiryPayload);
    }

    const text = currentLang === 'hi'
      ? `नमस्ते मैसर्स किसान पेस्टिसाइड्स एवं बीज स्टोर,%0A%0Aनाम: ${name}%0Aमोबाइल: ${phone}%0Aफसल: ${crop || 'विवरण नहीं'}%0Aपूछताछ: ${message}`
      : `Hello M/S KISSAN Pesticides and Seed Store,%0A%0AName: ${name}%0APhone: ${phone}%0ACrop: ${crop || 'Not specified'}%0AEnquiry: ${message}`;
    window.open(`https://wa.me/${waNumber}?text=${encodeURIComponent(text)}`, '_blank');
  });

  // Footer Year
  const yearElem = document.getElementById('year');
  if (yearElem) {
    yearElem.textContent = new Date().getFullYear();
  }
});
