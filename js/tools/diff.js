import { showToast, copyToClipboard } from '../utils.js';

export function render() {
    return `
        <style>
            .diff-layout-container {
                display: flex;
                flex-direction: column;
                height: 100%;
                gap: var(--spacing-lg);
            }

            .diff-split-view {
                display: flex;
                flex: 1;
                gap: var(--spacing-lg);
                min-height: 0; 
                position: relative;
            }

            .diff-pane-container {
                flex: 1;
                display: flex;
                flex-direction: column;
                background: var(--bg-surface);
                border: 1px solid var(--border-strong);
                border-radius: var(--radius-sm);
                overflow: hidden;
            }

            .diff-pane-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: var(--spacing-sm) var(--spacing-md);
                border-bottom: 1px solid var(--border-subtle);
                background: var(--bg-elevated);
                font-size: 0.85rem;
                font-family: var(--font-sans);
                font-weight: 600;
                min-height: 40px;
            }

            .diff-pane-header .left-title {
                display: flex;
                align-items: center;
                gap: 8px;
            }

            .diff-pane-header .right-actions {
                display: flex;
                align-items: center;
                gap: var(--spacing-md);
                color: var(--text-secondary);
                font-size: 0.8rem;
                font-weight: normal;
            }

            .btn-open-file, .btn-header-action {
                display: inline-flex;
                align-items: center;
                gap: 4px;
                cursor: pointer;
                color: var(--text-secondary);
                background: none;
                border: none;
                font-family: inherit;
                font-size: inherit;
                transition: color 0.2s;
                white-space: nowrap;
            }

            .btn-open-file:hover, .btn-header-action:hover {
                color: var(--text-primary);
            }

            .btn-open-file svg, .btn-header-action svg {
                width: 14px;
                height: 14px;
            }

            .diff-editor-area {
                flex: 1;
                position: relative;
                display: flex;
                overflow: hidden;
            }

            .diff-textarea {
                width: 100%;
                height: 100%;
                border: none;
                resize: none;
                background: transparent;
                color: var(--text-primary);
                padding: var(--spacing-md);
                font-family: var(--font-mono);
                font-size: 0.85rem;
                outline: none;
                line-height: 1.5;
            }

            .diff-output-area {
                width: 100%;
                height: 100%;
                overflow-y: auto;
                font-family: var(--font-mono);
                font-size: 0.85rem;
                line-height: 1.5;
                background: var(--bg-surface);
            }

            .edit-gutter {
                position: absolute;
                top: 0;
                left: 0;
                bottom: 0;
                width: 48px;
                background: var(--bg-elevated);
                border-right: 1px solid var(--border-subtle);
                color: var(--text-placeholder);
                text-align: right;
                padding: var(--spacing-md) 8px;
                font-family: var(--font-mono);
                font-size: 0.85rem;
                line-height: 1.5;
                user-select: none;
                pointer-events: none;
                overflow: hidden;
            }

            /* Scroll Linking logic handles sync scrolling manually in JS */

            .diff-line {
                display: flex;
            }
            .diff-line.empty-line {
                min-height: 1.5rem;
                background: transparent;
            }
            .diff-line-num {
                width: 48px;
                min-width: 48px;
                color: var(--text-placeholder);
                padding: 0 8px;
                text-align: right;
                user-select: none;
                background: var(--bg-elevated);
                border-right: 1px solid var(--border-subtle);
            }
            .diff-line-content {
                padding-left: 12px;
                white-space: pre-wrap;
                word-break: break-all;
                flex: 1;
                min-height: 1.5rem;
            }

            .diff-line.removed {
                background-color: rgba(218, 30, 40, 0.05);
            }
            .diff-line.removed .diff-line-content {
                background-color: rgba(218, 30, 40, 0.15);
                border-radius: 4px;
                margin: 2px 8px 2px 8px;
                padding-left: 8px;
            }

            .diff-line.added {
                background-color: rgba(36, 161, 72, 0.05);
            }
            .diff-line.added .diff-line-content {
                background-color: rgba(36, 161, 72, 0.15);
                border-radius: 4px;
                margin: 2px 8px 2px 8px;
                padding-left: 8px;
            }

            .diff-line.unchanged {
                color: var(--text-secondary);
            }

            .diff-actions-bottom {
                display: flex;
                justify-content: center;
                align-items: center;
                padding-bottom: var(--spacing-md);
            }

            .btn-find-diff {
                background-color: var(--brand-primary);
                color: var(--text-on-color);
                border: 1.5px solid var(--brand-primary);
                font-family: inherit;
                font-size: 1rem;
                font-weight: 600;
                padding: 10px 24px;
                border-radius: 6px;
                cursor: pointer;
                transition: background-color 0.2s, transform 0.1s;
            }
            .btn-find-diff:hover {
                background-color: var(--brand-primary-hover);
                border-color: var(--brand-primary-hover);
            }
            .btn-find-diff:active {
                transform: scale(0.98);
            }

            .mode-input .view-output { display: none !important; }
            .mode-output .view-input { display: none !important; }

            .stat-tag {
                display: inline-flex;
                align-items: center;
                gap: 4px;
                padding: 2px 8px;
                border-radius: 12px;
                font-weight: 600;
            }
            .stat-tag.red {
                background: rgba(218, 30, 40, 0.1);
                color: #ff8389; 
            }
            .stat-tag.green {
                background: rgba(36, 161, 72, 0.1);
                color: #42be65;
            }
            .stat-tag svg {
                width: 12px;
                height: 12px;
            }

            .swap-icon-container {
                position: absolute;
                top: 8px;
                left: 50%;
                transform: translateX(-50%);
                color: var(--text-placeholder);
                z-index: 10;
                background: var(--bg-base);
                padding: 0 8px;
            }

        </style>

        <div class="diff-layout-container mode-input" id="diffMainContainer">
            
            <div class="diff-split-view">
                
                <!-- LEFT PANE -->
                <div class="diff-pane-container">
                    <div class="diff-pane-header view-input">
                        <div class="left-title">Original text</div>
                        <div class="right-actions">
                            <label class="btn-open-file">
                                <input type="file" id="fileOriginal" style="display:none;" />
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                                Open file
                            </label>
                        </div>
                    </div>
                    
                    <div class="diff-pane-header view-output" style="background: var(--bg-base); border-bottom: 1px solid var(--border-subtle);">
                        <div class="left-title">
                            <div class="stat-tag red">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><line x1="5" y1="12" x2="19" y2="12"/></svg>
                                <span id="txtRemovalCount">0 removal</span>
                            </div>
                        </div>
                        <div class="right-actions">
                            <span id="txtLinesLeft">0 line</span>
                            <button class="btn-header-action" id="btnCopyLeft" style="font-weight: 600; color: var(--text-primary);">Copy</button>
                        </div>
                    </div>

                    <div class="diff-editor-area">
                        <div id="gutterOriginal" class="edit-gutter view-input">1</div>
                        <textarea id="inputOriginal" class="diff-textarea view-input" style="padding-left: 56px;" placeholder="Paste original text..."></textarea>
                        <div id="outputOriginal" class="diff-output-area view-output"></div>
                    </div>
                </div>

                <!-- MIDDLE SWAP ICON (Only Output) -->
                <div class="swap-icon-container view-output">
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" class="swap-icon" stroke="currentColor" stroke-width="2"><polyline points="16 3 21 3 21 8"/><line x1="4" y1="20" x2="21" y2="3"/><polyline points="21 16 21 21 16 21"/><line x1="15" y1="15" x2="21" y2="21"/></svg>
                </div>

                <!-- RIGHT PANE -->
                <div class="diff-pane-container">
                    <div class="diff-pane-header view-input">
                        <div class="left-title">Changed text</div>
                        <div class="right-actions">
                            <label class="btn-open-file">
                                <input type="file" id="fileChanged" style="display:none;" />
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                                Open file
                            </label>
                        </div>
                    </div>
                    
                    <div class="diff-pane-header view-output" style="background: var(--bg-base); border-bottom: 1px solid var(--border-subtle);">
                        <div class="left-title">
                            <div class="stat-tag green">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                                <span id="txtAdditionCount">0 addition</span>
                            </div>
                        </div>
                        <div class="right-actions">
                            <span id="txtLinesRight">0 line</span>
                            <button class="btn-header-action" id="btnCopyRight" style="font-weight: 600; color: var(--text-primary);">Copy</button>
                        </div>
                    </div>

                    <div class="diff-editor-area">
                        <div id="gutterChanged" class="edit-gutter view-input">1</div>
                        <textarea id="inputChanged" class="diff-textarea view-input" style="padding-left: 56px;" placeholder="Paste changed text..."></textarea>
                        <div id="outputChanged" class="diff-output-area view-output"></div>
                    </div>
                </div>

            </div>

            <!-- FIND DIFFERENCE BUTTON -->
            <div class="diff-actions-bottom view-input">
                <button id="btnFindDiff" class="btn-find-diff">Find difference</button>
            </div>

        </div>
    `;
}

export function init(workspace, actionsContainer) {
    const mainContainer = workspace.querySelector('#diffMainContainer');
    const inputA = workspace.querySelector('#inputOriginal');
    const inputB = workspace.querySelector('#inputChanged');
    const outputA = workspace.querySelector('#outputOriginal');
    const outputB = workspace.querySelector('#outputChanged');
    const btnFindDiff = workspace.querySelector('#btnFindDiff');

    let isDiffMode = false;

    // Clear and build contextual actions
    const renderActions = () => {
        if (!isDiffMode) {
            actionsContainer.innerHTML = '';
        } else {
            actionsContainer.innerHTML = `
                <button class="btn btn-secondary" id="btnBackToEdit" style="display: flex; align-items: center; justify-content: center; gap: 8px; white-space: nowrap; color: var(--brand-primary); border-color: var(--brand-primary); background: var(--bg-main);">
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 12H5"/><polyline points="12 19 5 12 12 5"/></svg>
                    Back to Edit
                </button>
                <button class="btn btn-secondary" id="btnClearAll" style="display: flex; align-items: center; justify-content: center; gap: 8px; white-space: nowrap; color: var(--status-error); border-color: var(--status-error); background: var(--bg-main);">
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2-2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
                    Clear All
                </button>
            `;

            actionsContainer.querySelector('#btnBackToEdit').addEventListener('click', () => {
                isDiffMode = false;
                mainContainer.classList.remove('mode-output');
                mainContainer.classList.add('mode-input');
                renderActions();
            });

            actionsContainer.querySelector('#btnClearAll').addEventListener('click', () => {
                inputA.value = '';
                inputB.value = '';
                isDiffMode = false;
                mainContainer.classList.remove('mode-output');
                mainContainer.classList.add('mode-input');
                renderActions();
            });
        }
    };
    renderActions();

    // File inputs
    const setupFile = (inputId, textareaNode) => {
        const fileIn = workspace.querySelector(inputId);
        fileIn.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = (ev) => {
                textareaNode.value = ev.target.result;
            };
            reader.readAsText(file);
            fileIn.value = '';
        });
    };
    setupFile('#fileOriginal', inputA);
    setupFile('#fileChanged', inputB);

    // Sync line numbers in edit mode
    const updateGutter = (textarea, gutter) => {
        const lines = textarea.value.split('\n').length;
        let html = '';
        for (let i = 1; i <= lines; i++) {
            html += i + '<br>';
        }
        gutter.innerHTML = html;
    };

    const gutterA = workspace.querySelector('#gutterOriginal');
    const gutterB = workspace.querySelector('#gutterChanged');

    inputA.addEventListener('input', () => updateGutter(inputA, gutterA));
    inputB.addEventListener('input', () => updateGutter(inputB, gutterB));

    // Initialize gutters
    updateGutter(inputA, gutterA);
    updateGutter(inputB, gutterB);

    inputA.addEventListener('scroll', () => {
        gutterA.scrollTop = inputA.scrollTop;
    });
    inputB.addEventListener('scroll', () => {
        gutterB.scrollTop = inputB.scrollTop;
    });

    // Sync scrolling
    let ignoreScrollA = false;
    let ignoreScrollB = false;

    outputA.addEventListener('scroll', () => {
        if (ignoreScrollA) {
            ignoreScrollA = false;
            return;
        }
        ignoreScrollB = true;
        outputB.scrollTop = outputA.scrollTop;
    });

    outputB.addEventListener('scroll', () => {
        if (ignoreScrollB) {
            ignoreScrollB = false;
            return;
        }
        ignoreScrollA = true;
        outputA.scrollTop = outputB.scrollTop;
    });

    // Copy handlers
    workspace.querySelector('#btnCopyLeft').addEventListener('click', () => {
        if (!inputA.value) return showToast('Nothing to copy', 'error');
        copyToClipboard(inputA.value);
        showToast('Copied original text');
    });

    workspace.querySelector('#btnCopyRight').addEventListener('click', () => {
        if (!inputB.value) return showToast('Nothing to copy', 'error');
        copyToClipboard(inputB.value);
        showToast('Copied changed text');
    });

    // Compute diff
    btnFindDiff.addEventListener('click', () => {
        const txtA = inputA.value;
        const txtB = inputB.value;

        if (!txtA && !txtB) {
            showToast('Please enter text to compare', 'error');
            return;
        }

        const linesA = txtA.split('\\n');
        const linesB = txtB.split('\\n');
        const m = linesA.length;
        const n = linesB.length;

        let htmlA = '';
        let htmlB = '';
        let additions = 0;
        let removals = 0;
        let lineA = 1;
        let lineB = 1;

        if (m > 1500 || n > 1500) {
            // Fallback for massive files without crashing tab
            for (let i = 0; i < Math.max(m, n); i++) {
                const la = linesA[i];
                const lb = linesB[i];
                if (la === lb) {
                    htmlA += createDiffLine(lineA++, la, 'unchanged');
                    htmlB += createDiffLine(lineB++, lb, 'unchanged');
                } else {
                    if (la !== undefined) {
                        htmlA += createDiffLine(lineA++, la, 'removed');
                        removals++;
                    } else {
                        htmlA += createEmptyLine();
                    }

                    if (lb !== undefined) {
                        htmlB += createDiffLine(lineB++, lb, 'added');
                        additions++;
                    } else {
                        htmlB += createEmptyLine();
                    }
                }
            }
        } else {
            // Edit distance LCS
            const dp = Array(m + 1).fill(null).map(() => Array(n + 1).fill(0));
            for (let i = 1; i <= m; i++) {
                for (let j = 1; j <= n; j++) {
                    if (linesA[i - 1] === linesB[j - 1]) {
                        dp[i][j] = dp[i - 1][j - 1] + 1;
                    } else {
                        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
                    }
                }
            }

            let i = m, j = n;
            const diffs = [];
            while (i > 0 || j > 0) {
                if (i > 0 && j > 0 && linesA[i - 1] === linesB[j - 1]) {
                    diffs.unshift({ type: 'same', la: linesA[i - 1], lb: linesB[j - 1] });
                    i--; j--;
                } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
                    diffs.unshift({ type: 'added', la: null, lb: linesB[j - 1] });
                    j--;
                } else if (i > 0 && (j === 0 || dp[i][j - 1] < dp[i - 1][j])) {
                    diffs.unshift({ type: 'removed', la: linesA[i - 1], lb: null });
                    i--;
                }
            }

            for (const d of diffs) {
                if (d.type === 'same') {
                    htmlA += createDiffLine(lineA++, d.la, 'unchanged');
                    htmlB += createDiffLine(lineB++, d.lb, 'unchanged');
                } else if (d.type === 'removed') {
                    htmlA += createDiffLine(lineA++, d.la, 'removed');
                    htmlB += createEmptyLine();
                    removals++;
                } else if (d.type === 'added') {
                    htmlA += createEmptyLine();
                    htmlB += createDiffLine(lineB++, d.lb, 'added');
                    additions++;
                }
            }
        }

        outputA.innerHTML = htmlA;
        outputB.innerHTML = htmlB;

        // Labels
        workspace.querySelector('#txtRemovalCount').textContent = removals + (removals === 1 ? ' removal' : ' removals');
        workspace.querySelector('#txtAdditionCount').textContent = additions + (additions === 1 ? ' addition' : ' additions');
        workspace.querySelector('#txtLinesLeft').textContent = (lineA - 1) + ' lines';
        workspace.querySelector('#txtLinesRight').textContent = (lineB - 1) + ' lines';

        // Swap View!
        isDiffMode = true;
        mainContainer.classList.remove('mode-input');
        mainContainer.classList.add('mode-output');
        renderActions();
    });

    function createDiffLine(num, text, type) {
        const safeText = (text || ' ').replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
        return `
            <div class="diff-line ${type}">
                <div class="diff-line-num">${num}</div>
                <div class="diff-line-content">${safeText}</div>
            </div>
        `;
    }

    function createEmptyLine() {
        return `<div class="diff-line empty-line"><div class="diff-line-num"></div><div class="diff-line-content"></div></div>`;
    }

}
