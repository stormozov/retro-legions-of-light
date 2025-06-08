import GameStateService from '../services/GameStateService';
import { CharacterType, Cursor, Theme, CellHighlight } from '../types/enums';
import { IGameController } from '../types/interfaces';
import { findCharacterByIndex, formatCharacterInfo, isPlayerCharacter } from '../utils/utils';
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
   * @throws {Error} Если недопустимое действие
   * @throws {Error} Если попытка выбрать персонажа во время хода компьютера
   *
   * @example
   * onCellClick(5); // Выбирает ячейку с индексом 5, если возможно
   */
  async onCellClick(index: number): Promise<void> {
    const characterPosition = findCharacterByIndex(this.positionedCharacters, index);

    // Если ход компьютера, показываем ошибку
    if ( !this.gameState.isPlayerTurn ) {
      GamePlay.showError('Сейчас ход компьютера');
      return;
    }

    // Если клик был на уже выбранную ячейку, ничего не делаем
    if ( this.selectedCellIndex === index ) return;

    // Если персонаж игрока выбран
    if ( this.selectedCellIndex !== null ) {
      const selectedCharacterPosition = findCharacterByIndex(
        this.positionedCharacters, 
        this.selectedCellIndex
      );

      // if ( !selectedCharacterPosition ) {
      //   this.gamePlay.deselectCell(this.selectedCellIndex);
      //   this.selectedCellIndex = null;

      //   return;
      // }

      // Если клик на другого персонажа игрока - смена выбора
      if ( characterPosition && isPlayerCharacter(characterPosition) ) {
        this.gamePlay.deselectCell(this.selectedCellIndex);
        this.gamePlay.selectCell(index);
        this.selectedCellIndex = index;
        this.gamePlay.setCursor(Cursor.Pointer);

        return;
      }

      // Проверяем, можно ли перейти на выбранную клетку
      const availableMoveCells = this.getAvailableMoveCells(this.selectedCellIndex!);
      if ( availableMoveCells.includes(index) ) {
        // Подсвечиваем зеленым и меняем курсор
        this.gamePlay.deselectCell(this.selectedCellIndex);
        this.gamePlay.selectCell(index, CellHighlight.Green);
        this.gamePlay.setCursor(Cursor.Pointer);

        // Реализуем логику перемещения персонажа
        if (selectedCharacterPosition) {
          this.moveCharacterToCell(selectedCharacterPosition, index);
        }
        
        return;
      }

      // Проверяем, можно ли атаковать выбранную клетку
      const availableAttackCells = this.getAvailableAttackCells(this.selectedCellIndex!);
      if ( availableAttackCells.includes(index) ) {
        // Подсвечиваем красным и меняем курсор
        this.gamePlay.deselectCell(this.selectedCellIndex);
        this.gamePlay.selectCell(index, CellHighlight.Red);
        this.gamePlay.setCursor(Cursor.Crosshair);

        const attackerPosition = findCharacterByIndex(this.positionedCharacters, this.selectedCellIndex!);
        const targetPosition = findCharacterByIndex(this.positionedCharacters, index);

        if ( attackerPosition && targetPosition ) {
          await this.performAttack(attackerPosition, targetPosition);
        } else {
          GamePlay.showError('Ошибка при атаке: персонаж не найден');
        }

        return;
      }

      // Недопустимое действие
      this.gamePlay.setCursor(Cursor.NotAllowed);
      GamePlay.showError('Недопустимое действие');
      return;
    }

    // Если персонаж игрока не выбран, пытаемся выбрать
    if ( characterPosition && isPlayerCharacter(characterPosition) ) {
      this.gamePlay.selectCell(index);
      this.selectedCellIndex = index;
      this.gamePlay.setCursor(Cursor.Pointer);

      return;
    }
  }

  /**
   * Показывает подсказку при наведении курсора мыши на ячейку с персонажем.
   * @param {number} index - индекс ячейки.
   */
  onCellEnter(index: number): void {
    const characterPosition = findCharacterByIndex(this.positionedCharacters, index);
    if (characterPosition) {
      const info = formatCharacterInfo(characterPosition.character);
      this.gamePlay.showCellTooltip(info, index);
    }

    // Если персонаж не выбран
    if ( this.selectedCellIndex === null ) {
      this.gamePlay.setCursor(
        characterPosition && isPlayerCharacter(characterPosition)
          ? Cursor.Pointer
          : Cursor.NotAllowed
      );

      return;
    }

    const selectedCharacterPosition = findCharacterByIndex(
      this.positionedCharacters, 
      this.selectedCellIndex
    );

    if ( !selectedCharacterPosition ) {
      this.gamePlay.setCursor(Cursor.NotAllowed);
      return;
    }

    // Если навели на другого персонажа игрока - курсор pointer, без подсветки
    if ( characterPosition && isPlayerCharacter(characterPosition) ) {
      this.gamePlay.setCursor(Cursor.Pointer);
      return;
    }

    // Если навели на клетку для перемещения - подсветка зеленым, курсор pointer
    const availableMoveCells = this.getAvailableMoveCells(this.selectedCellIndex!);
    if ( availableMoveCells.includes(index) ) {
      this.gamePlay.setCursor(Cursor.Pointer);
      this.gamePlay.selectCell(index, CellHighlight.Green);

      return;
    }

    // Если навели на клетку для атаки - подсветка красным, курсор crosshair
    const availableAttackCells = this.getAvailableAttackCells(this.selectedCellIndex!);
    if ( availableAttackCells.includes(index) ) {
      this.gamePlay.setCursor(Cursor.Crosshair);
      this.gamePlay.selectCell(index, CellHighlight.Red);

      return;
    }

    // Недопустимое действие - курсор notAllowed, без подсветки
    this.gamePlay.setCursor(Cursor.NotAllowed);
  }

  onCellLeave(index: number): void {
    this.gamePlay.setCursor(Cursor.NotAllowed);
    this.gamePlay.deselectCell(index);
    this.gamePlay.hideCellTooltip(index);
  }

  /**
   * Возвращает массив индексов клеток, на которые можно перейти для выбранного персонажа.
   * @param {number} index - индекс выбранной клетки.
   * @returns {number[]} - массив индексов доступных клеток для перемещения.
   */
  private getAvailableMoveCells(index: number): number[] {
    const characterPosition = findCharacterByIndex(this.positionedCharacters, index);
    if (!characterPosition) return [];

    const maxDistance = this.getMovementDistance(characterPosition.character.type);

    return this.getCellsInRange(index, maxDistance, true);
  }

  /**
   * Возвращает массив индексов клеток, на которые можно атаковать для выбранного персонажа.
   * @param {number} index - индекс выбранной клетки.
   * @returns {number[]} - массив индексов доступных клеток для атаки.
   */
  private getAvailableAttackCells(index: number): number[] {
    const characterPosition = findCharacterByIndex(this.positionedCharacters, index);
    if (!characterPosition) return [];

    const maxDistance = this.getAttackDistance(characterPosition.character.type);

    return this.getCellsInRange(index, maxDistance, false);
  }

  /**
   * Возвращает максимальную дистанцию перемещения для типа персонажа.
   * @param {CharacterType} type - тип персонажа.
   * @returns {number} - максимальная дистанция перемещения.
   */
  private getMovementDistance(type: CharacterType): number {
    switch (type) {
      case CharacterType.Swordsman:
      case CharacterType.Undead:
        return 4;
      case CharacterType.Bowman:
      case CharacterType.Vampire:
        return 2;
      case CharacterType.Magician:
      case CharacterType.Demon:
        return 1;
      default:
        return 0;
    }
  }

  /**
   * Возвращает максимальную дистанцию атаки для типа персонажа.
   * @param {CharacterType} type - тип персонажа.
   * @returns {number} - максимальная дистанция атаки.
   */
  private getAttackDistance(type: CharacterType): number {
    switch (type) {
      case CharacterType.Swordsman:
      case CharacterType.Undead:
        return 1;
      case CharacterType.Bowman:
      case CharacterType.Vampire:
        return 2;
      case CharacterType.Magician:
      case CharacterType.Demon:
        return 4;
      default:
        return 0;
    }
  }
  
  /**
   * Возвращает массив индексов клеток в радиусе от заданной клетки.
   * 
   * @param {number} index - индекс клетки.
   * @param {number} maxDistance - максимальное расстояние.
   * @param {boolean} allowMove - разрешено ли перемещение (true) или атака (false).
   * 
   * @returns {number[]} - массив индексов клеток.
   */
  private getCellsInRange(index: number, maxDistance: number, allowMove: boolean): number[] {
    const boardSize = 8;
    const cellsInRange: number[] = [];

    const startX: number = index % boardSize;
    const startY: number = Math.floor(index / boardSize);

    for ( let y = 0; y < boardSize; y++ ) {
      for ( let x = 0; x < boardSize; x++ ) {
        const distanceX: number = Math.abs(x - startX);
        const distanceY: number = Math.abs(y - startY);

        // Передвижение и атака разрешены только по прямым и диагональным линиям 
        // (как у ферзя в шахматах)
        const isStraightOrDiagonal = x === startX || y === startY || distanceX === distanceY;
        if ( !isStraightOrDiagonal ) continue;

        const distance = Math.max(distanceX, distanceY);
        if ( distance === 0 || distance > maxDistance ) continue;

        const cellIndex: number = y * boardSize + x;

        if (allowMove) {
          // Для передвижения может перепрыгивать через других персонажей, 
          // поэтому проверка на блокировку не требуется. Но не может переместиться 
          // в ячейку, занятую любым персонажем
          const occupied = this.positionedCharacters.some((pc) => pc.position === cellIndex);
          if (!occupied) cellsInRange.push(cellIndex);
        } else {
          // Для атаки ячейка должна быть занята вражеским персонажем
          const enemyCharacter = findCharacterByIndex(this.positionedCharacters, cellIndex);
          if ( enemyCharacter && !isPlayerCharacter(enemyCharacter) ) {
            cellsInRange.push(cellIndex);
          }
        }
      }
    }

    return cellsInRange;
  }

  /**
   * Перемещает персонажа на указанную клетку.
   * @param {PositionedCharacter} characterPosition - персонаж с текущей позицией
   * @param {number} targetIndex - индекс клетки для перемещения
   */
  private moveCharacterToCell(characterPosition: PositionedCharacter, targetIndex: number): void {
    // Создаем новый PositionedCharacter с обновленной позицией
    const updatedPositionedCharacter = new PositionedCharacter(
      characterPosition.character,
      targetIndex
    );

    // Обновляем массив positionedCharacters, заменяя старую позицию новой
    this.positionedCharacters = this.positionedCharacters.map((pc) =>
      pc === characterPosition ? updatedPositionedCharacter : pc
    );

    // Обновляем отображение персонажей
    this.gamePlay.redrawPositions(this.positionedCharacters);

    // Убираем выделения ячеек
    this.gamePlay.deselectCell(this.selectedCellIndex!);
    this.gamePlay.deselectCell(targetIndex);

    // Очищаем выбранную ячейку после перемещения
    this.selectedCellIndex = null;

    // Передаем ход
    this.gameState = GameState.from({ isPlayerTurn: false });
  }

  /**
   * Выполняет атаку между двумя персонажами.
   *
   * @param {PositionedCharacter} attackerPosition - Позиция атакующего персонажа.
   * @param {PositionedCharacter} targetPosition - Позиция защищающегося персонажа.
   * 
   * @returns {Promise<void>} Promise, который разрешается после выполнения атаки.
   */
  private async performAttack(
    attackerPosition: PositionedCharacter,
    targetPosition: PositionedCharacter
  ): Promise<void> {
    const attacker = attackerPosition.character;
    const target = targetPosition.character;

    const damage = Math.max(attacker.attack - target.defense, attacker.attack * 0.1);
    const oldHealth = target.health;
    target.health -= damage;

    await this.gamePlay.animateHealthChange(targetPosition.position, oldHealth, target.health);
    await this.gamePlay.showDamage(targetPosition.position, damage);

    this.gamePlay.deselectCell(targetPosition.position);

    this.selectedCellIndex = null;
    this.gameState = GameState.from({ isPlayerTurn: false });
  }
}
