export function render() {
    return `
        <div style="max-width: 600px; margin: 0 auto; width: 100%;">
            <div class="pane">
                <div class="pane-header">
                    <h3>IP Address Lookup</h3>
                </div>
                <div style="padding: var(--spacing-lg);">
                    <div class="input-group" style="display: flex; flex-direction: row; gap: var(--spacing-sm);">
                        <input type="text" id="ipInput" placeholder="Enter IP (leave blank for your own IP)" style="flex: 1;">
                        <button class="btn btn-primary" id="btnLookupIp">Lookup</button>
                    </div>
                    
                    <div id="ipResultContainer" style="display: none; margin-top: var(--spacing-lg);">
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--spacing-md); background: var(--bg-surface); padding: var(--spacing-lg); border-radius: var(--radius-md); border: 1px solid var(--border-strong);">
                            
                            <div>
                                <div class="input-label">IP Address</div>
                                <div id="resIp" style="font-family: var(--font-mono); font-size: 1.125rem; margin-bottom: var(--spacing-md);"></div>
                                
                                <div class="input-label">City</div>
                                <div id="resCity" style="font-weight: 500; margin-bottom: var(--spacing-md);"></div>
                                
                                <div class="input-label">Region / State</div>
                                <div id="resRegion" style="font-weight: 500;"></div>
                            </div>
                            
                            <div>
                                <div class="input-label">Country</div>
                                <div id="resCountry" style="font-weight: 500; margin-bottom: var(--spacing-md);"></div>
                                
                                <div class="input-label">ISP / Organization</div>
                                <div id="resOrg" style="font-weight: 500; margin-bottom: var(--spacing-md);"></div>
                                
                                <div class="input-label">Timezone</div>
                                <div id="resTimezone" style="font-weight: 500;"></div>
                            </div>
                            
                        </div>
                    </div>
                    
                    <div id="ipLoadingContainer" style="display: none; text-align: center; padding: var(--spacing-xl);">
                        <div class="spinner" style="margin: 0 auto;"></div>
                        <p style="margin-top: var(--spacing-sm); color: var(--text-secondary);">Looking up IP data...</p>
                    </div>

                    <div id="ipErrorContainer" style="display: none; margin-top: var(--spacing-lg); color: var(--status-error); background: var(--status-error-bg); padding: var(--spacing-md); border-radius: var(--radius-sm); border: 1px solid var(--status-error);">
                        <span id="ipErrorMessage"></span>
                    </div>

                </div>
            </div>
        </div>
    `;
}

export function init(workspace, actionsContainer) {
    const ipInput = workspace.querySelector('#ipInput');
    const btnLookupIp = workspace.querySelector('#btnLookupIp');

    const resultContainer = workspace.querySelector('#ipResultContainer');
    const loadingContainer = workspace.querySelector('#ipLoadingContainer');
    const errorContainer = workspace.querySelector('#ipErrorContainer');
    const errorMessage = workspace.querySelector('#ipErrorMessage');

    const resIp = workspace.querySelector('#resIp');
    const resCity = workspace.querySelector('#resCity');
    const resRegion = workspace.querySelector('#resRegion');
    const resCountry = workspace.querySelector('#resCountry');
    const resOrg = workspace.querySelector('#resOrg');
    const resTimezone = workspace.querySelector('#resTimezone');

    const fetchIpData = async () => {
        const ip = ipInput.value.trim();
        const url = ip ? `https://ipapi.co/${ip}/json/` : 'https://ipapi.co/json/';

        // UI State
        resultContainer.style.display = 'none';
        errorContainer.style.display = 'none';
        loadingContainer.style.display = 'block';
        btnLookupIp.disabled = true;

        try {
            const response = await fetch(url);
            const data = await response.json();

            loadingContainer.style.display = 'none';
            btnLookupIp.disabled = false;

            if (data.error) {
                throw new Error(data.reason || 'Failed to fetch IP information.');
            }

            // Populate data
            resIp.textContent = data.ip || '-';
            resCity.textContent = data.city || '-';
            resRegion.textContent = data.region || '-';
            resCountry.textContent = data.country_name || '-';
            resOrg.textContent = data.org || '-';
            resTimezone.textContent = data.timezone || '-';

            resultContainer.style.display = 'block';

        } catch (error) {
            loadingContainer.style.display = 'none';
            btnLookupIp.disabled = false;
            errorMessage.textContent = error.message || 'Network error occurred.';
            errorContainer.style.display = 'block';
        }
    };

    btnLookupIp.addEventListener('click', fetchIpData);
    ipInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') fetchIpData();
    });

    // Auto-fetch own IP on load
    fetchIpData();
}
