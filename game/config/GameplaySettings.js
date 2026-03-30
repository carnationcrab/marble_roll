/**
 * Gameplay tuning: procedural geometry curves, difficulty-adjacent constants, and future
 * run-wide options. Import from procgen / systems — not from the HTML entry module.
 */

/**
 * @typedef {object} ProcgenGameplaySettings
 * @property {number} pathPlatformHalfXZFloor Late-level minimum half-extent on X/Z for path tiles (world units). Slightly under the legacy 1.2 norm.
 * @property {number} pathPlatformEarlyBonus Extra half-extent at low level indices; decays toward the floor.
 * @property {number} pathPlatformWidthDecayLevels Level index span over which early width bonus eases off (smoothstep).
 * @property {number} pathHalfXZSpanMin Deterministic per-tile span base (added to level base width).
 * @property {number} pathHalfXZSpanSteps Hash modulus for span steps.
 * @property {number} pathHalfXZSpanStep Width increment per span step.
 * @property {number} pathWideDelta Added to occasional tiles for a wider strip.
 * @property {number} pathWideCap Upper clamp for boosted wide tiles.
 * @property {number} pathWideOverBase Tiles wider than level base + this use `pathWide` material.
 * @property {number} plazaHalfXZ Spawn pad half-extent XZ (world units).
 */

export const GameplaySettings = {
  /** Procedural level path width, presentation thresholds, and related tuning. */
  procgen: {
    pathPlatformHalfXZFloor: 1.08,
    pathPlatformEarlyBonus: 0.3,
    pathPlatformWidthDecayLevels: 26,
    pathHalfXZSpanMin: 0.1,
    pathHalfXZSpanSteps: 6,
    pathHalfXZSpanStep: 0.035,
    pathWideDelta: 0.55,
    pathWideCap: 1.95,
    pathWideOverBase: 0.38,
    plazaHalfXZ: 2.35,
  },
};

/**
 * Level-dependent path half-extent baseline (before per-tile span). Early levels are wider;
 * approaches {@link GameplaySettings.procgen.pathPlatformHalfXZFloor} as level index grows.
 * @param {number} levelIndex
 * @returns {number}
 */
export function procgenPathHalfXZBase(levelIndex) {
  const p = GameplaySettings.procgen;
  const t = Math.min(1, Math.max(0, levelIndex / p.pathPlatformWidthDecayLevels));
  const smooth = t * t * (3 - 2 * t);
  return p.pathPlatformHalfXZFloor + p.pathPlatformEarlyBonus * (1 - smooth);
}

/**
 * Minimum horizontal half-extent for path geometry on this rung (clamp for widen / ramps).
 * @param {number} levelIndex
 * @returns {number}
 */
export function procgenMinPlatformHalfXZ(levelIndex) {
  return procgenPathHalfXZBase(levelIndex);
}
