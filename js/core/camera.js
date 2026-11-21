/**
 * Camera rig state and mutators.
 *
 * The camera is a DOM hierarchy: #scene-camera is translated by
 * (--cam-x, --cam-y, --cam-z) and #scene-rotator below it is rotated by
 * (--rot-x, --rot-y). This module owns those five values, exposes mutators
 * used by the input pipeline (js/features/interaction.js), and flushes them
 * to the document root as CSS custom properties inside a rAF loop that only
 * touches the DOM when something actually changed.
 */

import {
    CAMERA_DEFAULT_Z,
    CAMERA_MIN_Z,
    CAMERA_MAX_Z,
    ROTATION_MIN_X,
    ROTATION_MAX_X,
    ANIME_CAMERA_RESET_MS
} from '../utils/helpers.js';

/* Anime.js is loaded as a classic script in index.html. */
const anime = window.anime;

const state = {
    camX: 0,
    camY: 0,
    camZ: CAMERA_DEFAULT_Z,
    rotX: 0,
    rotY: 0
};

let dirty = true;
const rootStyles = document.documentElement.style;

function renderLoop() {
    if (dirty) {
        rootStyles.setProperty('--cam-x', `${state.camX}px`);
        rootStyles.setProperty('--cam-y', `${state.camY}px`);
        rootStyles.setProperty('--cam-z', `${state.camZ}px`);
        rootStyles.setProperty('--rot-x', `${state.rotX}deg`);
        rootStyles.setProperty('--rot-y', `${state.rotY}deg`);
        dirty = false;
    }
    requestAnimationFrame(renderLoop);
}

requestAnimationFrame(renderLoop);

/**
 * Snapshot of the current camera state (a copy, safe to mutate).
 *
 * @returns {{camX:number, camY:number, camZ:number, rotX:number, rotY:number}}
 */
export function getState() {
    return {
        camX: state.camX,
        camY: state.camY,
        camZ: state.camZ,
        rotX: state.rotX,
        rotY: state.rotY
    };
}

/**
 * Rotate the scene. `dRotY` is horizontal pointer travel (yaw), `dRotX`
 * vertical (pitch, clamped to ROTATION_MIN/MAX_X).
 *
 * @param {number} dRotY
 * @param {number} dRotX
 */
export function addRotation(dRotY, dRotX) {
    state.rotY += dRotY;
    state.rotX = Math.max(ROTATION_MIN_X, Math.min(ROTATION_MAX_X, state.rotX - dRotX));
    dirty = true;
}

/**
 * Translate the camera on the X/Y plane (right-button drag or two-finger pan).
 *
 * @param {number} dX
 * @param {number} dY
 */
export function addPan(dX, dY) {
    state.camX += dX;
    state.camY += dY;
    dirty = true;
}

/**
 * Zoom by a relative delta (wheel). Positive deltas zoom in.
 *
 * @param {number} deltaZ
 */
export function addZoom(deltaZ) {
    state.camZ = Math.max(CAMERA_MIN_Z, Math.min(CAMERA_MAX_Z, state.camZ - deltaZ));
    dirty = true;
}

/**
 * Set an absolute camera distance, clamped into the allowed range
 * (pinch-zoom). Using an absolute value keeps pinch stable when two
 * successive events carry the same finger spread.
 *
 * @param {number} newZ
 */
export function setPinchZoom(newZ) {
    state.camZ = Math.max(CAMERA_MIN_Z, Math.min(CAMERA_MAX_Z, newZ));
    dirty = true;
}

/**
 * Animate the camera back to its neutral pose. Uses Anime.js when
 * available, otherwise snaps instantly.
 */
export function resetCamera() {
    if (!anime) {
        state.camX = 0;
        state.camY = 0;
        state.camZ = CAMERA_DEFAULT_Z;
        state.rotX = 0;
        state.rotY = 0;
        dirty = true;
        return;
    }

    anime({
        targets: state,
        camX: 0,
        camY: 0,
        camZ: CAMERA_DEFAULT_Z,
        rotX: 0,
        rotY: 0,
        duration: ANIME_CAMERA_RESET_MS,
        easing: 'easeOutQuad',
        update: () => { dirty = true; }
    });
}
