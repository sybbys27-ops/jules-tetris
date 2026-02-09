import { Board } from './board.js';
import { Tetromino } from './tetromino.js';
import { KEY, CONVEYOR_TRIGGER_COUNT, ROWS, COLS, STATE, CONVEYOR_DURATION, CONVEYOR_MOVE_DISTANCE } from './constants.js';

export class Game {
    constructor(renderer) {
        this.renderer = renderer;
        this.board = new Board();
        this.piece = null;
        this.nextPiece = null;

        this.state = STATE.MENU;

        // Time management
        this.lastTime = 0;
        this.dropCounter = 0;
        this.dropInterval = 1000;

        // Game state
        this.score = 0;
        this.lines = 0;
        this.level = 0;
        this.lockCount = 0;

        this.requestId = null;

        // Conveyor Indicator
        this.indicatorY = ROWS - 1;
        this.indicatorDir = -1; // Moving Up initially
        this.indicatorSpeed = 5; // Rows per second

        // Conveyor Event State
        this.conveyorTargetRow = -1;
        this.conveyorTime = 0;
        this.movingRow = null; // Array of block values for the row being moved

        // Bind methods
        this.loop = this.loop.bind(this);
        this.handleInput = this.handleInput.bind(this);

        // Setup input
        document.addEventListener('keydown', this.handleInput);
    }

    start() {
        if (this.requestId) {
            cancelAnimationFrame(this.requestId);
        }

        this.board.reset();
        this.score = 0;
        this.lines = 0;
        this.level = 0;
        this.dropInterval = 1000;
        this.lockCount = 0;
        this.state = STATE.PLAYING;

        // Reset indicator
        this.indicatorY = ROWS - 1;
        this.indicatorDir = -1;

        this.spawnPiece();

        this.lastTime = performance.now();
        this.dropCounter = 0;
        this.requestId = requestAnimationFrame(this.loop);

        this.updateUI();
    }

    spawnPiece() {
        const typeId = Math.floor(Math.random() * 7) + 1; // 1-7
        this.piece = new Tetromino(typeId);

        if (!this.board.valid(this.piece)) {
            this.gameOver();
        }
    }

    gameOver() {
        this.state = STATE.GAME_OVER;
        cancelAnimationFrame(this.requestId);
        this.ctx = this.renderer.ctx;
        this.ctx.fillStyle = 'black';
        this.ctx.fillRect(1, 3, 8, 1.2);
        this.ctx.font = '1px Arial';
        this.ctx.fillStyle = 'red';
        this.ctx.fillText('GAME OVER', 1.8, 4);
    }

    loop(time = 0) {
        if (this.state === STATE.GAME_OVER || this.state === STATE.MENU) return;

        const deltaTime = time - this.lastTime;
        this.lastTime = time;

        if (this.state === STATE.PLAYING) {
            this.updatePlaying(deltaTime);
        } else if (this.state === STATE.CONVEYOR) {
            this.updateConveyor(deltaTime);
        }

        this.draw();
        this.requestId = requestAnimationFrame(this.loop);
    }

    updatePlaying(dt) {
        this.updateIndicator(dt);

        this.dropCounter += dt;
        if (this.dropCounter > this.dropInterval) {
            this.drop();
        }
    }

    updateConveyor(dt) {
        this.conveyorTime += dt;
        if (this.conveyorTime >= CONVEYOR_DURATION) {
            this.endConveyorEvent();
        }
    }

    startConveyorEvent() {
        this.state = STATE.CONVEYOR;
        this.conveyorTargetRow = Math.round(this.indicatorY);
        this.conveyorTime = 0;

        // Extract row data
        this.movingRow = [...this.board.grid[this.conveyorTargetRow]];
        // Clear row in board so it doesn't render normally
        this.board.grid[this.conveyorTargetRow].fill(0);

        console.log("Conveyor Event Started on Row: " + this.conveyorTargetRow);
    }

    endConveyorEvent() {
        // Apply shift
        const shift = 5;
        const newRow = Array(COLS).fill(0);

        for (let x = 0; x < COLS; x++) {
            const val = this.movingRow[x];
            if (val > 0) {
                const newX = (x + shift) % COLS;
                newRow[newX] = val;
            }
        }

        // Put back into board
        this.board.grid[this.conveyorTargetRow] = newRow;
        this.movingRow = null;

        // Apply Gravity to this row's blocks
        this.applyGravityToRow(this.conveyorTargetRow);

        this.state = STATE.PLAYING;

        // Check for lines after event
        const cleared = this.board.clearLines();
        if (cleared > 0) {
            this.score += cleared * 100;
            this.lines += cleared;

            // Update level and speed
            this.level = Math.floor(this.lines / 10);
            this.dropInterval = Math.max(100, 1000 - (this.level * 100));

            this.updateUI();
        }

        this.spawnPiece();
    }

    applyGravityToRow(rowY) {
        // For each block in the row, drop it as far as possible
        // We iterate and drop each block individually.
        // But wait, if we have blocks at (x, rowY), we drop them.
        // Should we process from bottom up?
        // Since we only modified one row (rowY), and we want to drop blocks FROM this row downwards.
        // We can just iterate x in rowY.

        for (let x = 0; x < COLS; x++) {
            if (this.board.grid[rowY][x] > 0) {
                let currentY = rowY;
                let val = this.board.grid[rowY][x];

                // Remove from current position temporarily
                this.board.grid[currentY][x] = 0;

                // Find lowest valid position
                while (currentY + 1 < ROWS && this.board.grid[currentY + 1][x] === 0) {
                    currentY++;
                }

                // Place block
                this.board.grid[currentY][x] = val;
            }
        }
    }

    updateIndicator(dt) {
        const minY = this.board.getHighestRow();
        const maxY = ROWS - 1;

        if (minY >= maxY) {
            this.indicatorY = maxY;
            return;
        }

        this.indicatorY += this.indicatorDir * this.indicatorSpeed * (dt / 1000);

        if (this.indicatorY <= minY) {
            this.indicatorY = minY;
            this.indicatorDir = 1;
        } else if (this.indicatorY >= maxY) {
            this.indicatorY = maxY;
            this.indicatorDir = -1;
        }
    }

    draw() {
        let conveyorOffset = 0;
        if (this.state === STATE.CONVEYOR) {
            conveyorOffset = (this.conveyorTime / CONVEYOR_DURATION) * CONVEYOR_MOVE_DISTANCE;
        }

        this.renderer.draw(
            this.board,
            this.piece,
            Math.round(this.indicatorY),
            this.state === STATE.CONVEYOR ? this.movingRow : null,
            this.state === STATE.CONVEYOR ? this.conveyorTargetRow : null,
            conveyorOffset
        );
    }

    drop() {
        let p = { ...this.piece, y: this.piece.y + 1 };

        if (this.board.valid(p)) {
            this.piece.move(p);
        } else {
            this.board.freeze(this.piece);
            this.lockCount++;
            this.updateUI(); // Update count immediately

            // Check trigger condition
            // "10th block ... trigger event"
            // Important: Trigger BEFORE clearing lines?
            // "Trigger moment ... indicator Y is fixed as target."
            // "Line clearing ... during event is NO. After event YES."
            // Wait, rules say:
            // "Any filled row is deleted." (Basic rule)
            // "Conveyor event ... triggered when 10th block locks."
            // If locking causes line clear, should we clear first?
            // "Line clearing check is NOT done during movement."
            // "After event end ... normal rules resume (line clear check done here)."
            // So if lock happens, we do NOT clear lines if event triggers?
            // Or do we clear lines, then trigger?
            // Rule 3: "Trigger every 10 locked blocks."
            // Rule 8: "Event end ... Line clearing check done here."
            // Implication: Locking 10th block -> Event starts -> Physics -> Event ends -> Line clear.
            // So NO line clear on the 10th block lock.

            if (this.lockCount > 0 && this.lockCount % CONVEYOR_TRIGGER_COUNT === 0) {
                this.startConveyorEvent();
            } else {
                // Normal behavior
                const cleared = this.board.clearLines();
                if (cleared > 0) {
                    this.score += cleared * 100;
                    this.lines += cleared;

                    // Update level and speed
                    this.level = Math.floor(this.lines / 10);
                    this.dropInterval = Math.max(100, 1000 - (this.level * 100));

                    this.updateUI();
                }
                this.spawnPiece();
            }
        }
        this.dropCounter = 0;
    }

    move(dir) {
        if (this.state !== STATE.PLAYING) return;
        let p = { ...this.piece, x: this.piece.x + dir };
        if (this.board.valid(p)) {
            this.piece.move(p);
        }
    }

    rotate() {
        if (this.state !== STATE.PLAYING) return;
        const newShape = this.piece.rotate();
        let p = { ...this.piece, shape: newShape };

        if (this.board.valid(p)) {
            this.piece.shape = newShape;
            return;
        }
        p.x += 1;
        if (this.board.valid(p)) {
            this.piece.move(p);
            return;
        }
        p.x -= 2;
        if (this.board.valid(p)) {
            this.piece.move(p);
            return;
        }
    }

    hardDrop() {
        if (this.state !== STATE.PLAYING) return;
        while (this.board.valid({ ...this.piece, y: this.piece.y + 1 })) {
            this.piece.y++;
            this.score += 2;
        }
        this.drop();
    }

    handleInput(event) {
        if (this.state !== STATE.PLAYING) return;

        if ([KEY.UP, KEY.DOWN, KEY.LEFT, KEY.RIGHT, KEY.SPACE].includes(event.key)) {
            event.preventDefault();
        }

        if (event.key === KEY.LEFT) {
            this.move(-1);
        } else if (event.key === KEY.RIGHT) {
            this.move(1);
        } else if (event.key === KEY.DOWN) {
            this.drop();
        } else if (event.key === KEY.UP) {
            this.rotate();
        } else if (event.key === KEY.SPACE) {
            this.hardDrop();
        }
    }

    updateUI() {
        document.getElementById('score').innerText = this.score;
        document.getElementById('lines').innerText = this.lines;
        document.getElementById('level').innerText = this.level;
        document.getElementById('lock-count').innerText = this.lockCount;
    }
}
