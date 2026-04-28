import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { INITIAL_ZONES } from './data/zones.js';
import { fetchECGZones } from './services/ecgService.js';
import {
  getOrCreateUser,
  statusLabel, heroLabel, heroClass, badgeClass,
  timeAgo, confidence, avatarColor, userInitials,
  getCountdown, getNext7Days, getScheduleForDay
} from './utils/helpers.js';

import ZoneCard    from './components/ZoneCard.jsx';
import BottomSheet from './components/BottomSheet';
import Toast       from './components/Toast';
import logo        from './assets/logo.png';
import splashBg    from './assets/spalsh.png';
import ecg1        from './assets/ecg1.png';
import ecg2        from './assets/ecg2.png';
import { OUTAGE_SCHEDULE_TODAY, OUTAGE_SCHEDULE_TOMORROW } from './data/outageSchedule.js';

import './App.css';

// Professional SVG Icons
const Icons = {
  Search: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>,
  Location: () => <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>,
  LocationSmall: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>,
  ArrowLeft: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>,
  X: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>,
  Home: () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>,
  Calendar: () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>,
  Users: () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>,
  Bell: () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>,
  User: () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>,
  Edit: () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>,
  Send: () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>,
  VerifiedSmall: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"></path></svg>,
  Alert: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>,
  Clock: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>,
  Download: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
};

function normaliseArea(str) {
  return String(str || '')
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '');
}

function toTitleCase(str) {
  return String(str || '')
    .trim()
    .split(/\s+/)
    .map(w => (w ? w[0].toUpperCase() + w.slice(1).toLowerCase() : w))
    .join(' ');
}

export default function App() {
  const [view, setView]                     = useState('splash');
  const [activeTab, setActiveTab]           = useState('home');
  const [selectedZoneId, setSelectedZoneId] = useState(null);
  const [zones, setZones]                   = useState(INITIAL_ZONES);
  const [communityReports, setCommunityReports] = useState([]); // user-added notes
  const [search, setSearch]               = useState('');
  const [toast, setToast]                 = useState({ message: '', visible: false });
  const [noteText, setNoteText]           = useState('');
  const [currentUser]                     = useState(getOrCreateUser());
  const [cooldown, setCooldown]           = useState(0);
  const [tick, setTick]                   = useState(0);
  const [selectedDayIdx, setSelectedDayIdx] = useState(0);
  const [expandedBlocks, setExpandedBlocks] = useState(() => new Set());
  const [scheduleFilter, setScheduleFilter] = useState('all'); // all | saved
  const [myAreaQuery, setMyAreaQuery]       = useState('');
  const [savedAreas, setSavedAreas]         = useState(() => {
    try {
      const raw = localStorage.getItem('checki_saved_areas');
      const arr = raw ? JSON.parse(raw) : [];
      return Array.isArray(arr) ? arr : [];
    } catch {
      return [];
    }
  });

  // Merge live ECG data while preserving user-added community reports
  const mergeECGData = useCallback((liveZones) => {
    if (!liveZones || liveZones.length === 0) return;
    setZones(prev => {
      const prevMap = Object.fromEntries(prev.map(z => [z.id, z]));
      return liveZones.map(lz => ({
        ...lz,
        expectedBack:   lz.expectedBack   ?? prevMap[lz.id]?.expectedBack   ?? null,
        expectedOutage: lz.expectedOutage ?? prevMap[lz.id]?.expectedOutage ?? null,
        outageTime:     lz.outageTime     ?? prevMap[lz.id]?.outageTime     ?? null,
        // keep user reports & notes accumulated during session
        reports: (prevMap[lz.id]?.reports ?? 0) + lz.reports,
        notes:   [...lz.notes, ...(prevMap[lz.id]?.notes?.filter(n => n.user !== 'ECG_Official') ?? [])],
      }));
    });
  }, []);

  // Initial live ECG fetch + auto-refresh every 5 minutes
  useEffect(() => {
    async function loadLive() {
      const liveZones = await fetchECGZones();
      if (liveZones.length > 0) {
        mergeECGData(liveZones);
      }
    }

    loadLive();
    const refresh = setInterval(loadLive, 5 * 60_000); // refresh every 5 minutes
    return () => clearInterval(refresh);
  }, [mergeECGData]);

  useEffect(() => {
    const t = setInterval(() => {
      setZones(prev => prev.map(z => ({ ...z, updatedMins: z.updatedMins + 1 })));
    }, 60_000);
    const c = setInterval(() => {
      setCooldown(prev => (prev > 0 ? prev - 1 : 0));
      setTick(t => t + 1);
    }, 1000);
    return () => { clearInterval(t); clearInterval(c); };
  }, []);

  const currentZone = useMemo(() =>
    zones.find(z => z.id === selectedZoneId), [zones, selectedZoneId]);

  const filteredZones = useMemo(() => {
    if (!search.trim()) return zones;
    return zones.filter(z => z.name.toLowerCase().includes(search.toLowerCase()));
  }, [zones, search]);

  const showToast = (msg) => {
    setToast({ message: msg, visible: true });
    setTimeout(() => setToast({ message: '', visible: false }), 2800);
  };

  const persistSavedAreas = (areas) => {
    setSavedAreas(areas);
    try { localStorage.setItem('checki_saved_areas', JSON.stringify(areas)); } catch {}
  };

  const toggleSavedArea = (areaName) => {
    const norm = normaliseArea(areaName);
    const existing = savedAreas.find(a => normaliseArea(a) === norm);
    if (existing) {
      persistSavedAreas(savedAreas.filter(a => normaliseArea(a) !== norm));
      showToast('Removed from saved areas');
    } else {
      persistSavedAreas([areaName, ...savedAreas].slice(0, 10));
      showToast('Saved your area');
    }
  };

  const toggleBlockExpanded = (id) => {
    setExpandedBlocks(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const shareBlock = async (block) => {
    const title = `Power Outage Schedule — ${OUTAGE_SCHEDULE_TODAY.region}`;
    const text = `${OUTAGE_SCHEDULE_TODAY.dateLabel}\n${block.start} – ${block.end}\nAffected: ${block.areas.join(', ')} and surrounding areas.`;
    try {
      if (navigator.share) {
        await navigator.share({ title, text });
        showToast('Shared');
        return;
      }
    } catch {}
    try {
      await navigator.clipboard.writeText(text);
      showToast('Copied to clipboard');
    } catch {
      showToast('Could not share on this device');
    }
  };

  const refreshSchedule = async () => {
    // Refreshes live zone statuses from ECG page (times/areas are from today’s official blocks)
    const liveZones = await fetchECGZones();
    if (liveZones.length > 0) {
      mergeECGData(liveZones);
      showToast('Schedule refreshed');
    } else {
      showToast('Could not refresh. Check internet.');
    }
  };

  const myAreaResult = useMemo(() => {
    const q = normaliseArea(myAreaQuery);
    if (!q) return null;
    
    // Choose schedule based on selected day
    const activeSchedule = selectedDayIdx === 1 ? OUTAGE_SCHEDULE_TOMORROW : OUTAGE_SCHEDULE_TODAY;
    
    // Search within the blocks of the active schedule
    const hit = activeSchedule.blocks.find(b =>
      b.areas.some(a => normaliseArea(a) === q)
    );
    if (!hit) return { status: 'safe' };
    return { status: 'affected', block: hit };
  }, [myAreaQuery, selectedDayIdx]);

  const openZone = (id) => {
    setSelectedZoneId(id);
    setNoteText('');
    setView('detail');
    setActiveTab('home');
    window.scrollTo(0, 0);
  };

  const handleBack = () => {
    if (view === 'detail') setView('search');
    else if (view === 'search') setView('splash');
    setSelectedZoneId(null);
  };

  const handleReport = (id, status) => {
    if (cooldown > 0) {
      showToast(`Please wait ${cooldown}s before reporting again`);
      return;
    }
    const targetId = id || selectedZoneId;
    if (!targetId) { showToast('Please select an area'); return; }
    
    setZones(prev => prev.map(z =>
      z.id === targetId ? { ...z, status, reports: z.reports + 1, updatedMins: 0 } : z
    ));
    setCooldown(120); // 2 minute cooldown
    showToast(status === 'off' ? 'Reported outage' : 'Reported restoration');
  };

  const handleAddNote = () => {
    if (!noteText.trim() || !selectedZoneId) return;
    const newNote = { user: currentUser, time: 0, text: noteText.trim() };
    setZones(prev => prev.map(z =>
      z.id === selectedZoneId ? { ...z, notes: [newNote, ...z.notes] } : z
    ));
    setNoteText('');
    showToast('Note posted');
  };

  const handleLocationAccess = () => {
    if (!navigator.geolocation) { showToast('Location not supported'); return; }
    showToast('Detecting your community...');
    
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude: lat, longitude: lng } = pos.coords;
        
        try {
          // Real reverse geocoding using OpenStreetMap (Nominatim)
          const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`, {
            headers: { 'User-Agent': 'Checki-App-V3' }
          });
          const data = await response.json();
          
          if (data && data.address) {
            // Get all address values as an array of strings
            const addressValues = Object.values(data.address).map(val => normaliseArea(val));
            
            // Try to find a zone that matches ANY part of the detected address
            const matchedZone = zones.find(z => {
              const normZoneName = normaliseArea(z.name);
              return addressValues.some(val => val.includes(normZoneName) || normZoneName.includes(val));
            });

            if (matchedZone) {
              showToast(`Located in ${matchedZone.name}`);
              setTimeout(() => openZone(matchedZone.id), 800);
            } else {
              // Extract the most likely community name for display
              const communityName = data.address.suburb || 
                                    data.address.neighbourhood || 
                                    data.address.village || 
                                    data.address.town || 
                                    data.address.city_district ||
                                    'Unknown Area';
              showToast(`You are in ${communityName}`);
              setTimeout(() => setView('search'), 1500);
            }
          } else {
            showToast('Could not identify community. Try searching.');
          }
        } catch (error) {
          console.error('Geocoding error:', error);
          showToast('Location service unavailable');
        }
      },
      (error) => {
        console.warn('Geolocation error:', error);
        showToast('Access denied. Please enter manually.');
      },
      { timeout: 10000 }
    );
  };

  // ── SPLASH SCREEN ─────────────────────
  if (view === 'splash') {
    return (
      <div className="app-container splash-view" style={{ backgroundImage: `url(${splashBg})` }}>
        <div className="splash-version">v3.3.3-tracker</div>
        <div className="brand-logo-top">
          <img src={logo} alt="Checki Logo" className="splash-logo-min" />
        </div>
        <div className="splash-content">
          <h1 className="splash-title">Power Outage, <br/> Checki Hwe?</h1>
          <p className="splash-desc">
            Know Before The Lights Go Out. Check if your area has power, report outages, and read live updates from your community.
          </p>
          <div className="splash-actions">
            <button className="btn-allow-location" onClick={handleLocationAccess}>Allow Location Access</button>
            <button className="btn-manual-entry" onClick={() => setView('search')}>Enter Location Manually</button>
          </div>
        </div>
        <div className="splash-footer">
          <p>© 2026 Duapa Software. All rights reserved.</p>
        </div>
        <Toast message={toast.message} visible={toast.visible} />
      </div>
    );
  }

  // ── SEARCH SCREEN ─────────────────────
  if (view === 'search') {
    return (
      <div className="app-container search-view">
        <header className="search-header">
          <button className="btn-icon" onClick={handleBack}><Icons.ArrowLeft /></button>
          <h2 className="search-title">Search Your Location</h2>
          <div style={{ width: 40 }}></div>
        </header>
        <div className="search-body">
          <div className="professional-search-bar">
            <span className="search-icon-min"><Icons.Search /></span>
            <input
              type="text" className="search-input-field" placeholder="e.g. Sekondi, Takoradi..."
              value={search} onChange={e => setSearch(e.target.value)} autoFocus
            />
            {search && <button className="btn-clear" onClick={() => setSearch('')}><Icons.X /></button>}
          </div>
          <button className="btn-use-location-inline" onClick={handleLocationAccess}>
            <Icons.LocationSmall /><span>Use my current location</span>
          </button>
          <div className="search-results-section">
            <h3 className="results-label">{search ? 'SEARCH RESULT' : 'ALL LOCATIONS'}</h3>
            <div className="results-list">
              {filteredZones.map(z => <ZoneCard key={z.id} zone={z} onClick={openZone} />)}
              {search && filteredZones.length === 0 && <div className="no-results-text">No areas found for "{search}"</div>}
            </div>
          </div>
        </div>
        <Toast message={toast.message} visible={toast.visible} />
      </div>
    );
  }

  // ── TRACKER SCREEN (DETAIL) ───────────
  const conf = confidence(currentZone?.reports ?? 0);
  const expectedBackUI = currentZone?.expectedBack || null;
  const expectedOutUI  = currentZone?.expectedOutage || null;

  return (
    <div className="app-container detail-view">
      <header className="detail-header-pro">
        <button className="btn-icon" onClick={handleBack}><Icons.ArrowLeft /></button>
        <div className="detail-title-pro">
          <h2>{activeTab === 'community' ? 'Community' : activeTab === 'schedule' ? 'Power Schedule' : currentZone?.name}</h2>
          <p>{activeTab === 'community' ? 'ANONYMOUS FEED' : activeTab === 'schedule' ? '7-DAY FORECAST' : activeTab.toUpperCase()}</p>
        </div>
      </header>

      <main className="tab-content">
        {activeTab === 'home' && (
          <div className="tab-pane animate-fade-in home-pane">

            <div className={`hero-status-v2 ${heroClass(currentZone?.status)}`}>

              <div className="live-pulse">
                <span className="pulse-dot"></span>
                <span>LIVE UPDATES — TODAY</span>
              </div>
              <h1 className="hero-status-text">{heroLabel(currentZone?.status)}</h1>
              <div className="hero-confidence-v2">
                <div className="conf-pills-v2">
                  {[1,2,3,4,5].map(i => <span key={i} className={`conf-pill-v2 ${i <= conf.filled ? 'active' : ''}`}></span>)}
                </div>
                <span className="conf-label-v2">{conf.label}</span>
              </div>
            </div>

            <div className="hero-countdown-v4">
              <div className={`hc-card ${currentZone?.status === 'off' ? 'hc-card--red' : 'hc-card--yellow'}`}>
                <div className="hc-label">
                  {currentZone?.status === 'off' ? 'RESTORATION IN' : 'NEXT OUTAGE IN'}
                </div>
                <div className="hc-timer">
                  {currentZone?.status === 'off' 
                    ? getCountdown(expectedBackUI, 'Restoring…')
                    : getCountdown(expectedOutUI, 'Starting…')
                  }
                </div>
              </div>
            </div>

            <div className="timing-dashboard-v3">
              <div className="timing-header-v3">
                <div className="th-left">
                  <Icons.Calendar />
                  <span>TIMING & FORECAST</span>
                </div>
                <div className="th-right">LIVE</div>
              </div>

              <div className="timing-grid-v3">
                {/* ── RESTORATION BLOCK ── */}
                <div className={`tg-block ${currentZone?.status === 'off' ? 'tg-block--active-red' : ''}`}>
                  <div className="tg-label">Restoration</div>
                  <div className="tg-time">{expectedBackUI || 'Not available'}</div>
                  {currentZone?.status === 'off' && expectedBackUI && (
                    <div className="tg-countdown tg-countdown--red">
                      {getCountdown(expectedBackUI, 'Restoring…')}
                    </div>
                  )}
                  {currentZone?.status === 'on' && <div className="tg-hint">Currently Stable</div>}
                </div>

                {/* ── NEXT OUTAGE BLOCK ── */}
                <div className={`tg-block ${currentZone?.status === 'on' ? 'tg-block--active-yellow' : ''}`}>
                  <div className="tg-label">Next Outage</div>
                  <div className="tg-time">{expectedOutUI || '--:--'}</div>
                  {currentZone?.status === 'on' && expectedOutUI && (
                    <div className="tg-countdown tg-countdown--yellow">
                      {getCountdown(expectedOutUI, 'Starting…')}
                    </div>
                  )}
                  {currentZone?.status === 'off' && <div className="tg-hint">Outage Active</div>}
                </div>
              </div>
              
              <button 
                className="btn-view-tomorrow" 
                onClick={() => { setActiveTab('schedule'); setSelectedDayIdx(1); window.scrollTo(0, 0); }}
              >
                <span>View for Tomorrow</span>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
              </button>

              <div className="timing-footer-v3">
                <span className="tf-lbl">Last Outage Detected:</span>
                <span className="tf-val">{currentZone?.outageTime || 'N/A'}</span>
              </div>
            </div>

            <div className="report-section-v2">
              <h3 className="section-title-v2">Update Status</h3>
              <div className="report-grid-v2">
                <button className="btn-report-v2 outage" onClick={() => handleReport(null, 'off')}>
                  <div className="btn-icon-v2">
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18.36 6.64a9 9 0 1 1-12.73 0"></path><line x1="12" y1="2" x2="12" y2="12"></line></svg>
                  </div>
                  <span>Still No Light</span>
                </button>
                <button className="btn-report-v2 restored" onClick={() => handleReport(null, 'on')}>
                  <div className="btn-icon-v2">
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>
                  </div>
                  <span>Light Is Back</span>
                </button>
              </div>
              {cooldown > 0 && <div className="cooldown-note">Wait {cooldown}s to report again</div>}
            </div>
          </div>
        )}

        {activeTab === 'schedule' && (
          <div className="tab-pane animate-fade-in schedule-pane-v2">
            <div className="sticky-schedule-header">
              <div className="premium-calendar-header">
                <div className="calendar-month-v2">
                  {getNext7Days()[selectedDayIdx].fullMonth} {getNext7Days()[selectedDayIdx].year}
                </div>
                <div className="calendar-sub-label">
                  <Icons.Calendar />
                  <span>7-Day Power Forecast</span>
                </div>
              </div>

              <div className="day-selector-v2">
                {getNext7Days().map((d, i) => (
                  <button 
                    key={i} 
                    className={`day-chip-v2 ${selectedDayIdx === i ? 'active' : ''}`}
                    onClick={() => setSelectedDayIdx(i)}
                  >
                    <span className="day-name">{d.name}</span>
                    <span className="day-date">{d.date}</span>
                    {d.isToday && <div className="today-dot" />}
                  </button>
                ))}
              </div>

              <div className="premium-search-footer">
                <h3 className="section-title-v2">Is my area affected?</h3>
                <div className="premium-search-box">
                  <Icons.Search />
                  <input
                    placeholder="Type area name (e.g. Fijai)"
                    value={myAreaQuery}
                    onChange={(e) => setMyAreaQuery(e.target.value)}
                  />
                  {myAreaQuery && <Icons.X onClick={() => setMyAreaQuery('')} style={{ cursor: 'pointer' }} />}
                </div>
                
                {myAreaResult && (
                  <div className={`search-result-premium ${myAreaResult.status === 'affected' ? 'affected' : 'safe'}`}>
                    <div className="sr-title">
                      {myAreaResult.status === 'affected' ? '⚠️ Affected' : '✅ No Outage'}
                    </div>
                    <div className="sr-desc">
                      {myAreaResult.status === 'affected' 
                        ? `${toTitleCase(myAreaQuery)} is scheduled for outage from ${myAreaResult.block.start} to ${myAreaResult.block.end}.`
                        : `No scheduled outage found for "${toTitleCase(myAreaQuery)}" today.`
                      }
                    </div>
                  </div>
                )}
              </div>
            </div>

            {selectedDayIdx <= 1 && (
              <div className="official-notices-v2">
                <h3 className="section-title-v2">Official ECG Notice</h3>
                <div className="notice-cards-grid" style={{ gridTemplateColumns: '1fr' }}>
                  <a 
                    href={selectedDayIdx === 0 ? ecg1 : ecg2} 
                    download={`ECG_Schedule_${selectedDayIdx === 0 ? 'Today' : 'Tomorrow'}.png`} 
                    className="notice-card-pro"
                  >
                    <div className="nc-icon"><Icons.Download /></div>
                    <div className="nc-info">
                      <span className="nc-name">{selectedDayIdx === 0 ? "Today's" : "Tomorrow's"} Official Schedule</span>
                      <span className="nc-meta">Tap to download official image notice</span>
                    </div>
                  </a>
                </div>
              </div>
            )}

            <div className="daily-timeline-v2" style={{ paddingTop: '20px' }}>
              {getScheduleForDay(selectedDayIdx).map((block, idx) => (
                <div key={idx} className={`timeline-block-v2 ${block.status === 'off' ? 'status-off' : block.status === 'maintenance' ? 'status-maintenance' : 'status-stable'}`}>
                  <div className="timeline-left">
                    <div className="timeline-time-label">{block.period.split(' – ')[0]}</div>
                    <div className="timeline-dot" />
                    <div className="timeline-line" />
                  </div>
                  <div className="block-content">
                    <div className="block-header-row">
                      <div className="block-info">
                        <h4>{block.label}</h4>
                        <div className="block-period-sub">{block.period}</div>
                      </div>
                      <div className="status-badge-min">
                        {block.status === 'off' ? 'Outage' : block.status === 'maintenance' ? 'Maint' : 'Stable'}
                      </div>
                    </div>
                    <div className="block-body-row">
                      <div className="block-icon-premium">
                        {block.status === 'off' ? '🔴' : block.status === 'maintenance' ? '🟡' : '🟢'}
                      </div>
                      <div className="block-hours-text">{block.hours}</div>
                    </div>
                    {block.reason && <span className="reason-tag-premium">{block.reason}</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'community' && (
          <div className="tab-pane animate-fade-in community-pane-v5">
            {/* --- Messenger Feed --- */}
            <div className="comm-v5-feed">
              {currentZone?.notes.map((n, i) => (
                <div
                  key={i}
                  className={`comm-v5-item${n.user === 'ECG_Official' ? ' comm-v5-item--official' : ''}`}
                  style={{ animationDelay: `${i * 80}ms` }}
                >
                  <div className="cv5-content">
                    <div className="cv5-row">
                      <span className="cv5-name">
                        {n.user === 'ECG_Official' ? 'ECG Western Region' : 'Anonymous'}
                        {n.user === 'ECG_Official' && <span className="cv5-check"><Icons.VerifiedSmall /></span>}
                      </span>
                      <span className="cv5-time">{timeAgo(n.time)}</span>
                    </div>
                    <div className="cv5-row">
                      <p className="cv5-text">{n.text}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* --- Composer (Anonymous send) --- */}
            <div className="cv5-composer">
              <div className="cv5-composer__inner">
                <input
                  className="cv5-composer__input"
                  type="text"
                  placeholder="Write a message anonymously…"
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                  maxLength={200}
                />
                <button
                  className="cv5-composer__send"
                  onClick={handleAddNote}
                  disabled={!noteText.trim()}
                  aria-label="Send message"
                >
                  <Icons.Send />
                </button>
              </div>
              <div className="cv5-composer__hint">Anonymous posting · 200 chars max</div>
            </div>
          </div>
        )}

        {activeTab === 'alert' && (
          <div className="tab-pane animate-fade-in alert-pane">
            <div className="alert-header">
              <h3>Smart Alerts</h3>
              <p>Stay informed about power changes</p>
            </div>

            <div className="alert-section">
              <div className="alert-card">
                <div className="ac-row">
                  <div className="ac-info">
                    <div className="ac-icon ac-icon--yellow"><Icons.Bell /></div>
                    <div>
                      <div className="ac-title">Push Notifications</div>
                      <div className="ac-desc">Get instant alerts for outages</div>
                    </div>
                  </div>
                  <div className="ac-toggle ac-toggle--active">
                    <div className="ac-toggle-knob"></div>
                  </div>
                </div>
              </div>

              <div className="alert-card">
                <div className="ac-row">
                  <div className="ac-info">
                    <div className="ac-icon ac-icon--green"><Icons.Home /></div>
                    <div>
                      <div className="ac-title">Restoration Alerts</div>
                      <div className="ac-desc">Notify me when power is back</div>
                    </div>
                  </div>
                  <div className="ac-toggle">
                    <div className="ac-toggle-knob"></div>
                  </div>
                </div>
              </div>
            </div>

            <div className="alert-preview">
              <div className="ap-label">Notification Preview</div>
              <div className="ap-card">
                <div className="ap-header">
                  <div className="ap-app">
                    <div className="ap-app-icon">C</div>
                    <span>CHECKI</span>
                  </div>
                  <span>now</span>
                </div>
                <div className="ap-title">Power Outage Detected!</div>
                <div className="ap-body">New reports suggest power is out in {currentZone?.name}. Expected back by 4 PM.</div>
              </div>
            </div>
          </div>
        )}
      </main>

      <nav className="bottom-nav">
        <button className={`nav-item ${activeTab === 'home' ? 'active' : ''}`} onClick={() => setActiveTab('home')}>
          <Icons.Home /><span>Home</span>
        </button>
        <button className={`nav-item ${activeTab === 'schedule' ? 'active' : ''}`} onClick={() => setActiveTab('schedule')}>
          <Icons.Calendar /><span>Schedule</span>
        </button>
        <button className={`nav-item ${activeTab === 'community' ? 'active' : ''}`} onClick={() => setActiveTab('community')}>
          <Icons.Users /><span>Community</span>
        </button>
        <button className={`nav-item ${activeTab === 'alert' ? 'active' : ''}`} onClick={() => setActiveTab('alert')}>
          <Icons.Bell /><span>Alert</span>
        </button>
      </nav>

      <Toast message={toast.message} visible={toast.visible} />
    </div>
  );
}
