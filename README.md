# 3D Periodic Table

An interactive, browser-based 3D periodic table built with **HTML, CSS, and vanilla JavaScript**. The application presents all **118 chemical elements** as interactive 3D cards and allows users to switch between multiple spatial layouts, inspect element properties, and change the interface language between English and Indonesian.

> **Current scope:** This README documents the implementation contained in this project. It does not assume features that are not currently present in the source code.

## Overview

The project was originally implemented as a single HTML file and has been reorganized into a modular front-end structure. The current architecture separates:

- application entry point,
- element data,
- 3D scene and camera logic,
- UI components,
- interaction features,
- language handling,
- layout switching,
- and CSS by responsibility.

The result is a lightweight single-page application that can run directly in a modern browser without a backend or build step.

## Features

### 3D Periodic Table

The application renders **118 elements** from Hydrogen (`H`) to Oganesson (`Og`). Each element is represented as a 3D card with:

- atomic number,
- chemical symbol,
- element name,
- category-based color styling.

The element dataset is stored separately in `js/data/elements.js`.

### Multiple 3D Layouts

The same 118 elements can be arranged using four layouts:

| Layout | Description |
|---|---|
| **Table** | Positions elements according to their configured period/column coordinates. |
| **Sphere** | Distributes elements across a spherical 3D arrangement. |
| **Helix** | Places elements along a spiral/helix path. |
| **Grid** | Places elements into a multi-layer 3D grid. |

Layout transitions are animated with **Anime.js**.

### Element Detail Modal

Hold an element for approximately **0.5 seconds** to open its detail modal.

The modal displays:

- atomic number,
- symbol,
- element name,
- atomic mass,
- density,
- melting point,
- boiling point.

The displayed element name follows the currently selected interface language.

### English / Indonesian UI

The interface supports:

- **EN — English**
- **ID — Bahasa Indonesia**

Language switching updates menu labels, helper text, modal labels, and element names.

The initial language is detected from the browser locale. Indonesian browser locales default to `ID`; other locales default to `EN`.

### Mouse Interaction

On desktop, the 3D scene supports:

| Action | Input |
|---|---|
| Rotate | Left mouse button + drag |
| Pan | Right mouse button + drag |
| Zoom | Mouse wheel |
| Open element details | Hold an element for ~0.5 s |

### Touch Interaction

On touch devices, the application supports:

| Action | Input |
|---|---|
| Rotate | One-finger drag |
| Pan + zoom | Two-finger gesture |
| Element detail | Hold an element for ~0.5 s |

The implementation cancels a long-press when the pointer moves beyond a small drift threshold so normal dragging does not accidentally open the element modal.

### Responsive UI

The project includes dedicated responsive CSS for small screens and touch devices, including safe-area handling for modern mobile devices.

### Dark / Neon Visual Design

The UI uses a dark, neon-inspired visual language with:

- glassmorphism-style panels,
- blurred backdrops,
- cyan accent lighting,
- element-specific glow colors,
- animated menu transitions,
- custom typography.

## Tech Stack

### Core

- **HTML5**
- **CSS3**
- **JavaScript (ES Modules)**

### External Libraries / Assets

The project currently loads the following resources from CDNs:

- **Anime.js 3.2.1** — layout and camera animations.
- **Font Awesome 7.2.0** — interface icons.
- **Google Fonts**:
  - Outfit
  - JetBrains Mono
  - Share Tech Mono

No framework such as React, Vue, Angular, or Svelte is used.

## Project Structure

```text
periodic-table/
│
├── index.html
├── README.md
│
├── css/
│   ├── main.css
│   ├── variables.css
│   ├── menu.css
│   ├── periodic-table.css
│   ├── modal.css
│   └── responsive.css
│
└── js/
    ├── main.js
    │
    ├── data/
    │   └── elements.js
    │
    ├── core/
    │   ├── scene.js
    │   ├── camera.js
    │   └── layouts.js
    │
    ├── components/
    │   ├── element-card.js
    │   ├── menu.js
    │   └── modal.js
    │
    ├── features/
    │   ├── interaction.js
    │   ├── language.js
    │   └── layout-switcher.js
    │
    └── utils/
        └── helpers.js
```

## Architecture

The application follows a lightweight modular architecture built around ES Modules.

```text
index.html
    │
    ▼
main.js
    │
    ├── data/elements.js
    │
    ├── components/
    │   ├── element-card.js
    │   ├── menu.js
    │   └── modal.js
    │
    ├── core/
    │   ├── scene.js
    │   ├── camera.js
    │   └── layouts.js
    │
    ├── features/
    │   ├── interaction.js
    │   ├── language.js
    │   └── layout-switcher.js
    │
    └── utils/helpers.js
```

### `index.html`

Contains the page structure and entry points for external dependencies and the application module. CSS and application JavaScript are loaded externally.

### `js/main.js`

Acts as the application bootstrap layer. It initializes the menu, modal, element cards, language system, layout switcher, and interaction layer.

### `js/data/elements.js`

Contains the full element dataset and the functions/constants used to access it safely.

The data is stored using a fixed record stride:

```text
Symbol
English name
Indonesian name
Category
Column
Row
Atomic mass
Density
Melting point
Boiling point
```

The module exposes `getElement(index)` so other modules do not need to work directly with array offsets.

The source includes internal assertions for the expected dataset size of **118 elements / 1180 values**.

### `js/core/scene.js`

Owns access to the main 3D scene DOM hierarchy and centralizes element transform application.

Scene hierarchy:

```text
#scene
└── #scene-camera
    └── #scene-rotator
        └── #scene-content
            └── .element × 118
```

### `js/core/camera.js`

Maintains camera and rotation state, including:

- X/Y camera panning,
- Z zoom position,
- X/Y rotation,
- zoom limits,
- vertical rotation limits,
- animated reset behavior.

Camera state is rendered through CSS custom properties.

### `js/core/layouts.js`

Builds and caches the coordinate arrays used by the four supported layouts:

- Table
- Sphere
- Helix
- Grid

The module also validates that every generated layout contains the expected number of positions.

### `js/components/element-card.js`

Creates an individual element card and manages its long-press behavior.

The component also stores the element's current transform state so layout animations can update it without coupling the card to camera logic.

### `js/components/modal.js`

Handles the element detail modal, including opening, updating content, and closing the overlay.

### `js/components/menu.js`

Controls the hamburger menu, dropdown panel, backdrop, and close behavior.

### `js/features/language.js`

Contains translations for the supported UI strings and synchronizes:

- menu labels,
- layout names,
- helper text,
- modal labels,
- element names.

### `js/features/layout-switcher.js`

Coordinates selection of the active layout, animates element transforms with Anime.js, and resets the camera after a layout change.

### `js/features/interaction.js`

Handles mouse and touch interaction and converts user gestures into camera operations.

### `js/utils/helpers.js`

Contains shared constants and utility functions, including:

- long-press thresholds,
- layout dimensions,
- camera limits,
- interaction gains,
- animation timing,
- clamping,
- pinch-distance calculation,
- transform formatting,
- browser-language detection.

## Data Model

Each element record contains 10 fields in a fixed-size flat array record:

```javascript
[
    symbol,
    nameEN,
    nameID,
    category,
    column,
    row,
    mass,
    density,
    meltingPoint,
    boilingPoint
]
```

Example:

```javascript
[
    'Al',
    'Aluminium',
    'Aluminium',
    6,
    13,
    3,
    '26.981 u',
    '2.7 g/cm³',
    '660.32 °C',
    '2469.85 °C'
]
```

Access should normally be performed through:

```javascript
const element = getElement(index);
```

The returned object includes named properties and an `atomicNumber` derived from the zero-based index.

## Element Categories

The dataset uses numeric category identifiers for color classification:

| ID | Category |
|---:|---|
| 0 | Nonmetal |
| 1 | Noble Gas |
| 2 | Alkali Metal |
| 3 | Alkaline Earth |
| 4 | Metalloid |
| 5 | Halogen |
| 6 | Post-transition Metal |
| 7 | Transition Metal |
| 8 | Lanthanide |
| 9 | Actinide |

The visual category colors are defined in `css/variables.css` and referenced by the element cards and detail modal.

## 3D Layout Mathematics

The application does not use a dedicated 3D engine. Positions are calculated directly in JavaScript and rendered with CSS 3D transforms.

### Table Layout

The table layout uses each element's configured column and row values with centralized cell spacing constants.

### Sphere Layout

The sphere layout distributes the 118 elements using angular coordinates derived from the element index and the total number of elements.

### Helix Layout

The helix layout uses a configurable angular step, radius, and vertical step to create a spiral path.

### Grid Layout

The grid layout uses a 5 × 5 × 5 logical volume, providing enough positions for all 118 elements.

## Animation

**Anime.js 3.2.1** is used for:

- transitions between element layouts,
- camera reset animation.

Layout transitions use centralized timing constants defined in `js/utils/helpers.js`.

## Camera Constraints

Current camera configuration includes:

- default Z position: `-2600px`,
- minimum Z: `-6000px`,
- maximum Z: `-500px`,
- vertical rotation clamp: `-90°` to `90°`.

The camera state is updated through a requestAnimationFrame loop and written to CSS variables only when the state is marked dirty.

## Running the Project

The project does not require a package manager, backend server, or build tool.

### Option 1 — Open directly

Open `index.html` in a modern browser.

### Option 2 — Use a local HTTP server

Using a local server is recommended for a more predictable ES Module environment.

Example with Python:

```bash
python -m http.server 8000
```

Then open:

```text
http://localhost:8000
```

Run the command from the project root so that `index.html` and the `css/` and `js/` directories are served with their expected relative paths.

## Browser Requirements

The project is intended for modern browsers with support for:

- ES Modules,
- CSS 3D transforms,
- Pointer Events,
- Touch Events,
- `requestAnimationFrame`.

Exact browser-version support is not formally defined by the project.

## Interaction Model

### Long Press

Element details are intentionally opened through a long-press interaction rather than a normal click. The default threshold is:

```text
500 ms
```

The press is canceled when pointer movement exceeds the configured drift threshold.

### Menu Interaction

The navigation menu can be opened with the hamburger button and closed through:

- the close button,
- the backdrop,
- or automatic close behavior after selecting a language/layout.

## Accessibility Notes

The current implementation includes some basic semantic controls, such as buttons for the hamburger, close, and language controls. However, the overall experience is currently optimized primarily for direct visual interaction with the 3D scene.

Keyboard navigation, screen-reader semantics for all element cards, and a full accessibility audit are not currently implemented as a dedicated feature set.

## External Dependencies

The application references external resources from the following services:

- Google Fonts
- jsDelivr / Font Awesome
- cdnjs / Anime.js

Because these are loaded from CDNs, the application may require network access for all visual assets and the animation library to load normally.

## Development Guidelines

When extending the project, keep the existing separation of responsibilities:

- put element data in `data/`,
- put 3D state/math in `core/`,
- put reusable UI behavior in `components/`,
- put user-facing features in `features/`,
- put shared constants/utilities in `utils/`,
- keep `main.js` focused on application initialization.

Avoid moving unrelated concerns back into `index.html` or creating unnecessary global state.

For changes involving the 3D scene, test all four layouts after modification.

For changes involving element data, test representative elements from the beginning, middle, and end of the dataset.

For changes involving language handling, test both `EN` and `ID` and verify both element cards and the detail modal.

For changes involving input handling, test both mouse and touch interactions where applicable.

## Verification Checklist

Before considering a change complete, verify:

```text
[ ] Application starts without uncaught JavaScript errors
[ ] All 118 elements render
[ ] Table layout works
[ ] Sphere layout works
[ ] Helix layout works
[ ] Grid layout works
[ ] Layout animations work
[ ] Camera rotation works
[ ] Camera pan works
[ ] Camera zoom works
[ ] Long press opens the correct element
[ ] Element modal shows correct values
[ ] Modal closes correctly
[ ] English language works
[ ] Indonesian language works
[ ] Menu opens and closes correctly
[ ] Touch interaction works on supported devices
[ ] Responsive styling remains intact
[ ] No broken local imports or stylesheet paths
```

## Current Limitations

The current source does **not** include the following features:

- element search,
- category filtering UI,
- element comparison,
- quiz/learning mode,
- electron configuration visualization,
- hand tracking / webcam control,
- persistent application settings,
- backend/API integration,
- package-manager-based build pipeline,
- automated test suite.

These can be added later without changing the fundamental purpose of the application.

## Future Development Ideas

Potential next steps that fit the current architecture include:

1. **Search & focus** — search by symbol, name, or atomic number and automatically focus the selected element.
2. **Category filters** — isolate or highlight element categories.
3. **Expanded element explorer** — add richer chemical information to the existing modal.
4. **Property visualization** — recolor or visualize the table by density, atomic mass, melting point, or boiling point.
5. **Element comparison** — compare selected elements side by side.
6. **Learning / quiz mode** — turn the visualization into an interactive educational tool.
7. **Hand tracking** — optionally use webcam-based gestures as another interaction method for the 3D scene.
8. **Settings** — centralize language, visual, and interaction preferences.

## Project Status

**Application type:** Interactive front-end web application  
**Domain:** Chemistry / Education / Data Visualization  
**Architecture:** Modular client-side JavaScript  
**Rendering:** CSS 3D transforms  
**Data:** Embedded JavaScript dataset  
**Backend:** None  
**Build system:** None required

## License

No license is specified in the current project files.

Before publishing or distributing the project publicly, add an explicit license file such as `LICENSE` and update this section accordingly.

## Credits

This project uses the following third-party resources:

- [Anime.js](https://animejs.com/)
- [Font Awesome](https://fontawesome.com/)
- [Google Fonts](https://fonts.google.com/)

Their respective licenses and terms should be reviewed before redistribution.

---

**3D Periodic Table** — an interactive way to explore the periodic elements through 3D layouts and direct manipulation in the browser.
