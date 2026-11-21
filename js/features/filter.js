/**
 * Element highlighting pipeline shared by search and category filtering.
 *
 * The search bar and the category chips both narrow which cards stay lit;
 * this module owns the combined state and applies the visual result so the
 * two features compose instead of fighting over the same DOM classes.
 *
 * A card is lit when it matches the active query (if any) AND belongs to
 * one of the active categories (if any). With no filters set every card
 * returns to its resting look.
 *
 * Classes written onto each card:
 *   .lit    - matches the current filter combination (category glow)
 *   .dimmed - faded out so the lit cards read instantly; still interactive
 */

import { getElement, TOTAL_ELEMENTS } from '../data/elements.js';

/**
 * Registered element cards, set once from main.js.
 *
 * @type {Array<{index:number, dom:HTMLElement}>}
 */
let entries = [];

/* Active filter state. */
let query = '';
const activeCategories = new Set();

/**
 * True when an element record matches the raw (lowercased, trimmed) query.
 * Numeric queries prefix-match the atomic number; anything else matches
 * the symbol or the English/Indonesian names case-insensitively.
 *
 * @param {object} record  element record from js/data/elements.js
 * @param {string} q
 * @returns {boolean}
 */
function matchesQuery(record, q) {
    if (/^\d+$/.test(q)) {
        return String(record.atomicNumber).startsWith(q);
    }
    return record.symbol.toLowerCase().includes(q)
        || record.nameEN.toLowerCase().includes(q)
        || record.nameID.toLowerCase().includes(q);
}

/**
 * Provide the element cards to filter. Called once from main.js before boot.
 *
 * @param {Array<{index:number, dom:HTMLElement}>} filterEntries
 */
export function setFilterEntries(filterEntries) {
    entries = filterEntries;
}

/**
 * Replace the search query and re-apply the filter.
 *
 * @param {string} raw  raw input value
 */
export function setQuery(raw) {
    query = raw.trim().toLowerCase();
    applyFilter();
}

/**
 * Toggle membership of a category in the active filter set.
 *
 * @param {number} category  category index (0-9)
 * @returns {boolean} true when the category is now active
 */
export function toggleCategory(category) {
    if (activeCategories.has(category)) {
        activeCategories.delete(category);
    } else {
        activeCategories.add(category);
    }
    applyFilter();
    return activeCategories.has(category);
}

/**
 * True when at least one category chip is active.
 *
 * @returns {boolean}
 */
export function hasActiveCategories() {
    return activeCategories.size > 0;
}

/**
 * True when a search query is set.
 *
 * @returns {boolean}
 */
export function hasQuery() {
    return query.length > 0;
}

/**
 * Number of cards the current filter combination would light up.
 * Mirrors the intersection rule used by applyFilter().
 *
 * @returns {number}
 */
export function matchedCount() {
    const noCategories = activeCategories.size === 0;
    let count = 0;
    for (let i = 0; i < TOTAL_ELEMENTS; i++) {
        const record = getElement(i);
        const queryOk = query.length === 0 || matchesQuery(record, query);
        const categoryOk = noCategories || activeCategories.has(record.category);
        if (queryOk && categoryOk) count++;
    }
    return count;
}

/**
 * Apply the current filter combination to every card in one pass.
 */
export function applyFilter() {
    const filterActive = query.length > 0 || activeCategories.size > 0;

    for (const entry of entries) {
        const record = getElement(entry.index);
        const queryOk = query.length === 0 || matchesQuery(record, query);
        const categoryOk = activeCategories.size === 0 || activeCategories.has(record.category);
        const matches = filterActive && queryOk && categoryOk;

        entry.dom.classList.toggle('lit', matches);
        entry.dom.classList.toggle('dimmed', filterActive && !matches);
    }
}
