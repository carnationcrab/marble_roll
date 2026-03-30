import * as THREE from 'three';

/**
 * Loads diffuse maps from `assets/road/` (shipped set: `Road1_B.png`, `Road6_B.png`).
 * Straight segments use Road1_B; the spawn plaza tile uses Road6_B.
 *
 * @returns {Promise<{ straight: THREE.Texture, plaza: THREE.Texture }>}
 */
export function loadRoadTextures() {
  const loader = new THREE.TextureLoader();
  const base = new URL('../../assets/road/', import.meta.url);

  const loadOne = (filename) =>
    new Promise((resolve, reject) => {
      loader.load(
        new URL(filename, base).href,
        (tex) => {
          tex.colorSpace = THREE.SRGBColorSpace;
          tex.wrapS = THREE.RepeatWrapping;
          tex.wrapT = THREE.RepeatWrapping;
          tex.anisotropy = 8;
          resolve(tex);
        },
        undefined,
        reject,
      );
    });

  return Promise.all([loadOne('Road1_B.png'), loadOne('Road6_B.png')]).then(([straight, plaza]) => ({
    straight,
    plaza,
  }));
}
