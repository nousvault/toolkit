// dom.js — DOM helpers for tool modules (thin wrappers)
export function qs(sel, parent = document) { return parent.querySelector(sel); }
export function qsa(sel, parent = document) { return [...parent.querySelectorAll(sel)]; }
export function el(tag, attrs = {}, html = '') {
  const e = document.createElement(tag);
  Object.entries(attrs).forEach(([k, v]) => { e[k] = v; });
  if (html) e.innerHTML = html;
  return e;
}
export function btn(text, cls = 'btn-secondary') {
  const b = el('button', { className: `btn ${cls}`, textContent: text, type: 'button' });
  return b;
}
export function btnIcon(svgInner, ariaLabel = '') {
  const b = el('button', { className: 'icon-btn', type: 'button' });
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', '0 0 24 24');
  svg.setAttribute('fill', 'none');
  svg.setAttribute('stroke', 'currentColor');
  svg.setAttribute('stroke-width', '2');
  svg.innerHTML = svgInner;
  b.appendChild(svg);
  if (ariaLabel) b.setAttribute('aria-label', ariaLabel);
  return b;
}

// Toast helper
export function toast(msg, type = '') {
  const ctr = document.getElementById('toastContainer') || (() => {
    const d = document.createElement('div');
    d.id = 'toastContainer';
    document.body.appendChild(d);
    return d;
  })();
  const t = el('div', { className: `toast ${type}`, textContent: msg });
  ctr.appendChild(t);
  setTimeout(() => { t.style.animation = 'slideIn 0.15s reverse forwards'; setTimeout(() => t.remove(), 200); }, 2000);
}

// Copy to clipboard
export async function copy(text) {
  try { await navigator.clipboard.writeText(text); toast('Copied!', 'success'); return true; }
  catch { toast('Copy failed', 'error'); return false; }
}
