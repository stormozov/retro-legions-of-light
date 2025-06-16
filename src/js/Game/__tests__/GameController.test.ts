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

    });
  });

  describe('Метод onCellLeave()', () => {
    it('курсор мыши покидает клетку; подсказка скрывается', () => {
      gameController.onCellLeave(0);

      expect(gamePlay.hideCellTooltip).toHaveBeenCalledWith(0);
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
