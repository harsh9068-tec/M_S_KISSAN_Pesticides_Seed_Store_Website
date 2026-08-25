// ============================================================================
// M/S KISSAN PESTICIDES & SEED STORE - UNIFIED THEME MANAGER (DARK / BRIGHT)
// Handles theme toggling, localStorage persistence, and multi-page sync
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

      // Update all toggle buttons in DOM
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

      // Dispatch custom event for custom components
      window.dispatchEvent(new CustomEvent('kissan-theme-change', { detail: { theme } }));
    },

    toggle() {
      const nextTheme = this.currentTheme === 'dark' ? 'light' : 'dark';
      this.applyTheme(nextTheme);
      return nextTheme;
    },

    bindButtons() {
      document.addEventListener('click', (e) => {
        const btn = e.target.closest('.theme-toggle-btn');
        if (btn) {
          e.preventDefault();
          this.toggle();
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
