import { calcTileType } from '../utils';

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
      { index: 63, boardSize: 8, expected: 'bottom-right' },
    ];

    testCases.forEach(({ index, boardSize, expected }) => {
      test(`передан индекс ${index} и поле ${boardSize}x${boardSize}; должен вернуть "${expected}"`, () => {
        expect(calcTileType(index, boardSize)).toBe(expected);
      });
    });
  });
});
