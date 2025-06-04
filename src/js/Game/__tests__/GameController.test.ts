import { Demon } from '../../Entities/Enemies';
import { Bowman } from '../../Entities/Heroes';
import { CharacterType, Theme } from '../../types/enums';
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

  it('Метод init(); должен корректно инициализировать игру', () => {
    const mockPositionedCharacters = TeamPositioner.generateAndPositionTeams();

    (TeamPositioner.generateAndPositionTeams as jest.Mock).mockReturnValue(mockPositionedCharacters);

    gameController.init();

    expect(gamePlay.drawUi).toHaveBeenCalledWith(Theme.Prairie);
    expect(TeamPositioner.generateAndPositionTeams).toHaveBeenCalled();
    expect(gamePlay.redrawPositions).toHaveBeenCalledWith(mockPositionedCharacters);
    expect(gamePlay.addCellEnterListener).toHaveBeenCalled();
    expect(gamePlay.addCellLeaveListener).toHaveBeenCalled();
  });

  it('Метод onCellEnter(); должна отображаться подсказка при наведении на ячейку', () => {
    const character = new Bowman();
    const positionedCharacter = new PositionedCharacter(character, 0);
    gameController['positionedCharacters'] = [positionedCharacter];

    gameController.onCellEnter(0);

    const expectedInfo = formatCharacterInfo(character);
    expect(gamePlay.showCellTooltip).toHaveBeenCalledWith(expectedInfo, 0);
  });

  it('Метод onCellEnter(); не должна отображаться подсказка при наведении на пустую ячейку', () => {
    gameController['positionedCharacters'] = [];

    gameController.onCellEnter(0);

    expect(gamePlay.showCellTooltip).not.toHaveBeenCalled();
  });

  it('Метод onCellLeave(); должна скрыть подсказку при уходе курсора мыши', () => {
    gameController.onCellLeave(0);

    expect(gamePlay.hideCellTooltip).toHaveBeenCalledWith(0);
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

    it('клик по ячейкам персонажа во время хода игрока; вызывается GamePlay.showError', () => {
      gameController['positionedCharacters'] = [enemyPositioned];

      gameController.onCellClick(2);

      expect(GamePlay.showError).toHaveBeenCalledWith('Это не персонаж игрока');
      expect(gamePlay.deselectCell).not.toHaveBeenCalled();
      expect(gamePlay.selectCell).not.toHaveBeenCalled();
    });

    it('клик по ячейкам персонажа во время хода противника; вызывается GamePlay.showError', () => {
      gameController['gameState'] = GameState.from({ isPlayerTurn: false });
      gameController['positionedCharacters'] = [playerPositioned];

      gameController.onCellClick(1);

      expect(GamePlay.showError).toHaveBeenCalledWith('Сейчас ход компьютера ');
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

    it('перевыбран персонаж; должен поменять выделенную ячейку', () => {
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

    it('передан Demon; должен показывать ошибку и не выделять', () => {
      const nonPlayerCharacter = new Demon();
      const nonPlayerPositioned = new PositionedCharacter(nonPlayerCharacter, 4);

      gameController['positionedCharacters'] = [nonPlayerPositioned];

      gameController.onCellClick(4);

      expect(GamePlay.showError).toHaveBeenCalledWith('Это не персонаж игрока');
      expect(gamePlay.selectCell).not.toHaveBeenCalled();
    });
  });
});
