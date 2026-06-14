import { copyToClipboard, showToast, syntaxHighlight, debounce, getCursorPosition, setCursorPosition } from '../utils.js';

export function render() {
    return `
        <style>
            .jwt-container {
                display: flex;
                flex-direction: column;
                height: 100%;
                gap: var(--spacing-lg);
            }

            .jwt-split-view {
                display: flex;
                flex: 1;
                gap: var(--spacing-lg);
                min-height: 0;
            }

            .jwt-pane {
                flex: 1;
                display: flex;
                flex-direction: column;
                background: var(--bg-surface);
                border: 1px solid var(--border-strong);
                border-radius: var(--radius-sm);
                overflow: hidden;
            }

            .jwt-pane-header {
                padding: var(--spacing-sm) var(--spacing-md);
                background: var(--bg-elevated);
                border-bottom: 1px solid var(--border-subtle);
                font-size: 0.85rem;
                font-weight: 600;
                display: flex;
                justify-content: space-between;
                align-items: center;
                min-height: 40px;
            }

            .jwt-editor-area {
                flex: 1;
                position: relative;
                display: flex;
                overflow: hidden;
            }

            .jwt-textarea {
                width: 100%;
                height: 100%;
                border: none;
                resize: none;
                background: transparent;
                color: var(--text-primary);
                padding: var(--spacing-md);
                font-family: var(--font-mono);
                font-size: 0.9rem;
                outline: none;
                line-height: 1.6;
                word-break: break-all;
            }

            .jwt-display {
                width: 100%;
                height: 100%;
                padding: var(--spacing-md);
                font-family: var(--font-mono);
                font-size: 0.9rem;
                line-height: 1.6;
                overflow-y: auto;
                white-space: pre-wrap;
                word-break: break-all;
                background: transparent;
                outline: none;
                border: none;
                color: var(--text-primary);
                cursor: text;
            }

            .jwt-display:empty::before {
                content: attr(placeholder);
                color: var(--text-placeholder);
            }

            .jwt-section-title {
                font-size: 0.75rem;
                text-transform: uppercase;
                letter-spacing: 0.05em;
                color: var(--text-placeholder);
                padding: var(--spacing-xs) var(--spacing-md);
                background: var(--bg-base);
                border-bottom: 1px solid var(--border-subtle);
                display: flex;
                justify-content: space-between;
                align-items: center;
            }

            .jwt-error-banner {
                background: var(--status-error-bg);
                color: var(--status-error);
                padding: var(--spacing-sm) var(--spacing-md);
                font-size: 0.8rem;
                border-top: 1px solid var(--status-error);
                display: none;
            }

            .jwt-signature-area {
                background: var(--bg-base);
                padding: var(--spacing-md);
                border-top: 1px solid var(--border-subtle);
            }

            .jwt-input-group {
                display: flex;
                flex-direction: column;
                gap: 8px;
            }

            .jwt-input-group label {
                font-size: 0.75rem;
                color: var(--text-secondary);
                font-weight: 600;
            }

            .jwt-field {
                background: var(--bg-surface);
                border: 1px solid var(--border-strong);
                border-radius: var(--radius-sm);
                padding: 8px 12px;
                color: var(--text-primary);
                font-family: var(--font-mono);
                font-size: 0.85rem;
                width: 100%;
            }

            .jwt-field:focus {
                outline: none;
                border-color: var(--brand-primary);
            }

            .jwt-status-badge {
                padding: 2px 8px;
                border-radius: 10px;
                font-size: 0.7rem;
                font-weight: 700;
            }
            .badge-valid { background: rgba(36, 161, 72, 0.2); color: #42be65; }
            .badge-invalid { background: rgba(218, 30, 40, 0.2); color: #ff8389; }

        </style>

        <div class="jwt-container">
            <div class="jwt-split-view">
                <!-- Left: Encoded -->
                <div class="jwt-pane">
                    <div class="jwt-pane-header">
                        <span>Encoded (JWT)</span>
                        <button class="btn btn-secondary btn-icon" id="btnPasteJwt">
                             <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1" ry="1"/></svg>
                             Paste
                        </button>
                    </div>
                    <div class="jwt-editor-area">
                        <textarea id="jwtInput" class="jwt-textarea" placeholder="Paste your JWT here..."></textarea>
                    </div>
                    <div id="jwtError" class="jwt-error-banner"></div>
                </div>

                <!-- Right: Decoded -->
                <div class="jwt-pane" style="flex: 1.2;">
                    <div class="jwt-pane-header">
                        <span>Decoded</span>
                        <div id="jwtStatus" class="jwt-status-badge badge-valid" style="display: none;">Verified</div>
                    </div>
                    
                    <div class="jwt-section-title">Header</div>
                    <div class="jwt-editor-area" style="flex: 0.3; min-height: 80px;">
                        <pre id="jwtHeader" class="jwt-display" contenteditable="true" spellcheck="false" placeholder="Header JSON"></pre>
                    </div>

                    <div class="jwt-section-title">Payload</div>
                    <div class="jwt-editor-area" style="flex: 0.7;">
                        <pre id="jwtPayload" class="jwt-display" contenteditable="true" spellcheck="false" placeholder="Payload JSON"></pre>
                    </div>

                    <div class="jwt-section-title">Signature / Verify</div>
                    <div class="jwt-signature-area">
                        <div class="jwt-input-group">
                            <label>HMAC Secret (HS256)</label>
                            <input type="text" id="jwtSecret" class="jwt-field" placeholder="your-256-bit-secret" value="secret">
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

export function init(workspace, actionsContainer) {
    const jwtInput = workspace.querySelector('#jwtInput');
    const jwtHeader = workspace.querySelector('#jwtHeader');
    const jwtPayload = workspace.querySelector('#jwtPayload');
    const jwtSecret = workspace.querySelector('#jwtSecret');
    const jwtError = workspace.querySelector('#jwtError');
    const jwtStatus = workspace.querySelector('#jwtStatus');
    const btnPaste = workspace.querySelector('#btnPasteJwt');

    // Base64Url Utils
    function base64UrlDecode(str) {
        try {
            str = str.replace(/-/g, '+').replace(/_/g, '/');
            const pad = str.length % 4;
            if (pad) {
                if (pad === 1) return null;
                str += new Array(5 - pad).join('=');
            }
            const binary = atob(str);
            const bytes = new Uint8Array(binary.length);
            for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
            return new TextDecoder().decode(bytes);
        } catch (e) { return null; }
    }

    function base64UrlEncode(str) {
        try {
            const bytes = new TextEncoder().encode(str);
            const binary = Array.from(bytes, byte => String.fromCharCode(byte)).join('');
            const base64 = btoa(binary);
            return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
        } catch (e) { return null; }
    }

    function bufferToBase64Url(buffer) {
        const binary = Array.from(new Uint8Array(buffer), byte => String.fromCharCode(byte)).join('');
        return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
    }

    // HS256 Signing
    async function signHS256(header, payload, secret) {
        const encoder = new TextEncoder();
        const data = encoder.encode(`${header}.${payload}`);
        const keyData = encoder.encode(secret);

        const cryptoKey = await crypto.subtle.importKey(
            'raw', keyData, { name: 'HMAC', hash: 'SHA-256' },
            false, ['sign', 'verify']
        );

        const signature = await crypto.subtle.sign('HMAC', cryptoKey, data);
        return bufferToBase64Url(signature);
    }

    // State lock to prevent infinite loops during bidirectional sync
    let isUpdating = false;

    const decodeJwt = async () => {
        if (isUpdating) return;
        isUpdating = true;

        const token = jwtInput.value.trim();
        if (!token) {
            jwtHeader.innerHTML = '';
            jwtPayload.innerHTML = '';
            jwtError.style.display = 'none';
            jwtStatus.style.display = 'none';
            isUpdating = false;
            return;
        }

        const parts = token.split('.');
        if (parts.length < 2 || parts.length > 3) {
            jwtError.style.display = 'block';
            jwtError.textContent = 'Invalid JWT structure';
            jwtStatus.style.display = 'none';
            isUpdating = false;
            return;
        }

        const decodedHeader = base64UrlDecode(parts[0]);
        const decodedPayload = base64UrlDecode(parts[1]);

        if (decodedHeader === null || decodedPayload === null) {
            jwtError.style.display = 'block';
            jwtError.textContent = 'Encoding error';
            isUpdating = false;
            return;
        }

        try {
            const hObj = JSON.parse(decodedHeader);
            const pObj = JSON.parse(decodedPayload);
            jwtHeader.innerHTML = syntaxHighlight(JSON.stringify(hObj, null, 2));
            jwtPayload.innerHTML = syntaxHighlight(JSON.stringify(pObj, null, 2));
            jwtError.style.display = 'none';

            // Verify signature if exists
            if (parts.length === 3) {
                const computed = await signHS256(parts[0], parts[1], jwtSecret.value);
                jwtStatus.style.display = 'block';
                if (computed === parts[2]) {
                    jwtStatus.textContent = 'VERIFIED (HS256)';
                    jwtStatus.className = 'jwt-status-badge badge-valid';
                } else {
                    jwtStatus.textContent = 'INVALID SIGNATURE';
                    jwtStatus.className = 'jwt-status-badge badge-invalid';
                }
            } else {
                jwtStatus.style.display = 'none';
            }
        } catch (e) {
            jwtError.style.display = 'block';
            jwtError.textContent = 'JSON Parse Error';
            jwtHeader.textContent = decodedHeader;
            jwtPayload.textContent = decodedPayload;
        }
        isUpdating = false;
    };

    const encodeJwt = async () => {
        if (isUpdating) return;
        isUpdating = true;

        try {
            // Get plain text from highlight spans
            const h = JSON.stringify(JSON.parse(jwtHeader.innerText));
            const p = JSON.stringify(JSON.parse(jwtPayload.innerText));

            const eh = base64UrlEncode(h);
            const ep = base64UrlEncode(p);

            const sig = await signHS256(eh, ep, jwtSecret.value);

            jwtInput.value = `${eh}.${ep}.${sig}`;
            jwtError.style.display = 'none';

            jwtStatus.style.display = 'block';
            jwtStatus.textContent = 'VERIFIED';
            jwtStatus.className = 'jwt-status-badge badge-valid';
        } catch (e) {
            // Wait for valid JSON
        }
        isUpdating = false;
    };

    // Debounced highlight to prevent cursor jumping
    const highlightOnIdle = debounce(async (el) => {
        if (isUpdating) return;
        try {
            const json = JSON.parse(el.innerText);
            const pos = getCursorPosition(el);
            el.innerHTML = syntaxHighlight(JSON.stringify(json, null, 2));
            setCursorPosition(el, pos);
        } catch (e) { }
    }, 1000);

    // Helper functions for cursor position preservation
    function getCursorPosition(parent) {
        const selection = window.getSelection();
        if (selection.rangeCount === 0) return 0;
        const range = selection.getRangeAt(0);
        const preCaretRange = range.cloneRange();
        preCaretRange.selectNodeContents(parent);
        preCaretRange.setEnd(range.endContainer, range.endOffset);
        return preCaretRange.toString().length;
    }

    function setCursorPosition(parent, offset) {
        let currentOffset = 0;
        const range = document.createRange();
        const selection = window.getSelection();

        function traverse(node) {
            if (node.nodeType === 3) { // Text node
                const len = node.textContent.length;
                if (currentOffset + len >= offset) {
                    range.setStart(node, offset - currentOffset);
                    range.setEnd(node, offset - currentOffset);
                    return true;
                }
                currentOffset += len;
            } else {
                for (let i = 0; i < node.childNodes.length; i++) {
                    if (traverse(node.childNodes[i])) return true;
                }
            }
            return false;
        }

        traverse(parent);
        selection.removeAllRanges();
        selection.addRange(range);
    }

    jwtInput.addEventListener('input', decodeJwt);

    // Handle input on contenteditable
    [jwtHeader, jwtPayload].forEach(el => {
        el.addEventListener('input', () => {
            const pos = getCursorPosition(el); // Store cursor position before update
            encodeJwt();
            highlightOnIdle(el);
            setCursorPosition(el, pos); // Restore cursor position after update
        });
    });

    jwtSecret.addEventListener('input', encodeJwt);

    btnPaste.addEventListener('click', async () => {
        try {
            const text = await navigator.clipboard.readText();
            jwtInput.value = text;
            decodeJwt();
        } catch (err) {
            showToast('Permission denied', 'error');
        }
    });

    // Actions
    actionsContainer.innerHTML = `
        <button class="btn btn-secondary btn-icon" id="btnCopyJwt">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
            Copy Token
        </button>
        <button class="btn btn-secondary" id="btnClearJwt" style="display: flex; align-items: center; justify-content: center; gap: 8px; white-space: nowrap; color: var(--status-error); border-color: var(--status-error); background: var(--bg-main);">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
            Clear All
        </button>
    `;

    actionsContainer.querySelector('#btnCopyJwt').addEventListener('click', () => {
        if (!jwtInput.value) return showToast('Nothing to copy', 'error');
        copyToClipboard(jwtInput.value);
        showToast('Copied JWT Token');
    });

    actionsContainer.querySelector('#btnClearJwt').addEventListener('click', () => {
        jwtInput.value = '';
        jwtHeader.innerHTML = '';
        jwtPayload.innerHTML = '';
        jwtStatus.style.display = 'none';
        jwtError.style.display = 'none';
    });
}
