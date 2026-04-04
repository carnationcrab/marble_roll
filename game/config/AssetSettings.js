/**
 * Single place for runtime asset URLs (resolved from `marble_roll/assets/`).
 * Import only from loaders / bootstrap — not from the HTML entry module.
 */

const ASSETS_ROOT = new URL('../../assets/', import.meta.url);

/**
 * @param {string} path Relative to `assets/` (e.g. `road/Road1_B.png`).
 * @returns {string} Absolute URL for fetch/TextureLoader/FBXLoader.
 */
export function assetUrl(path) {
  const p = path.startsWith('/') ? path.slice(1) : path;
  return new URL(p, ASSETS_ROOT).href;
}

/** Resolved paths used by the game. Add entries here as features need them. */
export const AssetSettings = {
  road: {
    straightDiffuse: assetUrl('road/Road1_B.png'),
    plazaDiffuse: assetUrl('road/Road6_B.png'),
  },
  /** Future player mesh (FBX/GLTF); not loaded while the player uses the marble sphere. */
  player: {
    hovercraftFbx: assetUrl('hovercraft/Car1.fbx'),
  },
};
