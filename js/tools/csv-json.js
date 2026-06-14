// csv-json.js
import { el, textarea, btn } from '../components/dom.js';

export function render(parent) {
  const csvIn = textarea({ placeholder: 'Paste CSV here …', class: 'tool-input', rows: 6 });
  const jsonIn = textarea({ placeholder: 'Paste JSON array of objects here …', class: 'tool-input', rows: 6 });
  const out = el('pre', { class: 'tool-output' });

  function csvToJson() {
    try {
      const lines = csvIn.value.trim().split('\n');
      if (lines.length < 2) { out.textContent = 'Need header + at least 1 data row'; return; }
      const headers = parseCSVLine(lines[0]);
      const rows = [];
      for (let i = 1; i < lines.length; i++) {
        const vals = parseCSVLine(lines[i]);
        const obj = {};
        headers.forEach((h, j) => { obj[h] = vals[j] || ''; });
        rows.push(obj);
      }
      out.textContent = JSON.stringify(rows, null, 2);
      out.style.color = '';
    } catch (e) { out.textContent = 'CSV error: ' + e.message; out.style.color = 'var(--warning)'; }
  }

  function jsonToCsv() {
    try {
      const arr = JSON.parse(jsonIn.value);
      if (!Array.isArray(arr) || arr.length === 0) { out.textContent = 'Need non-empty JSON array'; return; }
      const keys = Object.keys(arr[0]);
      const lines = [keys.join(',')];
      arr.forEach(obj => { lines.push(keys.map(k => csvEscape(String(obj[k] ?? ''))).join(',')); });
      out.textContent = lines.join('\n');
      out.style.color = '';
    } catch (e) { out.textContent = 'JSON error: ' + e.message; out.style.color = 'var(--warning)'; }
  }

  parent.appendChild(el('div', {}, [
    el('div', { class: 'tool-row' }, [
      el('div', {}, [el('div', { class: 'tool-field', innerHTML: '<label>CSV</label>' }, [csvIn]), btn('CSV → JSON', 'btn-primary')]),
      el('div', {}, [el('div', { class: 'tool-field', innerHTML: '<label>JSON</label>' }, [jsonIn]), btn('JSON → CSV', 'btn-primary')]),
    ]),
    el('div', { class: 'tool-result' }, [out]),
    el('div', { class: 'tool-controls' }, [btn('Copy')]),
  ]));

  parent.querySelectorAll('.btn-primary').forEach((b, i) => b.addEventListener('click', i === 0 ? csvToJson : jsonToCsv));
  parent.querySelector('.btn:not(.btn-primary)')?.addEventListener('click', () => navigator.clipboard?.writeText(out.textContent));
}

function parseCSVLine(line) {
  const result = []; let current = ''; let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (inQuotes) { if (ch === '"') { if (line[i+1] === '"') { current += '"'; i++; } else inQuotes = false; } else current += ch; }
    else if (ch === '"') inQuotes = true;
    else if (ch === ',') { result.push(current.trim()); current = ''; }
    else current += ch;
  }
  result.push(current.trim());
  return result;
}

function csvEscape(s) { return /[,"\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s; }
