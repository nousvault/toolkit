// password-generator.js
import { el, btn } from '../components/dom.js';

export function render(parent) {
  const out = el('pre', { class: 'tool-output' });
  const lenInput = el('input', { type: 'number', value: '20', min: '4', max: '128', class: 'tool-input' });
  const upperCb = el('input', { type: 'checkbox', checked: true });
  const lowerCb = el('input', { type: 'checkbox', checked: true });
  const numCb = el('input', { type: 'checkbox', checked: true });
  const symCb = el('input', { type: 'checkbox', checked: true });

  const pools = {
    upper: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
    lower: 'abcdefghijklmnopqrstuvwxyz',
    numbers: '0123456789',
    symbols: '!@#$%^&*()_+-=[]{}|;:,.<>?',
  };

  function generate() {
    const len = Math.min(Math.max(Number(lenInput.value) || 20, 4), 128);
    let chars = '';
    if (upperCb.checked) chars += pools.upper;
    if (lowerCb.checked) chars += pools.lower;
    if (numCb.checked)  chars += pools.numbers;
    if (symCb.checked)  chars += pools.symbols;
    if (!chars) { out.textContent = 'Enable at least one character set'; out.style.color = 'var(--warning)'; return; }

    const arr = new Uint32Array(len);
    crypto.getRandomValues(arr);
    out.textContent = Array.from(arr, x => chars[x % chars.length]).join('');
    out.style.color = '';
  }

  const genBtn = btn('Generate', 'btn-primary');
  const copyBtn = btn('Copy');

  genBtn.addEventListener('click', generate);
  copyBtn.addEventListener('click', () => navigator.clipboard?.writeText(out.textContent));

  parent.appendChild(el('div', {}, [
    el('div', { class: 'tool-field', innerHTML: '<label>Length</label>' }, [lenInput]),
    el('div', { class: 'tool-field', innerHTML: `<label>${upperCb.outerHTML} Upper (A-Z)</label>` }),
    el('div', { class: 'tool-field', innerHTML: `<label>${lowerCb.outerHTML} Lower (a-z)</label>` }),
    el('div', { class: 'tool-field', innerHTML: `<label>${numCb.outerHTML} Numbers (0-9)</label>` }),
    el('div', { class: 'tool-field', innerHTML: `<label>${symCb.outerHTML} Symbols (!@#…)</label>` }),
    el('div', { class: 'tool-controls' }, [genBtn, copyBtn]),
    el('div', { class: 'tool-result' }, [out]),
  ]));

  generate();
}
