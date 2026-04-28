import { useEffect } from 'react';
import './Toast.css';

export default function Toast({ message, visible }) {
  return (
    <div className={`toast${visible ? ' show' : ''}`} role="alert" aria-live="polite">
      {message}
    </div>
  );
}
