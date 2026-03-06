import { useChart } from '../../context/ChartContext.jsx';
import { getToothColor, getToothStroke } from '../../utils/toothColors.js';
import { hasAnyFinding } from '../../constants/findings.js';
import { TOOTH_TYPES } from '../../constants/teethData.js';
import { TOOTH_SHAPES, makeRootPath } from '../../constants/toothShapes.js';

// Map TOOTH_TYPES enum values to shape keys
const TYPE_TO_SHAPE = {
  [TOOTH_TYPES.INCISOR]:        'incisor',
  [TOOTH_TYPES.CANINE]:         'canine',
  [TOOTH_TYPES.PREMOLAR]:       'premolar',
  [TOOTH_TYPES.PREMOLAR_LARGE]: 'premolar_large',
  [TOOTH_TYPES.MOLAR]:          'molar',
};

/**
 * Renders a single tooth using anatomical SVG bezier paths.
 *
 * Props:
 *   tooth      — tooth definition {id, type, label}
 *   x, y       — top-left of crown bounding box (y = baselineY - h for upper, baselineY for lower)
 *   isUpper    — true = upper jaw (crown points up), false = lower (crown points down)
 *   isSelected — true if currently selected
 */
export default function ToothSVG({ tooth, x, y, isUpper, isSelected }) {
  const { state, dispatch } = useChart();
  const toothData    = state.toothData[tooth.id];

  const fillColor   = getToothColor(toothData, tooth.type);
  const strokeColor = getToothStroke(toothData, tooth.type);
  const strokeWidth = isSelected ? 2.5 : 1.5;

  const shapeKey = TYPE_TO_SHAPE[tooth.type] || 'premolar';
  const shape    = TOOTH_SHAPES[shapeKey];
  const { w, h, rootH } = shape;
  const rootPath = makeRootPath(w, rootH);

  const hasFindings = toothData && hasAnyFinding(toothData.findings);

  function handleClick() {
    dispatch({ type: 'SELECT_TOOTH', payload: tooth.id });
  }

  // ── Crown transform ──────────────────────────────────────────────────
  // Crown path has occlusal at y=0 and cervical at y=h.
  // Upper: translate to (x, y) — crown naturally points up (small y = top of screen).
  // Lower: translate to (x, y+h) then scale(1,-1) — flips so occlusal points downward.
  const crownTransform = isUpper
    ? `translate(${x}, ${y})`
    : `translate(${x}, ${y + h}) scale(1, -1)`;

  // ── Root transform ───────────────────────────────────────────────────
  // Root path has cervical at y=0, apex at y=rootH.
  // Upper: root starts at gumline (y+h) and extends downward — translate to (x, y+h).
  // Lower: root starts at gumline (y) and extends upward — flip with scale(1,-1).
  const gumlineY = isUpper ? y + h : y;
  const rootTransform = isUpper
    ? `translate(${x}, ${gumlineY})`
    : `translate(${x}, ${gumlineY}) scale(1, -1)`;

  // ── Label & indicator positions ──────────────────────────────────────
  const labelX = x + w / 2;
  const labelY = isUpper ? y + h + 13 : y - 4;

  const dotX = x + w - 4;
  const dotY = isUpper ? y + 4 : y + h - 4;

  return (
    <g
      className="tooth-group"
      onClick={handleClick}
      style={{ cursor: 'pointer' }}
      aria-label={`Tooth ${tooth.id} ${tooth.label}`}
    >
      {/* Selection ring */}
      {isSelected && (
        <rect
          x={x - 4} y={y - 4}
          width={w + 8} height={h + 8}
          rx={5}
          fill="none"
          stroke="#2563EB"
          strokeWidth={2}
          strokeDasharray="4 2"
        />
      )}

      {/* Root — rendered behind crown, subgingival color */}
      <g transform={rootTransform}>
        <path
          d={rootPath}
          fill="#EDE3C8"
          stroke={strokeColor}
          strokeWidth={0.8}
          opacity={0.8}
        />
      </g>

      {/* Cervical divider line (crown/root junction) */}
      <line
        x1={x} y1={gumlineY}
        x2={x + w} y2={gumlineY}
        stroke={strokeColor}
        strokeWidth={0.6}
        opacity={0.4}
      />

      {/* Crown — anatomical bezier path */}
      <g transform={crownTransform}>
        <path
          d={shape.crown}
          fill={fillColor}
          stroke={strokeColor}
          strokeWidth={strokeWidth}
        />
      </g>

      {/* Tooth ID label */}
      <text
        x={labelX} y={labelY}
        textAnchor="middle"
        fontSize="10"
        fontWeight="600"
        fill="#333"
        style={{ userSelect: 'none', fontFamily: 'sans-serif' }}
      >
        {tooth.id}
      </text>

      {/* Findings indicator dot */}
      {hasFindings && (
        <circle cx={dotX} cy={dotY} r={3} fill={strokeColor} opacity={0.9} />
      )}
    </g>
  );
}
