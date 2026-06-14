// base64-codec.js
import { el, textarea, btn } from '../components/dom.js';

export function render(parent) {
  const inp = textarea({ placeholder: 'Text or Base64 string …', class: 'tool-input', rows: 5 });
  const out = el('pre', { class: 'tool-output' });

  const encodeBtn = btn('Encode → Base64', 'btn-primary');
  const decodeBtn = btn('Decode ← Base64', 'btn-primary');

  encodeBtn.addEventListener('click', () => {
    try {
      out.textContent = btoa(unescape(encodeURIComponent(inp.value)));
      out.style.color = '';
    } catch (e) { out.textContent = 'Encode error: ' + e.message; out.style.color = 'var(--warning)'; }
  });

  decodeBtn.addEventListener('click', () => {
    try {
      out.textContent = decodeURIComponent(escape(atob(inp.value.trim())));
      out.style.color = '';
    } catch (e) { out.textContent = 'Decode error (check input is valid Base64): ' + e.message; out.style.color = 'var(--warning)'; }
  });

  const copyBtn = btn('Copy');
  copyBtn.addEventListener('click', () => navigator.clipboard?.writeText(out.textContent));

  parent.appendChild(el('div', {}, [
    el('div', { class: 'tool-field', innerHTML: '<label>Input</label>' }, [inp]),
    el('div', { class: 'tool-controls' }, [encodeBtn, decodeBtn, copyBtn]),
    el('div', { class: 'tool-result' }, [out]),
  ]));
}
