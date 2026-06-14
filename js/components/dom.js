// dom.js — tiny DOM helpers for tool modules
export function el(tag, attrs = {}, children = []) {
  const e = document.createElement(tag);
  Object.entries(attrs).forEach(([k, v]) => { if (v !== undefined && v !== null) e[k] = v; });
  if (typeof children === 'string') e.textContent = children;
  else children.forEach(c => e.appendChild(c));
  return e;
}

export function textarea(attrs = {}) { return el('textarea', attrs); }
export function btn(label, cls = '') { return el('button', { class: 'btn ' + cls, textContent: label }); }
export function section(children) { return el('div', {}, children); }

export function textLines(str) {
  return str.split('\n').map((l, i) => el('div', { textContent: l || ' ' }));
}
