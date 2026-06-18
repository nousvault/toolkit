import { showToast } from './utils.js';

// Controller state
let currentModule = null;

const THEME_STORAGE_KEY = 'toolkit-theme';

function getPreferredTheme() {
    try {
        const saved = localStorage.getItem(THEME_STORAGE_KEY);
        if (saved === 'light' || saved === 'dark') return saved;
    } catch (_) {
        // Ignore storage errors and fall back to system preference.
    }

    return window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
}

function applyTheme(theme) {
    const nextTheme = theme === 'light' ? 'light' : 'dark';
    document.documentElement.dataset.theme = nextTheme;

    try {
        localStorage.setItem(THEME_STORAGE_KEY, nextTheme);
    } catch (_) {
        // Ignore storage errors.
    }

    const toggle = document.getElementById('themeToggle');
    const label = toggle?.querySelector('.theme-toggle-label');
    if (toggle) {
        toggle.setAttribute('aria-pressed', nextTheme === 'dark' ? 'true' : 'false');
        toggle.setAttribute('aria-label', `Switch to ${nextTheme === 'dark' ? 'light' : 'dark'} mode`);
    }
    if (label) {
        label.textContent = nextTheme === 'dark' ? 'Dark' : 'Light';
    }
}

function setupThemeToggle() {
    const toggle = document.getElementById('themeToggle');
    if (!toggle) return;

    toggle.addEventListener('click', () => {
        const current = document.documentElement.dataset.theme === 'light' ? 'light' : 'dark';
        applyTheme(current === 'dark' ? 'light' : 'dark');
    });

    applyTheme(getPreferredTheme());
}

function setupMobileSidebar() {
    const toggle = document.getElementById('sidebarToggle');
    const sidebar = document.getElementById('sidebar');
    const backdrop = document.getElementById('sidebarBackdrop');
    if (!toggle || !sidebar || !backdrop) return;

    const mobileQuery = window.matchMedia('(max-width: 900px)');

    const setOpen = (open) => {
        document.body.classList.toggle('sidebar-open', open);
        toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
        toggle.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
        backdrop.hidden = !open;
    };

    const closeIfDesktop = () => {
        if (!mobileQuery.matches) setOpen(false);
    };

    toggle.addEventListener('click', () => {
        setOpen(!document.body.classList.contains('sidebar-open'));
    });

    backdrop.addEventListener('click', () => setOpen(false));

    document.addEventListener('click', (event) => {
        if (!mobileQuery.matches) return;
        if (event.target.closest('.nav-item') || event.target.closest('.tool-card')) {
            setOpen(false);
        }
    });

    window.addEventListener('resize', closeIfDesktop);
    window.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') setOpen(false);
    });

    closeIfDesktop();
}

// Registry of tools and their module paths
const toolsRegistry = {
    'dashboard': {
        title: 'Dashboard',
        description: 'Global overview and categorical access to all tools',
        module: './tools/dashboard.js',
        icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>'
    },
    'about': {
        title: 'About',
        description: 'About Tools by NousVault',
        module: './tools/about.js',
        icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>'
    },
    'formatter': {
        title: 'JSON Formatter',
        description: 'Prettify, validate and format JSON data',
        module: './tools/formatter.js',
        icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 6h16M4 12h16m-7 6h7"/></svg>'
    },
    'jwt': {
        title: 'JWT Decoder',
        description: 'Decode and debug JSON Web Tokens in real-time',
        module: './tools/jwt.js',
        icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="M12 8v4"/><path d="M12 16h.01"/></svg>'
    },
    'base64': {
        title: 'Base64 Encoder/Decoder',
        description: 'Convert text to base64 and vice-versa (standard or URL-safe)',
        module: './tools/base64.js',
        icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 7h16M4 12h16M4 17h16"/></svg>'
    },
    'diff': {
        title: 'Diff Checker',
        description: 'Compare and find differences between two pieces of text',
        module: './tools/diff.js',
        icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 3v4a1 1 0 0 0 1 1h4M17 21H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7l5 5v11a2 2 0 0 1-2 2z"/><line x1="9" y1="13" x2="15" y2="13"/><line x1="12" y1="10" x2="12" y2="16"/></svg>'
    },
    'inspector': {
        title: 'Character Counter',
        description: 'Analyze text statistics like characters, words, and paragraphs',
        module: './tools/inspector.js',
        icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 6.1L12.6 1L8 6.1V23h9V6.1z"/><path d="M11 13h3"/><path d="M11 17h3"/></svg>'
    },
    'converter': {
        title: 'CSV &harr; JSON Converter',
        description: 'Convert bidirectional between CSV and JSON formats',
        module: './tools/converter.js',
        icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/></svg>'
    },
    'network': {
        title: 'Network IP',
        description: 'Check your current public IP address and location',
        module: './tools/network.js',
        icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>'
    },
    'time': {
        title: 'Unix Time',
        description: 'Convert Unix timestamps to local and ISO formats',
        module: './tools/time.js',
        icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>'
    },
    'cron': {
        title: 'Cron Parser',
        description: 'Parse cron expressions into human-readable text',
        module: './tools/cron.js',
        icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>'
    },
    'uuid': {
        title: 'UUID Generator',
        description: 'Generate V1 (Timestamp) or V4 (Random) UUIDs',
        module: './tools/uuid.js',
        icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>'
    },
    'password': {
        title: 'Password Generator',
        description: 'Generate secure cryptographically strong passwords',
        module: './tools/password.js',
        icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"/></svg>'
    },
    'notes': {
        title: 'Notes',
        description: 'Moveable and resizable notes with tab support',
        module: './tools/notes.js',
        icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>'
    },
    'imagetopdf': {
        title: 'Image to PDF',
        description: 'Convert JPEG and PNG images to a PDF file, entirely in the browser',
        module: './tools/imagetopdf.js',
        icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><rect x="3" y="11" width="7" height="7" rx="1"/><circle cx="5" cy="13" r="0.5" fill="currentColor" stroke="none"/><polyline points="3 17 5 15 7 17"/></svg>'
    },
    'ocr': {
        title: 'Image to Text',
        description: 'Extract text from images using on-device OCR (Optical Character Recognition)',
        module: './tools/ocr.js',
        icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M7 2H4a2 2 0 0 0-2 2v3m18 0V4a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 17v3a2 2 0 0 0 2 2h3"/><line x1="7" y1="12" x2="17" y2="12"/></svg>'
    }
};

/**
 * Initialize application routing logic and event listeners
 */
async function initApp() {
    const navItems = document.querySelectorAll('.nav-item');

    setupThemeToggle();
    setupMobileSidebar();

    // Set up navigation clicks
    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            const toolId = e.currentTarget.dataset.tool;
            if (toolId) {
                // Update active state in sidebar
                navItems.forEach(nav => nav.classList.remove('active'));
                e.currentTarget.classList.add('active');

                // Load tool
                loadTool(toolId);
            }
        });
    });

    // Load initial tool (Dashboard by default)
    const initialTool = 'dashboard';
    const activeItem = document.querySelector(`[data-tool="${initialTool}"]`);
    if (activeItem) activeItem.classList.add('active');
    loadTool(initialTool);

    // Setup command palette
    setupCommandPalette();
}

/**
 * Dynamically loads and renders a specific tool module
 * @param {string} toolId 
 */
async function loadTool(toolId) {
    const activeTool = toolsRegistry[toolId];
    if (!activeTool) {
        showToast(`Tool ${toolId} not found`, 'error');
        return;
    }

    try {
        // Update Title
        document.getElementById('currentToolTitle').innerHTML = activeTool.title;

        // Clear Workspace and Actions
        const workspace = document.getElementById('workspace');
        const actionsContainer = document.getElementById('topActions');
        workspace.innerHTML = '<div class="spinner" style="margin: auto;"></div>';
        actionsContainer.innerHTML = '';

        // Clean up previous module if it has a destroy method
        if (currentModule && typeof currentModule.destroy === 'function') {
            currentModule.destroy();
        }

        // Dynamically import the module
        const module = await import(activeTool.module);
        currentModule = module;

        // Render HTML structure
        if (typeof module.render === 'function') {
            workspace.innerHTML = module.render();
        }

        // Initialize event listeners and logic
        if (typeof module.init === 'function') {
            module.init(workspace, actionsContainer);
        }

    } catch (error) {
        console.error(`Failed to load tool module: ${toolId}`, error);
        document.getElementById('workspace').innerHTML = `
            <div style="color: var(--status-error); text-align: center; margin-top: 2rem;">
                <h3>Error loading module</h3>
                <p>${error.message}</p>
            </div>
        `;
        showToast('Failed to load tool', 'error');
    }
}

/**
 * Setup the Command Palette (Spotlight Search) logic
 */
function setupCommandPalette() {
    const overlay = document.getElementById('commandPaletteOverlay');
    const input = document.getElementById('commandSearchInput');
    const resultsContainer = document.getElementById('commandResults');
    let activeIndex = -1;
    let filteredTools = [];

    const togglePalette = (show) => {
        overlay.style.display = show ? 'flex' : 'none';
        if (show) {
            input.value = '';
            input.focus();
            renderResults('');
        }
    };

    const renderResults = (query) => {
        const normalizedQuery = query.toLowerCase().trim();
        filteredTools = Object.entries(toolsRegistry)
            .filter(([id, data]) =>
                data.title.toLowerCase().includes(normalizedQuery) ||
                data.description.toLowerCase().includes(normalizedQuery)
            )
            .map(([id, data]) => ({ id, ...data }));

        resultsContainer.innerHTML = filteredTools.map((tool, index) => `
            <div class="command-result-item ${index === 0 ? 'active' : ''}" data-tool-id="${tool.id}" data-index="${index}">
                ${tool.icon}
                <div class="command-result-info">
                    <span class="command-result-title">${tool.title}</span>
                    <span class="command-result-description">${tool.description}</span>
                </div>
            </div>
        `).join('');

        activeIndex = filteredTools.length > 0 ? 0 : -1;
    };

    const navigate = (direction) => {
        if (filteredTools.length === 0) return;

        const items = resultsContainer.querySelectorAll('.command-result-item');
        items[activeIndex]?.classList.remove('active');

        activeIndex = (activeIndex + direction + filteredTools.length) % filteredTools.length;

        const activeItem = items[activeIndex];
        activeItem.classList.add('active');
        activeItem.scrollIntoView({ block: 'nearest' });
    };

    const selectTool = (toolId) => {
        if (!toolId) return;

        // Update sidebar UI
        const navItems = document.querySelectorAll('.nav-item');
        navItems.forEach(nav => {
            nav.classList.toggle('active', nav.dataset.tool === toolId);
        });

        loadTool(toolId);
        togglePalette(false);
    };

    // Keyboard shortcut (Cmd + K or Ctrl + K)
    window.addEventListener('keydown', (e) => {
        if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
            e.preventDefault();
            togglePalette(overlay.style.display !== 'flex');
        }

        if (overlay.style.display === 'flex') {
            if (e.key === 'Escape') {
                togglePalette(false);
            } else if (e.key === 'ArrowDown') {
                e.preventDefault();
                navigate(1);
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                navigate(-1);
            } else if (e.key === 'Enter') {
                e.preventDefault();
                if (activeIndex >= 0) {
                    selectTool(filteredTools[activeIndex].id);
                }
            }
        }
    });

    // Input events
    input.addEventListener('input', (e) => renderResults(e.target.value));

    // Click events
    resultsContainer.addEventListener('click', (e) => {
        const item = e.target.closest('.command-result-item');
        if (item) {
            selectTool(item.dataset.toolId);
        }
    });

    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) togglePalette(false);
    });
}

// Boot application when DOM is ready
document.addEventListener('DOMContentLoaded', initApp);
