import PositionedCharacter from '../Game/PositionedCharacter';
import GameState from '../Game/GameState';
import GameStateService from './GameStateService';
import GamePlay from '../Game/GamePlay';
import AbstractService from './AbstractService';

/**
 * Сервис для работы с сохранением и загрузкой состояния игры
 * 
 * Используется локальное хранилище для сохранения состояния игры.
 * 
 * @example
 * const service = new GameSavingService(stateService, gamePlay);
 * service.saveGame(characters, theme, false);
 * const success = service.loadGame();
 */
export default class GameSavingService extends AbstractService {
  private stateService: GameStateService;
  private gameOver: boolean;

  /**
   * Конструктор сервиса
   * 
   * @constructor
   * 
   * @param {GameStateService} stateService - Сервис для работы с состоянием
   * @param {GamePlay} gamePlay - Игровой компонент
   */
  constructor(stateService: GameStateService, gamePlay: GamePlay) {
    super([], undefined, gamePlay, new GameState());
    this.stateService = stateService;
    this.gameOver = false;
  }

  /**
   * Сохраняет текущее состояние игры в локальное хранилище
   * 
   * @param {PositionedCharacter[]} positionedCharacters - Массив позиционированных персонажей
   * @param {GameState['currentTheme']} currentTheme - Текущая тема игры
   * @param {boolean} gameOver - Флаг окончания игры
   */
  saveGame(
    positionedCharacters: PositionedCharacter[],
    currentTheme: GameState['currentTheme'],
    gameOver: boolean,
    isPlayerTurn: boolean
  ): void {
    try {
      this.gameState!.positionedCharacters = positionedCharacters;
      this.gameState!.currentTheme = currentTheme;
      this.gameState!.gameOver = gameOver;
      this.gameState!.isPlayerTurn = isPlayerTurn;
      this.stateService.save(this.gameState!);

      GamePlay.showMessage('Игра успешно сохранена');
    } catch (error) {
      GamePlay.showError('Ошибка при сохранении игры');
    }
  }

  /**
   * Загружает сохраненное состояние игры из локального хранилища
   * 
   * @returns {boolean} - true если загрузка прошла успешно, иначе false
   */
  loadGame(): boolean {
    try {
      const loadedState = this.stateService.load();
      this.gameState = loadedState;
      this.positionedCharacters = loadedState.positionedCharacters;
      this.currentTheme = loadedState.currentTheme;
      this.gameOver = loadedState.gameOver;

      this.gamePlay!.drawUi(this.currentTheme);
      this.gamePlay!.redrawPositions(this.positionedCharacters);

      GamePlay.showMessage('Игра успешно загружена');

      return true;
    } catch (error) {
      GamePlay.showError('Ошибка при загрузке игры');
      return false;
    }
  }

  /**
   * Возвращает флаг окончания игры
   * 
   * @returns {boolean} - true если игра окончена, иначе false
   */
  isGameOver(): boolean {
    return this.gameOver;
  }
}
