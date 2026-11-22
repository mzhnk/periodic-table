/**
 * Layout switcher: animates every element card from its current 3D state to
 * the positions of the selected layout (table / sphere / helix / grid /
 * rings / cylinder / wave / dna / vortex / torus).
 *
 * While a transition is running the cards ignore the pointer
 * (#scene-content gets an `is-transitioning` class), otherwise presses land
 * on whichever card happens to sweep underneath. The camera resets to its
 * neutral pose after every switch.
 */

import {
    LAYOUT_NAMES, getLayout,
    LAYOUT_TABLE, LAYOUT_SPHERE, LAYOUT_HELIX, LAYOUT_GRID,
    LAYOUT_RINGS, LAYOUT_CYLINDER, LAYOUT_WAVE, LAYOUT_DNA, LAYOUT_VORTEX, LAYOUT_TORUS
} from '../core/layouts.js';
import { applyElementTransform, getScene } from '../core/scene.js';
import { resetCamera } from '../core/camera.js';
import { requestClose } from '../components/menu.js';
import {
    ANIME_LAYOUT_DURATION_MS, ANIME_LAYOUT_STAGGER_MS,
    ANIME_LAYOUT_DURATION_TOUCH_MS, ANIME_LAYOUT_STAGGER_TOUCH_MS,
    isTouchDevice
} from '../utils/helpers.js';

/* Anime.js is loaded as a classic script in index.html. */
const anime = window.anime;

let current = '';
let entries = [];
let wired = false;

/**
 * Provide the element cards to move. Called once from main.js before boot.
 *
 * @param {Array<{dom:HTMLElement, current:object}>} elementEntries
 */
export function setElementEntries(elementEntries) {
    entries = elementEntries;
}

/**
 * Active layout name.
 *
 * @returns {string}
 */
export function currentLayout() {
    return current;
}

/**
 * Highlight the selected entry in the menu and keep aria-pressed in sync.
 *
 * @param {string} layoutName
 */
function updateMenuSelection(layoutName) {
    document.querySelectorAll('.layout-item').forEach((item) => {
        const selected = item.dataset.layout === layoutName;
        item.classList.toggle('selected', selected);
        item.setAttribute('aria-pressed', selected ? 'true' : 'false');
    });
}

/**
 * Animate all cards into a layout. Re-selecting the active layout is a no-op.
 *
 * @param {string} layoutName  one of the LAYOUT_* constants
 */
export function transformTo(layoutName) {
    if (!LAYOUT_NAMES.includes(layoutName)) {
        console.warn(`layout-switcher.js: unknown layout "${layoutName}"`);
        return;
    }
    if (current === layoutName) return;

    const targets = getLayout(layoutName);
    updateMenuSelection(layoutName);

    const scene = getScene();
    scene.classList.add('is-transitioning');

    if (!anime || entries.length === 0) {
        /* No animator available (or nothing to move): snap instantly. */
        entries.forEach((entry, i) => {
            Object.assign(entry.current, targets[i]);
            applyElementTransform(entry.dom, entry.current);
        });
        scene.classList.remove('is-transitioning');
    } else {
        /* Touch-first devices run the same choreography on a shorter
           clock: fewer seconds of per-frame style writes across 118
           cards keeps switches fluid on mobile GPUs. */
        const touch = isTouchDevice();
        anime({
            targets: entries.map((entry) => entry.current),
            x:  (el, i) => targets[i].x,
            y:  (el, i) => targets[i].y,
            z:  (el, i) => targets[i].z,
            rx: (el, i) => targets[i].rx,
            ry: (el, i) => targets[i].ry,
            rz: (el, i) => targets[i].rz,
            duration: touch ? ANIME_LAYOUT_DURATION_TOUCH_MS : ANIME_LAYOUT_DURATION_MS,
            easing: 'easeOutCubic',
            delay: anime.stagger(
                touch ? ANIME_LAYOUT_STAGGER_TOUCH_MS : ANIME_LAYOUT_STAGGER_MS,
                { easing: 'easeOutQuad' }
            ),
            update: () => {
                for (const entry of entries) {
                    applyElementTransform(entry.dom, entry.current);
                }
            },
            complete: () => {
                scene.classList.remove('is-transitioning');
            }
        });
    }

    resetCamera();

    current = layoutName;
    requestClose(250);
}

/**
 * Wire the layout menu entries (click + keyboard activation). Safe to call
 * multiple times.
 */
export function initLayoutSwitcher() {
    if (wired) return;
    wired = true;

    document.querySelectorAll('.layout-item').forEach((item) => {
        item.addEventListener('click', () => transformTo(item.dataset.layout));
        item.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                transformTo(item.dataset.layout);
            }
        });
    });
}

export { LAYOUT_TABLE, LAYOUT_SPHERE, LAYOUT_HELIX, LAYOUT_GRID,
         LAYOUT_RINGS, LAYOUT_CYLINDER, LAYOUT_WAVE, LAYOUT_DNA,
         LAYOUT_VORTEX, LAYOUT_TORUS };
