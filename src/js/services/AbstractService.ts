import PositionedCharacter from '../Game/PositionedCharacter';
import GamePlay from '../Game/GamePlay';
import GameState from '../Game/GameState';
import { Theme } from '../types/enums';

/**
 * Абстрактный базовый класс для сервисов, содержащих общие свойства и методы.
 */
export default abstract class AbstractService {
  protected _positionedCharacters: PositionedCharacter[];
  protected _currentTheme?: Theme;
  protected _gamePlay?: GamePlay;
  protected _gameState?: GameState;

  constructor(
    positionedCharacters: PositionedCharacter[],
    currentTheme?: Theme,
    gamePlay?: GamePlay,
    gameState?: GameState
  ) {
    this._positionedCharacters = positionedCharacters;
    this._currentTheme = currentTheme;
    this._gamePlay = gamePlay;
    this._gameState = gameState;
  }

  /**
   * Возвращает массив позиционированных персонажей.
   */
  get positionedCharacters(): PositionedCharacter[] {
    return this._positionedCharacters;
  }

  /**
   * Устанавливает массив позиционированных персонажей.
   */
  set positionedCharacters(positionedCharacters: PositionedCharacter[]) {
    this._positionedCharacters = positionedCharacters;
  }

  /**
   * Возвращает текущую тему игры.
   */
  get currentTheme(): Theme | undefined {
    return this._currentTheme;
  }

  /**
   * Устанавливает текущую тему игры.
   */
  set currentTheme(theme: Theme | undefined) {
    this._currentTheme = theme;
  }

  /**
   * Возвращает экземпляр GamePlay.
   */
  get gamePlay(): GamePlay | undefined {
    return this._gamePlay;
  }

  /**
   * Устанавливает экземпляр GamePlay.
   */
  set gamePlay(gamePlay: GamePlay | undefined) {
    this._gamePlay = gamePlay;
  }

  /**
   * Возвращает состояние игры.
   */
  get gameState(): GameState | undefined {
    return this._gameState;
  }

  /**
   * Устанавливает состояние игры.
   */
  set gameState(gameState: GameState | undefined) {
    this._gameState = gameState;
  }
}
