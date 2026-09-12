import { getElement } from '../data/elements.js';
import { applyElementTransform, mountElement } from '../core/scene.js';
import {
    ELEMENT_HOLD_DURATION_MS,
    ELEMENT_HOLD_DRIFT_PX
} from '../utils/helpers.js';


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
    
    let timerId = 0;
    let pressing = false;
    let startX = 0;
    let startY = 0;

    const clearTimer = () => {
        if (timerId) { clearTimeout(timerId); timerId = 0; }
    };
    const resetPress = () => {
        clearTimer();
        pressing = false;
        dom.classList.remove('pressing');
    };

    dom.addEventListener('pointerdown', (e) => {
        pressing = true;
        startX = e.clientX;
        startY = e.clientY;
        dom.classList.add('pressing');
        clearTimer();
        timerId = setTimeout(() => {
            if (!pressing) return;
            pressing = false;
            dom.classList.remove('pressing');
            timerId = 0;
            onHold(record, dom);
        }, ELEMENT_HOLD_DURATION_MS);
    });

    dom.addEventListener('pointermove', (e) => {
        if (!pressing) return;
        const drift = Math.hypot(e.clientX - startX, e.clientY - startY);
        if (drift > ELEMENT_HOLD_DRIFT_PX) resetPress();
    });
    dom.addEventListener('pointerup',      resetPress);
    dom.addEventListener('pointerleave',    resetPress);
    dom.addEventListener('pointercancel',   resetPress);

    const current = { x: 0, y: 0, z: 0, rx: 0, ry: 0, rz: 0 };
    applyElementTransform(dom, current);

    mountElement(dom);
    return { dom, current };
}

export function setElementTitle(entry, name) {
    entry.dom.querySelector('.element-title').innerText = name;
}
