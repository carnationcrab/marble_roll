import * as THREE from 'three';
import { AssetSettings } from '../config/AssetSettings.js';

/**
 * Loads diffuse maps for road presentation (PROCEDURAL §5.8).
 * Paths come from {@link AssetSettings.road}.
 *
 * @returns {Promise<{ straight: THREE.Texture, plaza: THREE.Texture }>}
 */
export function loadRoadTextures() {
  const loader = new THREE.TextureLoader();

  const loadOne = (url) =>
    new Promise((resolve, reject) => {
      loader.load(
        url,
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

  return Promise.all([
    loadOne(AssetSettings.road.straightDiffuse),
    loadOne(AssetSettings.road.plazaDiffuse),
  ]).then(([straight, plaza]) => ({ straight, plaza }));
}
