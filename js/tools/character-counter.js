// character-counter.js
import { el, textarea, btn } from '../components/dom.js';

export function render(parent) {
  const inp = textarea({ placeholder: 'Type or paste text …', class: 'tool-input', rows: 8 });
  const stats = el('div', { class: 'tool-stats' });

  function update() {
    const t = inp.value;
    const chars = t.length;
    const words = t.trim() ? t.trim().split(/\s+/).length : 0;
    const lines = t ? t.split('\n').length : 0;
    const bytes = new TextEncoder().encode(t).length;
    stats.innerHTML = [
      { label: 'Characters', value: chars },
      { label: 'Words', value: words },
      { label: 'Lines', value: lines },
      { label: 'Bytes (UTF-8)', value: bytes },
    ].map(s => `<div class="stat-item"><div class="stat-label">${s.label}</div><div class="stat-value">${s.value}</div></div>`).join('');
  }

  inp.addEventListener('input', update);

  parent.appendChild(el('div', {}, [
    el('div', { class: 'tool-field', innerHTML: '<label>Text</label>' }, [inp]),
    stats,
    el('div', { class: 'tool-controls' }, [btn('Copy Text')]),
  ]));

  const copyBtn = parent.querySelector('.btn');
  copyBtn?.addEventListener('click', () => navigator.clipboard?.writeText(inp.value));
  update();
}
