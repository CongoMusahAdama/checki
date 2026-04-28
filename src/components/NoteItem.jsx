import { avatarColor, userInitials, timeAgo } from '../utils/helpers.js';
import './NoteItem.css';

export default function NoteItem({ note }) {
  const color    = avatarColor(note.user);
  const initials = userInitials(note.user);
  return (
    <div className="note-item-pro">
      <div className="note-header-pro">
        <div className="note-user-pro">
          <div className="note-av-pro" style={{ background: color }}>{initials}</div>
          <span className="note-uid-pro">{note.user}</span>
        </div>
        <span className="note-time-pro">{timeAgo(note.time)}</span>
      </div>
      <p className="note-body-pro">{note.text}</p>
    </div>
  );
}
