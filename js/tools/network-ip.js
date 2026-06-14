// network-ip.js
import { el, btn } from '../components/dom.js';

export function render(parent) {
  const out = el('div', { class: 'tool-output', textContent: 'Fetching IP info …' });

  async function fetchIP() {
    out.textContent = 'Fetching IP info …';
    try {
      const res = await fetch('https://api.ipify.org?format=json');
      const { ip } = await res.json();
      const geoRes = await fetch(`https://ipapi.co/${ip}/json/`);
      const geo = await geoRes.json();
      out.innerHTML = [
        `Public IP: ${ip}`,
        `City: ${geo.city || '—'}`,
        `Region: ${geo.region || '—'}`,
        `Country: ${geo.country_name || '—'} (${geo.country || '—'})`,
        `ISP: ${geo.org || '—'}`,
        `Timezone: ${geo.timezone || '—'}`,
        geo.error ? `\n⚠ ${geo.reason || 'Geo lookup limited'}` : '',
      ].filter(Boolean).join('\n');
    } catch (e) { out.textContent = 'Failed to fetch IP info: ' + e.message; }
  }

  const refreshBtn = btn('Refresh', 'btn-primary');
  refreshBtn.addEventListener('click', fetchIP);

  parent.appendChild(el('div', {}, [
    el('div', { class: 'tool-controls' }, [refreshBtn]),
    el('hr', { class: 'separator' }),
    out,
  ]));

  fetchIP();
}
