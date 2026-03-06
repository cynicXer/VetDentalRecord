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
