// ─── Chart-level findings (recorded once per visit, not per tooth) ────────────
export const CHART_FINDINGS = [
  {
    key: 'calculus',
    label: 'Calculus',
    type: 'grade',
    grades: [0, 1, 2, 3, 4],
    descriptions: ['None', 'Mild', 'Moderate', 'Heavy', 'Severe'],
    tooltips: [
      'No calculus deposits present',
      'Mild — Thin film or flecks; <25% of surfaces affected',
      'Moderate — Calculus covering 25–50% of surfaces',
      'Heavy — Calculus covering 50–75% of surfaces',
      'Severe — Calculus covering >75% of surfaces; likely extends subgingivally',
    ],
  },
  {
    key: 'gingivitis',
    label: 'Gingivitis',
    type: 'grade',
    grades: [0, 1, 2, 3],
    descriptions: ['None', 'Mild', 'Moderate', 'Severe'],
    tooltips: [
      'No inflammation; gingiva is pink, firm, and stippled',
      'Mild — Slight redness and swelling of the gingival margin',
      'Moderate — Obvious redness and edema; bleeds on probing',
      'Severe — Spontaneous bleeding, ulceration, or necrosis present',
    ],
  },
  {
    key: 'periodDisease',
    label: 'Periodontal Disease',
    type: 'grade',
    grades: [0, 1, 2, 3, 4],
    descriptions: ['None', 'Stage 1', 'Stage 2', 'Stage 3', 'Stage 4'],
    tooltips: [
      'PD0 — No periodontal disease; healthy periodontium',
      'PD1 — Gingivitis only; no attachment loss; fully reversible with treatment',
      'PD2 — Early periodontitis; <25% attachment loss visible on radiograph',
      'PD3 — Moderate periodontitis; 25–50% attachment loss',
      'PD4 — Advanced periodontitis; >50% attachment loss; extraction likely indicated',
    ],
  },
];

// ─── Per-tooth findings ────────────────────────────────────────────────────────
export const TOOTH_FINDINGS = [
  {
    key: 'caries',
    label: 'Caries',
    type: 'surfaces',
    surfaces: [
      { value: 'mesial',         label: 'Mesial',          abbr: 'M'   },
      { value: 'distal',         label: 'Distal',          abbr: 'D'   },
      { value: 'buccal',         label: 'Buccal',          abbr: 'B'   },
      { value: 'palatalLingual', label: 'Lingual / Palatal', abbr: 'L/P' },
      { value: 'occlusal',       label: 'Occlusal',        abbr: 'O'   },
    ],
    defaultValue: [],
  },
  {
    key: 'fracture',
    label: 'Fracture',
    type: 'select',
    options: [
      { value: 'enamel',        label: 'Enamel' },
      { value: 'uncomplicated', label: 'Uncomplicated Crown' },
      { value: 'complicated',   label: 'Complicated Crown' },
      { value: 'crown_root',    label: 'Crown-Root' },
      { value: 'root',          label: 'Root' },
    ],
    defaultValue: null,
  },
  {
    key: 'resorption',
    label: 'Tooth Resorption',
    type: 'select',
    options: [
      { value: 'type1', label: 'Type 1' },
      { value: 'type2', label: 'Type 2' },
      { value: 'type3', label: 'Type 3' },
    ],
    optionTooltips: {
      type1: 'Type 1 — Inflammatory resorption; periodontal ligament radiographically visible; can be painful',
      type2: 'Type 2 — Replacement resorption; PDL replaced by alveolar bone; typically non-painful',
      type3: 'Type 3 — Combined Type 1 and Type 2 resorption present in the same tooth',
    },
    defaultValue: null,
    note: 'Primarily cats',
  },
  {
    key: 'mobility',
    label: 'Mobility',
    type: 'grade',
    grades: [0, 1, 2, 3],
    descriptions: ['None', 'M1', 'M2', 'M3'],
    tooltips: [
      'No detectable mobility',
      'M1 — Slight mobility; <1 mm in any horizontal direction',
      'M2 — Moderate mobility; 1–2 mm horizontal movement',
      'M3 — Severe mobility; >2 mm horizontal or any vertical mobility present',
    ],
  },
  {
    key: 'furcation',
    label: 'Furcation',
    type: 'grade',
    grades: [0, 1, 2, 3],
    descriptions: ['None', 'F1', 'F2', 'F3'],
    tooltips: [
      'No furcation involvement',
      'F1 — Probe enters furcation but less than ⅓ of the tooth width',
      'F2 — Probe enters more than ⅓ of tooth width but does not pass through',
      'F3 — Through-and-through; probe passes completely through the furcation',
    ],
  },
  {
    key: 'endodontic',
    label: 'Endodontic Disease',
    type: 'checkbox',
    defaultValue: false,
  },
  {
    key: 'retainedDeciduous',
    label: 'Retained Deciduous',
    type: 'checkbox',
    defaultValue: false,
  },
  {
    key: 'supernumerary',
    label: 'Supernumerary',
    type: 'checkbox',
    defaultValue: false,
  },
  {
    key: 'rotation',
    label: 'Rotation',
    type: 'checkbox',
    defaultValue: false,
  },
];

// Combined list (for FindingsSummary backwards-compat)
export const FINDINGS = [...CHART_FINDINGS, ...TOOTH_FINDINGS];

// Default values for per-tooth findings only
export const DEFAULT_FINDINGS = Object.fromEntries(
  TOOTH_FINDINGS.map(f => {
    if (f.type === 'grade')    return [f.key, 0];
    if (f.type === 'select')   return [f.key, f.defaultValue ?? null];
    if (f.type === 'checkbox') return [f.key, f.defaultValue ?? false];
    if (f.type === 'surfaces') return [f.key, []];
    return [f.key, null];
  })
);

// Default values for chart-level findings
export const DEFAULT_CHART_FINDINGS = Object.fromEntries(
  CHART_FINDINGS.map(f => {
    if (f.type === 'grade') return [f.key, f.defaultValue !== undefined ? f.defaultValue : 0];
    return [f.key, f.defaultValue ?? null];
  })
);

// Tooth color logic — based on per-tooth findings only
export function isSevereFinding(findings) {
  if (!findings) return false;
  return (
    findings.fracture === 'complicated' ||
    findings.fracture === 'crown_root' ||
    findings.resorption !== null ||
    findings.endodontic === true
  );
}

export function hasAnyFinding(findings) {
  if (!findings) return false;
  return (
    (findings.caries?.length > 0) ||
    findings.fracture !== null ||
    findings.resorption !== null ||
    findings.mobility > 0 ||
    findings.furcation > 0 ||
    findings.endodontic === true ||
    findings.retainedDeciduous === true ||
    findings.supernumerary === true ||
    findings.rotation === true
  );
}
