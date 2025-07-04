import CharacterActionService from '../CharacterActionService';
import PositionedCharacter from '../../Game/PositionedCharacter';
import Swordsman from '../../Entities/Heroes/Swordsman';
import Bowman from '../../Entities/Heroes/Bowman';
import Magician from '../../Entities/Heroes/Magician';
import Demon from '../../Entities/Enemies/Demon';
import Undead from '../../Entities/Enemies/Undead';
import Vampire from '../../Entities/Enemies/Vampire';

describe('Класс CharacterActionService', () => {
  // Помощник для создания PositionedCharacter
  function createPositionedCharacter(character: any, position: number): PositionedCharacter {
    return new PositionedCharacter(character, position);
  }

  describe('Метод getAvailableMoveCells()', () => {
    it('передан Swordsman (макс. передвижение - 4); должен вернуть корректные клетки для перемещения', () => {
      const positionedCharacters = [createPositionedCharacter(new Swordsman(), 27)];
      const service = new CharacterActionService(positionedCharacters);
      const moveCells = service.getAvailableMoveCells(27);
      
      // Максимальное расстояние перемещения мечника — 4, поэтому клетки должны 
      // находиться на расстоянии 4 шагов в любом направлении
      expect(moveCells.length).toBeGreaterThan(0);
      
      // Все ячейки должны находиться внутри доски и быть незанятыми
      moveCells.forEach((cell) => {
        expect(cell).toBeGreaterThanOrEqual(0);
        expect(cell).toBeLessThan(64);
        expect(cell).not.toBe(27); // нельзя переместиться на собственную ячейку
      });
    });

    it('переданы Magician и Demon (макс. передвижение - 1); должен вернуть корректные клетки для перемещения', () => {
      const positionedCharacters = [
        createPositionedCharacter(new Magician(), 27),
        createPositionedCharacter(new Demon(), 10),
      ];

      const service = new CharacterActionService(positionedCharacters);
      const magicianMoveCells = service.getAvailableMoveCells(27);
      const demonMoveCells = service.getAvailableMoveCells(10);
      
      expect(magicianMoveCells.length).toBeGreaterThan(0);
      expect(demonMoveCells.length).toBeGreaterThan(0);
    });

    it('передан неизвестный тип; должен вернуть пустой массив', () => {
      class MockCharacter {
        constructor(public type: any) {}
      }

      const unknown = new MockCharacter('unknown');
      const positionedCharacters = [
        createPositionedCharacter(unknown, 27),
      ];
      const service = new CharacterActionService(positionedCharacters);
      const moveCells = service.getAvailableMoveCells(27);

      expect(moveCells).toEqual([]);
    });

    it('передана позиция 10 и индекс 99; должен вернуть пустой массив', () => {
      const positionedCharacters = [createPositionedCharacter(new Bowman(), 10)];
      const service = new CharacterActionService(positionedCharacters);
      const moveCells = service.getAvailableMoveCells(99); // нет персонажа на 99

      expect(moveCells).toEqual([]);
    });

    it('переданы Bowman и Magician с позициями 10 и 14; должен исключить занятые клетки', () => {
      const positionedCharacters = [
        createPositionedCharacter(new Bowman(), 10),
        createPositionedCharacter(new Magician(), 14), // занимает ячейку в диапазоне
      ];
      const service = new CharacterActionService(positionedCharacters);
      const moveCells = service.getAvailableMoveCells(10);

      expect(moveCells).not.toContain(14);
    });

    it('передан Swordsman с позицией 27; должен исключить соседство с занятыми ячейками', () => {
      // Размещаем персонажа в ячейке 27 и заполняем все соседние ячейки
      const occupiedPositions = [19, 20, 21, 26, 28, 33, 34, 35]; // ближайшие соседние ячейки — около 27
      const positionedCharacters = [
        createPositionedCharacter(new Swordsman(), 27),
        ...occupiedPositions.map(pos => createPositionedCharacter(new Bowman(), pos)),
      ];
      const service = new CharacterActionService(positionedCharacters);
      const moveCells = service.getAvailableMoveCells(27);

      // Ни одна из соседних ячеек не должна находиться в moveCells
      occupiedPositions.forEach(pos => {
        expect(moveCells).not.toContain(pos);
      });

      // В пределах досягаемости должны быть ещё какие-то клетки
      expect(moveCells.length).toBeGreaterThan(0);
    });
  });

  describe('Метод getAvailableAttackCells()', () => {
    it('переданы Swordsman и Demon с позицией 27 и 28; должен вернуть корректные клетки для атаки мечником', () => {
      const positionedCharacters = [
        createPositionedCharacter(new Swordsman(), 27),
        createPositionedCharacter(new Demon(), 28), // враг рядом
      ];
      const service = new CharacterActionService(positionedCharacters);
      const attackCells = service.getAvailableAttackCells(27);

      expect(attackCells).toContain(28);
      expect(attackCells).not.toContain(27); // Не должен включать собственную позицию
    });

    it('передан неизвестный тип; должен вернуть пустой массив', () => {
      class MockCharacter {
        constructor(public type: any) {}
      }

      const unknown = new MockCharacter('unknown_type');
      const positionedCharacters = [
        createPositionedCharacter(unknown, 27),
      ];
      const service = new CharacterActionService(positionedCharacters);
      const attackCells = service.getAvailableAttackCells(27);

      expect(attackCells).toEqual([]);
    });

    it('переданы Magician, Undead и Bowman с позицией 27, 30 и 31; должен вернуть корректные клетки для атаки', () => {
      const positionedCharacters = [
        createPositionedCharacter(new Magician(), 27),
        createPositionedCharacter(new Undead(), 31), // враг в пределах 4 клеток
        createPositionedCharacter(new Bowman(), 30), // персонаж игрока, не должен подвергаться нападению
      ];
      const service = new CharacterActionService(positionedCharacters);
      const attackCells = service.getAvailableAttackCells(27);

      expect(attackCells).toContain(31);
      expect(attackCells).not.toContain(30);
    });

    it('передан индекс 99 для Vampire с позицией 5; должен вернуть пустой массив', () => {
      const positionedCharacters = [createPositionedCharacter(new Vampire(), 5)];
      const service = new CharacterActionService(positionedCharacters);
      const attackCells = service.getAvailableAttackCells(99);

      expect(attackCells).toEqual([]);
    });

    it('переданы Swordsman, Bowman и Demon с позицией 10, 11 и 12; \
должен исключить дружественных персонажей из атакующих ячеек', () => {
      const positionedCharacters = [
        createPositionedCharacter(new Bowman(), 10),
        createPositionedCharacter(new Swordsman(), 11), // дружественный персонаж
        createPositionedCharacter(new Demon(), 12), // враг рядом
      ];
      const service = new CharacterActionService(positionedCharacters);
      const attackCells = service.getAvailableAttackCells(10);

      expect(attackCells).toContain(12);
      expect(attackCells).not.toContain(11);
    });
  });
});
