/* --- Element / interaction --- */
export const ELEMENT_HOLD_DURATION_MS = 500;  // long-press threshold
export const ELEMENT_HOLD_DRIFT_PX = 5;  // max pointer drift before hold cancels

/* --- Table layout math --- */
export const TABLE_CELL_W = 150;  // horizontal cell pitch (px)
export const TABLE_CELL_H = 190;  // vertical cell pitch (px)
export const TABLE_CENTER_COL = 9.5;  // column center for 18-wide grid
export const TABLE_CENTER_ROW = 5.5;  // row center for 7-row main grid

/* --- Sphere layout math --- */
export const SPHERE_RADIUS = 1100;  // fibonacci sphere radius

/* --- Helix layout math --- */
export const HELIX_RADIUS = 1000;
export const HELIX_THETA_STEP = 0.175;  // radians per element
export const HELIX_THETA_OFFSET = Math.PI;  // start angle offset
export const HELIX_Y_STEP = -10;  // vertical step per element
export const HELIX_Y_OFFSET = 500;  // vertical center offset

/* --- Grid layout math --- */
export const GRID_COLS = 5;
export const GRID_ROWS = 5;
export const GRID_DEPTH_SLICES = 5;  // 5 × 5 × 5 = 125 cells (>118)
export const GRID_STEP_XY = 400;  // pixel pitch on X/Y
export const GRID_STEP_Z = 1000;  // pixel pitch on Z
export const GRID_OFFSET_X = -800;
export const GRID_OFFSET_Y = 800;
export const GRID_OFFSET_Z = -2000;

/* --- Camera defaults / limits --- */
export const CAMERA_DEFAULT_Z = -2600;  // default camera Z (px)
export const CAMERA_NON_TABLE_Z = -3200;  // legacy "non-table" start Z
export const CAMERA_MIN_Z = -6000;  // max zoom-in
export const CAMERA_MAX_Z = -500;  // max zoom-out

/* --- Rotation constraints --- */
export const ROTATION_MIN_X = -90;  // degrees, clamp on rotX
export const ROTATION_MAX_X = 90;

/* --- Interaction gains --- */
export const MOUSE_ROTATE_GAIN = 0.3;
export const MOUSE_PAN_GAIN = 2.5;
export const WHEEL_ZOOM_GAIN = 2.0;
export const TOUCH_ROTATE_GAIN = 0.4;
export const TOUCH_PAN_GAIN = 2.5;
export const TOUCH_PINCH_GAIN = 5.0;

/* --- Animation timing --- */
export const ANIME_LAYOUT_DURATION_MS = 2000;
export const ANIME_LAYOUT_STAGGER_MS = 12;
export const ANIME_CAMERA_RESET_MS = 1500;

/* --- Internal init flag --- */
export const INITIAL_LAYOUT = 'table';  // first layout on app boot
export const SUPPORTED_LANGUAGES = ['EN', 'ID'];


/* --- Clamp `v` into inclusive [min, max] */
export function clamp(v, min, max) {
    return Math.max(min, Math.min(max, v));
}

/**
 * Euclidean distance between two touch points (used by pinch-zoom).
 * Returns 0 if either touch is missing.
 */
export function pinchDistance(touches) {
    if (!touches || touches.length < 2) return 0;
    return Math.hypot(
        touches[0].clientX - touches[1].clientX,
        touches[0].clientY - touches[1].clientY
    );
}

/**
 * Format a transform string for an element card. Centralized so the
 * transform template never drifts between layout-switcher and init.
 */
export function formatElementTransform(state) {
    return `translate3d(${state.x}px, ${state.y}px, ${state.z}px) ` +
           `rotateY(${state.ry}rad) ` +
           `rotateX(${state.rx}rad) ` +
           `rotateZ(${state.rz}rad)`;
}

/**
 * Detect the user's preferred UI language from the browser.
 * Falls back to 'EN' if the locale isn't Indonesian.
 */
export function detectUserLanguage() {
    const locale = navigator.language || navigator.userLanguage || 'en';
    return locale.toLowerCase().includes('id') ? 'ID' : 'EN';
}
