// ============================================================================
// M/S KISSAN PESTICIDES & SEED STORE - UNIFIED THEME & SETTINGS MANAGER
// Handles theme switching, language switching in settings, and modals
// ============================================================================

(function (window) {
  'use strict';

  const THEME_KEY = 'kissan_theme_preference';

  const ThemeManager = {
    currentTheme: 'light',

    init() {
      // 1. Check stored preference or system default
      const savedTheme = localStorage.getItem(THEME_KEY);
      if (savedTheme === 'dark' || savedTheme === 'light') {
        this.currentTheme = savedTheme;
      } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        this.currentTheme = 'dark';
      } else {
        this.currentTheme = 'light';
      }

      this.applyTheme(this.currentTheme);
      this.bindButtons();
      this.initSettingsModal();

      // Listen to cross-tab changes
      window.addEventListener('storage', (e) => {
        if (e.key === THEME_KEY && e.newValue) {
          this.applyTheme(e.newValue);
        }
      });
    },

    applyTheme(theme) {
      this.currentTheme = theme;
      document.documentElement.setAttribute('data-theme', theme);
      localStorage.setItem(THEME_KEY, theme);

      // Update toggle buttons in DOM
      document.querySelectorAll('.theme-toggle-btn').forEach(btn => {
        const icon = btn.querySelector('.theme-icon');
        const label = btn.querySelector('.theme-label');
        if (theme === 'dark') {
          if (icon) icon.textContent = '☀️';
          if (label) label.textContent = 'Bright';
          btn.setAttribute('title', 'Switch to Bright / Light Mode');
          btn.classList.add('dark-active');
        } else {
          if (icon) icon.textContent = '🌙';
          if (label) label.textContent = 'Dark';
          btn.setAttribute('title', 'Switch to Dark Mode');
          btn.classList.remove('dark-active');
        }
      });

      // Update segmented theme buttons inside settings modal
      document.querySelectorAll('[data-set-theme]').forEach(btn => {
        if (btn.dataset.setTheme === theme) {
          btn.classList.add('active');
        } else {
          btn.classList.remove('active');
        }
      });

      // Dispatch custom event
      window.dispatchEvent(new CustomEvent('kissan-theme-change', { detail: { theme } }));
    },

    toggle() {
      const nextTheme = this.currentTheme === 'dark' ? 'light' : 'dark';
      this.applyTheme(nextTheme);
      return nextTheme;
    },

    bindButtons() {
      document.addEventListener('click', (e) => {
        const toggleBtn = e.target.closest('.theme-toggle-btn');
        if (toggleBtn) {
          e.preventDefault();
          this.toggle();
          return;
        }

        const setThemeBtn = e.target.closest('[data-set-theme]');
        if (setThemeBtn) {
          e.preventDefault();
          const targetTheme = setThemeBtn.dataset.setTheme;
          this.applyTheme(targetTheme);
          return;
        }

        const setLangBtn = e.target.closest('[data-set-lang]');
        if (setLangBtn) {
          e.preventDefault();
          const targetLang = setLangBtn.dataset.setLang;
          if (window.I18n && typeof window.I18n.setLang === 'function') {
            window.I18n.setLang(targetLang);
          }
          if (typeof window.applyStoreLanguage === 'function') {
            window.applyStoreLanguage(targetLang);
          }
          window.dispatchEvent(new CustomEvent('kissan-language-change', { detail: { lang: targetLang } }));
          this.updateLangButtons(targetLang);
          return;
        }
      });
    },

    updateLangButtons(lang) {
      document.querySelectorAll('[data-set-lang]').forEach(btn => {
        if (btn.dataset.setLang === lang) {
          btn.classList.add('active');
        } else {
          btn.classList.remove('active');
        }
      });
    },

    initSettingsModal() {
      // Open settings modal
      document.addEventListener('click', (e) => {
        const openBtn = e.target.closest('#settingsBtn, .open-settings-btn');
        if (openBtn) {
          e.preventDefault();
          const modal = document.getElementById('settingsModal');
          if (modal) {
            modal.classList.remove('hidden');
            // Update active buttons
            const currentLang = window.I18n ? window.I18n.getLang() : 'en';
            this.updateLangButtons(currentLang);
            this.applyTheme(this.currentTheme);
          }
          return;
        }

        const closeBtn = e.target.closest('#closeSettingsBtn, #closeSettingsBackdrop, .close-settings-btn');
        if (closeBtn) {
          e.preventDefault();
          const modal = document.getElementById('settingsModal');
          if (modal) {
            modal.classList.add('hidden');
          }
          return;
        }
      });

      // Escape key to close settings modal
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
          const modal = document.getElementById('settingsModal');
          if (modal && !modal.classList.contains('hidden')) {
            modal.classList.add('hidden');
          }
        }
      });
    }
  };

  // Immediate execution before DOM to avoid flicker
  const saved = localStorage.getItem(THEME_KEY);
  if (saved === 'dark') {
    document.documentElement.setAttribute('data-theme', 'dark');
  }

  // Bind on DOM load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => ThemeManager.init());
  } else {
    ThemeManager.init();
  }

  window.ThemeManager = ThemeManager;

})(window);
