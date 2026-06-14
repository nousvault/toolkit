// main.js — single-page app router with dynamic tool import
import { qs } from './components/dom.js';

// Tool registry — maps data-tool to module path + display name
const TOOLS = {
  dashboard: { name: 'Dashboard', },
  formatter:  { name: 'JSON Formatter',         module: './tools/json-formatter.js' },
  converter:  { name: 'CSV ↔ JSON Converter',    module: './tools/csv-json.js' },
  diff:       { name: 'Diff Checker',            module: './tools/diff-checker.js' },
  inspector:  { name: 'Character Counter',       module: './tools/character-counter.js' },
  notes:      { name: 'Notes',                   module: './tools/notes.js' },
  jwt:        { name: 'JWT Decoder',             module: './tools/jwt-decoder.js' },
  base64:     { name: 'Base64 Codec',            module: './tools/base64-codec.js' },
  network:    { name: 'Network IP',              module: './tools/network-ip.js' },
  time:       { name: 'Unix Time',               module: './tools/unix-time.js' },
  cron:       { name: 'Cron Parser',             module: './tools/cron-parser.js' },
  uuid:       { name: 'UUID Generator',          module: './tools/uuid-generator.js' },
  password:   { name: 'Password Generator',      module: './tools/password-generator.js' },
  ocr:        { name: 'Image to Text',           module: './tools/image-to-text.js' },
  imagetopdf: { name: 'Image to PDF',            module: './tools/image-to-pdf.js' },
};

const titleEl = qs('#toolTitle');
const workspace = qs('#workspace');
const topActions = qs('#topActions');
const sidebarNav = qs('#sidebarNav');

// Dashboard HTML
const dashboardHTML = `
  <h2 style="font-size:1rem;color:var(--text-placeholder);margin-bottom:var(--spacing-xl)">DevTool</h2>
  <p style="margin-bottom:var(--spacing-lg);color:var(--text-secondary);font-size:0.875rem">Select a tool from the sidebar to get started. All tools run entirely in your browser — no data is sent anywhere.</p>
  <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:var(--spacing-sm)">
    ${Object.entries(TOOLS).filter(([id]) => id !== 'dashboard').map(([id, t]) => `
      <button class="nav-item" data-tool="${id}" style="border:1px solid var(--border-strong);border-radius:var(--radius-sm);padding:var(--spacing-md);margin:0;background:var(--bg-surface);cursor:pointer">
        <div style="font-weight:600;color:var(--text-primary)">${t.name}</div>
      </button>
    `).join('')}
  </div>
`;

function showDashboard() {
  titleEl.textContent = 'Dashboard';
  topActions.innerHTML = '';
  workspace.innerHTML = dashboardHTML;
  // Wire dashboard buttons
  workspace.querySelectorAll('[data-tool]').forEach(b => b.addEventListener('click', () => navigate(b.dataset.tool)));
}

function setNavActive(id) {
  sidebarNav.querySelectorAll('.nav-item').forEach(b => b.classList.toggle('active', b.dataset.tool === id));
}

async function navigate(id) {
  const tool = TOOLS[id];
  if (!tool) return;

  setNavActive(id);
  titleEl.textContent = tool.name;
  topActions.innerHTML = '';

  if (id === 'dashboard') {
    showDashboard();
    history.replaceState(null, '', '#');
    return;
  }

  workspace.innerHTML = '<div class="progress-msg">Loading…</div>';

  try {
    const mod = await import(tool.module);
    workspace.innerHTML = '';
    mod.render(workspace);

    // Wire sidebar buttons that might be inside the workspace too
    workspace.querySelectorAll('[data-tool]').forEach(b => {
      if (!b.closest('.sidebar-nav')) b.addEventListener('click', () => navigate(b.dataset.tool));
    });
  } catch (err) {
    workspace.innerHTML = `<div class="validation-message error">Failed to load tool: ${err.message}</div>`;
  }

  history.replaceState(null, '', `#${id}`);
}

// Init
sidebarNav.addEventListener('click', e => {
  const item = e.target.closest('[data-tool]');
  if (item) navigate(item.dataset.tool);
});

// Hash routing
const hash = location.hash.replace('#', '');
if (hash && TOOLS[hash]) navigate(hash);
else showDashboard();
