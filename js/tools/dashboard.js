export function render() {
    return `
        <div class="dashboard-container">
            <div class="dashboard-header">
                <h2>Dev<span class="highlight">Tool</span></h2>
                <p>Select a tool below to get started</p>
            </div>

            <div class="dashboard-grid">
                <!-- JSON Category -->
                <div class="dashboard-category">
                    <div class="category-header">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 6h16M4 12h16m-7 6h7"/></svg>
                        JSON Tools
                    </div>
                    <div class="tool-links">
                        <div class="tool-card" data-tool="formatter">
                            <div class="tool-card-icon">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 6h16M4 12h16m-7 6h7"/></svg>
                            </div>
                            <div class="tool-card-content">
                                <h4>JSON Formatter</h4>
                                <p>Prettify and validate JSON</p>
                            </div>
                        </div>
                        <div class="tool-card" data-tool="converter">
                            <div class="tool-card-icon">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/></svg>
                            </div>
                            <div class="tool-card-content">
                                <h4>CSV &harr; JSON</h4>
                                <p>Bidirectional conversion</p>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Text Category -->
                <div class="dashboard-category">
                    <div class="category-header">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 3v4a1 1 0 0 0 1 1h4M17 21H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7l5 5v11a2 2 0 0 1-2 2z"/><line x1="9" y1="13" x2="15" y2="13"/><line x1="12" y1="10" x2="12" y2="16"/></svg>
                        Text Tools
                    </div>
                    <div class="tool-links">
                        <div class="tool-card" data-tool="diff">
                            <div class="tool-card-icon">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 3v4a1 1 0 0 0 1 1h4M17 21H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7l5 5v11a2 2 0 0 1-2 2z"/><line x1="9" y1="13" x2="15" y2="13"/><line x1="12" y1="10" x2="12" y2="16"/></svg>
                            </div>
                            <div class="tool-card-content">
                                <h4>Diff Checker</h4>
                                <p>Text comparison tool</p>
                            </div>
                        </div>
                        <div class="tool-card" data-tool="inspector">
                            <div class="tool-card-icon">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 6.1L12.6 1L8 6.1V23h9V6.1z"/><path d="M11 13h3"/><path d="M11 17h3"/></svg>
                            </div>
                            <div class="tool-card-content">
                                <h4>Character Counter</h4>
                                <p>Text analysis & stats</p>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Codec Category -->
                <div class="dashboard-category">
                    <div class="category-header">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="M12 8v4"/><path d="M12 16h.01"/></svg>
                        Codec Tools
                    </div>
                    <div class="tool-links">
                        <div class="tool-card" data-tool="jwt">
                            <div class="tool-card-icon">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="M12 8v4"/><path d="M12 16h.01"/></svg>
                            </div>
                            <div class="tool-card-content">
                                <h4>JWT Decoder</h4>
                                <p>Token debug & decode</p>
                            </div>
                        </div>
                        <div class="tool-card" data-tool="base64">
                            <div class="tool-card-icon">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 7h16M4 12h16M4 17h16"/></svg>
                            </div>
                            <div class="tool-card-content">
                                <h4>Base64 Codec</h4>
                                <p>Text &harr; Base64 conversion</p>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Time Category -->
                <div class="dashboard-category">
                    <div class="category-header">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                        Time Tools
                    </div>
                    <div class="tool-links">
                        <div class="tool-card" data-tool="time">
                            <div class="tool-card-icon">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                            </div>
                            <div class="tool-card-content">
                                <h4>Unix Time</h4>
                                <p>Timestamp converter</p>
                            </div>
                        </div>
                        <div class="tool-card" data-tool="cron">
                            <div class="tool-card-icon">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
                            </div>
                            <div class="tool-card-content">
                                <h4>Cron Parser</h4>
                                <p>Human-readable cron</p>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Generator Category -->
                <div class="dashboard-category">
                    <div class="category-header">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"/></svg>
                        Generators
                    </div>
                    <div class="tool-links">
                        <div class="tool-card" data-tool="password">
                            <div class="tool-card-icon">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"/></svg>
                            </div>
                            <div class="tool-card-content">
                                <h4>Password Gen</h4>
                                <p>Secure password tool</p>
                            </div>
                        </div>
                        <div class="tool-card" data-tool="uuid">
                            <div class="tool-card-icon">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                            </div>
                            <div class="tool-card-content">
                                <h4>UUID Generator</h4>
                                <p>V1, V4, V7 support</p>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Network Category -->
                <div class="dashboard-category">
                    <div class="category-header">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
                        Network Tools
                    </div>
                    <div class="tool-links">
                        <div class="tool-card" data-tool="network">
                            <div class="tool-card-icon">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
                            </div>
                            <div class="tool-card-content">
                                <h4>IP Check</h4>
                                <p>Public IP & Location</p>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Converter Category -->
                <div class="dashboard-category">
                    <div class="category-header">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                        Converter
                    </div>
                    <div class="tool-links">
                         <div class="tool-card" data-tool="ocr">
                             <div class="tool-card-icon">
                                 <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M7 2H4a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/><path d="M7 8l5 5 5-5"/><path d="M12 13V3"/></svg>
                             </div>
                             <div class="tool-card-content">
                                 <h4>Image to Text</h4>
                                 <p>Local OCR extraction</p>
                             </div>
                         </div>
                         <div class="tool-card" data-tool="imagetopdf">
                             <div class="tool-card-icon">
                                 <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><rect x="3" y="11" width="7" height="7" rx="1"/><circle cx="5" cy="13" r="0.5" fill="currentColor" stroke="none"/><polyline points="3 17 5 15 7 17"/></svg>
                             </div>
                             <div class="tool-card-content">
                                 <h4>Image to PDF</h4>
                                 <p>JPEG & PNG &rarr; PDF</p>
                             </div>
                         </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

export function init(workspace, actionsContainer) {
    workspace.querySelectorAll('.tool-card').forEach(card => {
        card.addEventListener('click', () => {
            const toolId = card.dataset.tool;
            if (toolId) {
                // Navigate by changing hash or triggering a custom event
                // For now, let's trigger a click on the corresponding sidebar item
                const sidebarItem = document.querySelector(`.nav-item[data-tool="${toolId}"]`);
                if (sidebarItem) {
                    sidebarItem.click();
                }
            }
        });
    });
}
