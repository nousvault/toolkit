export function render() {
    return `
        <style>
            .cron-interactive-container {
                max-width: 800px;
                margin: 0 auto;
                width: 100%;
            }
            .human-readable-text {
                font-size: 1.8rem;
                font-weight: 500;
                margin-bottom: var(--spacing-xl);
                min-height: 2.5rem;
                display: flex;
                align-items: center;
                justify-content: center;
                font-style: italic;
                color: var(--text-primary);
            }
            .human-readable-text .highlight {
                color: var(--brand-primary);
                padding: 0 8px;
            }
            .cron-input-wrapper {
                position: relative;
                margin-bottom: var(--spacing-xl);
                display: flex;
                justify-content: center;
            }
            .cron-input {
                width: 100%;
                background: var(--bg-surface);
                border: 1px solid var(--border-strong);
                color: var(--text-primary);
                font-size: 2.5rem;
                padding: var(--spacing-md) var(--spacing-lg);
                text-align: center;
                font-family: var(--font-mono);
                outline: none;
                border-radius: var(--radius-sm);
                transition: all 0.2s;
                letter-spacing: 0.1rem;
            }
            .cron-input::placeholder {
                color: var(--text-placeholder);
            }
            .cron-input:focus {
                border-color: var(--brand-primary);
                box-shadow: 0 0 0 2px rgba(120, 169, 255, 0.2);
            }
            
            .nav-parts {
                display: flex;
                justify-content: center;
                gap: 2rem;
                margin-bottom: var(--spacing-lg);
                color: var(--text-secondary);
                font-size: 1rem;
                font-family: var(--font-mono);
            }
            .nav-part {
                cursor: default; /* Keep consistent with static layout */
                transition: color 0.1s;
                padding-bottom: 4px;
                border-bottom: 2px solid transparent;
            }
            .nav-part.active {
                color: var(--brand-primary);
                border-bottom: 2px solid var(--brand-primary);
            }

            .cron-table {
                width: 100%;
                max-width: 600px;
                margin: 0 auto;
                text-align: left;
                border-collapse: collapse;
                color: var(--text-secondary);
                font-family: var(--font-mono);
                font-size: 0.9rem;
                background: var(--bg-surface);
                border-radius: var(--radius-md);
                border: 1px solid var(--border-strong);
                overflow: hidden;
            }
            .cron-table td {
                padding: 12px 16px;
                border-bottom: 1px solid var(--border-light);
            }
            .cron-table tr:last-child td { border-bottom: none; }
            .cron-table .operator {
                font-weight: bold;
                color: var(--text-primary);
                width: 35%;
            }
        </style>

        <div class="cron-interactive-container">
            <div class="pane">
                <div class="pane-header">
                    <h3>Cron Expression Parser</h3>
                    <button class="btn btn-secondary btn-icon" id="btnCopyCron">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
                        Copy
                    </button>
                </div>
                
                <div style="padding: var(--spacing-xl); text-align: center;">

                    <div id="cronHumanReadable" class="human-readable-text">
                        &ldquo;At <span class="highlight">every minute</span>.&rdquo;
                    </div>

                    <div class="cron-input-wrapper">
                        <input type="text" id="cronInput" class="cron-input" value="* * * * *">
                    </div>

                    <div id="cronError" style="color: var(--status-error); margin-bottom: var(--spacing-lg); min-height: 1.5rem; font-size: 0.9rem;"></div>

                    <div class="nav-parts" id="cronNavParts">
                        <div class="nav-part active" data-index="0">minute</div>
                        <div class="nav-part" data-index="1">hour</div>
                        <div class="nav-part" data-index="2">day</div>
                        <div class="nav-part" data-index="3">month</div>
                        <div class="nav-part" data-index="4">weekday</div>
                    </div>

                    <table class="cron-table">
                        <tr><td class="operator">*</td><td>any value</td></tr>
                        <tr><td class="operator">,</td><td>value list separator</td></tr>
                        <tr><td class="operator">-</td><td>range of values</td></tr>
                        <tr><td class="operator">/</td><td>step values</td></tr>
                        <tr style="background: rgba(120, 169, 255, 0.05);"><td id="tableAllowedValues" class="operator" style="color: var(--brand-primary);">0-59</td><td id="tableAllowedDesc">allowed values</td></tr>
                    </table>
                    
                </div>
            </div>
        </div>
    `;
}

export function init(workspace, actionsContainer) {
    const cronInput = workspace.querySelector('#cronInput');
    const outHuman = workspace.querySelector('#cronHumanReadable');
    const outError = workspace.querySelector('#cronError');
    const navParts = workspace.querySelectorAll('.nav-part');
    const tableAllowedValues = workspace.querySelector('#tableAllowedValues');

    // Values based on active tab
    const allowedValuesList = ["0-59", "0-23", "1-31", "1-12", "0-6"];

    // Parser logic
    const parseCron = () => {
        let rawVal = cronInput.value;
        if (!rawVal) rawVal = "* * * * *"; // Simulate placeholder
        const val = rawVal.trim().replace(/\s+/g, ' ');
        const parts = val.split(' ');

        if (parts.length !== 5) {
            outHuman.innerHTML = '...';
            outError.textContent = 'Invalid format. A valid cron contains exactly 5 fields.';
            return;
        }

        try {
            outError.textContent = '';

            // Validate characters first using regex
            const validCharsRegex = /^[\d\*\/\-\,]+$/;
            for (let i = 0; i < parts.length; i++) {
                if (!validCharsRegex.test(parts[i])) {
                    throw new Error(`Invalid characters in field ${i + 1}: '${parts[i]}'`);
                }
            }

            const min = parseField(parts[0], 'minute', 0, 59);
            const hour = parseField(parts[1], 'hour', 0, 23);
            const dom = parseField(parts[2], 'day of month', 1, 31);
            const month = parseField(parts[3], 'month', 1, 12, monthNames);
            const dow = parseField(parts[4], 'day of week', 0, 6, dayNames);

            let result = '';

            // Time component
            if (min === 'every minute' && hour === 'every hour') {
                result += 'every minute';
            } else if (min === 'every minute') {
                result += `every minute, ${hour}`;
            } else if (hour === 'every hour') {
                if (min.startsWith('every ')) {
                    result += `${min}`;
                } else {
                    result += `minute ${min}`;
                }
            } else {
                if (min.includes('every')) result = `${min} past ${hour}`;
                else if (min.includes('minute')) result += `${hour}:${padZero(parts[0])} (minutes ${min})`;
                else result += `${padZero(parts[1])}:${padZero(parts[0])}`;
            }

            // Date component
            if (dom !== 'every day of month' || month !== 'every month' || dow !== 'every day of week') {
                result += ', ';
                if (dom !== 'every day of month') result += `on ${dom} `;
                if (month !== 'every month') result += `in ${month} `;
                if (dow !== 'every day of week') result += `and on ${dow}`;
            }

            // Cleanup
            result = result.replace(/  +/g, ' ').replace(/, $/, '').trim();
            if (result === 'every minute') result = 'every minute';

            outHuman.innerHTML = `&ldquo;At <span class="highlight">${result}</span>.&rdquo;`;

        } catch (e) {
            outHuman.innerHTML = '...';
            outError.textContent = e.message;
        }
    };

    const monthNames = ['', 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

    function parseField(field, type, minVal, maxVal, nameMap = null) {
        if (field === '*') return `every ${type}`;

        if (field.includes('/')) {
            const [base, step] = field.split('/');
            if (base !== '*') throw new Error(`Complex steps in ${type} are not fully supported.`);
            validateNumber(step, type, 1, maxVal);
            return `every ${step} ${type}s`;
        }

        if (field.includes(',')) {
            const items = field.split(',').map(v => {
                validateNumber(v, type, minVal, maxVal);
                return mapName(v, nameMap);
            });
            return items.join(', ');
        }

        if (field.includes('-')) {
            const [start, end] = field.split('-');
            validateNumber(start, type, minVal, maxVal);
            validateNumber(end, type, minVal, maxVal);
            if (parseInt(start, 10) >= parseInt(end, 10)) {
                throw new Error(`Invalid range in ${type}`);
            }
            return `${mapName(start, nameMap)} through ${mapName(end, nameMap)}`;
        }

        validateNumber(field, type, minVal, maxVal);
        return mapName(field, nameMap);
    }

    function validateNumber(val, type, minVal, maxVal) {
        const num = parseInt(val, 10);
        if (isNaN(num)) throw new Error(`Invalid number in ${type}: '${val}'`);
        if (num < minVal || num > maxVal) throw new Error(`Range error: ${minVal}-${maxVal}`);
    }

    function mapName(val, map) {
        if (!map) return val;
        const num = parseInt(val, 10);
        if (!isNaN(num) && map[num]) return map[num];
        return val;
    }

    function padZero(str) {
        if (/^\d$/.test(str)) return '0' + str;
        return str;
    }

    // Interactive cursor navigation tracking
    const updateActiveNav = () => {
        let val = cronInput.value;
        if (!val) val = "* * * * *";

        const cursorPos = cronInput.selectionStart || 0;

        const textBeforeCursor = val.substring(0, cursorPos);
        let partIndex = textBeforeCursor.split(' ').length - 1;
        if (partIndex > 4) partIndex = 4;

        navParts.forEach(el => {
            el.classList.remove('active');
            if (parseInt(el.dataset.index) === partIndex) {
                el.classList.add('active');
            }
        });

        tableAllowedValues.textContent = allowedValuesList[partIndex] || '';
    };

    ['keyup', 'click', 'focus', 'input'].forEach(evt => {
        cronInput.addEventListener(evt, () => {
            if (evt === 'input') parseCron();
            updateActiveNav();
        });
    });

    workspace.querySelector('#btnCopyCron').addEventListener('click', async () => {
        let val = outHuman.textContent || '';
        val = val.replace(/^“|”$/g, '').trim();
        try {
            await navigator.clipboard.writeText(val);
            const btn = workspace.querySelector('#btnCopyCron');
            const originalContent = btn.innerHTML;
            btn.innerHTML = `<svg viewBox="0 0 24 24" fill="none" class="success-icon" stroke="var(--status-success)" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg> Copied`;
            setTimeout(() => btn.innerHTML = originalContent, 2000);
        } catch (e) {
            console.error('Failed to copy', e);
        }
    });

    // Initial parse
    parseCron();
    updateActiveNav();
}
