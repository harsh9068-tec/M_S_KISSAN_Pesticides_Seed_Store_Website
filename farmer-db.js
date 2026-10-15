// ============================================================================
// M/S KISSAN - Backward-Compatibility Bridge for Legacy FarmerDB references
// Redirects to unified KISSAN_DB Master Database Engine
// ============================================================================

(function (window) {
  'use strict';

  if (window.KISSAN_DB) {
    window.FarmerDB = {
      getFarmers: () => window.KISSAN_DB.farmers.getAll(),
      saveFarmers: (list) => window.KISSAN_DB.farmers.saveAll ? window.KISSAN_DB.farmers.saveAll(list) : true,
      addFarmer: (data) => window.KISSAN_DB.farmers.add(data),
      updateFarmer: (id, data) => window.KISSAN_DB.farmers.update(id, data),
      deleteFarmer: (id) => window.KISSAN_DB.farmers.delete(id),
      addKhataEntry: (id, entry) => window.KISSAN_DB.farmers.addKhataEntry(id, entry),
      loginFarmer: (phone, pin) => window.KISSAN_DB.farmers.loginWithOTP ? window.KISSAN_DB.farmers.loginWithOTP(phone, pin) : { success: false },
      getActiveFarmer: () => {
        try {
          const raw = sessionStorage.getItem('kissan_active_farmer');
          return raw ? JSON.parse(raw) : null;
        } catch (e) { return null; }
      },
      logoutFarmer: () => sessionStorage.removeItem('kissan_active_farmer'),
      getSearchLogs: () => window.KISSAN_DB.searchAnalytics.getAll(),
      logSearch: (q, cat, cnt) => window.KISSAN_DB.searchAnalytics.log(q, cat, cnt),
      getTopSearches: () => window.KISSAN_DB.searchAnalytics.getTopTrends(),
      clearSearchLogs: () => window.KISSAN_DB.searchAnalytics.clear()
    };
  }
})(window);

