import GameStateService from '../services/GameStateService';
import { Theme } from '../types/enums';
import { IGameController } from '../types/interfaces';
import GamePlay from './GamePlay';
import TeamPositioner from './TeamPositioner';
import PositionedCharacter from './PositionedCharacter';
import { findCharacterByIndex, formatCharacterInfo } from '../utils/utils';

export default class GameController implements IGameController {
  private gamePlay: GamePlay;
  private stateService: GameStateService;
  private positionedCharacters: PositionedCharacter[] = [];

  constructor(gamePlay: GamePlay, stateService: GameStateService) {
    this.gamePlay = gamePlay;
    this.stateService = stateService;
  }

  init(): void {
    // Отрисовываем доску и кнопки управления.
    this.gamePlay.drawUi(Theme.Prairie);

    // Генерируем и отрисовываем расположение команд на доске.
    this.positionedCharacters = TeamPositioner.generateAndPositionTeams();
    this.gamePlay.redrawPositions(this.positionedCharacters);

    // Показываем подсказки при наведении курсора мыши на ячейку с персонажем.
    this.showBriefInfo();
  }

  /**
   * Обработчик наведения курсора мыши на ячейку с персонажем.
   * 
   * При наведении курсора мыши на ячейку с персонажем отображается подсказка 
   * с информацией о персонаже. После того, как курсор мыши покинет ячейку, 
   * подсказка исчезает.
   */
  showBriefInfo(): void {
    this.gamePlay.addCellEnterListener(this.onCellEnter.bind(this));
    this.gamePlay.addCellLeaveListener(this.onCellLeave.bind(this));
  }

  onCellClick(index: number): void {
    // TODO: react to click
  }

  /**
   * Показывает подсказку при наведении курсора мыши на ячейку с персонажем.
   * @param {number} index - индекс ячейки.
   */
  onCellEnter(index: number): void {
    const characterPosition = findCharacterByIndex(this.positionedCharacters, index);
    if (characterPosition) {
      const character = characterPosition.character;
      const info = formatCharacterInfo(character);

      this.gamePlay.showCellTooltip(info, index);
    }
  }

  /**
   * Скрывает подсказку при уходе курсора мыши с ячейки с персонажем.
   * @param {number} index - индекс ячейки.
   */
  onCellLeave(index: number): void {
    this.gamePlay.hideCellTooltip(index);
  }
}
