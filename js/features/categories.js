/**
 * Category filter panel: chip toggles for the ten element categories plus
 * the round button that opens and closes the panel.
 *
 * Chip highlighting is delegated to filter.js; this module owns the panel
 * open/close state, the chip DOM (built from the category palette), and
 * the active-filter indicator dot on the toggle button.
 *
 * Chip labels are marked with data-i18n keys (cat0..cat9) so language.js
 * retitles them on every language switch.
 */

import { toggleCategory, hasActiveCategories } from './filter.js';
import { onLanguageChange } from './language.js';

/* Number of category palettes defined in css/variables.css (--c-0..--c-9). */
const CATEGORY_COUNT = 10;

let dom = null;
let isOpen = false;
let wired = false;

/**
 * Resolve and cache the category nodes.
 *
 * @throws {Error} when any required node is missing from the document.
 */
function getNodes() {
    if (dom) return dom;

    dom = {
        toggle: document.querySelector('#categoriesToggle'),
        panel:  document.querySelector('#categoriesPanel'),
        chips:  document.querySelector('#catChips'),
        close:  document.querySelector('#categoriesCloseBtn')
    };

    if (!dom.toggle || !dom.panel || !dom.chips || !dom.close) {
        throw new Error('categories.js: missing category DOM nodes');
    }

    return dom;
}

/** Reflect the active-filter state on the toggle button's indicator dot. */
function updateIndicator() {
    getNodes().toggle.classList.toggle('has-filters', hasActiveCategories());
}

/** Apply the open/closed state to the panel, toggle button, and body. */
function setPanelOpen(open) {
    isOpen = open;
    dom.panel.classList.toggle('open', open);
    dom.toggle.classList.toggle('panel-open', open);
    dom.toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    /* Responsive CSS hides the centered hint while the panel may overlap it. */
    document.body.classList.toggle('cat-open', open);
}

/**
 * Build one chip per category and wire its toggle behaviour.
 */
function buildChips() {
    const { chips } = getNodes();

    for (let c = 0; c < CATEGORY_COUNT; c++) {
        const chip = document.createElement('button');
        chip.type = 'button';
        chip.className = 'cat-chip';
        chip.dataset.category = String(c);
        chip.style.setProperty('--chip-rgb', `var(--c-${c})`);
        chip.setAttribute('aria-pressed', 'false');
        chip.innerHTML =
            `<span class="chip-dot" aria-hidden="true"></span>` +
            `<span class="chip-name" data-i18n="cat${c}"></span>`;

        chip.addEventListener('click', () => {
            const active = toggleCategory(c);
            chip.classList.toggle('active', active);
            chip.setAttribute('aria-pressed', active ? 'true' : 'false');
            updateIndicator();
        });

        chips.appendChild(chip);
    }
}

/**
 * Close the panel (used by the global Esc chain).
 */
export function closeCategories() {
    setPanelOpen(false);
}

/**
 * True while the panel is open.
 *
 * @returns {boolean}
 */
export function isCategoriesOpen() {
    return isOpen;
}

/**
 * Build the chips and wire the panel controls. Safe to call multiple times.
 */
export function initCategories() {
    if (wired) return;
    wired = true;

    const { toggle, panel, close } = getNodes();

    buildChips();

    toggle.addEventListener('click', () => setPanelOpen(!isOpen));
    close.addEventListener('click', () => setPanelOpen(false));

    /* Start open where the device is not touch-first (phones keep the
       scene unobstructed until asked). */
    const desktop = !window.matchMedia('(hover: none) and (pointer: coarse)').matches;
    setPanelOpen(desktop);

    updateIndicator();
    onLanguageChange(updateIndicator);
}
