// password-generator.js
import { el, btn, copy } from '../components/dom.js';

export function render(parent) {
  parent.innerHTML = '';

  const out = el('div', { className: 'output-display', style: 'font-size:1.125rem;min-height:48px;display:flex;align-items:center' });
  const lenInput = el('input', { type: 'number', value: '20', min: '4', max: '128', style: 'width:100px' });

  const checkboxes = {};
  ['ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz', '0123456789', '!@#$%^&*()_+-=[]{}|;:,.<>?'].forEach((pool, i) => {
    const cb = el('input', { type: 'checkbox', checked: true });
    const label = ['Upper (A-Z)', 'Lower (a-z)', 'Numbers (0-9)', 'Symbols (!@#…)'][i];
    Object.defineProperty(checkboxes, label.split(' ')[0].toLowerCase() + i, { get: () => cb });
    const row = el('div', { className: 'checkbox-row' });
    row.appendChild(cb);
    row.appendChild(el('label', { textContent: label }));
    parent.appendChild(row);
  });

  function generate() {
    const len = Math.min(Math.max(Number(lenInput.value) || 20, 4), 128);
    let chars = '';
    const cbs = parent.querySelectorAll('input[type="checkbox"]');
    const pools = ['ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz', '0123456789', '!@#$%^&*()_+-=[]{}|;:,.<>?'];
    cbs.forEach((cb, i) => { if (cb.checked) chars += pools[i]; });
    if (!chars) { out.textContent = 'Enable at least one character set'; out.style.color = 'var(--status-error)'; return; }
    const arr = new Uint32Array(len);
    crypto.getRandomValues(arr);
    out.textContent = Array.from(arr, x => chars[x % chars.length]).join('');
    out.style.color = '';
  }

  const genBtn = btn('Generate', 'btn-primary');
  genBtn.addEventListener('click', generate);

  document.getElementById('topActions').innerHTML = '';
  const copyBtn = btn('Copy', 'btn-secondary');
  copyBtn.addEventListener('click', () => copy(out.textContent));
  document.getElementById('topActions').appendChild(copyBtn);

  parent.appendChild(el('div', { className: 'input-label', textContent: 'LENGTH' }));
  parent.appendChild(lenInput);
  parent.appendChild(el('div', { style: 'margin-top:var(--spacing-md)', className: 'input-label', textContent: 'CHARACTER SETS' }));
  // Checkboxes already appended above
  parent.appendChild(el('div', { style: 'margin-top:var(--spacing-md)' }, [genBtn]));
  parent.appendChild(el('div', { style: 'margin-top:var(--spacing-md)', className: 'input-label', textContent: 'GENERATED PASSWORD' }));
  parent.appendChild(out);

  generate();
}
