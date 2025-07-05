import { GameStateNotFoundError, GameStateLoadError } from '../GameStateErrors';

describe('GameStateErrors', () => {
  describe('Класс GameStateNotFoundError', () => {
    it('не указано сообщение; должно использоваться сообщение по умолчанию', () => {
      const error = new GameStateNotFoundError();

      expect(error.message).toBe('Состояние игры не найдено в localStorage');
      expect(error.name).toBe('GameStateNotFoundError');
      expect(error).toBeInstanceOf(Error);
    });

    it('передано определенное сообщение; должно использоваться это сообщение', () => {
      const customMessage = 'Игровое состояние было удалено';
      const error = new GameStateNotFoundError(customMessage);

      expect(error.message).toBe(customMessage);
      expect(error.name).toBe('GameStateNotFoundError');
      expect(error).toBeInstanceOf(Error);
    });
  });

  describe('Класс GameStateLoadError', () => {
    it('не указано сообщение; должно использоваться сообщение по умолчанию', () => {
      const error = new GameStateLoadError();

      expect(error.message).toBe('Не удалось загрузить состояние игры из localStorage');
      expect(error.name).toBe('GameStateLoadError');
      expect(error).toBeInstanceOf(Error);
    });

    it('передано определенное сообщение; должно использоваться это сообщение', () => {
      const customMessage = 'Ошибка парсинга состояния игры';
      const error = new GameStateLoadError(customMessage);

      expect(error.message).toBe(customMessage);
      expect(error.name).toBe('GameStateLoadError');
      expect(error).toBeInstanceOf(Error);
    });
  });
});
