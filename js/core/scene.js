import { formatElementTransform } from '../utils/helpers.js';

const SELECTORS = Object.freeze({
    scene:    '#scene',
    camera:   '#scene-camera',
    rotator:  '#scene-rotator',
    content:  '#scene-content'
});

/**
 * @typedef {Object} SceneRefs
 * @property {HTMLElement} scene
 * @property {HTMLElement} camera
 * @property {HTMLElement} rotator
 * @property {HTMLElement} content
 */

/**
 * @returns {SceneRefs}
 */
export function getSceneRefs() {
    const scene   = document.querySelector(SELECTORS.scene);
    const camera  = document.querySelector(SELECTORS.camera);
    const rotator = document.querySelector(SELECTORS.rotator);
    const content = document.querySelector(SELECTORS.content);

    if (!scene || !camera || !rotator || !content) {
        throw new Error(
            `[scene.js] Missing scene DOM nodes: ` +
            `scene=${!!scene} camera=${!!camera} rotator=${!!rotator} content=${!!content}`
        );
    }
    return { scene, camera, rotator, content };
}

/**
 * @param {HTMLElement} elementDom
 */
export function mountElement(elementDom) {
    const { content } = getSceneRefs();
    content.appendChild(elementDom);
}

/**
 * @param {HTMLElement} dom
 * @param {{x:number,y:number,z:number,rx:number,ry:number,rz:number}} state
 */
export function applyElementTransform(dom, state) {
    dom.style.transform = formatElementTransform(state);
}
