import { isPlayerTurnObject } from '../types/types';

/**
 * Класс GameState представляет состояние игры.
 */
export default class GameState {
  isPlayerTurn: boolean;

  constructor() {
    this.isPlayerTurn = true;
  }

  /**
   * Создает объект GameState из переданного объекта.
   * 
   * @param {object} object - Объект, из которого создается GameState.
   * @returns {GameState} - Созданный объект GameState.
   * 
   * @static
   */
  static from(object: isPlayerTurnObject): GameState {
    const state = new GameState();
    state.isPlayerTurn = object.isPlayerTurn;

    return state;
  }
}
