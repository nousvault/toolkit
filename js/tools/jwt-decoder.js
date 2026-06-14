// jwt-decoder.js
import { el, btn, copy, toast } from '../components/dom.js';

export function render(parent) {
  parent.innerHTML = '';

  const ta = el('textarea', { className: 'editor-textarea', placeholder: 'Paste your JWT here...', spellcheck: false });
  const headerOut = el('div', { className: 'output-display', style: 'min-height:80px;overflow:auto' });
  const payloadOut = el('div', { className: 'output-display', style: 'min-height:80px;overflow:auto' });

  function decode() {
    const parts = ta.value.trim().split('.');
    if (parts.length !== 3) {
      headerOut.textContent = 'Invalid JWT (expected 3 dot-separated parts)';
      headerOut.style.color = 'var(--status-error)';
      payloadOut.textContent = '';
      return;
    }
    [headerOut, payloadOut].forEach((el, i) => {
      try {
        const raw = parts[i].replace(/-/g, '+').replace(/_/g, '/');
        const decoded = JSON.parse(atob(raw));
        el.textContent = JSON.stringify(decoded, null, 2);
        el.style.color = '';
      } catch (e) {
        el.textContent = `Decode error: ${e.message}`;
        el.style.color = 'var(--status-error)';
      }
    });
  }

  ta.addEventListener('input', decode);

  document.getElementById('topActions').innerHTML = '';
  const pasteBtn = btn('Paste', 'btn-secondary');
  pasteBtn.addEventListener('click', async () => {
    try { const t = await navigator.clipboard.readText(); ta.value = t; decode(); } catch { toast('Clipboard access denied', 'error'); }
  });
  const clearBtn = btn('Clear', 'btn-secondary');
  clearBtn.addEventListener('click', () => { ta.value = ''; headerOut.textContent = ''; payloadOut.textContent = ''; });
  document.getElementById('topActions').append(pasteBtn, clearBtn);

  // Left: input; Right: decoded
  const left = el('div', { className: 'pane', style: 'flex:1.5' });
  left.innerHTML = '<div class="pane-header"><span class="input-label">Encoded (JWT)</span></div>';
  const ctr = el('div', { className: 'editor-container' });
  ctr.appendChild(ta);
  left.appendChild(ctr);

  const right = el('div', { className: 'pane', style: 'flex:1' });
  right.innerHTML = `<div class="pane-header"><span class="input-label">Decoded</span></div>
    <div class="input-label" style="margin-top:var(--spacing-sm)">HEADER</div>`;
  right.appendChild(headerOut);
  right.appendChild(el('div', { className: 'input-label', style: 'margin-top:var(--spacing-md)', textContent: 'PAYLOAD' }));
  right.appendChild(payloadOut);
  const copyBtn = btn('Copy All', 'btn-secondary');
  copyBtn.addEventListener('click', () => copy(
    JSON.stringify({ header: headerOut.textContent, payload: payloadOut.textContent }, null, 2)));
  right.appendChild(el('div', { style: 'margin-top:var(--spacing-sm)' }, [copyBtn]));

  const grid = el('div', { className: 'tool-grid-2', style: 'grid-template-columns:1.5fr 1fr' });
  grid.appendChild(left);
  grid.appendChild(right);
  parent.appendChild(grid);
}
