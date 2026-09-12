import { getElement, TOTAL_ELEMENTS } from '../data/elements.js';
import {
    TABLE_CELL_W, TABLE_CELL_H, TABLE_CENTER_COL, TABLE_CENTER_ROW,
    SPHERE_RADIUS,
    HELIX_RADIUS, HELIX_THETA_STEP, HELIX_THETA_OFFSET, HELIX_Y_STEP, HELIX_Y_OFFSET,
    GRID_COLS, GRID_ROWS, GRID_DEPTH_SLICES, GRID_STEP_XY, GRID_STEP_Z,
    GRID_OFFSET_X, GRID_OFFSET_Y, GRID_OFFSET_Z
} from '../utils/helpers.js';

export const LAYOUT_TABLE  = 'table';
export const LAYOUT_SPHERE = 'sphere';
export const LAYOUT_HELIX  = 'helix';
export const LAYOUT_GRID   = 'grid';

export const LAYOUT_NAMES = [LAYOUT_TABLE, LAYOUT_SPHERE, LAYOUT_HELIX, LAYOUT_GRID];

function buildTableLayout() {
    const out = new Array(TOTAL_ELEMENTS);
    for (let i = 0; i < TOTAL_ELEMENTS; i++) {
        const el = getElement(i);
        out[i] = {
            x:  (el.column - TABLE_CENTER_COL) * TABLE_CELL_W,
            y:  (el.row    - TABLE_CENTER_ROW) * TABLE_CELL_H,
            z:  0,
            rx: 0, ry: 0, rz: 0
        };
    }
    return out;
}

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

/* --- Helix layout --- */
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

/* --- Grid layout --- */
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

let _table  = null;
let _sphere = null;
let _helix  = null;
let _grid   = null;

/** @returns {Array} the table layout */
export function getTableLayout() {
    return _table ??= buildTableLayout();
}

/** @returns {Array} the sphere layout */
export function getSphereLayout() {
    return _sphere ??= buildSphereLayout();
}

/** @returns {Array} the helix layout */
export function getHelixLayout() {
    return _helix ??= buildHelixLayout();
}

/** @returns {Array} the grid layout */
export function getGridLayout() {
    return _grid ??= buildGridLayout();
}

/**
 * Get the layout array for a given name.
 * @param {string} name  one of LAYOUT_TABLE / LAYOUT_SPHERE / LAYOUT_HELIX / LAYOUT_GRID
 */
export function getLayout(name) {
    switch (name) {
        case LAYOUT_TABLE:  return getTableLayout();
        case LAYOUT_SPHERE: return getSphereLayout();
        case LAYOUT_HELIX:  return getHelixLayout();
        case LAYOUT_GRID:   return getGridLayout();
        default:
            throw new Error(`Unknown layout: ${name}. Valid: ${LAYOUT_NAMES.join(', ')}`);
    }
}

/* One-shot validation at module load */
console.assert(getTableLayout().length  === TOTAL_ELEMENTS, `[layouts.js] table length != ${TOTAL_ELEMENTS}`);
console.assert(getSphereLayout().length === TOTAL_ELEMENTS, `[layouts.js] sphere length != ${TOTAL_ELEMENTS}`);
console.assert(getHelixLayout().length  === TOTAL_ELEMENTS, `[layouts.js] helix length != ${TOTAL_ELEMENTS}`);
console.assert(getGridLayout().length   === TOTAL_ELEMENTS, `[layouts.js] grid length != ${TOTAL_ELEMENTS}`);