import {
    CAMERA_DEFAULT_Z,
    CAMERA_MIN_Z, CAMERA_MAX_Z,
    ROTATION_MIN_X, ROTATION_MAX_X,
    ANIME_CAMERA_RESET_MS
} from '../utils/helpers.js';

/* Global Anime.js */
const anime = window.anime;

/* --- Internal state --- */
const state = {
    camX: 0,
    camY: 0,
    camZ: CAMERA_DEFAULT_Z,
    rotX: 0,
    rotY: 0
};

let dirty = true;
let rafId = 0;

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
    rafId = requestAnimationFrame(renderLoop);
}

rafId = requestAnimationFrame(renderLoop);

export function getState() {
    return {
        camX: state.camX, camY: state.camY, camZ: state.camZ,
        rotX: state.rotX, rotY: state.rotY
    };
}

export function requestUpdate() { dirty = true; }

/* --- Direct mutators --- */
export function addRotation(dxRotY, dyRotX) {
    state.rotY += dxRotY;
    state.rotX = Math.max(ROTATION_MIN_X, Math.min(ROTATION_MAX_X, state.rotX - dyRotX));
    dirty = true;
}

export function addPan(dX, dY) {
    state.camX += dX;
    state.camY += dY;
    dirty = true;
}

export function addZoom(deltaZ) {
    state.camZ = Math.max(CAMERA_MIN_Z, Math.min(CAMERA_MAX_Z, state.camZ - deltaZ));
    dirty = true;
}

export function setPinchZoom(newZ) {
    state.camZ = Math.max(CAMERA_MIN_Z, Math.min(CAMERA_MAX_Z, newZ));
    dirty = true;
}

export function resetCamera() {
    if (!anime) {
        state.camX = 0; state.camY = 0; state.camZ = CAMERA_DEFAULT_Z;
        state.rotX = 0; state.rotY = 0;
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

export function dispose() {
    if (rafId) cancelAnimationFrame(rafId);
    rafId = 0;
}
