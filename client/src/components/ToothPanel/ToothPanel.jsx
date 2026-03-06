import { useState, useEffect } from 'react';
import { useChart } from '../../context/ChartContext.jsx';
import { getToothById } from '../../constants/teethData.js';
import { DEFAULT_FINDINGS } from '../../constants/findings.js';
import StatusSelector from './StatusSelector.jsx';
import FindingsChecklist from './FindingsChecklist.jsx';
import PocketDepths from './PocketDepths.jsx';
import NotesField from './NotesField.jsx';
import './ToothPanel.css';

function defaultPocketDepths() {
  return { mesial: null, distal: null, buccal: null, palatalLingual: null };
}

export default function ToothPanel() {
  const { state, dispatch } = useChart();
  const { selectedTooth, isPanelOpen } = state.ui;

  const toothData = selectedTooth ? state.toothData[selectedTooth] : null;
  const toothInfo = selectedTooth
    ? getToothById(state.patientInfo.species, selectedTooth)
    : null;

  // Local editing state (committed to global on Save)
  const [localStatus, setLocalStatus] = useState('present');
  const [localFindings, setLocalFindings] = useState({ ...DEFAULT_FINDINGS });
  const [localPocket, setLocalPocket]   = useState(defaultPocketDepths());
  const [localNotes, setLocalNotes]     = useState('');

  // Sync local state when a new tooth is selected
  useEffect(() => {
    if (toothData) {
      setLocalStatus(toothData.status);
      setLocalFindings({ ...DEFAULT_FINDINGS, ...toothData.findings });
      setLocalPocket({ ...defaultPocketDepths(), ...toothData.pocketDepths });
      setLocalNotes(toothData.notes ?? '');
    }
  }, [selectedTooth]); // eslint-disable-line react-hooks/exhaustive-deps

  function handleSave() {
    dispatch({
      type: 'UPDATE_TOOTH',
      payload: {
        toothId: selectedTooth,
        data: {
          status:      localStatus,
          findings:    localFindings,
          pocketDepths: localPocket,
          notes:       localNotes,
        },
      },
    });
    dispatch({ type: 'CLOSE_PANEL' });
  }

  function handleClose() {
    dispatch({ type: 'CLOSE_PANEL' });
  }

  if (!isPanelOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div className="panel-backdrop" onClick={handleClose} aria-hidden="true" />

      {/* Slide-in panel */}
      <aside className={`tooth-panel ${isPanelOpen ? 'tooth-panel--open' : ''}`} aria-label="Tooth details">
        <header className="panel-header">
          <div className="panel-title">
            <span className="panel-tooth-id">{selectedTooth}</span>
            {toothInfo && (
              <span className="panel-tooth-name"> — {toothInfo.label}</span>
            )}
          </div>
          <button className="panel-close-btn" onClick={handleClose} aria-label="Close panel">
            ✕
          </button>
        </header>

        <div className="panel-body">
          <StatusSelector value={localStatus} onChange={setLocalStatus} />
          <FindingsChecklist findings={localFindings} onChange={setLocalFindings} />
          <PocketDepths pocketDepths={localPocket} onChange={setLocalPocket} />
          <NotesField notes={localNotes} onChange={setLocalNotes} />
        </div>

        <footer className="panel-footer">
          <button className="btn btn-secondary" onClick={handleClose}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSave}>Save</button>
        </footer>
      </aside>
    </>
  );
}
