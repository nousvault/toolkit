// image-to-pdf.js — converts images to PDF using jsPDF CDN (lazy-loaded)
import { el, btn } from '../components/dom.js';

export function render(parent) {
  const fileInput = el('input', { type: 'file', accept: 'image/jpeg,image/png', multiple: true });
  const previewList = el('div', { class: 'preview-list' });
  const out = el('div', { class: 'tool-output' });
  const status = el('div', { class: 'tool-empty' });

  let files = [];

  fileInput.addEventListener('change', () => {
    files = Array.from(fileInput.files);
    previewList.innerHTML = '';
    files.forEach(f => {
      const url = URL.createObjectURL(f);
      const img = el('img', { class: 'preview-thumb', src: url });
      img.onload = () => URL.revokeObjectURL(url);
      previewList.appendChild(img);
    });
    status.textContent = `${files.length} image(s) selected`;
  });

  async function convert() {
    if (!files.length) { status.textContent = 'Select at least one image'; return; }
    status.textContent = 'Loading jsPDF …';
    const { jsPDF } = await import('https://unpkg.com/jspdf@3/dist/jspdf.es.min.js');

    const doc = new jsPDF();
    for (let i = 0; i < files.length; i++) {
      status.textContent = `Processing ${i + 1}/${files.length} …`;
      const dataUrl = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(files[i]);
      });

      if (i > 0) doc.addPage();
      const img = new Image();
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
        img.src = dataUrl;
      });

      const pageW = doc.internal.pageSize.getWidth();
      const pageH = doc.internal.pageSize.getHeight();
      const ratio = Math.min(pageW / img.width, pageH / img.height);
      const w = img.width * ratio;
      const h = img.height * ratio;
      const x = (pageW - w) / 2;
      const y = (pageH - h) / 2;
      doc.addImage(dataUrl, files[i].type === 'image/png' ? 'PNG' : 'JPEG', x, y, w, h);
    }

    doc.save(`images-${Date.now()}.pdf`);
    status.textContent = `PDF saved: ${files.length} page(s)`;
  }

  const convertBtn = btn('Convert to PDF', 'btn-primary');
  convertBtn.addEventListener('click', convert);

  parent.appendChild(el('div', {}, [
    el('div', { class: 'tool-field', innerHTML: '<label>Images (JPEG, PNG)</label>' }, [fileInput]),
    previewList,
    el('div', { class: 'tool-controls' }, [convertBtn]),
    out,
    status,
  ]));
}
