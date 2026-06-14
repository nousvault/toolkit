import { copyToClipboard, showToast } from '../utils.js';

export function render() {
    return `
        <style>
            .inspector-container {
                display: grid;
                grid-template-columns: 1fr 220px;
                gap: var(--spacing-lg);
                height: 100%;
            }

            .inspector-input-pane {
                display: flex;
                flex-direction: column;
                background: var(--bg-surface);
                border: 1px solid var(--border-strong);
                border-radius: var(--radius-md);
                overflow: hidden;
            }

            .inspector-textarea {
                flex: 1;
                border: none;
                background: transparent;
                padding: var(--spacing-lg);
                color: var(--text-primary);
                font-family: var(--font-mono);
                font-size: 1rem;
                line-height: 1.6;
                resize: none;
                outline: none;
            }

            .inspector-stats-pane {
                display: flex;
                flex-direction: column;
                gap: var(--spacing-md);
            }

            .stat-card {
                background: var(--bg-surface);
                border: 1px solid var(--border-strong);
                border-radius: var(--radius-md);
                padding: var(--spacing-md) var(--spacing-lg);
                display: flex;
                flex-direction: column;
                gap: 4px;
            }

            .stat-value {
                font-size: 1.5rem;
                font-weight: 700;
                color: var(--brand-primary);
                font-family: var(--font-mono);
            }

            .stat-label {
                font-size: 0.75rem;
                text-transform: uppercase;
                letter-spacing: 0.05em;
                color: var(--text-secondary);
                font-weight: 600;
            }

            @media (max-width: 900px) {
                .inspector-container {
                    grid-template-columns: 1fr;
                    overflow-y: auto;
                }
                .inspector-stats-pane {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
                }
            }
        </style>

        <div class="inspector-container">
            <div class="inspector-input-pane">
                <textarea id="inspectorInput" class="inspector-textarea" placeholder="Type or paste text here to analyze..."></textarea>
            </div>

            <div class="inspector-stats-pane">
                <div class="stat-card">
                    <span class="stat-value" id="statChars">0</span>
                    <span class="stat-label">Characters</span>
                </div>
                <div class="stat-card">
                    <span class="stat-value" id="statCharsNoSpace">0</span>
                    <span class="stat-label">No Spaces</span>
                </div>
                <div class="stat-card">
                    <span class="stat-value" id="statWords">0</span>
                    <span class="stat-label">Words</span>
                </div>
                <div class="stat-card">
                    <span class="stat-value" id="statSentences">0</span>
                    <span class="stat-label">Sentences</span>
                </div>
                <div class="stat-card">
                    <span class="stat-value" id="statParagraphs">0</span>
                    <span class="stat-label">Paragraphs</span>
                </div>
            </div>
        </div>
    `;
}

export function init(workspace, actionsContainer) {
    const input = workspace.querySelector('#inspectorInput');
    const statChars = workspace.querySelector('#statChars');
    const statCharsNoSpace = workspace.querySelector('#statCharsNoSpace');
    const statWords = workspace.querySelector('#statWords');
    const statSentences = workspace.querySelector('#statSentences');
    const statParagraphs = workspace.querySelector('#statParagraphs');

    const updateStats = () => {
        const text = input.value;

        // Characters
        statChars.textContent = text.length;

        // Characters (no spaces)
        statCharsNoSpace.textContent = text.replace(/\s/g, '').length;

        // Words
        const words = text.trim().split(/\s+/).filter(w => w.length > 0);
        statWords.textContent = words.length;

        // Sentences
        const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
        statSentences.textContent = sentences.length;

        // Paragraphs
        const paragraphs = text.split(/\n+/).filter(p => p.trim().length > 0);
        statParagraphs.textContent = paragraphs.length;
    };

    input.addEventListener('input', updateStats);

    // Initial actions
    actionsContainer.innerHTML = `
        <button class="btn btn-secondary" id="btnClearInspector" style="color: var(--status-error); border-color: var(--status-error); background: var(--bg-main);">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
            Clear All
        </button>
    `;

    actionsContainer.querySelector('#btnClearInspector').addEventListener('click', () => {
        input.value = '';
        updateStats();
        input.focus();
    });

    // Auto focus
    input.focus();
}
