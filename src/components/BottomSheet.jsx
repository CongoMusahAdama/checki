import { useEffect, useRef } from 'react';
import './BottomSheet.css';

export default function BottomSheet({ zones, open, onClose, onReport }) {
  const selRef = useRef(null);

  useEffect(() => {
    if (open && selRef.current) selRef.current.value = '';
  }, [open]);

  function handleReport(status) {
    const id = selRef.current?.value;
    if (!id) { onReport(null, status); return; }
    onReport(id, status);
  }

  return (
    <>
      <div className={`sheet-overlay${open ? ' show' : ''}`} onClick={onClose} />
      <div className={`bottom-sheet${open ? ' show' : ''}`} role="dialog" aria-modal="true">
        <div className="sheet-handle" />
        <h3 className="sheet-title">Quick Report</h3>
        <p className="sheet-subtitle">Select an area to update its status</p>
        <div className="sheet-select-wrap">
          <select ref={selRef} className="area-dropdown" aria-label="Select zone">
            <option value="">Choose an area...</option>
            {zones.map(z => (
              <option key={z.id} value={z.id}>{z.name}</option>
            ))}
          </select>
          <span className="select-arrow">▾</span>
        </div>
        <div className="sheet-btns">
          <button className="btn-sheet btn-sheet-off" onClick={() => handleReport('off')}>
            OUTAGE
          </button>
          <button className="btn-sheet btn-sheet-on" onClick={() => handleReport('on')}>
            RESTORED
          </button>
        </div>
        <button className="btn-sheet-cancel" onClick={onClose}>Cancel</button>
      </div>
    </>
  );
}
