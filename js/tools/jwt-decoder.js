// jwt-decoder.js
import { el, textarea, btn } from '../components/dom.js';

export function render(parent) {
  const inp = textarea({ placeholder: 'Paste JWT token …', class: 'tool-input', rows: 3 });
  const headerOut = el('pre', { class: 'tool-output' });
  const payloadOut = el('pre', { class: 'tool-output' });

  function decode() {
    const parts = inp.value.trim().split('.');
    if (parts.length !== 3) {
      headerOut.textContent = 'Invalid JWT (expected 3 parts separated by .)';
      headerOut.style.color = 'var(--warning)';
      payloadOut.textContent = '';
      return;
    }
    [headerOut, payloadOut].forEach((el, i) => {
      try {
        const decoded = JSON.parse(atob(parts[i].replace(/-/g, '+').replace(/_/g, '/')));
        el.textContent = JSON.stringify(decoded, null, 2);
        el.style.color = '';
      } catch (e) {
        el.textContent = `Decode error: ${e.message}`;
        el.style.color = 'var(--warning)';
      }
    });
  }

  const decBtn = btn('Decode', 'btn-primary');
  decBtn.addEventListener('click', decode);

  parent.appendChild(el('div', {}, [
    el('div', { class: 'tool-field', innerHTML: '<label>JWT Token</label>' }, [inp]),
    el('div', { class: 'tool-controls' }, [decBtn]),
    el('div', { class: 'tool-field', innerHTML: '<label>Header</label>' }, [headerOut]),
    el('div', { class: 'tool-field', innerHTML: '<label>Payload</label>' }, [payloadOut]),
  ]));
}
