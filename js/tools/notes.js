// notes.js — browser scratchpad, persisted to localStorage
import { el, textarea, btn } from '../components/dom.js';

const STORAGE_KEY = 'toolkit-notes';

export function render(parent) {
  const inp = textarea({ placeholder: 'Write notes … auto-saved to localStorage', class: 'tool-input', rows: 14 });
  inp.value = localStorage.getItem(STORAGE_KEY) || '';

  let saveTimer;
  inp.addEventListener('input', () => {
    clearTimeout(saveTimer);
    saveTimer = setTimeout(() => localStorage.setItem(STORAGE_KEY, inp.value), 400);
  });

  const clearBtn = btn('Clear');
  clearBtn.addEventListener('click', () => { inp.value = ''; localStorage.removeItem(STORAGE_KEY); });

  parent.appendChild(el('div', {}, [
    el('div', { class: 'tool-field', innerHTML: '<label>Notes</label>' }, [inp]),
    el('div', { class: 'tool-controls' }, [clearBtn]),
    el('p', { class: 'tool-empty', textContent: 'Saved to localStorage. Survives page reload, stays on this browser only.' }),
  ]));
}
