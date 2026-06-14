# &lt;dev.tool/&gt;

Developer utility toolkit. Client-side tools for everyday dev workflows.

## Tools (15)

| Category | Tool | Description |
|----------|------|-------------|
| JSON | Formatter | Prettify and validate JSON |
| JSON | CSV ↔ JSON | Bidirectional conversion |
| Text | Diff Checker | Text comparison tool |
| Text | Character Counter | Text analysis & stats |
| Text | Notes | Browser scratchpad (localStorage) |
| Codec | JWT Decoder | Token debug & decode |
| Codec | Base64 Codec | Text ↔ Base64 |
| Network | IP Check | Public IP & location |
| Time | Unix Time | Timestamp converter |
| Time | Cron Parser | Human-readable cron |
| Generator | UUID Generator | V4, V7 support |
| Generator | Password Generator | Secure passwords |
| Converter | Image to Text | Tesseract.js OCR |
| Converter | Image to PDF | JPEG/PNG → PDF |

## Architecture

```
index.html          Single-page app
styles.css          Design system (NousVault dark/light palette)
js/
  main.js           App entry: tool registry, nav, routing, sidebar
  theme.js          Dark/light toggle, localStorage
  icons.js          Inline SVG icons
  components/
    dom.js          Tiny DOM helpers (el, textarea, btn, section)
  tools/
    json-formatter.js
    csv-json.js
    diff-checker.js
    character-counter.js
    notes.js
    jwt-decoder.js
    base64-codec.js
    network-ip.js
    unix-time.js
    cron-parser.js
    uuid-generator.js
    password-generator.js
    image-to-text.js        (Tesseract.js, lazy-loaded)
    image-to-pdf.js         (jsPDF, lazy-loaded)
```

## Design
See NousVault design system (dark brutalist, `#0e1512` background, EB Garamond headings, JetBrains Mono text, `#e2efe7` foreground, `#2e4036` lines). Light mode supported.

## Deploy
Static files — serve from any HTTP server.

## License
MIT
