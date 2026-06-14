import { showToast } from '../utils.js';

export function render() {
    return `
        <style>
            .img2pdf-container {
                display: flex;
                flex-direction: column;
                gap: var(--spacing-lg);
                height: 100%;
            }

            /* Drop zone */
            .img2pdf-dropzone {
                border: 2px dashed var(--border-strong);
                border-radius: var(--radius-md);
                padding: var(--spacing-xl) var(--spacing-lg);
                text-align: center;
                cursor: pointer;
                transition: border-color 0.2s, background 0.2s;
                background: var(--bg-surface);
                position: relative;
            }

            .img2pdf-dropzone.drag-over {
                border-color: var(--brand-primary);
                background: color-mix(in srgb, var(--brand-primary) 6%, var(--bg-surface));
            }

            .img2pdf-dropzone input[type="file"] {
                position: absolute;
                inset: 0;
                opacity: 0;
                cursor: pointer;
                width: 100%;
                height: 100%;
            }

            .dropzone-icon {
                width: 48px;
                height: 48px;
                margin: 0 auto var(--spacing-md);
                color: var(--text-muted);
            }

            .dropzone-text {
                font-size: 1rem;
                font-weight: 500;
                color: var(--text-primary);
                margin-bottom: 4px;
            }

            .dropzone-sub {
                font-size: 0.85rem;
                color: var(--text-secondary);
            }

            /* Settings row */
            .img2pdf-settings {
                display: flex;
                align-items: center;
                gap: var(--spacing-lg);
                background: var(--bg-surface);
                border: 1px solid var(--border-strong);
                border-radius: var(--radius-md);
                padding: var(--spacing-sm) var(--spacing-md);
                flex-wrap: wrap;
            }

            .setting-group {
                display: flex;
                align-items: center;
                gap: 8px;
            }

            .setting-group label {
                font-size: 0.85rem;
                color: var(--text-secondary);
                white-space: nowrap;
            }

            .setting-group select,
            .setting-group input[type="range"] {
                background: var(--bg-elevated);
                border: 1px solid var(--border-subtle);
                border-radius: var(--radius-sm);
                color: var(--text-primary);
                font-size: 0.85rem;
                padding: 4px 8px;
                cursor: pointer;
            }

            .setting-group select:focus {
                outline: 1px solid var(--brand-primary);
            }

            #qualityValue {
                font-size: 0.85rem;
                color: var(--text-primary);
                min-width: 30px;
            }

            /* Image list */
            .img2pdf-list {
                flex: 1;
                min-height: 0;
                overflow-y: auto;
                display: flex;
                flex-direction: column;
                gap: var(--spacing-sm);
            }

            .img2pdf-list:empty::after {
                content: 'No images added yet.';
                display: block;
                text-align: center;
                color: var(--text-muted);
                font-size: 0.9rem;
                margin-top: var(--spacing-xl);
            }

            .img-item {
                display: flex;
                align-items: center;
                gap: var(--spacing-md);
                background: var(--bg-surface);
                border: 1px solid var(--border-strong);
                border-radius: var(--radius-md);
                padding: var(--spacing-sm) var(--spacing-md);
                user-select: none;
                transition: background 0.15s;
            }

            .img-item.dragging {
                opacity: 0.4;
            }

            .img-item.drag-target {
                border-color: var(--brand-primary);
                background: color-mix(in srgb, var(--brand-primary) 6%, var(--bg-surface));
            }

            .img-drag-handle {
                cursor: grab;
                color: var(--text-muted);
                flex-shrink: 0;
            }

            .img-drag-handle:active {
                cursor: grabbing;
            }

            .img-thumb {
                width: 48px;
                height: 48px;
                object-fit: cover;
                border-radius: var(--radius-sm);
                flex-shrink: 0;
                background: var(--bg-elevated);
            }

            .img-info {
                flex: 1;
                min-width: 0;
            }

            .img-name {
                font-size: 0.9rem;
                font-weight: 500;
                color: var(--text-primary);
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
            }

            .img-meta {
                font-size: 0.78rem;
                color: var(--text-secondary);
                margin-top: 2px;
            }

            .img-remove {
                background: none;
                border: none;
                cursor: pointer;
                color: var(--text-muted);
                padding: 4px;
                border-radius: var(--radius-sm);
                transition: color 0.15s, background 0.15s;
                flex-shrink: 0;
                display: flex;
                align-items: center;
            }

            .img-remove:hover {
                color: var(--status-error);
                background: color-mix(in srgb, var(--status-error) 12%, transparent);
            }

            /* Progress overlay */
            .img2pdf-progress {
                display: none;
                align-items: center;
                gap: var(--spacing-md);
                background: var(--bg-surface);
                border: 1px solid var(--border-strong);
                border-radius: var(--radius-md);
                padding: var(--spacing-sm) var(--spacing-md);
            }

            .img2pdf-progress.visible {
                display: flex;
            }

            .progress-bar-track {
                flex: 1;
                height: 6px;
                border-radius: 3px;
                background: var(--bg-elevated);
                overflow: hidden;
            }

            .progress-bar-fill {
                height: 100%;
                border-radius: 3px;
                background: var(--brand-primary);
                transition: width 0.2s;
                width: 0%;
            }

            .progress-label {
                font-size: 0.82rem;
                color: var(--text-secondary);
                white-space: nowrap;
            }
        </style>

        <div class="img2pdf-container">
            <!-- Drop Zone -->
            <div class="img2pdf-dropzone" id="dropzone">
                <input type="file" id="fileInput" accept=".jpg,.jpeg,.png,image/jpeg,image/png" multiple>
                <svg class="dropzone-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                    <rect x="3" y="3" width="18" height="18" rx="2"/>
                    <circle cx="8.5" cy="8.5" r="1.5"/>
                    <polyline points="21 15 16 10 5 21"/>
                </svg>
                <p class="dropzone-text">Drop JPEG / PNG images here</p>
                <p class="dropzone-sub">or click to browse — drag to reorder after adding</p>
            </div>

            <!-- Settings -->
            <div class="img2pdf-settings">
                <div class="setting-group">
                    <label for="pageSize">Page Size</label>
                    <select id="pageSize">
                        <option value="fit">Fit to Image</option>
                        <option value="a4">A4 (Portrait)</option>
                        <option value="a4l">A4 (Landscape)</option>
                        <option value="letter">Letter (Portrait)</option>
                        <option value="letterl">Letter (Landscape)</option>
                    </select>
                </div>
                <div class="setting-group">
                    <label for="imageQuality">JPEG Quality</label>
                    <input type="range" id="imageQuality" min="50" max="100" step="5" value="90">
                    <span id="qualityValue">90%</span>
                </div>
            </div>

            <!-- Progress -->
            <div class="img2pdf-progress" id="progressBar">
                <div class="progress-bar-track">
                    <div class="progress-bar-fill" id="progressFill"></div>
                </div>
                <span class="progress-label" id="progressLabel">Processing…</span>
            </div>

            <!-- Image list -->
            <div class="img2pdf-list" id="imgList"></div>
        </div>
    `;
}

export function init(workspace, actionsContainer) {
    const dropzone = workspace.querySelector('#dropzone');
    const fileInput = workspace.querySelector('#fileInput');
    const imgList = workspace.querySelector('#imgList');
    const pageSizeSelect = workspace.querySelector('#pageSize');
    const qualitySlider = workspace.querySelector('#imageQuality');
    const qualityValue = workspace.querySelector('#qualityValue');
    const progressBar = workspace.querySelector('#progressBar');
    const progressFill = workspace.querySelector('#progressFill');
    const progressLabel = workspace.querySelector('#progressLabel');

    // ── State ──────────────────────────────────────────────────────────────
    let images = []; // { id, file, name, size, width, height, url }
    let dragSrcId = null;
    let lastPdfBlob = null; // holds the most recently generated PDF

    // ── Quality slider ─────────────────────────────────────────────────────
    qualitySlider.addEventListener('input', () => {
        qualityValue.textContent = qualitySlider.value + '%';
    });

    // ── Drop zone ──────────────────────────────────────────────────────────
    dropzone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropzone.classList.add('drag-over');
    });
    dropzone.addEventListener('dragleave', () => dropzone.classList.remove('drag-over'));
    dropzone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropzone.classList.remove('drag-over');
        addFiles(Array.from(e.dataTransfer.files));
    });
    fileInput.addEventListener('change', () => {
        addFiles(Array.from(fileInput.files));
        fileInput.value = '';
    });

    // ── Add files ──────────────────────────────────────────────────────────
    async function addFiles(files) {
        const accepted = files.filter(f => /\.(jpe?g|png)$/i.test(f.name) || ['image/jpeg', 'image/png'].includes(f.type));
        if (accepted.length === 0) {
            showToast('Only JPEG and PNG files are supported', 'warning');
            return;
        }
        if (accepted.length < files.length) {
            showToast(`${files.length - accepted.length} unsupported file(s) skipped`, 'warning');
        }

        for (const file of accepted) {
            const url = URL.createObjectURL(file);
            const dims = await getImageDimensions(url);
            images.push({
                id: crypto.randomUUID(),
                file,
                name: file.name,
                size: file.size,
                width: dims.width,
                height: dims.height,
                url,
            });
        }
        renderList();
        updateActions();
        lastPdfBlob = null; // new images = previous PDF is stale
    }

    function getImageDimensions(url) {
        return new Promise((resolve) => {
            const img = new Image();
            img.onload = () => resolve({ width: img.naturalWidth, height: img.naturalHeight });
            img.onerror = () => resolve({ width: 0, height: 0 });
            img.src = url;
        });
    }

    // ── Render list ────────────────────────────────────────────────────────
    function renderList() {
        imgList.innerHTML = images.map((img) => `
            <div class="img-item" draggable="true" data-id="${img.id}">
                <span class="img-drag-handle" title="Drag to reorder">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="9" cy="5" r="1" fill="currentColor" stroke="none"/>
                        <circle cx="15" cy="5" r="1" fill="currentColor" stroke="none"/>
                        <circle cx="9" cy="12" r="1" fill="currentColor" stroke="none"/>
                        <circle cx="15" cy="12" r="1" fill="currentColor" stroke="none"/>
                        <circle cx="9" cy="19" r="1" fill="currentColor" stroke="none"/>
                        <circle cx="15" cy="19" r="1" fill="currentColor" stroke="none"/>
                    </svg>
                </span>
                <img class="img-thumb" src="${img.url}" alt="${img.name}">
                <div class="img-info">
                    <div class="img-name">${escHtml(img.name)}</div>
                    <div class="img-meta">${img.width} × ${img.height} px · ${formatBytes(img.size)}</div>
                </div>
                <button class="img-remove" data-id="${img.id}" title="Remove">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                    </svg>
                </button>
            </div>
        `).join('');

        // Remove buttons
        imgList.querySelectorAll('.img-remove').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = btn.dataset.id;
                const entry = images.find(i => i.id === id);
                if (entry) URL.revokeObjectURL(entry.url);
                images = images.filter(i => i.id !== id);
                renderList();
                updateActions();
            });
        });

        // Drag-to-reorder within the list
        imgList.querySelectorAll('.img-item').forEach(item => {
            item.addEventListener('dragstart', () => {
                dragSrcId = item.dataset.id;
                item.classList.add('dragging');
            });
            item.addEventListener('dragend', () => {
                item.classList.remove('dragging');
                imgList.querySelectorAll('.img-item').forEach(i => i.classList.remove('drag-target'));
            });
            item.addEventListener('dragover', (e) => {
                e.preventDefault();
                imgList.querySelectorAll('.img-item').forEach(i => i.classList.remove('drag-target'));
                if (item.dataset.id !== dragSrcId) item.classList.add('drag-target');
            });
            item.addEventListener('drop', (e) => {
                e.preventDefault();
                e.stopPropagation();
                const targetId = item.dataset.id;
                if (!dragSrcId || dragSrcId === targetId) return;
                const srcIdx = images.findIndex(i => i.id === dragSrcId);
                const tgtIdx = images.findIndex(i => i.id === targetId);
                const [moved] = images.splice(srcIdx, 1);
                images.splice(tgtIdx, 0, moved);
                lastPdfBlob = null; // order changed — PDF is stale
                renderList();
            });
        });
    }

    // ── Toolbar actions ────────────────────────────────────────────────────
    function updateActions() {
        if (images.length === 0) {
            actionsContainer.innerHTML = '';
            return;
        }

        const downloadBtn = lastPdfBlob ? `
            <button class="btn btn-primary" id="btnDownload">
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                    <polyline points="7 10 12 15 17 10"/>
                    <line x1="12" y1="15" x2="12" y2="3"/>
                </svg>
                Download PDF
            </button>` : `
            <button class="btn btn-primary" id="btnConvert">
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                    <polyline points="14 2 14 8 20 8"/>
                    <line x1="12" y1="18" x2="12" y2="12"/>
                    <line x1="9" y1="15" x2="15" y2="15"/>
                </svg>
                Convert to PDF
            </button>`;

        actionsContainer.innerHTML = `
            <button class="btn btn-secondary" id="btnClearAll" style="color: var(--status-error); border-color: var(--status-error); background: var(--bg-main);">
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="3 6 5 6 21 6"/>
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                </svg>
                Clear All
            </button>
            ${downloadBtn}
        `;

        actionsContainer.querySelector('#btnClearAll').addEventListener('click', clearAll);
        const convertBtn = actionsContainer.querySelector('#btnConvert');
        const dlBtn = actionsContainer.querySelector('#btnDownload');
        if (convertBtn) convertBtn.addEventListener('click', convertToPdf);
        if (dlBtn) dlBtn.addEventListener('click', triggerDownload);
    }

    function clearAll() {
        images.forEach(i => URL.revokeObjectURL(i.url));
        images = [];
        lastPdfBlob = null;
        renderList();
        updateActions();
        showToast('All images removed', 'info');
    }

    function triggerDownload() {
        if (!lastPdfBlob) return;
        downloadBlob(lastPdfBlob, `images-${Date.now()}.pdf`);
    }

    // ── PDF generation (pure client-side) ─────────────────────────────────
    // Page size definitions in points (1pt = 1/72 inch)
    const PAGE_SIZES = {
        a4: { w: 595.28, h: 841.89 },
        a4l: { w: 841.89, h: 595.28 },
        letter: { w: 612, h: 792 },
        letterl: { w: 792, h: 612 },
    };

    async function convertToPdf() {
        if (images.length === 0) return;

        const quality = parseInt(qualitySlider.value, 10) / 100;
        const pageSizeKey = pageSizeSelect.value;

        progressBar.classList.add('visible');
        setProgress(0, `Preparing…`);

        // Disable button during processing
        const convertBtn = actionsContainer.querySelector('#btnConvert');
        if (convertBtn) convertBtn.disabled = true;

        try {
            const pdfBytes = await buildPdf(images, pageSizeKey, quality, (done, total) => {
                setProgress((done / total) * 100, `Processing image ${done} of ${total}…`);
            });

            lastPdfBlob = new Blob([pdfBytes], { type: 'application/pdf' });

            setProgress(100, 'Done! Click Download PDF to save.');
            setTimeout(() => progressBar.classList.remove('visible'), 2500);

            updateActions(); // swap Convert → Download button
            showToast(`PDF ready — ${images.length} page(s)`, 'success');
        } catch (err) {
            console.error('PDF generation error', err);
            showToast('Failed to create PDF: ' + err.message, 'error');
            progressBar.classList.remove('visible');
        } finally {
            if (convertBtn) convertBtn.disabled = false;
        }
    }

    function setProgress(pct, label) {
        progressFill.style.width = pct + '%';
        progressLabel.textContent = label;
    }

    // ─────────────────────────────────────────────────────────────────────
    // Core PDF builder — minimal but spec-compliant PDF 1.4.
    // Object layout per page (3 objects):
    //   pId  = page dictionary
    //   csId = content stream (draws the image)
    //   xiId = image XObject (DCTDecode / JPEG)
    // Global objects: catalogId=1, pagesId=2, pages start at obj 3.
    // ─────────────────────────────────────────────────────────────────────
    async function buildPdf(images, pageSizeKey, quality, onProgress) {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        const parts = [];         // Uint8Array chunks
        const offsets = {};       // objId → byte offset
        let bytePos = 0;

        const enc = new TextEncoder();

        function write(data) {
            const bytes = typeof data === 'string' ? enc.encode(data) : data;
            parts.push(bytes);
            bytePos += bytes.length;
        }

        const catalogId = 1;
        const pagesId = 2;
        const firstObj = 3;     // first per-page object id

        const pageObjectIds = [];

        // ── PDF header ───────────────────────────────────────────────────
        write('%PDF-1.4\n%\xFF\xFF\xFF\xFF\n');

        // ── One pass: write page triplets ────────────────────────────────
        for (let i = 0; i < images.length; i++) {
            onProgress(i + 1, images.length);

            const entry = images[i];
            const img = await loadImage(entry.url);

            // Page dimensions (points)
            let pw, ph;
            if (pageSizeKey === 'fit') {
                pw = (img.naturalWidth * 72) / 96;
                ph = (img.naturalHeight * 72) / 96;
            } else {
                ({ w: pw, h: ph } = PAGE_SIZES[pageSizeKey]);
            }

            // Scale image to fit page (with margin for named sizes)
            const margin = pageSizeKey === 'fit' ? 0 : 28;
            const availW = pw - margin * 2;
            const availH = ph - margin * 2;
            const scale = Math.min(availW / img.naturalWidth, availH / img.naturalHeight, 1);
            const rw = Math.max(1, Math.round(img.naturalWidth * scale));
            const rh = Math.max(1, Math.round(img.naturalHeight * scale));

            canvas.width = rw;
            canvas.height = rh;
            ctx.clearRect(0, 0, rw, rh);
            ctx.drawImage(img, 0, 0, rw, rh);

            const jpegBytes = dataUrlToBytes(canvas.toDataURL('image/jpeg', quality));

            // Object ids for this page
            const pId = firstObj + i * 3;
            const csId = firstObj + i * 3 + 1;
            const xiId = firstObj + i * 3 + 2;
            pageObjectIds.push(pId);

            // Image placement in points (centered)
            const imgPtW = rw * (72 / 96);
            const imgPtH = rh * (72 / 96);
            const imgX = (pw - imgPtW) / 2;
            const imgY = (ph - imgPtH) / 2;

            const csBytes = enc.encode(
                `q\n${imgPtW.toFixed(3)} 0 0 ${imgPtH.toFixed(3)} ` +
                `${imgX.toFixed(3)} ${imgY.toFixed(3)} cm\n/Im0 Do\nQ\n`
            );

            // Page dictionary
            offsets[pId] = bytePos;
            write(`${pId} 0 obj\n`);
            write(`<< /Type /Page /Parent ${pagesId} 0 R\n`);
            write(`   /MediaBox [0 0 ${pw.toFixed(3)} ${ph.toFixed(3)}]\n`);
            write(`   /Contents ${csId} 0 R\n`);
            write(`   /Resources << /XObject << /Im0 ${xiId} 0 R >> >>\n`);
            write(`>>\nendobj\n`);

            // Content stream
            offsets[csId] = bytePos;
            write(`${csId} 0 obj\n<< /Length ${csBytes.length} >>\nstream\n`);
            write(csBytes);
            write(`\nendstream\nendobj\n`);

            // Image XObject
            offsets[xiId] = bytePos;
            write(`${xiId} 0 obj\n`);
            write(`<< /Type /XObject /Subtype /Image\n`);
            write(`   /Width ${rw} /Height ${rh}\n`);
            write(`   /ColorSpace /DeviceRGB /BitsPerComponent 8\n`);
            write(`   /Filter /DCTDecode /Length ${jpegBytes.length}\n>>\nstream\n`);
            write(jpegBytes);
            write(`\nendstream\nendobj\n`);
        }

        // ── Catalog ──────────────────────────────────────────────────────
        offsets[catalogId] = bytePos;
        write(`${catalogId} 0 obj\n<< /Type /Catalog /Pages ${pagesId} 0 R >>\nendobj\n`);

        // ── Pages dictionary ─────────────────────────────────────────────
        offsets[pagesId] = bytePos;
        write(`${pagesId} 0 obj\n`);
        write(`<< /Type /Pages /Kids [${pageObjectIds.map(id => `${id} 0 R`).join(' ')}] /Count ${images.length} >>\n`);
        write(`endobj\n`);

        // ── Cross-reference table ────────────────────────────────────────
        const xrefOffset = bytePos;
        const maxId = firstObj + images.length * 3 - 1;
        const objCount = maxId + 1;

        write(`xref\n0 ${objCount}\n`);
        write(`0000000000 65535 f \n`); // obj 0 always free

        for (let id = 1; id < objCount; id++) {
            if (offsets[id] !== undefined) {
                write(String(offsets[id]).padStart(10, '0') + ' 00000 n \n');
            } else {
                write('0000000000 65535 f \n');
            }
        }

        write(`trailer\n<< /Size ${objCount} /Root ${catalogId} 0 R >>\n`);
        write(`startxref\n${xrefOffset}\n%%EOF\n`);

        // ── Merge into single buffer ─────────────────────────────────────
        const out = new Uint8Array(bytePos);
        let pos = 0;
        for (const chunk of parts) { out.set(chunk, pos); pos += chunk.length; }
        return out;
    }


    function loadImage(url) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => resolve(img);
            img.onerror = reject;
            img.src = url;
        });
    }

    function dataUrlToBytes(dataUrl) {
        const base64 = dataUrl.split(',')[1];
        const binaryStr = atob(base64);
        const bytes = new Uint8Array(binaryStr.length);
        for (let i = 0; i < binaryStr.length; i++) {
            bytes[i] = binaryStr.charCodeAt(i);
        }
        return bytes;
    }

    function downloadBlob(blob, filename) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setTimeout(() => URL.revokeObjectURL(url), 5000);
    }

    // ── Helpers ────────────────────────────────────────────────────────────
    function escHtml(str) {
        return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    }

    function formatBytes(bytes) {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
    }

    // Initial state
    updateActions();
}

export function destroy() {
    // nothing persistent to clean up
}
