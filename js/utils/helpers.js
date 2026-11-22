/**
 * Shared constants and small utilities used across the app.
 *
 * Distances are CSS pixels inside the 3D scene: cards are laid out on a
 * virtual plane and projected through the fixed `perspective` on <body>
 * (see css/main.css).
 */

/**
 * Duration a card must be pressed before its detail modal opens (ms).
 */
export const ELEMENT_HOLD_DURATION_MS = 500;

/**
 * Pointer travel tolerated inside a hold before it counts as a drag and
 * cancels the press. Generous on purpose: fingers are never perfectly
 * still, and an over-sensitive threshold makes cards feel unclickable.
 */
export const ELEMENT_HOLD_DRIFT_PX = 12;

/**
 * Pointer travel (from the press origin) before a press is treated as a
 * scene drag and the camera starts following it. Presses that start on an
 * element card stay passive until this threshold is crossed.
 */
export const SCENE_DRAG_THRESHOLD_PX = 10;

/* Table layout: card pitch and the grid centre used to center the table. */
export const TABLE_CELL_W = 150;
export const TABLE_CELL_H = 190;
export const TABLE_CENTER_COL = 9.5; /* 18 columns */
export const TABLE_CENTER_ROW = 5.5; /* 7 main rows, plus f-block rows below */

/* Sphere layout. */
export const SPHERE_RADIUS = 1100;

/* Helix layout. */
export const HELIX_RADIUS = 1000;
export const HELIX_THETA_STEP = 0.175;      /* radians between elements */
export const HELIX_THETA_OFFSET = Math.PI;
export const HELIX_Y_STEP = -10;            /* vertical travel per element */
export const HELIX_Y_OFFSET = 500;

/* Grid layout: 5 x 5 cells per slice, 1000px apart in depth. */
export const GRID_COLS = 5;
export const GRID_ROWS = 5;
export const GRID_STEP_XY = 400;
export const GRID_STEP_Z = 1000;
export const GRID_OFFSET_X = -800;
export const GRID_OFFSET_Y = 800;
export const GRID_OFFSET_Z = -2000;

/*
 * Horizontal layouts (rings, vortex, torus) are built flat on the XZ plane
 * and then rotated toward the camera so their shape reads from the default
 * straight-on view. Each gets its own elevation: the ring staircase needs a
 * shallow angle to keep its tiers from crossing, while the vortex cone and
 * the torus carry enough depth on their own.
 */
export const RINGS_TILT  = 0.32;
export const VORTEX_TILT = 0.42;
export const TORUS_TILT  = 0.58;

/* Rings layout: one concentric ring per period (rows 1-7), the f-block
   series on the two outermost rings. Radii staircase outward while the
   ring levels step down; the 200px level pitch is what keeps consecutive
   tiers — front and back arcs alike — from stacking onto each other. */
export const RINGS_R_BASE = 230;
export const RINGS_R_STEP = 95;
export const RINGS_Y_STEP = 200;
export const RINGS_Y_CENTER = 4;   /* ring index placed at mid-height */

/* Cylinder layout: the 18 group columns wrap around the vertical axis,
   rows stack upward; the f-block rows sit below the main body. */
export const CYL_RADIUS = 460;
export const CYL_COL_STEP = (2 * Math.PI) / 18;
export const CYL_COL_CENTER = 9.5;
export const CYL_ROW_STEP = 190;
export const CYL_ROW_CENTER = 4;
export const CYL_FBLOCK_SHIFT = 1.4; /* rows 9-10 tuck just under row 7 */

/* Wave layout: table positions with a travelling sine offset in depth,
   cards kept front-facing so every element stays fully readable. */
export const WAVE_AMP = 260;
export const WAVE_FREQ_X = 0.6;
export const WAVE_FREQ_ROW = 0.5;

/* DNA layout: two intertwined strands, odd and even atomic numbers on
   opposite sides of each rung, climbing like the existing helix. */
export const DNA_RADIUS = 650;
export const DNA_THETA_STEP = 0.42; /* radians advanced per rung */
export const DNA_Y_STEP = 11;
export const DNA_Y_OFFSET = 500;

/* Vortex layout: Archimedean spiral with exactly one turn per period
   (the f-block series pulled out onto two rings at the bottom), rising
   gently so the whole shape reads as a cone. The 150px rise per turn keeps
   consecutive turns — and the noble-gas/alkali cascades that share a ray —
   a full card-height apart once tilted. */
export const VORTEX_R0 = 520;
export const VORTEX_GROWTH = 95;   /* radius added per full turn */
export const VORTEX_Y_RISE = 150;  /* vertical travel per full turn */
export const VORTEX_HOLE_R = 360;
export const VORTEX_Y_LAN = 960;
export const VORTEX_Y_ACT = 770;

/* Torus layout: the 18 groups wrap around the tube so group 1 and 18
   meet through the seam, the 7 periods ride the tube cross-section, and
   the f-block series forms two stacked rings inside the hole. A thin tube
   against a wide ring keeps the donut silhouette and its hole readable
   from the default elevated view. */
export const TORUS_R = 900;
export const TORUS_TUBE_R = 220;
export const TORUS_COL_STEP = (2 * Math.PI) / 18;
export const TORUS_ROW_STEP = (2 * Math.PI) / 7;
export const TORUS_HOLE_R = 560;
export const TORUS_HOLE_GAP_Y = 80;

/*
 * How strongly torus cards follow the tube curvature. A full surface
 * alignment (1.0) would pitch period 1 to face straight up and the
 * bottom rows past 60 degrees from the camera, so the pitch is scaled
 * down: cards lean enough to read as a donut while staying near the
 * viewer for readability and clicks.
 */
export const TORUS_SURFACE_PITCH = 0.42;

/*
 * Camera rig: the scene plane sits at z = 0 and the camera node is
 * translated along -Z, so more negative means further away. All mutators
 * clamp camZ into [CAMERA_MIN_Z, CAMERA_MAX_Z].
 */
export const CAMERA_DEFAULT_Z = -2600;
export const CAMERA_MIN_Z = -6000;
export const CAMERA_MAX_Z = -500;

/* Rotation clamps (degrees) for the scene rotator's X axis. */
export const ROTATION_MIN_X = -90;
export const ROTATION_MAX_X = 90;

/* Input gains: pointer pixels to camera/rotation deltas. */
export const MOUSE_ROTATE_GAIN = 0.3;
export const MOUSE_PAN_GAIN = 2.5;
export const WHEEL_ZOOM_GAIN = 2.0;
export const TOUCH_ROTATE_GAIN = 0.4;
export const TOUCH_PAN_GAIN = 2.5;
export const TOUCH_PINCH_GAIN = 5.0;

/* Layout transition and camera-reset animation timings (Anime.js). */
export const ANIME_LAYOUT_DURATION_MS = 2000;
export const ANIME_LAYOUT_STAGGER_MS = 12;
export const ANIME_CAMERA_RESET_MS = 1500;

/* Trimmed transition timings for touch-first devices: the same 118-card
   choreography completes in noticeably fewer painted frames, which keeps
   layout switches smooth on mobile GPUs. */
export const ANIME_LAYOUT_DURATION_TOUCH_MS = 1200;
export const ANIME_LAYOUT_STAGGER_TOUCH_MS = 7;

/* Media query matching touch-first devices (phones/tablets): no hover
   pointer and coarse touch input. Shared by every feature that needs to
   branch on input style so the detection stays consistent. */
const TOUCH_QUERY = '(hover: none) and (pointer: coarse)';

/**
 * True on touch-first devices (phones/tablets), false on desktops and
 * anything that reports no pointer capabilities at all.
 *
 * @returns {boolean}
 */
export function isTouchDevice() {
    return window.matchMedia(TOUCH_QUERY).matches;
}

/* Layout selected on boot. */
export const INITIAL_LAYOUT = 'table';

/**
 * Distance between the first two touch points, used by pinch-zoom.
 * Returns 0 when fewer than two touches are present.
 *
 * @param {TouchList} touches
 * @returns {number}
 */
export function pinchDistance(touches) {
    if (!touches || touches.length < 2) return 0;
    return Math.hypot(
        touches[0].clientX - touches[1].clientX,
        touches[0].clientY - touches[1].clientY
    );
}

/**
 * Build the CSS transform for an element card from its 3D state.
 * Centralized here so every writer produces an identical transform string.
 *
 * @param {{x:number,y:number,z:number,rx:number,ry:number,rz:number}} state
 * @returns {string}
 */
export function formatElementTransform(state) {
    return `translate3d(${state.x}px, ${state.y}px, ${state.z}px) ` +
           `rotateY(${state.ry}rad) ` +
           `rotateX(${state.rx}rad) ` +
           `rotateZ(${state.rz}rad)`;
}

/**
 * Pick the initial UI language from the browser locale: Indonesian
 * language/region tags get 'ID', everything else falls back to 'EN'.
 *
 * @returns {('EN'|'ID')}
 */
export function detectUserLanguage() {
    const [lang, region] = (navigator.language || 'en').toLowerCase().split('-');
    return (lang === 'id' || region === 'id') ? 'ID' : 'EN';
}
