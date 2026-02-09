import { COLS, ROWS, COLORS } from './constants.js';

export class Board {
    constructor() {
        this.reset();
    }

    reset() {
        this.grid = this.getEmptyGrid();
    }

    getEmptyGrid() {
        return Array.from({ length: ROWS }, () => Array(COLS).fill(0));
    }

    // Check if the move is valid
    valid(p) {
        return p.shape.every((row, dy) => {
            return row.every((value, dx) => {
                let x = p.x + dx;
                let y = p.y + dy;

                // If this cell is empty in the shape, it doesn't matter
                if (value === 0) return true;

                // Check boundaries
                if (x < 0 || x >= COLS || y >= ROWS) return false;

                // Check collision with grid
                // If y < 0, we assume it's valid as long as x is valid (which we checked)
                // because there are no blocks above the board.
                if (y >= 0 && this.grid[y][x] > 0) return false;

                return true;
            });
        });
    }

    freeze(p) {
        p.shape.forEach((row, dy) => {
            row.forEach((value, dx) => {
                if (value > 0) {
                    let y = p.y + dy;
                    let x = p.x + dx;
                    // Only lock if inside the grid
                    if (y >= 0 && y < ROWS && x >= 0 && x < COLS) {
                        this.grid[y][x] = value;
                    }
                }
            });
        });
    }

    clearLines() {
        let lines = 0;

        // Check from bottom up
        for (let y = ROWS - 1; y >= 0; y--) {
            // Check if row is full (no zeros)
            if (this.grid[y].every(value => value > 0)) {
                lines++;
                // Remove line
                this.grid.splice(y, 1);
                // Add new empty line at top
                this.grid.unshift(Array(COLS).fill(0));

                // Re-check the same row index because rows shifted down
                y++;
            }
        }

        return lines;
    }

    getHighestRow() {
        for (let y = 0; y < ROWS; y++) {
            if (this.grid[y].some(value => value > 0)) {
                return y;
            }
        }
        return ROWS - 1; // Default to bottom if empty
    }
}
