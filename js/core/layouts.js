/**
 * Layout targets: a position/rotation triplet for every element card, one
 * builder per layout. Each builder returns a fresh array of
 * `{x, y, z, rx, ry, rz}` entries indexed like the dataset (0..117), and
 * results are cached after first use since the dataset is static.
 *
 * Rotations are in radians and match the transform order used by
 * formatElementTransform() (translate3d, rotateY, rotateX, rotateZ).
 */

import { getElement, TOTAL_ELEMENTS } from '../data/elements.js';
import {
    TABLE_CELL_W, TABLE_CELL_H, TABLE_CENTER_COL, TABLE_CENTER_ROW,
    SPHERE_RADIUS,
    HELIX_RADIUS, HELIX_THETA_STEP, HELIX_THETA_OFFSET, HELIX_Y_STEP, HELIX_Y_OFFSET,
    GRID_COLS, GRID_ROWS, GRID_STEP_XY, GRID_STEP_Z,
    GRID_OFFSET_X, GRID_OFFSET_Y, GRID_OFFSET_Z
} from '../utils/helpers.js';

export const LAYOUT_TABLE  = 'table';
export const LAYOUT_SPHERE = 'sphere';
export const LAYOUT_HELIX  = 'helix';
export const LAYOUT_GRID   = 'grid';

export const LAYOUT_NAMES = [LAYOUT_TABLE, LAYOUT_SPHERE, LAYOUT_HELIX, LAYOUT_GRID];

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

/**
 * Layout target array for a layout name.
 *
 * @param {string} name one of the LAYOUT_* constants
 * @returns {Array<{x:number,y:number,z:number,rx:number,ry:number,rz:number}>}
 * @throws {Error} for an unknown layout name.
 */
export function getLayout(name) {
    switch (name) {
        case LAYOUT_TABLE:  return getTableLayout();
        case LAYOUT_SPHERE: return getSphereLayout();
        case LAYOUT_HELIX:  return getHelixLayout();
        case LAYOUT_GRID:   return getGridLayout();
        default:
            throw new Error(`Unknown layout: ${name} (expected one of: ${LAYOUT_NAMES.join(', ')})`);
    }
}
