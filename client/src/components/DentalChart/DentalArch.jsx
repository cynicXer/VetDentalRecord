import ToothSVG from './ToothSVG.jsx';
import { TOOTH_TYPES } from '../../constants/teethData.js';
import { TOOTH_SHAPES } from '../../constants/toothShapes.js';
import { useChart } from '../../context/ChartContext.jsx';

// Horizontal spacing between teeth (px)
const GAP = 5;

// Map TOOTH_TYPES enum values to shape keys (mirrors ToothSVG)
const TYPE_TO_SHAPE = {
  [TOOTH_TYPES.INCISOR]:        'incisor',
  [TOOTH_TYPES.CANINE]:         'canine',
  [TOOTH_TYPES.PREMOLAR]:       'premolar',
  [TOOTH_TYPES.PREMOLAR_LARGE]: 'premolar_large',
  [TOOTH_TYPES.MOLAR]:          'molar',
};

function getShape(type) {
  return TOOTH_SHAPES[TYPE_TO_SHAPE[type]] || TOOTH_SHAPES.premolar;
}

/**
 * Renders one quadrant row of teeth.
 *
 * Props:
 *   teeth      — array of tooth definitions [{id, type, label}]
 *   startX     — left edge of the first tooth in this arch
 *   baselineY  — y of the gumline (crowns extend above for upper, below for lower)
 *   isUpper    — true = crowns above baselineY; false = crowns below
 *   rtl        — true = lay out teeth right-to-left (for left half of chart,
 *                 because the medial/incisor side should be toward center)
 */
export default function DentalArch({ teeth, startX, baselineY, isUpper, rtl = false }) {
  const { state } = useChart();
  const selectedTooth = state.ui.selectedTooth;

  // Determine rendering order so medial (incisor) side is always toward center
  const orderedTeeth = rtl ? [...teeth].reverse() : teeth;

  // Compute x positions
  let cursor = startX;
  const positions = orderedTeeth.map(tooth => {
    const { w } = getShape(tooth.type);
    const pos = cursor;
    cursor += w + GAP;
    return { tooth, x: pos };
  });

  return (
    <g className="dental-arch">
      {positions.map(({ tooth, x }) => {
        const { h } = getShape(tooth.type);
        // y: top of crown bounding box
        const crownY = isUpper ? baselineY - h : baselineY;
        return (
          <ToothSVG
            key={tooth.id}
            tooth={tooth}
            x={x}
            y={crownY}
            isUpper={isUpper}
            isSelected={selectedTooth === tooth.id}
          />
        );
      })}
    </g>
  );
}

/**
 * Calculates total pixel width of an arch row.
 */
export function archWidth(teeth) {
  return teeth.reduce((sum, t, i) => {
    const { w } = getShape(t.type);
    return sum + w + (i < teeth.length - 1 ? GAP : 0);
  }, 0);
}
