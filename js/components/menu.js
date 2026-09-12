function _SELECTORS() {
    return {
        hamburger:  document.querySelector('#hamburgerBtn'),
        dropdown:   document.querySelector('#dropdownWrapper'),
        backdrop:   document.querySelector('#backdrop'),
        closeBtn:   document.querySelector('#closeBtn')
    };
}

let _open = false;
let _initialized = false;

export function initMenu() {
    if (_initialized) return;
    _initialized = true;

    const { hamburger, backdrop, closeBtn } = _SELECTORS();
    if (!hamburger || !backdrop || !closeBtn) {
        throw new Error('[menu.js] Menu DOM nodes missing');
    }

    hamburger.addEventListener('click', (e) => {
        e.stopPropagation();
        _open ? closeMenu() : openMenu();
    });
    backdrop.addEventListener('click', closeMenu);
    closeBtn.addEventListener('click', closeMenu);
}

export function openMenu() {
    const { hamburger, dropdown, backdrop } = _SELECTORS();
    if (!hamburger || !dropdown || !backdrop) return;
    _open = true;
    hamburger.classList.add('active');
    dropdown.classList.add('open');
    backdrop.classList.add('active');
}

export function closeMenu() {
    const { hamburger, dropdown, backdrop } = _SELECTORS();
    if (!hamburger || !dropdown || !backdrop) return;
    _open = false;
    hamburger.classList.remove('active');
    dropdown.classList.remove('open');
    backdrop.classList.remove('active');
}

export function isMenuOpen() { return _open; }

export function requestClose(delayMs = 250) {
    if (!_open) return;
    setTimeout(closeMenu, delayMs);
}
