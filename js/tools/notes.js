// notes.js — browser scratchpad, persisted to localStorage
import { el, btn, toast } from '../components/dom.js';

const KEY = 'toolkit-notes';

export function render(parent) {
  parent.innerHTML = '';

  const ta = el('textarea', { className: 'editor-textarea', placeholder: 'Write notes here... saved automatically to localStorage', spellcheck: false, rows: 15 });
  ta.value = localStorage.getItem(KEY) || '';

  let saveTimer;
  ta.addEventListener('input', () => {
    clearTimeout(saveTimer);
    saveTimer = setTimeout(() => {
      localStorage.setItem(KEY, ta.value);
      toast('Saved', 'success');
    }, 500);
  });

  document.getElementById('topActions').innerHTML = '';
  const clearBtn = btn('Clear', 'btn-danger');
  clearBtn.addEventListener('click', () => { ta.value = ''; localStorage.removeItem(KEY); toast('Cleared', 'success'); });
  document.getElementById('topActions').appendChild(clearBtn);

  const editorCtr = el('div', { className: 'editor-container', style: 'flex:1' });
  editorCtr.appendChild(ta);
  parent.appendChild(editorCtr);
}
