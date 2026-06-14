import { copyToClipboard, showToast } from '../utils.js';

export function render() {
    return `
        <style>
            .uuid-container {
                max-width: 800px;
                margin: 0 auto;
                width: 100%;
                display: flex;
                flex-direction: column;
                gap: var(--spacing-lg);
            }

            .uuid-controls {
                display: grid;
                grid-template-columns: 1fr 120px;
                gap: var(--spacing-md);
                background: var(--bg-surface);
                padding: var(--spacing-lg);
                border-radius: var(--radius-md);
                border: 1px solid var(--border-strong);
            }

            .uuid-list {
                display: flex;
                flex-direction: column;
                gap: 8px;
                max-height: 500px;
                overflow-y: auto;
                padding: 4px;
            }

            .uuid-item {
                display: flex;
                align-items: center;
                gap: 12px;
                background: var(--bg-surface);
                border: 1px solid var(--border-subtle);
                border-radius: var(--radius-sm);
                padding: 8px 12px;
                transition: all var(--transition-fast);
            }

            .uuid-item:hover {
                border-color: var(--brand-primary);
                background: var(--bg-elevated);
            }

            .uuid-text {
                flex: 1;
                font-family: var(--font-mono);
                font-size: 0.95rem;
                color: var(--text-primary);
                user-select: text;
            }

            .uuid-item .btn-copy-small {
                padding: 4px;
                border-radius: 4px;
                background: transparent;
                border: none;
                color: var(--text-secondary);
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: color 0.2s;
            }

            .uuid-item .btn-copy-small:hover {
                color: var(--brand-primary);
            }
        </style>

        <div class="uuid-container">
            <div class="uuid-controls">
                <div class="input-group" style="margin-bottom: 0;">
                    <label class="input-label">UUID Version</label>
                    <select id="uuidVersion" class="editor-textarea" style="height: 42px; padding: 0 12px; font-family: var(--font-mono); border: 1px solid var(--border-strong);">
                        <option value="4ts">v4 (Timestamp-first / Ordered)</option>
                        <option value="7">v7 (IETF Standard Ordered)</option>
                        <option value="1">v1 (Host-Timestamp based)</option>
                        <option value="4">v4 (Pure Random)</option>
                    </select>
                </div>
                <div class="input-group" style="margin-bottom: 0;">
                    <label class="input-label">Count</label>
                    <input type="number" id="uuidCount" value="1" min="1" max="500" style="height: 42px;">
                </div>
            </div>

            <button class="btn btn-primary" id="btnGenerateUuid" style="width: 100%; padding: var(--spacing-md); font-weight: 600;">
                Generate UUIDs
            </button>

            <div id="uuidList" class="uuid-list">
                <!-- Generated UUIDs will appear here -->
            </div>
        </div>
    `;
}

export function init(workspace, actionsContainer) {
    const uuidList = workspace.querySelector('#uuidList');
    const uuidVersion = workspace.querySelector('#uuidVersion');
    const uuidCount = workspace.querySelector('#uuidCount');
    const btnGenerateUuid = workspace.querySelector('#btnGenerateUuid');

    const generateId = () => {
        const v = uuidVersion.value;
        if (v === '1') return generateUuidV1();
        if (v === '7') return generateUuidV7();
        if (v === '4ts') return generateUuidV4Timestamp();
        return generateUuidV4();
    };

    const generateBatch = () => {
        const count = Math.min(parseInt(uuidCount.value) || 1, 500);
        uuidList.innerHTML = '';

        const fragment = document.createDocumentFragment();
        for (let i = 0; i < count; i++) {
            const uuid = generateId();
            const item = document.createElement('div');
            item.className = 'uuid-item';
            item.innerHTML = `
                <span class="uuid-text">${uuid}</span>
                <button class="btn-copy-small" title="Copy to clipboard">
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
                </button>
            `;

            item.querySelector('.btn-copy-small').onclick = () => {
                copyToClipboard(uuid);
            };

            fragment.appendChild(item);
        }
        uuidList.appendChild(fragment);
    };

    // Actions
    actionsContainer.innerHTML = `
        <button class="btn btn-secondary btn-icon" id="btnCopyAllUuids">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
            Copy All
        </button>
    `;

    actionsContainer.querySelector('#btnCopyAllUuids').onclick = () => {
        const uuids = Array.from(uuidList.querySelectorAll('.uuid-text')).map(el => el.textContent).join('\n');
        if (uuids) {
            copyToClipboard(uuids);
            showToast(`Copied ${uuids.split('\n').length} UUIDs`);
        }
    };

    btnGenerateUuid.onclick = generateBatch;
    uuidVersion.onchange = generateBatch;

    generateBatch();
}

// UUID Generation Logic (Keep unchanged from previous version)
function _randomHexBytes(count) {
    let h = '';
    for (let i = 0; i < count; i++) {
        h += Math.floor(Math.random() * 256).toString(16).padStart(2, '0');
    }
    return h;
}

function generateUuidV1() {
    const timestamp = Date.now() * 10000 + 12219292800000000;
    let tHi = Math.floor(timestamp / 0x100000000);
    let tLo = timestamp % 0x100000000;
    let timeLow = tLo.toString(16).padStart(8, '0');
    let timeMid = (tHi & 0xffff).toString(16).padStart(4, '0');
    let timeHiAndVersion = ((tHi >>> 16 & 0x0fff) | 0x1000).toString(16).padStart(4, '0');
    let clockSeqHiAndReserved = ((Math.floor(Math.random() * 0x3f)) | 0x80).toString(16).padStart(2, '0');
    let clockSeqLow = _randomHexBytes(1);
    let node = _randomHexBytes(6);
    return `${timeLow}-${timeMid}-${timeHiAndVersion}-${clockSeqHiAndReserved}${clockSeqLow}-${node}`;
}

function generateUuidV4() {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID();
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

function generateUuidV7() {
    const timestamp = Date.now();
    const timeHex = timestamp.toString(16).padStart(12, '0');
    const randA = Math.floor(Math.random() * 0x0fff).toString(16).padStart(3, '0');
    const randB = _randomHexBytes(8);
    const verRandA = `7${randA}`;
    const varRandB = (parseInt(randB.substring(0, 2), 16) & 0x3f | 0x80).toString(16).padStart(2, '0') + randB.substring(2);
    return `${timeHex.substring(0, 8)}-${timeHex.substring(8, 12)}-${verRandA}-${varRandB.substring(0, 4)}-${varRandB.substring(4)}`;
}

function generateUuidV4Timestamp() {
    const timestamp = Date.now();
    const timeHex = timestamp.toString(16).padStart(12, '0');
    const randA = Math.floor(Math.random() * 0x0fff).toString(16).padStart(3, '0');
    const randB = _randomHexBytes(8);
    const verRandA = `4${randA}`;
    const varRandB = (parseInt(randB.substring(0, 2), 16) & 0x3f | 0x80).toString(16).padStart(2, '0') + randB.substring(2);
    return `${timeHex.substring(0, 8)}-${timeHex.substring(8, 12)}-${verRandA}-${varRandB.substring(0, 4)}-${varRandB.substring(4)}`;
}
