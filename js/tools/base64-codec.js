// base64-codec.js
import { el, btn, copy, toast } from '../components/dom.js';

export function render(parent) {
  parent.innerHTML = '';

  const inTa = el('textarea', { className: 'editor-textarea', placeholder: 'Enter text or Base64 string...', spellcheck: false });
  const outTa = el('textarea', { className: 'editor-textarea', placeholder: 'Output appears here', spellcheck: false, readOnly: true });

  function encode() {
    try {
      outTa.value = btoa(unescape(encodeURIComponent(inTa.value)));
      toast('Encoded ✓', 'success');
    } catch (e) { toast('Encode failed: ' + e.message, 'error'); }
  }

  function decode() {
    try {
      outTa.value = decodeURIComponent(escape(atob(inTa.value.trim())));
      toast('Decoded ✓', 'success');
    } catch (e) { toast('Decode failed — check input is valid Base64', 'error'); }
  }

  document.getElementById('topActions').innerHTML = '';
  const clearBtn = btn('Clear All', 'btn-danger btn-icon');
  clearBtn.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg> Clear All`;
  clearBtn.addEventListener('click', () => { inTa.value = ''; outTa.value = ''; });
  document.getElementById('topActions').appendChild(clearBtn);

  // Left: input + encode/decode buttons; Right: output
  const grid = el('div', { className: 'tool-grid-2' });

  const left = el('div', { className: 'pane' });
  left.innerHTML = '<div class="pane-header"><span class="input-label">Input</span></div>';
  const inCtr = el('div', { className: 'editor-container' });
  inCtr.appendChild(inTa);
  left.appendChild(inCtr);
  const btnRow = el('div', { style: 'display:flex;gap:var(--spacing-sm);margin-top:var(--spacing-sm)' });
  const encBtn = btn('Encode → Base64', 'btn-primary');
  const decBtn = btn('Decode ← Base64', 'btn-primary');
  encBtn.addEventListener('click', encode);
  decBtn.addEventListener('click', decode);
  btnRow.appendChild(encBtn);
  btnRow.appendChild(decBtn);
  left.appendChild(btnRow);

  const right = el('div', { className: 'pane' });
  right.innerHTML = '<div class="pane-header"><span class="input-label">Output</span></div>';
  const outHeader = right.querySelector('.pane-header');
  const copyBtn = btn('Copy', 'btn-secondary');
  copyBtn.addEventListener('click', () => copy(outTa.value));
  outHeader.appendChild(copyBtn);
  const outCtr = el('div', { className: 'editor-container' });
  outCtr.appendChild(outTa);
  right.appendChild(outCtr);

  grid.appendChild(left);
  grid.appendChild(right);
  parent.appendChild(grid);
}
