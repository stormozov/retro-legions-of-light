import GamePlay from './game/GamePlay.js';
import GameController from './game/GameController.js';
import GameStateService from './services/GameStateService.js';

const gamePlay = new GamePlay();
gamePlay.bindToDOM(document.querySelector('#game-container'));

const stateService = new GameStateService(localStorage);

const gameCtrl = new GameController(gamePlay, stateService);
gameCtrl.init();
