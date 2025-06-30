import { Demon, Undead, Vampire } from '../../Entities/Enemies';
import { Bowman, Magician, Swordsman } from '../../Entities/Heroes';
import { CharacterType, Theme } from '../../types/enums';
import GameState from '../GameState';
import PositionedCharacter from '../PositionedCharacter';

describe('Класс GameState', () => {
  describe('constructor', () => {
    it('создан экземпляр класса; должен инициализироваться со значениями по умолчанию', () => {
      const gameState = new GameState();

      expect(gameState.isPlayerTurn).toBe(true);
      expect(gameState.positionedCharacters).toEqual([]);
      expect(gameState.selectedCellIndex).toBeNull();
      expect(gameState.currentTheme).toBe(Theme.Prairie);
      expect(gameState.gameOver).toBe(false);
      expect(gameState.statistics).toEqual({
        playerDefeats: 0,
        enemiesKilled: 0,
        totalLevelsCompleted: 0,
        maxLevelReached: 0,
        saveUsageCount: 0,
        loadUsageCount: 0,
      });
    });
  });

  describe('Метод from()', () => {
    it('передан объект со всеми свойствами; должен быть создан экземпляр класса', () => {
      const obj = {
        isPlayerTurn: false,
        selectedCellIndex: 5,
        currentTheme: Theme.Desert,
        gameOver: true,
        positionedCharacters: [
          {
            character: {
              level: 2,
              type: CharacterType.Swordsman,
              attack: 10,
              defense: 5,
              health: 20,
            },
            position: 3,
          },
          {
            character: {
              level: 1,
              type: CharacterType.Bowman,
              attack: 8,
              defense: 4,
              health: 18,
            },
            position: 7,
          },
        ],
        statistics: {
          playerDefeats: 1,
          enemiesKilled: 2,
          totalLevelsCompleted: 3,
          maxLevelReached: 4,
          saveUsageCount: 5,
          loadUsageCount: 6,
        },
      };

      const gameState = GameState.from(obj);

      expect(gameState.isPlayerTurn).toBe(false);
      expect(gameState.selectedCellIndex).toBe(5);
      expect(gameState.currentTheme).toBe(Theme.Desert);
      expect(gameState.gameOver).toBe(true);
      expect(gameState.positionedCharacters.length).toBe(2);

      const pc1 = gameState.positionedCharacters[0];
      expect(pc1.position).toBe(3);
      expect(pc1.character.level).toBe(2);
      expect(pc1.character.type).toBe(CharacterType.Swordsman);
      expect(pc1.character.attack).toBe(10);
      expect(pc1.character.defense).toBe(5);
      expect(pc1.character.health).toBe(20);

      const pc2 = gameState.positionedCharacters[1];
      expect(pc2.position).toBe(7);
      expect(pc2.character.level).toBe(1);
      expect(pc2.character.type).toBe(CharacterType.Bowman);
      expect(pc2.character.attack).toBe(8);
      expect(pc2.character.defense).toBe(4);
      expect(pc2.character.health).toBe(18);

      expect(gameState.statistics).toEqual({
        playerDefeats: 1,
        enemiesKilled: 2,
        totalLevelsCompleted: 3,
        maxLevelReached: 4,
        saveUsageCount: 5,
        loadUsageCount: 6,
      });
    });

    it('передан объект с несколькими свойствами; \
должен с пустыми позициями персонажей и статистикой по умолчанию, \
если она отсутствует', () => {
      const obj = {
        isPlayerTurn: true,
        selectedCellIndex: null,
        currentTheme: Theme.Mountain,
        gameOver: false,
      } as any;

      const gameState = GameState.from(obj);

      expect(gameState.positionedCharacters).toEqual([]);
      expect(gameState.statistics).toEqual({
        playerDefeats: 0,
        enemiesKilled: 0,
        totalLevelsCompleted: 0,
        maxLevelReached: 0,
        saveUsageCount: 0,
        loadUsageCount: 0,
      });
    });

    it('передан объект с полями статистики, значения которых равны undefined или null; \
должен создать объект с нулевыми значениями', () => {
      const obj = {
        isPlayerTurn: true,
        selectedCellIndex: null,
        currentTheme: Theme.Prairie,
        gameOver: false,
        positionedCharacters: [],
        statistics: {
          playerDefeats: undefined,
          enemiesKilled: null,
          totalLevelsCompleted: undefined,
          maxLevelReached: null,
          saveUsageCount: undefined,
          loadUsageCount: null,
        },
      } as any;

      const gameState = GameState.from(obj);

      expect(gameState.statistics).toEqual({
        playerDefeats: 0,
        enemiesKilled: 0,
        totalLevelsCompleted: 0,
        maxLevelReached: 0,
        saveUsageCount: 0,
        loadUsageCount: 0,
      });
    });
  });

  describe('Метод toObject()', () => {
    it('вызван метод; должен преобразовать GameState в обычный объект', () => {
      const gameState = new GameState();
      gameState.isPlayerTurn = false;
      gameState.selectedCellIndex = 4;
      gameState.currentTheme = Theme.Mountain;
      gameState.gameOver = true;

      const character = new Swordsman();
      character.level = 3;
      character.attack = 12;
      character.defense = 6;
      character.health = 25;

      const positionedCharacter = new PositionedCharacter(character, 8);
      gameState.positionedCharacters = [positionedCharacter];

      gameState.statistics = {
        playerDefeats: 2,
        enemiesKilled: 3,
        totalLevelsCompleted: 4,
        maxLevelReached: 5,
        saveUsageCount: 6,
        loadUsageCount: 7,
      };

      const obj = gameState.toObject();

      expect(obj).toEqual({
        isPlayerTurn: false,
        currentTheme: Theme.Mountain,
        gameOver: true,
        positionedCharacters: [
          {
            character: {
              level: 3,
              type: CharacterType.Swordsman,
              attack: 12,
              defense: 6,
              health: 25,
            },
            position: 8,
          },
        ],
        statistics: {
          playerDefeats: 2,
          enemiesKilled: 3,
          totalLevelsCompleted: 4,
          maxLevelReached: 5,
          saveUsageCount: 6,
          loadUsageCount: 7,
        },
      } as const);
    });
  });

  describe('Метод createCharacterFromObject()', () => {
    it('передан объект с полями персонажа; должен создать экземпляр соответствующего класса', () => {
      const obj = {
        level: 1,
        type: CharacterType.Magician,
        attack: 9,
        defense: 3,
        health: 15,
      };

      const character = GameState.createCharacterFromObject(obj);

      expect(character).toBeInstanceOf(Magician);
      expect(character.level).toBe(1);
      expect(character.attack).toBe(9);
      expect(character.defense).toBe(3);
      expect(character.health).toBe(15);
    });
  });

  describe('Метод getCharacterClassByType()', () => {
    it('передан тип персонажа; должен вернуть соответствующий класс', () => {
      expect(GameState['getCharacterClassByType'](CharacterType.Swordsman)).toBe(Swordsman);
      expect(GameState['getCharacterClassByType'](CharacterType.Bowman)).toBe(Bowman);
      expect(GameState['getCharacterClassByType'](CharacterType.Magician)).toBe(Magician);
      expect(GameState['getCharacterClassByType'](CharacterType.Demon)).toBe(Demon);
      expect(GameState['getCharacterClassByType'](CharacterType.Undead)).toBe(Undead);
      expect(GameState['getCharacterClassByType'](CharacterType.Vampire)).toBe(Vampire);
    });

    it('передан неизвестный тип персонажа; должен вернуть класс Swordsman', () => {
      expect(GameState['getCharacterClassByType']('unknown-type')).toBe(Swordsman);
    });
  });
});
