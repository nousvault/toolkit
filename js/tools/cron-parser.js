// cron-parser.js
import { el, btn, copy } from '../components/dom.js';

const MONTHS = ['','Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const DAYS = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

function explain(expr) {
  const fields = expr.trim().split(/\s+/);
  if (fields.length !== 5) return 'Expected 5 fields: minute hour day-of-month month day-of-week';
  const parse = (f, type) => {
    if (f === '*') return 'every';
    const parts = f.split(',');
    const vals = [];
    for (const p of parts) {
      if (p.includes('/')) {
        const [range, step] = p.split('/');
        const start = range === '*' ? 0 : Number(range.split('-')[0]);
        vals.push(`every ${step} starting ${type==='month' ? MONTHS[start] : start}`);
      } else if (p.includes('-')) {
        const [s, e] = p.split('-').map(Number);
        vals.push(`${type==='month' ? MONTHS[s] : s}–${type==='month' ? MONTHS[e] : e}`);
      } else {
        const n = Number(p);
        vals.push(type === 'month' ? MONTHS[n] : type === 'dow' ? DAYS[n] : String(n));
      }
    }
    return vals.join(', ');
  };
  return [
    `Minute: ${parse(fields[0], 'minute')}`,
    `Hour: ${parse(fields[1], 'hour')}`,
    `Day of month: ${parse(fields[2], 'dom')}`,
    `Month: ${parse(fields[3], 'month')}`,
    `Day of week: ${parse(fields[4], 'dow')}`,
  ].join('\n');
}

const PRESETS = [
  ['@yearly', '0 0 1 1 *'], ['@monthly', '0 0 1 * *'], ['@weekly', '0 0 * * 0'], ['@daily', '0 0 * * *'],
  ['@hourly', '0 * * * *'], ['every 5 min', '*/5 * * * *'], ['every 30 min', '*/30 * * * *'], ['weekdays 9am', '0 9 * * 1-5'],
];

export function render(parent) {
  parent.innerHTML = '';

  const inp = el('input', { type: 'text', value: '*/15 * * * *', placeholder: '* * * * *' });
  const out = el('div', { className: 'output-display', style: 'min-height:120px' });

  function parse() { out.textContent = explain(inp.value.trim()); }
  inp.addEventListener('input', parse);

  document.getElementById('topActions').innerHTML = '';
  const copyBtn = btn('Copy', 'btn-secondary');
  copyBtn.addEventListener('click', () => copy(out.textContent));
  document.getElementById('topActions').appendChild(copyBtn);

  parent.appendChild(el('div', { className: 'input-label', textContent: 'CRON EXPRESSION' }));
  parent.appendChild(inp);

  // Preset pills
  const pillTog = el('div', { className: 'pill-toggle', style: 'margin-top:var(--spacing-sm);flex-wrap:wrap' });
  PRESETS.forEach(([label, expr]) => {
    const p = el('button', { className: 'pill-option', textContent: label, type: 'button' });
    p.addEventListener('click', () => { inp.value = expr; parse(); });
    pillTog.appendChild(p);
  });
  parent.appendChild(pillTog);

  parent.appendChild(el('div', { style: 'margin-top:var(--spacing-md)', className: 'input-label', textContent: 'HUMAN READABLE' }));
  parent.appendChild(out);

  parse();
}
