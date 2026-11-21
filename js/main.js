/**
 * Application entry point.
 *
 * Boot order matters: the menu and modal must be wired before cards can
 * target them, cards must exist before the language/layout/filter features
 * can address them, the search and category filters come next so their
 * strings exist before the first language pass, and camera input plus the
 * desktop keyboard shortcuts come last so every surface they may close is
 * already in place when the first gesture arrives.
 */

import { TOTAL_ELEMENTS } from './data/elements.js';
import { createElementCard } from './components/element-card.js';
import { initModal, openModal } from './components/modal.js';
import { initMenu } from './components/menu.js';
import { initLanguageToggle, registerElementEntries, setLanguage } from './features/language.js';
import { initLayoutSwitcher, setElementEntries, transformTo } from './features/layout-switcher.js';
import { setFilterEntries } from './features/filter.js';
import { initSearch } from './features/search.js';
import { initCategories } from './features/categories.js';
import { initShortcuts } from './features/shortcuts.js';
import { initInteraction } from './features/interaction.js';
import { detectUserLanguage, INITIAL_LAYOUT } from './utils/helpers.js';

function boot() {
    initMenu();
    initModal();

    const entries = [];
    for (let i = 0; i < TOTAL_ELEMENTS; i++) {
        const entry = createElementCard(i, (record) => openModal(record));
        entries.push({ index: i, dom: entry.dom, current: entry.current });
    }

    registerElementEntries(entries);
    setElementEntries(entries.map(({ dom, current }) => ({ dom, current })));
    setFilterEntries(entries.map(({ index, dom }) => ({ index, dom })));

    initSearch();
    initCategories();

    initLanguageToggle();
    setLanguage(detectUserLanguage());

    initLayoutSwitcher();
    transformTo(INITIAL_LAYOUT);

    initInteraction();
    initShortcuts();
}

boot();
