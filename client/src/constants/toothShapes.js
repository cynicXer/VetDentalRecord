/**
 * Anatomical tooth crown paths traced from a veterinary dental chart reference image.
 *
 * Coordinate system for crown paths:
 *   y = 0  → occlusal surface (cusp tips / incisal edge)
 *   y = h  → cervical line (gumline)
 *   x = 0  → mesial edge of bounding box
 *   x = w  → distal edge of bounding box
 *
 * For upper teeth: path rendered as-is (crown points upward on screen).
 * For lower teeth: path group flipped with scale(1,-1) so crown points downward.
 *
 * Root paths:
 *   y = 0     → cervical line
 *   y = rootH → root apex
 */

export const TOOTH_SHAPES = {

  // ── Incisor (I1–I3) ───────────────────────────────────────────────────────
  // Small paddle/leaf shape. Single cusp with slightly rounded incisal edge,
  // gentle mesial/distal convexity, mild cervical constriction.
  incisor: {
    w: 16, h: 26, rootH: 22,
    crown:
      'M 2,26 ' +
      'C 0,20 0,13 1,7 ' +
      'C 3,1 6,0 8,0 ' +
      'C 10,0 13,1 15,7 ' +
      'C 16,13 16,20 14,26 Z',
  },

  // ── Canine (C) ────────────────────────────────────────────────────────────
  // Long conical fang. Wide at the cervical third, tapers strongly to a sharp
  // apex. Mesial surface nearly straight; distal surface more convex (bulge at
  // middle third).
  canine: {
    w: 22, h: 52, rootH: 50,
    crown:
      'M 4,52 ' +
      'C 2,40 1,27 2,15 ' +      // mesial: slight inward curve
      'L 5,6 L 11,0 ' +           // mesial ridge → apex
      'L 17,6 ' +                  // distal ridge from apex
      'C 20,14 21,28 20,40 ' +   // distal: more convex, bulges outward mid-crown
      'L 18,52 Z',
  },

  // ── Premolar (P1–P3) ──────────────────────────────────────────────────────
  // Blade-like two-cusp profile. Taller mesial cusp (protoconid/paracone) and
  // shorter distal cusp with a distinct saddle between them. Buccal surface
  // has a prominent central ridge.
  premolar: {
    w: 26, h: 33, rootH: 28,
    crown:
      'M 3,33 ' +
      'C 1,26 0,18 1,12 ' +      // mesial side
      'L 3,6 L 7,1 L 10,0 ' +   // mesial cusp (taller)
      'L 13,6 ' +                  // saddle between cusps
      'L 17,2 L 21,7 ' +          // distal cusp (shorter)
      'L 23,12 ' +
      'C 24,18 24,26 23,33 Z',   // distal side
  },

  // ── P4 Carnassial ─────────────────────────────────────────────────────────
  // The most distinctive dog tooth. Wide blade with THREE cusps:
  //   • Small mesial cusp  (~20% from mesial)
  //   • Tall paracone      (~45% from mesial) — the tallest point
  //   • Medium metastyle   (~75% from mesial)
  // Overall crown is broad and low relative to its width.
  premolar_large: {
    w: 38, h: 40, rootH: 34,
    crown:
      'M 3,40 ' +
      'C 1,32 0,22 1,16 ' +      // mesial wall
      'L 5,9 L 8,4 ' +            // mesial cusp (small)
      'L 11,9 ' +                  // valley between mesial and paracone
      'L 17,0 ' +                  // paracone (tallest cusp)
      'L 23,8 ' +                  // valley between paracone and metastyle
      'L 28,3 ' +                  // metastyle (medium cusp)
      'L 32,10 L 35,16 ' +
      'C 37,22 37,32 35,40 Z',   // distal wall
  },

  // ── Molar (M1–M3) ─────────────────────────────────────────────────────────
  // Wide, low crown with three rounded buccal cusps. Mesiodistally broader
  // than it is tall. Cusp tips are more rounded than premolars.
  molar: {
    w: 32, h: 26, rootH: 22,
    crown:
      'M 3,26 ' +
      'C 1,20 0,13 1,8 ' +        // mesial wall
      'L 4,3 L 8,0 ' +             // mesial cusp
      'L 11,5 ' +
      'L 15,1 ' +                   // middle cusp
      'L 19,5 ' +
      'L 22,0 ' +                   // distal cusp
      'L 26,5 L 28,9 ' +
      'C 30,14 30,20 29,26 Z',    // distal wall
  },

};

/**
 * Generates a tapered root path.
 * y = 0 at cervical line, y = rootH at apex.
 * The root narrows from ~44% of crown width at the cervical to a rounded tip.
 */
export function makeRootPath(w, rootH) {
  const m  = Math.round(w * 0.28);
  const d  = Math.round(w * 0.72);
  const cx = Math.round(w / 2);
  const c1 = Math.round(rootH * 0.38);
  const c2 = Math.round(rootH * 0.76);
  return (
    `M ${m},0 ` +
    `C ${Math.round(m * 0.6)},${c1} ${Math.round(cx * 0.52)},${c2} ${cx},${rootH} ` +
    `C ${Math.round(cx + (w - cx) * 0.48)},${c2} ` +
    `${Math.round(d + (w - d) * 0.4)},${c1} ${d},0 Z`
  );
}
