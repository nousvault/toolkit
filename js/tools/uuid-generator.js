// uuid-generator.js
import { el, btn, copy } from '../components/dom.js';

export function render(parent) {
  parent.innerHTML = '';

  const countInput = el('input', { type: 'number', value: '1', min: '1', max: '50' });
  const out = el('div', { className: 'output-display', style: 'min-height:100px;font-size:1rem' });

  function uuidV4() { return crypto.randomUUID(); }

  function uuidV7() {
    const ts = BigInt(Date.now());
    const hex = (n, d) => n.toString(16).padStart(d, '0');
    const tsh = Number((ts >> 24n) & 0xFFFFn);
    const tsm = Number((ts >> 12n) & 0xFFFn);
    const tsl = Number(ts & 0xFFFn);
    const rand = new Uint8Array(10);
    crypto.getRandomValues(rand);
    return `${hex(tsh,4)}${hex(tsm,3)}-7${hex(tsl,3)}-${
      hex((rand[0]&0x3f)|0x80,2)}${hex(rand[1],2)}-${
      hex(rand[2],2)}${hex(rand[3],2)}${hex(rand[4],2)}${
      hex(rand[5],2)}${hex(rand[6],2)}${hex(rand[7],2)}${hex(rand[8],2)}${hex(rand[9],2)}`;
  }

  let currentVersion = 'v4';
  function generate() {
    const n = Math.min(Math.max(Number(countInput.value) || 1, 1), 50);
    const fn = currentVersion === 'v7' ? uuidV7 : uuidV4;
    const uuids = [];
    for (let i = 0; i < n; i++) uuids.push(fn());
    out.textContent = uuids.join('\n');
  }

  // Version pills
  const pillTog = el('div', { className: 'pill-toggle' });
  ['v4', 'v7'].forEach(v => {
    const p = el('button', { className: `pill-option ${currentVersion === v ? 'active' : ''}`, textContent: v.toUpperCase(), type: 'button' });
    p.addEventListener('click', () => {
      pillTog.querySelectorAll('.pill-option').forEach(o => o.classList.remove('active'));
      p.classList.add('active');
      currentVersion = v;
      generate();
    });
    pillTog.appendChild(p);
  });

  const genBtn = btn('Generate UUIDs', 'btn-primary');
  genBtn.addEventListener('click', generate);

  document.getElementById('topActions').innerHTML = '';
  const copyBtn = btn('Copy', 'btn-secondary');
  copyBtn.addEventListener('click', () => copy(out.textContent));
  document.getElementById('topActions').appendChild(copyBtn);

  parent.appendChild(el('div', { className: 'input-label', textContent: 'UUID VERSION' }));
  parent.appendChild(pillTog);
  parent.appendChild(el('div', { style: 'margin-top:var(--spacing-sm)' }, [genBtn]));
  parent.appendChild(el('div', { style: 'margin-top:var(--spacing-sm)', className: 'input-label', innerHTML: 'Count &nbsp;'}));
  countInput.style.width = '80px';
  const row = el('div', { style: 'display:flex;gap:var(--spacing-sm);align-items:center;margin-bottom:var(--spacing-md)' });
  row.appendChild(countInput);
  row.appendChild(genBtn);
  parent.appendChild(row);
  parent.appendChild(out);

  generate();
}
