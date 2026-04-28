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

export const INITIAL_ZONES = [
  // Dual zones
  ...DUAL_ZONES.map(n => zone(makeId(n), n, 'on', '12:00 AM', '6:00 AM', '12:00 AM', DUAL_NOTE)),

  // Slot A
  ...normalizeSlotNames(SLOT_A_ZONES)
    .filter(n => !DUAL_ZONES.includes(n))
    .map(n => zone(makeId(n), n, 'on', '12:00 AM', '6:00 AM', '12:00 AM', SLOT_A_NOTE)),

  // Slot B
  ...normalizeSlotNames(SLOT_B_ZONES)
    .filter(n => !DUAL_ZONES.includes(n))
    .map(n => zone(makeId(n), n, 'on', '6:00 AM', '12:00 PM', '6:00 AM', SLOT_B_NOTE)),
];

