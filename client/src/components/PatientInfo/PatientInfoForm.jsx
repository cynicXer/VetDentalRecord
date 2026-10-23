import { useChart, confirmSpeciesChange } from '../../context/ChartContext.jsx';
import ClientLookup from './ClientLookup.jsx';
import './PatientInfoForm.css';

const REQUIRED_FIELDS = ['petName', 'ownerLastName', 'clinician', 'technician', 'breed', 'age'];

const CLINICIANS  = ['Whitehouse', 'Divis'];
const TECHNICIANS = ['None', 'Aikman', 'Allen', 'Davis', 'Mastropietro'];

export default function PatientInfoForm() {
  const { state, dispatch } = useChart();
  const { patientInfo } = state;
  const { exportAttempted } = state.ui;

  function handleField(field) {
    return e => dispatch({ type: 'SET_PATIENT_FIELD', payload: { field, value: e.target.value } });
  }

  function inputClass(field) {
    const isError = exportAttempted && REQUIRED_FIELDS.includes(field) && !patientInfo[field].trim();
    return `pif-input${isError ? ' pif-input--error' : ''}`;
  }

  function setSpecies(species) {
    if (confirmSpeciesChange(state, species)) {
      dispatch({ type: 'SET_SPECIES', payload: species });
    }
  }

  return (
    <div className="patient-info-form">
      <ClientLookup />
      <div className="patient-info-grid">
        <div className="pif-field">
          <label className="pif-label">Pet Name <span className="pif-required">*</span></label>
          <input
            type="text"
            className={inputClass('petName')}
            value={patientInfo.petName}
            onChange={handleField('petName')}
            placeholder="e.g. Rex"
          />
        </div>

        <div className="pif-field">
          <label className="pif-label">Owner Last Name <span className="pif-required">*</span></label>
          <input
            type="text"
            className={inputClass('ownerLastName')}
            value={patientInfo.ownerLastName}
            onChange={handleField('ownerLastName')}
            placeholder="e.g. Smith"
          />
        </div>

        <div className="pif-field">
          <label className="pif-label">Species</label>
          <div className="species-toggle">
            <button
              type="button"
              className={`species-btn ${patientInfo.species === 'dog' ? 'species-btn--active' : ''}`}
              onClick={() => setSpecies('dog')}
            >
              Dog
            </button>
            <button
              type="button"
              className={`species-btn ${patientInfo.species === 'cat' ? 'species-btn--active' : ''}`}
              onClick={() => setSpecies('cat')}
            >
              Cat
            </button>
          </div>
        </div>

        <div className="pif-field">
          <label className="pif-label">Breed <span className="pif-required">*</span></label>
          <input
            type="text"
            className={inputClass('breed')}
            value={patientInfo.breed}
            onChange={handleField('breed')}
            placeholder="e.g. Labrador Mix"
          />
        </div>

        <div className="pif-field">
          <label className="pif-label">Age <span className="pif-required">*</span></label>
          <input
            type="text"
            className={inputClass('age')}
            value={patientInfo.age}
            onChange={handleField('age')}
            placeholder="e.g. 4 years"
          />
        </div>

        <div className="pif-field">
          <label className="pif-label">Date</label>
          <input
            type="date"
            className="pif-input"
            value={patientInfo.date}
            onChange={handleField('date')}
          />
        </div>

        <div className="pif-field">
          <label className="pif-label">Clinician <span className="pif-required">*</span></label>
          <select
            className={inputClass('clinician')}
            value={patientInfo.clinician}
            onChange={handleField('clinician')}
          >
            <option value="">— select —</option>
            {CLINICIANS.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        <div className="pif-field">
          <label className="pif-label">Technician <span className="pif-required">*</span></label>
          <select
            className={inputClass('technician')}
            value={patientInfo.technician}
            onChange={handleField('technician')}
          >
            <option value="">— select —</option>
            {TECHNICIANS.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
      </div>
    </div>
  );
}
