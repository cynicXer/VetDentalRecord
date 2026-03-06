import { useChart, ChartProvider } from './context/ChartContext.jsx';
import AuthGate from './components/Auth/AuthGate.jsx';
import PatientInfoForm from './components/PatientInfo/PatientInfoForm.jsx';
import DentalChart from './components/DentalChart/DentalChart.jsx';
import ToothPanel from './components/ToothPanel/ToothPanel.jsx';
import Toolbar from './components/Toolbar/Toolbar.jsx';
import ChartFindings from './components/ChartFindings/ChartFindings.jsx';
import FindingsSummary from './components/FindingsSummary/FindingsSummary.jsx';
import { TOOTH_COLORS, TOOTH_TYPE_COLORS } from './utils/toothColors.js';
import { TOOTH_TYPES } from './constants/teethData.js';
import './App.css';

function PatientInfoHeader() {
  const { state } = useChart();
  const p = state.patientInfo;
  return (
    <div className="patient-header-bar">
      <div className="patient-header-field">
        <span className="ph-label">Pet Name</span>
        <span className="ph-value">{p.petName || '—'}</span>
      </div>
      <div className="patient-header-field">
        <span className="ph-label">Owner</span>
        <span className="ph-value">{p.ownerLastName || '—'}</span>
      </div>
      <div className="patient-header-field">
        <span className="ph-label">Species</span>
        <span className="ph-value" style={{ textTransform: 'capitalize' }}>{p.species}</span>
      </div>
      <div className="patient-header-field">
        <span className="ph-label">Breed</span>
        <span className="ph-value">{p.breed || '—'}</span>
      </div>
      <div className="patient-header-field">
        <span className="ph-label">Age</span>
        <span className="ph-value">{p.age || '—'}</span>
      </div>
      <div className="patient-header-field">
        <span className="ph-label">Date</span>
        <span className="ph-value">{p.date || '—'}</span>
      </div>
      <div className="patient-header-field">
        <span className="ph-label">Clinician</span>
        <span className="ph-value">{p.clinician || '—'}</span>
      </div>
      <div className="patient-header-field">
        <span className="ph-label">Technician</span>
        <span className="ph-value">{p.technician || '—'}</span>
      </div>
    </div>
  );
}

function ColorLegendBar() {
  return (
    <div className="color-legend-bar">
      {[
        { type: TOOTH_TYPES.INCISOR,        label: 'Incisor' },
        { type: TOOTH_TYPES.CANINE,         label: 'Canine' },
        { type: TOOTH_TYPES.PREMOLAR,       label: 'Premolar' },
        { type: TOOTH_TYPES.PREMOLAR_LARGE, label: 'Carnassial (P4)' },
        { type: TOOTH_TYPES.MOLAR,          label: 'Molar' },
      ].map(item => (
        <span key={item.label} className="cl-item">
          <span className="cl-swatch" style={{
            background: TOOTH_TYPE_COLORS[item.type].fill,
            border: `1.5px solid ${TOOTH_TYPE_COLORS[item.type].stroke}`,
          }} />
          {item.label}
        </span>
      ))}
      <span className="cl-divider" />
      {[
        { color: TOOTH_COLORS.finding,    stroke: '#B89000', label: 'Finding' },
        { color: TOOTH_COLORS.severe,     stroke: '#CC0000', label: 'Severe' },
        { color: TOOTH_COLORS.missing,    stroke: '#888888', label: 'Missing / Extracted' },
        { color: TOOTH_COLORS.notCharted, stroke: '#AAAAAA', label: 'Not Charted' },
      ].map(item => (
        <span key={item.label} className="cl-item">
          <span className="cl-swatch" style={{
            background: item.color,
            border: `1.5px solid ${item.stroke}`,
          }} />
          {item.label}
        </span>
      ))}
    </div>
  );
}

function AppContent() {
  return (
    <div className="app-shell">
      {/* ── Edit-only controls (hidden in PDF) ── */}
      <div className="app-edit-controls">
        <header className="app-header">
          <h1 className="app-title">Veterinary Dental Record</h1>
        </header>
        <PatientInfoForm />
        <Toolbar />
      </div>

      {/* ── Capturable export area ── */}
      <div id="chart-export-root" className="chart-export-root">
        <PatientInfoHeader />
        <ChartFindings />
        <DentalChart />
        <ColorLegendBar />
        <FindingsSummary />
      </div>

      {/* ── Slide-in panel (outside export root, hidden in PDF via body class) ── */}
      <ToothPanel />
    </div>
  );
}

export default function App() {
  return (
    <AuthGate>
      <ChartProvider>
        <AppContent />
      </ChartProvider>
    </AuthGate>
  );
}
