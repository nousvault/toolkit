import { copyToClipboard, showToast, syntaxHighlight } from '../utils.js';

let editorInput = null;
let editorOutput = null;

export function render() {
    return `
        <div class="tool-grid-2">
            <!-- Input Pane -->
            <div class="pane">
                <div class="pane-header">
                    <h3>Input JSON</h3>
                    <div style="height: 32px; width: 32px;"></div> <!-- Match button height -->
                </div>
                <div class="editor-container">
                    <textarea id="jsonInput" class="editor-textarea" placeholder="Paste JSON here..."></textarea>
                </div>
            </div>

            <!-- Output Pane -->
            <div class="pane">
                <div class="pane-header">
                    <h3>Formatted Output</h3>
                    <button class="btn btn-secondary btn-icon" id="btnCopyJson">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
                        Copy
                    </button>
                </div>
                <div class="editor-container" style="display: flex; flex-direction: column;">
                    <div id="jsonErrorContainer" style="display: none; padding: var(--spacing-md); background: var(--status-error-bg); border-bottom: 1px solid var(--status-error); color: var(--status-error); font-family: var(--font-mono); font-size: 0.85rem; line-height: 1.5;"></div>
                    <pre class="editor-textarea output-display" id="jsonOutput" style="flex: 1; margin: 0;"></pre>
                </div>
            </div>
        </div>
    `;
}

export function init(workspace, actionsContainer) {
    editorInput = workspace.querySelector('#jsonInput');
    editorOutput = workspace.querySelector('#jsonOutput');
    const statusEl = workspace.querySelector('#jsonValidationStatus');
    const copyBtn = workspace.querySelector('#btnCopyJson');

    const errorContainer = workspace.querySelector('#jsonErrorContainer');

    // Setup actions (Clear button)
    actionsContainer.innerHTML = `
        <button class="btn btn-secondary" id="btnClearJson" style="display: flex; align-items: center; justify-content: center; gap: 8px; white-space: nowrap; color: var(--status-error); border-color: var(--status-error); background: var(--bg-main);">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
            Clear All
        </button>
    `;

    // format function
    const formatJSON = () => {
        const raw = editorInput.value.trim();
        if (!raw) {
            editorOutput.textContent = '';
            errorContainer.style.display = 'none';
            editorInput.style.borderColor = 'var(--border-strong)';
            return;
        }

        try {
            const parsed = JSON.parse(raw);
            const formatted = JSON.stringify(parsed, null, 2);
            editorOutput.innerHTML = syntaxHighlight(formatted);

            // Valid State
            errorContainer.style.display = 'none';
            editorInput.style.borderColor = 'var(--status-success)';
        } catch (error) {
            // Invalid State
            editorOutput.textContent = '';
            errorContainer.style.display = 'flex';
            errorContainer.style.flexDirection = 'column';

            let snippet = '';
            const match = error.message.match(/position (\d+)/);
            if (match) {
                const pos = parseInt(match[1], 10);
                const start = Math.max(0, pos - 40);
                const end = Math.min(raw.length, pos + 40);

                const before = raw.substring(start, pos).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
                const char = raw.substring(pos, pos + 1).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;') || ' ';
                const after = raw.substring(pos + 1, end).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

                const prefix = start > 0 ? '...' : '';
                const suffix = end < raw.length ? '...' : '';

                snippet = `
                    <div style="margin-top: var(--spacing-sm); padding: var(--spacing-sm) var(--spacing-md); background: rgba(0,0,0,0.3); border-radius: var(--radius-sm); overflow-x: auto; white-space: pre-wrap; word-break: break-all; color: var(--text-secondary);">
                        ${prefix}${before}<span style="color: var(--text-primary); background: rgba(218, 30, 40, 0.4); border-radius: 2px;">${char}</span>${after}${suffix}
                    </div>
                `;
            }

            errorContainer.innerHTML = `
                <div style="display: flex; align-items: flex-start;">
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" style="margin-right: 8px; flex-shrink: 0; margin-top: 2px;">
                        <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                    </svg> 
                    <span>${error.message}</span>
                </div>
                ${snippet}
            `;
            editorInput.style.borderColor = 'var(--status-error)';
        }
    };

    // Listeners
    editorInput.addEventListener('input', formatJSON);

    copyBtn.addEventListener('click', () => {
        const text = editorOutput.textContent;
        if (text) copyToClipboard(text);
        else showToast('Nothing to copy', 'error');
    });

    document.getElementById('btnClearJson').addEventListener('click', () => {
        editorInput.value = '';
        formatJSON();
    });
}
