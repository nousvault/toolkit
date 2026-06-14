// image-to-pdf.js — JPEG/PNG to PDF via jsPDF CDN
import { el, btn, toast } from '../components/dom.js';

export function render(parent) {
  parent.innerHTML = '';

  const dropArea = el('div', { className: 'file-upload-area', innerHTML: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg><span>Drop images here or click to select<br><small>JPEG, PNG</small></span>` });
  const fileInput = el('input', { type: 'file', accept: 'image/jpeg,image/png', multiple: true, style: 'display:none' });
  const previewGrid = el('div', { className: 'preview-grid' });
  const statusEl = el('div', { className: 'progress-msg' });
  let files = [];

  dropArea.addEventListener('click', () => fileInput.click());

  function addFiles(flist) {
    files = [...files, ...flist];
    previewGrid.innerHTML = '';
    files.forEach(f => {
      const img = el('img', { src: URL.createObjectURL(f) });
      previewGrid.appendChild(img);
    });
    statusEl.textContent = `${files.length} image(s) selected`;
  }

  dropArea.addEventListener('dragover', e => { e.preventDefault(); dropArea.classList.add('dragover'); });
  dropArea.addEventListener('dragleave', () => dropArea.classList.remove('dragover'));
  dropArea.addEventListener('drop', e => { e.preventDefault(); dropArea.classList.remove('dragover'); addFiles([...e.dataTransfer.files]); });
  fileInput.addEventListener('change', () => addFiles([...fileInput.files]));

  async function convert() {
    if (!files.length) { toast('No images selected', 'error'); return; }
    statusEl.textContent = 'Loading jsPDF...';
    const { jsPDF } = await import('https://unpkg.com/jspdf@3/dist/jspdf.es.min.js');
    const doc = new jsPDF();

    for (let i = 0; i < files.length; i++) {
      statusEl.textContent = `Processing ${i + 1}/${files.length}...`;
      const dataUrl = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(files[i]);
      });

      if (i > 0) doc.addPage();
      const img = new Image();
      await new Promise((resolve, reject) => { img.onload = resolve; img.onerror = reject; img.src = dataUrl; });

      const pw = doc.internal.pageSize.getWidth();
      const ph = doc.internal.pageSize.getHeight();
      const ratio = Math.min(pw / img.width, ph / img.height);
      const w = img.width * ratio, h = img.height * ratio;
      const x = (pw - w) / 2, y = (ph - h) / 2;
      doc.addImage(dataUrl, files[i].type === 'image/png' ? 'PNG' : 'JPEG', x, y, w, h);
    }

    doc.save(`images-${Date.now()}.pdf`);
    toast(`PDF saved: ${files.length} page(s)`, 'success');
    statusEl.textContent = `Done — ${files.length} page(s)`;
  }

  const convertBtn = btn('Convert to PDF', 'btn-primary');
  convertBtn.addEventListener('click', convert);
  const clearBtn = btn('Clear', 'btn-secondary');
  clearBtn.addEventListener('click', () => { files = []; previewGrid.innerHTML = ''; statusEl.textContent = ''; });

  document.getElementById('topActions').innerHTML = '';
  document.getElementById('topActions').append(convertBtn, clearBtn);

  parent.appendChild(dropArea);
  parent.appendChild(fileInput);
  parent.appendChild(previewGrid);
  parent.appendChild(statusEl);
}
