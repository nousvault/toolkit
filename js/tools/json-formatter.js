// json-formatter.js
import { el, btn, copy, toast } from '../components/dom.js';

export function render(parent) {
  const ta = el('textarea', { className: 'editor-textarea', placeholder: 'Paste JSON here...', spellcheck: false });
  const out = el('div', { className: 'output-display', textContent: 'Formatted output will appear here' });
  out.style.cssText = 'flex:1;overflow:auto';

  parent.innerHTML = '';

  function format() {
    try {
      const val = JSON.parse(ta.value);
      out.textContent = JSON.stringify(val, null, 2);
      out.style.color = '';
    } catch (e) {
      out.textContent = `Invalid JSON: ${e.message}`;
      out.style.color = 'var(--status-error)';
    }
  }

  ta.addEventListener('input', format);

  document.getElementById('topActions').innerHTML = '';
  const clearBtn = btn('Clear All', 'btn-danger btn-icon');
  clearBtn.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg> Clear All`;
  clearBtn.addEventListener('click', () => { ta.value = ''; out.textContent = ''; });
  document.getElementById('topActions').appendChild(clearBtn);

  const grid = el('div', { className: 'tool-grid-2' });
  const left = el('div', { className: 'pane' });
  const right = el('div', { className: 'pane' });

  left.innerHTML = '<div class="pane-header"><span class="input-label">Input JSON</span></div>';
  const editorCtr = el('div', { className: 'editor-container' });
  editorCtr.appendChild(ta);
  left.appendChild(editorCtr);

  right.innerHTML = '<div class="pane-header"><span class="input-label">Formatted Output</span></div>';
  const outCtr = el('div', { className: 'editor-container', style: 'background:var(--bg-base)' });
  outCtr.appendChild(out);
  const copyBtn = btn('Copy', 'btn-secondary');
  copyBtn.addEventListener('click', () => copy(out.textContent));
  right.querySelector('.pane-header').appendChild(copyBtn);
  right.appendChild(outCtr);

  grid.appendChild(left);
  grid.appendChild(right);
  parent.appendChild(grid);
}
