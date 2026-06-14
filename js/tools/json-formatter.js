// json-formatter.js
import { el, textarea, btn, section } from '../components/dom.js';

export function render(parent) {
  const inp = textarea({ placeholder: 'Paste JSON here …', class: 'tool-input', rows: 10 });
  const out = el('pre', { class: 'tool-output' });

  const formatBtn = btn('Format', 'btn-primary');
  const compactBtn = btn('Compact');
  const copyBtn = btn('Copy');

  function format(compact) {
    try {
      const obj = JSON.parse(inp.value);
      out.textContent = JSON.stringify(obj, null, compact ? 0 : 2);
      out.style.color = '';
    } catch (e) {
      out.textContent = 'Invalid JSON: ' + e.message;
      out.style.color = 'var(--warning)';
    }
  }

  formatBtn.addEventListener('click', () => format(false));
  compactBtn.addEventListener('click', () => format(true));
  copyBtn.addEventListener('click', () => { navigator.clipboard?.writeText(out.textContent); });

  parent.appendChild(section([
    inp,
    el('div', { class: 'tool-controls' }, [formatBtn, compactBtn, copyBtn]),
    el('div', { class: 'tool-result' }, [out]),
  ]));
}
