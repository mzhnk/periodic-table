import {
    LAYOUT_NAMES, getLayout,
    LAYOUT_TABLE, LAYOUT_SPHERE, LAYOUT_HELIX, LAYOUT_GRID
} from '../core/layouts.js';
import { applyElementTransform } from '../core/scene.js';
import { resetCamera } from '../core/camera.js';
import { requestClose } from '../components/menu.js';
import { ANIME_LAYOUT_DURATION_MS, ANIME_LAYOUT_STAGGER_MS } from '../utils/helpers.js';

const _anime = window.anime;

/* --- Internal state --- */
let _current = '';
let _elements = [];
let _wired = false;

/**
 * @param {Array<{dom:HTMLElement, current:Object}>} entries
 */
export function setElementEntries(entries) { _elements = entries; }

/** Read the active layout name */
export function currentLayout() { return _current; }

/**
 * Animate every element from its current transform state to the
 * target layout's positions/rotations. No-op if `layoutName` equals
 * the active layout.
 *
 * @param {string} layoutName   One of LAYOUT_TABLE / SPHERE / HELIX / GRID
 */
export function transformTo(layoutName) {
    if (!LAYOUT_NAMES.includes(layoutName)) {
        console.warn(`[layout-switcher.js] Unknown layout: ${layoutName}`);
        return;
    }
    if (_current === layoutName) return;

    const targetPositions = getLayout(layoutName);

    document.querySelectorAll('.layout-item').forEach(item => {
        item.classList.toggle('selected', item.dataset.layout === layoutName);
    });

    if (!_anime || _elements.length === 0) {
        _elements.forEach((entry, i) => {
            const p = targetPositions[i];
            Object.assign(entry.current, p);
            applyElementTransform(entry.dom, entry.current);
        });
    } else {
        _anime({
            targets: _elements.map(e => e.current),
            x:  (el, i) => targetPositions[i].x,
            y:  (el, i) => targetPositions[i].y,
            z:  (el, i) => targetPositions[i].z,
            rx: (el, i) => targetPositions[i].rx,
            ry: (el, i) => targetPositions[i].ry,
            rz: (el, i) => targetPositions[i].rz,
            duration: ANIME_LAYOUT_DURATION_MS,
            easing: 'easeOutCubic',
            delay: _anime.stagger(ANIME_LAYOUT_STAGGER_MS, { easing: 'easeOutQuad' }),
            update: () => {
                for (const entry of _elements) {
                    applyElementTransform(entry.dom, entry.current);
                }
            }
        });
    }
    resetCamera();

    _current = layoutName;
    requestClose(250);
}

export function initLayoutSwitcher() {
    if (_wired) return;
    _wired = true;
    document.querySelectorAll('.layout-item').forEach(item => {
        item.addEventListener('click', () => transformTo(item.dataset.layout));
    });
}

export { LAYOUT_TABLE, LAYOUT_SPHERE, LAYOUT_HELIX, LAYOUT_GRID };