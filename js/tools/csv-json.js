// csv-json.js
import { el, btn, copy, toast } from '../components/dom.js';

export function render(parent) {
  const csvTa = el('textarea', { className: 'editor-textarea', placeholder: 'Paste CSV or drag & drop...', spellcheck: false });
  const jsonTa = el('textarea', { className: 'editor-textarea', placeholder: 'Paste JSON array or drag & drop...', spellcheck: false });

  parent.innerHTML = '';

  function csvToJson() {
    try {
      const lines = csvTa.value.trim().split('\n');
      if (lines.length < 2) throw new Error('Need header + data rows');
      const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
      const rows = [];
      for (let i = 1; i < lines.length; i++) {
        const vals = lines[i].split(',').map(v => v.trim().replace(/^"|"$/g, ''));
        const obj = {};
        headers.forEach((h, j) => obj[h] = vals[j] || '');
        rows.push(obj);
      }
      jsonTa.value = JSON.stringify(rows, null, 2);
      toast('CSV → JSON', 'success');
    } catch (e) { toast(e.message, 'error'); }
  }

  function jsonToCsv() {
    try {
      const arr = JSON.parse(jsonTa.value);
      if (!Array.isArray(arr) || arr.length === 0) throw new Error('Expected non-empty JSON array');
      const headers = Object.keys(arr[0]);
      const rows = [headers.join(',')];
      arr.forEach(obj => rows.push(headers.map(h => {
        const v = obj[h];
        if (typeof v === 'string' && (v.includes(',') || v.includes('"'))) return `"${v.replace(/"/g, '""')}"`;
        return String(v);
      }).join(',')));
      csvTa.value = rows.join('\n');
      toast('JSON → CSV', 'success');
    } catch (e) { toast(e.message, 'error'); }
  }

  document.getElementById('topActions').innerHTML = '';

  const grid = el('div', { className: 'tool-grid-2' });

  [['CSV', csvTa], ['JSON', jsonTa]].forEach(([label, ta], i) => {
    const pane = el('div', { className: 'pane' });
    const header = el('div', { className: 'pane-header' });
    header.innerHTML = `<span class="input-label">${label}</span>`;
    pane.appendChild(header);

    const ctr = el('div', { className: 'editor-container' });
    ctr.appendChild(ta);
    pane.appendChild(ctr);

    const btnRow = el('div', { style: 'display:flex;gap:var(--spacing-sm)' });
    const convertBtn = btn(i === 0 ? 'Convert to JSON' : 'Convert to CSV', 'btn-primary');
    const copyBtnText = btn('Copy', 'btn-secondary');
    const clearBtn = btn('Clear', 'btn-secondary');

    convertBtn.addEventListener('click', i === 0 ? csvToJson : jsonToCsv);
    copyBtnText.addEventListener('click', () => copy(ta.value));
    clearBtn.addEventListener('click', () => { ta.value = ''; });

    btnRow.appendChild(convertBtn);
    btnRow.appendChild(copyBtnText);
    btnRow.appendChild(clearBtn);
    pane.appendChild(btnRow);
    grid.appendChild(pane);
  });

  parent.appendChild(grid);
}
