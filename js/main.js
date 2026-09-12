import { TOTAL_ELEMENTS } from './data/elements.js';
import { createElementCard } from './components/element-card.js';
import { initModal, openModal } from './components/modal.js';
import { initMenu } from './components/menu.js';
import { setLanguage, initLanguageToggle, registerElementEntries } from './features/language.js';
import { transformTo, initLayoutSwitcher, setElementEntries } from './features/layout-switcher.js';
import { initInteraction } from './features/interaction.js';
import { INITIAL_LAYOUT, detectUserLanguage } from './utils/helpers.js';
import { LAYOUT_TABLE } from './core/layouts.js';


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

    initLanguageToggle();
    const initialLang = detectUserLanguage();
    setLanguage(initialLang);

    initLayoutSwitcher();
    transformTo(LAYOUT_TABLE);

    initInteraction();

    console.info('[main.js] 3D Periodic Table initialized');
}

boot();
