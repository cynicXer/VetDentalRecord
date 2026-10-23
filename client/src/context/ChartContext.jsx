import { createContext, useContext, useReducer } from 'react';
import { getAllToothIds } from '../constants/teethData.js';
import { DEFAULT_FINDINGS, DEFAULT_CHART_FINDINGS } from '../constants/findings.js';

function makeDefaultTooth() {
  return {
    status: 'present',
    findings: { ...DEFAULT_FINDINGS },
    pocketDepths: { mesial: null, distal: null, buccal: null, palatalLingual: null },
    notes: '',
  };
}

function buildToothData(species) {
  const ids = getAllToothIds(species);
  return Object.fromEntries(ids.map(id => [id, makeDefaultTooth()]));
}

// True if any tooth differs from its default (i.e. switching species would lose work).
export function hasToothData(toothData) {
  const blank = JSON.stringify(makeDefaultTooth());
  return Object.values(toothData).some(t => JSON.stringify(t) !== blank);
}

// True if anything chart-related has been entered (teeth, chart findings, nerve blocks, notes).
export function hasChartData(state) {
  return hasToothData(state.toothData)
    || JSON.stringify(state.chartFindings) !== JSON.stringify(DEFAULT_CHART_FINDINGS)
    || state.nerveBlocks.infraorbital.length > 0
    || state.nerveBlocks.mandibular.length > 0
    || state.softTissueNotes.trim() !== '';
}

/**
 * Ask before a species change that would wipe charted teeth.
 * Returns true if the caller should go ahead and dispatch SET_SPECIES.
 */
export function confirmSpeciesChange(state, species) {
  if (state.patientInfo.species === species) return false;
  if (!hasToothData(state.toothData)) return true;
  return window.confirm(
    `Switching to ${species === 'cat' ? 'Cat' : 'Dog'} resets the tooth chart. ` +
    'All tooth findings, pocket depths and notes will be lost. Continue?'
  );
}

const initialState = {
  patientInfo: {
    petName:       '',
    ownerLastName: '',
    species:       'dog',
    breed:         '',
    age:           '',
    date:          new Date().toISOString().split('T')[0],
    clinician:     '',
    technician:    '',
  },
  chartFindings:    { ...DEFAULT_CHART_FINDINGS },
  softTissueNotes:  '',
  nerveBlocks:      { infraorbital: [], mandibular: [] },
  toothData:        buildToothData('dog'),
  ui: {
    selectedTooth:   null,
    isPanelOpen:     false,
    exportAttempted: false,
  },
};

function chartReducer(state, action) {
  switch (action.type) {
    case 'SET_SPECIES': {
      const species = action.payload;
      return {
        ...state,
        patientInfo: { ...state.patientInfo, species },
        toothData: buildToothData(species),
        ui: { ...state.ui, selectedTooth: null, isPanelOpen: false },
      };
    }

    case 'SET_PATIENT_FIELD': {
      return {
        ...state,
        patientInfo: { ...state.patientInfo, [action.payload.field]: action.payload.value },
      };
    }

    case 'SET_CHART_FINDING': {
      return {
        ...state,
        chartFindings: { ...state.chartFindings, [action.payload.field]: action.payload.value },
      };
    }

    case 'SET_SOFT_TISSUE_NOTES': {
      return { ...state, softTissueNotes: action.payload };
    }

    case 'SET_NERVE_BLOCK': {
      const { block, value } = action.payload;
      return { ...state, nerveBlocks: { ...state.nerveBlocks, [block]: value } };
    }

    case 'SELECT_TOOTH': {
      return { ...state, ui: { ...state.ui, selectedTooth: action.payload, isPanelOpen: true } };
    }

    case 'CLOSE_PANEL': {
      return { ...state, ui: { ...state.ui, isPanelOpen: false, selectedTooth: null } };
    }

    case 'UPDATE_TOOTH': {
      const { toothId, data } = action.payload;
      return {
        ...state,
        toothData: { ...state.toothData, [toothId]: { ...state.toothData[toothId], ...data } },
      };
    }

    case 'SET_EXPORT_ATTEMPTED': {
      return { ...state, ui: { ...state.ui, exportAttempted: true } };
    }

    case 'LOAD_PATIENT': {
      // payload: { fields: {petName, ...}, species?: 'dog'|'cat', resetChart?: bool }
      const { fields, species, resetChart } = action.payload;
      const nextSpecies = species || state.patientInfo.species;
      const base = resetChart
        ? {
            ...state,
            chartFindings:   { ...DEFAULT_CHART_FINDINGS },
            softTissueNotes: '',
            nerveBlocks:     { infraorbital: [], mandibular: [] },
            toothData:       buildToothData(nextSpecies),
            ui:              { ...state.ui, selectedTooth: null, isPanelOpen: false, exportAttempted: false },
          }
        : state;
      const speciesChanged = nextSpecies !== state.patientInfo.species;
      return {
        ...base,
        patientInfo: { ...state.patientInfo, ...fields, species: nextSpecies },
        ...(speciesChanged && !resetChart && {
          toothData: buildToothData(nextSpecies),
          ui: { ...state.ui, selectedTooth: null, isPanelOpen: false },
        }),
      };
    }

    case 'CLEAR_ALL': {
      return {
        ...initialState,
        patientInfo: {
          ...initialState.patientInfo,
          species: state.patientInfo.species,
          date: new Date().toISOString().split('T')[0],
        },
        chartFindings:   { ...DEFAULT_CHART_FINDINGS },
        softTissueNotes: '',
        nerveBlocks:     { infraorbital: [], mandibular: [] },
        toothData: buildToothData(state.patientInfo.species),
      };
    }

    default:
      return state;
  }
}

const ChartContext = createContext(null);

export function ChartProvider({ children }) {
  const [state, dispatch] = useReducer(chartReducer, initialState);
  return (
    <ChartContext.Provider value={{ state, dispatch }}>
      {children}
    </ChartContext.Provider>
  );
}

export function useChart() {
  const ctx = useContext(ChartContext);
  if (!ctx) throw new Error('useChart must be used within ChartProvider');
  return ctx;
}
