/**
 * Element detail modal.
 *
 * initModal() caches the modal nodes and wires the dismiss handlers
 * (overlay click, close button, card clicks are kept to themselves so they
 * do not bubble into the overlay). openModal() fills the fields from an
 * element record and tints the card with the element's category color.
 */

import { currentLanguage } from '../features/language.js';

const MODAL_SELECTORS = Object.freeze({
    overlay: '#modal-overlay',
    card:    '#modal-card',
    closeBtn: '#modalCloseBtn',
    sym:     '#m-sym',
    num:     '#m-num',
    name:    '#m-name',
    mass:    '#m-mass',
    den:     '#m-den',
    melt:    '#m-melt',
    boil:    '#m-boil'
});

let nodes = null;

/**
 * Resolve and cache the modal nodes on first use.
 *
 * @throws {Error} when any required node is missing from the document.
 */
function getNodes() {
    if (nodes) return nodes;

    const resolved = {};
    for (const [key, selector] of Object.entries(MODAL_SELECTORS)) {
        resolved[key] = document.querySelector(selector);
    }

    if (!resolved.overlay || !resolved.card || !resolved.closeBtn) {
        throw new Error('modal.js: missing modal DOM nodes');
    }

    nodes = resolved;
    return nodes;
}

/**
 * Wire up dismiss handlers. Safe to call multiple times.
 */
export function initModal() {
    const { overlay, card, closeBtn } = getNodes();

    if (!overlay.dataset.wired) {
        overlay.dataset.wired = 'true';
        overlay.addEventListener('click', closeModal);
        card.addEventListener('click', (e) => e.stopPropagation());
        closeBtn.addEventListener('click', closeModal);
    }
}

/**
 * Close the detail modal if it is open.
 */
export function closeModal() {
    getNodes().overlay.classList.remove('active');
}

/**
 * True while the modal is open (used by the global Esc chain).
 *
 * @returns {boolean}
 */
export function isModalOpen() {
    return getNodes().overlay.classList.contains('active');
}

/**
 * Populate and show the modal for an element record. Field labels follow
 * the active UI language; the card tint follows the element category.
 *
 * @param {object} record  element record from js/data/elements.js
 */
export function openModal(record) {
    const { overlay, card, sym, num, name, mass, den, melt, boil } = getNodes();

    sym.innerText = record.symbol;
    num.innerText = record.atomicNumber;
    name.innerText = (currentLanguage() === 'ID') ? record.nameID : record.nameEN;

    mass.innerText = record.mass;
    den.innerText  = record.density;
    melt.innerText = record.meltingPoint;
    boil.innerText = record.boilingPoint;

    card.style.setProperty('--modal-color', `var(--c-${record.category})`);
    overlay.classList.add('active');
}
