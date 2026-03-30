/**
 * Procedural level descriptors from a **spine string** + turtle geometry (single main path).
 * Default spine: **Compton & Mateas–style** motif concatenation (`comptonRhythm.js`); optional
 * legacy **parallel L-system** via `GameplaySettings.procgen.useComptonRhythmLayer`.
 * After the turtle, a **connectivity audit** may append forward symbols and rebuild (capped).
 * Conceptual L-system reference: e.g. Hansmeyer — https://michael-hansmeyer.com/l-systems.html
 *
 * Pipeline: spine → budgets → preferRamps → level-map splices → turtle → (audit / repair) → …
 *
 * Documentation (under `marble_roll/gen/docs/`):
 * - **PROCEDURAL_L_SYSTEM_LEVELS.md** — normative pipeline and descriptor contract.
 * - **LEVEL_DESIGN_AND_PROCEDURE.md** — design methodology, skills, obstacles, agency (informs tuning).
 * - **THE_LADDER.md** — creative theme; future hazard ideas are evaluated against the level-design doc.
 */
import { expandLSystem } from './lSystemExpand.js';
import {
  GameplaySettings,
  procgenLSystemIterations,
  procgenTurtleStep,
} from '../config/GameplaySettings.js';
import { composeRhythmSpineString } from './comptonRhythm.js';
import { auditStaticPathGaps } from './connectivityAudit.js';
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
  /**
   * Alternating **`+`** / **`-`** chunks so the plan view **weaves** left and right instead of
   * drifting in one direction (spiral). Each variant keeps **`r`** and **`F`** for length and ramps.
   */
  const variants = [
    { F: 'F+FrF-F+Fr' },
    { F: 'Fr-F+F+rF-F' },
    { F: 'F-F+rF+F+Fr' },
    { F: 'FF+rF-F+F' },
    { F: 'F+rF-F+FrF' },
    { F: 'Fr+F-FrF+F' },
    { F: 'F-F+FFr-F+F' },
    { F: 'F+Fr-F+F+rF' },
  ];
  return variants[levelIndex % variants.length];
}

/**
 * @param {number} levelIndex
 * @returns {object} Level descriptor compatible with LevelLoader.build
 */
export function generateProcgenDescriptor(levelIndex) {
  const rules = spineRulesForLevel(levelIndex);
  const iterations = procgenLSystemIterations(levelIndex);
  /** Wider turn angle so left/right segments read clearly in plan view (≈38–58°). */
  const angleDeg = 38 + (levelIndex % 6) * 4;
  const angleRad = (angleDeg * Math.PI) / 180;
  const step = procgenTurtleStep(levelIndex);
  const pg = GameplaySettings.procgen;
  /** Rise per `^`; from `GameplaySettings.procgen.verticalStep` (PROCEDURAL §3.3). */
  const verticalStep = pg.verticalStep;
  /** Splice vertical budget; from `GameplaySettings.procgen.jumpClearance` (§3.7). */
  const jumpClearance = pg.jumpClearance;

  let core = pg.useComptonRhythmLayer
    ? composeRhythmSpineString(levelIndex)
    : expandLSystem('F', rules, iterations, { maxLength: pg.legacyLSystemMaxLength });

  const maxRepair = pg.comptonRhythmRepairMaxPasses;
  let repairPasses = 0;
  /** @type {string} */
  let expanded;
  /** @type {string} */
  let beforeSplices;
  /** @type {ReturnType<typeof turtleBuildPlatforms>} */
  let built;
  let lastAudit = { ok: true, maxGapXZ: 0, failIndex: -1 };

  while (true) {
    let e = core;
    e = ensureTurnBudget(e, levelIndex);
    e = ensureVerticalBudget(e, levelIndex);
    e = preferRampsOverStepJumps(e, levelIndex);
    beforeSplices = e;
    e = applyLevelMapSplices(e, levelIndex, verticalStep, jumpClearance);
    built = turtleBuildPlatforms(e, {
      step,
      angleRad,
      verticalStep,
      platformHalfExtentXZ: pg.platformHalfExtentXZ,
      platformHalfExtentY: pg.platformHalfExtentY,
      zoneRadius: ZONE_RADIUS,
      zoneSurfaceY: ZONE_SURFACE_Y,
    });
    lastAudit = auditStaticPathGaps(built.static, step, pg.connectivityMaxGapFactor);
    if (lastAudit.ok || repairPasses >= maxRepair) {
      expanded = e;
      break;
    }
    core += 'F'.repeat(2 + repairPasses);
    repairPasses++;
  }

  const stepsPerSplice = Math.max(
    2,
    Math.min(8, Math.round(jumpClearance / Math.max(verticalStep, 1e-6))),
  );
  const spliceInsertChars = expanded.length - beforeSplices.length;
  const spliceSiteCount =
    levelIndex > 0 && stepsPerSplice > 0
      ? Math.round(spliceInsertChars / stepsPerSplice)
      : 0;

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

  const displayName = String(levelIndex + 1);

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
      comptonRhythm: pg.useComptonRhythmLayer,
      rhythmRepairPasses: repairPasses,
      connectivityOk: lastAudit.ok,
      maxGapXZ: lastAudit.maxGapXZ,
      connectivityMaxGapFactor: pg.connectivityMaxGapFactor,
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
