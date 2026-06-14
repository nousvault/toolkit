import { showToast, copyToClipboard } from '../utils.js';

export function render() {
    return `
        <div style="max-width: 800px; margin: 0 auto; width: 100%; display: flex; flex-direction: column; gap: var(--spacing-xl);">
            
            <!-- Current Time Banner -->
            <div style="background: var(--bg-surface); border: 1px solid var(--border-strong); padding: var(--spacing-xl); border-radius: var(--radius-lg); text-align: center; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2); position: relative;">
                <div style="display: flex; justify-content: center; margin-bottom: var(--spacing-md);">
                    <div class="pill-toggle" id="tickerToggle">
                        <div class="pill-option" data-unit="s">Seconds</div>
                        <div class="pill-option active" data-unit="ms">Milliseconds</div>
                    </div>
                </div>
                <div class="input-label" style="text-transform: uppercase; letter-spacing: 1px; color: var(--text-secondary);">Current Unix Timestamp</div>
                <div id="liveUnixTime" style="font-family: var(--font-mono); font-size: 3rem; font-weight: 700; color: var(--brand-primary); letter-spacing: 1px; margin-top: var(--spacing-sm);">
                    Loading...
                </div>
            </div>

            <!-- Converters -->
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--spacing-lg);">
                
                <!-- Unix to Human -->
                <div class="pane">
                    <div class="pane-header">
                        <h3>Timestamp to Date</h3>
                    </div>
                    <div style="padding: var(--spacing-lg); display: flex; flex-direction: column; gap: var(--spacing-md); background: var(--bg-surface); border-radius: var(--radius-md); border: 1px solid var(--border-strong);">
                        <div>
                            <label class="input-label">Unix Timestamp</label>
                            <input type="number" id="inputTimestamp" placeholder="e.g. 1771841367015">
                            <div style="margin-top: 12px; display: flex; align-items: center; gap: var(--spacing-md);">
                                <div class="pill-toggle" id="inputTogggle">
                                    <div class="pill-option" data-unit="s">s</div>
                                    <div class="pill-option active" data-unit="ms">ms</div>
                                </div>
                                <span style="font-size: 0.75rem; color: var(--text-placeholder);">Select unit</span>
                            </div>
                        </div>
                        
                        <div style="background: var(--bg-base); padding: var(--spacing-md); border-radius: var(--radius-md); border: 1px solid var(--border-strong); display: flex; flex-direction: column; gap: var(--spacing-md);">
                            <div style="display: flex; justify-content: space-between; align-items: center;">
                                <div>
                                    <div class="input-label">Local Time</div>
                                    <div id="outLocalTime" style="font-family: var(--font-mono); font-size: 0.9rem; min-height: 20px;">-</div>
                                </div>
                                <button class="btn btn-secondary btn-sm copy-target-btn" data-target="outLocalTime" style="padding: 4px 8px; font-size: 0.8rem; height: fit-content;">Copy</button>
                            </div>
                            
                            <div style="display: flex; justify-content: space-between; align-items: center;">
                                <div>
                                    <div class="input-label">ISO 8601 / UTC</div>
                                    <div id="outIsoTime" style="font-family: var(--font-mono); font-size: 0.9rem; min-height: 20px;">-</div>
                                </div>
                                <button class="btn btn-secondary btn-sm copy-target-btn" data-target="outIsoTime" style="padding: 4px 8px; font-size: 0.8rem; height: fit-content;">Copy</button>
                            </div>
                            
                            <div style="display: flex; justify-content: space-between; align-items: center;">
                                <div>
                                    <div class="input-label">Relative</div>
                                    <div id="outRelativeTime" style="font-weight: 500; font-size: 0.9rem; color: var(--brand-primary); min-height: 20px;">-</div>
                                </div>
                                <button class="btn btn-secondary btn-sm copy-target-btn" data-target="outRelativeTime" style="padding: 4px 8px; font-size: 0.8rem; height: fit-content;">Copy</button>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Human to Unix -->
                <div class="pane">
                    <div class="pane-header">
                        <h3>Date to Timestamp</h3>
                    </div>
                    <div style="padding: var(--spacing-lg); display: flex; flex-direction: column; gap: var(--spacing-md); background: var(--bg-surface); border-radius: var(--radius-md); border: 1px solid var(--border-strong);">
                        <div>
                            <label class="input-label">ISO String or Date (Local by default)</label>
                            <input type="text" id="inputDateString" placeholder="e.g. 2024-01-01T12:00:00">
                            <div style="font-size: 0.75rem; color: var(--text-placeholder); margin-top: 4px;">Supports RFC2822 or ISO 8601</div>
                        </div>
                        
                        <div style="background: var(--bg-base); padding: var(--spacing-md); border-radius: var(--radius-md); border: 1px solid var(--border-strong); display: flex; flex-direction: column; gap: var(--spacing-md);">
                            <div style="display: flex; justify-content: space-between; align-items: center;">
                                <div>
                                    <div class="input-label">Unix Timestamp (Seconds)</div>
                                    <div id="outUnixSeconds" style="font-family: var(--font-mono); font-size: 1.2rem; min-height: 24px; color: var(--text-primary);">-</div>
                                </div>
                                <button class="btn btn-secondary btn-sm copy-target-btn" data-target="outUnixSeconds" style="padding: 4px 8px; font-size: 0.8rem; height: fit-content;">Copy</button>
                            </div>
                            
                            <div style="display: flex; justify-content: space-between; align-items: center;">
                                <div>
                                    <div class="input-label">Unix Timestamp (Milliseconds)</div>
                                    <div id="outUnixMillis" style="font-family: var(--font-mono); font-size: 1.2rem; min-height: 24px; color: var(--brand-primary);">-</div>
                                </div>
                                <button class="btn btn-secondary btn-sm copy-target-btn" data-target="outUnixMillis" style="padding: 4px 8px; font-size: 0.8rem; height: fit-content;">Copy</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

export function init(workspace, actionsContainer) {
    let liveTimer;
    const liveTimeEl = workspace.querySelector('#liveUnixTime');
    const tickerToggle = workspace.querySelector('#tickerToggle');

    // Default state
    let activeTickerUnit = 'ms';
    let inputUnit = 'ms';

    // Elements - TS -> Date
    const inputTs = workspace.querySelector('#inputTimestamp');
    const inputToggle = workspace.querySelector('#inputTogggle');
    const outLocal = workspace.querySelector('#outLocalTime');
    const outIso = workspace.querySelector('#outIsoTime');
    const outRel = workspace.querySelector('#outRelativeTime');

    // Elements - Date -> TS
    const inputDate = workspace.querySelector('#inputDateString');
    const outSecs = workspace.querySelector('#outUnixSeconds');
    const outMs = workspace.querySelector('#outUnixMillis');

    // Helper for pill toggles
    const setupToggle = (container, callback) => {
        const options = container.querySelectorAll('.pill-option');
        options.forEach(opt => {
            opt.addEventListener('click', () => {
                options.forEach(o => o.classList.remove('active'));
                opt.classList.add('active');
                callback(opt.getAttribute('data-unit'));
            });
        });
    };

    // Live clock
    const updateLiveClock = () => {
        const now = Date.now();
        liveTimeEl.textContent = activeTickerUnit === 's' ? Math.floor(now / 1000) : now;
    };

    const setTickerUnit = (unit) => {
        activeTickerUnit = unit;
        updateLiveClock();
        // Adjust interval speed
        clearInterval(liveTimer);
        liveTimer = setInterval(updateLiveClock, unit === 'ms' ? 50 : 1000);
    };

    setupToggle(tickerToggle, setTickerUnit);
    setTickerUnit('ms'); // Initial

    const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto', style: 'long' });

    // Handle TS -> Date conversion
    const handleTsInput = () => {
        const val = inputTs.value.trim();
        if (!val) {
            outLocal.textContent = '-'; outIso.textContent = '-'; outRel.textContent = '-';
            return;
        }

        let num = parseInt(val, 10);
        if (isNaN(num)) return;

        // Ensure milliseconds for Date object
        if (inputUnit === 's') num *= 1000;

        const date = new Date(num);
        if (isNaN(date.getTime())) {
            outLocal.textContent = 'Invalid Date';
            outIso.textContent = 'Invalid Date';
            outRel.textContent = '-';
            return;
        }

        outLocal.textContent = date.toString();
        outIso.textContent = date.toISOString();

        // Calculate relative time
        const diffMs = date.getTime() - Date.now();
        const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

        if (Math.abs(diffDays) < 1) {
            const diffHours = Math.round(diffMs / (1000 * 60 * 60));
            if (Math.abs(diffHours) < 1) {
                const diffMins = Math.round(diffMs / (1000 * 60));
                outRel.textContent = rtf.format(diffMins, 'minute');
            } else {
                outRel.textContent = rtf.format(diffHours, 'hour');
            }
        } else if (Math.abs(diffDays) > 365) {
            outRel.textContent = rtf.format(Math.round(diffDays / 365), 'year');
        } else if (Math.abs(diffDays) > 30) {
            outRel.textContent = rtf.format(Math.round(diffDays / 30), 'month');
        } else {
            outRel.textContent = rtf.format(diffDays, 'day');
        }
    };

    setupToggle(inputToggle, (unit) => {
        inputUnit = unit;
        handleTsInput();
    });

    // Handle Date -> TS conversion
    const handleDateInput = () => {
        const val = inputDate.value.trim();
        if (!val) {
            outSecs.textContent = '-'; outMs.textContent = '-';
            return;
        }

        const date = new Date(val);
        if (isNaN(date.getTime())) {
            outSecs.textContent = 'Invalid';
            outMs.textContent = 'Invalid';
            return;
        }

        outMs.textContent = date.getTime();
        outSecs.textContent = Math.floor(date.getTime() / 1000);
    };

    // Listeners
    inputTs.addEventListener('input', handleTsInput);
    inputDate.addEventListener('input', handleDateInput);

    workspace.querySelectorAll('.copy-target-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const targetId = btn.getAttribute('data-target');
            const el = workspace.querySelector(`#${targetId}`);
            if (el && el.textContent && el.textContent !== '-' && el.textContent !== 'Invalid Date' && el.textContent !== 'Invalid') {
                copyToClipboard(el.textContent);
                showToast('Copied to clipboard', 'success');
            } else {
                showToast('Nothing to copy', 'error');
            }
        });
    });

    // Clean interval on destroy
    workspace.destroy = () => {
        clearInterval(liveTimer);
    };

    // Initial value
    inputTs.value = Date.now();
    handleTsInput();
}

