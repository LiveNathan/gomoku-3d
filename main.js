import * as THREE from 'three';
const loader = new THREE.TextureLoader();

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

const renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

const boardSize = 15; // Including the edges
let halfSize = boardSize / 2;
let boardPlaneGeometry = new THREE.PlaneGeometry(boardSize, boardSize);

let board = [];

loader.load('pandav-tank-88-KbSZbuEc-unsplash.jpg', function ( woodTexture ) {
    const boardMaterial = new THREE.MeshBasicMaterial( { map: woodTexture, side: THREE.DoubleSide } );

    // Add the game board as a simple plane first.
    let boardPlane = new THREE.Mesh(boardPlaneGeometry, boardMaterial);
    boardPlane.rotation.x = Math.PI / 2;
    boardPlane.position.set(halfSize - 0.5, -0.01, halfSize - 0.5); // Center the board with grid

    scene.add(boardPlane);

    // Create the grid.
    for (let i = 0; i < boardSize; i++){
        for (let j = 0; j < boardSize; j++){
            // Define box properties
            const geometry = new THREE.BoxGeometry(1, 0.01, 1);
            const material = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0 });

            // Construct box and place it
            const box = new THREE.Mesh(geometry, material);
            box.position.set(i, 0, j);

            // Add box to scene and to board array
            scene.add(box);
            board.push(box);
        }
    }

    camera.position.set(halfSize - 0.5, boardSize, halfSize - 0.5);
    camera.lookAt(halfSize - 0.5, 0, halfSize - 0.5);
});

const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

window.addEventListener('click', onClick, false);

function onClick(event) {
    // Normalized mouse coordinates
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    // Update the picking ray with the camera and mouse position
    raycaster.setFromCamera(mouse, camera);

    // Calculate objects intersecting the picking ray
    const intersects = raycaster.intersectObjects(board, true);

    // If an object is intersected, add a stone.
    if (intersects.length > 0) {
        // The first intersected object is the closest one
        let pos = intersects[0].object.position;

        // Create a geometry for the stone.
        const stoneGeometry = new THREE.SphereGeometry(0.5, 32, 32);
        const stoneMaterial = new THREE.MeshBasicMaterial({color: 0x88cc88});
        const stone = new THREE.Mesh(stoneGeometry, stoneMaterial);

        // Setting the stone position to the clicked location
        stone.position.set(pos.x, 0.5, pos.z);

        scene.add(stone);
    }
}

function animate() {
    requestAnimationFrame( animate );
    renderer.render( scene, camera );
}
animate();