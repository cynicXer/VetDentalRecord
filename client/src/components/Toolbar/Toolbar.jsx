import { useChart } from '../../context/ChartContext.jsx';
import { usePDFExport } from '../../hooks/usePDFExport.js';
import { useSignOut, useCurrentUser } from '../Auth/AuthGate.jsx';
import { TOOTH_COLORS, TOOTH_TYPE_COLORS } from '../../utils/toothColors.js';
import { TOOTH_TYPES } from '../../constants/teethData.js';
import './Toolbar.css';

const REQUIRED = [
  { field: 'petName',       label: 'Pet Name' },
  { field: 'ownerLastName', label: 'Owner Last Name' },
  { field: 'clinician',     label: 'Clinician' },
  { field: 'technician',    label: 'Technician' },
  { field: 'breed',         label: 'Breed' },
  { field: 'age',           label: 'Age' },
];

export default function Toolbar() {
  const { state, dispatch } = useChart();
  const { exportPDF } = usePDFExport();
  const signOut = useSignOut();
  const currentUser = useCurrentUser();

  const missing = REQUIRED.filter(r => !state.patientInfo[r.field].trim());

  function handleClear() {
    if (window.confirm('Clear all findings and patient info? This cannot be undone.')) {
      dispatch({ type: 'CLEAR_ALL' });
    }
  }

  function handleExport() {
    if (missing.length > 0) {
      dispatch({ type: 'SET_EXPORT_ATTEMPTED' });
      return;
    }
    exportPDF(state.patientInfo);
  }

  return (
    <div className="toolbar">
      {/* Color legend */}
      <div className="legend">
        <span className="legend-title">Tooth type:</span>
        {[
          { type: TOOTH_TYPES.INCISOR,        label: 'Incisor' },
          { type: TOOTH_TYPES.CANINE,         label: 'Canine' },
          { type: TOOTH_TYPES.PREMOLAR,       label: 'Premolar' },
          { type: TOOTH_TYPES.PREMOLAR_LARGE, label: 'Carnassial (P4)' },
          { type: TOOTH_TYPES.MOLAR,          label: 'Molar' },
        ].map(item => (
          <span key={item.label} className="legend-item">
            <span className="legend-swatch" style={{
              background: TOOTH_TYPE_COLORS[item.type].fill,
              border: `1.5px solid ${TOOTH_TYPE_COLORS[item.type].stroke}`,
            }} />
            {item.label}
          </span>
        ))}

        <span className="legend-divider" />

        <span className="legend-title">Pathology:</span>
        {[
          { color: TOOTH_COLORS.finding,    stroke: '#B89000', label: 'Finding' },
          { color: TOOTH_COLORS.severe,     stroke: '#CC0000', label: 'Severe' },
          { color: TOOTH_COLORS.missing,    stroke: '#888888', label: 'Missing/Extracted' },
          { color: TOOTH_COLORS.notCharted, stroke: '#AAAAAA', label: 'Not Charted' },
        ].map(item => (
          <span key={item.label} className="legend-item">
            <span className="legend-swatch" style={{
              background: item.color,
              border: `1.5px solid ${item.stroke}`,
            }} />
            {item.label}
          </span>
        ))}
      </div>

      {/* Actions + validation error */}
      <div className="toolbar-right">
        {state.ui.exportAttempted && missing.length > 0 && (
          <p className="toolbar-error">
            Required: {missing.map(r => r.label).join(', ')}
          </p>
        )}
        <div className="toolbar-actions">
          {currentUser && (
            <span className="toolbar-user" title={currentUser.email}>
              {currentUser.email}
            </span>
          )}
          <button className="toolbar-btn toolbar-btn--danger" onClick={handleClear}>
            Clear All
          </button>
          <button className="toolbar-btn toolbar-btn--primary" onClick={handleExport}>
            Export PDF
          </button>
          <button className="toolbar-btn toolbar-btn--secondary" onClick={signOut}>
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
}
