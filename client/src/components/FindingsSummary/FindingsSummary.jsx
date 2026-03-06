import { useChart } from '../../context/ChartContext.jsx';
import { TEETH_BY_SPECIES, getToothById } from '../../constants/teethData.js';
import { TOOTH_FINDINGS, CHART_FINDINGS, hasAnyFinding } from '../../constants/findings.js';
import './FindingsSummary.css';

function formatFindingValue(finding, value) {
  if (value === null || value === undefined) return null;
  if (finding.type === 'surfaces') {
    if (!Array.isArray(value) || value.length === 0) return null;
    return value
      .map(v => finding.surfaces?.find(s => s.value === v)?.abbr ?? v)
      .join(', ');
  }
  if (finding.type === 'checkbox') return value ? 'Yes' : null;
  if (finding.type === 'grade') {
    if (value === 0) return null; // grade 0 = normal for all grade findings
    const idx = finding.grades?.indexOf(value);
    return idx !== undefined && idx >= 0 && finding.descriptions
      ? `${finding.descriptions[idx]}`
      : String(value);
  }
  if (finding.type === 'select') {
    const opt = finding.options?.find(o => o.value === value);
    return opt ? opt.label : value;
  }
  return String(value);
}

function formatPocketDepths(pd) {
  if (!pd) return null;
  const parts = [];
  if (pd.mesial !== null && pd.mesial !== undefined) parts.push(`M:${pd.mesial}`);
  if (pd.distal !== null && pd.distal !== undefined) parts.push(`D:${pd.distal}`);
  if (pd.buccal !== null && pd.buccal !== undefined) parts.push(`B:${pd.buccal}`);
  if (pd.palatalLingual !== null && pd.palatalLingual !== undefined) parts.push(`P/L:${pd.palatalLingual}`);
  return parts.length > 0 ? parts.join(', ') : null;
}

const NERVE_BLOCK_LABELS = {
  infraorbital: 'Infraorbital Block',
  mandibular:   'Mandibular Block',
};

export default function FindingsSummary() {
  const { state } = useChart();
  const { patientInfo, toothData, chartFindings, softTissueNotes, nerveBlocks } = state;
  const quads = TEETH_BY_SPECIES[patientInfo.species];

  // Gather all tooth IDs in display order
  const allTeeth = [
    ...quads.upperRight,
    ...quads.upperLeft,
    ...quads.lowerLeft,
    ...quads.lowerRight,
  ];

  // Only include teeth with notable data
  const notableTeeth = allTeeth.filter(t => {
    const td = toothData[t.id];
    if (!td) return false;
    if (td.status !== 'present') return true;
    if (hasAnyFinding(td.findings)) return true;
    const pd = formatPocketDepths(td.pocketDepths);
    if (pd) return true;
    if (td.notes?.trim()) return true;
    return false;
  });

  // Build chart-level finding lines
  const chartFindingLines = CHART_FINDINGS
    .map(f => {
      const formatted = formatFindingValue(f, chartFindings?.[f.key]);
      return formatted ? { label: f.label, value: formatted } : null;
    })
    .filter(Boolean);

  // Build nerve block lines
  const nerveBlockLines = Object.entries(nerveBlocks ?? {})
    .map(([block, sides]) => {
      if (!sides?.length) return null;
      const label = NERVE_BLOCK_LABELS[block] ?? block;
      const sideText = sides.map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' & ');
      return { label, value: sideText };
    })
    .filter(Boolean);

  const hasSoftTissue = softTissueNotes?.trim();
  const hasChartData = chartFindingLines.length > 0 || nerveBlockLines.length > 0 || hasSoftTissue;

  if (notableTeeth.length === 0 && !hasChartData) {
    return (
      <div className="findings-summary findings-summary--empty">
        <p>No findings recorded — all teeth present and within normal limits.</p>
      </div>
    );
  }

  return (
    <div className="findings-summary">
      <h3 className="findings-summary-title">Findings Summary</h3>

      {/* Chart-level findings */}
      {hasChartData && (
        <div className="chart-findings-summary">
          {(chartFindingLines.length > 0 || nerveBlockLines.length > 0) && (
            <div className="chart-findings-row">
              {[...chartFindingLines, ...nerveBlockLines].map(({ label, value }) => (
                <span key={label} className="chart-finding-item">
                  <span className="chart-finding-label">{label}:</span>{' '}
                  <span className="chart-finding-value">{value}</span>
                </span>
              ))}
            </div>
          )}
          {hasSoftTissue && (
            <div className="soft-tissue-summary">
              <span className="chart-finding-label">Soft Tissue Notes:</span>{' '}
              {softTissueNotes.trim()}
            </div>
          )}
        </div>
      )}

      {/* Per-tooth findings table */}
      {notableTeeth.length > 0 && (
        <table className="summary-table">
          <thead>
            <tr>
              <th>Tooth</th>
              <th>Status</th>
              <th>Findings</th>
              <th>Pocket Depths</th>
              <th>Notes</th>
            </tr>
          </thead>
          <tbody>
            {notableTeeth.map(t => {
              const td = toothData[t.id];
              const toothInfo = getToothById(patientInfo.species, t.id);

              // Build findings text from per-tooth findings only
              const findingLines = TOOTH_FINDINGS
                .map(f => {
                  const formatted = formatFindingValue(f, td.findings?.[f.key]);
                  return formatted ? `${f.label}: ${formatted}` : null;
                })
                .filter(Boolean);

              const pocketText = formatPocketDepths(td.pocketDepths);

              return (
                <tr key={t.id}>
                  <td className="summary-tooth-id">
                    <strong>{t.id}</strong>
                    <span className="summary-tooth-label"> {toothInfo?.label}</span>
                  </td>
                  <td className={`summary-status summary-status--${td.status}`}>
                    {td.status.replace('_', ' ')}
                  </td>
                  <td>
                    {findingLines.length > 0
                      ? findingLines.map((line, i) => <div key={i}>{line}</div>)
                      : <span className="summary-none">—</span>
                    }
                  </td>
                  <td>{pocketText || <span className="summary-none">—</span>}</td>
                  <td>{td.notes?.trim() || <span className="summary-none">—</span>}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
}
