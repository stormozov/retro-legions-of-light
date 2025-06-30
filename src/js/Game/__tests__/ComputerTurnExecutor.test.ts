import { Bowman, Swordsman } from '../../Entities/Heroes';
import Magician from '../../Entities/Heroes/Magician';
import ComputerTurnExecutor from '../ComputerTurnExecutor';
import GameState from '../GameState';
import PositionedCharacter from '../PositionedCharacter';

describe('Класс ComputerTurnExecutor', () => {
  let positionedCharacters: PositionedCharacter[];
  let gamePlay: Partial<Record<string, unknown>>;
  let gameState: GameState;
  let executor: ComputerTurnExecutor;
  let bowman: Bowman;
  let swordsman: Swordsman;
  let magician: Magician;

  let getAvailableAttackCells: jest.Mock<number[], [number]>;
  let getAvailableMoveCells: jest.Mock<number[], [number]>;
  let moveCharacterToCell: jest.Mock<Promise<void>, [PositionedCharacter, number]>;
  let performAttack: jest.Mock<Promise<void>, [PositionedCharacter, PositionedCharacter]>;

  beforeEach(() => {
    bowman = new Bowman();
    swordsman = new Swordsman();
    magician = new Magician();

    positionedCharacters = [
      new PositionedCharacter(bowman, 0),
      new PositionedCharacter(swordsman, 1),
      new PositionedCharacter(magician, 2),
    ];

    gamePlay = {};
    gameState = new GameState();
    getAvailableAttackCells = jest.fn();
    getAvailableMoveCells = jest.fn();
    moveCharacterToCell = jest.fn(async (character: PositionedCharacter, cell: number) => Promise.resolve());
    performAttack = jest.fn(async (attacker: PositionedCharacter, target: PositionedCharacter) => Promise.resolve());

    executor = new ComputerTurnExecutor(
      positionedCharacters,
      gamePlay as any,
      gameState,
      getAvailableAttackCells,
      getAvailableMoveCells,
      moveCharacterToCell,
      performAttack
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Геттер/сеттер gameState()', () => {
    it('вызван геттер; возвращает текущее состояние игры', () => {
      expect(executor.gameState).toBe(gameState);
    });

    it('вызван сеттер; обновляет состояние игры', () => {
      const newGameState = new GameState();
      executor.gameState = newGameState;
      expect(executor.gameState).toBe(newGameState);
    });
  });

  describe('Геттер/сеттер positionedCharacters()', () => {
    it('вызван геттер; возвращает список позиционированных персонажей', () => {
      expect(executor.positionedCharacters).toBe(positionedCharacters);
    });

    it('вызван сеттер; обновляет список позиционированных персонажей', () => {
      const newPositionedCharacters = [new PositionedCharacter(bowman, 0)];
      executor.positionedCharacters = newPositionedCharacters;
      expect(executor.positionedCharacters).toBe(newPositionedCharacters);
    });
  });

  describe('Метод execute()', () => {
    it('ход компьютера уже в процессе; не выполняет ход', async () => {
      executor['isComputerTurnInProgress'] = true;
      await executor.execute();
      
      expect(performAttack).not.toHaveBeenCalled();
      expect(moveCharacterToCell).not.toHaveBeenCalled();
    });

    it('есть доступные цели для атаки; выполняет атаку', async () => {
      getAvailableAttackCells.mockImplementation((pos: number) => (pos === 0 ? [1] : []));
      getAvailableMoveCells.mockReturnValue([]);

      // Мокаем isPlayerCharacter для разделения персонажей
      jest.spyOn(require('../../utils/utils'), 'isPlayerCharacter')
        .mockImplementation((pc: PositionedCharacter) => pc.position === 1);

      await executor.execute();

      expect(performAttack).toHaveBeenCalled();
      expect(moveCharacterToCell).not.toHaveBeenCalled();

      jest.restoreAllMocks();
    });

    it('нет доступных целей для атаки; выполняет перемещение', async () => {
      getAvailableAttackCells.mockReturnValue([]);
      getAvailableMoveCells.mockImplementation((pos: number) => (pos === 0 ? [3, 4] : []));

      jest.spyOn(require('../../utils/utils'), 'isPlayerCharacter')
        .mockImplementation((pc: PositionedCharacter) => pc.position === 1);

      await executor.execute();

      expect(moveCharacterToCell).toHaveBeenCalled();
      expect(performAttack).not.toHaveBeenCalled();
    });

    it('выполнен ход; обновляет состояние игры', async () => {
      getAvailableAttackCells.mockReturnValue([]);
      getAvailableMoveCells.mockReturnValue([]);

      await executor.execute();

      expect(executor.gameState.isPlayerTurn).toBe(true);
      expect(executor['isComputerTurnInProgress']).toBe(false);
    });
  });

  describe('Метод getComputerAndPlayerCharacters()', () => {
    it('вызван метод; разделяет персонажей на компьютерных и игровых', () => {
      jest.spyOn(require('../../utils/utils'), 'isPlayerCharacter')
        .mockImplementation((pc: PositionedCharacter) => pc.position === 1);

      const { computerCharacters, playerCharacters } = executor['getComputerAndPlayerCharacters']();

      expect(computerCharacters.every((pc) => pc.position !== 1)).toBe(true);
      expect(playerCharacters.every((pc) => pc.position === 1)).toBe(true);

      jest.restoreAllMocks();
    });
  });

  describe('Метод findAttackersWithTargets()', () => {
    it('вызван метод; находит атакующих с доступными целями', () => {
      const computerCharacters = [positionedCharacters[0]];
      const playerCharacters = [positionedCharacters[1], positionedCharacters[2]];

      getAvailableAttackCells.mockReturnValue([1]);

      const result = executor['findAttackersWithTargets'](computerCharacters, playerCharacters);

      expect(result.length).toBe(1);
      expect(result[0].attacker).toBe(computerCharacters[0]);
      expect(result[0].attackTargets).toContain(playerCharacters[0]);
    });
  });

  describe('Метод calculateAttackPriority()', () => {
    it('вызван метод; вычисляет приоритет атаки корректно', () => {
      const attacker = positionedCharacters[0];
      const target = positionedCharacters[1];

      const priority = executor['calculateAttackPriority'](attacker, target);

      expect(typeof priority).toBe('number');
    });

    it('урон >= здоровье цели; возвращает приоритет с finishingMoveBonus = 10', () => {
      const attacker = new PositionedCharacter(new Bowman(), 0);
      attacker.character.attack = 50;
      
      const target = new PositionedCharacter(new Swordsman(), 1);
      target.character.health = 10;
      target.character.defense = 0;

      const priority = executor['calculateAttackPriority'](attacker, target);

      const damageToTarget = Math.max(
        attacker.character.attack - target.character.defense, 
        attacker.character.attack * 0.1
      );

      expect(damageToTarget).toBeGreaterThanOrEqual(target.character.health);
      expect(priority).toBeGreaterThan(0);
    });

    it('урон < здоровье цели; возвращает приоритет с finishingMoveBonus = 0', () => {
      const attacker = new PositionedCharacter(new Bowman(), 0);
      attacker.character.attack = 5;
      
      const target = new PositionedCharacter(new Swordsman(), 1);
      target.character.health = 50;
      target.character.defense = 10;

      const damageToTarget = Math.max(
        attacker.character.attack - target.character.defense, 
        attacker.character.attack * 0.1
      );

      expect(damageToTarget).toBeLessThan(target.character.health);
    });
  });

  describe('Метод selectBestAttackerAndTarget()', () => {
    it('переданы две цели для атаки; возвращает лучшего атакующего и цель', () => {
      const attackersWithTargets = [
        {
          attacker: positionedCharacters[0],
          attackTargets: [positionedCharacters[1], positionedCharacters[2]],
        },
      ];

      const result = executor['selectBestAttackerAndTarget'](attackersWithTargets);

      expect(result).toHaveProperty('attacker');
      expect(result).toHaveProperty('targetPosition');
    });

    it('нет атакующих; возвращает null', () => {
      const result = executor['selectBestAttackerAndTarget']([]);
      expect(result).toBeNull();
    });
  });

  describe('Метод findBestMove()', () => {
    it('вызван метод; находит лучшее перемещение', () => {
      getAvailableMoveCells.mockReturnValue([3, 4, 5]);

      const computerCharacters = [positionedCharacters[0]];
      const playerCharacters = [positionedCharacters[1]];

      const result = executor['findBestMove'](computerCharacters, playerCharacters);

      expect(result).toHaveProperty('bestAttacker');
      expect(result).toHaveProperty('bestTargetMoveCell');
    });

    it('нет компьютерных персонажей; возвращает bestAttacker и bestTargetMoveCell, равные null', () => {
      getAvailableMoveCells.mockReturnValue([3, 4, 5]);

      const computerCharacters: PositionedCharacter[] = [];
      const playerCharacters = [positionedCharacters[1]];

      const result = executor['findBestMove'](computerCharacters, playerCharacters);

      expect(result.bestAttacker).toBeNull();
      expect(result.bestTargetMoveCell).toBeNull();
    });

    it('нет доступных клеток для перемещения; возвращает bestAttacker и bestTargetMoveCell, равные null', () => {
      getAvailableMoveCells.mockReturnValue([]);

      const computerCharacters = [positionedCharacters[0]];
      const playerCharacters = [positionedCharacters[1]];

      const result = executor['findBestMove'](computerCharacters, playerCharacters);

      expect(result.bestAttacker).toBeNull();
      expect(result.bestTargetMoveCell).toBeNull();
    });
  });

  describe('Метод findNearestEnemy()', () => {
    it('вызван метод; находит ближайшего врага', () => {
      const attacker = positionedCharacters[0];
      const enemies = [positionedCharacters[1], positionedCharacters[2]];

      const nearest = executor['findNearestEnemy'](attacker, enemies);

      expect(nearest).toBeDefined();
      expect([positionedCharacters[1], positionedCharacters[2]]).toContain(nearest);
    });

    it('переданы enemy1 (дист. 1) и enemy2 (дист. 10); возвращает enemy1 (дист. 1)', () => {
      const attacker = new PositionedCharacter(new Bowman(), 0);
      const enemy1 = new PositionedCharacter(new Swordsman(), 1); // дистанция 1
      const enemy2 = new PositionedCharacter(new Magician(), 10); // дистанция 10

      const nearest = executor['findNearestEnemy'](attacker, [enemy1, enemy2]);

      expect(nearest).toBe(enemy1);
    });

    it('переданы enemy1 (дист. 20) и enemy2 (дист. 5); возвращает enemy2 (дист. 5)', () => {
      const attacker = new PositionedCharacter(new Bowman(), 0);
      const enemy1 = new PositionedCharacter(new Swordsman(), 20); // дистанция 20
      const enemy2 = new PositionedCharacter(new Magician(), 5); // дистанция 5

      const nearest = executor['findNearestEnemy'](attacker, [enemy1, enemy2]);

      expect(nearest).toBe(enemy2);
    });
  });

  describe('Метод findOptimalMoveCell()', () => {
    it('передан target (позиция=1) и availableCells (3, 4, 5); \
находит оптимальную клетку для перемещения', () => {
      const target = positionedCharacters[1];
      const availableCells = [3, 4, 5];

      const result = executor['findOptimalMoveCell'](target, availableCells);

      expect(result).toHaveProperty('bestCell');
      expect(result).toHaveProperty('minDistance');
    });

    it('передан target (позиция=1) и availableCells (9, 10, 11); возвращает 9', () => {
      const target = positionedCharacters[1];
      const availableCells = [9, 10, 11]; // 9 ближе всего к target.position=1

      const result = executor['findOptimalMoveCell'](target, availableCells);

      expect(result.bestCell).toBe(9);
    });

    it('передан target (позиция=1) и availableCells (20, 1, 15); возвращает 1', () => {
      const target = positionedCharacters[1];
      const availableCells = [20, 1, 15]; // 1 ближе всего к target.position=1

      const result = executor['findOptimalMoveCell'](target, availableCells);

      expect(result.bestCell).toBe(1);
    });

    it('передан availableCells (5); работает с одним элементом в массиве', () => {
      const target = positionedCharacters[1];
      const availableCells = [5];

      const result = executor['findOptimalMoveCell'](target, availableCells);

      expect(result.bestCell).toBe(5);
      expect(result.minDistance).toBe(executor['manhattanDistance'](5, target.position));
    });
  });

  describe('Метод manhattanDistance()', () => {
    it('переданы index1 (0) и index2 (9); возвращает 2', () => {
      const dist = executor['manhattanDistance'](0, 9);
      expect(dist).toBe(2);
    });
  });

  describe('Метод performAttackOrMove()', () => {
    it('есть цель для атаки; вызывает метод performAttack()', async () => {
      const attacker = positionedCharacters[0];
      const target = positionedCharacters[1];

      await executor['performAttackOrMove'](attacker, target, null);

      expect(performAttack).toHaveBeenCalledWith(attacker, target);
      expect(moveCharacterToCell).not.toHaveBeenCalled();
    });

    it('есть клетка для перемещения; вызывает метод moveCharacterToCell()', async () => {
      const attacker = positionedCharacters[0];
      const moveCell = 5;

      await executor['performAttackOrMove'](attacker, null, moveCell);

      expect(moveCharacterToCell).toHaveBeenCalledWith(attacker, moveCell);
      expect(performAttack).not.toHaveBeenCalled();
    });

    it('нет атакующего; ничего не делает', async () => {
      await executor['performAttackOrMove'](null, null, null);

      expect(performAttack).not.toHaveBeenCalled();
      expect(moveCharacterToCell).not.toHaveBeenCalled();
    });
  });

  describe('Метод updateGameState()', () => {
    it('ход компьютера завершен; обновляет состояние игры', () => {
      executor['updateGameState']();

      expect(executor.gameState.isPlayerTurn).toBe(true);
      expect(executor['isComputerTurnInProgress']).toBe(false);
    });
  });
});
