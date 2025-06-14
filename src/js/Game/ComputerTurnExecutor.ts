import {
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
  private positionedCharacters: PositionedCharacter[];
  private gamePlay: GamePlay;
  private gameState: GameState;
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
    this.positionedCharacters = positionedCharacters;
    this.gamePlay = gamePlay;
    this.gameState = gameState;
    this.getAvailableAttackCells = getAvailableAttackCells;
    this.getAvailableMoveCells = getAvailableMoveCells;
    this.moveCharacterToCell = moveCharacterToCell;
    this.performAttack = performAttack;
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
   * Выбирает лучшего атакующего и цель для атаки.
   *
   * @param {AttackerWithTargets[]} attackersWithTargets - Массив компьютерных персонажей с 
   * доступными целями для атаки.
   * @returns {selectedBestAttackerAndTarget | null} - Лучший атакующий и цель для атаки или null, 
   * если нет доступных целей.
   */
  private selectBestAttackerAndTarget(
    attackersWithTargets: AttackerWithTargets[]
  ): selectedBestAttackerAndTarget | null {
    attackersWithTargets.sort((a, b) => {
      const aMinHealth = Math.min(...a.attackTargets.map((t) => t.character.health));
      const bMinHealth = Math.min(...b.attackTargets.map((t) => t.character.health));
      return aMinHealth - bMinHealth;
    });

    const { attacker, attackTargets } = attackersWithTargets[0];
    attackTargets.sort((a, b) => a.character.health - b.character.health);
    const targetPosition = attackTargets[0];

    return { attacker, targetPosition };
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
  public setPositionedCharacters(positionedCharacters: PositionedCharacter[]): void {
    this.positionedCharacters = positionedCharacters;
  }
}
