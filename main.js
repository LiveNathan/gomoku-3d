import * as THREE from 'three';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';

const loader = new THREE.TextureLoader();

const scene = new THREE.Scene();
const renderer = new THREE.WebGLRenderer();

renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);
const boardSize = 14; // Including the edges
const gameBoard = Array(boardSize).fill().map(() => Array(boardSize).fill(null)); // initialize the game board as 2D array

const grid = new THREE.GridHelper(boardSize, boardSize);
grid.position.set(0, 0, 0);
grid.rotation.x = Math.PI / 2; // rotate 90 degrees
scene.add(grid);

// Add ambient light
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

// Add directional light (like sunlight)
const directLight = new THREE.DirectionalLight(0xffffff, 0.5);
directLight.position.set(0, 10, 10);
scene.add(directLight);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 0, boardSize);
camera.lookAt(0, 0, 0);

let currentPlayer = 'black';

const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

window.addEventListener('click', clickHandler, false);

// Invisible plane for raycaster intersection
const planeGeometry = new THREE.PlaneGeometry(boardSize, boardSize);
const planeMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000, side: THREE.DoubleSide }); // red color for debugging
const plane = new THREE.Mesh(planeGeometry, planeMaterial);
plane.rotation.x = Math.PI / 2; // Rotate 90 degrees
plane.position.z = 0.05; // Slightly above the grid for clickable intersections
scene.add(plane);

function clickHandler(event) {
    // Normalized mouse coordinates
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    console.log("Mouse click at: " + mouse.x + ", " + mouse.y);

    // Update the picking ray with the camera and mouse position
    raycaster.setFromCamera(mouse, camera);

    // Calculate objects intersecting the picking ray
    const intersects = raycaster.intersectObjects(plane, true);

    // If an object is intersected, add a stone.
    if (intersects.length > 0) {
        // The first intersected object is the closest one
        let intersectPosition = intersects[0].point;
        let intersectPositionX = Math.round(intersectPosition.x);
        let intersectPositionY = Math.round(intersectPosition.y);
        console.log("Intersect position: " + intersectPositionX + ", " + intersectPositionY)

        // Create a geometry for the stone.
        const stoneGeometry = new THREE.CylinderGeometry(0.5, 0.5, 0.1, 32);
        const stoneMaterial = new THREE.MeshPhongMaterial({
            color: currentPlayer === 'black' ? 0x000000 : 0xffffff, // set color based on current player
            shininess: 100,   // make it shiny
        });
        const stone = new THREE.Mesh(stoneGeometry, stoneMaterial);

        // Setting the stone position to the clicked location
        stone.position.set(intersectPosition.x, intersectPosition.y, intersectPosition.z + 0.05);
        console.log(stone.position);
        stone.rotation.x = Math.PI / 2;

        scene.add(stone);
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
}

let axesHelper = new THREE.AxesHelper(5);
scene.add(axesHelper);
const controls = new OrbitControls(camera, renderer.domElement);

function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
}

animate();