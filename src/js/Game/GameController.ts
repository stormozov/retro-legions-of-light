import IGameController from '../interface/IGameController';
import GameStateService from '../services/GameStateService';
import themes from '../themes/themes';
import GamePlay from './GamePlay';

/**
* Класс `GameController` управляет игровым процессом.
* 
* Реализует интерфейс `IGameController`.
*/
export default class GameController implements IGameController {
  private gamePlay: GamePlay;
  private stateService: GameStateService;

  /**
   * Создает новый экземпляр GameController.
   * @param {GamePlay} gamePlay - Объект GamePlay.
   * @param {GameStateService} stateService - Объект GameStateService.
   */
  constructor(gamePlay: GamePlay, stateService: GameStateService) {
    this.gamePlay = gamePlay;
    this.stateService = stateService;
  }

  /**
   * Инициализирует игровой процесс.
   */
  init(): void {
    this.gamePlay.drawUi(themes.prairie);
    // TODO: load saved stated from stateService
  }

  /**
   * Реагирует на клик по ячейке.
   * @param {number} index - Индекс ячейки.
   */
  onCellClick(index: number): void {
    // TODO: react to click
  }

  /**
   * Реагирует на вход мыши в ячейку.
   * @param {number} index - Индекс ячейки.
   */
  onCellEnter(index: number): void {
    // TODO: react to mouse enter
  }

  /**
   * Реагирует на выход мыши из ячейки.
   * @param {number} index - Индекс ячейки.
   */
  onCellLeave(index: number): void {
    // TODO: react to mouse leave
  }
}

