import { Demon } from '../../Entities/Enemies';
import { Bowman } from '../../Entities/Heroes';
import { Theme, Cursor, CharacterType, CellHighlight } from '../../types/enums';
import { formatCharacterInfo } from '../../utils/utils';
import GameController from '../GameController';
import GamePlay from '../GamePlay';
import GameState from '../GameState';
import PositionedCharacter from '../PositionedCharacter';
import TeamPositioner from '../TeamPositioner';

jest.mock('../GamePlay');
jest.mock('../TeamPositioner');

describe('Класс GameController', () => {
  let gamePlay: GamePlay;
  let stateService: any;
  let gameController: GameController;

  beforeEach(() => {
    gamePlay = new GamePlay();
    gameController = new GameController(gamePlay, stateService);
  });

  describe('Метод init()', () => {
    it('вызван метод; должен корректно инициализировать игру', () => {
      const mockPositionedCharacters = TeamPositioner.generateAndPositionTeams();

      (TeamPositioner.generateAndPositionTeams as jest.Mock).mockReturnValue(mockPositionedCharacters);

      gameController.init();

      expect(gamePlay.drawUi).toHaveBeenCalledWith(Theme.Prairie);
      expect(TeamPositioner.generateAndPositionTeams).toHaveBeenCalled();
      expect(gamePlay.redrawPositions).toHaveBeenCalledWith(mockPositionedCharacters);
      expect(gamePlay.addCellEnterListener).toHaveBeenCalled();
      expect(gamePlay.addCellLeaveListener).toHaveBeenCalled();
    });
  });

  describe('Метод onCellClick', () => {
    let playerCharacter: Bowman;
    let enemyCharacter: Demon;
    let playerPositioned: PositionedCharacter;
    let enemyPositioned: PositionedCharacter;

    beforeEach(() => {
      // Создаем тестовых персонажей
      playerCharacter = new Bowman();
      enemyCharacter = new Demon();

      // Создаем позиционированных персонажей
      playerPositioned = new PositionedCharacter(playerCharacter, 1);
      enemyPositioned = new PositionedCharacter(enemyCharacter, 2);

      // Всегда начинаем с хода игрока
      gameController['gameState'] = GameState.from({ isPlayerTurn: true });

      // Мокаем статический метод showError
      GamePlay.showError = jest.fn();
    });

    it('клик по пустой ячейке; ничего не происходит', () => {
      gameController['positionedCharacters'] = [];

      gameController.onCellClick(0);

      expect(GamePlay.showError).not.toHaveBeenCalled();
      expect(gamePlay.deselectCell).not.toHaveBeenCalled();
      expect(gamePlay.selectCell).not.toHaveBeenCalled();
    });

    it('клик по уже выделенной ячейке; ничего не происходит', () => {
      gameController['positionedCharacters'] = [playerPositioned];
      gameController['selectedCellIndex'] = 1;

      gameController.onCellClick(1);

      expect(GamePlay.showError).not.toHaveBeenCalled();
      expect(gamePlay.deselectCell).not.toHaveBeenCalled();
      expect(gamePlay.selectCell).not.toHaveBeenCalled();
    });

    it('выбран персонаж; должен выделить выбранную ячейку', () => {
      gameController['positionedCharacters'] = [playerPositioned];
      gameController['selectedCellIndex'] = null;

      gameController.onCellClick(1);

      expect(GamePlay.showError).not.toHaveBeenCalled();
      expect(gamePlay.selectCell).toHaveBeenCalledWith(1);
      expect(gameController['selectedCellIndex']).toBe(1);
    });

    it('перевыбран активный персонаж; должен поменять выделенную ячейку', () => {
      const anotherPlayer = new Bowman();
      const anotherPositioned = new PositionedCharacter(anotherPlayer, 3);

      gameController['positionedCharacters'] = [playerPositioned, anotherPositioned];
      gameController['selectedCellIndex'] = 1;

      gameController.onCellClick(3);

      expect(GamePlay.showError).not.toHaveBeenCalled();
      expect(gamePlay.deselectCell).toHaveBeenCalledWith(1);
      expect(gamePlay.selectCell).toHaveBeenCalledWith(3);
      expect(gameController['selectedCellIndex']).toBe(3);
    });

    it('клик во время хода ПК; выбрасывает исключение', () => {
      gameController['gameState'] = GameState.from({ isPlayerTurn: false });
      gameController.onCellClick(1);
      expect(GamePlay.showError).toHaveBeenCalledWith('Сейчас ход компьютера');
    });

    it(`выбран персонаж и клик на доступную для перемещения клетку; 
      должен подсветить зеленым, сменить выделение и курсор`, () => {
      const playerPositioned = new PositionedCharacter(playerCharacter, 4);
      gameController['positionedCharacters'] = [playerPositioned];
      gameController['selectedCellIndex'] = 4;

      // Мокаем getAvailableMoveCells чтобы вернуть клетку 5 как доступную
      jest.spyOn(gameController as any, 'getAvailableMoveCells').mockReturnValue([5]);

      // Мокаем методы gamePlay
      gamePlay.deselectCell = jest.fn();
      gamePlay.selectCell = jest.fn();
      gamePlay.setCursor = jest.fn();

      gameController.onCellClick(5);

      expect(gamePlay.deselectCell).toHaveBeenCalledWith(4);
      expect(gamePlay.selectCell).toHaveBeenCalledWith(5, CellHighlight.Green);
      expect(gamePlay.setCursor).toHaveBeenCalledWith(Cursor.Pointer);
      expect(gameController['selectedCellIndex']).toBe(null);
    });

    it(`выбран персонаж и клик на доступную для атаки клетку; 
      должен подсветить красным, снять выделение, сменить курсор`, () => {
      const playerPositioned = new PositionedCharacter(playerCharacter, 6);
      const enemyPositioned = new PositionedCharacter(new Demon(), 7);
      gameController['positionedCharacters'] = [playerPositioned, enemyPositioned];
      gameController['selectedCellIndex'] = 6;

      // Мокаем getAvailableAttackCells чтобы вернуть клетку 7 как доступную для атаки
      jest.spyOn(gameController as any, 'getAvailableAttackCells').mockReturnValue([7]);

      // Мокаем методы gamePlay
      gamePlay.deselectCell = jest.fn();
      gamePlay.selectCell = jest.fn();
      gamePlay.setCursor = jest.fn();

      gameController.onCellClick(7);

      expect(gamePlay.deselectCell).toHaveBeenCalledWith(6);
      expect(gamePlay.selectCell).toHaveBeenCalledWith(7, CellHighlight.Red);
      expect(gamePlay.setCursor).toHaveBeenCalledWith(Cursor.Crosshair);
      expect(gameController['selectedCellIndex']).toBe(6);
    });

    it(`выбран персонаж и клик на недопустимую клетку; 
      должен показать ошибку и сменить курсор на notAllowed`, () => {
      const playerPositioned = new PositionedCharacter(playerCharacter, 8);
      gameController['positionedCharacters'] = [playerPositioned];
      gameController['selectedCellIndex'] = 8;

      // Мокаем getAvailableMoveCells и getAvailableAttackCells чтобы вернуть пустые массивы
      jest.spyOn(gameController as any, 'getAvailableMoveCells').mockReturnValue([]);
      jest.spyOn(gameController as any, 'getAvailableAttackCells').mockReturnValue([]);

      // Мокаем методы gamePlay
      gamePlay.setCursor = jest.fn();

      gameController.onCellClick(9);

      expect(gamePlay.setCursor).toHaveBeenCalledWith(Cursor.NotAllowed);
      expect(GamePlay.showError).toHaveBeenCalledWith('Недопустимое действие');
    });
  });

  describe('Метод onCellEnter()', () => {
    let playerCharacter: Bowman;
    let enemyCharacter: Demon;
    let playerPositioned: PositionedCharacter;
    let enemyPositioned: PositionedCharacter;

    beforeEach(() => {
      playerCharacter = new Bowman();
      enemyCharacter = new Demon();

      playerPositioned = new PositionedCharacter(playerCharacter, 10);
      enemyPositioned = new PositionedCharacter(enemyCharacter, 11);

      gameController['positionedCharacters'] = [playerPositioned, enemyPositioned];
      gameController['selectedCellIndex'] = null;

      gamePlay.selectCell = jest.fn();
      gamePlay.setCursor = jest.fn();
    });

    it('курсор наведен на ячейку персонажа; должна отображаться подсказка', () => {
      const character = new Bowman();
      const positionedCharacter = new PositionedCharacter(character, 0);
      gameController['positionedCharacters'] = [positionedCharacter];

      gameController.onCellEnter(0);

      const expectedInfo = formatCharacterInfo(character);
      expect(gamePlay.showCellTooltip).toHaveBeenCalledWith(expectedInfo, 0);
    });

    it('курсор наведен на пустую ячейку; подсказка не отображается', () => {
      gameController['positionedCharacters'] = [];

      gameController.onCellEnter(0);

      expect(gamePlay.showCellTooltip).not.toHaveBeenCalled();
    });

    describe('Курсор Pointer', () => {
      it('при наведении на персонажа игрока без выбранного персонажа', () => {
        gameController['selectedCellIndex'] = null;

        gameController.onCellEnter(10);

        expect(gamePlay.setCursor).toHaveBeenCalledWith(Cursor.Pointer);
        expect(gamePlay.selectCell).not.toHaveBeenCalled();
      });

      it('при наведении на другого персонажа игрока', () => {
        gameController['selectedCellIndex'] = 10;

        gameController.onCellEnter(10);

        expect(gamePlay.setCursor).toHaveBeenCalledWith(Cursor.Pointer);
      });

      it('зеленая подсветка при наведении на доступную для перемещения клетку', () => {
        gameController['selectedCellIndex'] = 10;

        jest.spyOn(gameController as any, 'getAvailableMoveCells').mockReturnValue([15]);

        gameController.onCellEnter(15);

        expect(gamePlay.setCursor).toHaveBeenCalledWith(Cursor.Pointer);
        expect(gamePlay.selectCell).toHaveBeenCalledWith(15, 'green');
      });
    });

    describe('Курсор nowAllowed', () => {
      it('при наведении на пустую клетку без выбранного персонажа', () => {
        gameController['selectedCellIndex'] = null;
        gameController['positionedCharacters'] = [];

        gameController.onCellEnter(12);

        expect(gamePlay.setCursor).toHaveBeenCalledWith(Cursor.NotAllowed);
        expect(gamePlay.selectCell).not.toHaveBeenCalled();
      });

      it('при отсутствии выбранного персонажа', () => {
        gameController['selectedCellIndex'] = 13;
        gameController['positionedCharacters'] = [];

        gameController.onCellEnter(14);

        expect(gamePlay.setCursor).toHaveBeenCalledWith(Cursor.NotAllowed);
      });

      it('при наведении на недопустимую клетку', () => {
        gameController['selectedCellIndex'] = 10;

        jest.spyOn(gameController as any, 'getAvailableMoveCells').mockReturnValue([]);
        jest.spyOn(gameController as any, 'getAvailableAttackCells').mockReturnValue([]);

        gameController.onCellEnter(17);

        expect(gamePlay.setCursor).toHaveBeenCalledWith(Cursor.NotAllowed);
        expect(gamePlay.selectCell).not.toHaveBeenCalled();
      });
    });

    describe('Курсор Crosshair', () => {
      it('красная подсветка при наведении на доступную для атаки клетку', () => {
        gameController['selectedCellIndex'] = 10;

        jest.spyOn(gameController as any, 'getAvailableAttackCells').mockReturnValue([16]);

        gameController.onCellEnter(16);

        expect(gamePlay.setCursor).toHaveBeenCalledWith(Cursor.Crosshair);
        expect(gamePlay.selectCell).toHaveBeenCalledWith(16, CellHighlight.Red);
      });
    });
  });

  describe('Метод onCellLeave()', () => {
    it('курсор мыши покидает клетку; подсказка скрывается', () => {
      gameController.onCellLeave(0);

      expect(gamePlay.hideCellTooltip).toHaveBeenCalledWith(0);
    });
  });

  describe('Метод getAvailableMoveCells()', () => {
    it('вызван метод; возвращает массив корректных клеток для перемещения', () => {
      const character = new Bowman();
      const positionedCharacter = new PositionedCharacter(character, 27);
      gameController['positionedCharacters'] = [positionedCharacter];

      const result = (gameController as any).getAvailableMoveCells(27);

      // Проверяем, что клетки в пределах дистанции перемещения и не заняты
      expect(result.length).toBeGreaterThan(0);
      expect(result).not.toContain(27);
    });

    it('персонаж не найден; возвращает пустой массив, если персонаж не найден', () => {
      gameController['positionedCharacters'] = [];

      const result = (gameController as any).getAvailableMoveCells(0);

      expect(result).toEqual([]);
    });
  });

  describe('Метод getAvailableAttackCells()', () => {
    it('вызван метод; возвращает корректные клетки для атаки', () => {
      const playerCharacter = new Bowman();
      const enemyCharacter = new Demon();

      const playerPositioned = new PositionedCharacter(playerCharacter, 28);
      const enemyPositioned = new PositionedCharacter(enemyCharacter, 29);

      gameController['positionedCharacters'] = [playerPositioned, enemyPositioned];

      const result = (gameController as any).getAvailableAttackCells(28);

      expect(result).toContain(29);
    });

    it('персонаж не найден; возвращает пустой массив', () => {
      gameController['positionedCharacters'] = [];

      const result = (gameController as any).getAvailableAttackCells(0);

      expect(result).toEqual([]);
    });
  });

  describe('Методы getMovementDistance() и getAttackDistance()', () => {
    const movementDistances = [
      { type: CharacterType.Swordsman, expected: 4 },
      { type: CharacterType.Undead, expected: 4 },
      { type: CharacterType.Bowman, expected: 2 },
      { type: CharacterType.Vampire, expected: 2 },
      { type: CharacterType.Magician, expected: 1 },
      { type: CharacterType.Demon, expected: 1 },
      { type: 'unknown' as CharacterType, expected: 0 },
    ];

    const attackDistances = [
      { type: CharacterType.Swordsman, expected: 1 },
      { type: CharacterType.Undead, expected: 1 },
      { type: CharacterType.Bowman, expected: 2 },
      { type: CharacterType.Vampire, expected: 2 },
      { type: CharacterType.Magician, expected: 4 },
      { type: CharacterType.Demon, expected: 4 },
      { type: 'unknown' as CharacterType, expected: 0 },
    ];

    it('возвращает корректные значения для getMovementDistance()', () => {
      const getMovementDistance = (gameController as any).getMovementDistance.bind(gameController);

      movementDistances.forEach(({ type, expected }) => {
        expect(getMovementDistance(type)).toBe(expected);
      });
    });

    it('возвращает корректные значения для getAttackDistance()', () => {
      const getAttackDistance = (gameController as any).getAttackDistance.bind(gameController);

      attackDistances.forEach(({ type, expected }) => {
        expect(getAttackDistance(type)).toBe(expected);
      });
    });
  });

  describe('Метод moveCharacterToCell()', () => {
    let playerCharacter: Bowman;
    let playerPositioned: PositionedCharacter;

    beforeEach(() => {
      playerCharacter = new Bowman();
      playerPositioned = new PositionedCharacter(playerCharacter, 1);
      gameController['positionedCharacters'] = [playerPositioned];
      gameController['selectedCellIndex'] = 1;
      gameController['gameState'] = GameState.from({ isPlayerTurn: true });

      // Мокаем методы класса GamePlay
      gamePlay.redrawPositions = jest.fn();
      gamePlay.deselectCell = jest.fn();
    });

    it('должен покрыть обе ветви тернарного оператора в moveCharacterToCell', () => {
      const anotherCharacter = new Bowman();
      const anotherPositioned = new PositionedCharacter(anotherCharacter, 8);

      gameController['positionedCharacters'] = [playerPositioned, anotherPositioned];
      gameController['selectedCellIndex'] = 1;

      const newPosition = 9;
      (gameController as any).moveCharacterToCell(playerPositioned, newPosition);

      // Проверяем, что старый PositionedCharacter заменен
      const foundOld = gameController['positionedCharacters'].find((pc) => pc === playerPositioned);
      expect(foundOld).toBeUndefined();

      // Проверяем, что новый PositionedCharacter добавлен
      const foundNew = gameController['positionedCharacters'].find((pc) => pc.position === newPosition);
      expect(foundNew).toBeDefined();
      expect(foundNew!.position).toBe(newPosition);

      // Проверяем, что другой PositionedCharacter остался без изменений
      const foundAnother = gameController['positionedCharacters'].find((pc) => pc === anotherPositioned);
      expect(foundAnother).toBeDefined();
    });
  });
});
