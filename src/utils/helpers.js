// ── STATUS HELPERS (Production Ready) ──────────────────────────
export const statusLabel = (status) => {
  switch (status) {
    case 'on':      return 'STABLE';
    case 'off':     return 'OUTAGE';
    case 'partial': return 'PARTIAL';
    default:        return 'UNKNOWN';
  }
};

export const heroLabel = (status) => {
  switch (status) {
    case 'on':      return 'Power On';
    case 'off':     return 'No Power';
    case 'partial': return 'Partial';
    default:        return '—';
  }
};

export const heroClass = (status) => {
  switch (status) {
    case 'on':      return 'hero-on';
    case 'off':     return 'hero-off';
    case 'partial': return 'hero-partial';
    default:        return '';
  }
};

export const badgeClass = (status) => {
  switch (status) {
    case 'on':      return 'badge-on';
    case 'off':     return 'badge-off';
    case 'partial': return 'badge-partial';
    default:        return '';
  }
};

export const getStatusLabel = statusLabel;
export const getStatusClass  = heroClass;

// ── TIME HELPERS ─────────────────────────────────────────────
export const timeAgo = (mins) => {
  if (mins === 0) return 'Just now';
  if (mins < 60)  return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  return `${hrs}h ago`;
};

// ── USER HELPERS ─────────────────────────────────────────────
export function getOrCreateUser() {
  const existing = localStorage.getItem('checki_user');
  if (existing) return existing;
  const newId = `ST_${Math.floor(1000 + Math.random() * 9000)}`;
  localStorage.setItem('checki_user', newId);
  return newId;
}

// ── CONFIDENCE ───────────────────────────────────────────────
export function getConfidence(reports) {
  if (reports > 30) return { label: 'HIGH CONFIDENCE',   filled: 5 };
  if (reports > 15) return { label: 'MEDIUM CONFIDENCE', filled: 3 };
  return            { label: 'LOW CONFIDENCE',   filled: 1 };
}
export const confidence = getConfidence;

// ── AVATAR HELPERS ───────────────────────────────────────────
export const avatarColor = (name = '') => {
  const palette = ['#E53E3E','#1A56DB','#16A34A','#D97706','#7C3AED','#DB2777','#0891B2'];
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return palette[Math.abs(hash) % palette.length];
};

export const userInitials = (name = '') =>
  name.replace('ST_', 'S').slice(0, 2).toUpperCase();

// ── TIME NORMALISATION (from ECG strings) ─────────────────────
function pad2(n) { return String(n).padStart(2, '0'); }

export function normaliseTimeLabel(input) {
  if (!input || typeof input !== 'string') return null;
  const m = input.trim().match(/^(\d{1,2})(?::(\d{2}))?\s*([AP]M)$/i);
  if (!m) return null;
  const h = Number(m[1]);
  const mm = m[2] ? Number(m[2]) : 0;
  const ap = m[3].toUpperCase();
  if (!Number.isFinite(h) || h < 1 || h > 12) return null;
  if (!Number.isFinite(mm) || mm < 0 || mm > 59) return null;
  return `${h}:${pad2(mm)} ${ap}`;
}

// ── COUNTDOWN ────────────────────────────────────────────────
export function getCountdown(targetTimeStr, fallbackMsg = 'Pending…') {
  if (!targetTimeStr) return fallbackMsg;
  
  try {
    const normalised = normaliseTimeLabel(targetTimeStr);
    const safe = normalised || targetTimeStr;
    const [timePart, modifier] = safe.split(' ');
    if (!timePart || !modifier) return fallbackMsg;
    
    let [hours, minutes] = timePart.split(':').map(Number);
    if (modifier === 'PM' && hours < 12) hours += 12;
    if (modifier === 'AM' && hours === 12) hours = 0;
    
    const now = new Date();
    const target = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hours, minutes, 0);
    
    let diff = target.getTime() - now.getTime();
    
    // If target is in the past for today, assume it's tomorrow (for "Next Outage" logic)
    if (diff <= 0) {
      target.setDate(target.getDate() + 1);
      diff = target.getTime() - now.getTime();
    }
    
    const h = Math.floor(diff / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    const s = Math.floor((diff % 60000) / 1000);
    
    const parts = [];
    if (h > 0) parts.push(`${h}h`);
    if (m > 0 || h > 0) parts.push(`${m}m`);
    parts.push(`${s}s`);
    
    return parts.join(' ');
  } catch (e) {
    return fallbackMsg;
  }
}

// ── REAL-TIME CALENDAR ───────────────────────────────────────
const DAY_NAMES   = ['SUN','MON','TUE','WED','THU','FRI','SAT'];
const MONTH_NAMES = ['January','February','March','April','May','June',
                     'July','August','September','October','November','December'];
const MONTH_SHORT = ['Jan','Feb','Mar','Apr','May','Jun',
                     'Jul','Aug','Sep','Oct','Nov','Dec'];

export function getNext7Days() {
  const result = [];
  const now    = new Date();
  // Normalise to midnight so date arithmetic is exact
  const today  = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  for (let i = 0; i < 7; i++) {
    // Create a fresh Date by adding days to the epoch offset — avoids setDate bugs
    const d = new Date(today.getTime() + i * 86400000);
    result.push({
      name:     DAY_NAMES[d.getDay()],
      date:     d.getDate(),                        // 1-31, never overflows
      month:    MONTH_SHORT[d.getMonth()],
      fullMonth:MONTH_NAMES[d.getMonth()],
      year:     d.getFullYear(),
      full:     `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`,
      isToday:  i === 0,
      // e.g. "Tue, 29 Apr"
      fullDate: `${DAY_NAMES[d.getDay()]}, ${d.getDate()} ${MONTH_SHORT[d.getMonth()]}`,
    });
  }
  return result;
}

// ── SCHEDULE DATA (unique per day-of-week index) ─────────────
export function getScheduleForDay(dayIdx) {
  // 7 distinct daily patterns rotate by day index
  const patterns = [
    // Day 0 (Today - Tuesday, 28th April 2026)
    [
      { time: 'EARLY',     period:'12:00 AM – 6:00 AM', status: 'off',         label: 'Outage (Block 1)', hours: '6 hrs outage', reason: 'GRIDCo Akosombo Fire' },
      { time: 'MORNING',   period:'6:00 AM – 12:00 PM', status: 'off',         label: 'Outage (Block 2)', hours: '6 hrs outage', reason: 'GRIDCo Akosombo Fire' },
      { time: 'AFTERNOON', period:'12:00 PM – 12:00 AM', status: 'stable',     label: 'Likely Stable',   hours: 'No scheduled outages' },
    ],
    // Day 1 (Tomorrow - Wednesday, 29th April 2026)
    [
      { time: 'EARLY',     period:'12:00 AM – 6:00 AM', status: 'off',         label: 'Outage (Block 1)', hours: '6 hrs outage', reason: 'GRIDCo System Maintenance' },
      { time: 'REST DAY',  period:'6:00 AM – 12:00 AM', status: 'stable',      label: 'Likely Stable',   hours: 'No scheduled outages' },
    ],
    // Future Days
    [
      { time: 'ALL DAY',   period:'12:00 AM – 12:00 AM', status: 'stable',     label: 'Likely Stable',   hours: 'No scheduled outages' },
    ],
    [
      { time: 'ALL DAY',   period:'12:00 AM – 12:00 AM', status: 'stable',     label: 'Likely Stable',   hours: 'No scheduled outages' },
    ],
    [
      { time: 'ALL DAY',   period:'12:00 AM – 12:00 AM', status: 'stable',     label: 'Likely Stable',   hours: 'No scheduled outages' },
    ],
    [
      { time: 'ALL DAY',   period:'12:00 AM – 12:00 AM', status: 'stable',     label: 'Likely Stable',   hours: 'No scheduled outages' },
    ],
    [
      { time: 'ALL DAY',   period:'12:00 AM – 12:00 AM', status: 'stable',     label: 'Likely Stable',   hours: 'No scheduled outages' },
    ],
  ];
  return patterns[dayIdx % 7];
}
