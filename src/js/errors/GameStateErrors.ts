/**
 * Особый тип ошибки, возникающий при попытке получить состояние игры 
 * из localStorage, когда оно не найдено или удалено.
 * 
 * @param {string} message - сообщение об ошибке.
 * 
 * @example
 * try {
 *   const gameState = loadGameStateFromStorage();
 * } catch (error) {
 *   if (error instanceof GameStateNotFoundError) {
 *     console.log('Состояние игры не найдено:', error.message);
 *   }
 * }
 * 
 * @class GameStateNotFoundError
 * @extends Error
 */
export class GameStateNotFoundError extends Error {
  static defaultMessage = 'Состояние игры не найдено в localStorage';

  constructor(message?: string) {
    // istanbul ignore next: known issue with constructor/super coverage
    super(message || GameStateNotFoundError.defaultMessage);
    this.name = 'GameStateNotFoundError';
  }
}

/**
 * Специальный тип ошибки, возникающий при неудачной попытке загрузки состояния 
 * игры из localStorage.
 * 
 * @param {string} message - сообщение об ошибке.
 * 
 * @example
 * try {
 *   const gameState = loadGameStateFromStorage();
 * } catch (error) {
 *   if (error instanceof GameStateLoadError) {
 *     console.error('Ошибка загрузки состояния игры:', error.message);
 *   }
 * }
 * 
 * @class GameStateLoadError
 * @extends Error
 */
export class GameStateLoadError extends Error {
  static defaultMessage = 'Не удалось загрузить состояние игры из localStorage';

  constructor(message?: string) {
    // istanbul ignore next: known issue with constructor/super coverage
    super(message || GameStateLoadError.defaultMessage);
    this.name = 'GameStateLoadError';
  }
}
