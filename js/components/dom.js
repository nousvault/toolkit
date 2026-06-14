function applyAttrs(el, attrs = {}) {
  for (const [key, value] of Object.entries(attrs || {})) {
    if (value === null || value === undefined || value === false) continue;

    if (key === 'className' || key === 'class') {
      el.className = value;
      continue;
    }

    if (key === 'dataset' && value && typeof value === 'object') {
      for (const [dataKey, dataValue] of Object.entries(value)) {
        if (dataValue !== undefined && dataValue !== null) {
          el.dataset[dataKey] = String(dataValue);
        }
      }
      continue;
    }

    if (key === 'style' && value && typeof value === 'object') {
      Object.assign(el.style, value);
      continue;
    }

    if (key === 'textContent') {
      el.textContent = String(value);
      continue;
    }

    if (key === 'innerHTML') {
      el.innerHTML = String(value);
      continue;
    }

    if (typeof value === 'boolean') {
      if (value) el.setAttribute(key, '');
      continue;
    }

    el.setAttribute(key, String(value));
  }

  return el;
}

export function el(tagName, attrs = {}, children = []) {
  const node = document.createElement(tagName);
  applyAttrs(node, attrs);

  const list = Array.isArray(children) ? children : [children];
  for (const child of list) {
    if (child === null || child === undefined || child === false) continue;
    node.append(child instanceof Node ? child : document.createTextNode(String(child)));
  }

  return node;
}

export function div(attrs = {}, children = []) {
  return el('div', attrs, children);
}

export function span(attrs = {}, children = []) {
  return el('span', attrs, children);
}

export function button(attrs = {}, children = []) {
  return el('button', attrs, children);
}

export function input(attrs = {}) {
  return applyAttrs(document.createElement('input'), attrs);
}

export function textarea(attrs = {}) {
  return applyAttrs(document.createElement('textarea'), attrs);
}

export function label(attrs = {}, children = []) {
  return el('label', attrs, children);
}

export function section(attrs = {}, children = []) {
  return el('section', attrs, children);
}

export default {
  el,
  div,
  span,
  button,
  input,
  textarea,
  label,
  section,
};
