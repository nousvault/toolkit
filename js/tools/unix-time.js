// unix-time.js
import { el, btn } from '../components/dom.js';

export function render(parent) {
  const tsInput = el('input', { type: 'text', placeholder: 'Unix timestamp (seconds) …', class: 'tool-input' });
  const isoInput = el('input', { type: 'text', placeholder: 'ISO date (e.g. 2026-06-14T12:00:00Z) …', class: 'tool-input' });
  const out = el('pre', { class: 'tool-output' });

  const now = Math.floor(Date.now() / 1000);
  tsInput.value = String(now);
  out.textContent = new Date(now * 1000).toISOString();

  function tsToDate() {
    const v = Number(tsInput.value);
    if (!v) { out.textContent = 'Enter a numeric timestamp'; return; }
    const d = new Date(v > 9999999999 ? v : v * 1000);
    out.textContent = d.toISOString() + '\n' + d.toString();
    out.style.color = '';
  }

  function dateToTs() {
    const d = new Date(isoInput.value);
    if (isNaN(d)) { out.textContent = 'Invalid date'; return; }
    out.textContent = `Unix (s): ${Math.floor(d / 1000)}\nUnix (ms): ${d.getTime()}`;
    out.style.color = '';
  }

  const toDateBtn = btn('Timestamp → Date', 'btn-primary');
  const toTsBtn = btn('Date → Timestamp', 'btn-primary');
  const nowBtn = btn('Now');
  const copyBtn = btn('Copy');

  toDateBtn.addEventListener('click', tsToDate);
  toTsBtn.addEventListener('click', dateToTs);
  nowBtn.addEventListener('click', () => { tsInput.value = String(Math.floor(Date.now()/1000)); tsToDate(); });
  copyBtn.addEventListener('click', () => navigator.clipboard?.writeText(out.textContent));

  parent.appendChild(el('div', {}, [
    el('div', { class: 'tool-field', innerHTML: '<label>Unix Timestamp (seconds)</label>' }, [tsInput]),
    el('div', { class: 'tool-controls' }, [toDateBtn, nowBtn]),
    el('hr', { class: 'separator' }),
    el('div', { class: 'tool-field', innerHTML: '<label>ISO Date</label>' }, [isoInput]),
    el('div', { class: 'tool-controls' }, [toTsBtn]),
    el('hr', { class: 'separator' }),
    el('div', { class: 'tool-controls' }, [copyBtn]),
    out,
  ]));
}
