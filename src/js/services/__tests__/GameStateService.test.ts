import GameState from '../../Game/GameState';
import { GameStateNotFoundError } from '../../errors/GameStateErrors';
import GameStateService from '../GameStateService';

jest.mock('../../Game/GameState');

describe('Класс GameStateService', () => {
  let storageMock: Storage;
  let service: GameStateService;

  beforeEach(() => {
    storageMock = {
      getItem: jest.fn(),
      setItem: jest.fn(),
      removeItem: jest.fn(),
      clear: jest.fn(),
      key: jest.fn(),
      length: 0,
    };
    service = new GameStateService(storageMock);
  });

  describe('Метод save()', () => {
    it('должен сохранить состояние игры в хранилище в виде строкового объекта', () => {
      const stateObject = { some: 'state' };
      const stateMock = {
        toObject: jest.fn().mockReturnValue(stateObject),
      } as unknown as GameState;

      service.save(stateMock);

      expect(stateMock.toObject).toHaveBeenCalled();
      expect(storageMock.setItem).toHaveBeenCalledWith('state', JSON.stringify(stateObject));
    });
  });

  describe('load', () => {
    it('должен загрузить и вернуть экземпляр GameState из хранилища', () => {
      const storedString = '{"some":"state"}';
      (storageMock.getItem as jest.Mock).mockReturnValue(storedString);

      const parsedObject = JSON.parse(storedString);
      const gameStateInstance = {} as GameState;
      (GameState.from as jest.Mock).mockReturnValue(gameStateInstance);

      const result = service.load();

      expect(storageMock.getItem).toHaveBeenCalledWith('state');
      expect(GameState.from).toHaveBeenCalledWith(parsedObject);
      expect(result).toBe(gameStateInstance);
    });

    it('состояние не найдено; должно вызывать ошибку GameStateNotFoundError', () => {
      (storageMock.getItem as jest.Mock).mockImplementation(() => {
        throw new GameStateNotFoundError();
      });

      try {
        service.load();
        fail('Expected GameStateNotFoundError to be thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        expect(error.name).toBe('GameStateNotFoundError');
      }
    });

    it('JSON.parse выдаёт ошибку; должен выдавать GameStateLoadError', () => {
      (storageMock.getItem as jest.Mock).mockReturnValue('invalid json');

      try {
        service.load();
        fail('Expected GameStateLoadError to be thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        expect(error.name).toBe('GameStateLoadError');
      }
    });

    it('stateString имеет значение false; должен возвращать новый экземпляр GameState', () => {
      (storageMock.getItem as jest.Mock).mockReturnValue(null);

      const result = service.load();

      expect(result).toBeInstanceOf(GameState);
    });
  });
});
