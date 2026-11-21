/**
 * Hamburger menu: a fixed button that toggles a slide-in dropdown panel
 * (layout switcher + language toggle) with a dimming backdrop.
 *
 * DOM nodes are resolved once in initMenu(); the open/close helpers are
 * exported for the language and layout switchers, which close the menu
 * after applying their change.
 */

let dom = null;
let isOpen = false;
let initialized = false;

/**
 * Cache the menu nodes and wire the toggle/close handlers. Safe to call
 * multiple times; only the first call has an effect.
 *
 * @throws {Error} when any required node is missing from the document.
 */
export function initMenu() {
    if (initialized) return;
    initialized = true;

    dom = {
        hamburger: document.querySelector('#hamburgerBtn'),
        dropdown:  document.querySelector('#dropdownWrapper'),
        backdrop:  document.querySelector('#backdrop'),
        closeBtn:  document.querySelector('#closeBtn')
    };

    if (!dom.hamburger || !dom.dropdown || !dom.backdrop || !dom.closeBtn) {
        throw new Error('menu.js: missing menu DOM nodes');
    }

    dom.hamburger.addEventListener('click', (e) => {
        e.stopPropagation();
        isOpen ? closeMenu() : openMenu();
    });
    dom.backdrop.addEventListener('click', closeMenu);
    dom.closeBtn.addEventListener('click', closeMenu);
}

/**
 * True while the dropdown is open (used by the global Esc chain).
 *
 * @returns {boolean}
 */
export function isMenuOpen() {
    return isOpen;
}

/** Open the dropdown and highlight the hamburger button. */
export function openMenu() {
    if (!dom) return;
    isOpen = true;
    dom.hamburger.classList.add('active');
    dom.hamburger.setAttribute('aria-expanded', 'true');
    dom.dropdown.classList.add('open');
    dom.backdrop.classList.add('active');
}

/** Close the dropdown and restore the hamburger button. */
export function closeMenu() {
    if (!dom) return;
    isOpen = false;
    dom.hamburger.classList.remove('active');
    dom.hamburger.setAttribute('aria-expanded', 'false');
    dom.dropdown.classList.remove('open');
    dom.backdrop.classList.remove('active');
}

/**
 * Close the menu after a short delay, letting the user see the option they
 * just picked (used by the language and layout switchers).
 *
 * @param {number} [delayMs=250]
 */
export function requestClose(delayMs = 250) {
    if (!isOpen) return;
    setTimeout(closeMenu, delayMs);
}
