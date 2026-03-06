import { useChart } from '../../context/ChartContext.jsx';
import { CHART_FINDINGS } from '../../constants/findings.js';
import Tooltip from '../Tooltip/Tooltip.jsx';
import './ChartFindings.css';

const NERVE_BLOCKS = [
  { key: 'infraorbital', label: 'Infraorbital Block' },
  { key: 'mandibular',   label: 'Mandibular Block'   },
];

export default function ChartFindings() {
  const { state, dispatch } = useChart();
  const { chartFindings, softTissueNotes, nerveBlocks } = state;

  function handleGradeClick(key, grade) {
    dispatch({ type: 'SET_CHART_FINDING', payload: { field: key, value: grade } });
  }

  function handleNerveBlock(block, side) {
    const current = nerveBlocks[block] ?? [];
    const next = current.includes(side)
      ? current.filter(s => s !== side)
      : [...current, side];
    dispatch({ type: 'SET_NERVE_BLOCK', payload: { block, value: next } });
  }

  return (
    <div className="chart-findings">
      <div className="cf-header">
        <span className="cf-title">Chart-Wide Findings</span>
        <span className="cf-subtitle">Recorded once per visit</span>
      </div>

      <div className="cf-body">
        {/* Grade-based chart findings */}
        <div className="cf-grades-row">
          {CHART_FINDINGS.map(finding => (
            <div key={finding.key} className="cf-finding">
              <span className="cf-finding-label">{finding.label}</span>
              <div className="cf-grade-buttons">
                {finding.grades.map((grade, idx) => (
                  <Tooltip
                    key={grade}
                    text={finding.tooltips?.[idx]}
                    position="above"
                  >
                    <button
                      type="button"
                      className={`cf-grade-btn ${chartFindings[finding.key] === grade ? 'cf-grade-btn--active' : ''}`}
                      onClick={() => handleGradeClick(finding.key, grade)}
                      aria-label={`${finding.label} ${finding.descriptions?.[idx] ?? grade}`}
                    >
                      {grade}
                    </button>
                  </Tooltip>
                ))}
              </div>
              {chartFindings[finding.key] !== null && chartFindings[finding.key] !== undefined && (
                <span className="cf-selected-desc">
                  {finding.descriptions?.[finding.grades.indexOf(chartFindings[finding.key])] ?? ''}
                </span>
              )}
            </div>
          ))}
        </div>

        {/* Nerve blocks */}
        <div className="cf-nerve-blocks">
          {NERVE_BLOCKS.map(nb => (
            <div key={nb.key} className="cf-nerve-block-row">
              <span className="cf-finding-label">{nb.label}</span>
              <div className="cf-side-buttons">
                {['left', 'right'].map(side => (
                  <button
                    key={side}
                    type="button"
                    className={`cf-side-btn ${(nerveBlocks[nb.key] ?? []).includes(side) ? 'cf-side-btn--active' : ''}`}
                    onClick={() => handleNerveBlock(nb.key, side)}
                  >
                    {side.charAt(0).toUpperCase() + side.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Soft tissue notes */}
        <div className="cf-soft-tissue">
          <label className="cf-finding-label" htmlFor="soft-tissue-notes">
            Soft Tissue Abnormalities
          </label>
          <textarea
            id="soft-tissue-notes"
            className="cf-textarea"
            value={softTissueNotes}
            onChange={e => dispatch({ type: 'SET_SOFT_TISSUE_NOTES', payload: e.target.value })}
            placeholder="Describe any soft tissue abnormalities (e.g. masses, ulcers, discolouration)…"
            rows={2}
          />
        </div>
      </div>
    </div>
  );
}
