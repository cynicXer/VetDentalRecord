import './ToothPanel.css';

const SITES = [
  { key: 'mesial',        label: 'Mesial (M)' },
  { key: 'distal',        label: 'Distal (D)' },
  { key: 'buccal',        label: 'Buccal (B)' },
  { key: 'palatalLingual', label: 'Palatal/Lingual (P/L)' },
];

export default function PocketDepths({ pocketDepths, onChange }) {
  function handleChange(key, raw) {
    const val = raw === '' ? null : parseInt(raw, 10);
    if (val !== null && (isNaN(val) || val < 0 || val > 30)) return;
    onChange({ ...pocketDepths, [key]: val });
  }

  return (
    <div className="panel-section">
      <label className="panel-section-label">Pocket Depths (mm)</label>
      <div className="pocket-grid">
        {SITES.map(site => (
          <div key={site.key} className="pocket-item">
            <label className="pocket-site-label">{site.label}</label>
            <input
              type="number"
              className="pocket-input"
              min={0}
              max={30}
              value={pocketDepths[site.key] ?? ''}
              onChange={e => handleChange(site.key, e.target.value)}
              placeholder="—"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
