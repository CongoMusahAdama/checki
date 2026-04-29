/**
 * Real ECG Western Region Power Outage Data
 * Source: Official ECG notice — Tuesday, 28th April 2026
 * Cause: Fire outbreak at GRIDCo's Akosombo Substation
 *
 * Slot A: 12:00 AM – 6:00 AM
 * Slot B: 6:00 AM – 12:00 PM
 * Some zones appear in both slots.
 */

const ECG_REASON = `Fire outbreak at GRIDCo's Akosombo Substation has reduced power supply to the Western Region.`;
const ECG_NOTE   = 'Power supply will be restored immediately the generation profile improves.';

// Helper: build a zone object
function zone(id, name, status, outageTime, expectedBack, expectedOutage, slotNote) {
  return {
    id,
    name,
    status,
    reports:     0,
    updatedMins: 0,
    outageTime,
    expectedBack,
    expectedOutage,
    notes: [
      { user: 'ECG_Official', time: 0, text: slotNote },
      { user: 'ECG_Official', time: 1, text: ECG_NOTE  },
    ],
  };
}

// ── SLOT A ZONES: 12:00 AM – 6:00 AM ───────────────────────────────────────
// Time Block 1 — Tue 28 Apr 2026 (12:00 AM – 6:00 AM)
const SLOT_A_ZONES = [
  'BU Junction', 'Repso Hills', 'Fijai', 'Adiembra', 'Kweikuma',
  'New Site', 'New Amanful', 'Beach Road', 'Dupaul', 'Apremdo', 'Whindo',
  'Assakae', 'Adientem', 'Mpatado', 'Sikafoabantem No.3',
  'Police Reserve', 'Collins Avenue', 'Apowa', 'Kejebir', 'Mpohor',
  'Adum Banso', 'Breman', 'Kwabeng', 'Agona', 'Gyeduakese',
];

// ── SLOT B ZONES: 6:00 AM – 12:00 PM ───────────────────────────────────────
// Time Block 2 — Tue 28 Apr 2026 (6:00 AM – 12:00 PM)
const SLOT_B_ZONES = [
  'Diabene', 'Nkroful', 'Kansaworodu', 'Ntankorful', 'Mt. Zion', 'Race Course',
  'Whindo', 'Inchaban', 'Nyankrom', 'Shama', 'Aboadze', 'Abuesi', 'Dixcove',
  'Busua', 'Mpanyiasa', 'Prestea Township', 'Enyinam', 'Diaso', 'New Obuasi',
  'Ntom', 'Agona Port', 'Ankwaso', 'Benchema', 'Asafo',
];

// ── DUAL ZONES: In both slots ───────────────────────────────────────────────
const DUAL_ZONES = ['Whindo'];

const SLOT_A_NOTE = 'Scheduled outage: 12:00 AM – 6:00 AM (Tue, 28 Apr 2026) due to GRIDCo Akosombo fire.';
const SLOT_B_NOTE = 'Scheduled outage: 6:00 AM – 12:00 PM (Tue, 28 Apr 2026) due to GRIDCo Akosombo fire.';
const DUAL_NOTE   = 'Affected in both outage windows (12:00 AM–6:00 AM & 6:00 AM–12:00 PM).';

function normalizeSlotNames(list) {
  // Fix known OCR/spacing variations so IDs stay stable
  return list.map((n) => {
    if (n === 'Sikafoabantem No.3') return 'Sikafobantem No. 3';
    return n;
  });
}

function makeId(name) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
}

// Coordinates for Western Region locations (Takoradi/Sekondi area)
const ZONE_COORDS = {
  'bu-junction': [-1.770, 4.920],
  'repso-hills': [-1.758, 4.935],
  'fijai': [-1.764, 4.913],
  'adiembra': [-1.758, 4.908],
  'kweikuma': [-1.745, 4.912],
  'new-site': [-1.740, 4.895],
  'new-amanful': [-1.840, 4.860],
  'beach-road': [-1.761, 4.887],
  'dupaul': [-1.780, 4.900],
  'apremdo': [-1.790, 4.925],
  'whindo': [-1.820, 4.950],
  'assakae': [-1.815, 4.915],
  'adientem': [-1.785, 4.890],
  'mpatado': [-1.830, 4.930],
  'sikafobantem-no-3': [-1.750, 4.895],
  'police-reserve': [-1.765, 4.898],
  'collins-avenue': [-1.755, 4.885],
  'apowa': [-1.850, 4.880],
  'kejebir': [-1.880, 4.950],
  'mpohor': [-1.820, 5.060],
  'adum-banso': [-1.900, 5.100],
  'breman': [-1.750, 5.200],
  'kwabeng': [-1.700, 5.150],
  'agona': [-1.950, 4.850],
  'gyeduakese': [-1.980, 4.880],
  'diabene': [-1.720, 4.930],
  'nkroful': [-1.710, 4.940],
  'kansaworodu': [-1.730, 4.960],
  'ntankorful': [-1.745, 4.945],
  'mt-zion': [-1.755, 4.955],
  'race-course': [-1.725, 4.915],
  'inchaban': [-1.660, 4.990],
  'nyankrom': [-1.640, 5.000],
  'shama': [-1.630, 5.010],
  'aboadze': [-1.650, 4.970],
  'abuesi': [-1.620, 4.960],
  'dixcove': [-1.950, 4.790],
  'busua': [-1.930, 4.800],
  'mpanyiasa': [-1.800, 5.000],
  'prestea-township': [-2.140, 5.430],
  'enyinam': [-2.150, 5.440],
  'diaso': [-2.200, 5.600],
  'new-obuasi': [-2.250, 5.650],
  'ntom': [-1.850, 5.050],
  'agona-port': [-1.960, 4.840],
  'ankwaso': [-2.300, 5.700],
  'benchema': [-2.400, 5.800],
  'asafo': [-2.450, 5.850],
};

export const INITIAL_ZONES = [
  // Dual zones
  ...DUAL_ZONES.map(n => ({ ...zone(makeId(n), n, 'on', '12:00 AM', '6:00 AM', '12:00 AM', DUAL_NOTE), coords: ZONE_COORDS[makeId(n)] })),

  // Slot A
  ...normalizeSlotNames(SLOT_A_ZONES)
    .filter(n => !DUAL_ZONES.includes(n))
    .map(n => ({ ...zone(makeId(n), n, 'on', '12:00 AM', '6:00 AM', '12:00 AM', SLOT_A_NOTE), coords: ZONE_COORDS[makeId(n)] })),

  // Slot B
  ...normalizeSlotNames(SLOT_B_ZONES)
    .filter(n => !DUAL_ZONES.includes(n))
    .map(n => ({ ...zone(makeId(n), n, 'on', '6:00 AM', '12:00 PM', '6:00 AM', SLOT_B_NOTE), coords: ZONE_COORDS[makeId(n)] })),
];


