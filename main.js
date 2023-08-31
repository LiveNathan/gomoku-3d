import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
const loader = new THREE.TextureLoader();

const scene = new THREE.Scene();
const renderer = new THREE.WebGLRenderer();

renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );
const boardSize = 14; // Including the edges

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

const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
camera.position.set(0, 0, boardSize);
camera.lookAt(0, 0, 0);

const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

window.addEventListener('click', onClick, false);

function clickHandler(event) {
    // Normalized mouse coordinates
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    console.log("Mouse click at: " + mouse);

    // Update the picking ray with the camera and mouse position
    raycaster.setFromCamera(mouse, camera);

    // Calculate objects intersecting the picking ray
    const intersects = raycaster.intersectObjects([grid], true);

    // If an object is intersected, add a stone.
    if (intersects.length > 0) {
        // The first intersected object is the closest one
        let pos = intersects[0].point;

        // Create a geometry for the stone.
        const stoneGeometry = new THREE.CylinderGeometry(0.5, 0.5, 0.1, 32);
        const stoneMaterial = new THREE.MeshPhongMaterial({
            color: 0x000000, // black color
            shininess: 100,   // make it shiny
        });
        const stone = new THREE.Mesh(stoneGeometry, stoneMaterial);

        // Setting the stone position to the clicked location
        stone.position.set(pos.x, pos.y, pos.z + 0.05);
        console.log(stone.position);
        stone.rotation.x = Math.PI / 2;

        scene.add(stone);
    }
}

let axesHelper = new THREE.AxesHelper(5);
scene.add(axesHelper);
const controls = new OrbitControls( camera, renderer.domElement );

function animate() {
    requestAnimationFrame( animate );
    renderer.render( scene, camera );
}
animate();