import './ToothPanel.css';

const STATUSES = [
  { value: 'present',    label: 'Present' },
  { value: 'missing',    label: 'Missing' },
  { value: 'extracted',  label: 'Extracted' },
  { value: 'not_charted', label: 'Not Charted' },
];

export default function StatusSelector({ value, onChange }) {
  return (
    <div className="panel-section">
      <label className="panel-section-label">Status</label>
      <div className="status-chips">
        {STATUSES.map(s => (
          <button
            key={s.value}
            type="button"
            className={`status-chip ${value === s.value ? 'status-chip--active' : ''}`}
            onClick={() => onChange(s.value)}
          >
            {s.label}
          </button>
        ))}
      </div>
    </div>
  );
}
