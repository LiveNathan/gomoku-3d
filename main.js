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
const GAME_STATE = {
  currentPlayer : 'black',
  currentPlayerLabel : null,
  winnerAnnouncement: null,
  restartButtonLabel : null,
  stonesInScene : []
}

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
    GAME_STATE.currentPlayerLabel = new CSS2DObject(div);
    GAME_STATE.currentPlayerLabel.position.set(0, 1, 0);
    scene.add(GAME_STATE.currentPlayerLabel);
}

function announceWinner() {
    const div = document.createElement('div');
    div.id = 'winner';
    div.className = 'winner';
    div.textContent = `The winner is ${currentPlayer}!`;
    GAME_STATE.winnerAnnouncement = new CSS2DObject(div);
    GAME_STATE.winnerAnnouncement.position.set(HALF_BOARD_SIZE, 1, 0);
    scene.add(GAME_STATE.winnerAnnouncement);
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

                    // check if grid indexes are within the board size
                    const gridIndexWithinBounds = gridX >= 0 && gridX <= BOARD_SIZE && gridY >= 0 && gridY <= BOARD_SIZE
                    if (gridIndexWithinBounds) {
                        // Draw a new stone only if the grid cell is currently empty
                        if (gameBoard[gridY][gridX] === null) {
                            drawStone(gridX, gridY, GAME_STATE.currentPlayer, gameBoard);
                            GAME_STATE.currentPlayer = GAME_STATE.currentPlayer === 'black' ? 'white' : 'black';
                            GAME_STATE.currentPlayerLabel.element.textContent = `Player turn: ${currentPlayer}`;
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
    GAME_STATE.stonesInScene.push(stone);
    gameBoard[y][x] = color;
    const isGameInWinningState = checkWin(gameBoard, x, y);
    if (isGameInWinningState) {
        announceWinner();
    }
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
    for (let stone of GAME_STATE.stonesInScene) {
        scene.remove(stone);
    }
    GAME_STATE.stonesInScene = [];

    for (let i = 0; i < gameBoard.length; i++) {
        for (let j = 0; j < gameBoard[i].length; j++) {
            if (gameBoard[i][j] !== null) {
                gameBoard[i][j] = null;
            }
        }
    }
}

function restartGameHandlerFactory(gameBoard) {
    return function (event) {
        event.preventDefault();
        clearGameBoard(scene, gameBoard);
        GAME_STATE.currentPlayer = 'black';
        GAME_STATE.currentPlayerLabel.element.textContent = `Player turn: ${currentPlayer}`;

        if (GAME_STATE.winnerAnnouncement) {
            scene.remove(GAME_STATE.winnerAnnouncement);
            GAME_STATE.winnerAnnouncement = null;
        }
    }
}

function createRestartButton(gameBoard) {
    const button = document.createElement('button');
    button.innerText = "Restart";
    button.className = 'restart-button';
    button.onclick = restartGameHandlerFactory(gameBoard); // set button's click handler to restartGame function
    GAME_STATE.restartButtonLabel = new CSS2DObject(button);
    GAME_STATE.restartButtonLabel.position.set(BOARD_SIZE, 2, 0); // adjust position as needed
    scene.add(GAME_STATE.restartButtonLabel);
}

function countStonesInDirection(gameBoard, startX, startY, offsetDX, offsetDY, color) {
    let count = 1;

    let x = startX + offsetDX;
    let y = startY + offsetDY;

    while (x >= 0 && x <= BOARD_SIZE && y >= 0 && y <= BOARD_SIZE) {
        if (gameBoard[y][x] !== color) {
            break;
        }
        count++;
        x += offsetDX;
        y += offsetDY;
    }

    return count;
}

function checkWin(gameBoard, x, y) {
    let mostRecentStoneColor = gameBoard[y][x];
    let directions = [[-1, 0], [1, 0], [0, -1], [0, 1], [-1, -1], [1, 1], [-1, 1], [1, -1]];

    for (let i = 0; i < directions.length; i += 2) {
        let total = countStonesInDirection(gameBoard, x, y, directions[i][0], directions[i][1], mostRecentStoneColor) +
            countStonesInDirection(gameBoard, x, y, directions[i + 1][0], directions[i + 1][1], mostRecentStoneColor) - 1;

        if (total >= WINNING_NUMBER_OF_STONES) {
            return true;
        }
    }

    return false;
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