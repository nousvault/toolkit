// icons.js — inline SVG icons for each tool category
export const icons = {
  json: `<svg class="tool-nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><path d="M4 17V7c0-1 1-2 2-2h4l2 3h8c1 0 2 1 2 2v7"/><path d="M8 12l-2 2 2 2"/><path d="M16 16l2-2-2-2"/></svg>`,
  text: `<svg class="tool-nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><path d="M4 7V5h16v2"/><path d="M4 12h16"/><path d="M4 17h12"/><path d="M4 19h8"/></svg>`,
  codec: `<svg class="tool-nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><rect x="2" y="4" width="20" height="16" rx="3"/><path d="M7 15l3-3-3-3"/><path d="M13 17l4-10"/></svg>`,
  network: `<svg class="tool-nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><circle cx="12" cy="12" r="9"/><path d="M12 3v18"/><path d="M3 12h18"/><path d="M4.5 7.5h15"/><path d="M4.5 16.5h15"/></svg>`,
  time: `<svg class="tool-nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 3"/></svg>`,
  generator: `<svg class="tool-nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><path d="M12 3l2 4.5L19 9l-5 4.5L15 19l-3-6.5L9 19l1-5.5L5 9l5-1.5z"/></svg>`,
  converter: `<svg class="tool-nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><path d="M16 3l4 4-4 4"/><path d="M20 7H4"/><path d="M8 21l-4-4 4-4"/><path d="M4 17h16"/></svg>`,
  notes: `<svg class="tool-nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><path d="M12 20h7a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v14a1 1 0 001 1h1"/><path d="M16 2v4H8V2"/><path d="M9 13h6"/></svg>`,
  dashboard: `<svg class="tool-nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>`,
};

export function getIcon(category) {
  const key = (category || '').toLowerCase().replace(/s$/, '');
  return icons[key] || icons.json;
}

export const fullToolIcons = {
  'json-formatter': icons.json,
  'csv-json': icons.json,
  'diff-checker': icons.text,
  'character-counter': icons.text,
  'notes': icons.notes,
  'jwt-decoder': icons.codec,
  'base64-codec': icons.codec,
  'network-ip': icons.network,
  'unix-time': icons.time,
  'cron-parser': icons.time,
  'uuid-generator': icons.generator,
  'password-generator': icons.generator,
  'image-to-text': icons.converter,
  'image-to-pdf': icons.converter,
};
