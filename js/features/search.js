/**
 * Search bar: narrows the highlighted cards by name (both UI languages),
 * symbol, or atomic number.
 *
 * The filtering itself lives in filter.js so search and the category chips
 * stay composable; this module owns the input, the clear button, and the
 * empty-state message shown when nothing matches.
 */

import { setQuery, hasQuery, matchedCount } from './filter.js';
import { translate, onLanguageChange } from './language.js';

/* Coalesce rapid keystrokes into one filter pass. */
const SEARCH_DEBOUNCE_MS = 120;

let nodes = null;
let applyHandle = 0;
let wired = false;

/**
 * Resolve and cache the search nodes.
 *
 * @throws {Error} when any required node is missing from the document.
 */
function getNodes() {
    if (nodes) return nodes;

    nodes = {
        bar:   document.querySelector('#searchBar'),
        input: document.querySelector('#searchInput'),
        clear: document.querySelector('#searchClearBtn'),
        empty: document.querySelector('#searchEmpty')
    };

    if (!nodes.bar || !nodes.input || !nodes.clear || !nodes.empty) {
        throw new Error('search.js: missing search DOM nodes');
    }

    return nodes;
}

/**
 * Refresh the empty-state bubble: visible only while a query is active and
 * nothing matches. Text follows the active UI language.
 */
function updateEmptyMessage() {
    const { empty, input } = getNodes();

    if (!hasQuery() || matchedCount() > 0) {
        empty.hidden = true;
        return;
    }

    empty.innerText = translate('searchNoResults').replace('{q}', input.value.trim());
    empty.hidden = false;
}

/** Reset the query and the input field. */
function clearSearch() {
    const { input, clear } = getNodes();
    clearTimeout(applyHandle);
    input.value = '';
    clear.hidden = true;
    setQuery('');
    updateEmptyMessage();
}

/**
 * Focus the search field (used by the "/" keyboard shortcut).
 */
export function focusSearch() {
    getNodes().input.focus();
}

/**
 * Wire the search input, clear button, and language listener. Safe to call
 * multiple times.
 */
export function initSearch() {
    if (wired) return;
    wired = true;

    const { input, clear } = getNodes();

    input.addEventListener('input', () => {
        clear.hidden = input.value.length === 0;
        clearTimeout(applyHandle);
        applyHandle = setTimeout(() => {
            setQuery(input.value);
            updateEmptyMessage();
        }, SEARCH_DEBOUNCE_MS);
    });

    /* Esc inside the field clears it (or releases focus); the global Esc
       chain must not react to the same press. */
    input.addEventListener('keydown', (e) => {
        if (e.key !== 'Escape') return;
        e.stopPropagation();
        if (input.value) {
            clearSearch();
        } else {
            input.blur();
        }
    });

    clear.addEventListener('click', () => {
        clearSearch();
        input.focus();
    });

    onLanguageChange(updateEmptyMessage);
}
