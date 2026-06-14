// cron-parser.js
import { el, btn } from '../components/dom.js';

const MONTHS = ['','Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const DAYS = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

function parseField(f, type) {
  if (f === '*') return type === 'minute' || type === 'hour' ? null : 'every';
  const parts = f.split(',');
  const vals = [];
  for (const p of parts) {
    if (p.includes('/')) {
      const [range, step] = p.split('/');
      const [start, end] = range === '*' ? [0, type === 'month' ? 12 : type === 'dow' ? 7 : 59] : range.split('-').map(Number);
      vals.push(`every ${step} from ${type==='month' ? MONTHS[start] : start} to ${type==='month' ? MONTHS[end] : end}`);
    } else if (p.includes('-')) {
      const [s, e] = p.split('-').map(Number);
      vals.push(`${type==='month' ? MONTHS[s] : s}–${type==='month' ? MONTHS[e] : e}`);
    } else {
      const n = Number(p);
      vals.push(type === 'month' ? MONTHS[n] : type === 'dow' ? DAYS[n] : String(n));
    }
  }
  return vals.join(', ');
}

function explain(expr) {
  const fields = expr.trim().split(/\s+/);
  if (fields.length !== 5) return 'Expected 5 fields: minute hour day-of-month month day-of-week';
  return [
    `Minute: ${parseField(fields[0], 'minute') || 'every minute'}`,
    `Hour: ${parseField(fields[1], 'hour') || 'every hour'}`,
    `Day of month: ${parseField(fields[2], 'dom')}`,
    `Month: ${parseField(fields[3], 'month')}`,
    `Day of week: ${parseField(fields[4], 'dow')}`,
  ].join('\n');
}

const PRESETS = [
  ['@yearly', '0 0 1 1 *'],
  ['@monthly', '0 0 1 * *'],
  ['@weekly', '0 0 * * 0'],
  ['@daily', '0 0 * * *'],
  ['@hourly', '0 * * * *'],
  ['every 5 min', '*/5 * * * *'],
  ['every 30 min', '*/30 * * * *'],
  ['weekdays 9am', '0 9 * * 1-5'],
];

export function render(parent) {
  const inp = el('input', { type: 'text', placeholder: '* * * * *', class: 'tool-input' });
  const out = el('pre', { class: 'tool-output' });

  function parse() {
    const v = inp.value.trim();
    out.textContent = explain(v);
    out.style.color = '';
  }

  inp.addEventListener('input', parse);

  const presetBtns = PRESETS.map(([label, expr]) => {
    const b = btn(label, 'btn-small');
    b.addEventListener('click', () => { inp.value = expr; parse(); });
    return b;
  });

  parent.appendChild(el('div', {}, [
    el('div', { class: 'tool-field', innerHTML: '<label>Cron Expression (5 fields)</label>' }, [inp]),
    el('div', { class: 'tool-controls' }, [btn('Parse', 'btn-primary'), ...presetBtns]),
    el('div', { class: 'tool-result' }, [out]),
  ]));

  parent.querySelector('.btn-primary')?.addEventListener('click', parse);
  inp.value = '*/15 * * * *';
  parse();
}
