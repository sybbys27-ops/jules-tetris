import { Renderer } from './renderer.js';
import { Game } from './game.js';

const canvas = document.getElementById('game-canvas');
const renderer = new Renderer(canvas);
const game = new Game(renderer);

const startBtn = document.getElementById('start-btn');
startBtn.addEventListener('click', () => {
    game.start();
    startBtn.blur(); // Remove focus so Enter doesn't trigger click again
});

document.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
        game.start();
    }
});
