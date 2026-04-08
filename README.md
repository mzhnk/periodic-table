
## ✨ Key Features

### 🧪 Complete Element Dataset
- **118 chemical elements** (Hydrogen → Oganesson)
- Each element stores **10 data fields** via the STRIDE-10 system:
  ```
  [symbol, nameEN, nameID, category, column, row, atomicMass, density, meltingPoint, boilingPoint]
  ```
- Dual language support: 🇬🇧 **English** / 🇮🇩 **Indonesian**
- Auto-detects browser language on load (`navigator.language`) — Indonesian users get `ID` by default

---

## 🎯 3D Layout System

Switch between **4 spatial representations**, all animated with staggered transitions:

| Layout | Icon | Algorithm |
|--------|------|-----------|
| **Table** | 📊 | Standard periodic table grid (col × row × spacing) |
| **Sphere** | 🌍 | Fibonacci sphere distribution |
| **Helix** | 🧬 | Logarithmic spiral structure |
| **Grid** | 🔲 | 3D layered 5×5×N grid |

### 🧮 Layout Math Details

**📊 Table**
```js
x = (col - 9.5) * 150
y = (row - 5.5) * 190
z = 0
```

**🌍 Sphere** — Fibonacci sphere (radius: 1100)
```js
phi   = acos(-1 + (2 * i) / total)
theta = sqrt(total * PI) * phi

x = radius * cos(theta) * sin(phi)
y = radius * cos(phi)
z = radius * sin(theta) * sin(phi)
// Each card also faces outward using atan2 rotation
```

**🧬 Helix** — Logarithmic spiral (radius: 1000)
```js
theta = i * 0.175 + PI

x = 1000 * sin(theta)
y = -(i * 10) + 500
z = 1000 * cos(theta)
ry = theta  // card faces tangent to spiral
```

**🔲 Grid** — 3D layered grid (5×5 per layer)
```js
x = (i % 5) * 400 - 800
y = -(floor(i / 5) % 5) * 400 + 800
z = floor(i / 25) * 1000 - 2000
```

---

## 🖱️ Interaction System

### Mouse Controls
| Action | Effect |
|--------|--------|
| Left drag | Rotate scene (rotX / rotY) |
| Right drag | Pan camera (camX / camY) |
| Scroll wheel | Zoom (camZ: `-500` → `-6000`) |
| Hold 0.5s on element | Open element detail modal |

### Touch Controls (Mobile-Optimized)
| Gesture | Effect |
|---------|--------|
| 1-finger drag | Rotate scene |
| 2-finger pinch | Zoom in/out |
| 2-finger drag | Pan camera |
| Long press 0.5s | Open element detail modal |

> Movement threshold of **5px** cancels long-press to prevent accidental modal triggers while rotating.

---

## 🎨 UI Design System

### Color Palette (CSS Variables)
```css
--bg:        #07080D   /* deep space background */
--surface:   #0D0F17   /* panel base */
--surface-2: #131622   /* secondary surfaces */
--surface-3: #1A1E2E   /* tertiary / toggle track */
--neon:      #00E0FF   /* primary neon accent */
--text:      #DDE3F0   /* primary text */
--text-2:    #6E7890   /* secondary/muted text */
```

### Element Category Colors (RGB format for alpha blending)
```css
--c-0: 255,  60,  60   /* Nonmetal       → Red      */
--c-1:  60, 255, 255   /* Noble Gas      → Cyan     */
--c-2: 255, 165,   0   /* Alkali Metal   → Orange   */
--c-3: 255, 220,   0   /* Alkaline Earth → Yellow   */
--c-4: 150, 255,  60   /* Metalloid      → Lime     */
--c-5:   0, 191, 255   /* Halogen        → Sky Blue */
--c-6: 255, 105, 180   /* Post-transition→ Pink     */
--c-7:  60, 200, 100   /* Transition     → Green    */
--c-8: 144, 238, 144   /* Lanthanide     → L. Green */
--c-9: 221, 160, 221   /* Actinide       → Plum     */
```
Colors are applied dynamically to: card borders, hover glow, and modal theme via `--modal-color`.

### Typography Stack
| Font | Usage |
|------|-------|
| `Share Tech Mono` | Element symbols and numbers (3D cards) |
| `Outfit` | UI panels, dropdown, modal content |
| `JetBrains Mono` | Section labels, language toggle |

### UI Components
- **Glassmorphism dropdown panel** — `backdrop-filter: blur(28px)` with neon top-border gradient
- **Animated hamburger button** — 3-bar icon with neon glow state when active
- **Language toggle pill** — sliding indicator with spring animation
- **Element detail modal** — glassmorphism overlay, category-colored theme, atomic data display
- **Helper text badge** — bottom-centered floating hint (language-reactive)
- **Backdrop overlay** — blurred dark scrim behind dropdown (click to dismiss)

---

## 🌍 Language Switching

Real-time UI translation — **no page reload**. Updates simultaneously:

| Target | EN | ID |
|--------|----|----|
| Layout labels | `LAYOUT`, `Table`, `Sphere`... | `TATA LETAK`, `Tabel`, `Bola`... |
| Language section label | `LANGUAGE` | `BAHASA` |
| Helper text | `HOLD 0.5s on element for details` | `TAHAN 0.5s di unsur untuk detail` |
| Modal property labels | `Atomic Mass`, `Density`... | `Massa Atom`, `Massa Jenis`... |
| All 118 element names (on cards) | English | Indonesian |

---

## 🧠 Technical Architecture

### 📦 Single-File System
```
index.html
├── <head>
│   ├── Google Fonts (Outfit, JetBrains Mono, Share Tech Mono)
│   ├── FontAwesome 7.2.0 (icon library)
│   └── Anime.js 3.2.1 (animation engine)
├── <style>   — Full CSS (UI system + 3D engine)
├── <body>    — HTML structure (hamburger, dropdown, scene, modal)
└── <script>  — All JS (data, logic, 3D engine, interactions)
```

### 🌐 3D Engine (Pure CSS + JS — No WebGL)
```
#scene                     [transform-style: preserve-3d]
 └── #scene-camera         [translate3d(camX, camY, camZ)]  ← zoom + pan
      └── #scene-rotator   [rotateX(rotX) rotateY(rotY)]    ← drag rotation
           └── #scene-content
                └── .element × 118   [translate3d(x, y, z) + rotateXYZ]
```

Camera state is driven by **CSS custom properties** updated via `requestAnimationFrame` with a dirty flag (`cameraNeedsUpdate`) to avoid unnecessary repaints.

```js
// Dirty-flag render loop (efficient)
function renderLoop() {
    if (cameraNeedsUpdate) {
        rootStyles.setProperty('--cam-x', `${camX}px`);
        // ...update other cam vars
        cameraNeedsUpdate = false;
    }
    requestAnimationFrame(renderLoop);
}
```

### ⚡ Animation Engine (Anime.js)
```js
anime({
    targets: elements.map(e => e.current),   // animates JS objects
    x: (el, i) => layouts[layout][i].x,      // per-element target
    y: ..., z: ..., rx: ..., ry: ..., rz: ...,
    duration: 2000,
    easing: 'easeOutCubic',
    delay: anime.stagger(12, { easing: 'easeOutQuad' }),  // stagger effect
    update: () => {
        // Manually apply transform to DOM each tick
        el.dom.style.transform = `translate3d(...) rotateY(...) rotateX(...)`;
    }
});
```

Camera reset on layout change uses a separate `anime()` call animating `camX/Y/Z` and `rotX/Y` back to origin over **1500ms**.

---

## 🧩 Data Structure (STRIDE-10 System)

All 118 elements are stored in a flat array. Each element occupies **10 consecutive slots**:

```
Index:  0         1          2         3     4    5     6           7            8              9
Data:  symbol   nameEN    nameID    cat   col  row  atomicMass  density    meltingPoint  boilingPoint
```

**Example — Hydrogen (index 0):**
```js
'H', 'Hydrogen', 'Hidrogen', 0, 1, 1,
'1.008 u', '0.089 g/l', '-259.16 °C', '-252.88 °C'
```

**Example — Gold (index 78):**
```js
'Au', 'Gold', 'Emas', 7, 11, 6,
'196.96 u', '19.3 g/cm³', '1064.18 °C', '2856 °C'
```

Access pattern:
```js
const STRIDE = 10;
const symbol   = elementsData[i * STRIDE + 0];
const nameEN   = elementsData[i * STRIDE + 1];
const category = elementsData[i * STRIDE + 3];
const mass     = elementsData[i * STRIDE + 6];
// ...etc
```

---

## 🚀 Getting Started

### Zero Installation
```bash
# Just open the file — no npm, no build step, no server required
open index.html
```

Or drag-and-drop `index.html` into any browser.

---

## 🌐 Deployment

### Vercel (Recommended)
1. Push `index.html` to a GitHub repository
2. Go to [vercel.com](https://vercel.com) → **Import Project**
3. Select your repo → Deploy instantly
4. Done — no config needed for single-file projects

### GitHub Pages
1. Push to a GitHub repo
2. Go to **Settings → Pages**
3. Set source to `main` branch → `/root`
4. Access at `https://your-username.github.io/repo-name`

### Netlify
Drop the file directly into [app.netlify.com/drop](https://app.netlify.com/drop) — instant deploy.

---

## 📱 Interaction Quick Reference

| Action | Desktop | Mobile |
|--------|---------|--------|
| Rotate scene | Left drag | 1-finger drag |
| Zoom | Scroll wheel | 2-finger pinch |
| Pan | Right drag | 2-finger drag |
| Element details | Hold 0.5s | Long press 0.5s |
| Change layout | Click menu → select | Tap menu → select |
| Switch language | Menu → EN / ID toggle | Menu → EN / ID toggle |

---

## 💡 Future Improvements

- 🔍 **Search & highlight** — find element by name, symbol, or atomic number
- 🎯 **Focus / fly-to** — smooth camera fly to a specific element
- 🧠 **Quiz mode** — interactive learning with flashcard-style questions
- 📊 **More properties** — electronegativity, electron configuration, discovery year
- 🧲 **Snap-to-layout** — lock camera angle to best view per layout
- 🎨 **Category filter** — toggle visibility by element group
- 🌙 **Light theme** — optional high-contrast mode

---

## 📦 Dependencies

All loaded via CDN — no local installation required:

| Library | Version | Purpose |
|---------|---------|---------|
| [Anime.js](https://animejs.com) | 3.2.1 | Layout transitions & camera animations |
| [FontAwesome](https://fontawesome.com) | 7.2.0 | UI icons (hand pointer, etc.) |
| [Google Fonts](https://fonts.google.com) | — | Outfit, JetBrains Mono, Share Tech Mono |

---

## 👨‍💻 Author

**Your Name**
- GitHub: [https://github.com/your-username](https://github.com/your-username)
- Live Demo: [https://your-project.vercel.app](https://your-project.vercel.app)

---

## ⭐ Support

If you found this project useful or cool, drop a ⭐ on GitHub — it helps a lot!
