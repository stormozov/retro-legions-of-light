import {
  AttackerTargetPriority,
  AttackerWithTargets,
  ComputerAndPlayerCharacters,
  foundBestMove,
  PositionedCharacterOrNull,
  selectedBestAttackerAndTarget
} from '../types/types';
import { isPlayerCharacter } from '../utils/utils';
import GamePlay from './GamePlay';
import GameState from './GameState';
import PositionedCharacter from './PositionedCharacter';

/**
 * Класс ComputerTurnExecutor предоставляет методы для выполнения хода компьютера.
 */
export default class ComputerTurnExecutor {
  private _positionedCharacters: PositionedCharacter[];
  private _gamePlay: GamePlay;
  private _gameState: GameState;
  private isComputerTurnInProgress: boolean = false;

  // Вспомогательные методы из класса GameController
  private getAvailableAttackCells: (index: number) => number[];
  private getAvailableMoveCells: (index: number) => number[];
  private moveCharacterToCell: (characterPosition: PositionedCharacter, targetIndex: number) => Promise<void>;
  private performAttack: (attackerPosition: PositionedCharacter, targetPosition: PositionedCharacter) => Promise<void>;

  /**
   * Создает экземпляр класса ComputerTurnExecutor.
   *
   * @param {PositionedCharacter[]} positionedCharacters - Массив позиционированных персонажей.
   * @param {GamePlay} gamePlay - Объект для работы с игровым процессом.
   * @param {GameState} gameState - Текущее состояние игры.
   * @param {Function} getAvailableAttackCells - Функция для получения доступных ячеек для атаки.
   * @param {Function} getAvailableMoveCells - Функция для получения доступных ячеек для перемещения.
   * @param {Function} moveCharacterToCell - Функция для перемещения персонажа в ячейку.
   * @param {Function} performAttack - Функция для выполнения атаки.
   */
  constructor(
    positionedCharacters: PositionedCharacter[],
    gamePlay: GamePlay,
    gameState: GameState,
    getAvailableAttackCells: (index: number) => number[],
    getAvailableMoveCells: (index: number) => number[],
    moveCharacterToCell: (characterPosition: PositionedCharacter, targetIndex: number) => Promise<void>,
    performAttack: (attackerPosition: PositionedCharacter, targetPosition: PositionedCharacter) => Promise<void>
  ) {
    this._positionedCharacters = positionedCharacters;
    this._gamePlay = gamePlay;
    this._gameState = gameState;
    this.getAvailableAttackCells = getAvailableAttackCells;
    this.getAvailableMoveCells = getAvailableMoveCells;
    this.moveCharacterToCell = moveCharacterToCell;
    this.performAttack = performAttack;
  }

  /**
   * Обновляет ссылку на состояние игры.
   * @param {GameState} gameState - Новый объект состояния игры.
   */
  public set gameState(gameState: GameState) {
    this._gameState = gameState;
  }

  public get gameState(): GameState {
    return this._gameState;
  }

  /**
   * Выполняет ход компьютера.
   */
  async execute(): Promise<void> {
    if (this.isComputerTurnInProgress) return;
    this.isComputerTurnInProgress = true;

    const { computerCharacters, playerCharacters } = this.getComputerAndPlayerCharacters();

    const attackersWithTargets = this.findAttackersWithTargets(computerCharacters, playerCharacters);

    if (attackersWithTargets.length > 0) {
      const { attacker, targetPosition } = this.selectBestAttackerAndTarget(attackersWithTargets);
      await this.performAttackOrMove(attacker, targetPosition, null);
    } else {
      const { bestAttacker, bestTargetMoveCell } = this.findBestMove(computerCharacters, playerCharacters);
      await this.performAttackOrMove(bestAttacker, null, bestTargetMoveCell);
    }

    this.updateGameState();
  }

  /**
   * Возвращает объект с массивами компьютерных и игровых персонажей.
   *
   * @returns {ComputerAndPlayerCharacters} - Объект с массивами компьютерных и игровых персонажей.
   */
  private getComputerAndPlayerCharacters(): ComputerAndPlayerCharacters {
    const computerCharacters = this.positionedCharacters.filter((pc) => !isPlayerCharacter(pc));
    const playerCharacters = this.positionedCharacters.filter((pc) => isPlayerCharacter(pc));
    return { computerCharacters, playerCharacters };
  }

  /**
   * Находит компьютерных персонажей с доступными целями для атаки.
   *
   * @param {PositionedCharacter[]} computerCharacters - Массив компьютерных персонажей.
   * @param {PositionedCharacter[]} playerCharacters - Массив игровых персонажей.
   * 
   * @returns {AttackerWithTargets[]} - Массив компьютерных персонажей с доступными целями для атаки.
   */
  private findAttackersWithTargets(
    computerCharacters: PositionedCharacter[],
    playerCharacters: PositionedCharacter[]
  ): AttackerWithTargets[] {
    return computerCharacters
      .map((attacker) => {
        const attackCells = this.getAvailableAttackCells(attacker.position);
        const attackTargets = playerCharacters.filter((pc) => attackCells.includes(pc.position));
        return { attacker, attackTargets };
      })
      .filter(({ attackTargets }) => attackTargets.length > 0);
  }

  /**
   * Вычисляет приоритет атаки для пары атакующего и цели.
   *
   * @param {PositionedCharacter} attacker - Атакующий персонаж.
   * @param {PositionedCharacter} target - Цель атаки.
   * 
   * @returns {number} - Значение приоритета.
   */
  private calculateAttackPriority(
    attacker: PositionedCharacter, 
    target: PositionedCharacter
  ): number {
    const K1 = 0.6; // вес силы атаки
    const K2 = -0.3; // приоритет слабых целей
    const K3 = 1.0; // важность добивания
    const K4 = 0.2; // штраф за расстояние

    const attack = attacker.character.attack;
    const enemyHealth = target.character.health;

    // Оценка урона по цели
    const damageToTarget = Math.max(attack - target.character.defense, attack * 0.1);

    // Расстояние между атакующим и целью
    const distance = Math.abs(attacker.position - target.position);

    // Проверка, убивает ли атака цель (добивание)
    const finishingMoveBonus = damageToTarget >= enemyHealth ? 10 : 0;

    // Формула приоритета
    const priority = (attack * K1) 
      + (enemyHealth * K2) 
      + (damageToTarget * K3) 
      - (distance * K4) 
      + finishingMoveBonus;

    return priority;
  }

  /**
   * Выбирает лучшего атакующего и цель для атаки с учетом новой системы приоритетов.
   *
   * @param {AttackerWithTargets[]} attackersWithTargets - Массив компьютерных 
   * персонажей с доступными целями для атаки.
   * 
   * @returns {selectedBestAttackerAndTarget | null} - Лучший атакующий и цель для 
   * атаки или null, если нет доступных целей.
   */
  private selectBestAttackerAndTarget(
    attackersWithTargets: AttackerWithTargets[]
  ): selectedBestAttackerAndTarget | null {
    if (attackersWithTargets.length === 0) return null;

    // Массив для хранения всех пар атакующий-цель с их приоритетами
    const attackerTargetPriorities: AttackerTargetPriority[] = [];

    // Заполняем массив приоритетов
    for (const { attacker, attackTargets } of attackersWithTargets) {
      for (const target of attackTargets) {
        const priority = this.calculateAttackPriority(attacker, target);
        attackerTargetPriorities.push({ attacker, target, priority });
      }
    }

    // Сортируем по убыванию приоритета
    attackerTargetPriorities.sort((a, b) => b.priority - a.priority);

    // Выбираем пару с максимальным приоритетом
    const best = attackerTargetPriorities[0];

    return { attacker: best.attacker, targetPosition: best.target };
  }

  /**
   * Находит лучшее перемещение для компьютерного персонажа.
   *
   * @param {PositionedCharacter[]} computerCharacters - Массив компьютерных персонажей.
   * @param {PositionedCharacter[]} playerCharacters - Массив игровых персонажей.
   * 
   * @returns {foundBestMove} - Объект с более подходящим атакующим и ячейкой для перемещения.
   */
  private findBestMove(
    computerCharacters: PositionedCharacter[],
    playerCharacters: PositionedCharacter[]
  ): foundBestMove {
    let bestDistance = Infinity;
    let bestAttacker: PositionedCharacterOrNull = null;
    let bestTargetMoveCell: number | null = null;

    for (const attackerPosition of computerCharacters) {
      const moveCells = this.getAvailableMoveCells(attackerPosition.position);
      if (moveCells.length === 0) continue;

      const nearestPlayer = playerCharacters.reduce((nearest, pc) => {
        const distNearest = Math.abs(nearest.position - attackerPosition.position);
        const distCurrent = Math.abs(pc.position - attackerPosition.position);
        return (distCurrent < distNearest) ? pc : nearest;
      }, playerCharacters[0]);

      let targetMoveCell = moveCells[0];
      let minDistance = Math.abs(moveCells[0] - nearestPlayer.position);
      for (const cell of moveCells) {
        const distance = Math.abs(cell - nearestPlayer.position);
        if (distance < minDistance) {
          minDistance = distance;
          targetMoveCell = cell;
        }
      }

      if (minDistance < bestDistance) {
        bestDistance = minDistance;
        bestAttacker = attackerPosition;
        bestTargetMoveCell = targetMoveCell;
      }
    }

    return { bestAttacker, bestTargetMoveCell };
  }

  /**
   * Выполняет атаку или перемещение персонажа.
   *
   * @param {PositionedCharacterOrNull} attacker - Атакующий персонаж или null.
   * @param {PositionedCharacterOrNull} targetPosition - Цель для атаки или null.
   * @param {number | null} moveCell - Ячейка для перемещения или null.
   */
  private async performAttackOrMove(
    attacker: PositionedCharacterOrNull,
    targetPosition: PositionedCharacterOrNull,
    moveCell: number | null
  ): Promise<void> {
    if (attacker && targetPosition) {
      await this.performAttack(attacker, targetPosition);
    } else if (attacker && moveCell !== null) {
      await this.moveCharacterToCell(attacker, moveCell);
    }
  }

  /**
   * Обновляет состояние игры после хода компьютера.
   */
  private updateGameState(): void {
    this.gameState.isPlayerTurn = true;
    this.isComputerTurnInProgress = false;
  }

  /**
   * Устанавливает массив позиционированных персонажей.
   *
   * @param {PositionedCharacter[]} positionedCharacters - Массив позиционированных персонажей.
   */
  public set positionedCharacters(positionedCharacters: PositionedCharacter[]) {
    this._positionedCharacters = positionedCharacters;
  }

  /**
   * Возвращает массив позиционированных персонажей.
   *
   * @returns {PositionedCharacter[]} - Массив позиционированных персонажей.
   */
  public get positionedCharacters(): PositionedCharacter[] {
    return this._positionedCharacters;
  }
}
