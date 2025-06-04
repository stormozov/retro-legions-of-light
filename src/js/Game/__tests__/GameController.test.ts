import { Bowman } from '../../Entities/Heroes';
import { Theme } from '../../types/enums';
import { formatCharacterInfo } from '../../utils/utils';
import GameController from '../GameController';
import GamePlay from '../GamePlay';
import PositionedCharacter from '../PositionedCharacter';
import TeamPositioner from '../TeamPositioner';

jest.mock('../GamePlay');
jest.mock('../TeamPositioner');

describe('Класс GameController', () => {
  let gamePlay: GamePlay;
  let stateService: null;
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
});
