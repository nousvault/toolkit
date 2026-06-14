// image-to-text.js — OCR using Tesseract.js v5 CDN
import { el, btn, copy } from '../components/dom.js';

export function render(parent) {
  parent.innerHTML = '';

  const dropArea = el('div', { className: 'file-upload-area', innerHTML: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg><span>Drop image here or click to select</span>` });
  const fileInput = el('input', { type: 'file', accept: 'image/*', style: 'display:none' });
  const preview = el('img', { style: 'max-width:300px;max-height:200px;display:none;border-radius:var(--radius-sm);border:1px solid var(--border-strong);margin:var(--spacing-sm) 0' });
  const out = el('div', { className: 'output-display', style: 'min-height:100px;margin-top:var(--spacing-md)', textContent: 'Select an image to extract text.' });
  const progress = el('div', { className: 'progress-msg', style: 'display:none' });

  let worker = null;

  async function loadTesseract() {
    if (worker) return worker;
    progress.style.display = 'block';
    progress.textContent = 'Loading Tesseract.js... (~4MB)';
    const { default: createWorker } = await import('https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/tesseract.esm.min.js');
    progress.textContent = 'Initializing OCR engine...';
    worker = await createWorker('eng', 1, {
      logger: m => { if (m.status === 'recognizing text') progress.textContent = `OCR: ${Math.round(m.progress * 100)}%`; },
    });
    progress.style.display = 'none';
    return worker;
  }

  async function processFile(file) {
    preview.src = URL.createObjectURL(file);
    preview.style.display = 'block';
    out.textContent = 'Processing...';
    progress.style.display = 'block';
    try {
      const w = await loadTesseract();
      const { data: { text } } = await w.recognize(file);
      out.textContent = text.trim() || '(no text found)';
      out.style.color = '';
    } catch (e) {
      out.textContent = 'OCR failed: ' + e.message;
      out.style.color = 'var(--status-error)';
    }
    progress.style.display = 'none';
  }

  dropArea.addEventListener('click', () => fileInput.click());
  dropArea.addEventListener('dragover', e => { e.preventDefault(); dropArea.classList.add('dragover'); });
  dropArea.addEventListener('dragleave', () => dropArea.classList.remove('dragover'));
  dropArea.addEventListener('drop', e => { e.preventDefault(); dropArea.classList.remove('dragover'); processFile(e.dataTransfer.files[0]); });
  fileInput.addEventListener('change', () => { if (fileInput.files[0]) processFile(fileInput.files[0]); });

  document.getElementById('topActions').innerHTML = '';
  const copyBtn = btn('Copy Text', 'btn-secondary');
  copyBtn.addEventListener('click', () => copy(out.textContent));
  document.getElementById('topActions').appendChild(copyBtn);

  parent.appendChild(dropArea);
  parent.appendChild(fileInput);
  parent.appendChild(preview);
  parent.appendChild(progress);
  parent.appendChild(out);
}
