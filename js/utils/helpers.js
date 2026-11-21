/**
 * Shared constants and small utilities used across the app.
 *
 * Distances are CSS pixels inside the 3D scene: cards are laid out on a
 * virtual plane and projected through the fixed `perspective` on <body>
 * (see css/main.css).
 */

/**
 * Duration a card must be pressed before its detail modal opens (ms).
 */
export const ELEMENT_HOLD_DURATION_MS = 500;

/**
 * Pointer travel tolerated inside a hold before it counts as a drag and
 * cancels the press. Generous on purpose: fingers are never perfectly
 * still, and an over-sensitive threshold makes cards feel unclickable.
 */
export const ELEMENT_HOLD_DRIFT_PX = 12;

/**
 * Pointer travel (from the press origin) before a press is treated as a
 * scene drag and the camera starts following it. Presses that start on an
 * element card stay passive until this threshold is crossed.
 */
export const SCENE_DRAG_THRESHOLD_PX = 10;

/* Table layout: card pitch and the grid centre used to center the table. */
export const TABLE_CELL_W = 150;
export const TABLE_CELL_H = 190;
export const TABLE_CENTER_COL = 9.5; /* 18 columns */
export const TABLE_CENTER_ROW = 5.5; /* 7 main rows, plus f-block rows below */

/* Sphere layout. */
export const SPHERE_RADIUS = 1100;

/* Helix layout. */
export const HELIX_RADIUS = 1000;
export const HELIX_THETA_STEP = 0.175;      /* radians between elements */
export const HELIX_THETA_OFFSET = Math.PI;
export const HELIX_Y_STEP = -10;            /* vertical travel per element */
export const HELIX_Y_OFFSET = 500;

/* Grid layout: 5 x 5 cells per slice, 1000px apart in depth. */
export const GRID_COLS = 5;
export const GRID_ROWS = 5;
export const GRID_STEP_XY = 400;
export const GRID_STEP_Z = 1000;
export const GRID_OFFSET_X = -800;
export const GRID_OFFSET_Y = 800;
export const GRID_OFFSET_Z = -2000;

/*
 * Camera rig: the scene plane sits at z = 0 and the camera node is
 * translated along -Z, so more negative means further away. All mutators
 * clamp camZ into [CAMERA_MIN_Z, CAMERA_MAX_Z].
 */
export const CAMERA_DEFAULT_Z = -2600;
export const CAMERA_MIN_Z = -6000;
export const CAMERA_MAX_Z = -500;

/* Rotation clamps (degrees) for the scene rotator's X axis. */
export const ROTATION_MIN_X = -90;
export const ROTATION_MAX_X = 90;

/* Input gains: pointer pixels to camera/rotation deltas. */
export const MOUSE_ROTATE_GAIN = 0.3;
export const MOUSE_PAN_GAIN = 2.5;
export const WHEEL_ZOOM_GAIN = 2.0;
export const TOUCH_ROTATE_GAIN = 0.4;
export const TOUCH_PAN_GAIN = 2.5;
export const TOUCH_PINCH_GAIN = 5.0;

/* Layout transition and camera-reset animation timings (Anime.js). */
export const ANIME_LAYOUT_DURATION_MS = 2000;
export const ANIME_LAYOUT_STAGGER_MS = 12;
export const ANIME_CAMERA_RESET_MS = 1500;

/* Layout selected on boot. */
export const INITIAL_LAYOUT = 'table';

/**
 * Distance between the first two touch points, used by pinch-zoom.
 * Returns 0 when fewer than two touches are present.
 *
 * @param {TouchList} touches
 * @returns {number}
 */
export function pinchDistance(touches) {
    if (!touches || touches.length < 2) return 0;
    return Math.hypot(
        touches[0].clientX - touches[1].clientX,
        touches[0].clientY - touches[1].clientY
    );
}

/**
 * Build the CSS transform for an element card from its 3D state.
 * Centralized here so every writer produces an identical transform string.
 *
 * @param {{x:number,y:number,z:number,rx:number,ry:number,rz:number}} state
 * @returns {string}
 */
export function formatElementTransform(state) {
    return `translate3d(${state.x}px, ${state.y}px, ${state.z}px) ` +
           `rotateY(${state.ry}rad) ` +
           `rotateX(${state.rx}rad) ` +
           `rotateZ(${state.rz}rad)`;
}

/**
 * Pick the initial UI language from the browser locale: Indonesian
 * language/region tags get 'ID', everything else falls back to 'EN'.
 *
 * @returns {('EN'|'ID')}
 */
export function detectUserLanguage() {
    const [lang, region] = (navigator.language || 'en').toLowerCase().split('-');
    return (lang === 'id' || region === 'id') ? 'ID' : 'EN';
}
