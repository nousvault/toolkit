// image-to-text.js — OCR using Tesseract.js CDN (lazy-loaded)
import { el, btn } from '../components/dom.js';

export function render(parent) {
  const fileInput = el('input', { type: 'file', accept: 'image/*' });
  const preview = el('img', { class: 'preview-thumb', style: 'display:none' });
  const out = el('pre', { class: 'tool-output', textContent: 'Select an image to extract text.' });
  const progress = el('div', { class: 'tool-empty', style: 'display:none' });

  let worker = null;

  async function loadTesseract() {
    if (worker) return worker;
    progress.style.display = 'block';
    progress.textContent = 'Loading Tesseract.js … (~4MB)';
    const { createWorker } = await import('https://unpkg.com/tesseract.js@6/dist/tesseract.esm.min.js');
    progress.textContent = 'Initializing OCR engine …';
    worker = await createWorker('eng', 1, {
      logger: m => { if (m.status === 'recognizing text') progress.textContent = `OCR: ${Math.round(m.progress * 100)}%`; },
    });
    progress.style.display = 'none';
    return worker;
  }

  fileInput.addEventListener('change', async () => {
    const file = fileInput.files[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    preview.src = url;
    preview.style.display = 'block';
    out.textContent = 'Processing …';
    try {
      const w = await loadTesseract();
      const { data: { text } } = await w.recognize(file);
      out.textContent = text.trim() || '(no text found)';
      out.style.color = '';
    } catch (e) {
      out.textContent = 'OCR failed: ' + e.message;
      out.style.color = 'var(--warning)';
    }
    URL.revokeObjectURL(url);
  });

  const copyBtn = btn('Copy Text');
  copyBtn.addEventListener('click', () => navigator.clipboard?.writeText(out.textContent));

  parent.appendChild(el('div', {}, [
    el('div', { class: 'tool-field', innerHTML: '<label>Image</label>' }, [fileInput]),
    el('div', { class: 'preview-list' }, [preview]),
    progress,
    el('div', { class: 'tool-controls' }, [copyBtn]),
    el('div', { class: 'tool-result' }, [out]),
    el('p', { class: 'tool-empty', textContent: 'Runs locally in the browser via Tesseract.js. No data sent to any server.' }),
  ]));
}
