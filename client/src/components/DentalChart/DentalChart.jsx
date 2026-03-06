import { useChart } from '../../context/ChartContext.jsx';
import { TEETH_BY_SPECIES } from '../../constants/teethData.js';
import DentalArch, { archWidth } from './DentalArch.jsx';
import './DentalChart.css';

// Fixed vertical dimensions
const SVG_H          = 500;
const UPPER_BASELINE = 195;  // gumline for upper jaw
const LOWER_BASELINE = 270;  // gumline for lower jaw
const LABEL_OFFSET   = 18;   // px above/below gumline for quadrant labels
const MARGIN_X       = 40;   // horizontal margin from SVG edge (room for jaw labels + patient labels)

export default function DentalChart() {
  const { state } = useChart();
  const species = state.patientInfo.species;
  const quads = TEETH_BY_SPECIES[species];

  // Arch widths
  const urWidth = archWidth(quads.upperRight);
  const ulWidth = archWidth(quads.upperLeft);
  const lrWidth = archWidth(quads.lowerRight);
  const llWidth = archWidth(quads.lowerLeft);

  const rightHalfGap = 10;
  const leftHalfGap  = 10;

  // Use the wider of upper/lower per side so both rows align to the midline
  const maxRightWidth = Math.max(urWidth, lrWidth);
  const maxLeftWidth  = Math.max(ulWidth, llWidth);

  // SVG width sized exactly to content — no wasted whitespace
  const SVG_W    = 2 * MARGIN_X + maxRightWidth + rightHalfGap + leftHalfGap + maxLeftWidth;
  const MIDLINE_X = MARGIN_X + maxRightWidth + rightHalfGap;

  // Arch start positions
  const urStartX = MIDLINE_X - urWidth - rightHalfGap;
  const lrStartX = MIDLINE_X - lrWidth - rightHalfGap;
  const ulStartX = MIDLINE_X + leftHalfGap;
  const llStartX = MIDLINE_X + leftHalfGap;

  return (
    <div className="dental-chart-container">
      <svg
        viewBox={`0 0 ${SVG_W} ${SVG_H}`}
        width="100%"
        preserveAspectRatio="xMidYMid meet"
        className="dental-chart-svg"
        aria-label="Veterinary Dental Chart"
      >
        {/* Background */}
        <rect width={SVG_W} height={SVG_H} fill="#F8F9FA" rx={8} />

        {/* Midline divider */}
        <line
          x1={MIDLINE_X} y1={UPPER_BASELINE - 75}
          x2={MIDLINE_X} y2={LOWER_BASELINE + 75}
          stroke="#CCC" strokeWidth={1} strokeDasharray="6 3"
        />

        {/* Horizontal gumline dividers */}
        <line
          x1={MARGIN_X} y1={UPPER_BASELINE}
          x2={SVG_W - MARGIN_X} y2={UPPER_BASELINE}
          stroke="#E0E0E0" strokeWidth={1}
        />
        <line
          x1={MARGIN_X} y1={LOWER_BASELINE}
          x2={SVG_W - MARGIN_X} y2={LOWER_BASELINE}
          stroke="#E0E0E0" strokeWidth={1}
        />

        {/* Jaw separator band */}
        <rect
          x={MARGIN_X} y={UPPER_BASELINE}
          width={SVG_W - 2 * MARGIN_X} height={LOWER_BASELINE - UPPER_BASELINE}
          fill="#ECECEC" opacity={0.5}
        />
        <text x={SVG_W / 2} y={(UPPER_BASELINE + LOWER_BASELINE) / 2 + 5}
          textAnchor="middle" fontSize="11" fill="#999" style={{ userSelect: 'none' }}>
          — occlusal —
        </text>

        {/* Quadrant labels */}
        <text x={urStartX + urWidth / 2} y={UPPER_BASELINE - LABEL_OFFSET - 55}
          textAnchor="middle" fontSize="13" fill="#555" fontWeight="700"
          style={{ userSelect: 'none' }}>
          Upper Right (100s)
        </text>
        <text x={ulStartX + ulWidth / 2} y={UPPER_BASELINE - LABEL_OFFSET - 55}
          textAnchor="middle" fontSize="13" fill="#555" fontWeight="700"
          style={{ userSelect: 'none' }}>
          Upper Left (200s)
        </text>
        <text x={lrStartX + lrWidth / 2} y={LOWER_BASELINE + LABEL_OFFSET + 65}
          textAnchor="middle" fontSize="13" fill="#555" fontWeight="700"
          style={{ userSelect: 'none' }}>
          Lower Right (400s)
        </text>
        <text x={llStartX + llWidth / 2} y={LOWER_BASELINE + LABEL_OFFSET + 65}
          textAnchor="middle" fontSize="13" fill="#555" fontWeight="700"
          style={{ userSelect: 'none' }}>
          Lower Left (300s)
        </text>

        {/* Maxillary / Mandibular jaw labels (rotated, left edge) */}
        <text
          transform={`rotate(-90, 14, ${(UPPER_BASELINE - 75 + UPPER_BASELINE) / 2})`}
          x={14} y={(UPPER_BASELINE - 75 + UPPER_BASELINE) / 2}
          textAnchor="middle" fontSize="11" fontWeight="700"
          fill="#5B7FA6" letterSpacing="1.5"
          style={{ userSelect: 'none', fontFamily: 'sans-serif' }}
        >
          MAXILLARY
        </text>
        <text
          transform={`rotate(-90, 14, ${(LOWER_BASELINE + LOWER_BASELINE + 75) / 2})`}
          x={14} y={(LOWER_BASELINE + LOWER_BASELINE + 75) / 2}
          textAnchor="middle" fontSize="11" fontWeight="700"
          fill="#5B7FA6" letterSpacing="1.5"
          style={{ userSelect: 'none', fontFamily: 'sans-serif' }}
        >
          MANDIBULAR
        </text>

        {/* Patient orientation labels */}
        <text x={MARGIN_X} y={SVG_H - 10}
          fontSize="10" fill="#AAA" style={{ userSelect: 'none' }}>
          Patient's Right →
        </text>
        <text x={SVG_W - MARGIN_X} y={SVG_H - 10}
          textAnchor="end" fontSize="10" fill="#AAA" style={{ userSelect: 'none' }}>
          ← Patient's Left
        </text>

        {/* ── Upper arches ── */}
        <DentalArch
          teeth={quads.upperRight}
          startX={urStartX}
          baselineY={UPPER_BASELINE}
          isUpper={true}
          rtl={false}
        />
        <DentalArch
          teeth={quads.upperLeft}
          startX={ulStartX}
          baselineY={UPPER_BASELINE}
          isUpper={true}
          rtl={true}
        />

        {/* ── Lower arches ── */}
        <DentalArch
          teeth={quads.lowerRight}
          startX={lrStartX}
          baselineY={LOWER_BASELINE}
          isUpper={false}
          rtl={false}
        />
        <DentalArch
          teeth={quads.lowerLeft}
          startX={llStartX}
          baselineY={LOWER_BASELINE}
          isUpper={false}
          rtl={true}
        />

        {/* Species badge */}
        <text x={SVG_W / 2} y={SVG_H - 10}
          textAnchor="middle" fontSize="11" fill="#888"
          style={{ userSelect: 'none', textTransform: 'capitalize' }}>
          {species === 'dog' ? 'Canine — 42 teeth (10 upper + 11 lower per side)' : 'Feline — 30 teeth (8 upper + 7 lower per side)'}
        </text>
      </svg>
    </div>
  );
}
