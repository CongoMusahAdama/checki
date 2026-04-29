import React, { useState, useMemo } from 'react';
import './FeedComponent.css';

const Icons = {
  Search: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>,
  MapPin: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>,
  Plus: () => <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>,
  ChevronDown: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="6 9 12 15 18 9"></polyline></svg>,
  X: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>,
  Zap: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"></path></svg>,
  Check: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>,
  Alert: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>,
  Loader: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="animate-spin"><path d="M12 2v4m0 12v4M4.93 4.93l2.83 2.83m8.48 8.48l2.83 2.83M2 12h4m12 0h4M4.93 19.07l2.83-2.83m8.48-8.48l2.83-2.83"></path></svg>
};

const FeedCard = ({ zone, onConfirm }) => {
  const isOff = zone.status === 'off';
  const isUnstable = zone.status === 'partial';
  const isUnconfirmed = zone.reports > 0 && zone.reports < 3;
  
  let statusLabel = isOff 
    ? (isUnconfirmed ? 'Possible OUTAGE' : 'Confirmed OFF')
    : (isUnconfirmed ? 'Possible RESTORATION' : 'Confirmed ON');

  if (isUnstable) statusLabel = 'Power is UNSTABLE';

  let badgeClass = isOff ? 'status-dum' : 'status-sor';
  if (isUnstable || isUnconfirmed) badgeClass = 'status-unconfirmed';
  if (isOff && !isUnconfirmed) badgeClass = 'status-dum';
  if (!isOff && !isUnconfirmed) badgeClass = 'status-sor';

  return (
    <div className={`feed-card-pro animate-fade-in ${isUnconfirmed ? 'unconfirmed-card' : ''}`}>
      <div className="feed-card-header">
        <div className="zone-info-main">
          <span className={`status-dot-pulse ${badgeClass}`}></span>
          <span className="zone-name-title">{zone.name.toUpperCase()}</span>
        </div>
        <span className="time-ago-text">{zone.updatedMins || 5} mins ago</span>
      </div>

      <h3 className={`feed-status-heading ${isOff ? 'text-dum' : 'text-sor'} ${isUnconfirmed ? 'text-unconfirmed' : ''}`}>
        {statusLabel}
      </h3>
      
      <p className="feed-status-desc">
        {isUnconfirmed 
          ? `Waiting for ${3 - zone.reports} more reports to confirm status change.` 
          : isOff ? 'Power is out according to verified community reports.' : 'Power has been restored and verified.'
        }
      </p>

      <div className="feed-card-footer">
        <div className="location-info">
          <Icons.MapPin />
          <span>{zone.region || 'TAKORADI'}</span>
        </div>
        
        {isUnconfirmed ? (
          <button className="btn-confirm-status" onClick={() => onConfirm(zone.id, zone.status === 'off' ? 'off' : 'on')}>
            <Icons.Check />
            <span>Confirm Status</span>
          </button>
        ) : (
          <div className={`status-tag-min ${badgeClass}`}>
            <span className="dot"></span>
            {isOff ? 'Verified OUT' : 'Verified ON'}
          </div>
        )}
      </div>
    </div>
  );
};

const RecordUpdateOverlay = ({ onClose, onPost }) => {
  const [selectedStatus, setSelectedStatus] = useState(null);
  const [isLocating, setIsLocating] = useState(false);
  const [detectedLoc, setDetectedLoc] = useState(null);

  const handleDetectLocation = () => {
    setIsLocating(true);
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser');
      setIsLocating(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setTimeout(() => {
          setDetectedLoc('Detected: Kwesimintsim Area');
          setIsLocating(false);
        }, 1500);
      },
      (error) => {
        alert('Unable to retrieve your location');
        setIsLocating(false);
      }
    );
  };

  return (
    <div className="record-overlay-backdrop" onClick={onClose}>
      <div className="record-overlay-card animate-slide-up" onClick={e => e.stopPropagation()}>
        <div className="record-overlay-handle"></div>
        <div className="record-overlay-header">
          <h2>Update Status</h2>
          <button className="btn-close-overlay" onClick={onClose}><Icons.X /></button>
        </div>

        <div className="record-status-options-premium">
          <button 
            className={`premium-opt-btn opt-on ${selectedStatus === 'on' ? 'active' : ''}`}
            onClick={() => setSelectedStatus('on')}
          >
            <div className="p-opt-icon"><Icons.Zap /></div>
            <div className="p-opt-text">
              <span className="p-opt-title">Power is ON</span>
              <span className="p-opt-desc">Everything is working fine</span>
            </div>
            <div className="p-opt-radio">
              <div className="p-opt-radio-inner"></div>
            </div>
          </button>

          <button 
            className={`premium-opt-btn opt-off ${selectedStatus === 'off' ? 'active' : ''}`}
            onClick={() => setSelectedStatus('off')}
          >
            <div className="p-opt-icon"><Icons.Zap /></div>
            <div className="p-opt-text">
              <span className="p-opt-title">Power is OUT</span>
              <span className="p-opt-desc">We are in the dark</span>
            </div>
            <div className="p-opt-radio">
              <div className="p-opt-radio-inner"></div>
            </div>
          </button>

          <button 
            className={`premium-opt-btn opt-unstable ${selectedStatus === 'partial' ? 'active' : ''}`}
            onClick={() => setSelectedStatus('partial')}
          >
            <div className="p-opt-icon"><Icons.Alert /></div>
            <div className="p-opt-text">
              <span className="p-opt-title">Unconfirmed / Unstable</span>
              <span className="p-opt-desc">Power is fluctuating or unsure</span>
            </div>
            <div className="p-opt-radio">
              <div className="p-opt-radio-inner"></div>
            </div>
          </button>
        </div>

        <div className="premium-overlay-footer">
          <button 
            className={`btn-locate-premium ${isLocating ? 'loading' : ''} ${detectedLoc ? 'success' : ''}`}
            onClick={handleDetectLocation}
            disabled={isLocating}
          >
            {isLocating ? <Icons.Loader /> : <Icons.MapPin />}
            <span>{detectedLoc || (isLocating ? 'Detecting...' : 'Detect my community')}</span>
          </button>
          
          <button 
            className={`btn-share-premium ${selectedStatus ? 'ready' : 'disabled'}`}
            disabled={!selectedStatus || isLocating}
            onClick={() => onPost(selectedStatus)}
          >
            Share Update
          </button>
          <div className="bottom-safe-area"></div>
        </div>
      </div>
    </div>
  );
};

const FeedComponent = ({ zones, onAddReport }) => {
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [showRecordOverlay, setShowRecordOverlay] = useState(false);

  const filteredZones = useMemo(() => {
    return zones.filter(z => {
      const matchesSearch = z.name.toLowerCase().includes(search.toLowerCase());
      if (!matchesSearch) return false;
      
      const isConfirmed = z.reports >= 3 || z.reports === 0; // Show initial zones too
      const isUnconfirmed = z.reports > 0 && z.reports < 3;
      const isStale = z.updatedMins >= 360;

      if (filter === 'all') return true; // Show all data as requested
      if (filter === 'out') return z.status === 'off';
      if (filter === 'unconfirmed') return isUnconfirmed && !isStale;
      if (filter === 'on') return z.status === 'on';
      return true;
    });
  }, [zones, filter, search]);

  const totalContributions = useMemo(() => {
    return zones.reduce((acc, z) => acc + (z.reports || 0), 1240);
  }, [zones]);

  const handlePostUpdate = (status) => {
    setShowRecordOverlay(false);
    onAddReport(null, status);
  };

  return (
    <div className="feed-view-container">
      <div className="feed-sticky-header">
        <div className="feed-top-row">
          <h1 className="feed-app-brand">Checki</h1>
          <div className="theme-toggle-min">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"></path></svg>
            <span>Light</span>
          </div>
        </div>

        <div className="feed-search-wrapper">
          <div className="feed-search-bar">
            <Icons.Search />
            <input 
              type="text" 
              placeholder="Search zones by name..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="feed-filter-scroll">
          <button className={`filter-chip ${filter === 'all' ? 'active' : ''}`} onClick={() => setFilter('all')}>All zones</button>
          <button className={`filter-chip ${filter === 'out' ? 'active' : ''}`} onClick={() => setFilter('out')}>Power out</button>
          <button className={`filter-chip ${filter === 'unconfirmed' ? 'active' : ''}`} onClick={() => setFilter('unconfirmed')}>Unconfirmed</button>
          <button className={`filter-chip ${filter === 'on' ? 'active' : ''}`} onClick={() => setFilter('on')}>Power restored</button>
        </div>

        <div className="feed-stats-row">
          <span className="stats-count">{totalContributions.toLocaleString()} contributions</span>
          <div className="sort-dropdown">
            <span>Recently active</span>
            <Icons.ChevronDown />
          </div>
        </div>
      </div>

      <div className="feed-scroll-content">
        {filteredZones.length > 0 ? (
          filteredZones.map(zone => (
            <FeedCard key={zone.id} zone={zone} onConfirm={onAddReport} />
          ))
        ) : (
          <div className="empty-feed-state animate-fade-in">
            <p>No reports in this area recently.</p>
          </div>
        )}
        <div className="feed-bottom-spacer"></div>
      </div>

      <button className="feed-fab" onClick={() => setShowRecordOverlay(true)} aria-label="Add contribution">
        <Icons.Plus />
      </button>

      {showRecordOverlay && (
        <RecordUpdateOverlay 
          onClose={() => setShowRecordOverlay(false)} 
          onPost={handlePostUpdate}
        />
      )}
    </div>
  );
};

export default FeedComponent;
