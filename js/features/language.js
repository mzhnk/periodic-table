/**
 * UI language (English / Indonesian).
 *
 * Owns every static label in the menu and modal, the search bar, the
 * category panel, the shortcuts overlay, the interaction hint, and the
 * on-card element titles. Cards register themselves here so a language
 * switch retitles all of them in one pass.
 *
 * Static markup declares its key with data-i18n (text), data-i18n-ph
 * (placeholder) or data-i18n-aria (aria-label); dynamic consumers either
 * read translate() directly or subscribe with onLanguageChange().
 */

import { getElement } from '../data/elements.js';
import { setElementTitle } from '../components/element-card.js';
import { requestClose } from '../components/menu.js';

let current = 'EN';

/* UI strings per language; keys map to DOM ids via LABEL_IDS. */
const translations = Object.freeze({
    EN: {
        layoutSection:   'LAYOUT',
        languageSection: 'LANGUAGE',
        table:  'Table',
        sphere: 'Sphere',
        helix:  'Helix',
        grid:   'Grid',
        rings:  'Rings',
        cylinder: 'Cylinder',
        wave:   'Wave',
        dna:    'DNA',
        vortex: 'Vortex',
        torus:  'Torus',
        helperHTML: '<div class="main-hlp"><i class="fa-regular fa-hand-pointer"></i> <span>HOLD 0.5s</span> on element for details</div>',
        modalMassLabel: 'Atomic Mass:',
        modalDensity:   'Density:',
        modalMelting:   'Melting Point:',
        modalBoiling:   'Boiling Point:',

        searchPlaceholder: 'Search name, symbol, number...',
        searchClear:       'Clear search',
        searchNoResults:   'No elements match "{q}"',

        categoriesLabel: 'CATEGORIES',
        categoriesOpen:  'Show category filters',
        categoriesClose: 'Hide category filters',
        helpLabel:       'Keyboard shortcuts',
        cat0:  'Nonmetal',
        cat1:  'Noble Gas',
        cat2:  'Alkali Metal',
        cat3:  'Alkaline Earth',
        cat4:  'Metalloid',
        cat5:  'Halogen',
        cat6:  'Post-transition',
        cat7:  'Transition Metal',
        cat8:  'Lanthanide',
        cat9:  'Actinide',

        shortcutsTitle:      'KEYBOARD SHORTCUTS',
        scSectionLayouts:    'LAYOUTS',
        scSectionLanguage:   'LANGUAGE',
        scSectionActions:    'ACTIONS',
        scLangEN:            'English',
        scLangID:            'Indonesia',
        scReset:             'Reset camera',
        scSearch:            'Focus search',
        scToggle:            'Show/hide this overlay',
        scClose:             'Close modal / menu / overlay',
        shortcutsFooterHTML: 'Click anywhere or press <kbd>Esc</kbd> to close'
    },
    ID: {
        layoutSection:   'TATA LETAK',
        languageSection: 'BAHASA',
        table:  'Tabel',
        sphere: 'Bola',
        helix:  'Spiral',
        grid:   'Kisi',
        rings:  'Cincin',
        cylinder: 'Silinder',
        wave:   'Gelombang',
        dna:    'DNA',
        vortex: 'Pusaran',
        torus:  'Torus',
        helperHTML: '<div class="main-hlp"><i class="fa-regular fa-hand-pointer"></i> <span>TAHAN 0.5s</span> di unsur untuk detail</div>',
        modalMassLabel: 'Massa Atom:',
        modalDensity:   'Massa Jenis:',
        modalMelting:   'Titik Leleh:',
        modalBoiling:   'Titik Didih:',

        searchPlaceholder: 'Cari nama, simbol, nomor...',
        searchClear:       'Bersihkan pencarian',
        searchNoResults:   'Tidak ada unsur yang cocok dengan "{q}"',

        categoriesLabel: 'KATEGORI',
        categoriesOpen:  'Tampilkan filter kategori',
        categoriesClose: 'Sembunyikan filter kategori',
        helpLabel:       'Pintasan keyboard',
        cat0:  'Nonmetal',
        cat1:  'Gas Mulia',
        cat2:  'Logam Alkali',
        cat3:  'Logam Alkali Tanah',
        cat4:  'Metaloid',
        cat5:  'Halogen',
        cat6:  'Logam Pasca-transisi',
        cat7:  'Logam Transisi',
        cat8:  'Lantanida',
        cat9:  'Aktinida',

        shortcutsTitle:      'PINTASAN KEYBOARD',
        scSectionLayouts:    'TATA LETAK',
        scSectionLanguage:   'BAHASA',
        scSectionActions:    'AKSI',
        scLangEN:            'Inggris',
        scLangID:            'Indonesia',
        scReset:             'Reset kamera',
        scSearch:            'Fokus pencarian',
        scToggle:            'Tampilkan/sembunyikan overlay ini',
        scClose:             'Tutup modal / menu / overlay',
        shortcutsFooterHTML: 'Klik di mana saja atau tekan <kbd>Esc</kbd> untuk menutup'
    }
});

/* Translation keys whose value is markup, applied with innerHTML. */
const HTML_KEYS = new Set(['helperHTML', 'shortcutsFooterHTML']);

/* translation key -> element id carrying that string */
const LABEL_IDS = Object.freeze({
    layoutSection:   'lbl-layout',
    table:           'lbl-table',
    sphere:          'lbl-sphere',
    helix:           'lbl-helix',
    grid:            'lbl-grid',
    rings:           'lbl-rings',
    cylinder:        'lbl-cylinder',
    wave:            'lbl-wave',
    dna:             'lbl-dna',
    vortex:          'lbl-vortex',
    torus:           'lbl-torus',
    languageSection: 'lbl-lang',
    modalMassLabel:  'lbl-mass',
    modalDensity:    'lbl-den',
    modalMelting:    'lbl-melt',
    modalBoiling:    'lbl-boil'
});

/**
 * Element entries registered by main.js, retitled on language switches.
 *
 * @type {Array<{index:number, dom:HTMLElement}>}
 */
const elementEntries = [];

/**
 * Callbacks notified after every language switch.
 *
 * @type {Set<(lang:string) => void>}
 */
const languageListeners = new Set();

/**
 * Subscribe to language switches; the callback fires after all static
 * labels and card titles have been refreshed.
 *
 * @param {(lang:string) => void} callback
 * @returns {() => void} unsubscribe function
 */
export function onLanguageChange(callback) {
    languageListeners.add(callback);
    return () => languageListeners.delete(callback);
}

/**
 * Translation string for a key in the active UI language.
 *
 * @param {string} key
 * @returns {string} empty string for unknown keys
 */
export function translate(key) {
    return translations[current][key] ?? '';
}

/**
 * Register the element cards for language updates.
 *
 * @param {Array<{index:number, dom:HTMLElement}>} entries
 */
export function registerElementEntries(entries) {
    elementEntries.length = 0;
    for (const entry of entries) elementEntries.push(entry);
}

/**
 * Active UI language ('EN' or 'ID').
 *
 * @returns {string}
 */
export function currentLanguage() {
    return current;
}

/**
 * Update every static label, the hint, and the modal field labels.
 */
function updateStaticLabels() {
    for (const [key, id] of Object.entries(LABEL_IDS)) {
        const el = document.getElementById(id);
        if (el) el.innerText = translations[current][key];
    }

    const helper = document.getElementById('helper-txt');
    if (helper) helper.innerHTML = translations[current].helperHTML;

    /* Declared markup: text, placeholders, and aria labels. */
    document.querySelectorAll('[data-i18n]').forEach((el) => {
        const value = translations[current][el.dataset.i18n];
        if (value === undefined) return;
        if (HTML_KEYS.has(el.dataset.i18n)) {
            el.innerHTML = value;
        } else {
            el.innerText = value;
        }
    });

    document.querySelectorAll('[data-i18n-ph]').forEach((el) => {
        const value = translations[current][el.dataset.i18nPh];
        if (value !== undefined) el.setAttribute('placeholder', value);
    });

    document.querySelectorAll('[data-i18n-aria]').forEach((el) => {
        const value = translations[current][el.dataset.i18nAria];
        if (value !== undefined) el.setAttribute('aria-label', value);
    });
}

/**
 * Retitle all element cards in the active language.
 */
function updateElementTitles() {
    for (const entry of elementEntries) {
        const record = getElement(entry.index);
        setElementTitle(entry, (current === 'ID') ? record.nameID : record.nameEN);
    }
}

/**
 * Reflect the active language on the EN/ID toggle buttons.
 *
 * @param {string} lang
 */
function updateToggleUI(lang) {
    const langToggle = document.getElementById('langToggle');
    if (langToggle) langToggle.classList.toggle('id-active', lang === 'ID');

    document.querySelectorAll('.lang-btn').forEach((btn) => {
        btn.classList.toggle('active', btn.dataset.lang === lang);
    });
}

/**
 * Switch the UI language and refresh everything that renders text.
 *
 * @param {('EN'|'ID')} lang  unsupported values fall back to 'EN'
 */
export function setLanguage(lang) {
    if (lang !== 'EN' && lang !== 'ID') {
        console.warn(`language.js: unsupported language "${lang}", falling back to EN`);
        lang = 'EN';
    }

    current = lang;
    updateToggleUI(lang);
    updateStaticLabels();
    updateElementTitles();

    for (const listener of languageListeners) listener(lang);
}

/**
 * Wire the EN/ID buttons. Safe to call multiple times.
 */
let wired = false;
export function initLanguageToggle() {
    if (wired) return;
    wired = true;

    document.querySelectorAll('.lang-btn').forEach((btn) => {
        btn.addEventListener('click', () => {
            setLanguage(btn.dataset.lang);
            requestClose(250);
        });
    });
}
