import GameSavingService from '../GameSavingService';
import GameStateService from '../GameStateService';
import GamePlay from '../../Game/GamePlay';
import PositionedCharacter from '../../Game/PositionedCharacter';
import GameState from '../../Game/GameState';
import { Theme } from '../../types/enums';

jest.mock('../../Game/GamePlay', () => {
  return {
    __esModule: true,
    default: {
      showMessage: jest.fn(),
      showError: jest.fn(),
    },
  };
});

describe('Класс GameSavingService', () => {
  let stateServiceMock: jest.Mocked<GameStateService>;
  let gamePlayMock: jest.Mocked<GamePlay>;
  let service: GameSavingService;
  let positionedCharacters: PositionedCharacter[];
  let currentTheme: Theme;

  beforeEach(() => {
    stateServiceMock = {
      save: jest.fn(),
      load: jest.fn(),
    } as unknown as jest.Mocked<GameStateService>;

    gamePlayMock = {
      drawUi: jest.fn(),
      redrawPositions: jest.fn(),
    } as unknown as jest.Mocked<GamePlay>;

    positionedCharacters = [];
    currentTheme = Theme.Prairie;

    service = new GameSavingService(stateServiceMock, gamePlayMock);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Метод saveGame()', () => {
    it('должен сохранить состояние игры и показать сообщение об успехе', () => {
      service.saveGame(positionedCharacters, currentTheme, false, true);

      expect(stateServiceMock.save).toHaveBeenCalledWith(expect.objectContaining({
        positionedCharacters,
        currentTheme,
        gameOver: false,
        isPlayerTurn: true,
      }));
      expect(GamePlay.showMessage).toHaveBeenCalledWith('Игра успешно сохранена');
    });

    it('вызвано исключение; должен показать сообщение об ошибке', () => {
      stateServiceMock.save.mockImplementation(() => {
        throw new Error('save error');
      });

      service.saveGame(positionedCharacters, currentTheme, false, true);

      expect(GamePlay.showError).toHaveBeenCalledWith('Ошибка при сохранении игры');
    });
  });

  describe('Метод loadGame()', () => {
    it('должен загрузить состояние игры и показать сообщение об успехе', () => {
      const loadedState = new GameState();
      loadedState.positionedCharacters = positionedCharacters;
      loadedState.currentTheme = currentTheme;
      loadedState.gameOver = false;

      stateServiceMock.load.mockReturnValue(loadedState);

      const result = service.loadGame();

      expect(stateServiceMock.load).toHaveBeenCalled();
      expect(service['gameState']).toBe(loadedState);
      expect(service['positionedCharacters']).toBe(loadedState.positionedCharacters);
      expect(service['currentTheme']).toBe(loadedState.currentTheme);
      expect(service['gameOver']).toBe(loadedState.gameOver);
      expect(gamePlayMock.drawUi).toHaveBeenCalledWith(currentTheme);
      expect(gamePlayMock.redrawPositions).toHaveBeenCalledWith(positionedCharacters);
      expect(GamePlay.showMessage).toHaveBeenCalledWith('Игра успешно загружена');
      expect(result).toBe(true);
    });

    it('вызвано исключение; должен показать сообщение об ошибке и вернуть false', () => {
      stateServiceMock.load.mockImplementation(() => {
        throw new Error('load error');
      });

      const result = service.loadGame();

      expect(GamePlay.showError).toHaveBeenCalledWith('Ошибка при загрузке игры');
      expect(result).toBe(false);
    });
  });

  describe('Метод isGameOver()', () => {
    it('должен возвращать флаг окончания игры', () => {
      expect(service.isGameOver()).toBe(false);

      (service as any).gameOver = true;
      expect(service.isGameOver()).toBe(true);
    });
  });
});
