/**
 * Procedural level descriptors from L-system expansion + turtle geometry (single main spine).
 * Conceptual reference: generative / L-system architecture (e.g. Hansmeyer-style systems —
 * https://michael-hansmeyer.com/l-systems.html ).
 *
 * Pipeline: expand (non-branching spine) → budgets → preferRamps → level-map splices → turtle → …
 * (see gen/docs/PROCEDURAL_L_SYSTEM_LEVELS.md).
 */
import { expandLSystem } from './lSystemExpand.js';
import {
  applyLevelMapSplices,
  countTurnSymbols,
  countVerticalMotionSymbols,
  ensureTurnBudget,
  ensureVerticalBudget,
  minTurnCountForLevel,
  minVerticalSymbolCountForLevel,
  preferRampsOverStepJumps,
} from './lSystemPostExpand.js';
import { turtleBuildPlatforms } from './lSystemTurtlePlatforms.js';
import {
  applySegmentStyles,
  applyTrackOffset,
  computeKillPlaneY,
  computeTrackBaseY,
  placeObstacles,
  widenPlatforms,
} from './postProcessProcgen.js';

/** Marble radius matches PhysicsSystem default; pad is slightly wider than marble. */
const ZONE_RADIUS = 0.62;
const ZONE_SURFACE_Y = 0.04;

/**
 * Non-branching rule variants: one continuous **main forward path** (no `[` / `]`), winding like a
 * marble course via **`r`**, **`F`**, **`+`/`-`**, and optional **`^`** in the replacement.
 * @param {number} levelIndex
 * @returns {Record<string, string>}
 */
function spineRulesForLevel(levelIndex) {
  const variants = [
    { F: 'FrFF+F' },
    { F: 'FFrF-F' },
    { F: 'F+F+rFF' },
    { F: 'FrF+F-F' },
    { F: 'FF+rFF' },
    { F: 'Fr+F-FF' },
    { F: 'F+rFrF' },
    { F: 'FFr+F-F' },
  ];
  return variants[levelIndex % variants.length];
}

/**
 * @param {number} levelIndex
 * @param {string[]} [levelNames]
 * @returns {object} Level descriptor compatible with LevelLoader.build
 */
export function generateProcgenDescriptor(levelIndex, levelNames = []) {
  const rules = spineRulesForLevel(levelIndex);
  const iterations = Math.min(2 + Math.min(levelIndex, 3), 4);
  /** Sharper corners (≈32–53°) so routes read more like winding platforms than gentle curves. */
  const angleDeg = 32 + (levelIndex % 7) * 3;
  const angleRad = (angleDeg * Math.PI) / 180;
  const step = 2.1 + levelIndex * 0.08;
  /** Rise per `^`; kept below typical jump height for mass≈2, impulse≈6.5. */
  const verticalStep = 0.38;
  /** Target vertical offset per splice gap (~one jump clearance vs `verticalStep` symbols). */
  const jumpClearance = 0.92;

  let expanded = expandLSystem('F', rules, iterations, { maxLength: 120_000 });
  expanded = ensureTurnBudget(expanded, levelIndex);
  expanded = ensureVerticalBudget(expanded, levelIndex);
  expanded = preferRampsOverStepJumps(expanded, levelIndex);
  const beforeSplices = expanded;
  expanded = applyLevelMapSplices(expanded, levelIndex, verticalStep, jumpClearance);

  const stepsPerSplice = Math.max(
    2,
    Math.min(8, Math.round(jumpClearance / Math.max(verticalStep, 1e-6))),
  );
  const spliceInsertChars = expanded.length - beforeSplices.length;
  const spliceSiteCount =
    levelIndex > 0 && stepsPerSplice > 0
      ? Math.round(spliceInsertChars / stepsPerSplice)
      : 0;

  const built = turtleBuildPlatforms(expanded, {
    step,
    angleRad,
    verticalStep,
    platformHalfExtentXZ: 1.05,
    platformHalfExtentY: 0.22,
    zoneRadius: ZONE_RADIUS,
    zoneSurfaceY: ZONE_SURFACE_Y,
  });

  let staticEntries = widenPlatforms(built.static, levelIndex);
  staticEntries = applySegmentStyles(staticEntries, levelIndex);
  const obstacleResult = placeObstacles(staticEntries, levelIndex, beforeSplices.length);
  staticEntries = obstacleResult.static;

  const trackBaseY = computeTrackBaseY(levelIndex);
  const marbleLift = 0.55;
  const offset = applyTrackOffset(
    staticEntries,
    built.startZone,
    built.endZone,
    [0, marbleLift, 0],
    trackBaseY,
  );

  const killPlaneY = computeKillPlaneY(offset.static);

  const displayName = levelNames[levelIndex] ?? `Rung ${levelIndex + 1}`;

  return {
    id: `procgen_${levelIndex}`,
    displayName,
    spawn: offset.spawn,
    static: offset.static,
    zones: offset.zones,
    killPlaneY,
    trackBaseY,
    procgenMeta: {
      iterations,
      angleDeg,
      step,
      verticalStep,
      jumpClearance,
      mainPathSpine: true,
      expandedLength: expanded.length,
      expandedLengthBeforeSplices: beforeSplices.length,
      spliceSiteCount,
      spliceVerticalStepsPerSite: levelIndex > 0 ? stepsPerSplice : 0,
      turnSymbolCount: countTurnSymbols(expanded),
      minTurnCount: minTurnCountForLevel(levelIndex),
      verticalSymbolCount: countVerticalMotionSymbols(expanded),
      minVerticalSymbolCount: minVerticalSymbolCountForLevel(levelIndex),
      obstacleSeeds: {
        latticeIndex: obstacleResult.meta.latticeIndex,
        gapIndex: obstacleResult.meta.gapIndex,
        obstacleCount: obstacleResult.meta.obstacleCount,
      },
    },
  };
}
