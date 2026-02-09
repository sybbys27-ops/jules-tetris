import { COLS, ROWS, BLOCK_SIZE, COLORS } from './constants.js';

export class Renderer {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');

        // Set canvas size in pixels
        this.ctx.canvas.width = COLS * BLOCK_SIZE;
        this.ctx.canvas.height = ROWS * BLOCK_SIZE;

        // Scale coordinate system to block units
        this.ctx.scale(BLOCK_SIZE, BLOCK_SIZE);
    }

    draw(board, piece, indicatorY, movingRow, targetRowY, offset) {
        this.clear();

        // Draw indicator background
        if (typeof indicatorY === 'number') {
            this.drawIndicator(indicatorY);
        }

        this.drawBoard(board);

        if (movingRow && typeof targetRowY === 'number') {
            this.drawMovingRow(movingRow, targetRowY, offset);
        }

        if (piece) {
            this.drawPiece(piece);
        }
    }

    drawMovingRow(row, y, offset) {
        row.forEach((value, x) => {
            if (value > 0) {
                let pos = (x + offset) % COLS;
                this.drawBlock(pos, y, value);

                // Handle Wrap-around visuals
                if (pos + 1 > COLS) {
                    this.drawBlock(pos - COLS, y, value);
                }
            }
        });
    }

    drawIndicator(y) {
        this.ctx.fillStyle = 'rgba(255, 255, 0, 0.2)';
        this.ctx.fillRect(0, y, COLS, 1);

        // Draw line at edges
        this.ctx.strokeStyle = 'yellow';
        this.ctx.lineWidth = 0.1;
        this.ctx.beginPath();
        this.ctx.moveTo(0, y);
        this.ctx.lineTo(COLS, y);
        this.ctx.moveTo(0, y + 1);
        this.ctx.lineTo(COLS, y + 1);
        this.ctx.stroke();
    }

    clear() {
        // Clear using logical units (which are scaled)
        this.ctx.clearRect(0, 0, COLS, ROWS);
    }

    drawBoard(board) {
        board.grid.forEach((row, y) => {
            row.forEach((value, x) => {
                if (value > 0) {
                    this.drawBlock(x, y, value);
                }
            });
        });
    }

    drawPiece(piece) {
        piece.shape.forEach((row, y) => {
            row.forEach((value, x) => {
                if (value > 0) {
                    this.drawBlock(piece.x + x, piece.y + y, piece.color);
                }
            });
        });
    }

    drawBlock(x, y, color) {
        // If color is a number (from board grid), map to string
        if (typeof color === 'number') {
            color = COLORS[color];
        }

        this.ctx.fillStyle = color;
        this.ctx.fillRect(x, y, 1, 1);

        // Add border/bevel
        this.ctx.lineWidth = 0.05; // 0.05 logical unit = 0.05 * 30 = 1.5px
        this.ctx.strokeStyle = '#222';
        this.ctx.strokeRect(x, y, 1, 1);

        // Highlight (top/left)
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
        this.ctx.fillRect(x, y, 1, 1);
    }
}
