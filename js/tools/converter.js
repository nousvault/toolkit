import { copyToClipboard, showToast, setupFileUpload, syntaxHighlight, debounce, getCursorPosition, setCursorPosition } from '../utils.js';

let csvInput = null;
let jsonInput = null;

export function render() {
    return `
        <style>
            .json-display {
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
            .json-display:empty::before {
                content: attr(placeholder);
                color: var(--text-placeholder);
            }
        </style>
        <div class="tool-grid-2">
            <!-- CSV Pane -->
            <div class="pane">
                <div class="pane-header">
                    <h3>CSV</h3>
                    <div style="display: flex; gap: var(--spacing-sm); min-height: 32px; align-items: center;">
                        <label class="btn btn-secondary btn-icon" style="cursor: pointer;">
                            <input type="file" id="csvFileInput" accept=".csv" style="display: none;">
                            <svg viewBox="0 0 24 24" fill="none" class="swap-icon" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                            Open
                        </label>
                        <button class="btn btn-secondary btn-icon" id="btnCopyCsv">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
                            Copy
                        </button>
                    </div>
                </div>
                <div class="editor-container" id="csvDropArea">
                    <textarea id="csvConverterInput" class="editor-textarea" placeholder="Paste CSV or drag & drop..."></textarea>
                </div>
                <button class="btn btn-primary" id="btnConvertCsvToJson" style="margin-top: var(--spacing-sm); display: flex; align-items: center; justify-content: center; gap: 8px;">
                    Convert to JSON
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
                </button>
            </div>

            <!-- JSON Pane -->
            <div class="pane">
                <div class="pane-header">
                    <h3>JSON</h3>
                    <div style="display: flex; gap: var(--spacing-sm); min-height: 32px; align-items: center;">
                        <label class="btn btn-secondary btn-icon" style="cursor: pointer;">
                            <input type="file" id="jsonFileInputConv" accept=".json" style="display: none;">
                            <svg viewBox="0 0 24 24" fill="none" class="swap-icon" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                            Open
                        </label>
                        <button class="btn btn-secondary btn-icon" id="btnCopyConvJson">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
                            Copy
                        </button>
                    </div>
                </div>
                <div class="editor-container" id="jsonDropAreaConv">
                    <pre id="jsonConverterInput" class="json-display" contenteditable="true" spellcheck="false" placeholder="Paste JSON array or drag & drop..."></pre>
                </div>
                <button class="btn btn-primary" id="btnConvertJsonToCsv" style="margin-top: var(--spacing-sm); display: flex; align-items: center; justify-content: center; gap: 8px;">
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
                    Convert to CSV
                </button>
            </div>
        </div>
    `;
}

export function init(workspace, actionsContainer) {
    csvInput = workspace.querySelector('#csvConverterInput');
    jsonInput = workspace.querySelector('#jsonConverterInput');

    // Clear actions
    actionsContainer.innerHTML = `
        <button class="btn btn-secondary" id="btnClearConverter" style="display: flex; align-items: center; justify-content: center; gap: 8px; white-space: nowrap; color: var(--status-error); border-color: var(--status-error); background: var(--bg-main);">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" class="swap-icon" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
            Clear All
        </button>
    `;

    // CSV to JSON logic
    const csvToJson = () => {
        try {
            const csv = csvInput.value.trim();
            if (!csv) return;

            const lines = csv.split(/\r?\n/).filter(l => l.trim().length > 0);
            if (lines.length === 0) return;

            const headers = parseCSVLine(lines[0]);
            const result = [];
            for (let i = 1; i < lines.length; i++) {
                const values = parseCSVLine(lines[i]);
                const obj = {};
                for (let j = 0; j < headers.length; j++) {
                    const header = headers[j] ? headers[j].trim() : `Column_${j + 1}`;
                    const val = values[j] !== undefined ? String(values[j]).trim() : '';
                    if (header) {
                        obj[header] = val;
                    }
                }
                if (Object.keys(obj).length > 0) result.push(obj);
            }

            jsonInput.innerHTML = syntaxHighlight(JSON.stringify(result, null, 2));
            showToast('Converted CSV to JSON successfully', 'success');
        } catch (error) {
            console.error(error);
            showToast('Invalid CSV format', 'error');
        }
    };

    // JSON to CSV logic
    const jsonToCsv = () => {
        try {
            const raw = jsonInput.innerText.trim();
            if (!raw) return;

            const data = JSON.parse(raw);
            if (!Array.isArray(data) || data.length === 0) {
                showToast('JSON must be a non-empty array of objects', 'error');
                return;
            }

            const headers = Object.keys(data[0]);
            const lines = [headers.join(',')];

            for (const item of data) {
                const values = headers.map(header => {
                    let val = item[header];
                    if (val === null || val === undefined) val = '';
                    val = String(val);
                    if (val.includes(',') || val.includes('"')) {
                        val = `"${val.replace(/"/g, '""')}"`;
                    }
                    return val;
                });
                lines.push(values.join(','));
            }
            csvInput.value = lines.join('\n');
            showToast('Converted JSON to CSV successfully', 'success');

        } catch (error) {
            console.error(error);
            showToast('Invalid JSON format', 'error');
        }
    };

    const highlightOnIdle = debounce(() => {
        try {
            const text = jsonInput.innerText.trim();
            if (!text) return;
            const json = JSON.parse(text);
            const pos = getCursorPosition(jsonInput);
            jsonInput.innerHTML = syntaxHighlight(JSON.stringify(json, null, 2));
            setCursorPosition(jsonInput, pos);
        } catch (e) { }
    }, 1000);

    // Button listeners
    workspace.querySelector('#btnConvertCsvToJson').addEventListener('click', csvToJson);
    workspace.querySelector('#btnConvertJsonToCsv').addEventListener('click', jsonToCsv);

    jsonInput.addEventListener('input', highlightOnIdle);

    workspace.querySelector('#btnCopyCsv').addEventListener('click', () => {
        if (csvInput.value) copyToClipboard(csvInput.value);
    });

    workspace.querySelector('#btnCopyConvJson').addEventListener('click', () => {
        if (jsonInput.innerText) copyToClipboard(jsonInput.innerText);
    });

    document.getElementById('btnClearConverter').addEventListener('click', () => {
        csvInput.value = '';
        jsonInput.innerHTML = '';
    });

    // File Upload Setup
    const setupFile = (inputId, isCsv) => {
        const fileIn = workspace.querySelector(inputId);
        if (!fileIn) return;
        fileIn.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = (ev) => {
                const content = ev.target.result;
                if (isCsv) {
                    csvInput.value = content;
                    csvToJson();
                } else {
                    jsonInput.innerHTML = syntaxHighlight(content);
                    jsonToCsv();
                }
            };
            reader.readAsText(file);
            fileIn.value = '';
        });
    };

    setupFile('#csvFileInput', true);
    setupFile('#jsonFileInputConv', false);

    setupFileUpload(workspace.querySelector('#csvDropArea'), null, (c) => { csvInput.value = c; csvToJson(); });
    setupFileUpload(workspace.querySelector('#jsonDropAreaConv'), null, (c) => {
        try {
            jsonInput.innerHTML = syntaxHighlight(JSON.parse(c));
        } catch (e) {
            jsonInput.textContent = c;
        }
        jsonToCsv();
    });
}

function parseCSVLine(line) {
    const result = [];
    let inQuotes = false;
    let currentValue = '';
    for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"') inQuotes = !inQuotes;
        else if (char === ',' && !inQuotes) {
            result.push(currentValue.trim());
            currentValue = '';
        } else currentValue += char;
    }
    result.push(currentValue.trim());
    return result;
}
