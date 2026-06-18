export function render() {
    return `
        <div class="about-page">
            <h2 class="about-title">About Tools by NousVault</h2>
            <p class="about-lead">A browser-based developer toolkit for JSON, text, time, JWT, UUID, and more. No account, no tracking — everything runs in your browser.</p>

            <section class="about-section">
                <h3>What this is</h3>
                <p>Tools by NousVault is a collection of lightweight browser utilities built for developers, students, and operators who need quick utilities without accounts, ads, or tracking. Input stays in browser — nothing is sent to a server.</p>
                <p>Each tool is designed to stay fast, private, and easy to use on desktop or mobile. Useful for quick debugging, daily operations, and lightweight productivity work.</p>
            </section>

            <section class="about-section">
                <h3>Available tools</h3>
                <ul class="about-tools-list">
                    <li><strong>JSON Formatter</strong> — clean, indent, and validate JSON payloads</li>
                    <li><strong>CSV ↔ JSON</strong> — convert bidirectionally between CSV and JSON</li>
                    <li><strong>Diff Checker</strong> — compare two text blocks and highlight changes</li>
                    <li><strong>Character Counter</strong> — count characters, words, and paragraphs</li>
                    <li><strong>Notes</strong> — quick scratchpad that persists in browser</li>
                    <li><strong>JWT Decoder</strong> — inspect header and payload claims from any JWT</li>
                    <li><strong>Base64 Codec</strong> — encode and decode base64 strings</li>
                    <li><strong>Network IP</strong> — check your current public IP address</li>
                    <li><strong>Unix Time</strong> — convert between Unix timestamps and readable dates</li>
                    <li><strong>Cron Parser</strong> — parse and explain cron expressions</li>
                    <li><strong>UUID Generator</strong> — generate v4 UUID values</li>
                    <li><strong>Password Generator</strong> — create secure random passwords</li>
                    <li><strong>OCR</strong> — extract text from images in browser</li>
                    <li><strong>Image to PDF</strong> — convert images to PDF locally</li>
                </ul>
            </section>

            <section class="about-section">
                <h3>Related projects</h3>
                <ul class="about-related-list">
                    <li><a href="https://pomo.nous.my.id" target="_blank" rel="noopener">Pomodoro timer</a> — browser-based focus timer for deep work and study sessions</li>
                    <li><a href="https://draw.nous.my.id" target="_blank" rel="noopener">Free whiteboard</a> — sketch ideas, flows, and diagrams without signing up</li>
                    <li><a href="https://nous.my.id" target="_blank" rel="noopener">NousVault</a> — the parent project and signal feed</li>
                </ul>
            </section>
        </div>
    `;
}

export function init() {}
