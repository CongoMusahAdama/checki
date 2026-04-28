import { statusLabel, badgeClass, timeAgo, getCountdown } from '../utils/helpers.js';
import './ZoneCard.css';

export default function ZoneCard({ zone, onClick }) {
  const expectedBackUI = zone.expectedBack || null;
  const expectedOutUI  = zone.expectedOutage || null;

  return (
    <div
      className={`zone-card-pro status-${zone.status}`}
      onClick={() => onClick(zone.id)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onClick(zone.id)}
    >
      <div className="zone-icon-box">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
      </div>
      <div className="zone-info-pro">
        <div className="zone-name-pro">{zone.name}</div>
        <div className="zone-meta-pro">
          <span className="zone-countdown-min">
            {zone.status === 'off' 
              ? `RESTORES: ${getCountdown(expectedBackUI, 'Pending…')}`
              : (expectedOutUI ? `OUTAGE IN: ${getCountdown(expectedOutUI, 'Pending…')}` : 'STABLE SUPPLY')
            }
          </span>
        </div>
      </div>
      <div className={`status-pill-pro badge-${zone.status}`}>
        {zone.status.toUpperCase()}
      </div>
      <svg className="chevron-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
    </div>
  );
}
