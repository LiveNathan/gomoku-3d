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
const geometry = new THREE.PlaneGeometry(boardSize, boardSize);
const material = new THREE.MeshBasicMaterial({
    color: 0xFFFFFF,
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0.2
});
const plane = new THREE.Mesh(geometry, material);
plane.position.set(halfBoardSize, halfBoardSize, 0);

// scene.add(plane);

function clickHandler(event) {
    // Normalized mouse coordinates
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    console.log("Mouse click at: " + mouse.x + ", " + mouse.y);

    // Update the picking ray with the camera and mouse position
    raycaster.setFromCamera(mouse, camera);

    // Calculate objects intersecting the picking ray
    const intersects = raycaster.intersectObjects(scene.children);
    console.log("Intersects: " + intersects.length);

    // If an object is intersected, add a stone.
    if (intersects.length > 0) {
        // The first intersected object is the closest one
        let intersectPosition = intersects[0].point;
        let intersectPositionX = Math.round(intersectPosition.x);
        let intersectPositionY = Math.round(intersectPosition.y);
        console.log("Intersect position: " + intersectPositionX + ", " + intersectPositionY)

        // Create a geometry for the stone.
        // const stoneGeometry = new THREE.CylinderGeometry(0.5, 0.5, 0.1, 32);
        // const stoneMaterial = new THREE.MeshPhongMaterial({
        //     color: currentPlayer === 'black' ? 0x000000 : 0xffffff, // set color based on current player
        //     shininess: 100,   // make it shiny
        // });
        // const stone = new THREE.Mesh(stoneGeometry, stoneMaterial);

        // Setting the stone position to the clicked location
        // stone.position.set(intersectPosition.x, intersectPosition.y, intersectPosition.z + 0.05);
        // console.log(stone.position);
        // stone.rotation.x = Math.PI / 2;

        // scene.add(stone);
        //
        // let adjustedX = Math.round(intersectPosition.x) + (boardSize / 2);
        // console.log("adjusted x: " + adjustedX)
        // let adjustedY = Math.round(intersectPosition.y) + (boardSize / 2);
        // console.log("adjusted y: " + adjustedY)
        //
        // if (adjustedX >= 0 && adjustedX < boardSize && adjustedY >= 0 && adjustedY < boardSize) {
        //     gameBoard[Math.floor(intersectPosition.x)][Math.floor(intersectPosition.y)] = currentPlayer;
        //     console.log(gameBoard);
        //     currentPlayer = currentPlayer === 'black' ? 'white' : 'black';
        // }
    }
    return {intersectPositionX, intersectPositionY};
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