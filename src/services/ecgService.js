/**
 * ecgService.js
 * Fetches live power status data from the ECG Western Region website.
 * Uses a CORS-anywhere proxy since the ECG site does not support CORS.
 *
 * NOTE: For production, replace the proxy with your own backend endpoint
 *       that scrapes the ECG page server-side.
 */

import { INITIAL_ZONES } from '../data/zones.js';

const ECG_URL =
  'https://ecg.com.gh/index.php/en/services/ecg-status/current-system-status/current-status-western';

// Public CORS proxy — swap this with your own backend URL in production
const PROXY_URL = `https://api.allorigins.win/get?url=${encodeURIComponent(ECG_URL)}`;

/**
 * parseECGPage
 * Accepts raw HTML from the ECG page and extracts zones + statuses.
 * Returns an array of { id, name, status, outageTime, expectedBack, expectedOutage, reports, updatedMins, notes }
 */
function parseECGPage(html) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');

  const zones = [];
  const knownByNormName = new Map(
    INITIAL_ZONES.map(z => [normaliseName(z.name), z.id])
  );

  // ECG page uses tables — grab all table rows
  const rows = doc.querySelectorAll('table tbody tr, table tr');

  rows.forEach((row) => {
    const cells = Array.from(row.querySelectorAll('td'));
    if (cells.length < 2) return;

    // Typical ECG table: | Location | Status | Remarks/Time |
    const name   = cells[0]?.textContent?.trim();
    const rawStatus = (cells[1]?.textContent?.trim() || '').toLowerCase();
    const remarks = cells[2]?.textContent?.trim() || '';

    if (!name || name.length < 2) return;

    // Normalise status
    let status = 'on';
    if (rawStatus.includes('off') || rawStatus.includes('outage') || rawStatus.includes('fault')) {
      status = 'off';
    } else if (rawStatus.includes('partial') || rawStatus.includes('restored')) {
      status = 'partial';
    }

    const { startTime, endTime } = extractTimeRange(remarks);
    const expectedBack   = status === 'off' ? endTime : null;
    const expectedOutage = status !== 'off' ? startTime : null;

    const fallbackId = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const mappedId = knownByNormName.get(normaliseName(name));

    zones.push({
      id:             mappedId || fallbackId,
      name,
      status,
      reports:        0,         // community reports start at 0 (user-driven)
      updatedMins:    0,
      outageTime:     status === 'off' ? 'Recently' : null,
      expectedBack,
      expectedOutage,
      notes: [
        {
          user: 'ECG_Official',
          time: 0,
          text: remarks || `Live status for ${name} as reported by ECG.`,
        },
      ],
    });
  });

  return zones;
}

function normaliseName(str) {
  return String(str || '')
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '');
}

function normaliseTime(str) {
  // Accept "6PM", "6 PM", "6:00PM", "6:00 PM"
  const m = String(str || '').trim().match(/^(\d{1,2})(?::(\d{2}))?\s*([AP]M)$/i);
  if (!m) return null;
  const h = Number(m[1]);
  const mm = m[2] ? Number(m[2]) : 0;
  const ap = m[3].toUpperCase();
  if (!Number.isFinite(h) || h < 1 || h > 12) return null;
  if (!Number.isFinite(mm) || mm < 0 || mm > 59) return null;
  return `${h}:${String(mm).padStart(2, '0')} ${ap}`;
}

function extractTimeRange(remarks) {
  const text = String(remarks || '')
    .replace(/[–—]/g, '-')           // normalize dashes
    .replace(/\s+/g, ' ')
    .trim();

  // e.g. "12AM-6AM" or "12:00 AM - 6:00 AM"
  const range = text.match(/(\d{1,2}(?::\d{2})?\s*[AP]M)\s*-\s*(\d{1,2}(?::\d{2})?\s*[AP]M)/i);
  if (range) {
    return { startTime: normaliseTime(range[1]), endTime: normaliseTime(range[2]) };
  }

  // Single time mention fallback (pick it as startTime)
  const single = text.match(/(\d{1,2}(?::\d{2})?\s*[AP]M)/i);
  const t = single ? normaliseTime(single[1]) : null;
  return { startTime: t, endTime: t };
}

/**
 * fetchECGZones
 * Fetches live zones from the ECG website.
 * Resolves with an array of zone objects, or [] on failure.
 */
export async function fetchECGZones() {
  try {
    const res  = await fetch(PROXY_URL, { signal: AbortSignal.timeout(12_000) });
    if (!res.ok) throw new Error(`Proxy responded ${res.status}`);

    const json = await res.json();
    const html = json.contents;          // allorigins.win wraps the page in { contents: '...' }

    const zones = parseECGPage(html);
    if (zones.length === 0) throw new Error('No zones parsed from ECG page');

    return zones;
  } catch (err) {
    return [];                           // Fail silently to avoid console clutter
  }
}
