// Modified Triadan Numbering System
// Dogs: 42 teeth, Cats: 30 teeth
// Quadrants: 100=upper-right, 200=upper-left, 300=lower-left, 400=lower-right
// Conventional orientation: patient's right on viewer's left

// Tooth types for shape rendering
export const TOOTH_TYPES = {
  INCISOR: 'incisor',       // I1-I3 (01-03)
  CANINE: 'canine',         // C (04)
  PREMOLAR: 'premolar',     // P1-P4 (05-08)
  PREMOLAR_LARGE: 'premolar_large', // P4 (08) — carnassial
  MOLAR: 'molar',           // M1-M3 (09-11)
};

// Individual tooth definitions per quadrant-relative position
// position: 1-based offset within the quadrant row (1=most medial/incisor side)
// type: for SVG shape selection
// label: display label override (null = use Triadan number)

// Dogs: upper jaw has M1+M2 only (no M3) → 10 teeth per upper quadrant
function makeDogUpperTeeth(quadrantBase) {
  return [
    { id: `${quadrantBase}01`, type: TOOTH_TYPES.INCISOR,         label: 'I1' },
    { id: `${quadrantBase}02`, type: TOOTH_TYPES.INCISOR,         label: 'I2' },
    { id: `${quadrantBase}03`, type: TOOTH_TYPES.INCISOR,         label: 'I3' },
    { id: `${quadrantBase}04`, type: TOOTH_TYPES.CANINE,          label: 'C' },
    { id: `${quadrantBase}05`, type: TOOTH_TYPES.PREMOLAR,        label: 'P1' },
    { id: `${quadrantBase}06`, type: TOOTH_TYPES.PREMOLAR,        label: 'P2' },
    { id: `${quadrantBase}07`, type: TOOTH_TYPES.PREMOLAR,        label: 'P3' },
    { id: `${quadrantBase}08`, type: TOOTH_TYPES.PREMOLAR_LARGE,  label: 'P4' },
    { id: `${quadrantBase}09`, type: TOOTH_TYPES.MOLAR,           label: 'M1' },
    { id: `${quadrantBase}10`, type: TOOTH_TYPES.MOLAR,           label: 'M2' },
    // No M3 in upper jaw — dogs have 2 upper molars per side
  ];
}

// Dogs: lower jaw has M1+M2+M3 → 11 teeth per lower quadrant
function makeDogLowerTeeth(quadrantBase) {
  return [
    { id: `${quadrantBase}01`, type: TOOTH_TYPES.INCISOR,         label: 'I1' },
    { id: `${quadrantBase}02`, type: TOOTH_TYPES.INCISOR,         label: 'I2' },
    { id: `${quadrantBase}03`, type: TOOTH_TYPES.INCISOR,         label: 'I3' },
    { id: `${quadrantBase}04`, type: TOOTH_TYPES.CANINE,          label: 'C' },
    { id: `${quadrantBase}05`, type: TOOTH_TYPES.PREMOLAR,        label: 'P1' },
    { id: `${quadrantBase}06`, type: TOOTH_TYPES.PREMOLAR,        label: 'P2' },
    { id: `${quadrantBase}07`, type: TOOTH_TYPES.PREMOLAR,        label: 'P3' },
    { id: `${quadrantBase}08`, type: TOOTH_TYPES.PREMOLAR_LARGE,  label: 'P4' },
    { id: `${quadrantBase}09`, type: TOOTH_TYPES.MOLAR,           label: 'M1' },
    { id: `${quadrantBase}10`, type: TOOTH_TYPES.MOLAR,           label: 'M2' },
    { id: `${quadrantBase}11`, type: TOOTH_TYPES.MOLAR,           label: 'M3' },
  ];
}

// Cats: upper quadrant missing P1 (05); lower quadrant missing P1+P2 (05,06)
function makeCatUpperTeeth(quadrantBase) {
  return [
    { id: `${quadrantBase}01`, type: TOOTH_TYPES.INCISOR,         label: 'I1' },
    { id: `${quadrantBase}02`, type: TOOTH_TYPES.INCISOR,         label: 'I2' },
    { id: `${quadrantBase}03`, type: TOOTH_TYPES.INCISOR,         label: 'I3' },
    { id: `${quadrantBase}04`, type: TOOTH_TYPES.CANINE,          label: 'C' },
    // 05 absent in cats
    { id: `${quadrantBase}06`, type: TOOTH_TYPES.PREMOLAR,        label: 'P2' },
    { id: `${quadrantBase}07`, type: TOOTH_TYPES.PREMOLAR,        label: 'P3' },
    { id: `${quadrantBase}08`, type: TOOTH_TYPES.PREMOLAR_LARGE,  label: 'P4' },
    { id: `${quadrantBase}09`, type: TOOTH_TYPES.MOLAR,           label: 'M1' },
    // M2, M3 absent in cats
  ];
}

function makeCatLowerTeeth(quadrantBase) {
  return [
    { id: `${quadrantBase}01`, type: TOOTH_TYPES.INCISOR,         label: 'I1' },
    { id: `${quadrantBase}02`, type: TOOTH_TYPES.INCISOR,         label: 'I2' },
    { id: `${quadrantBase}03`, type: TOOTH_TYPES.INCISOR,         label: 'I3' },
    { id: `${quadrantBase}04`, type: TOOTH_TYPES.CANINE,          label: 'C' },
    // 05, 06 absent in cats
    { id: `${quadrantBase}07`, type: TOOTH_TYPES.PREMOLAR,        label: 'P3' },
    { id: `${quadrantBase}08`, type: TOOTH_TYPES.PREMOLAR_LARGE,  label: 'P4' },
    { id: `${quadrantBase}09`, type: TOOTH_TYPES.MOLAR,           label: 'M1' },
    // M2, M3 absent in cats
  ];
}

export const TEETH_BY_SPECIES = {
  dog: {
    // Upper: 10 teeth per quadrant (no M3) → 20 upper total
    // Lower: 11 teeth per quadrant (M1-M3) → 22 lower total = 42 total
    upperRight: makeDogUpperTeeth(1),  // 101-110
    upperLeft:  makeDogUpperTeeth(2),  // 201-210
    lowerLeft:  makeDogLowerTeeth(3),  // 301-311
    lowerRight: makeDogLowerTeeth(4),  // 401-411
  },
  cat: {
    upperRight: makeCatUpperTeeth(1),  // 101-109
    upperLeft:  makeCatUpperTeeth(2),  // 201-209
    lowerLeft:  makeCatLowerTeeth(3),  // 301-309
    lowerRight: makeCatLowerTeeth(4),  // 401-409
  },
};

// Get all tooth IDs for a given species
export function getAllToothIds(species) {
  const quads = TEETH_BY_SPECIES[species];
  return [
    ...quads.upperRight,
    ...quads.upperLeft,
    ...quads.lowerLeft,
    ...quads.lowerRight,
  ].map(t => t.id);
}

// Get tooth info by ID (searches all species)
export function getToothById(species, id) {
  const quads = TEETH_BY_SPECIES[species];
  for (const teeth of Object.values(quads)) {
    const found = teeth.find(t => t.id === id);
    if (found) return found;
  }
  return null;
}
