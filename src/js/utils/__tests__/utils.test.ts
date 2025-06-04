import { Bowman } from '../../Entities/Heroes';
import PositionedCharacter from '../../Game/PositionedCharacter';
import { calcHealthLevel, calcTileType, findCharacterByIndex } from '../utils';

describe('Модуль utils', () => {
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
    const positionedCharacters = [
      new PositionedCharacter(new Bowman(), 0),
      new PositionedCharacter(new Bowman(), 1),
    ];

    it('передан список персонажей и индекс; должен вернуть персонажа с указанным индексом', () => {
      expect(findCharacterByIndex(positionedCharacters, 0)).toBe(positionedCharacters[0]);
    });

    it('передан список персонажей и индекс; должен вернуть undefined', () => {
      expect(findCharacterByIndex(positionedCharacters, 2)).toBeUndefined();
    })
  });
});
