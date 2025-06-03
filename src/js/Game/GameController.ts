import GameStateService from '../services/GameStateService';
import { Theme } from '../types/enums';
import { IGameController } from '../types/interfaces';
import GamePlay from './GamePlay';
import TeamPositioner from './TeamPositioner';

export default class GameController implements IGameController {
  private gamePlay: GamePlay;
  private stateService: GameStateService;

  constructor(gamePlay: GamePlay, stateService: GameStateService) {
    this.gamePlay = gamePlay;
    this.stateService = stateService;
  }

  init(): void {
    // Отрисовываем доску и кнопки управления.
    this.gamePlay.drawUi(Theme.Prairie);

    // Генерируем и отрисовываем расположение команд на доске.
    this.gamePlay.redrawPositions(TeamPositioner.generateAndPositionTeams());
  }

  onCellClick(index: number): void {
    // TODO: react to click
  }

  onCellEnter(index: number): void {
    // TODO: react to mouse enter
  }

  onCellLeave(index: number): void {
    // TODO: react to mouse leave
  }
}

