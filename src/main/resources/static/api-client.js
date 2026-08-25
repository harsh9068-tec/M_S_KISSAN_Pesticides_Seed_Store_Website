// ============================================================================
// M/S KISSAN PESTICIDES & SEED STORE - REST API CLIENT & SPRING BOOT BRIDGE
// Dual-Mode: Automatically connects to Java Spring Boot REST APIs or Cloud Sync
// ============================================================================

(function (window) {
  'use strict';

  const API_BASE = window.location.port === '8080' 
    ? '/api/v1' 
    : (window.KISSAN_API_URL || 'http://localhost:8080/api/v1');

  const ApiClient = {
    isServerActive: false,

    async checkHealth() {
      try {
        const res = await fetch(`${API_BASE}/products`, { method: 'GET', signal: AbortSignal.timeout(2000) });
        this.isServerActive = res.ok;
        return res.ok;
      } catch (e) {
        this.isServerActive = false;
        return false;
      }
    },

    // Products REST API
    async getProducts(params = {}) {
      try {
        const query = new URLSearchParams(params).toString();
        const url = `${API_BASE}/products${query ? '?' + query : ''}`;
        const res = await fetch(url);
        if (res.ok) return await res.json();
      } catch (e) {}
      return window.KISSAN_DB ? window.KISSAN_DB.products.getAll() : [];
    },

    async saveProduct(product) {
      try {
        const res = await fetch(`${API_BASE}/products`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(product)
        });
        if (res.ok) return await res.json();
      } catch (e) {}
      return window.KISSAN_DB ? window.KISSAN_DB.products.add(product) : product;
    },

    // Farmers REST API
    async getFarmers() {
      try {
        const res = await fetch(`${API_BASE}/farmers`);
        if (res.ok) return await res.json();
      } catch (e) {}
      return window.KISSAN_DB ? window.KISSAN_DB.farmers.getAll() : [];
    },

    async registerFarmer(farmerData) {
      try {
        const res = await fetch(`${API_BASE}/farmers/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(farmerData)
        });
        if (res.ok) return await res.json();
      } catch (e) {}
      return window.KISSAN_DB ? window.KISSAN_DB.farmers.add(farmerData) : farmerData;
    },

    // OTP Auth REST API
    async requestOTP(phoneOrId) {
      try {
        const res = await fetch(`${API_BASE}/auth/otp/generate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ phoneOrId })
        });
        if (res.ok) return await res.json();
      } catch (e) {}
      return window.KISSAN_DB ? window.KISSAN_DB.otp.generate(phoneOrId) : { success: true, code: '112233' };
    },

    async verifyOTP(phoneOrId, code) {
      try {
        const res = await fetch(`${API_BASE}/auth/otp/verify`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ phoneOrId, code })
        });
        if (res.ok) return await res.json();
      } catch (e) {}
      return window.KISSAN_DB ? window.KISSAN_DB.otp.verify(phoneOrId, code) : { success: true };
    },

    // Invoices REST API
    async createInvoice(invoiceData) {
      try {
        const res = await fetch(`${API_BASE}/invoices`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(invoiceData)
        });
        if (res.ok) return await res.json();
      } catch (e) {}
      return window.KISSAN_DB ? window.KISSAN_DB.invoices.create(invoiceData) : invoiceData;
    },

    // AI Doctor Diagnosis REST API
    async diagnoseCrop(crop, symptoms) {
      try {
        const res = await fetch(`${API_BASE}/ai-doctor/diagnose`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ crop, symptoms })
        });
        if (res.ok) return await res.json();
      } catch (e) {}
      return null;
    }
  };

  // Check health on boot
  ApiClient.checkHealth();

  window.KISSAN_API = ApiClient;

})(window);
