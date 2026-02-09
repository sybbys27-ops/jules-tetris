import { SHAPES, COLORS, COLS, ROWS } from './constants.js';

export class Tetromino {
    constructor(shapeId) {
        this.shapeId = shapeId;
        this.color = COLORS[shapeId];
        this.shape = SHAPES[shapeId];

        // Starting position: center horizontally
        this.x = Math.floor(COLS / 2) - Math.floor(this.shape[0].length / 2);
        this.y = 0;
    }

    // Move the tetromino
    move(p) {
        this.x = p.x;
        this.y = p.y;
        this.shape = p.shape;
    }

    // Return rotated shape (Counter-Clockwise)
    rotate() {
        const N = this.shape.length;
        // Create new empty grid
        const newShape = Array.from({length: N}, () => Array(N).fill(0));

        for (let y = 0; y < N; y++) {
            for (let x = 0; x < N; x++) {
                // CCW Rotation: New[y][x] = Old[x][N - 1 - y]
                // assuming shape[y][x] (row y, col x)
                newShape[y][x] = this.shape[x][N - 1 - y];
            }
        }

        return newShape;
    }
}
