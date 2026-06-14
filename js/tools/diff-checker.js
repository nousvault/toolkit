// diff-checker.js
import { el, btn, copy } from '../components/dom.js';

export function render(parent) {
  parent.innerHTML = '';

  const orig = el('textarea', { className: 'editor-textarea', placeholder: 'Original text...', spellcheck: false });
  const mod = el('textarea', { className: 'editor-textarea', placeholder: 'Modified text...', spellcheck: false });
  const out = el('div', { className: 'output-display', style: 'max-height:400px;overflow:auto;flex:0 0 auto' });

  function computeDiff() {
    const oLines = orig.value.split('\n');
    const mLines = mod.value.split('\n');
    const maxLen = Math.max(oLines.length, mLines.length);
    const result = [];
    for (let i = 0; i < maxLen; i++) {
      const ol = oLines[i] ?? '';
      const ml = mLines[i] ?? '';
      if (ol === ml) result.push(`<div class="diff-line"><span class="diff-line-number">${i + 1}</span><span class="diff-line-content">${ol}</span></div>`);
      else {
        if (ol) result.push(`<div class="diff-line removed"><span class="diff-line-number">${i + 1}</span><span class="diff-line-content">${ol}</span></div>`);
        if (ml) result.push(`<div class="diff-line added"><span class="diff-line-number">${i + 1}</span><span class="diff-line-content">${ml}</span></div>`);
      }
    }
    out.innerHTML = result.join('');
  }

  const runBtn = btn('Compare', 'btn-primary');
  runBtn.addEventListener('click', computeDiff);

  document.getElementById('topActions').innerHTML = '';
  document.getElementById('topActions').appendChild(runBtn);

  // Input grid
  const grid = el('div', { className: 'tool-grid-2' });
  [['Original', orig], ['Modified', mod]].forEach(([label, ta]) => {
    const pane = el('div', { className: 'pane' });
    pane.innerHTML = `<div class="pane-header"><span class="input-label">${label}</span></div>`;
    const ctr = el('div', { className: 'editor-container' });
    ctr.appendChild(ta);
    pane.appendChild(ctr);
    grid.appendChild(pane);
  });
  parent.appendChild(grid);

  // Diff output below
  const outSection = el('div', { style: 'margin-top:var(--spacing-lg)' });
  outSection.innerHTML = '<div class="pane-header"><span class="input-label">Diff</span></div>';
  const cpBtn = btn('Copy Diff', 'btn-secondary');
  cpBtn.addEventListener('click', () => copy(out.innerText));
  outSection.querySelector('.pane-header').appendChild(cpBtn);
  outSection.appendChild(out);
  parent.appendChild(outSection);
}
