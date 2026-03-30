/**
 * Keyboard polling with edge detection for one-shot actions.
 */
export class InputSystem {
  constructor() {
    /** @type {Set<string>} */
    this._keys = new Set();
    /** @type {Set<string>} */
    this._prevKeys = new Set();
    /** @type {Set<string>} */
    this._edgeDown = new Set();
    /** Caps Lock toggle state from last keyboard event (OS LED on). */
    this._capsLockModifierOn = false;

    this._onKeyDown = (e) => {
      this._syncCapsLockFromEvent(e);
      if (e.repeat) return;
      this._keys.add(e.code);
    };
    this._onKeyUp = (e) => {
      this._keys.delete(e.code);
      this._syncCapsLockFromEvent(e);
    };

    window.addEventListener('keydown', this._onKeyDown);
    window.addEventListener('keyup', this._onKeyUp);
  }

  /**
   * @param {KeyboardEvent} e
   */
  _syncCapsLockFromEvent(e) {
    if (typeof e.getModifierState === 'function') {
      this._capsLockModifierOn = e.getModifierState('CapsLock');
    }
  }

  dispose() {
    window.removeEventListener('keydown', this._onKeyDown);
    window.removeEventListener('keyup', this._onKeyUp);
  }

  /**
   * Call once per frame at the start of the pipeline.
   */
  poll() {
    this._edgeDown.clear();
    for (const code of this._keys) {
      if (!this._prevKeys.has(code)) this._edgeDown.add(code);
    }
    this._prevKeys = new Set(this._keys);
  }

  /**
   * @param {string} code
   */
  isDown(code) {
    return this._keys.has(code);
  }

  /**
   * @param {string} code
   */
  wasPressedEdge(code) {
    return this._edgeDown.has(code);
  }

  /**
   * Brake: Caps Lock key held (brief) or Caps Lock modifier active (toggle LED on).
   * @returns {boolean}
   */
  isBrakeActive() {
    return this._keys.has('CapsLock') || this._capsLockModifierOn;
  }
}
