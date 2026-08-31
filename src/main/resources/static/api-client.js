// ============================================================================
// M/S KISSAN PESTICIDES & SEED STORE - REST API CLIENT & SPRING BOOT BRIDGE
// Multi-Device Full-Stack Real-Time Synchronizer
// ============================================================================

(function (window) {
  'use strict';

  function getApiBase() {
    if (window.KISSAN_API_URL) return window.KISSAN_API_URL;
    if (window.location.protocol.startsWith('http')) {
      const host = window.location.hostname;
      const port = window.location.port;
      if (port === '8080') {
        return `${window.location.origin}/api/v1`;
      }
      if (host === 'localhost' || host === '127.0.0.1' || /^(\d{1,3}\.){3}\d{1,3}$/.test(host)) {
        return `${window.location.protocol}//${host}:8080/api/v1`;
      }
    }
    return 'http://localhost:8080/api/v1';
  }

  const ApiClient = {
    isServerActive: false,
    baseUrl: getApiBase(),

    async checkHealth() {
      try {
        const res = await fetch(`${this.baseUrl}/products`, {
          method: 'GET',
          headers: { 'Accept': 'application/json' },
          signal: AbortSignal.timeout ? AbortSignal.timeout(3000) : undefined
        });
        this.isServerActive = res.ok;
        return res.ok;
      } catch (e) {
        this.isServerActive = false;
        return false;
      }
    },

    // ==================== PRODUCTS REST APIS ====================
    async getProducts(params = {}) {
      try {
        const query = new URLSearchParams(params).toString();
        const url = `${this.baseUrl}/products${query ? '?' + query : ''}`;
        const res = await fetch(url);
        if (res.ok) {
          const list = await res.json();
          if (Array.isArray(list) && list.length > 0 && window.KISSAN_DB && window.KISSAN_DB.products) {
            try { localStorage.setItem('kissan_master_db_products', JSON.stringify(list)); } catch (e) {}
          }
          return list;
        }
      } catch (e) {}
      return window.KISSAN_DB ? window.KISSAN_DB.products.getAll() : [];
    },

    async saveProduct(product) {
      try {
        const isUpdate = product.id && !product.id.startsWith('prod_');
        const url = isUpdate ? `${this.baseUrl}/products/${encodeURIComponent(product.id)}` : `${this.baseUrl}/products`;
        const method = isUpdate ? 'PUT' : 'POST';

        const res = await fetch(url, {
          method,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(product)
        });
        if (res.ok) {
          const saved = await res.json();
          if (window.KISSAN_DB && window.KISSAN_DB.products) {
            window.KISSAN_DB.products.updateOrAddLocal(saved);
          }
          return saved;
        }
      } catch (e) {}
      return window.KISSAN_DB ? window.KISSAN_DB.products.add(product) : product;
    },

    async deleteProduct(id) {
      try {
        const res = await fetch(`${this.baseUrl}/products/${encodeURIComponent(id)}`, {
          method: 'DELETE'
        });
        if (res.ok) {
          if (window.KISSAN_DB && window.KISSAN_DB.products) {
            window.KISSAN_DB.products.deleteLocal(id);
          }
          return true;
        }
      } catch (e) {}
      return window.KISSAN_DB ? window.KISSAN_DB.products.delete(id) : false;
    },

    // ==================== FARMERS REST APIS ====================
    async getFarmers() {
      try {
        const res = await fetch(`${this.baseUrl}/farmers`);
        if (res.ok) {
          const list = await res.json();
          if (Array.isArray(list)) {
            try { localStorage.setItem('kissan_master_db_farmers', JSON.stringify(list)); } catch (e) {}
            return list;
          }
        }
      } catch (e) {}
      return window.KISSAN_DB ? window.KISSAN_DB.farmers.getAllLocal() : [];
    },

    async getFarmerByIdOrMobile(idOrMobile) {
      try {
        const clean = String(idOrMobile).trim();
        const res = await fetch(`${this.baseUrl}/farmers/${encodeURIComponent(clean)}`);
        if (res.ok) {
          return await res.json();
        }
      } catch (e) {}
      return window.KISSAN_DB ? window.KISSAN_DB.farmers.getById(idOrMobile) : null;
    },

    async registerFarmer(farmerData) {
      try {
        const res = await fetch(`${this.baseUrl}/farmers/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(farmerData)
        });
        if (res.ok) {
          const savedFarmer = await res.json();
          if (window.KISSAN_DB && window.KISSAN_DB.farmers) {
            window.KISSAN_DB.farmers.saveToLocalCache(savedFarmer);
          }
          return savedFarmer;
        }
      } catch (e) {}
      return window.KISSAN_DB ? window.KISSAN_DB.farmers.add(farmerData) : farmerData;
    },

    async updateFarmer(id, farmerData) {
      try {
        const res = await fetch(`${this.baseUrl}/farmers/${encodeURIComponent(id)}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(farmerData)
        });
        if (res.ok) {
          const updated = await res.json();
          if (window.KISSAN_DB && window.KISSAN_DB.farmers) {
            window.KISSAN_DB.farmers.saveToLocalCache(updated);
          }
          return updated;
        }
      } catch (e) {}
      return window.KISSAN_DB ? window.KISSAN_DB.farmers.update(id, farmerData) : null;
    },

    async deleteFarmer(id) {
      try {
        const res = await fetch(`${this.baseUrl}/farmers/${encodeURIComponent(id)}`, {
          method: 'DELETE'
        });
        if (res.ok) {
          if (window.KISSAN_DB && window.KISSAN_DB.farmers) {
            window.KISSAN_DB.farmers.deleteLocal(id);
          }
          return true;
        }
      } catch (e) {}
      return window.KISSAN_DB ? window.KISSAN_DB.farmers.delete(id) : false;
    },

    async addKhataTransaction(farmerId, txData) {
      try {
        const res = await fetch(`${this.baseUrl}/farmers/${encodeURIComponent(farmerId)}/khata`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(txData)
        });
        if (res.ok) {
          const savedTx = await res.json();
          const farmer = await this.getFarmerByIdOrMobile(farmerId);
          if (farmer && window.KISSAN_DB && window.KISSAN_DB.farmers) {
            window.KISSAN_DB.farmers.saveToLocalCache(farmer);
          }
          return savedTx;
        }
      } catch (e) {}
      return window.KISSAN_DB ? window.KISSAN_DB.farmers.addKhataEntry(farmerId, txData) : null;
    },

    // ==================== INVOICES REST APIS ====================
    async getInvoices() {
      try {
        const res = await fetch(`${this.baseUrl}/invoices`);
        if (res.ok) {
          const list = await res.json();
          if (Array.isArray(list)) {
            try { localStorage.setItem('kissan_master_db_invoices', JSON.stringify(list)); } catch (e) {}
            return list;
          }
        }
      } catch (e) {}
      return window.KISSAN_DB ? window.KISSAN_DB.invoices.getAll() : [];
    },

    async createInvoice(invoiceData) {
      try {
        const res = await fetch(`${this.baseUrl}/invoices`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(invoiceData)
        });
        if (res.ok) {
          const saved = await res.json();
          if (window.KISSAN_DB && window.KISSAN_DB.invoices) {
            window.KISSAN_DB.invoices.saveToLocalCache(saved);
          }
          return saved;
        }
      } catch (e) {}
      return window.KISSAN_DB ? window.KISSAN_DB.invoices.create(invoiceData) : invoiceData;
    },

    // ==================== OTP AUTH REST APIS ====================
    async requestOTP(phoneOrId) {
      try {
        const res = await fetch(`${this.baseUrl}/auth/otp/generate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ phoneOrId })
        });
        if (res.ok) return await res.json();
      } catch (e) {}
      return window.KISSAN_DB && window.KISSAN_DB.otp ? window.KISSAN_DB.otp.generate(phoneOrId) : { success: false, message: 'OTP service offline' };
    },

    async verifyOTP(phoneOrId, code) {
      try {
        const res = await fetch(`${this.baseUrl}/auth/otp/verify`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ phoneOrId, code })
        });
        if (res.ok) return await res.json();
      } catch (e) {}
      return window.KISSAN_DB && window.KISSAN_DB.otp ? window.KISSAN_DB.otp.verify(phoneOrId, code) : { success: false, message: 'Verification failed' };
    },

    // ==================== AI CROP DOCTOR REST API ====================
    async diagnoseCrop(crop, symptoms) {
      try {
        const res = await fetch(`${this.baseUrl}/ai-doctor/diagnose`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ crop, symptoms })
        });
        if (res.ok) return await res.json();
      } catch (e) {}
      return null;
    }
  };

  // Initial Health & Sync check
  ApiClient.checkHealth();

  window.KISSAN_API = ApiClient;

})(window);
