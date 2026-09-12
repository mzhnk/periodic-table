import { currentLanguage } from '../features/language.js';

const SELECTORS = Object.freeze({
    overlay:       '#modal-overlay',
    card:          '#modal-card',
    sym:           '#m-sym',
    num:           '#m-num',
    name:          '#m-name',
    mass:          '#m-mass',
    den:           '#m-den',
    melt:          '#m-melt',
    boil:          '#m-boil'
});

let _initialized = false;

export function initModal() {
    if (_initialized) return;
    _initialized = true;

    const overlay = document.querySelector(SELECTORS.overlay);
    const card    = document.querySelector(SELECTORS.card);
    const closeBtn = document.querySelector('#modalCloseBtn');
    if (!overlay || !card || !closeBtn) {
        throw new Error('[modal.js] Modal DOM nodes missing');
    }

    overlay.addEventListener('click', () => overlay.classList.remove('active'));
    card.addEventListener('click', e => e.stopPropagation());
    closeBtn.addEventListener('click', () => overlay.classList.remove('active'));
}

export function openModal(record) {
    const overlay = document.querySelector(SELECTORS.overlay);
    const card    = document.querySelector(SELECTORS.card);
    if (!overlay || !card) return;

    document.querySelector(SELECTORS.sym).innerText  = record.symbol;
    document.querySelector(SELECTORS.num).innerText  = record.atomicNumber;

    const lang = currentLanguage();
    document.querySelector(SELECTORS.name).innerText =
        (lang === 'ID') ? record.nameID : record.nameEN;

    document.querySelector(SELECTORS.mass).innerText  = record.mass;
    document.querySelector(SELECTORS.den).innerText   = record.density;
    document.querySelector(SELECTORS.melt).innerText  = record.meltingPoint;
    document.querySelector(SELECTORS.boil).innerText  = record.boilingPoint;

    card.style.setProperty('--modal-color', `var(--c-${record.category})`);

    overlay.classList.add('active');
}

export function closeModal() {
    const overlay = document.querySelector(SELECTORS.overlay);
    if (overlay) overlay.classList.remove('active');
}
