export const COLS = 10;
export const ROWS = 20;
export const BLOCK_SIZE = 30; // pixels

export const COLORS = [
    'none',
    'cyan',   // I
    'blue',   // J
    'orange', // L
    'yellow', // O
    'green',  // S
    'purple', // T
    'red'     // Z
];

export const SHAPES = [
    [],
    [[0, 0, 0, 0], [1, 1, 1, 1], [0, 0, 0, 0], [0, 0, 0, 0]], // I
    [[2, 0, 0], [2, 2, 2], [0, 0, 0]], // J
    [[0, 0, 3], [3, 3, 3], [0, 0, 0]], // L
    [[4, 4], [4, 4]], // O
    [[0, 5, 5], [5, 5, 0], [0, 0, 0]], // S
    [[0, 6, 0], [6, 6, 6], [0, 0, 0]], // T
    [[7, 7, 0], [0, 7, 7], [0, 0, 0]]  // Z
];

export const KEY = {
    LEFT: 'ArrowLeft',
    RIGHT: 'ArrowRight',
    UP: 'ArrowUp',
    DOWN: 'ArrowDown',
    SPACE: ' '
};

export const CONVEYOR_TRIGGER_COUNT = 10;
export const CONVEYOR_MOVE_DISTANCE = 5;
export const CONVEYOR_DURATION = 5000; // ms

export const STATE = {
    MENU: 0,
    PLAYING: 1,
    CONVEYOR: 2,
    GAME_OVER: 3
};
