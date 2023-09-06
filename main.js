import * as THREE from 'three';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import {CSS2DRenderer, CSS2DObject} from 'three/addons/renderers/CSS2DRenderer.js';

THREE.Cache.enabled = true;

const PERSPECTIVE_CAMERA_FOV = 75;
const PERSPECTIVE_CAMERA_NEAR = 0.1;
const PERSPECTIVE_CAMERA_FAR = 1000;
const BOARD_SIZE = 14;
const HALF_BOARD_SIZE = BOARD_SIZE / 2;
const SPHERE_RADIUS = 0.4;
const SPHERE_WIDTH_SEGMENT = 32;
const SPHERE_HEIGHT_SEGMENT = SPHERE_WIDTH_SEGMENT / 3;
const WINNING_NUMBER_OF_STONES = 5;

const scene = new THREE.Scene();
let currentPlayer = 'black';
let currentPlayerLabel = null;
let restartButtonLabel = null;
let stonesInScene = [];

function initializeGameBoard() {
    const gameBoard = Array(BOARD_SIZE + 1).fill().map(() => Array(BOARD_SIZE + 1).fill(null));
    return {gameBoard};
}

function createUpdateSizes(camera, renderer, labelRenderer) {
    return function updateSizes() {
        const width = window.innerWidth;
        const height = window.innerHeight;

        // Update the camera's aspect ratio
        camera.aspect = width / height;
        camera.updateProjectionMatrix();

        // Update the size of both renderer and labelRenderer
        renderer.setSize(width, height);
        labelRenderer.setSize(width, height);
    };
}

function initializeCamera() {
    const camera = new THREE.PerspectiveCamera(
        PERSPECTIVE_CAMERA_FOV,
        window.innerWidth / window.innerHeight,
        PERSPECTIVE_CAMERA_NEAR,
        PERSPECTIVE_CAMERA_FAR
    );
    camera.position.set(HALF_BOARD_SIZE, -HALF_BOARD_SIZE, BOARD_SIZE);
    camera.lookAt(HALF_BOARD_SIZE, -HALF_BOARD_SIZE, 0);
    return camera;
}

function createRenderer() {
    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);
    return renderer;
}

function createLabelRenderer() {
    const labelRenderer = new CSS2DRenderer();
    labelRenderer.setSize(window.innerWidth, window.innerHeight);
    labelRenderer.domElement.style.position = 'absolute';
    labelRenderer.domElement.style.top = '0px';
    document.body.appendChild(labelRenderer.domElement);
    return labelRenderer;
}

function createPlayerInfoLabel() {
    const div = document.createElement('div');
    div.id = 'player-info';
    div.className = 'label';
    div.textContent = `Player turn: ${currentPlayer}`;
    currentPlayerLabel = new CSS2DObject(div);
    currentPlayerLabel.position.set(0, 1, 0);
    scene.add(currentPlayerLabel);
}

function initializeEventListeners(camera, renderer, labelRenderer, gameBoard, raycaster, plane, updateSizes) {

    let isDragging = false;

    const handleMouseDown = function (event) {
        isDragging = false;
    };

    const handleMouseMove = function (event) {
        isDragging = true;
    };

    const handleMouseUp = function (event) {
        if (!isDragging) {
            handlePlayerTurn(event);
        }
        isDragging = false;
    };

    const handlePlayerTurn = function (event) {
            try {
                const mouse = new THREE.Vector2();
                mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
                mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
                raycaster.setFromCamera(mouse, camera);
                const intersects = raycaster.intersectObjects([plane]);

                if (intersects.length === 0) {
                    return;  // If not clicking on game board, do nothing.
                }

                if (intersects.length > 0) {
                    let intersectPoint = intersects[0].point;
                    let gridX = Math.round(intersectPoint.x);
                    let gridY = Math.round(Math.abs(intersectPoint.y));
                    // console.log("gridX: " + gridX + " gridY: " + gridY);

                    // check if grid indexes are within the board size
                    if (gridX >= 0 && gridX <= BOARD_SIZE && gridY >= 0 && gridY <= BOARD_SIZE) {
                        // Draw a new stone only if the grid cell is currently empty
                        // console.log(gameBoard)
                        // console.log("Gameboard: " + gameBoard[gridY][gridX]);
                        if (gameBoard[gridY][gridX] === null) {
                            drawStone(gridX, gridY, currentPlayer, gameBoard);
                            currentPlayer = currentPlayer === 'black' ? 'white' : 'black';
                            currentPlayerLabel.element.textContent = `Player turn: ${currentPlayer}`;
                        }
                    }
                }
            } catch (e) {
                console.error('An error occurred while processing player turn: ', e);
            }
        }
    ;

    window.addEventListener('mousedown', handleMouseDown, false);
    window.addEventListener('mousemove', handleMouseMove, false);
    window.addEventListener('mouseup', handleMouseUp, false);
    window.addEventListener('resize', updateSizes, false);

    // Return a function to clean up listeners when they're no longer needed
    const cleanup = function () {
        window.removeEventListener('mousedown', handleMouseDown);
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
        window.removeEventListener('resize', updateSizes);
    };
    window.addEventListener('beforeunload', cleanup);
    return cleanup;
}

function createSceneContent() {
    const grid = new THREE.GridHelper(BOARD_SIZE, BOARD_SIZE);
    grid.position.set(HALF_BOARD_SIZE, -HALF_BOARD_SIZE, 0);
    grid.rotation.x = Math.PI / 2; // rotate 90 degrees

    for (let i = 0; i < BOARD_SIZE + 1; i++) {
        for (let j = 0; j < BOARD_SIZE + 1; j++) {
            const div = document.createElement('div');
            div.className = 'label';
            div.textContent = `(${i}, ${j})`;
            const label = new CSS2DObject(div);
            label.position.set(i, -j, 0);
            scene.add(label);
        }
    }
    scene.add(grid);

    return scene;
}

function createPlane() {
    const clickTolerance = 0.5;
    const geometry = new THREE.PlaneGeometry(BOARD_SIZE + clickTolerance, BOARD_SIZE + clickTolerance);
    const material = new THREE.MeshBasicMaterial({
        color: 0xFFFFFF,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.1
    });
    const plane = new THREE.Mesh(geometry, material);
    plane.position.set(HALF_BOARD_SIZE, -HALF_BOARD_SIZE, 0);
    scene.add(plane);

    return plane;
}

const loader = new THREE.TextureLoader();
let blackStoneTexture = null;
let whiteStoneTexture = null;

loader.load(
    // resource URL
    'public/black-stone.jpg',
    // onLoad callback
    function (texture) {
        // in this section you can create the material with texture
        blackStoneTexture = texture;
    },
    // onProgress callback currently not supported
    undefined,
    // onError callback
    function (error) {
        console.error('An error happened while loading black stone texture', error);
    }
);

loader.load(
    // resource URL
    'public/white-stone.jpg',
    // onLoad callback
    function (texture) {
        // in this section you can create the material with texture
        whiteStoneTexture = texture;
    },
    // onProgress callback currently not supported
    undefined,
    // onError callback
    function (error) {
        console.error('An error happened while loading white stone texture', error);
    }
);

function drawStone(x, y, color, gameBoard) {
    let sphereGeometry = new THREE.SphereGeometry(SPHERE_RADIUS, SPHERE_WIDTH_SEGMENT, SPHERE_HEIGHT_SEGMENT);
    let stoneMaterial;
    let texture = color === 'black' ? blackStoneTexture : whiteStoneTexture;
    if (texture) {
        stoneMaterial = new THREE.MeshBasicMaterial({map: texture});
    } else {
        stoneMaterial = new THREE.MeshBasicMaterial({color: color === 'black' ? 0x000000 : 0xffffff});
    }
    let stone = new THREE.Mesh(sphereGeometry, stoneMaterial);
    stone.position.set(x, -y, 0.5);
    scene.add(stone);
    stonesInScene.push(stone);
    gameBoard[y][x] = color;
    const isGameInWinningState = checkWin(gameBoard, x, y);
    console.log("isWin: " + isGameInWinningState);
}

function drawAxes() {
    let axesHelper = new THREE.AxesHelper(5);
    scene.add(axesHelper);
}

function initializeControls(camera, renderer) {
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.target.set(HALF_BOARD_SIZE, -HALF_BOARD_SIZE, 0);
    controls.enableZoom = false;
    controls.enablePan = false;
    controls.update();
    return controls;
}

function animate(renderer, labelRenderer, camera, controls) {
    requestAnimationFrame(() => animate(renderer, labelRenderer, camera, controls));
    controls.update();
    renderer.render(scene, camera);
    labelRenderer.render(scene, camera);
}

function clearGameBoard(scene, gameBoard) {
    for (let stone of stonesInScene) {
        scene.remove(stone);
    }
    stonesInScene = [];

    for (let i = 0; i < gameBoard.length; i++) {
        for (let j = 0; j < gameBoard[i].length; j++) {
            if (gameBoard[i][j] !== null) {
                gameBoard[i][j] = null;
            }
        }
    }
}

function restartGame(gameBoard) {
    return function (event) {
        event.preventDefault();
        clearGameBoard(scene, gameBoard);
        currentPlayer = 'black';
        currentPlayerLabel.element.textContent = `Player turn: ${currentPlayer}`;
    }
}

function createRestartButton(gameBoard) {
    const button = document.createElement('button');
    button.innerText = "Restart";
    button.className = 'restart-button';
    button.onclick = restartGame(gameBoard); // set button's click handler to restartGame function
    restartButtonLabel = new CSS2DObject(button);
    restartButtonLabel.position.set(BOARD_SIZE, 2, 0); // adjust position as needed
    scene.add(restartButtonLabel);
}

function checkWin(gameBoard, x, y) {
    // What's the most recent color?
    let mostRecentStoneColor = gameBoard[y][x];

    // Check in every direction for another color
    let count = 0;
    for (let columnOffset = -1; columnOffset < 2; columnOffset++) {
        for (let rowOffset = -1; rowOffset < 2; rowOffset++) {
            count = 1;
            let column = y + columnOffset;
            let row = x + rowOffset;
            if (column < 0 || column > 14 || row < 0 || row > 14 || (column === y && row === x)){
                continue;
            }

            let nextColorToCheck = gameBoard[column][row];

            // If opposite color, break early
            if (nextColorToCheck !== mostRecentStoneColor) {
                continue;
            }

            // If same color, update count and check on both sides of the line
            if (nextColorToCheck === mostRecentStoneColor) {
                while (column >= 0 && column <= 14 && row >= 0 && row <= 14 && (column !== y || row !== x)){
                    nextColorToCheck = gameBoard[column][row];

                    if (nextColorToCheck !== mostRecentStoneColor) {
                        break;
                    }

                    if (nextColorToCheck === mostRecentStoneColor) {
                        count++;
                    }

                    let columnSign = Math.sign(columnOffset);
                    column = column + columnSign;

                    let rowSign = Math.sign(rowOffset)
                    row = row + rowSign;
                }
                return count >= 5;
            }
        }
    }

    // If count gets to five, return winner
    return count >= 5;
}

function main() {
    const {gameBoard} = initializeGameBoard();
    const camera = initializeCamera();
    const renderer = createRenderer();
    const controls = initializeControls(camera, renderer);
    const labelRenderer = createLabelRenderer();
    const updateSizes = createUpdateSizes(camera, renderer, labelRenderer);
    const raycaster = new THREE.Raycaster();
    const plane = createPlane();

    let cleanup = initializeEventListeners(camera, renderer, labelRenderer, gameBoard, raycaster, plane, updateSizes);
    createSceneContent();
    createPlayerInfoLabel();
    drawAxes();

    createRestartButton(gameBoard);

    animate(renderer, labelRenderer, camera, controls);
}

main();