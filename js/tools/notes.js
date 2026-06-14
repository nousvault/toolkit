import { showToast, copyToClipboard, syntaxHighlight } from '../utils.js';

let workspaceData = {
    tabs: [
        { id: 'tab-1', name: 'Tab 1', notes: [], zoom: 1, panX: 0, panY: 0 }
    ],
    activeTabId: 'tab-1'
};

const STORAGE_KEY = 'devtool_notes_data';
let draggedTabId = null;
const historyStack = [];
let searchMatches = [];
let currentSearchIndex = -1;
let lastMouseWorkspacePos = { x: 0, y: 0 };

export function render() {
    return `
        <div class="notes-container">
            <div class="notes-tabs" id="notesTabs">
                <!-- Tabs will be injected here -->
                <button class="notes-tab-add" id="addTabBtn" title="Add new tab">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 14px; height: 14px;">
                        <line x1="12" y1="5" x2="12" y2="19"></line>
                        <line x1="5" y1="12" x2="19" y2="12"></line>
                    </svg>
                </button>
            </div>
            <div class="notes-canvas" id="notesCanvas">
                <!-- ... existing search and layers ... -->
                <div class="notes-search-bar" id="notesSearchBar" style="display: none;">
                    <div class="search-input-group">
                        <input type="text" id="noteSearchInput" placeholder="Search notes...">
                        <span id="searchMatchCounter">0/0</span>
                    </div>
                    <div class="search-nav-btns">
                        <button id="searchPrevBtn" title="Previous match">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <polyline points="18 15 12 9 6 15"></polyline>
                            </svg>
                        </button>
                        <button id="searchNextBtn" title="Next match">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <polyline points="6 9 12 15 18 9"></polyline>
                            </svg>
                        </button>
                    </div>
                    <button class="search-close-btn" id="searchCloseBtn">&times;</button>
                </div>
                <div class="notes-transform-layer" id="notesTransformLayer">
                    <!-- Notes will be injected here -->
                </div>
                <div class="notes-minimap" id="notesMinimap" style="display: none;">
                    <div class="minimap-viewport"></div>
                    <div class="minimap-notes"></div>
                    <div class="minimap-cursor"></div>
                </div>
            </div>
        </div>
    `;
}

export function init(workspace, actionsContainer) {
    loadData();

    const addNoteBtn = document.createElement('button');
    addNoteBtn.className = 'btn btn-primary';
    addNoteBtn.innerHTML = `
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 16px; height: 16px;">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
        </svg>
        Add Note
    `;
    addNoteBtn.addEventListener('click', () => createNote());
    actionsContainer.appendChild(addNoteBtn);

    const recenterBtn = document.createElement('button');
    recenterBtn.className = 'btn btn-secondary';
    recenterBtn.innerHTML = `
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 16px; height: 16px;">
            <path d="M15 3h6v6M9 21H3v-6M21 9V3h-6M3 15v6h6M12 12m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0"></path>
        </svg>
        Re-center
    `;
    recenterBtn.addEventListener('click', () => recenterView());
    actionsContainer.appendChild(recenterBtn);

    renderTabs();
    renderNotes();
    setupCanvasInteractions();

    document.getElementById('addTabBtn').addEventListener('click', createTab);
    window.addEventListener('paste', handlePaste);
    window.addEventListener('keydown', handleGlobalKeydown);
}

function handleGlobalKeydown(e) {
    if ((e.metaKey || e.ctrlKey) && e.key === 'z') {
        if (undoLastAction()) {
            e.preventDefault();
        }
    } else if ((e.metaKey || e.ctrlKey) && e.key === 'f') {
        e.preventDefault();
        toggleSearchBar();
    }
}

function toggleSearchBar() {
    const searchBar = document.getElementById('notesSearchBar');
    const searchInput = document.getElementById('noteSearchInput');
    if (!searchBar || !searchInput) return;

    if (searchBar.style.display === 'none') {
        searchBar.style.display = 'flex';
        // Pass the existing searchInput and searchBar to setupSearchListeners
        const focusedInput = setupSearchListeners(searchInput, searchBar);
        if (focusedInput) {
            focusedInput.focus();
        }
    } else {
        closeSearchBar();
    }
}

function closeSearchBar() {
    const searchBar = document.getElementById('notesSearchBar');
    if (searchBar) searchBar.style.display = 'none';
    searchMatches = [];
    currentSearchIndex = -1;
    updateMatchCounter();
}

function setupSearchListeners(searchInput, searchBar) {
    // Remove old listeners to avoid duplicates by replacing the input element
    const newSearchInput = searchInput.cloneNode(true);
    searchInput.parentNode.replaceChild(newSearchInput, searchInput);

    newSearchInput.addEventListener('input', (e) => {
        performSearch(e.target.value);
    });

    newSearchInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            if (e.shiftKey) {
                goToPrevMatch(); // Use existing functions
            } else {
                goToNextMatch(); // Use existing functions
            }
        } else if (e.key === 'Escape') {
            toggleSearchBar(); // Use toggleSearchBar to close
        }
    });

    // Get buttons from the searchBar context
    const nextBtn = searchBar.querySelector('#searchNextBtn'); // Corrected ID
    const prevBtn = searchBar.querySelector('#searchPrevBtn'); // Corrected ID
    const closeBtn = searchBar.querySelector('#searchCloseBtn'); // Corrected ID

    if (nextBtn) nextBtn.onclick = goToNextMatch; // Use existing functions
    if (prevBtn) prevBtn.onclick = goToPrevMatch; // Use existing functions
    if (closeBtn) closeBtn.onclick = toggleSearchBar; // Use toggleSearchBar to close

    return newSearchInput; // Return the new input element for focusing
}

function performSearch(keyword) {
    searchMatches = [];
    currentSearchIndex = -1;

    if (!keyword || keyword.length < 2) {
        updateMatchCounter();
        return;
    }

    const lowerKeyword = keyword.toLowerCase();

    workspaceData.tabs.forEach(tab => {
        tab.notes.forEach(note => {
            if ((note.title && note.title.toLowerCase().includes(lowerKeyword)) ||
                (note.content && note.content.toLowerCase().includes(lowerKeyword))) {
                searchMatches.push({
                    noteId: note.id,
                    tabId: tab.id
                });
            }
        });
    });

    if (searchMatches.length > 0) {
        currentSearchIndex = 0;
        navigateToMatch(0);
    }
    updateMatchCounter();
}

function goToNextMatch() {
    if (searchMatches.length === 0) return;
    currentSearchIndex = (currentSearchIndex + 1) % searchMatches.length;
    navigateToMatch(currentSearchIndex);
    updateMatchCounter();
}

function goToPrevMatch() {
    if (searchMatches.length === 0) return;
    currentSearchIndex = (currentSearchIndex - 1 + searchMatches.length) % searchMatches.length;
    navigateToMatch(currentSearchIndex);
    updateMatchCounter();
}

function navigateToMatch(index) {
    const match = searchMatches[index];
    if (!match) return;

    if (match.tabId !== workspaceData.activeTabId) {
        switchTab(match.tabId);
    }
    focusOnNote(match.noteId, false);
}

function updateMatchCounter() {
    const counter = document.getElementById('searchMatchCounter');
    if (!counter) return;
    if (searchMatches.length === 0) {
        counter.textContent = '0/0';
    } else {
        counter.textContent = `${currentSearchIndex + 1}/${searchMatches.length}`;
    }
}

function searchNotes() {
    toggleSearchBar();
}

function focusOnNote(noteId, shouldFocusKeyboard = true) {
    const activeTab = workspaceData.tabs.find(t => t.id === workspaceData.activeTabId);
    if (!activeTab) return;

    const note = activeTab.notes.find(n => n.id === noteId);
    if (!note) return;

    const canvas = document.getElementById('notesCanvas');
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    // Reset zoom to 1 for easier locating, or keep current zoom?
    // Let's reset to 1 for clarity
    activeTab.zoom = 1;
    activeTab.panX = centerX - note.x - (note.width || 250) / 2;
    activeTab.panY = centerY - note.y - (typeof note.height === 'number' ? note.height : 200) / 2;

    applyTransform();
    saveData();

    // Highlight the note
    const noteEl = document.querySelector(`[data-id="${noteId}"]`);
    if (noteEl) {
        noteEl.classList.add('search-highlight');
        setTimeout(() => noteEl.classList.remove('search-highlight'), 2000);

        // Focus the textarea or title if it's a note
        const input = noteEl.querySelector('input, textarea');
        if (input && shouldFocusKeyboard) input.focus();
    }
}

function undoLastAction() {
    if (historyStack.length === 0) return false;
    const action = historyStack.pop();
    if (action.type === 'move') {
        const tab = workspaceData.tabs.find(t => t.id === action.tabId);
        if (tab) {
            const note = tab.notes.find(n => n.id === action.noteId);
            if (note) {
                note.x = action.fromX;
                note.y = action.fromY;
                saveData();
                renderNotes();
                showToast('Undo move', 'info');
                return true;
            }
        }
    }
    return false;
}

function setupCanvasInteractions() {
    const canvas = document.getElementById('notesCanvas');
    const layer = document.getElementById('notesTransformLayer');

    canvas.addEventListener('wheel', (e) => {
        e.preventDefault();
        const activeTab = workspaceData.tabs.find(t => t.id === workspaceData.activeTabId);
        if (!activeTab) return;

        if (e.ctrlKey || e.metaKey) {
            // Zooming (Mac Touchpad pinch is often ctrlKey + wheel)
            const zoomSpeed = 0.01;
            const delta = -e.deltaY;
            const oldZoom = activeTab.zoom || 1;
            const newZoom = Math.min(Math.max(0.1, oldZoom + delta * zoomSpeed), 5);

            const rect = canvas.getBoundingClientRect();
            const mouseX = e.clientX - rect.left;
            const mouseY = e.clientY - rect.top;

            activeTab.panX = mouseX - (mouseX - (activeTab.panX || 0)) * (newZoom / oldZoom);
            activeTab.panY = mouseY - (mouseY - (activeTab.panY || 0)) * (newZoom / oldZoom);

            activeTab.zoom = newZoom;
        } else {
            // Panning with wheel / two-finger swipe
            activeTab.panX = (activeTab.panX || 0) - e.deltaX;
            activeTab.panY = (activeTab.panY || 0) - e.deltaY;
        }

        applyTransform();
        saveData();
        updateMinimap();
    }, { passive: false });

    // Prevent Safari/Mac browser zoom on pinch
    canvas.addEventListener('gesturestart', (e) => e.preventDefault());
    canvas.addEventListener('gesturechange', (e) => e.preventDefault());
    canvas.addEventListener('gestureend', (e) => e.preventDefault());

    // Panning with drag (requires Space or Middle Click)
    let isPanning = false;
    let lastMouseX, lastMouseY;

    canvas.addEventListener('mousedown', (e) => {
        if (e.button === 1 || (e.button === 0 && e.target === canvas)) {
            isPanning = true;
            lastMouseX = e.clientX;
            lastMouseY = e.clientY;
            canvas.style.cursor = 'grabbing';
        }
    });

    window.addEventListener('mousemove', (e) => {
        if (!isPanning) return;
        const activeTab = workspaceData.tabs.find(t => t.id === workspaceData.activeTabId);
        if (!activeTab) return;

        activeTab.panX = (activeTab.panX || 0) + (e.clientX - lastMouseX);
        activeTab.panY = (activeTab.panY || 0) + (e.clientY - lastMouseY);
        lastMouseX = e.clientX;
        lastMouseY = e.clientY;

        applyTransform();
        updateMinimap();
    });

    window.addEventListener('mouseup', () => {
        if (isPanning) {
            isPanning = false;
            canvas.style.cursor = 'crosshair';
            saveData();
        }
    });

    canvas.addEventListener('mousemove', (e) => {
        const activeTab = workspaceData.tabs.find(t => t.id === workspaceData.activeTabId);
        const zoom = activeTab?.zoom || 1;
        const panX = activeTab?.panX || 0;
        const panY = activeTab?.panY || 0;
        const rect = canvas.getBoundingClientRect();

        lastMouseWorkspacePos.x = (e.clientX - rect.left - panX) / zoom;
        lastMouseWorkspacePos.y = (e.clientY - rect.top - panY) / zoom;

        updateMinimap();
    });
}

function applyTransform() {
    const layer = document.getElementById('notesTransformLayer');
    const activeTab = workspaceData.tabs.find(t => t.id === workspaceData.activeTabId);
    if (!layer || !activeTab) return;

    const zoom = activeTab.zoom || 1;
    const x = activeTab.panX || 0;
    const y = activeTab.panY || 0;

    layer.style.transform = `translate(${x}px, ${y}px) scale(${zoom})`;
}

function recenterView() {
    const activeTab = workspaceData.tabs.find(t => t.id === workspaceData.activeTabId);
    if (!activeTab) return;

    activeTab.zoom = 1;
    activeTab.panX = 0;
    activeTab.panY = 0;

    applyTransform();
    saveData();
    updateMinimap();
    showToast('View re-centered', 'info');
}

function updateMinimap() {
    const minimap = document.getElementById('notesMinimap');
    if (!minimap) return;

    const activeTab = workspaceData.tabs.find(t => t.id === workspaceData.activeTabId);
    if (!activeTab) return;

    // Show minimap only when zoomed out
    if ((activeTab.zoom || 1) >= 0.8) {
        minimap.style.display = 'none';
        return;
    }
    minimap.style.display = 'block';

    const notesLayer = minimap.querySelector('.minimap-notes');
    const viewportBox = minimap.querySelector('.minimap-viewport');
    const cursorDot = minimap.querySelector('.minimap-cursor');
    if (!notesLayer || !viewportBox || !cursorDot) return;

    notesLayer.innerHTML = '';

    // Calculate bounds of all notes, fallback to viewport if no notes
    const notes = activeTab?.notes || [];

    let minX = 0, minY = 0, maxX = 1000, maxY = 1000; // Default bounds if no notes

    if (notes.length > 0) {
        minX = Infinity; minY = Infinity; maxX = -Infinity; maxY = -Infinity;
        notes.forEach(note => {
            const x = parseFloat(note.x) || 0;
            const y = parseFloat(note.y) || 0;
            const w = parseFloat(note.width) || 250;
            const h = parseFloat(note.height) || 200;
            minX = Math.min(minX, x);
            minY = Math.min(minY, y);
            maxX = Math.max(maxX, x + w);
            maxY = Math.max(maxY, y + h);
        });
    }

    // Include current pan/viewport in bounds to ensure "you are here" is always visible
    const canvas = document.getElementById('notesCanvas');
    if (canvas) {
        const rect = canvas.getBoundingClientRect();
        const zoom = activeTab?.zoom || 1;
        const panX = activeTab?.panX || 0;
        const panY = activeTab?.panY || 0;

        const viewX = -panX / zoom;
        const viewY = -panY / zoom;
        const viewW = rect.width / zoom;
        const viewH = rect.height / zoom;

        minX = Math.min(minX, viewX);
        minY = Math.min(minY, viewY);
        maxX = Math.max(maxX, viewX + viewW);
        maxY = Math.max(maxY, viewY + viewH);
    }

    // Add some padding to bounds
    const padding = 500;
    minX -= padding;
    minY -= padding;
    maxX += padding;
    maxY += padding;

    const boundsWidth = maxX - minX;
    const boundsHeight = maxY - minY;

    // Minimap aspect ratio / size
    const miniSize = 150; // px
    const scale = miniSize / Math.max(boundsWidth, boundsHeight);

    // Render notes
    notes.forEach(note => {
        const miniNote = document.createElement('div');
        miniNote.className = `mini-note ${note.type === 'image' ? 'is-image' : ''}`;
        miniNote.style.left = `${((parseFloat(note.x) || 0) - minX) * scale}px`;
        miniNote.style.top = `${((parseFloat(note.y) || 0) - minY) * scale}px`;
        miniNote.style.width = `${((parseFloat(note.width) || 250)) * scale}px`;
        miniNote.style.height = `${((parseFloat(note.height) || 200)) * scale}px`;
        notesLayer.appendChild(miniNote);
    });

    // Render viewport
    if (canvas) {
        const rect = canvas.getBoundingClientRect();
        const zoom = activeTab.zoom || 1;
        const panX = activeTab.panX || 0;
        const panY = activeTab.panY || 0;

        const viewX = -panX / zoom;
        const viewY = -panY / zoom;
        const viewW = rect.width / zoom;
        const viewH = rect.height / zoom;

        viewportBox.style.left = `${(viewX - minX) * scale}px`;
        viewportBox.style.top = `${(viewY - minY) * scale}px`;
        viewportBox.style.width = `${viewW * scale}px`;
        viewportBox.style.height = `${viewH * scale}px`;

        // Render Cursor
        cursorDot.style.left = `${(lastMouseWorkspacePos.x - minX) * scale}px`;
        cursorDot.style.top = `${(lastMouseWorkspacePos.y - minY) * scale}px`;
    }
}

function loadData() {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
        try {
            workspaceData = JSON.parse(saved);
        } catch (e) {
            console.error('Failed to parse notes data', e);
        }
    }
}

function saveData() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(workspaceData));
}

function renderTabs() {
    const tabsContainer = document.getElementById('notesTabs');
    const addBtn = document.getElementById('addTabBtn');

    // Remove existing tabs but keep the add button
    const existingTabs = tabsContainer.querySelectorAll('.notes-tab');
    existingTabs.forEach(t => t.remove());

    workspaceData.tabs.forEach(tab => {
        const tabEl = document.createElement('div');
        tabEl.className = `notes-tab ${tab.id === workspaceData.activeTabId ? 'active' : ''}`;

        const nameSpan = document.createElement('span');
        nameSpan.textContent = tab.name;
        tabEl.appendChild(nameSpan);

        // Delete Button for Tabs
        if (workspaceData.tabs.length > 1) {
            const deleteBtn = document.createElement('button');
            deleteBtn.className = 'notes-tab-delete';
            deleteBtn.innerHTML = '&times;';
            deleteBtn.title = 'Delete tab';
            deleteBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                if (confirm(`Delete tab "${tab.name}"?`)) {
                    deleteTab(tab.id);
                }
            });
            tabEl.appendChild(deleteBtn);
        }

        tabEl.addEventListener('click', () => {
            if (workspaceData.activeTabId !== tab.id) {
                switchTab(tab.id);
            }
        });

        // Tab Renaming
        tabEl.addEventListener('dblclick', (e) => {
            e.stopPropagation();
            const input = document.createElement('input');
            input.type = 'text';
            input.className = 'notes-tab-input';
            input.value = tab.name;
            tabEl.innerHTML = '';
            tabEl.appendChild(input);
            input.focus();
            input.select();

            const finishRename = () => {
                const newName = input.value.trim() || tab.name;
                tab.name = newName;
                saveData();
                renderTabs();
            };

            input.addEventListener('blur', finishRename);
            input.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') finishRename();
                if (e.key === 'Escape') renderTabs();
            });
        });

        // Context menu to delete
        tabEl.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            if (workspaceData.tabs.length > 1) {
                if (confirm(`Delete tab "${tab.name}"?`)) {
                    deleteTab(tab.id);
                }
            }
        });

        // Drag and Drop implementation
        tabEl.draggable = true;

        tabEl.addEventListener('dragstart', (e) => {
            draggedTabId = tab.id;
            tabEl.classList.add('dragging-tab');
            e.dataTransfer.effectAllowed = 'move';
            // Set some data for Firefox compatibility
            e.dataTransfer.setData('text/plain', tab.id);
        });

        tabEl.addEventListener('dragover', (e) => {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'move';
            if (draggedTabId !== tab.id) {
                tabEl.classList.add('drag-over');
            }
        });

        tabEl.addEventListener('dragleave', () => {
            tabEl.classList.remove('drag-over');
        });

        tabEl.addEventListener('drop', (e) => {
            e.preventDefault();
            tabEl.classList.remove('drag-over');
            if (draggedTabId && draggedTabId !== tab.id) {
                reorderTabs(draggedTabId, tab.id);
            }
        });

        tabEl.addEventListener('dragend', () => {
            tabEl.classList.remove('dragging-tab');
            draggedTabId = null;
            // Ensure all tabs have drag-over removed (sometimes leave doesn't fire)
            document.querySelectorAll('.notes-tab').forEach(el => el.classList.remove('drag-over'));
        });

        tabsContainer.insertBefore(tabEl, addBtn);
    });
}

function reorderTabs(fromId, toId) {
    const fromIndex = workspaceData.tabs.findIndex(t => t.id === fromId);
    const toIndex = workspaceData.tabs.findIndex(t => t.id === toId);

    if (fromIndex !== -1 && toIndex !== -1) {
        const [movedTab] = workspaceData.tabs.splice(fromIndex, 1);
        workspaceData.tabs.splice(toIndex, 0, movedTab);
        saveData();
        renderTabs();
    }
}

function switchTab(tabId) {
    workspaceData.activeTabId = tabId;
    saveData();
    renderTabs();
    renderNotes();
    updateMinimap();
}

function createTab() {
    const nextId = workspaceData.tabs.length + 1;
    const newTab = {
        id: `tab-${Date.now()}`,
        name: `Tab ${nextId}`,
        notes: [],
        zoom: 1,
        panX: 0,
        panY: 0
    };
    workspaceData.tabs.push(newTab);
    workspaceData.activeTabId = newTab.id;
    saveData();
    renderTabs();
    renderNotes();
    updateMinimap();
}

function deleteTab(tabId) {
    workspaceData.tabs = workspaceData.tabs.filter(t => t.id !== tabId);
    if (workspaceData.activeTabId === tabId) {
        workspaceData.activeTabId = workspaceData.tabs[0].id;
    }
    saveData();
    renderTabs();
    renderNotes();
}

function renderNotes() {
    const layer = document.getElementById('notesTransformLayer');
    if (!layer) return;
    layer.innerHTML = '';

    const activeTab = workspaceData.tabs.find(t => t.id === workspaceData.activeTabId);
    if (!activeTab) return;

    applyTransform();

    activeTab.notes.forEach(note => {
        const noteEl = note.type === 'image' ? createImageElement(note) : createNoteElement(note);
        layer.appendChild(noteEl);
    });
    updateMinimap();
}

function createNote() {
    const activeTab = workspaceData.tabs.find(t => t.id === workspaceData.activeTabId);
    if (!activeTab) return;

    const newNote = {
        id: `note-${Date.now()}`,
        type: 'note',
        title: '',
        content: '',
        x: 50 + (activeTab.notes.length * 20) % 200,
        y: 50 + (activeTab.notes.length * 20) % 200,
        width: 250,
        height: 200,
        color: 'note-dark'
    };

    activeTab.notes.push(newNote);
    saveData();
    renderNotes();
}

function createNoteElement(note) {
    const noteEl = document.createElement('div');
    noteEl.className = `sticky-note ${note.color}`;
    noteEl.style.left = `${note.x}px`;
    noteEl.style.top = `${note.y}px`;
    noteEl.style.width = `${note.width}px`;
    noteEl.style.height = `${note.height}px`;
    noteEl.dataset.id = note.id;

    noteEl.innerHTML = `
        <div class="note-header">
            <input type="text" class="note-title" placeholder="Title..." value="${note.title || ''}">
            <div class="note-actions">
                <div class="note-copy" title="Copy to clipboard">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 14px; height: 14px;">
                        <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                    </svg>
                </div>
                <div class="note-delete" title="Delete note">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 14px; height: 14px;">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                </div>
            </div>
        </div>
        <div class="note-body">
            <div class="note-highlight-overlay"></div>
            <textarea class="note-content" placeholder="Type something...">${note.content}</textarea>
        </div>
        <div class="note-resize-handle"></div>
    `;

    const titleInput = noteEl.querySelector('.note-title');
    const textarea = noteEl.querySelector('.note-content');
    const highlightOverlay = noteEl.querySelector('.note-highlight-overlay');
    const copyBtn = noteEl.querySelector('.note-copy');
    const deleteBtn = noteEl.querySelector('.note-delete');

    // Flag to track if the note has been manually resized
    let isManuallyResized = !!(note.width || note.height);

    const updateHeight = () => {
        if (!isManuallyResized) {
            // Reset height to auto to get correct scrollHeight
            textarea.style.height = 'auto';
            const extraPadding = 32; // Header + padding
            const newHeight = Math.max(150, textarea.scrollHeight + extraPadding);
            noteEl.style.height = `${newHeight}px`;
            textarea.style.height = '100%';
        }
    };

    const updateHighlight = () => {
        const val = textarea.value;
        try {
            // Check if it looks like JSON
            if ((val.trim().startsWith('{') || val.trim().startsWith('[')) && JSON.parse(val)) {
                highlightOverlay.innerHTML = syntaxHighlight(val);
                highlightOverlay.style.visibility = 'visible';
                textarea.style.color = 'transparent';
                textarea.style.caretColor = 'var(--text-primary)';
            } else {
                throw new Error();
            }
        } catch (e) {
            highlightOverlay.style.visibility = 'hidden';
            textarea.style.color = 'inherit';
        }
        updateHeight();
    };

    updateHighlight();

    titleInput.addEventListener('input', (e) => {
        note.title = e.target.value;
        saveData();
    });

    // Stop propagation on title input so it doesn't trigger dragging
    titleInput.addEventListener('mousedown', (e) => {
        e.stopPropagation();
    });

    textarea.addEventListener('input', (e) => {
        note.content = e.target.value;
        updateHighlight();
        saveData();
    });

    textarea.addEventListener('keydown', (e) => {
        if (e.key === 'Tab') {
            e.preventDefault();
            const start = textarea.selectionStart;
            const end = textarea.selectionStart;
            const value = textarea.value;

            // Set textarea value to: text before caret + 2 spaces + text after caret
            textarea.value = value.substring(0, start) + "  " + value.substring(end);

            // Put caret at right position again
            textarea.selectionStart = textarea.selectionEnd = start + 2;

            note.content = textarea.value;
            updateHighlight();
            saveData();
        }
    });

    // Synchronize scrolling
    textarea.addEventListener('scroll', () => {
        highlightOverlay.scrollTop = textarea.scrollTop;
    });

    copyBtn.addEventListener('mousedown', (e) => {
        e.stopPropagation();
    });

    copyBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        copyToClipboard(note.content);
    });

    // Fix: Stop propagation on mousedown so header dragging doesn't start
    deleteBtn.addEventListener('mousedown', (e) => {
        e.stopPropagation();
    });

    deleteBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        deleteNote(note.id);
    });

    // Dragging Logic
    let isDragging = false;
    let startX, startY;
    let initialX, initialY;

    const startDrag = (e) => {
        // Only allow dragging if clicking the header or the main container (not the textarea or title input)
        if (e.target.tagName === 'TEXTAREA' || e.target.tagName === 'INPUT' || e.target.classList.contains('note-delete') || e.target.classList.contains('note-copy') || e.target.classList.contains('note-resize-handle')) {
            return;
        }

        const activeTab = workspaceData.tabs.find(t => t.id === workspaceData.activeTabId);
        const zoom = activeTab?.zoom || 1;
        const panX = activeTab?.panX || 0;
        const panY = activeTab?.panY || 0;
        const canvas = document.getElementById('notesCanvas');
        const rect = canvas.getBoundingClientRect();

        isDragging = true;
        noteEl.classList.add('dragging');

        // Calculate mouse position in workspace coordinates
        const mouseX = (e.clientX - rect.left - panX) / zoom;
        const mouseY = (e.clientY - rect.top - panY) / zoom;

        // Offset from note top-left in workspace coordinates
        startX = mouseX - note.x;
        startY = mouseY - note.y;

        initialX = note.x;
        initialY = note.y;

        // Move to front
        const layer = document.getElementById('notesTransformLayer');
        if (layer) layer.appendChild(noteEl);

        if (e instanceof MouseEvent) {
            document.addEventListener('mousemove', onMouseMove);
            document.addEventListener('mouseup', onMouseUp);
        } else {
            document.addEventListener('touchmove', onTouchMove, { passive: false });
            document.addEventListener('touchend', onTouchEnd);
        }
    };

    noteEl.addEventListener('mousedown', (e) => {
        // Always bring to front on click
        const layer = document.getElementById('notesTransformLayer');
        if (layer && noteEl.parentElement === layer) {
            layer.appendChild(noteEl);
        }
        startDrag(e);
    });

    noteEl.addEventListener('touchstart', (e) => {
        if (e.touches.length === 1 || e.touches.length === 3) {
            // Bring to front
            const layer = document.getElementById('notesTransformLayer');
            if (layer && noteEl.parentElement === layer) {
                layer.appendChild(noteEl);
            }
            startDrag(e.touches[0]);
            // Don't preventDefault here if touches.length === 1 to allow individual interactions, 
            // but if we're dragging, we should.
            if (isDragging) e.preventDefault();
        }
    }, { passive: false });

    function onTouchMove(e) {
        if (isDragging) {
            onMouseMove(e.touches[0]);
            e.preventDefault();
        }
    }

    function onTouchEnd() {
        onMouseUp();
        document.removeEventListener('touchmove', onTouchMove);
        document.removeEventListener('touchend', onTouchEnd);
    }

    function onMouseMove(e) {
        if (!isDragging) return;
        const activeTab = workspaceData.tabs.find(t => t.id === workspaceData.activeTabId);
        const zoom = activeTab?.zoom || 1;
        const panX = activeTab?.panX || 0;
        const panY = activeTab?.panY || 0;
        const canvas = document.getElementById('notesCanvas');
        const rect = canvas.getBoundingClientRect();

        // Workspace coordinates of the mouse
        const mouseX = (e.clientX - rect.left - panX) / zoom;
        const mouseY = (e.clientY - rect.top - panY) / zoom;

        // Apply same offset
        let newX = mouseX - startX;
        let newY = mouseY - startY;

        noteEl.style.left = `${newX}px`;
        noteEl.style.top = `${newY}px`;
        note.x = newX;
        note.y = newY;
        updateMinimap();
    }

    function onMouseUp() {
        if (!isDragging) return;
        if (note.x !== initialX || note.y !== initialY) {
            historyStack.push({
                type: 'move',
                noteId: note.id,
                tabId: workspaceData.activeTabId,
                fromX: initialX,
                fromY: initialY,
                toX: note.x,
                toY: note.y
            });
        }
        saveData();
        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseup', onMouseUp);
    }

    // Resizing Logic
    const resizer = noteEl.querySelector('.note-resize-handle');
    let isResizing = false;

    resizer.addEventListener('mousedown', (e) => {
        e.stopPropagation();
        isResizing = true;
        startX = e.clientX;
        startY = e.clientY;
        const startWidth = noteEl.clientWidth;
        const startHeight = noteEl.clientHeight;
        const activeTab = workspaceData.tabs.find(t => t.id === workspaceData.activeTabId);
        const zoom = activeTab?.zoom || 1;

        document.addEventListener('mousemove', onResizeMove);
        document.addEventListener('mouseup', onResizeUp);

        function onResizeMove(e) {
            if (!isResizing) return;
            isManuallyResized = true;
            const newWidth = Math.max(150, startWidth + (e.clientX - startX) / zoom);
            const newHeight = Math.max(150, startHeight + (e.clientY - startY) / zoom);

            noteEl.style.width = `${newWidth}px`;
            noteEl.style.height = `${newHeight}px`;
            note.width = newWidth;
            note.height = newHeight;
        }

        function onResizeUp() {
            isResizing = false;
            saveData();
            document.removeEventListener('mousemove', onResizeMove);
            document.removeEventListener('mouseup', onResizeUp);
        }
    });

    return noteEl;
}

function deleteNote(noteId) {
    const activeTab = workspaceData.tabs.find(t => t.id === workspaceData.activeTabId);
    if (!activeTab) return;

    activeTab.notes = activeTab.notes.filter(n => n.id !== noteId);
    saveData();
    renderNotes();
}

function handlePaste(e) {
    if (!document.getElementById('notesCanvas')) return;

    const items = (e.clipboardData || e.originalEvent.clipboardData).items;
    for (const item of items) {
        if (item.type.indexOf('image') !== -1) {
            const blob = item.getAsFile();
            const reader = new FileReader();
            reader.onload = (event) => {
                createImage(event.target.result);
            };
            reader.readAsDataURL(blob);
        }
    }
}

function createImage(dataUrl) {
    const activeTab = workspaceData.tabs.find(t => t.id === workspaceData.activeTabId);
    if (!activeTab) return;

    // Estimate coordinates based on current view or mouse
    const zoom = activeTab.zoom || 1;
    const x = (100 - (activeTab.panX || 0)) / zoom;
    const y = (100 - (activeTab.panY || 0)) / zoom;

    const newImage = {
        id: `img-${Date.now()}`,
        type: 'image',
        data: dataUrl,
        x: x + (activeTab.notes.length * 20) % 200,
        y: y + (activeTab.notes.length * 20) % 200,
        width: 300,
        height: 'auto'
    };

    activeTab.notes.push(newImage);
    saveData();
    renderNotes();
    showToast('Image pasted to canvas', 'success');
}

function createImageElement(img) {
    const imgEl = document.createElement('div');
    imgEl.className = 'sticky-image';
    imgEl.style.left = `${img.x}px`;
    imgEl.style.top = `${img.y}px`;
    imgEl.style.width = `${img.width}px`;
    imgEl.dataset.id = img.id;

    imgEl.innerHTML = `
        <div class="image-toolbar">
            <div class="image-copy" title="Copy image to clipboard">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 14px; height: 14px;">
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                    <path d="M5 15H4a2 2 0 0 0-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                </svg>
            </div>
            <div class="image-delete" title="Delete image">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 14px; height: 14px;">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
            </div>
        </div>
        <img src="${img.data}" class="main-img" style="width: 100%; display: block; border-radius: var(--radius-sm);">
        <div class="image-resize-handle"></div>
    `;

    const copyBtn = imgEl.querySelector('.image-copy');
    const deleteBtn = imgEl.querySelector('.image-delete');
    const resizer = imgEl.querySelector('.image-resize-handle');

    copyBtn.addEventListener('mousedown', (e) => e.stopPropagation());
    copyBtn.addEventListener('click', async (e) => {
        e.stopPropagation();
        try {
            const blob = await (await fetch(img.data)).blob();
            await navigator.clipboard.write([
                new ClipboardItem({ [blob.type]: blob })
            ]);
            showToast('Image copied to clipboard', 'success');
        } catch (err) {
            console.error('Failed to copy image', err);
            showToast('Failed to copy image', 'error');
        }
    });

    deleteBtn.addEventListener('mousedown', (e) => e.stopPropagation());
    deleteBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        deleteNote(img.id);
    });

    // Dragging Logic (Shared pattern with notes)
    let isDragging = false;
    let startX, startY;

    imgEl.addEventListener('mousedown', (e) => {
        if (e.target.closest('.image-toolbar') || e.target.classList.contains('image-resize-handle')) return;

        const activeTab = workspaceData.tabs.find(t => t.id === workspaceData.activeTabId);
        const zoom = activeTab?.zoom || 1;
        const panX = activeTab?.panX || 0;
        const panY = activeTab?.panY || 0;
        const canvas = document.getElementById('notesCanvas');
        const rect = canvas.getBoundingClientRect();

        const layer = document.getElementById('notesTransformLayer');
        if (layer) layer.appendChild(imgEl);

        isDragging = true;
        imgEl.classList.add('dragging');

        const mouseX = (e.clientX - rect.left - panX) / zoom;
        const mouseY = (e.clientY - rect.top - panY) / zoom;

        startX = mouseX - img.x;
        startY = mouseY - img.y;

        const initialX = img.x;
        const initialY = img.y;

        const onMouseMove = (e) => {
            if (!isDragging) return;
            const mouseX = (e.clientX - rect.left - panX) / zoom;
            const mouseY = (e.clientY - rect.top - panY) / zoom;

            let newX = mouseX - startX;
            let newY = mouseY - startY;

            imgEl.style.left = `${newX}px`;
            imgEl.style.top = `${newY}px`;
            img.x = newX;
            img.y = newY;
            updateMinimap();
        };

        const onMouseUp = () => {
            if (!isDragging) return;
            isDragging = false;
            imgEl.classList.remove('dragging');
            if (img.x !== initialX || img.y !== initialY) {
                historyStack.push({
                    type: 'move',
                    noteId: img.id,
                    tabId: workspaceData.activeTabId,
                    fromX: initialX,
                    fromY: initialY,
                    toX: img.x,
                    toY: img.y
                });
            }
            saveData();
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);
            document.removeEventListener('touchmove', onTouchMove);
            document.removeEventListener('touchend', onTouchEnd);
        };

        const onTouchMove = (e) => {
            if (isDragging) {
                onMouseMove(e.touches[0]);
                e.preventDefault();
            }
        };

        const onTouchEnd = () => {
            onMouseUp();
        };

        if (e instanceof MouseEvent) {
            document.addEventListener('mousemove', onMouseMove);
            document.addEventListener('mouseup', onMouseUp);
        } else {
            document.addEventListener('touchmove', onTouchMove, { passive: false });
            document.addEventListener('touchend', onTouchEnd);
        }
    });

    imgEl.addEventListener('touchstart', (e) => {
        if (e.touches.length === 1 || e.touches.length === 3) {
            const layer = document.getElementById('notesTransformLayer');
            if (layer) layer.appendChild(imgEl);
            startDrag(e.touches[0]);
            if (isDragging) e.preventDefault();
        }
    }, { passive: false });

    // Resizing Logic
    resizer.addEventListener('mousedown', (e) => {
        e.stopPropagation();
        let isResizing = true;
        let sX = e.clientX;
        const startWidth = imgEl.clientWidth;
        const activeTab = workspaceData.tabs.find(t => t.id === workspaceData.activeTabId);
        const zoom = activeTab?.zoom || 1;

        const onResizeMove = (e) => {
            if (!isResizing) return;
            const newWidth = Math.max(50, startWidth + (e.clientX - sX) / zoom);
            imgEl.style.width = `${newWidth}px`;
            img.width = newWidth;
        };

        const onResizeUp = () => {
            isResizing = false;
            saveData();
            document.removeEventListener('mousemove', onResizeMove);
            document.removeEventListener('mouseup', onResizeUp);
        };

        document.addEventListener('mousemove', onResizeMove);
        document.addEventListener('mouseup', onResizeUp);
    });

    return imgEl;
}
