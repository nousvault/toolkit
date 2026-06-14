// unix-time.js
import { el, btn, copy } from '../components/dom.js';

export function render(parent) {
  parent.innerHTML = '';

  const now = Math.floor(Date.now() / 1000);
  const tsInput = el('input', { type: 'text', value: String(now), placeholder: 'Unix timestamp (seconds)' });
  const isoInput = el('input', { type: 'text', value: new Date(now * 1000).toISOString(), placeholder: 'ISO date' });
  const out = el('div', { className: 'output-display', style: 'min-height:60px;font-size:1rem' });

  function tsToDate() {
    const v = Number(tsInput.value);
    if (!v) { out.textContent = 'Enter a numeric timestamp'; return; }
    const d = new Date(v > 9999999999 ? v : v * 1000);
    out.textContent = `${d.toISOString()}\n${d.toString()}`;
    isoInput.value = d.toISOString();
  }

  function dateToTs() {
    const d = new Date(isoInput.value);
    if (isNaN(d)) { out.textContent = 'Invalid date format'; return; }
    out.textContent = `Unix (seconds): ${Math.floor(d / 1000)}\nUnix (ms): ${d.getTime()}`;
    tsInput.value = String(Math.floor(d / 1000));
  }

  tsInput.addEventListener('input', tsToDate);
  isoInput.addEventListener('input', dateToTs);

  const nowBtn = btn('Now', 'btn-secondary');
  const copyBtn = btn('Copy', 'btn-secondary');
  nowBtn.addEventListener('click', () => { const n = Math.floor(Date.now()/1000); tsInput.value = String(n); tsToDate(); });
  copyBtn.addEventListener('click', () => copy(out.textContent));

  document.getElementById('topActions').innerHTML = '';
  document.getElementById('topActions').append(nowBtn, copyBtn);

  // Layout: two input rows + output
  parent.appendChild(el('div', { className: 'input-label', textContent: 'UNIX TIMESTAMP' }));
  parent.appendChild(tsInput);
  parent.appendChild(el('div', { style: 'margin-top:var(--spacing-md)', className: 'input-label', textContent: 'ISO DATE' }));
  parent.appendChild(isoInput);
  parent.appendChild(el('div', { style: 'margin-top:var(--spacing-md)', className: 'input-label', textContent: 'RESULT' }));
  parent.appendChild(out);

  tsToDate();
}
