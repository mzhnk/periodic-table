/**
 * Scene DOM access and element card transforms.
 *
 * #scene is a zero-size box anchored at the viewport centre carrying the
 * whole camera transform (see css/periodic-table.css and js/core/camera.js).
 * Element cards are appended to it as direct children and positioned with
 * inline transforms built from their current state object.
 */

import { formatElementTransform } from '../utils/helpers.js';

const SCENE_SELECTOR = '#scene';

let sceneNode = null;

/**
 * Resolve (and cache) the scene container node.
 *
 * @returns {HTMLElement}
 * @throws {Error} when the node is missing from the document.
 */
export function getScene() {
    if (sceneNode) return sceneNode;

    const scene = document.querySelector(SCENE_SELECTOR);
    if (!scene) {
        throw new Error('scene.js: missing #scene container');
    }

    sceneNode = scene;
    return sceneNode;
}

/**
 * Append an element card to the scene container.
 *
 * @param {HTMLElement} elementDom
 */
export function mountElement(elementDom) {
    getScene().appendChild(elementDom);
}

/**
 * Write an element card's inline transform from its current 3D state.
 *
 * @param {HTMLElement} dom
 * @param {{x:number,y:number,z:number,rx:number,ry:number,rz:number}} state
 */
export function applyElementTransform(dom, state) {
    dom.style.transform = formatElementTransform(state);
}
