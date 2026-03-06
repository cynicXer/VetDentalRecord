import './ToothPanel.css';

export default function NotesField({ notes, onChange }) {
  return (
    <div className="panel-section">
      <label className="panel-section-label">Notes</label>
      <textarea
        className="notes-textarea"
        value={notes}
        onChange={e => onChange(e.target.value)}
        placeholder="Additional observations..."
        rows={3}
      />
    </div>
  );
}
