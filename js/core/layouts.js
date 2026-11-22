/**
 * Layout targets: a position/rotation triplet for every element card, one
 * builder per layout. Each builder returns a fresh array of
 * `{x, y, z, rx, ry, rz}` entries indexed like the dataset (0..117), and
 * results are cached after first use since the dataset is static.
 *
 * Rotations are in radians and match the transform order used by
 * formatElementTransform() (translate3d, rotateY, rotateX, rotateZ).
 *
 * Shared conventions:
 * - A card placed at (R sin a, y, R cos a) with ry = a faces away from the
 *   vertical Y axis; horizontal shapes are therefore described with the
 *   angle measured from +Z (toward the default camera).
 * - Rings, vortex, and torus are built flat on the XZ plane and rotated
 *   toward the camera by HORIZONTAL_TILT as a rigid transform, so their
 *   silhouette reads from the default straight-on view.
 * - surfaceAngles() derives (rx, ry) from a surface normal using the same
 *   scheme as the sphere layout, keeping tilted surfaces uniformly readable.
 */

import { getElement, TOTAL_ELEMENTS } from '../data/elements.js';
import {
    TABLE_CELL_W, TABLE_CELL_H, TABLE_CENTER_COL, TABLE_CENTER_ROW,
    SPHERE_RADIUS,
    HELIX_RADIUS, HELIX_THETA_STEP, HELIX_THETA_OFFSET, HELIX_Y_STEP, HELIX_Y_OFFSET,
    GRID_COLS, GRID_ROWS, GRID_STEP_XY, GRID_STEP_Z,
    GRID_OFFSET_X, GRID_OFFSET_Y, GRID_OFFSET_Z,
    RINGS_TILT, VORTEX_TILT, TORUS_TILT,
    RINGS_R_BASE, RINGS_R_STEP, RINGS_Y_STEP, RINGS_Y_CENTER,
    CYL_RADIUS, CYL_COL_STEP, CYL_COL_CENTER, CYL_ROW_STEP, CYL_ROW_CENTER, CYL_FBLOCK_SHIFT,
    WAVE_AMP, WAVE_FREQ_X, WAVE_FREQ_ROW,
    DNA_RADIUS, DNA_THETA_STEP, DNA_Y_STEP, DNA_Y_OFFSET,
    VORTEX_R0, VORTEX_GROWTH, VORTEX_Y_RISE, VORTEX_HOLE_R, VORTEX_Y_LAN, VORTEX_Y_ACT,
    TORUS_R, TORUS_TUBE_R, TORUS_COL_STEP, TORUS_ROW_STEP, TORUS_HOLE_R, TORUS_HOLE_GAP_Y,
    TORUS_SURFACE_PITCH
} from '../utils/helpers.js';

export const LAYOUT_TABLE    = 'table';
export const LAYOUT_SPHERE   = 'sphere';
export const LAYOUT_HELIX    = 'helix';
export const LAYOUT_GRID     = 'grid';
export const LAYOUT_RINGS    = 'rings';
export const LAYOUT_CYLINDER = 'cylinder';
export const LAYOUT_WAVE     = 'wave';
export const LAYOUT_DNA      = 'dna';
export const LAYOUT_VORTEX   = 'vortex';
export const LAYOUT_TORUS    = 'torus';

export const LAYOUT_NAMES = [
    LAYOUT_TABLE, LAYOUT_SPHERE, LAYOUT_HELIX, LAYOUT_GRID,
    LAYOUT_RINGS, LAYOUT_CYLINDER, LAYOUT_WAVE, LAYOUT_DNA,
    LAYOUT_VORTEX, LAYOUT_TORUS
];

/* Category indices of the two f-block series (see elements.js). */
const CATEGORY_LANTHANIDE = 8;
const CATEGORY_ACTINIDE   = 9;

/* Flat periodic table, centered on the origin. */
function buildTableLayout() {
    const out = new Array(TOTAL_ELEMENTS);
    for (let i = 0; i < TOTAL_ELEMENTS; i++) {
        const el = getElement(i);
        out[i] = {
            x: (el.column - TABLE_CENTER_COL) * TABLE_CELL_W,
            y: (el.row    - TABLE_CENTER_ROW) * TABLE_CELL_H,
            z: 0,
            rx: 0, ry: 0, rz: 0
        };
    }
    return out;
}

/* Fibonacci-sphere distribution (same spacing scheme as the classic
   CSS3D demo): cards face outward from the centre. */
function buildSphereLayout() {
    const out = new Array(TOTAL_ELEMENTS);
    for (let i = 0; i < TOTAL_ELEMENTS; i++) {
        const phi   = Math.acos(-1 + (2 * i) / TOTAL_ELEMENTS);
        const theta = Math.sqrt(TOTAL_ELEMENTS * Math.PI) * phi;

        const sx = SPHERE_RADIUS * Math.cos(theta) * Math.sin(phi);
        const sy = SPHERE_RADIUS * Math.cos(phi);
        const sz = SPHERE_RADIUS * Math.sin(theta) * Math.sin(phi);

        const rx = Math.atan2(-sy, Math.sqrt(sx * sx + sz * sz));
        const ry = Math.atan2(sx, sz);

        out[i] = { x: sx, y: sy, z: sz, rx, ry, rz: 0 };
    }
    return out;
}

/* Vertical spiral: cards climb while circling the Y axis, facing outward. */
function buildHelixLayout() {
    const out = new Array(TOTAL_ELEMENTS);
    for (let i = 0; i < TOTAL_ELEMENTS; i++) {
        const theta = i * HELIX_THETA_STEP + HELIX_THETA_OFFSET;
        out[i] = {
            x:  HELIX_RADIUS * Math.sin(theta),
            y:  (i * HELIX_Y_STEP) + HELIX_Y_OFFSET,
            z:  HELIX_RADIUS * Math.cos(theta),
            rx: 0,
            ry: theta,
            rz: 0
        };
    }
    return out;
}

/* Stacked 5 x 5 slices receding along -Z. */
function buildGridLayout() {
    const out = new Array(TOTAL_ELEMENTS);
    for (let i = 0; i < TOTAL_ELEMENTS; i++) {
        const col      = i % GRID_COLS;
        const rowLayer = Math.floor(i / GRID_COLS) % GRID_ROWS;
        const depthIdx = Math.floor(i / (GRID_COLS * GRID_ROWS));

        out[i] = {
            x:  (col * GRID_STEP_XY) + GRID_OFFSET_X,
            y:  (-rowLayer * GRID_STEP_XY) + GRID_OFFSET_Y,
            z:  (depthIdx * GRID_STEP_Z) + GRID_OFFSET_Z,
            rx: 0, ry: 0, rz: 0
        };
    }
    return out;
}

/* Rotate a point around the X axis. Negating the tilt angle raises the far
   edge and drops the near edge, i.e. the shape is viewed from above. */
function tiltX(point, angle) {
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    return {
        x: point.x,
        y: (point.y * cos) - (point.z * sin),
        z: (point.y * sin) + (point.z * cos)
    };
}

/* Ring membership: periods 1-7 fill rings 0-6, the lanthanide and
   actinide series (including their row members) occupy rings 7-8. */
function ringIndexOf(el) {
    if (el.category === CATEGORY_LANTHANIDE) return 7;
    if (el.category === CATEGORY_ACTINIDE)   return 8;
    return el.row - 1;
}

/* Concentric rings: one per period, staircased downward like a tilted
   wedding cake. Cards stand upright and face away from the axis, so the
   front of every ring stays readable while the tilt supplies depth. */
function buildRingsLayout() {
    const members = new Array(9);
    for (let r = 0; r < 9; r++) members[r] = [];

    for (let i = 0; i < TOTAL_ELEMENTS; i++) {
        members[ringIndexOf(getElement(i))].push(i);
    }

    const out = new Array(TOTAL_ELEMENTS);
    for (let ring = 0; ring < 9; ring++) {
        const count = members[ring].length;
        const radius = RINGS_R_BASE + (ring * RINGS_R_STEP);
        const level = (ring - RINGS_Y_CENTER) * RINGS_Y_STEP;

        members[ring].forEach((index, k) => {
            const theta = (k / count) * (2 * Math.PI);
            const flat = {
                x: radius * Math.sin(theta),
                y: level,
                z: radius * Math.cos(theta)
            };
            const pos = tiltX(flat, -RINGS_TILT);
            out[index] = { x: pos.x, y: pos.y, z: pos.z, rx: 0, ry: theta, rz: 0 };
        });
    }
    return out;
}

/* Cylinder: the 18 group columns wrap around the vertical axis (group 1
   and 18 meet through the seam), each period a horizontal band. Cards
   face outward; the f-block bands tuck just below period 7. */
function buildCylinderLayout() {
    const out = new Array(TOTAL_ELEMENTS);
    for (let i = 0; i < TOTAL_ELEMENTS; i++) {
        const el = getElement(i);
        const theta = (el.column - CYL_COL_CENTER) * CYL_COL_STEP;
        const row = el.row <= 7 ? el.row : el.row - CYL_FBLOCK_SHIFT;

        out[i] = {
            x:  CYL_RADIUS * Math.sin(theta),
            y:  (row - CYL_ROW_CENTER) * CYL_ROW_STEP,
            z:  CYL_RADIUS * Math.cos(theta),
            rx: 0,
            ry: theta,
            rz: 0
        };
    }
    return out;
}

/* Wave: the flat table with a travelling sine offset in depth, so the
   sheet ripples toward and away from the camera. Cards stay front-facing
   (no rotations), keeping every element readable and clickable. */
function buildWaveLayout() {
    const out = new Array(TOTAL_ELEMENTS);
    for (let i = 0; i < TOTAL_ELEMENTS; i++) {
        const el = getElement(i);
        out[i] = {
            x:  (el.column - TABLE_CENTER_COL) * TABLE_CELL_W,
            y:  (el.row - TABLE_CENTER_ROW) * TABLE_CELL_H,
            z:  WAVE_AMP * Math.sin((el.column * WAVE_FREQ_X) + (el.row * WAVE_FREQ_ROW)),
            rx: 0, ry: 0, rz: 0
        };
    }
    return out;
}

/* DNA: two intertwined strands. Odd and even atomic numbers alternate
   between the strands, so every rung pairs one element per side, and the
   double spiral climbs exactly like the single helix layout. */
function buildDnaLayout() {
    const out = new Array(TOTAL_ELEMENTS);
    for (let i = 0; i < TOTAL_ELEMENTS; i++) {
        const strand = i % 2;
        const rung   = Math.floor(i / 2);
        const theta  = (rung * DNA_THETA_STEP) + (strand * Math.PI);

        out[i] = {
            x:  DNA_RADIUS * Math.sin(theta),
            y:  DNA_Y_OFFSET - (i * DNA_Y_STEP),
            z:  DNA_RADIUS * Math.cos(theta),
            rx: 0,
            ry: theta,
            rz: 0
        };
    }
    return out;
}

/* Vortex: an Archimedean spiral with exactly one full turn per period —
   alkali metals open each turn on the inside, noble gases close it on the
   outside — rising gently into a cone. The f-block series sits on two
   stacked rings at the bottom, inside the first turn. */
function buildVortexLayout() {
    const out = new Array(TOTAL_ELEMENTS);

    /* One pass to count the elements of each period on the main spiral. */
    const perPeriod = new Array(8).fill(0);
    for (let i = 0; i < TOTAL_ELEMENTS; i++) {
        const el = getElement(i);
        if (el.category !== CATEGORY_LANTHANIDE && el.category !== CATEGORY_ACTINIDE) {
            perPeriod[el.row]++;
        }
    }

    /* Running placement index per f-block series. */
    const holeSeen = { [CATEGORY_LANTHANIDE]: 0, [CATEGORY_ACTINIDE]: 0 };
    const seen = new Array(8).fill(0);

    for (let i = 0; i < TOTAL_ELEMENTS; i++) {
        const el = getElement(i);
        const lan = el.category === CATEGORY_LANTHANIDE;
        const act = el.category === CATEGORY_ACTINIDE;

        if (lan || act) {
            /* f-block: two rings below the cone opening, staggered half a
               slot so the two series never align radially. */
            const k = holeSeen[el.category]++;
            const theta = (k / 15) * (2 * Math.PI) + (lan ? 0 : Math.PI / 15);
            const level = lan ? VORTEX_Y_LAN : VORTEX_Y_ACT;
            const flat = {
                x: VORTEX_HOLE_R * Math.sin(theta),
                y: level,
                z: VORTEX_HOLE_R * Math.cos(theta)
            };
            const pos = tiltX(flat, -VORTEX_TILT);
            out[i] = { x: pos.x, y: pos.y, z: pos.z, rx: 0, ry: theta, rz: 0 };
            continue;
        }

        const period = el.row;
        const frac = (seen[period] + 0.5) / perPeriod[period];
        seen[period]++;

        const turns = (period - 1) + frac;
        const theta = turns * (2 * Math.PI);
        const radius = VORTEX_R0 + (VORTEX_GROWTH * turns);
        const flat = {
            x: radius * Math.sin(theta),
            y: (3.5 - turns) * VORTEX_Y_RISE,
            z: radius * Math.cos(theta)
        };
        const pos = tiltX(flat, -VORTEX_TILT);
        out[i] = { x: pos.x, y: pos.y, z: pos.z, rx: 0, ry: theta, rz: 0 };
    }
    return out;
}

/* Torus: the main table wraps around the tube (groups along the tube
   circle so group 1 and 18 meet through the seam, periods around the
   cross-section with period 1 crowning the top), and the f-block series
   rides as two stacked rings inside the hole.

   Cards lean with the tube surface (TORUS_SURFACE_PITCH scales the tube's
   own normal) so the donut silhouette reads in three dimensions: period 1
   tilts back at the crown, the bottom rows pitch forward, and the
   cross-section fans out instead of stacking flat onto itself. The inner
   half of the tube is flipped outward first, so no near-side card ever
   shows its back. Both positions and orientation normals share the same
   rigid tilt, keeping cards seated on the surface they belong to. */
function buildTorusLayout() {
    const out = new Array(TOTAL_ELEMENTS);
    const holeSeen = { [CATEGORY_LANTHANIDE]: 0, [CATEGORY_ACTINIDE]: 0 };

    for (let i = 0; i < TOTAL_ELEMENTS; i++) {
        const el = getElement(i);
        let flat, normal;

        if (el.category === CATEGORY_LANTHANIDE || el.category === CATEGORY_ACTINIDE) {
            const lan = el.category === CATEGORY_LANTHANIDE;
            const k = holeSeen[el.category]++;
            const theta = (k / 15) * (2 * Math.PI) + (lan ? 0 : Math.PI / 15);
            const level = lan ? -TORUS_HOLE_GAP_Y : TORUS_HOLE_GAP_Y;

            flat = {
                x: TORUS_HOLE_R * Math.sin(theta),
                y: level,
                z: TORUS_HOLE_R * Math.cos(theta)
            };
            /* Stand upright on the hole ring, leaning with the shape tilt
               like the rest of the donut. */
            normal = { x: Math.sin(theta), y: 0, z: Math.cos(theta) };
        } else {
            const theta = (el.column - 9.5) * TORUS_COL_STEP;
            const phi = ((el.row - 1) * TORUS_ROW_STEP) - (Math.PI / 2);

            /* Mirror the cross-section angle of inner-surface rows so
               their pitch faces outward instead of through the tube. */
            const phiSurface = Math.cos(phi) >= 0 ? phi : Math.PI - phi;
            const pitch = -phiSurface * TORUS_SURFACE_PITCH;

            const tube = TORUS_R + (TORUS_TUBE_R * Math.cos(phi));
            flat = {
                x: tube * Math.sin(theta),
                y: TORUS_TUBE_R * Math.sin(phi),
                z: tube * Math.cos(theta)
            };
            normal = {
                x: Math.cos(pitch) * Math.sin(theta),
                y: -Math.sin(pitch),
                z: Math.cos(pitch) * Math.cos(theta)
            };
        }

        const pos = tiltX(flat, -TORUS_TILT);
        const dir = tiltX(normal, -TORUS_TILT);
        out[i] = {
            x: pos.x,
            y: pos.y,
            z: pos.z,
            rx: Math.atan2(-dir.y, Math.hypot(dir.x, dir.z)),
            ry: Math.atan2(dir.x, dir.z),
            rz: 0
        };
    }
    return out;
}

let cached = {};

/** @returns {Array<{x:number,y:number,z:number,rx:number,ry:number,rz:number}>} */
export function getTableLayout() {
    return (cached.table ??= buildTableLayout());
}

/** @returns {Array<{x:number,y:number,z:number,rx:number,ry:number,rz:number}>} */
export function getSphereLayout() {
    return (cached.sphere ??= buildSphereLayout());
}

/** @returns {Array<{x:number,y:number,z:number,rx:number,ry:number,rz:number}>} */
export function getHelixLayout() {
    return (cached.helix ??= buildHelixLayout());
}

/** @returns {Array<{x:number,y:number,z:number,rx:number,ry:number,rz:number}>} */
export function getGridLayout() {
    return (cached.grid ??= buildGridLayout());
}

/** @returns {Array<{x:number,y:number,z:number,rx:number,ry:number,rz:number}>} */
export function getRingsLayout() {
    return (cached.rings ??= buildRingsLayout());
}

/** @returns {Array<{x:number,y:number,z:number,rx:number,ry:number,rz:number}>} */
export function getCylinderLayout() {
    return (cached.cylinder ??= buildCylinderLayout());
}

/** @returns {Array<{x:number,y:number,z:number,rx:number,ry:number,rz:number}>} */
export function getWaveLayout() {
    return (cached.wave ??= buildWaveLayout());
}

/** @returns {Array<{x:number,y:number,z:number,rx:number,ry:number,rz:number}>} */
export function getDnaLayout() {
    return (cached.dna ??= buildDnaLayout());
}

/** @returns {Array<{x:number,y:number,z:number,rx:number,ry:number,rz:number}>} */
export function getVortexLayout() {
    return (cached.vortex ??= buildVortexLayout());
}

/** @returns {Array<{x:number,y:number,z:number,rx:number,ry:number,rz:number}>} */
export function getTorusLayout() {
    return (cached.torus ??= buildTorusLayout());
}

/**
 * Layout target array for a layout name.
 *
 * @param {string} name one of the LAYOUT_* constants
 * @returns {Array<{x:number,y:number,z:number,rx:number,ry:number,rz:number}>}
 * @throws {Error} for an unknown layout name.
 */
export function getLayout(name) {
    switch (name) {
        case LAYOUT_TABLE:    return getTableLayout();
        case LAYOUT_SPHERE:   return getSphereLayout();
        case LAYOUT_HELIX:    return getHelixLayout();
        case LAYOUT_GRID:     return getGridLayout();
        case LAYOUT_RINGS:    return getRingsLayout();
        case LAYOUT_CYLINDER: return getCylinderLayout();
        case LAYOUT_WAVE:     return getWaveLayout();
        case LAYOUT_DNA:      return getDnaLayout();
        case LAYOUT_VORTEX:   return getVortexLayout();
        case LAYOUT_TORUS:    return getTorusLayout();
        default:
            throw new Error(`Unknown layout: ${name} (expected one of: ${LAYOUT_NAMES.join(', ')})`);
    }
}
