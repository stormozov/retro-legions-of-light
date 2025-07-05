import GameState from '../Game/GameState';
import { GameStateLoadError, GameStateNotFoundError } from '../errors/GameStateErrors';

/**
* Класс GameStateService управляет сохранением и загрузкой состояния игры.
*/
export default class GameStateService {
  private storage: Storage;

  /**
   * Создает новый экземпляр GameStateService.
   * @param {Storage} storage - Объект Storage для сохранения и загрузки состояния игры.
   */
  constructor(storage: Storage) {
    this.storage = storage;
  }

  /**
   * Сохраняет состояние игры в localStorage.
   * @param {GameState} state - Состояние игры для сохранения.
   */
  save(state: GameState): void {
    this.storage.setItem('state', JSON.stringify(state.toObject()));
  }

  /**
   * Загружает состояние игры из localStorage.
   * 
   * @returns {GameState} - Загруженное состояние игры из localStorage в формате GameState.
   * 
   * @throws {GameStateNotFoundError} - Если состояние игры не найдено в localStorage.
   * @throws {GameStateLoadError} - Если состояние игры не может быть загружено из localStorage.
   */
  load(): GameState {
    try {
      const stateString = this.storage.getItem('state');
      if (!stateString) return new GameState();
      const parsed = JSON.parse(stateString);

      return GameState.from(parsed);
    } catch (e) {
      if (e && typeof e === 'object' && 'name' in e && e.name === 'GameStateNotFoundError') throw e;
      throw new GameStateLoadError();
    }
  }
}
