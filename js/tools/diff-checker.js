// diff-checker.js
import { el, textarea, btn } from '../components/dom.js';

export function render(parent) {
  const left = textarea({ placeholder: 'Original text …', class: 'tool-input', rows: 8 });
  const right = textarea({ placeholder: 'Modified text …', class: 'tool-input', rows: 8 });
  const out = el('div', { class: 'tool-output diff-result' });

  function diff() {
    const a = left.value.split('\n'), b = right.value.split('\n');
    const max = Math.max(a.length, b.length);
    const frag = document.createDocumentFragment();
    for (let i = 0; i < max; i++) {
      const la = a[i] || '', lb = b[i] || '';
      if (la === lb) { frag.appendChild(el('div', { class: 'diff-eq', textContent: '  ' + la })); continue; }
      if (la) frag.appendChild(el('div', { class: 'diff-del', textContent: '- ' + la }));
      if (lb) frag.appendChild(el('div', { class: 'diff-ins', textContent: '+ ' + lb }));
    }
    out.innerHTML = ''; out.appendChild(frag);
  }

  const diffBtn = btn('Compare', 'btn-primary');
  diffBtn.addEventListener('click', diff);

  parent.appendChild(el('div', {}, [
    el('div', { class: 'tool-row' }, [el('div', {}, [left]), el('div', {}, [right])]),
    el('div', { class: 'tool-controls' }, [diffBtn, btn('Copy')]),
    out,
  ]));
  const copyBtn = parent.querySelector('.btn:not(.btn-primary)');
  copyBtn?.addEventListener('click', () => navigator.clipboard?.writeText(out.textContent));
}
