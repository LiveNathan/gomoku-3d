import * as THREE from 'three';
const loader = new THREE.TextureLoader();

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

const renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

// Loading and applying the texture
loader.load('public/pandav-tank-88-KbSZbuEc-unsplash.jpg', function ( texture ) {
    const material = new THREE.MeshBasicMaterial( { map: texture, side: THREE.DoubleSide } );

    const boardSize = 10;
    let halfSize = boardSize / 2;
    let boardPlaneGeometry = new THREE.PlaneGeometry(boardSize, boardSize);

    // Add the game board as a simple plane first.
    let boardPlane = new THREE.Mesh(boardPlaneGeometry, material);
    boardPlane.rotation.x = Math.PI / 2;
    boardPlane.position.set(halfSize, -0.01, halfSize);

    scene.add(boardPlane);

    // Create the grid.
    let grid = new THREE.GridHelper(boardSize, boardSize);
    grid.position.set(halfSize, 0, halfSize);

    scene.add(grid);

    camera.position.set(halfSize, boardSize, halfSize);
    camera.lookAt(halfSize, 0, halfSize);
});

function animate() {
    requestAnimationFrame( animate );
    renderer.render( scene, camera );
}
animate();

const board = [];
for (let i = 0; i < boardSize; i++) {
    board[i] = [];
    for (let j = 0; j < boardSize; j++) {
        board[i][j] = 0;
    }
}