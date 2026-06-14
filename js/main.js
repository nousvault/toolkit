// main.js — app entry point: tool registry, nav, routing, sidebar
import { initTheme } from './theme.js';
import { fullToolIcons } from './icons.js';

const toolNav = document.querySelector('[data-tool-nav]');
const toolCards = document.querySelector('[data-tool-cards]');
const toolDashboard = document.querySelector('[data-tool-dashboard]');
const toolPanel = document.querySelector('[data-tool-panel]');
const toolTitle = document.querySelector('[data-tool-title]');
const toolBody = document.querySelector('[data-tool-body]');
const toolBack = document.querySelector('[data-tool-back]');
const sidebar = document.querySelector('[data-sidebar]');

/* ── Tool Registry ──
   Each tool: { id, name, desc, category, load(): Promise<{render(parent)}> }
   load() is a dynamic import so tools only ship when used.
──────────────────────────── */
const toolRegistry = [
  { id: 'json-formatter',     name: 'JSON Formatter',      desc: 'Prettify and validate JSON',                            category: 'JSON',      load: () => import('./tools/json-formatter.js') },
  { id: 'csv-json',           name: 'CSV ↔ JSON',           desc: 'Bidirectional conversion',                              category: 'JSON',      load: () => import('./tools/csv-json.js') },
  { id: 'diff-checker',       name: 'Diff Checker',         desc: 'Text comparison tool',                                  category: 'Text',      load: () => import('./tools/diff-checker.js') },
  { id: 'character-counter',  name: 'Character Counter',    desc: 'Text analysis & stats',                                 category: 'Text',      load: () => import('./tools/character-counter.js') },
  { id: 'notes',              name: 'Notes',                desc: 'Browser scratchpad, localStorage',                       category: 'Text',      load: () => import('./tools/notes.js') },
  { id: 'jwt-decoder',        name: 'JWT Decoder',          desc: 'Token debug & decode',                                  category: 'Codec',     load: () => import('./tools/jwt-decoder.js') },
  { id: 'base64-codec',       name: 'Base64 Codec',         desc: 'Text ↔ Base64 conversion',                              category: 'Codec',     load: () => import('./tools/base64-codec.js') },
  { id: 'network-ip',         name: 'Network IP',           desc: 'Public IP & location',                                  category: 'Network',   load: () => import('./tools/network-ip.js') },
  { id: 'unix-time',          name: 'Unix Time',            desc: 'Timestamp converter',                                   category: 'Time',      load: () => import('./tools/unix-time.js') },
  { id: 'cron-parser',        name: 'Cron Parser',          desc: 'Human-readable cron',                                   category: 'Time',      load: () => import('./tools/cron-parser.js') },
  { id: 'uuid-generator',     name: 'UUID Generator',       desc: 'V1, V4, V7 support',                                    category: 'Generator', load: () => import('./tools/uuid-generator.js') },
  { id: 'password-generator', name: 'Password Generator',   desc: 'Secure password tool',                                  category: 'Generator', load: () => import('./tools/password-generator.js') },
  { id: 'image-to-text',      name: 'Image to Text',        desc: 'Local OCR extraction (Tesseract)',                       category: 'Converter', load: () => import('./tools/image-to-text.js') },
  { id: 'image-to-pdf',       name: 'Image to PDF',         desc: 'JPEG & PNG → PDF',                                     category: 'Converter', load: () => import('./tools/image-to-pdf.js') },
];

const toolMap = Object.fromEntries(toolRegistry.map(t => [t.id, t]));

/* ── Group by category ── */
function getCategoryGroups() {
  const order = ['JSON','Text','Codec','Network','Time','Generator','Converter'];
  const groups = {};
  toolRegistry.forEach(t => {
    if (!groups[t.category]) groups[t.category] = [];
    groups[t.category].push(t);
  });
  return order.filter(k => groups[k]).map(k => ({ name: k, tools: groups[k] }));
}

/* ── Render nav ── */
function renderNav(activeId) {
  const groups = getCategoryGroups();
  toolNav.innerHTML = '';
  // Dashboard home
  toolNav.insertAdjacentHTML('beforeend',
    `<button class="tool-nav-item ${!activeId ? 'is-active' : ''}" data-tool-id="">
      ${fullToolIcons['json-formatter'] || ''}<span>Dashboard</span></button>`);

  groups.forEach(g => {
    toolNav.insertAdjacentHTML('beforeend', `<div class="tool-nav-category">${g.name}</div>`);
    g.tools.forEach(t => {
      const icon = fullToolIcons[t.id] || '';
      toolNav.insertAdjacentHTML('beforeend',
        `<button class="tool-nav-item ${activeId === t.id ? 'is-active' : ''}" data-tool-id="${t.id}">
          ${icon}<span>${t.name}</span></button>`);
    });
  });
}

/* ── Render dashboard cards ── */
function renderDashboard() {
  const groups = getCategoryGroups();
  toolCards.innerHTML = '';
  groups.forEach(g => {
    g.tools.forEach(t => {
      const icon = fullToolIcons[t.id] || '';
      toolCards.insertAdjacentHTML('beforeend',
        `<button class="tool-card" data-tool-id="${t.id}">
          <span class="tool-card-icon">${icon}</span>
          <span><div class="tool-card-title">${t.name}</div><div class="tool-card-desc">${t.desc}</div></span>
        </button>`);
    });
  });
}

/* ── Activate tool ── */
async function activateTool(id) {
  if (!id) { showDashboard(); return; }
  const tool = toolMap[id];
  if (!tool) return;

  toolDashboard.hidden = true;
  toolPanel.hidden = false;
  toolTitle.textContent = tool.name;
  toolBody.innerHTML = '<span class="tool-empty">loading tool …</span>';
  renderNav(id);

  try {
    const mod = await tool.load();
    toolBody.innerHTML = '';
    mod.render(toolBody);
  } catch (e) {
    toolBody.innerHTML = `<p style="color:var(--warning)">Failed to load tool: ${e.message}</p>`;
  }
}

function showDashboard() {
  toolDashboard.hidden = false;
  toolPanel.hidden = true;
  toolBody.innerHTML = '';
  renderNav(null);
}

/* ── Sidebar mobile toggle ── */
function closeSidebar() { sidebar?.classList.remove('is-open'); document.body.classList.remove('menu-open'); }
function openSidebar() { sidebar?.classList.add('is-open'); document.body.classList.add('menu-open'); }

/* ── Init ── */
export function initApp() {
  initTheme();
  renderNav(null);
  renderDashboard();

  // Nav clicks
  toolNav.addEventListener('click', e => {
    const btn = e.target.closest('[data-tool-id]');
    if (!btn) return;
    const id = btn.dataset.toolId || '';
    activateTool(id);
    closeSidebar();
    window.location.hash = id ? `#${id}` : '#';
  });

  // Dashboard card clicks
  toolCards.addEventListener('click', e => {
    const btn = e.target.closest('[data-tool-id]');
    if (!btn) return;
    activateTool(btn.dataset.toolId);
    window.location.hash = `#${btn.dataset.toolId}`;
  });

  // Back button
  toolBack?.addEventListener('click', () => { showDashboard(); window.location.hash = '#'; closeSidebar(); });

  // Hash routing on load
  const hash = window.location.hash.replace('#', '');
  if (hash && toolMap[hash]) activateTool(hash);

  // Esc closes sidebar
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeSidebar(); });
}

// Boot
initApp();
