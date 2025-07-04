import Character from '../../Entities/Character';
import { Bowman } from '../../Entities/Heroes';
import GamePlay from '../../Game/GamePlay';
import GameState from '../../Game/GameState';
import PositionedCharacter from '../../Game/PositionedCharacter';
import { Theme } from '../../types/enums';
import AbstractService from '../AbstractService';

describe('Класс AbstractService', () => {
  let positionedCharacters: PositionedCharacter[];
  let currentTheme: Theme | undefined;
  let gamePlay: GamePlay | undefined;
  let gameState: GameState | undefined;
  let service: TestService;
  let dummyCharacter: Character;

  // Конкретный подкласс для создания экземпляра AbstractService для тестирования
  class TestService extends AbstractService {}

  beforeEach(() => {
    dummyCharacter = new Bowman();
    positionedCharacters = [new PositionedCharacter(dummyCharacter, 0)];
    currentTheme = Theme.Prairie;
    gamePlay = new GamePlay();
    gameState = new GameState();

    service = new TestService(positionedCharacters, currentTheme, gamePlay, gameState);
  });

  describe('Конструктор', () => {
    it('должен инициализировать positionedCharacters корректно', () => {
      expect(service.positionedCharacters).toEqual(positionedCharacters);
    });

    it('должен инициализировать currentTheme корректно', () => {
      expect(service.currentTheme).toBe(currentTheme);
    });

    it('должен инициализировать gamePlay корректно', () => {
      expect(service.gamePlay).toBe(gamePlay);
    });

    it('должен инициализировать gameState корректно', () => {
      expect(service.gameState).toBe(gameState);
    });
  });

  describe('Геттер/сеттер positionedCharacters()', () => {
    it('вызван геттер; возвращает массив с позиционным персонажем', () => {
      expect(service.positionedCharacters).toEqual(positionedCharacters);
    });

    it('присваиваем массив с позиционным персонажем; должен установить этот же массив', () => {
      const newPositionedCharacters = [new PositionedCharacter(dummyCharacter, 1)];
      service.positionedCharacters = newPositionedCharacters;

      expect(service.positionedCharacters).toEqual(newPositionedCharacters);
    });

    it('присваиваем пустой массив; должен установить пустой массив', () => {
      service.positionedCharacters = [];
      expect(service.positionedCharacters).toEqual([]);
    });
  });

  describe('Геттер/сеттер currentTheme()', () => {
    it('вызван геттер; возвращает currentTheme', () => {
      expect(service.currentTheme).toBe(currentTheme);
    });

    it('присваиваем Theme.Desert; должен установить Theme.Desert', () => {
      service.currentTheme = Theme.Desert;
      expect(service.currentTheme).toBe(Theme.Desert);
    });

    it('присваиваем undefined; должен установить undefined', () => {
      service.currentTheme = undefined;
      expect(service.currentTheme).toBeUndefined();
    });
  });

  describe('Геттер/сеттер gamePlay()', () => {
    it('вызван геттер; возвращает gamePlay', () => {
      expect(service.gamePlay).toBe(gamePlay);
    });

    it('присваиваем GamePlay(); должен установить GamePlay()', () => {
      const newGamePlay = new GamePlay();
      service.gamePlay = newGamePlay;

      expect(service.gamePlay).toBe(newGamePlay);
    });

    it('присваиваем undefined; должен установить undefined', () => {
      service.gamePlay = undefined;
      expect(service.gamePlay).toBeUndefined();
    });
  });

  describe('Геттер/сеттер gameState()', () => {
    it('вызван геттер; возвращает gameState', () => {
      expect(service.gameState).toBe(gameState);
    });

    it('присваиваем GameState(); должен установить GameState()', () => {
      const newGameState = new GameState();
      service.gameState = newGameState;

      expect(service.gameState).toBe(newGameState);
    });

    it('присваиваем undefined; должен установить undefined', () => {
      service.gameState = undefined;
      expect(service.gameState).toBeUndefined();
    });
  });
});
