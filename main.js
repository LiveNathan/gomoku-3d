import * as THREE from 'three';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import {CSS2DRenderer, CSS2DObject} from 'three/addons/renderers/CSS2DRenderer.js';

const loader = new THREE.TextureLoader();

const scene = new THREE.Scene();
const renderer = new THREE.WebGLRenderer();
const labelRenderer = new CSS2DRenderer();

renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);
labelRenderer.setSize(window.innerWidth, window.innerHeight);
labelRenderer.domElement.style.position = 'absolute';
labelRenderer.domElement.style.top = '0px';
document.body.appendChild(labelRenderer.domElement);

const boardSize = 14; // Including the edges
const halfBoardSize = boardSize / 2;  // 7
const gameBoard = Array(boardSize).fill().map(() => Array(boardSize).fill(null)); // initialize the game board as 2D array

const grid = new THREE.GridHelper(boardSize, boardSize);
grid.position.set(halfBoardSize, -halfBoardSize, 0);
grid.rotation.x = Math.PI / 2; // rotate 90 degrees

// Add grid labels
for (let i = 0; i < boardSize + 1; i++) {
    for (let j = 0; j < boardSize + 1; j++) {
        const div = document.createElement('div');
        div.className = 'label';
        div.textContent = `(${i}, ${j})`;
        // div.style.marginTop = '-1em';
        const label = new CSS2DObject(div);
        label.position.set(i, -j, 0);
        scene.add(label);
    }
}

scene.add(grid);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(halfBoardSize, -halfBoardSize, boardSize);
camera.lookAt(halfBoardSize, -halfBoardSize, 0);

let currentPlayer = 'black';

const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

window.addEventListener('click', clickHandler, false);

// Create a transparent plane to capture the mouse clicks
const clickTolerance = 0.5;
const geometry = new THREE.PlaneGeometry(boardSize + clickTolerance, boardSize + clickTolerance);
const material = new THREE.MeshBasicMaterial({
    color: 0xFFFFFF,
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0.1
});
const plane = new THREE.Mesh(geometry, material);
plane.position.set(halfBoardSize, -halfBoardSize, 0);

scene.add(plane);

function clickHandler(event) {
    // Normalized mouse coordinates
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    console.log("Mouse click at: " + mouse.x + ", " + mouse.y);

    raycaster.setFromCamera(mouse, camera);

    const intersects = raycaster.intersectObjects([plane]);
    console.log("Intersects: " + intersects.length);

    if (intersects.length > 0) {
        let intersectPoint = intersects[0].point;

        // convert the float point to a grid index
        let gridX = Math.round(intersectPoint.x);
        let gridY = Math.round(Math.abs(intersectPoint.y));

        // check if grid indexes are within the board size
        if (gridX >= 0 && gridX <= boardSize && gridY >= 0 && gridY <= boardSize) {
            console.log(`Click at grid location: (${gridX}, ${gridY})`);
        }
    }
}

let axesHelper = new THREE.AxesHelper(5);
scene.add(axesHelper);

// const controls = new OrbitControls(camera, renderer.domElement);

function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
    labelRenderer.render(scene, camera);
}

animate();