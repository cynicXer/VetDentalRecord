import { isSevereFinding, hasAnyFinding } from '../constants/findings.js';
import { TOOTH_TYPES } from '../constants/teethData.js';

// ── Pathology colors (override type colors when findings present) ──────────
export const TOOTH_COLORS = {
  finding:     '#FFD166',
  severe:      '#FF6B6B',
  missing:     '#C0C0C0',
  notCharted:  '#E8E8E8',
};

export const TOOTH_STROKE_COLORS = {
  normal:      '#475569',
  finding:     '#B89000',
  severe:      '#CC0000',
  missing:     '#888888',
  notCharted:  '#AAAAAA',
};

// ── Type-based base colors (shown when tooth is present with no findings) ──
export const TOOTH_TYPE_COLORS = {
  [TOOTH_TYPES.INCISOR]:        { fill: '#DBEAFE', stroke: '#3B82F6' }, // blue
  [TOOTH_TYPES.CANINE]:         { fill: '#EDE9FE', stroke: '#7C3AED' }, // lavender
  [TOOTH_TYPES.PREMOLAR]:       { fill: '#D1FAE5', stroke: '#059669' }, // mint
  [TOOTH_TYPES.PREMOLAR_LARGE]: { fill: '#BBF7D0', stroke: '#047857' }, // deeper mint for carnassial
  [TOOTH_TYPES.MOLAR]:          { fill: '#FEF3C7', stroke: '#D97706' }, // amber
};

/**
 * Returns the fill color for a tooth.
 * Priority: missing/extracted > not_charted > severe > finding > type color
 */
export function getToothColor(toothData, toothType) {
  if (!toothData) return TOOTH_COLORS.notCharted;

  const { status, findings } = toothData;

  if (status === 'missing' || status === 'extracted') return TOOTH_COLORS.missing;
  if (status === 'not_charted') return TOOTH_COLORS.notCharted;

  if (isSevereFinding(findings)) return TOOTH_COLORS.severe;
  if (hasAnyFinding(findings))   return TOOTH_COLORS.finding;

  // Present, no findings — use type color
  return TOOTH_TYPE_COLORS[toothType]?.fill ?? '#FFFFFF';
}

/**
 * Returns the stroke color for a tooth.
 */
export function getToothStroke(toothData, toothType) {
  if (!toothData) return TOOTH_STROKE_COLORS.notCharted;

  const { status, findings } = toothData;

  if (status === 'missing' || status === 'extracted') return TOOTH_STROKE_COLORS.missing;
  if (status === 'not_charted') return TOOTH_STROKE_COLORS.notCharted;
  if (isSevereFinding(findings)) return TOOTH_STROKE_COLORS.severe;
  if (hasAnyFinding(findings))   return TOOTH_STROKE_COLORS.finding;

  return TOOTH_TYPE_COLORS[toothType]?.stroke ?? TOOTH_STROKE_COLORS.normal;
}
