import {
    addRotation, addPan, addZoom, setPinchZoom, getState
} from '../core/camera.js';
import {
    MOUSE_ROTATE_GAIN, MOUSE_PAN_GAIN, WHEEL_ZOOM_GAIN,
    TOUCH_ROTATE_GAIN, TOUCH_PAN_GAIN, TOUCH_PINCH_GAIN,
    CAMERA_MIN_Z, CAMERA_MAX_Z
} from '../utils/helpers.js';
import { pinchDistance } from '../utils/helpers.js';

/* Gesture state */
let _rotating = false;
let _panning = false;
let _prevX = 0;
let _prevY = 0;
let _prevPinch = 0;

let _wired = false;


function isUiTarget(target) {
    if (!target || !target.closest) return false;
    return !!(
        target.closest('#modal-overlay') ||
        target.closest('#dropdownWrapper') ||
        target.closest('#hamburgerBtn')
    );
}

/* --- Mouse handlers --- */
function onMouseDown(e) {
    if (isUiTarget(e.target)) return;
    if (e.button === 0) _rotating = true;
    if (e.button === 2) _panning  = true;
    _prevX = e.clientX;
    _prevY = e.clientY;
}

function onMouseMove(e) {
    if (!_rotating && !_panning) return;
    const dX = e.clientX - _prevX;
    const dY = e.clientY - _prevY;
    if (_rotating) {
        addRotation(dX * MOUSE_ROTATE_GAIN, dY * MOUSE_ROTATE_GAIN);
    } else if (_panning) {
        addPan(dX * MOUSE_PAN_GAIN, dY * MOUSE_PAN_GAIN);
    }
    _prevX = e.clientX;
    _prevY = e.clientY;
}

function onMouseUp() {
    _rotating = false;
    _panning = false;
}

function onWheel(e) {
    addZoom(e.deltaY * WHEEL_ZOOM_GAIN);
}

/* --- Touch handlers --- */
function onTouchStart(e) {
    if (isUiTarget(e.target)) return;
    if (e.touches.length === 1) {
        _rotating = true;
        _panning  = false;
        _prevX = e.touches[0].clientX;
        _prevY = e.touches[0].clientY;
    } else if (e.touches.length >= 2) {
        _rotating = false;
        _panning  = true;
        _prevPinch = pinchDistance(e.touches);
        _prevX = (e.touches[0].clientX + e.touches[1].clientX) / 2;
        _prevY = (e.touches[0].clientY + e.touches[1].clientY) / 2;
    }
}

function onTouchMove(e) {
    if (isUiTarget(e.target)) return;
    e.preventDefault();

    if (_rotating && e.touches.length === 1) {
        const dX = e.touches[0].clientX - _prevX;
        const dY = e.touches[0].clientY - _prevY;
        addRotation(dX * TOUCH_ROTATE_GAIN, dY * TOUCH_ROTATE_GAIN);
        _prevX = e.touches[0].clientX;
        _prevY = e.touches[0].clientY;
    } else if (_panning && e.touches.length >= 2) {
        const curPinch = pinchDistance(e.touches);
        const { camZ } = getState();
        const nextZ = camZ + (curPinch - _prevPinch) * TOUCH_PINCH_GAIN;
        setPinchZoom(nextZ);
        _prevPinch = curPinch;

        const midX = (e.touches[0].clientX + e.touches[1].clientX) / 2;
        const midY = (e.touches[0].clientY + e.touches[1].clientY) / 2;
        addPan((midX - _prevX) * TOUCH_PAN_GAIN, (midY - _prevY) * TOUCH_PAN_GAIN);
        _prevX = midX;
        _prevY = midY;
    }
}

function onTouchEnd() {
    _rotating = false;
    _panning = false;
}


export function initInteraction() {
    if (_wired) return;
    _wired = true;

    document.addEventListener('mousedown', onMouseDown);
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup',   onMouseUp);
    document.addEventListener('wheel',      onWheel, { passive: true });
    document.addEventListener('touchstart', onTouchStart, { passive: false });
    document.addEventListener('touchmove',  onTouchMove,  { passive: false });
    document.addEventListener('touchend',   onTouchEnd);
}

export { CAMERA_MIN_Z, CAMERA_MAX_Z };
