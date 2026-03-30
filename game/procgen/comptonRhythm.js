/**
 * Compton & Mateas-style rhythm layer: concatenate authored **motifs** (short turtle symbol runs)
 * instead of growing a single axiom by parallel L-system rewriting.
 *
 * See `gen/docs/PROCGEN_COMPTON_MATEAS.md`.
 */
import { procgenLSystemIterations } from '../config/GameplaySettings.js';

/**
 * Terminal turtle symbols only — each motif is a repeatable “beat” (repetition + rhythm).
 * Derived from the former spine rule fragments; concatenation order is planned in {@link composeRhythmSpineString}.
 */
export const MOTIF_LIBRARY = [
  'F+FrF-F+Fr',
  'Fr-F+F+rF-F',
  'F-F+rF+F+Fr',
  'FF+rF-F+F',
  'F+rF-F+FrF',
  'Fr+F-FrF+F',
  'F-F+FFr-F+F',
  'F+Fr-F+F+rF',
];

/**
 * Deterministic “measures”: each measure appends two motifs; count scales with L-system iteration bands
 * so course length stays comparable to the legacy pipeline for the same `levelIndex`.
 *
 * @param {number} levelIndex
 * @returns {string} Turtle symbol string (no L-system expansion).
 */
export function composeRhythmSpineString(levelIndex) {
  const iterations = procgenLSystemIterations(levelIndex);
  const measures = Math.max(1, iterations + 2);
  let out = '';
  for (let m = 0; m < measures; m++) {
    const h = (levelIndex * 1315423911 + m * 1103515245) >>> 0;
    const h2 = (h ^ 0xdeadbeef) >>> 0;
    out += MOTIF_LIBRARY[h % MOTIF_LIBRARY.length];
    out += MOTIF_LIBRARY[h2 % MOTIF_LIBRARY.length];
  }
  return out;
}
