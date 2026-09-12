import { getElement, TOTAL_ELEMENTS } from '../data/elements.js';
import { setElementTitle } from '../components/element-card.js';
import { requestClose } from '../components/menu.js';

let _current = 'EN';

const translations = Object.freeze({
    EN: {
        layoutSection: 'LAYOUT',
        languageSection: 'LANGUAGE',
        table:  'Table',
        sphere: 'Sphere',
        helix:  'Helix',
        grid:   'Grid',
        helperHTML: '<div class="main-hlp"><i class="fa-regular fa-hand-pointer"></i> <span>HOLD 0.5s</span> on element for details</div>',
        modalMassLabel:  'Atomic Mass:',
        modalDensity:    'Density:',
        modalMelting:    'Melting Point:',
        modalBoiling:    'Boiling Point:'
    },
    ID: {
        layoutSection: 'TATA LETAK',
        languageSection: 'BAHASA',
        table:  'Tabel',
        sphere: 'Bola',
        helix:  'Spiral',
        grid:   'Kisi',
        helperHTML: '<div class="main-hlp"><i class="fa-regular fa-hand-pointer"></i> <span>TAHAN 0.5s</span> di unsur untuk detail</div>',
        modalMassLabel:  'Massa Atom:',
        modalDensity:    'Massa Jenis:',
        modalMelting:    'Titik Leleh:',
        modalBoiling:    'Titik Didih:'
    }
});

export function t(key) {
    const dict = translations[_current] || translations.EN;
    return dict[key] ?? key;
}

export function currentLanguage() { return _current; }

const LABEL_IDS = Object.freeze({
    layoutSection: 'lbl-layout',
    table:         'lbl-table',
    sphere:        'lbl-sphere',
    helix:         'lbl-helix',
    grid:          'lbl-grid',
    languageSection: 'lbl-lang',
    modalMassLabel: 'lbl-mass',
    modalDensity:   'lbl-den',
    modalMelting:   'lbl-melt',
    modalBoiling:   'lbl-boil'
});

/** Update static UI labels + helper text + modal field labels. */
function updateStaticLabels() {
    setText(LABEL_IDS.layoutSection,  t('layoutSection'));
    setText(LABEL_IDS.table,         t('table'));
    setText(LABEL_IDS.sphere,        t('sphere'));
    setText(LABEL_IDS.helix,         t('helix'));
    setText(LABEL_IDS.grid,          t('grid'));
    setText(LABEL_IDS.languageSection, t('languageSection'));

    setText(LABEL_IDS.modalMassLabel, t('modalMassLabel'));
    setText(LABEL_IDS.modalDensity,   t('modalDensity'));
    setText(LABEL_IDS.modalMelting,   t('modalMelting'));
    setText(LABEL_IDS.modalBoiling,   t('modalBoiling'));

    const helper = document.getElementById('helper-txt');
    if (helper) helper.innerHTML = t('helperHTML');
}

function setText(id, text) {
    const el = document.getElementById(id);
    if (el) el.innerText = text;
}

/** Update every element card's title to the current language. */
function updateElementTitles() {
    for (const entry of _elementEntries) {
        const rec = getElement(entry.index);
        setElementTitle(entry, (_current === 'ID') ? rec.nameID : rec.nameEN);
    }
}

/* --- Element-entry registry ---*/
const _elementEntries = [];

/**
 * @param {Array<{index:number, dom:HTMLElement}>} entries
 */
export function registerElementEntries(entries) {
    _elementEntries.length = 0;
    for (const e of entries) _elementEntries.push(e);
}

/* --- Language toggle UI --- */
function updateToggleUI(lang) {
    const isID = (lang === 'ID');
    const langToggle = document.getElementById('langToggle');
    if (langToggle) langToggle.classList.toggle('id-active', isID);

    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.lang === lang);
    });
}

/**
 * Switch the active language and refresh the UI.
 * @param {('EN'|'ID')} lang
 */
export function setLanguage(lang) {
    if (lang !== 'EN' && lang !== 'ID') {
        console.warn(`[language.js] Unsupported language: ${lang}. Falling back to EN.`);
        lang = 'EN';
    }
    _current = lang;
    updateToggleUI(lang);
    updateStaticLabels();
    updateElementTitles();
}

/** Wire up the EN/ID language buttons. Idempotent. */
let _wired = false;
export function initLanguageToggle() {
    if (_wired) return;
    _wired = true;
    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            setLanguage(btn.dataset.lang);
            requestClose(250);
        });
    });
}
