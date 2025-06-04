import GameStateService from '../services/GameStateService';
import { CharacterType, Theme } from '../types/enums';
import { IGameController } from '../types/interfaces';
import { findCharacterByIndex, formatCharacterInfo } from '../utils/utils';
import GamePlay from './GamePlay';
import GameState from './GameState';
import PositionedCharacter from './PositionedCharacter';
import TeamPositioner from './TeamPositioner';

export default class GameController implements IGameController {
  private gamePlay: GamePlay;
  private stateService: GameStateService;
  private positionedCharacters: PositionedCharacter[] = [];
  private selectedCellIndex: number | null = null;
  private gameState = GameState.from({ isPlayerTurn: true });

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

    // Подписываемся на клики по ячейкам с правильным this
    this.gamePlay.addCellClickListener(this.onCellClick.bind(this));
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

  /**
   * Обработчик клика по ячейке игрового поля.
   * 
   * Проверяет возможность выбора персонажа и выполняет необходимые действия:
   * 1. Проверяет существование персонажа на указанной позиции
   * 2. Проверяет, является ли персонаж игроком
   * 3. Проверяет, чей сейчас ход
   * 4. Управляет выделением выбранной ячейки
   * 
   * @param {number} index - Индекс ячейки, по которой был произведен клик
   * @returns {void}
   * 
   * @throws {Error} Если попытка выбрать неигрового персонажа
   * @throws {Error} Если попытка выбрать персонажа во время хода компьютера
   * 
   * @example
   * onCellClick(5); // Выбирает ячейку с индексом 5, если возможно
   */
  onCellClick(index: number): void {
    const characterPosition = findCharacterByIndex(this.positionedCharacters, index);
    // Проверяем, существует ли персонаж на выбранной ячейке
    if ( !characterPosition ) return;

    // Проверяем, является ли выбранный персонаж игровым
    const characterType = characterPosition.character.type;
    const playerCharacterTypes = [
      CharacterType.Swordsman,
      CharacterType.Bowman,
      CharacterType.Magician
    ];

    if ( !playerCharacterTypes.includes(characterType) ) {
      GamePlay.showError('Это не персонаж игрока');
      return;
    }

    // Если клик был на уже выбранную ячейку, ничего не делаем
    if ( this.selectedCellIndex === index ) return;

    // Если ход компьютера, показываем ошибку
    if ( !this.gameState.isPlayerTurn ) {
      GamePlay.showError('Сейчас ход компьютера ');
      return;
    }

    // Отменяем выделение предыдущей выбранной ячейки, если она есть
    if ( this.selectedCellIndex !== null ) {
      this.gamePlay.deselectCell(this.selectedCellIndex);
    }

    // Выделяем выбранную ячейку
    this.gamePlay.selectCell(index);

    this.selectedCellIndex = index;
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
