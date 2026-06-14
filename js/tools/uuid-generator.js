// uuid-generator.js
import { el, btn } from '../components/dom.js';

export function render(parent) {
  const out = el('pre', { class: 'tool-output' });
  const countInput = el('input', { type: 'number', value: '1', min: '1', max: '50', class: 'tool-input' });

  function uuidV4() {
    return crypto.randomUUID();
  }

  function uuidV7() {
    const ts = BigInt(Date.now());
    const tsh = Number((ts >> 24n) & 0xFFFFn);
    const tsm = Number((ts >> 12n) & 0xFFFn);
    const tsl = Number(ts & 0xFFFn);
    const rand = new Uint8Array(10);
    crypto.getRandomValues(rand);
    const hex = (n, d) => n.toString(16).padStart(d, '0');
    return `${hex(tsh, 4)}${hex(tsm, 3)}-7${hex(tsl, 3)}-${
      hex((rand[0] & 0x3f) | 0x80, 2)}${hex(rand[1], 2)}-${
      hex(rand[2], 2)}${hex(rand[3], 2)}${hex(rand[4], 2)}${
      hex(rand[5], 2)}${hex(rand[6], 2)}${hex(rand[7], 2)}${hex(rand[8], 2)}${hex(rand[9], 2)}`;
  }

  function generate(fn) {
    const n = Math.min(Math.max(Number(countInput.value) || 1, 1), 50);
    const uuids = [];
    for (let i = 0; i < n; i++) uuids.push(fn());
    out.textContent = uuids.join('\n');
    out.style.color = '';
  }

  const v4Btn = btn('UUID v4', 'btn-primary');
  const v7Btn = btn('UUID v7', 'btn-primary');
  const copyBtn = btn('Copy');

  v4Btn.addEventListener('click', () => generate(uuidV4));
  v7Btn.addEventListener('click', () => generate(uuidV7));
  copyBtn.addEventListener('click', () => navigator.clipboard?.writeText(out.textContent));

  parent.appendChild(el('div', {}, [
    el('div', { class: 'tool-field', innerHTML: '<label>Count</label>' }, [countInput]),
    el('div', { class: 'tool-controls' }, [v4Btn, v7Btn, copyBtn]),
    el('div', { class: 'tool-result' }, [out]),
  ]));

  generate(uuidV4);
}
