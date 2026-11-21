/**
 * Keyboard shortcuts (desktop only) and the overlay that documents them.
 *
 * Bound keys:
 *   1-4   switch layout          E / I  switch language
 *   R     reset camera           /      focus the search bar
 *   ?     toggle this overlay    Esc    close the topmost surface
 *
 * The whole feature is skipped on touch-first devices (no hardware
 * keyboard): the help button hides itself and no listeners are attached.
 * Single-key shortcuts are suppressed while the user types in the search
 * field and while modifiers are held, so they never swallow regular input
 * or browser shortcuts.
 *
 * Esc follows a fixed precedence: detail modal > dropdown menu >
 * categories panel > this overlay.
 */

import {
    transformTo,
    LAYOUT_TABLE, LAYOUT_SPHERE, LAYOUT_HELIX, LAYOUT_GRID
} from './layout-switcher.js';
import { setLanguage } from './language.js';
import { requestClose, isMenuOpen, closeMenu } from '../components/menu.js';
import { closeModal, isModalOpen } from '../components/modal.js';
import { resetCamera } from '../core/camera.js';
import { focusSearch } from './search.js';
import { closeCategories, isCategoriesOpen } from './categories.js';

/* Touch-first devices (phones/tablets): no hardware keyboard to shortcut
   with. Anything else — including environments that report no pointer
   capabilities at all — is treated as desktop. */
const TOUCH_QUERY = '(hover: none) and (pointer: coarse)';

let overlay = null;
let helpBtn = null;
let isOpen = false;
let wired = false;

/** Apply the open/closed state to the overlay and help button. */
function setOverlayOpen(open) {
    isOpen = open;
    overlay.classList.toggle('open', open);
    helpBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
}

/** Close the topmost open surface, in precedence order. Modal dialogs
 *  (detail card, this overlay) come before transient and persistent UI. */
function handleEscape() {
    if (isModalOpen())       { closeModal(); return; }
    if (isMenuOpen())        { closeMenu(); return; }
    if (isOpen)              { setOverlayOpen(false); return; }
    if (isCategoriesOpen())  { closeCategories(); }
}

function onKeyDown(e) {
    if (e.key === 'Escape') {
        handleEscape();
        return;
    }

    /* Never hijack keys while typing or while a browser combo is in use. */
    const el = document.activeElement;
    const typing = el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.isContentEditable);
    if (typing || e.ctrlKey || e.metaKey || e.altKey) return;

    switch (e.key) {
        case '1': transformTo(LAYOUT_TABLE);  break;
        case '2': transformTo(LAYOUT_SPHERE); break;
        case '3': transformTo(LAYOUT_HELIX);  break;
        case '4': transformTo(LAYOUT_GRID);   break;
        case 'e':
        case 'E': setLanguage('EN'); requestClose(250); break;
        case 'i':
        case 'I': setLanguage('ID'); requestClose(250); break;
        case 'r':
        case 'R': resetCamera(); break;
        case '/': e.preventDefault(); focusSearch(); break;
        case '?': setOverlayOpen(!isOpen); break;
    }
}

/**
 * Wire the help button, overlay dismissals, and document keydown. On
 * touch-first devices the button hides and nothing is bound. Safe to call
 * multiple times.
 */
export function initShortcuts() {
    if (wired) return;
    wired = true;

    overlay = document.querySelector('#shortcutsOverlay');
    helpBtn = document.querySelector('#helpBtn');

    if (!overlay || !helpBtn) {
        throw new Error('shortcuts.js: missing shortcut overlay DOM nodes');
    }

    if (window.matchMedia(TOUCH_QUERY).matches) {
        helpBtn.hidden = true;
        return;
    }

    helpBtn.addEventListener('click', () => setOverlayOpen(!isOpen));
    overlay.addEventListener('click', () => setOverlayOpen(false));
    document.addEventListener('keydown', onKeyDown);
}
