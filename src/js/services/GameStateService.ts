import GameState from '../Game/GameState';

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
   * Сохраняет состояние игры.
   * @param {GameState} state - Состояние игры для сохранения.
   */
  save(state: GameState): void {
    this.storage.setItem('state', JSON.stringify(state));
  }

  /**
   * Загружает состояние игры.
   * @returns {GameState} - Загруженное состояние игры.
   * @throws {Error} - Если не удалось загрузить состояние игры.
   */
  load(): GameState {
    try {
      return JSON.parse(this.storage.getItem('state'));
    } catch (e) {
      throw new Error('Не удалось загрузить состояние игры');
    }
  }
}
