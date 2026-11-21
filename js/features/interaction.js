/**
 * Camera input pipeline: mouse, wheel, and touch.
 *
 * Gesture arbitration is the important part. A press that begins on an
 * element card belongs to the card's long-press gesture, so the camera does
 * NOT follow it immediately; it only engages once the pointer travels more
 * than SCENE_DRAG_THRESHOLD_PX from the press origin, turning the gesture
 * into a scene drag (the card's own drift check cancels the pending hold at
 * that point). Presses that start on empty space drive the camera right
 * away. This split is what keeps "hold to open details" reliable while
 * preserving drag-to-rotate from anywhere.
 *
 * UI surfaces (menu, backdrop, modal) are never treated as scene input.
 */

import {
    addRotation, addPan, addZoom, setPinchZoom, getState
} from '../core/camera.js';
import {
    MOUSE_ROTATE_GAIN, MOUSE_PAN_GAIN, WHEEL_ZOOM_GAIN,
    TOUCH_ROTATE_GAIN, TOUCH_PAN_GAIN, TOUCH_PINCH_GAIN,
    SCENE_DRAG_THRESHOLD_PX, pinchDistance
} from '../utils/helpers.js';

/* Current press state. */
let rotating = false;      /* primary-button drag: rotate the scene     */
let panning = false;       /* secondary-button / two-finger drag: pan   */
let armed = false;         /* camera gestures active for this press     */
let pressX = 0;            /* press origin, used for the drag threshold */
let pressY = 0;
let prevX = 0;             /* last processed pointer position           */
let prevY = 0;
let prevPinch = 0;

let wired = false;

/**
 * True when the event target lives inside a UI surface that owns the
 * interaction (menu, search, categories, shortcuts, modal).
 *
 * @param {EventTarget|null} target
 * @returns {boolean}
 */
function isUiTarget(target) {
    if (!target || !target.closest) return false;
    return !!(
        target.closest('#modal-overlay') ||
        target.closest('#dropdownWrapper') ||
        target.closest('#hamburgerBtn') ||
        target.closest('#backdrop') ||
        target.closest('#searchBar') ||
        target.closest('#categoriesToggle') ||
        target.closest('#categoriesPanel') ||
        target.closest('#helpBtn') ||
        target.closest('#shortcutsOverlay')
    );
}

/**
 * True when the press began on an element card (candidate for a hold).
 *
 * @param {EventTarget|null} target
 * @returns {boolean}
 */
function isElementTarget(target) {
    return !!(target && target.closest && target.closest('.element'));
}

/**
 * Arm the camera gestures once the pointer has travelled further than the
 * drag threshold from the press origin. Until then the press stays passive
 * so a card hold can complete undisturbed.
 *
 * @param {number} x
 * @param {number} y
 * @returns {boolean} true when armed and the movement should be applied
 */
function armIfNeeded(x, y) {
    if (armed) return true;
    if (Math.hypot(x - pressX, y - pressY) < SCENE_DRAG_THRESHOLD_PX) return false;
    armed = true;
    prevX = x;
    prevY = y;
    return true;
}

/**
 * Record a new press. Presses on cards wait for the drag threshold.
 *
 * @param {number} x
 * @param {number} y
 * @param {boolean} onCard
 */
function beginPress(x, y, onCard) {
    armed = !onCard;
    pressX = prevX = x;
    pressY = prevY = y;
}

function onMouseDown(e) {
    if (isUiTarget(e.target)) return;
    if (e.button === 0) {
        rotating = true;
        beginPress(e.clientX, e.clientY, isElementTarget(e.target));
    } else if (e.button === 2) {
        panning = true;
        beginPress(e.clientX, e.clientY, isElementTarget(e.target));
    }
}

function onMouseMove(e) {
    if (!rotating && !panning) return;
    if (!armIfNeeded(e.clientX, e.clientY)) return;

    const dX = e.clientX - prevX;
    const dY = e.clientY - prevY;
    if (rotating) {
        addRotation(dX * MOUSE_ROTATE_GAIN, dY * MOUSE_ROTATE_GAIN);
    } else {
        addPan(dX * MOUSE_PAN_GAIN, dY * MOUSE_PAN_GAIN);
    }
    prevX = e.clientX;
    prevY = e.clientY;
}

function onMouseUp() {
    rotating = false;
    panning = false;
    armed = false;
}

function onWheel(e) {
    if (isUiTarget(e.target)) return;
    addZoom(e.deltaY * WHEEL_ZOOM_GAIN);
}

function onTouchStart(e) {
    if (isUiTarget(e.target)) return;

    if (e.touches.length === 1) {
        rotating = true;
        panning = false;
        beginPress(e.touches[0].clientX, e.touches[0].clientY, isElementTarget(e.target));
    } else if (e.touches.length >= 2) {
        /* Pinch engages immediately; holds were cancelled by the
           multi-touch listener in element-card.js. */
        rotating = false;
        panning = true;
        armed = true;
        prevPinch = pinchDistance(e.touches);
        pressX = prevX = (e.touches[0].clientX + e.touches[1].clientX) / 2;
        pressY = prevY = (e.touches[0].clientY + e.touches[1].clientY) / 2;
    }
}

function onTouchMove(e) {
    if (isUiTarget(e.target)) return;
    e.preventDefault();

    if (rotating && e.touches.length === 1) {
        const x = e.touches[0].clientX;
        const y = e.touches[0].clientY;
        if (!armIfNeeded(x, y)) return;

        addRotation(
            (x - prevX) * TOUCH_ROTATE_GAIN,
            (y - prevY) * TOUCH_ROTATE_GAIN
        );
        prevX = x;
        prevY = y;
    } else if (panning && e.touches.length >= 2) {
        const curPinch = pinchDistance(e.touches);
        const { camZ } = getState();
        setPinchZoom(camZ + (curPinch - prevPinch) * TOUCH_PINCH_GAIN);
        prevPinch = curPinch;

        const midX = (e.touches[0].clientX + e.touches[1].clientX) / 2;
        const midY = (e.touches[0].clientY + e.touches[1].clientY) / 2;
        addPan((midX - prevX) * TOUCH_PAN_GAIN, (midY - prevY) * TOUCH_PAN_GAIN);
        prevX = midX;
        prevY = midY;
    }
}

function onTouchEnd() {
    rotating = false;
    panning = false;
    armed = false;
}

/**
 * Attach the document-level input listeners. Safe to call multiple times.
 */
export function initInteraction() {
    if (wired) return;
    wired = true;

    /* The scene is drag-driven; the native context menu would otherwise
       pop up whenever a right-button pan ends. */
    document.addEventListener('contextmenu', (e) => e.preventDefault());

    document.addEventListener('mousedown',  onMouseDown);
    document.addEventListener('mousemove',  onMouseMove);
    document.addEventListener('mouseup',    onMouseUp);
    document.addEventListener('wheel',      onWheel, { passive: true });
    document.addEventListener('touchstart', onTouchStart, { passive: false });
    document.addEventListener('touchmove',  onTouchMove,  { passive: false });
    document.addEventListener('touchend',   onTouchEnd);
}
