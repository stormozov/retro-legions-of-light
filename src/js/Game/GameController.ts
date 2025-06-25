import characterData from '../data/characters.json';
import CharacterActionService from '../services/CharacterActionService';
import GameSavingService from '../services/GameSavingService';
import GameStateService from '../services/GameStateService';
import LevelTransitionService from '../services/LevelTransitionService';
import StatisticsService from '../services/StatisticsService';
import { CellHighlight, Cursor, Theme } from '../types/enums';
import { IGameController } from '../types/interfaces';
import StatisticsModal from '../ui/StatisticsModal';
import { findCharacterByIndex, formatCharacterInfo, isPlayerCharacter } from '../utils/utils';
import ComputerTurnExecutor from './ComputerTurnExecutor';
import GamePlay from './GamePlay';
import GameState from './GameState';
import PositionedCharacter from './PositionedCharacter';
import TeamPositioner from './TeamPositioner';

export default class GameController implements IGameController {
  private gamePlay: GamePlay;
  private savingService: GameSavingService;
  private positionedCharacters: PositionedCharacter[] = [];
  private selectedCellIndex: number | null = null;
  private gameState = new GameState();
  private currentTheme: Theme = Theme.Prairie;
  private gameOver: boolean = false;
  private levelTransitionService: LevelTransitionService;
  private computerTurnExecutor: ComputerTurnExecutor;
  private characterActionService: CharacterActionService;
  private statisticsService: StatisticsService;
  private statisticsModal: StatisticsModal;

  constructor(gamePlay: GamePlay, stateService: GameStateService) {
    this.gamePlay = gamePlay;
    this.savingService = new GameSavingService(stateService, gamePlay);
    this.levelTransitionService = new LevelTransitionService(
      this.positionedCharacters,
      this.currentTheme,
      this.gamePlay,
      this.gameState
    );
    this.characterActionService = new CharacterActionService(this.positionedCharacters);
    this.statisticsService = new StatisticsService(stateService);
    this.statisticsModal = new StatisticsModal(this.statisticsService);
    this.computerTurnExecutor = new ComputerTurnExecutor(
      this.positionedCharacters,
      this.gamePlay,
      this.gameState,
      this.characterActionService.getAvailableAttackCells.bind(this.characterActionService),
      this.characterActionService.getAvailableMoveCells.bind(this.characterActionService),
      this.moveCharacterToCell.bind(this),
      this.performAttack.bind(this)
    );
  }

  private updateComputerTurnExecutorPositionedCharacters(): void {
    this.computerTurnExecutor.positionedCharacters = this.positionedCharacters;
  }

  init(): void {
    // Отрисовываем доску и кнопки управления.
    this.currentTheme = Theme.Prairie;
    this.levelTransitionService.currentTheme = this.currentTheme;
    this.gamePlay.drawUi(this.currentTheme);

    // Генерируем и отрисовываем расположение команд на доске.
    this.positionedCharacters = TeamPositioner.generateAndPositionTeams();
    this.levelTransitionService.positionedCharacters = this.positionedCharacters;
    this.levelTransitionService.currentTheme = this.currentTheme;
    this.gamePlay.redrawPositions(this.positionedCharacters);

    this.characterActionService.positionedCharacters = this.positionedCharacters;

    // Загружаем хар-ки персонажей компьютера в локальное хранилище
    this.setUpAICharacterBaseStats();

    // Показываем подсказки при наведении курсора мыши на ячейку с персонажем.
    this.showBriefInfo();

    // Подписываемся на клики по ячейкам с правильным this
    this.gamePlay.addCellClickListener(this.onCellClick.bind(this));

    // Подписываемся на кнопку "New Game"
    this.gamePlay.addNewGameListener(this.onNewGame.bind(this));

    // Сброс gameOver при инициализации
    this.gameOver = false;

    // Подписываемся на кнопку "Save Game" и "Load Game"
    this.gamePlay.addSaveGameListener(this.handleSaveGame.bind(this));
    this.gamePlay.addLoadGameListener(this.handleLoadGame.bind(this));

    // Подписываемся на кнопку "Статистика" для открытия модального окна
    this.gamePlay.addStatsGameListener(() => this.statisticsModal.open());
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
      const availableMoveCells = this.characterActionService.getAvailableMoveCells(this.selectedCellIndex!);
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
      const availableAttackCells = this.characterActionService.getAvailableAttackCells(this.selectedCellIndex!);
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
    const availableMoveCells = this.characterActionService.getAvailableMoveCells(this.selectedCellIndex!);
    if ( availableMoveCells.includes(index) ) {
      this.gamePlay.setCursor(Cursor.Pointer);
      this.gamePlay.selectCell(index, CellHighlight.Green);

      return;
    }

    // Если навели на клетку для атаки - подсветка красным, курсор crosshair
    const availableAttackCells = this.characterActionService.getAvailableAttackCells(this.selectedCellIndex!);
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
    if (this.selectedCellIndex !== index) this.gamePlay.deselectCell(index);
    this.gamePlay.hideCellTooltip(index);
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
      (pc === characterPosition) ? updatedPositionedCharacter : pc
    );

    this.characterActionService.positionedCharacters = this.positionedCharacters;

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

    // Обновляем positionedCharacters в ComputerTurnExecutor
    this.updateComputerTurnExecutorPositionedCharacters();

    // Запускаем ход компьютера через ComputerTurnExecutor
    await this.computerTurnExecutor.execute();
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
    await this.computerTurnExecutor.execute();
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

    this.characterActionService.positionedCharacters = this.positionedCharacters;

    this.gamePlay.redrawPositions(this.positionedCharacters);

    // Если персонажи команды компьютера закончились, переходим на новый уровень.
    const enemyCharacters = this.positionedCharacters.filter((pc) => !isPlayerCharacter(pc));
    if ( enemyCharacters.length === 0 ) {
      this.levelTransitionService.levelUpPlayerCharacters();
      this.levelTransitionService.advanceToNextTheme();
      this.levelTransitionService.startNewLevel();

      // Обновляем текущую тему и список позиционированных персонажей
      this.currentTheme = this.levelTransitionService.currentTheme;
      this.positionedCharacters = this.levelTransitionService.positionedCharacters;
      this.characterActionService.positionedCharacters = this.positionedCharacters;

      // Обновляем статистику по завершению уровня
      this.statisticsService.incrementTotalLevelsCompleted();

      // Обновляем статистику максимального достигнутого уровня
      const playerCharacters = this.positionedCharacters.filter((pc) => isPlayerCharacter(pc));
      if (playerCharacters.length > 0) {
        const firstPlayerLevel = playerCharacters[0].character.level;
        this.statisticsService.updateMaxLevelReached(firstPlayerLevel);
      }
    }

    // Если персонажи игрока закончились, игра окончена.
    const playerCharacters = this.positionedCharacters.filter((pc) => isPlayerCharacter(pc));
    if ( playerCharacters.length === 0 ) {
      this.gameOver = true;
      GamePlay.showMessage(
        'Не расстраивайся! Поражение — это лишь новая точка старта.' +
        'Ты уже молодец, что попробовал. В следующий раз обязательно повезёт! 🎯'
      );

      // Обновляем статистику по проигрышам игрока
      this.statisticsService.incrementPlayerDefeats();
    }

    // Обновляем статистику по убитым персонажам противника
    if (!isPlayerCharacter(targetPosition)) {
      this.statisticsService.incrementEnemiesKilled();
    }

    // Обновляем positionedCharacters в ComputerTurnExecutor
    this.updateComputerTurnExecutorPositionedCharacters();
  }

  /**
   * Обрабатывает нажатие кнопки "Новая игра".
   * 
   * При нажатии кнопки "Новая игра" перезагружает страницу.
   */
  private onNewGame(): void {
    window.location.reload();
  }

  /**
   * Обрабатывает нажатие кнопки "Сохранить игру".
   * 
   * При нажатии кнопки "Сохранить игру" сохраняет текущее состояние игры в localStorage.
   * 
   * При успешном сохранении сообщает пользователю, что игра успешно сохранена.
   * При ошибке сообщает пользователю, что произошла ошибка при сохранении игры.
   */
  private handleSaveGame(): void {
    this.savingService.saveGame(
      this.positionedCharacters,
      this.currentTheme,
      this.gameOver,
      this.gameState.isPlayerTurn
    );

    // Обновляем статистику по использованию кнопки сохранений
    this.statisticsService.incrementSaveUsage();
  }

  /**
   * Обрабатывает нажатие кнопки "Загрузить игру".
   * 
   * При нажатии кнопки "Загрузить игру" загружает состояние игры из localStorage.
   * 
   * При успешной загрузке сообщает пользователю, что игра успешно загружена.
   * При ошибке сообщает пользователю, что произошла ошибка при загрузке игры.
   */
  private handleLoadGame(): void {
    const success = this.savingService.loadGame();
    if (success) {
      this.gameState = this.savingService.gameState;
      this.positionedCharacters = this.savingService.positionedCharacters;
      this.characterActionService.positionedCharacters = this.positionedCharacters;
      this.currentTheme = this.savingService.currentTheme;
      this.gameOver = this.savingService.isGameOver();

      // Обновляем позиционированные персонажи и текущую тему
      this.levelTransitionService.positionedCharacters = this.positionedCharacters;
      this.levelTransitionService.currentTheme = this.currentTheme;

      // Обновляем ссылку на gameState в ComputerTurnExecutor
      this.computerTurnExecutor.gameState = this.gameState;

      // Обновляем ссылку на positionedCharacters в ComputerTurnExecutor
      this.computerTurnExecutor.positionedCharacters = this.positionedCharacters;

      // Обновляем статистику по использованию кнопки загрузки
      this.statisticsService.incrementLoadUsage();
    }
  }

  /**
   * Загружает базовые данные о характеристиках персонажей компьютера в локальное
   * хранилище.
   */
  private setUpAICharacterBaseStats() {
    const aiCharacterStats = {
      demon: { level: 1, ...characterData.characters.demon },
      vampire: { level: 1, ...characterData.characters.vampire },
      undead: { level: 1, ...characterData.characters.undead },
    };
    localStorage.setItem('aiCharacterStats', JSON.stringify(aiCharacterStats));
  }
}
