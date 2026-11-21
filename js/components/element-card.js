/**
 * Element card: the DOM node placed in the 3D scene, plus the long-press
 * gesture that opens the detail modal.
 *
 * The hold survives small pointer jitter (see ELEMENT_HOLD_DRIFT_PX) and is
 * cancelled when the pointer travels further than that, leaves the card, is
 * interrupted by the system, or when a second finger joins (which turns the
 * gesture into a pinch). Camera dragging is handled by
 * js/features/interaction.js and only engages after the scene-wide drag
 * threshold, so holding a card never rotates the scene by accident.
 */

import { getElement } from '../data/elements.js';
import { applyElementTransform, mountElement } from '../core/scene.js';
import { ELEMENT_HOLD_DURATION_MS, ELEMENT_HOLD_DRIFT_PX } from '../utils/helpers.js';

/**
 * Reset callbacks of every hold currently in progress, so module-level
 * listeners (e.g. multi-touch) can cancel them all.
 *
 * @type {Set<() => void>}
 */
const activeHolds = new Set();

/* Two or more simultaneous touches mean a pinch, never a hold. */
document.addEventListener('touchstart', (e) => {
    if (e.touches.length >= 2) {
        for (const cancel of activeHolds) cancel();
    }
}, { passive: true });

/**
 * Create an element card and mount it into the scene.
 *
 * @param {number} index  zero-based dataset index (atomicNumber - 1)
 * @param {(record: object) => void} onHold  invoked after a successful hold
 * @returns {{dom: HTMLElement, current: {x:number,y:number,z:number,rx:number,ry:number,rz:number}}}
 */
export function createElementCard(index, onHold) {
    const record = getElement(index);
    const { symbol, nameEN, category } = record;

    const dom = document.createElement('div');
    dom.className = 'element';
    dom.style.setProperty('--color-rgb', `var(--c-${category})`);
    dom.innerHTML =
        `<div class="element-number">${index + 1}</div>` +
        `<div class="element-symbol">${symbol}</div>` +
        `<div class="element-title">${nameEN}</div>`;

    let holdTimer = 0;
    let pressing = false;
    let pressX = 0;
    let pressY = 0;

    const cancelHold = () => {
        if (holdTimer) {
            clearTimeout(holdTimer);
            holdTimer = 0;
        }
    };

    const resetPress = () => {
        cancelHold();
        activeHolds.delete(resetPress);
        pressing = false;
        dom.classList.remove('pressing');
    };

    dom.addEventListener('pointerdown', (e) => {
        if (pressing) return; /* second finger on the same card: ignore */
        pressing = true;
        pressX = e.clientX;
        pressY = e.clientY;
        dom.classList.add('pressing');
        cancelHold();
        activeHolds.add(resetPress);
        holdTimer = setTimeout(() => {
            if (!pressing) return;
            resetPress();
            onHold(record, dom);
        }, ELEMENT_HOLD_DURATION_MS);
    });

    dom.addEventListener('pointermove', (e) => {
        if (!pressing) return;
        const drift = Math.hypot(e.clientX - pressX, e.clientY - pressY);
        if (drift > ELEMENT_HOLD_DRIFT_PX) resetPress();
    });

    dom.addEventListener('pointerup',     resetPress);
    dom.addEventListener('pointerleave',  resetPress);
    dom.addEventListener('pointercancel', resetPress);

    /* Start at the origin; the layout switcher positions every card. */
    const current = { x: 0, y: 0, z: 0, rx: 0, ry: 0, rz: 0 };
    applyElementTransform(dom, current);
    mountElement(dom);

    return { dom, current };
}

/**
 * Update the visible (English or Indonesian) title of an element card.
 *
 * @param {{dom: HTMLElement}} entry
 * @param {string} name
 */
export function setElementTitle(entry, name) {
    entry.dom.querySelector('.element-title').innerText = name;
}
