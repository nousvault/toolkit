// theme.js — dark/light toggle, persisted to localStorage
const themeToggle = document.querySelector('[data-theme-toggle]');
const themeLabel = document.querySelector('[data-theme-label]');
const themeColorMeta = document.querySelector('meta[name="theme-color"]');
const root = document.documentElement;

const themeColors = { dark: '#0e1512', light: '#efe8dd' };

export function applyTheme(theme) {
  root.dataset.theme = theme;
  if (themeLabel) themeLabel.textContent = theme;
  if (themeColorMeta) themeColorMeta.setAttribute('content', themeColors[theme] || themeColors.dark);
}

export function initTheme() {
  const stored = localStorage.getItem('toolkit-theme');
  const system = window.matchMedia('(prefers-color-scheme: dark)').matches;
  applyTheme(root.dataset.theme || stored || (system ? 'dark' : 'light'));

  themeToggle?.addEventListener('click', () => {
    const next = root.dataset.theme === 'dark' ? 'light' : 'dark';
    applyTheme(next);
    localStorage.setItem('toolkit-theme', next);
  });
}
