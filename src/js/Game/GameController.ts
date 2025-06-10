import Character from '../Entities/Character';
import GameStateService from '../services/GameStateService';
import { CellHighlight, CharacterType, Cursor, Theme } from '../types/enums';
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
  private gameState = new GameState();
  private isComputerTurnInProgress: boolean = false;
  private currentTheme: Theme = Theme.Prairie;
  private gameOver: boolean = false;

  constructor(gamePlay: GamePlay, stateService: GameStateService) {
    this.gamePlay = gamePlay;
    this.stateService = stateService;
  }

  init(): void {
    // Отрисовываем доску и кнопки управления.
    this.currentTheme = Theme.Prairie;
    this.gamePlay.drawUi(this.currentTheme);

    // Генерируем и отрисовываем расположение команд на доске.
    this.positionedCharacters = TeamPositioner.generateAndPositionTeams();
    this.gamePlay.redrawPositions(this.positionedCharacters);

    // Показываем подсказки при наведении курсора мыши на ячейку с персонажем.
    this.showBriefInfo();

    // Подписываемся на клики по ячейкам с правильным this
    this.gamePlay.addCellClickListener(this.onCellClick.bind(this));

    // Подписываемся на кнопку "New Game"
    this.gamePlay.addNewGameListener(this.onNewGame.bind(this));

    // Сброс gameOver при инициализации
    this.gameOver = false;
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
    // Игровое поле заблокировано, клики игнорируются
    if (this.gameOver) return;

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
          await this.moveCharacterToCell(selectedCharacterPosition, index);
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

        if ( 
          attackerPosition 
          && targetPosition 
          && isPlayerCharacter(attackerPosition) !== isPlayerCharacter(targetPosition) 
        ) {
          await this.performAttack(attackerPosition, targetPosition);
        } else {
          GamePlay.showError('Ошибка при атаке: персонаж не найден или недопустимый цель');
        }

        return;
      }

      // Недопустимое действие
      this.gamePlay.setCursor(Cursor.NotAllowed);
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
    const isPlayerAttacker = isPlayerCharacter(characterPosition);

    return this.getCellsInRange(index, maxDistance, false, isPlayerAttacker);
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
   * @param {boolean} isPlayerAttacker - является ли атакующий персонаж игроком.
   * 
   * @returns {number[]} - массив индексов клеток.
   */
  private getCellsInRange(
    index: number, 
    maxDistance: number, 
    allowMove: boolean, 
    isPlayerAttacker?: boolean
  ): number[] {
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
          if ( enemyCharacter && isPlayerCharacter(enemyCharacter) !== isPlayerAttacker ) {
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
  private async moveCharacterToCell(characterPosition: PositionedCharacter, targetIndex: number): Promise<void> {
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
    if (this.selectedCellIndex !== null && this.selectedCellIndex >= 0 && this.selectedCellIndex < 64) {
      this.gamePlay.deselectCell(this.selectedCellIndex);
    }
    if (targetIndex >= 0 && targetIndex < 64) {
      this.gamePlay.deselectCell(targetIndex);
    }

    // Очищаем выбранную ячейку после перемещения
    this.selectedCellIndex = null;

    // Передаем ход
    this.gameState.isPlayerTurn = false;

    // Запускаем ход компьютера
    await this.computerTurn();
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

    // Если здоровье персонажа достигло нуля, удаляем его из массива PositionedCharacters
    if (target.health <= 0) this.removeCharacter(targetPosition);

    this.gamePlay.deselectCell(targetPosition.position);

    this.selectedCellIndex = null;
    this.gameState.isPlayerTurn = false;

    // Запускаем ход компьютера
    await this.computerTurn();
  }

  /**
   * Выполняет ход компьютера, атакуя слабых противников в первую очередь.
   */
  private async computerTurn(): Promise<void> {
    if ( this.isComputerTurnInProgress ) return;
    this.isComputerTurnInProgress = true;

    // Получаем всех персонажей компьютера
    const computerCharacters = this.positionedCharacters.filter((pc) => !isPlayerCharacter(pc));

    // Получаем всех персонажей игрока
    const playerCharacters = this.positionedCharacters.filter((pc) => isPlayerCharacter(pc));

    // Фильтруем персонажей компьютера, которые могут атаковать
    const attackersWithTargets = computerCharacters
      .map((attacker) => {
        const attackCells = this.getAvailableAttackCells(attacker.position);
        const attackTargets = playerCharacters.filter((pc) => attackCells.includes(pc.position));
        return { attacker, attackTargets };
      })
      .filter(({ attackTargets }) => attackTargets.length > 0);

    if ( attackersWithTargets.length > 0 ) {
      // Выбираем атакующего, который может атаковать самого слабого персонажа
      attackersWithTargets.sort((a, b) => {
        const aMinHealth = Math.min(...a.attackTargets.map((t) => t.character.health));
        const bMinHealth = Math.min(...b.attackTargets.map((t) => t.character.health));
        return aMinHealth - bMinHealth;
      });

      const { attacker, attackTargets } = attackersWithTargets[0];
      attackTargets.sort((a, b) => a.character.health - b.character.health);
      const targetPosition = attackTargets[0];

      // Выполняем атаку
      await this.performAttack(attacker, targetPosition);
    } else {
      // Нет целей для атаки, пытаемся подвинуться ближе к игроку
      // Выбираем персонажа, который может подвинуться ближе к ближайшему игроку
      let bestMove = null;
      let bestDistance = Infinity;
      let bestAttacker = null;
      let bestTargetMoveCell = null;

      for ( const attackerPosition of computerCharacters ) {
        const moveCells = this.getAvailableMoveCells(attackerPosition.position);
        if ( moveCells.length === 0 ) continue;

        // Находим ближайшего игрока
        const nearestPlayer = playerCharacters.reduce((nearest, pc) => {
          const distNearest = Math.abs(nearest.position - attackerPosition.position);
          const distCurrent = Math.abs(pc.position - attackerPosition.position);
          return distCurrent < distNearest ? pc : nearest;
        }, playerCharacters[0]);

        // Выбираем клетку для движения, которая ближе всего к игроку
        let targetMoveCell = moveCells[0];
        let minDistance = Math.abs(moveCells[0] - nearestPlayer.position);
        for ( const cell of moveCells ) {
          const distance = Math.abs(cell - nearestPlayer.position);
          if ( distance < minDistance ) {
            minDistance = distance;
            targetMoveCell = cell;
          }
        }

        if ( minDistance < bestDistance ) {
          bestDistance = minDistance;
          bestMove = targetMoveCell;
          bestAttacker = attackerPosition;
          bestTargetMoveCell = targetMoveCell;
        }
      }

      if ( bestAttacker && bestTargetMoveCell !== null ) {
        await this.moveCharacterToCell(bestAttacker, bestTargetMoveCell);
      }
    }

    // После хода компьютера передаем ход игроку
    this.gameState.isPlayerTurn = true;
    this.isComputerTurnInProgress = false;
  }

  /**
   * Метод удаляет указанного персонажа из списка позиционированных персонажей 
   * и обновляет отображение на игровом поле.
   * 
   * @param {PositionedCharacter} targetPosition - Позиция удаляемого персонажа.
   */
  private removeCharacter(targetPosition: PositionedCharacter): void {
    this.positionedCharacters = this.positionedCharacters.filter(
      (pc) => pc !== targetPosition
    );
    this.gamePlay.redrawPositions(this.positionedCharacters);

    // Если персонажи команды компьютера закончились, переходим на новый уровень.
    const enemyCharacters = this.positionedCharacters.filter((pc) => !isPlayerCharacter(pc));
    if (enemyCharacters.length === 0) {
      this.levelUpPlayerCharacters();
      this.advanceToNextTheme();
      this.startNewLevel();
    }

    // Если персонажи игрока закончились, игра окончена.
    const playerCharacters = this.positionedCharacters.filter((pc) => isPlayerCharacter(pc));
    if (playerCharacters.length === 0) {
      this.gameOver = true;
      GamePlay.showMessage('Вы проиграли! Игра окончена.');
    }
  }

  /**
   * Увеличивает уровень указанного персонажа и обновляет его характеристики.
   * @param {Character} character - Персонаж, уровень которого нужно увеличить.
   */
  private levelUpCharacter(character: Character): void {
    // Увеличиваем уровень персонажа на 1
    character.level += 1;

    // Обновляем здоровье персонажа, но не более 100
    character.health = Math.min(character.level + 80, 100);

    // Обновляем атаку и защиту персонажа по формуле:
    // Math.max(attackBefore, attackBefore * (80 + life) / 100)
    character.attack = Math.max(character.attack, character.attack * (80 + character.health) / 100);
    character.defense = Math.max(character.defense, character.defense * (80 + character.health) / 100);
  }

  /**
   * Увеличивает уровень персонажей игрока.
   */
  private levelUpPlayerCharacters(): void {
    for (const pc of this.positionedCharacters) {
      if (isPlayerCharacter(pc)) {
        this.levelUpCharacter(pc.character);
      }
    }
  }

  /**
   * Переходит к следующей теме карты.
   */
  private advanceToNextTheme(): void {
    switch (this.currentTheme) {
      case Theme.Prairie:
        this.currentTheme = Theme.Desert;
        break;
      case Theme.Desert:
        this.currentTheme = Theme.Arctic;
        break;
      case Theme.Arctic:
        this.currentTheme = Theme.Mountain;
        break;
      case Theme.Mountain:
      default:
        this.currentTheme = Theme.Prairie;
        break;
    }
  }

  /**
   * Начинает новый уровень игры.
   * 
   * Создает новую команду противника и объединяет ее с текущей командой игрока.
   * Затем отрисовывает новую тему карты и обновляет позиции персонажей на карте.
   */
  private startNewLevel(): void {
    // Сохраняем текущую команду игрока (оставшихся в живых персонажей)
    const currentPlayerTeam = this.positionedCharacters.filter(pc => isPlayerCharacter(pc));

    // Позиционируем существующую команду игрока в колонках 0 и 1
    const repositionedPlayerTeam = TeamPositioner.repositionExistingTeam(
      currentPlayerTeam,
    );

    // Генерируем и позиционируем новую команду противника в колонках 6 и 7
    const newOpponentTeam = TeamPositioner.generateAndPositionOpponentTeam();

    // Объединяем обе команды
    this.positionedCharacters = [...repositionedPlayerTeam, ...newOpponentTeam];

    // Обновляем UI
    this.gamePlay.drawUi(this.currentTheme);
    this.gamePlay.redrawPositions(this.positionedCharacters);

    // Сбрасываем состояние игры
    this.gameState.isPlayerTurn = true;
    this.selectedCellIndex = null;
    this.gameOver = false;
  }

  /**
   * Обрабатывает нажатие кнопки "Новая игра".
   * 
   * При нажатии кнопки "Новая игра" перезагружает страницу.
   */
  private onNewGame(): void {
    window.location.reload();
  }
}
