import { TOOTH_FINDINGS } from '../../constants/findings.js';
import Tooltip from '../Tooltip/Tooltip.jsx';
import './ToothPanel.css';

export default function FindingsChecklist({ findings, onChange }) {
  function handleGrade(key, grade) {
    onChange({ ...findings, [key]: grade });
  }

  function handleSelect(key, value) {
    const newVal = findings[key] === value ? null : value;
    onChange({ ...findings, [key]: newVal });
  }

  function handleCheckbox(key) {
    onChange({ ...findings, [key]: !findings[key] });
  }

  function handleSurface(key, surface) {
    const current = findings[key] ?? [];
    const next = current.includes(surface)
      ? current.filter(s => s !== surface)
      : [...current, surface];
    onChange({ ...findings, [key]: next });
  }

  return (
    <div className="panel-section">
      <label className="panel-section-label">Findings</label>
      <div className="findings-list">
        {TOOTH_FINDINGS.map(f => (
          <div key={f.key} className="finding-row">
            <span className="finding-label">{f.label}</span>

            {f.type === 'grade' && (
              <div className="grade-buttons">
                {f.grades.map((g, idx) => (
                  <Tooltip
                    key={g}
                    text={f.tooltips?.[idx]}
                    position="above"
                  >
                    <button
                      type="button"
                      title={f.descriptions?.[idx] ?? String(g)}
                      className={`grade-btn ${findings[f.key] === g ? 'grade-btn--active' : ''}`}
                      onClick={() => handleGrade(f.key, g)}
                    >
                      {g}
                    </button>
                  </Tooltip>
                ))}
              </div>
            )}

            {f.type === 'select' && (
              <div className="select-chips">
                {f.options.map(opt => (
                  <Tooltip
                    key={opt.value}
                    text={f.optionTooltips?.[opt.value]}
                    position="above"
                  >
                    <button
                      type="button"
                      className={`select-chip ${findings[f.key] === opt.value ? 'select-chip--active' : ''}`}
                      onClick={() => handleSelect(f.key, opt.value)}
                    >
                      {opt.label}
                    </button>
                  </Tooltip>
                ))}
              </div>
            )}

            {f.type === 'surfaces' && (
              <div className="surface-chips">
                {f.surfaces.map(s => (
                  <button
                    key={s.value}
                    type="button"
                    title={s.label}
                    className={`surface-chip ${(findings[f.key] ?? []).includes(s.value) ? 'surface-chip--active' : ''}`}
                    onClick={() => handleSurface(f.key, s.value)}
                  >
                    {s.abbr}
                  </button>
                ))}
              </div>
            )}

            {f.type === 'checkbox' && (
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={!!findings[f.key]}
                  onChange={() => handleCheckbox(f.key)}
                />
                <span className="checkbox-text">Yes</span>
              </label>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
