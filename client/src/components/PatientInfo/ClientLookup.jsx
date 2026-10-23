import { useState, useEffect, useRef } from 'react';
import { useChart, confirmSpeciesChange, hasChartData } from '../../context/ChartContext.jsx';
import {
  searchClients,
  toPatientRows,
  speciesFromLabel,
  ageFromBirthdate,
} from '../../utils/daysmart.js';
import './ClientLookup.css';

export default function ClientLookup() {
  const { state, dispatch } = useChart();
  const [query, setQuery] = useState('');
  const [rows, setRows] = useState([]);
  const [status, setStatus] = useState('idle'); // idle | loading | done | error
  const [error, setError] = useState('');
  const [open, setOpen] = useState(false);
  const boxRef = useRef(null);

  // Debounced search whenever the query changes.
  useEffect(() => {
    const q = query.trim();
    if (q.length < 2) {
      setRows([]);
      setStatus('idle');
      return;
    }
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      setStatus('loading');
      setError('');
      try {
        const clients = await searchClients(q, controller.signal);
        setRows(toPatientRows(clients));
        setStatus('done');
        setOpen(true);
      } catch (err) {
        if (err.name === 'AbortError') return;
        setError(err.message);
        setStatus('error');
        setOpen(true);
      }
    }, 300);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [query]);

  // Close the results when clicking outside.
  useEffect(() => {
    function onDocClick(e) {
      if (boxRef.current && !boxRef.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, []);

  function selectRow(row) {
    const { client, patient } = row;
    const current = state.patientInfo;
    const fields = { ownerLastName: client.lastName || '' };
    if (patient) {
      fields.petName = patient.name || '';
      fields.breed = patient.breed || '';
      fields.age = ageFromBirthdate(patient.birthdate);
    } else if (fields.ownerLastName !== current.ownerLastName) {
      // New owner with no pets on file: don't leave the previous pet's details behind.
      Object.assign(fields, { petName: '', breed: '', age: '' });
    }
    const species = (patient && speciesFromLabel(patient.speciesLabel)) || undefined;

    // A different patient is already on the form: loading this one means a new chart.
    const hasPatient = Boolean(current.petName || current.ownerLastName);
    const samePatient = current.ownerLastName === fields.ownerLastName
      && (!patient || current.petName === fields.petName);
    let resetChart = false;

    if (hasPatient && !samePatient && hasChartData(state)) {
      const newName = patient ? `${fields.petName} (${fields.ownerLastName})` : fields.ownerLastName;
      const oldName = current.petName || current.ownerLastName;
      if (!window.confirm(
        `Start a new chart for ${newName}? ` +
        `All findings charted for ${oldName} will be cleared.`
      )) return;
      resetChart = true;
    } else if (species && species !== current.species && !confirmSpeciesChange(state, species)) {
      // Cancelling leaves the form untouched so the chart and patient info stay consistent.
      return;
    }

    dispatch({ type: 'LOAD_PATIENT', payload: { fields, species, resetChart } });

    setQuery('');
    setRows([]);
    setOpen(false);
    setStatus('idle');
  }

  return (
    <div className="client-lookup" ref={boxRef}>
      <label className="pif-label">Look up client (DaySmart)</label>
      <input
        type="text"
        className="pif-input"
        value={query}
        onChange={e => setQuery(e.target.value)}
        onFocus={() => rows.length && setOpen(true)}
        placeholder="Search by owner last name…"
        autoComplete="off"
      />

      {open && (
        <div className="client-lookup__results">
          {status === 'loading' && <div className="client-lookup__msg">Searching…</div>}
          {status === 'error' && <div className="client-lookup__msg client-lookup__msg--error">{error}</div>}
          {status === 'done' && rows.length === 0 && (
            <div className="client-lookup__msg">No matching clients.</div>
          )}
          {rows.map(row => (
            <button
              key={row.key}
              type="button"
              className="client-lookup__row"
              onClick={() => selectRow(row)}
            >
              <span className="client-lookup__owner">
                {row.client.lastName}{row.client.firstName ? `, ${row.client.firstName}` : ''}
              </span>
              {row.patient ? (
                <span className="client-lookup__pet">
                  {row.patient.name}
                  {row.patient.speciesLabel ? ` · ${row.patient.speciesLabel}` : ''}
                  {row.patient.breed ? ` · ${row.patient.breed}` : ''}
                </span>
              ) : (
                <span className="client-lookup__pet client-lookup__pet--empty">no pets on file</span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
