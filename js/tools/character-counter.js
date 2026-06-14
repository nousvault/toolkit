// character-counter.js
import { el, btn } from '../components/dom.js';

export function render(parent) {
  parent.innerHTML = '';

  const ta = el('textarea', { className: 'editor-textarea', placeholder: 'Type or paste text here...', spellcheck: false, rows: 12 });
  const statsEl = el('div', { className: 'output-display', style: 'display:grid;grid-template-columns:repeat(auto-fill,minmax(140px,1fr));gap:var(--spacing-sm)' });

  function update() {
    const t = ta.value;
    const words = t.trim() ? t.trim().split(/\s+/).length : 0;
    const lines = t ? t.split('\n').length : 0;
    const chars = t.length;
    const charsNoSpace = t.replace(/\s/g, '').length;
    const bytes = new TextEncoder().encode(t).length;
    statsEl.innerHTML = [
      ['Characters', chars], ['Words', words], ['Lines', lines],
      ['Chars (no spaces)', charsNoSpace], ['Bytes', bytes],
      ['Paragraphs', t ? t.split(/\n\n+/).filter(p => p.trim()).length : 0],
    ].map(([l, v]) => `<div class="ip-field"><div class="ip-field-label">${l}</div><div class="ip-field-value">${v}</div></div>`).join('');
  }

  ta.addEventListener('input', update);

  document.getElementById('topActions').innerHTML = '';
  const clearBtn = btn('Clear', 'btn-secondary');
  clearBtn.addEventListener('click', () => { ta.value = ''; update(); });
  document.getElementById('topActions').appendChild(clearBtn);

  const editorCtr = el('div', { className: 'editor-container', style: 'height:300px;flex:0 0 auto' });
  editorCtr.appendChild(ta);
  parent.appendChild(editorCtr);

  const sec = el('div', { style: 'margin-top:var(--spacing-md)' });
  sec.innerHTML = '<div class="input-label" style="margin-bottom:var(--spacing-xs)">Statistics</div>';
  sec.appendChild(statsEl);
  parent.appendChild(sec);
}
