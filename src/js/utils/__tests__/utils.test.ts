import { Bowman } from '../../Entities/Heroes';
import { Undead } from '../../Entities/Enemies';
import PositionedCharacter from '../../Game/PositionedCharacter';
import { 
  calcHealthLevel, 
  calcTileType, 
  findCharacterByIndex, 
  formatCharacterInfo, 
  getRandomMultiplier, 
  isPlayerCharacter, 
  translateMetricName
} from '../utils';

describe('Модуль utils', () => {
  let bowman: Bowman;
  let undead: Undead;
  let positionedBowman: PositionedCharacter;
  let positionedUndead: PositionedCharacter;

  beforeEach(() => {
    bowman = new Bowman();
    undead = new Undead();
    positionedBowman = new PositionedCharacter(bowman, 0);
    positionedUndead = new PositionedCharacter(undead, 1);
  });

  describe('Функция calcTileType(index, boardSize)', () => {
    const testCases = [
      { index: 0, boardSize: 8, expected: 'top-left' },
      { index: 1, boardSize: 8, expected: 'top' },
      { index: 7, boardSize: 8, expected: 'top-right' },
      { index: 8, boardSize: 8, expected: 'left' },
      { index: 9, boardSize: 8, expected: 'center' },
      { index: 15, boardSize: 8, expected: 'right' },
      { index: 56, boardSize: 8, expected: 'bottom-left' },
      { index: 57, boardSize: 8, expected: 'bottom' },
      { index: 63, boardSize: 8, expected: 'bottom-right', },
    ];

    testCases.forEach(({ index, boardSize, expected }) => {
      test(`передан индекс ${index} и поле ${boardSize}x${boardSize}; должен вернуть "${expected}"`, () => {
        expect(calcTileType(index, boardSize)).toBe(expected);
      });
    });
  });

  describe('Функция calcHealthLevel(health)', () => {
    const testCases = [
      { health: 0, expected: 'critical' },
      { health: 14, expected: 'critical' },
      { health: 15, expected: 'normal' },
      { health: 49, expected: 'normal' },
      { health: 50, expected: 'high' },
      { health: 100, expected: 'high' },
    ];

    testCases.forEach(({ health, expected }) => {
      test(`передано здоровье ${health}; должен вернуть "${expected}"`, () => {
        expect(calcHealthLevel(health)).toBe(expected);
      });
    });
  });

  describe('Функция findCharacterByIndex(characters, index)', () => {
    let positionedCharacters: PositionedCharacter[];

    beforeEach(() => {
      positionedCharacters = [
        new PositionedCharacter(bowman, 0),
        new PositionedCharacter(bowman, 1),
      ];
    });

    it('передан список персонажей и индекс; должен вернуть персонажа с указанным индексом', () => {
      expect(findCharacterByIndex(positionedCharacters, 0)).toBe(positionedCharacters[0]);
    });

    it('передан список персонажей и индекс; должен вернуть undefined', () => {
      expect(findCharacterByIndex(positionedCharacters, 2)).toBeUndefined();
    });
  });

  describe('Функция formatCharacterInfo(character)', () => {
    it('передан персонаж Bowman; должен вернуть информацию о персонаже', () => {
      const expected = '🎖1 ⚔25 🛡25 ❤100';
      expect(formatCharacterInfo(bowman)).toBe(expected);
    });
  });

  describe('Функция isPlayerCharacter(positionedCharacter)', () => {
    it('передан персонаж Bowman; должен вернуть true', () => {
      expect(isPlayerCharacter(positionedBowman)).toBe(true);
    });

    it('передан персонаж Undead; должен вернуть false', () => {
      expect(isPlayerCharacter(positionedUndead)).toBe(false);
    });
  });

  describe('Функция translateMetricName(key)', () => {
    it('передан ключ "playerDefeats"; должен вернуть "Поражения игрока"', () => {
      expect(translateMetricName('playerDefeats')).toBe('Поражения игрока');
    });

    it('передан ключ "unknownKey"; должен вернуть "unknownKey', () => {
      expect(translateMetricName('unknownKey')).toBe('unknownKey');
    })
  });

  describe('Функция getRandomMultiplier(base, variance)', () => {
    it('передан базовый показатель 10 и вариация 5; \
      должен вернуть число в диапазоне от 5 до 15', () => {
      expect(getRandomMultiplier(10, 5)).toBeGreaterThanOrEqual(5);
      expect(getRandomMultiplier(10, 5)).toBeLessThanOrEqual(15);
    });
  });
});
