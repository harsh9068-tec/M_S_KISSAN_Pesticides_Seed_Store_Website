// ============================================================================
// M/S KISSAN PESTICIDES & SEED STORE - REST API CLIENT & SPRING BOOT BRIDGE
// Real-Time Multi-Device Central Database Synchronization & Password Auth
// ============================================================================

(function (window) {
  'use strict';

  const API_BASE = (window.location.protocol === 'http:' || window.location.protocol === 'https:')
    ? (window.location.port === '8080' ? '/api/v1' : (window.KISSAN_API_URL || `${window.location.origin}/api/v1`))
    : 'http://localhost:8080/api/v1';

  const ApiClient = {
    isServerActive: false,
    apiBase: API_BASE,

    async checkHealth() {
      try {
        const res = await fetch(`${API_BASE}/products`, { method: 'GET', signal: AbortSignal.timeout(2500) });
        this.isServerActive = res.ok;
        return res.ok;
      } catch (e) {
        this.isServerActive = false;
        return false;
      }
    },

    // ==================== FARMERS & AUTHENTICATION ====================
    async loginFarmer(mobileOrId, password) {
      try {
        const res = await fetch(`${API_BASE}/farmers/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ mobileOrId, password })
        });
        if (res.ok) {
          const data = await res.json();
          if (data && data.farmer && window.KISSAN_DB) {
            window.KISSAN_DB.farmers.addOrUpdateLocal(data.farmer);
          }
          return data;
        } else {
          const errData = await res.json().catch(() => ({}));
          return { success: false, message: errData.message || 'Invalid Mobile/Farmer ID or Password.' };
        }
      } catch (e) {
        // Fallback to local DB if backend offline
        if (window.KISSAN_DB && window.KISSAN_DB.farmers) {
          return window.KISSAN_DB.farmers.loginWithPassword(mobileOrId, password);
        }
        return { success: false, message: 'Server unreachable. Please check connection.' };
      }
    },

    async registerFarmer(farmerData) {
      try {
        const res = await fetch(`${API_BASE}/farmers/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(farmerData)
        });
        if (res.ok) {
          const saved = await res.json();
          if (window.KISSAN_DB) {
            window.KISSAN_DB.farmers.addOrUpdateLocal(saved);
          }
          return saved;
        }
      } catch (e) {}
      return window.KISSAN_DB ? window.KISSAN_DB.farmers.add(farmerData) : farmerData;
    },

    async getFarmers() {
      try {
        const res = await fetch(`${API_BASE}/farmers`);
        if (res.ok) {
          const list = await res.json();
          if (Array.isArray(list) && window.KISSAN_DB) {
            window.KISSAN_DB.farmers.saveAllLocal(list);
          }
          return list;
        }
      } catch (e) {}
      return window.KISSAN_DB ? window.KISSAN_DB.farmers.getAll() : [];
    },

    async getFarmer(idOrMobile) {
      try {
        const res = await fetch(`${API_BASE}/farmers/${encodeURIComponent(idOrMobile)}`);
        if (res.ok) {
          const f = await res.json();
          if (f && window.KISSAN_DB) {
            window.KISSAN_DB.farmers.addOrUpdateLocal(f);
          }
          return f;
        }
      } catch (e) {}
      return window.KISSAN_DB ? window.KISSAN_DB.farmers.getById(idOrMobile) : null;
    },

    async updateFarmer(id, farmerData) {
      try {
        const res = await fetch(`${API_BASE}/farmers/${encodeURIComponent(id)}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(farmerData)
        });
        if (res.ok) {
          const updated = await res.json();
          if (window.KISSAN_DB) {
            window.KISSAN_DB.farmers.addOrUpdateLocal(updated);
          }
          return updated;
        }
      } catch (e) {}
      return window.KISSAN_DB ? window.KISSAN_DB.farmers.update(id, farmerData) : null;
    },

    async resetFarmerPassword(farmerId, newPassword) {
      try {
        const res = await fetch(`${API_BASE}/farmers/reset-password`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ farmerId, newPassword })
        });
        if (res.ok) {
          const data = await res.json();
          if (window.KISSAN_DB) {
            window.KISSAN_DB.farmers.update(farmerId, { password: newPassword, pin: newPassword });
          }
          return data;
        }
      } catch (e) {}
      if (window.KISSAN_DB) {
        window.KISSAN_DB.farmers.update(farmerId, { password: newPassword, pin: newPassword });
        return { success: true, message: 'Password updated locally.' };
      }
      return { success: false, message: 'Failed to reset password.' };
    },

    async deleteFarmer(id) {
      try {
        await fetch(`${API_BASE}/farmers/${encodeURIComponent(id)}`, { method: 'DELETE' });
      } catch (e) {}
      if (window.KISSAN_DB) {
        window.KISSAN_DB.farmers.delete(id);
      }
      return true;
    },

    async addKhataTransaction(farmerId, txData) {
      try {
        const res = await fetch(`${API_BASE}/farmers/${encodeURIComponent(farmerId)}/khata`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(txData)
        });
        if (res.ok) {
          const tx = await res.json();
          if (window.KISSAN_DB) {
            window.KISSAN_DB.farmers.addKhataEntryLocal(farmerId, tx);
          }
          return tx;
        }
      } catch (e) {}
      return window.KISSAN_DB ? window.KISSAN_DB.farmers.addKhataEntry(farmerId, txData) : txData;
    },

    // ==================== INVOICES & POS BILLING ====================
    async getInvoices() {
      try {
        const res = await fetch(`${API_BASE}/invoices`);
        if (res.ok) {
          const list = await res.json();
          if (Array.isArray(list) && window.KISSAN_DB) {
            window.KISSAN_DB.invoices.saveAllLocal(list);
          }
          return list;
        }
      } catch (e) {}
      return window.KISSAN_DB ? window.KISSAN_DB.invoices.getAll() : [];
    },

    async createInvoice(invoiceData) {
      try {
        const res = await fetch(`${API_BASE}/invoices`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(invoiceData)
        });
        if (res.ok) {
          const created = await res.json();
          if (window.KISSAN_DB) {
            window.KISSAN_DB.invoices.addLocal(created);
          }
          return created;
        }
      } catch (e) {}
      return window.KISSAN_DB ? window.KISSAN_DB.invoices.create(invoiceData) : invoiceData;
    },

    async deleteInvoice(id) {
      try {
        await fetch(`${API_BASE}/invoices/${encodeURIComponent(id)}`, { method: 'DELETE' });
      } catch (e) {}
      if (window.KISSAN_DB) {
        window.KISSAN_DB.invoices.delete(id);
      }
      return true;
    },

    // ==================== PRODUCTS CATALOG ====================
    async getProducts(params = {}) {
      try {
        const query = new URLSearchParams(params).toString();
        const url = `${API_BASE}/products${query ? '?' + query : ''}`;
        const res = await fetch(url);
        if (res.ok) {
          const list = await res.json();
          if (Array.isArray(list) && window.KISSAN_DB) {
            window.KISSAN_DB.products.saveAllLocal(list);
          }
          return list;
        }
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
        if (res.ok) {
          const saved = await res.json();
          if (window.KISSAN_DB) {
            window.KISSAN_DB.products.addOrUpdateLocal(saved);
          }
          return saved;
        }
      } catch (e) {}
      return window.KISSAN_DB ? window.KISSAN_DB.products.add(product) : product;
    },

    async deleteProduct(id) {
      try {
        await fetch(`${API_BASE}/products/${encodeURIComponent(id)}`, { method: 'DELETE' });
      } catch (e) {}
      if (window.KISSAN_DB) {
        window.KISSAN_DB.products.delete(id);
      }
      return true;
    },

    // ==================== CUSTOMER ENQUIRIES ====================
    async getEnquiries() {
      try {
        const res = await fetch(`${API_BASE}/enquiries`);
        if (res.ok) {
          const list = await res.json();
          if (Array.isArray(list) && window.KISSAN_DB) {
            window.KISSAN_DB.enquiries.saveAllLocal(list);
          }
          return list;
        }
      } catch (e) {}
      return window.KISSAN_DB ? window.KISSAN_DB.enquiries.getAll() : [];
    },

    async submitEnquiry(enquiry) {
      try {
        const res = await fetch(`${API_BASE}/enquiries`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(enquiry)
        });
        if (res.ok) {
          const saved = await res.json();
          if (window.KISSAN_DB) {
            window.KISSAN_DB.enquiries.addLocal(saved);
          }
          return saved;
        }
      } catch (e) {}
      return window.KISSAN_DB ? window.KISSAN_DB.enquiries.add(enquiry) : enquiry;
    },

    async updateEnquiryStatus(id, status) {
      try {
        const res = await fetch(`${API_BASE}/enquiries/${encodeURIComponent(id)}/status`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status })
        });
        if (res.ok) return await res.json();
      } catch (e) {}
      return null;
    },

    async deleteEnquiry(id) {
      try {
        await fetch(`${API_BASE}/enquiries/${encodeURIComponent(id)}`, { method: 'DELETE' });
      } catch (e) {}
      if (window.KISSAN_DB) {
        window.KISSAN_DB.enquiries.delete(id);
      }
      return true;
    },

    // ==================== AI DOCTOR & SCANS ====================
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
    },

    async logAIScan(scanData) {
      try {
        const res = await fetch(`${API_BASE}/ai-doctor/scans`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(scanData)
        });
        if (res.ok) {
          const saved = await res.json();
          if (window.KISSAN_DB) {
            window.KISSAN_DB.aiDoctor.addLocal(saved);
          }
          return saved;
        }
      } catch (e) {}
      return window.KISSAN_DB ? window.KISSAN_DB.aiDoctor.log(scanData) : scanData;
    },

    async getAIScans() {
      try {
        const res = await fetch(`${API_BASE}/ai-doctor/scans`);
        if (res.ok) {
          const list = await res.json();
          if (Array.isArray(list) && window.KISSAN_DB) {
            window.KISSAN_DB.aiDoctor.saveAllLocal(list);
          }
          return list;
        }
      } catch (e) {}
      return window.KISSAN_DB ? window.KISSAN_DB.aiDoctor.getAll() : [];
    },

    // ==================== SEARCH ANALYTICS ====================
    async logSearch(query, category = 'all', count = 0) {
      try {
        await fetch(`${API_BASE}/analytics/searches`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query, category, count })
        });
      } catch (e) {}
      if (window.KISSAN_DB) {
        window.KISSAN_DB.searchAnalytics.log(query, category, count);
      }
    },

    async getSearchAnalytics() {
      try {
        const res = await fetch(`${API_BASE}/analytics/searches`);
        if (res.ok) return await res.json();
      } catch (e) {}
      return {
        logs: window.KISSAN_DB ? window.KISSAN_DB.searchAnalytics.getAll() : [],
        trends: window.KISSAN_DB ? window.KISSAN_DB.searchAnalytics.getTopTrends() : []
      };
    },

    async clearSearchAnalytics() {
      try {
        await fetch(`${API_BASE}/analytics/searches`, { method: 'DELETE' });
      } catch (e) {}
      if (window.KISSAN_DB) {
        window.KISSAN_DB.searchAnalytics.clear();
      }
      return true;
    }
  };

  // Check health on boot
  ApiClient.checkHealth();

  window.KISSAN_API = ApiClient;

})(window);
