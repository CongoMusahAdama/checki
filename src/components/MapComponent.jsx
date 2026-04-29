import React, { useState, useMemo, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './MapComponent.css';

// Custom pulsing icon generator
const createPulsingIcon = (status) => {
  return L.divIcon({
    className: 'custom-leaflet-marker',
    html: `<div class="marker-container">
             <div class="marker-core core-${status || 'unconfirmed'}"></div>
             <div class="marker-glow glow-${status || 'unconfirmed'}"></div>
           </div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
    popupAnchor: [0, -12]
  });
};

// User Location Icon (Blue Pulse)
const createUserIcon = () => {
  return L.divIcon({
    className: 'custom-leaflet-marker',
    html: `<div class="marker-container">
             <div class="user-location-core"></div>
             <div class="user-location-glow"></div>
           </div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 12]
  });
};

// Map Logic Handler (Pans to user location when detected)
const MapLogic = ({ userCoords }) => {
  const map = useMap();
  
  useEffect(() => {
    if (userCoords) {
      map.flyTo([userCoords.lat, userCoords.lng], 15, { duration: 2 });
    }
  }, [userCoords, map]);

  return null;
};

// Custom Professional Map Controls
const ProfessionalControls = () => {
  const map = useMap();
  const handleZoomIn = () => map.zoomIn();
  const handleZoomOut = () => map.zoomOut();
  const handleLocate = () => map.locate({ setView: true, maxZoom: 16 });
  const handleResetBearing = () => map.setView([4.90, -1.75], 12);

  return (
    <div className="custom-map-controls-top-right">
      <div className="control-group-pro">
        <button className="control-btn-pro zoom-in" onClick={handleZoomIn} title="Zoom In">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
        </button>
        <div className="control-divider-pro"></div>
        <button className="control-btn-pro zoom-out" onClick={handleZoomOut} title="Zoom Out">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="5" y1="12" x2="19" y2="12"></line></svg>
        </button>
      </div>
      <div className="control-group-pro mt-12">
        <button className="control-btn-pro compass-btn" onClick={handleResetBearing} title="Reset Orientation">
          <div className="compass-icon">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><path d="M16.24 7.76l-2.12 6.36-6.36 2.12 2.12-6.36 6.36-2.12z" fill="currentColor"></path></svg>
          </div>
        </button>
      </div>
      <div className="control-group-pro mt-12">
        <button className="control-btn-pro locate-btn" onClick={handleLocate} title="My Location">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="3"></circle><path d="M13 2v3M13 19v3M5 13H2M22 13h-3"></path></svg>
        </button>
      </div>
    </div>
  );
};

// Zone Navigation Handler
const ZoneNavigator = ({ zones, activeIndex, setActiveIndex, onZoneSelect }) => {
  const map = useMap();
  
  const goToZone = (index) => {
    const zone = zones[index];
    if (zone && zone.coords) {
      map.flyTo([zone.coords[1], zone.coords[0]], 15, { duration: 1.5 });
      setActiveIndex(index);
    }
  };

  const handleNext = () => goToZone((activeIndex + 1) % zones.length);
  const handlePrev = () => goToZone((activeIndex - 1 + zones.length) % zones.length);

  return (
    <div className="map-bottom-overlay">
      <div className="premium-zone-navigator">
        <button className="nav-arrow-btn left" onClick={handlePrev} aria-label="Previous Area">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
        </button>
        
        <div className="nav-content-pro">
          <div className="nav-current-info">
            <span className="nav-zone-name">{zones[activeIndex]?.name || 'Select Area'}</span>
            <span className="nav-zone-count">{activeIndex + 1} of {zones.length} zones</span>
          </div>
        </div>

        <button className="nav-arrow-btn right" onClick={handleNext} aria-label="Next Area">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
        </button>
      </div>

      <div className="map-legend-pro">
        <div className="legend-item"><span className="dot dot-red"></span> Dum</div>
        <div className="legend-item"><span className="dot dot-green"></span> Sor</div>
        <div className="legend-item"><span className="dot dot-amber"></span> Unconfirmed</div>
      </div>
    </div>
  );
};

const MapComponent = ({ zones, onZoneSelect, userCoords }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  
  // Auto-Theme Logic (Light in day, Dark in evening)
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const hour = new Date().getHours();
    return hour >= 18 || hour < 6; // 6 PM to 6 AM is Dark
  });

  const center = [4.90, -1.75]; // Takoradi default
  const zoom = 12;

  const tileUrl = isDarkMode 
    ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
    : "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png";

  const stats = useMemo(() => {
    const off = zones.filter(z => z.status === 'off').length;
    const on = zones.filter(z => z.status === 'on').length;
    return { off, on, total: zones.length };
  }, [zones]);

  return (
    <div className={`map-view-container professional-theme ${isDarkMode ? 'dark-mode-map' : 'light-mode-map'}`}>
      <div className="map-floating-header">
        <div className="premium-stats-pill">
          <div className="stat-group">
            <span className="stat-dot dot-red"></span>
            <span className="stat-value">{stats.off}</span>
            <span className="stat-label">DUM</span>
          </div>
          <div className="stat-sep"></div>
          <div className="stat-group">
            <span className="stat-dot dot-green"></span>
            <span className="stat-value">{stats.on}</span>
            <span className="stat-label">SOR</span>
          </div>
          <div className="stat-sep"></div>
          <div className="live-status-badge">
            <div className="live-pulse-ring"></div>
            <span className="live-text">LIVE</span>
          </div>
        </div>
      </div>

      <MapContainer 
        center={center} 
        zoom={zoom} 
        style={{ height: '100%', width: '100%' }}
        zoomControl={false}
      >
        <TileLayer
          url={tileUrl}
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />

        <MapLogic userCoords={userCoords} />
        <ProfessionalControls />
        
        <ZoneNavigator 
          zones={zones} 
          activeIndex={activeIndex} 
          setActiveIndex={setActiveIndex} 
          onZoneSelect={onZoneSelect} 
        />

        {/* User Marker */}
        {userCoords && (
          <Marker position={[userCoords.lat, userCoords.lng]} icon={createUserIcon()}>
            <Popup>
              <div style={{ fontWeight: '800', textAlign: 'center' }}>Your Location</div>
            </Popup>
          </Marker>
        )}

        {/* Zone Markers */}
        {zones.map((zone, idx) => (
          zone.coords && (
            <Marker 
              key={zone.id} 
              position={[zone.coords[1], zone.coords[0]]} 
              icon={createPulsingIcon(zone.status)}
              eventHandlers={{
                click: () => setActiveIndex(idx),
              }}
            >
              <Popup className="premium-popup">
                <div className="map-popup">
                  <div className="popup-status-badge">LIVE STATUS</div>
                  <h3>{zone.name}</h3>
                  <p className={`status-text text-${zone.status}`}>
                    {zone.status === 'off' ? '🔴 POWER OFF (DUM)' : '🟢 POWER ON (SOR)'}
                  </p>
                  <div className="popup-footer">
                    <span>Expected back: {zone.expectedBack || 'N/A'}</span>
                    <button className="btn-details" onClick={() => onZoneSelect(zone.id)}>Open Full Report</button>
                  </div>
                </div>
              </Popup>
            </Marker>
          )
        ))}
      </MapContainer>
    </div>
  );
};

export default MapComponent;
