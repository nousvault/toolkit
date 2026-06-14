// network-ip.js
import { el, btn, copy } from '../components/dom.js';

export function render(parent) {
  parent.innerHTML = '';

  const grid = el('div', { className: 'ip-grid' });
  const fields = {};
  ['Public IP', 'City', 'Region', 'Country', 'ISP', 'Timezone', 'Org'].forEach(label => {
    const fld = el('div', { className: 'ip-field', innerHTML: `<div class="ip-field-label">${label}</div><div class="ip-field-value">—</div>` });
    grid.appendChild(fld);
    fields[label] = fld.querySelector('.ip-field-value');
  });

  const statusEl = el('div', { className: 'progress-msg', textContent: 'Fetching IP info...' });

  async function fetch() {
    statusEl.textContent = 'Fetching IP info...';
    try {
      const ipRes = await fetch('https://api.ipify.org?format=json');
      const { ip } = await ipRes.json();
      fields['Public IP'].textContent = ip;

      const geoRes = await fetch(`https://ipapi.co/${ip}/json/`);
      const geo = await geoRes.json();
      fields['City'].textContent = geo.city || '—';
      fields['Region'].textContent = geo.region || '—';
      fields['Country'].textContent = `${geo.country_name || '—'} (${geo.country || '—'})`;
      fields['ISP'].textContent = geo.org || '—';
      fields['Timezone'].textContent = geo.timezone || '—';
      fields['Org'].textContent = geo.org || '—';
      statusEl.textContent = '✓';
      statusEl.style.color = 'var(--status-success)';
    } catch (e) {
      statusEl.textContent = 'Failed: ' + e.message;
      statusEl.style.color = 'var(--status-error)';
    }
  }

  document.getElementById('topActions').innerHTML = '';
  const refreshBtn = btn('Refresh', 'btn-primary');
  refreshBtn.addEventListener('click', fetch);
  const copyBtn = btn('Copy IP', 'btn-secondary');
  copyBtn.addEventListener('click', () => copy(fields['Public IP'].textContent));
  document.getElementById('topActions').append(refreshBtn, copyBtn);

  parent.appendChild(statusEl);
  parent.appendChild(grid);
  fetch();
}
