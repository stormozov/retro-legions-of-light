import PositionedCharacter from '../Game/PositionedCharacter';
import { CharacterType } from '../types/enums';
import { findCharacterByIndex, isPlayerCharacter } from '../utils/utils';

/**
 * Класс CharacterActionService предоставляет методы для получения доступных клеток для хода или атаки персонажа.
 */
export default class CharacterActionService {
  private positionedCharacters: PositionedCharacter[];

  constructor(positionedCharacters: PositionedCharacter[]) {
    this.positionedCharacters = positionedCharacters;
  }

  /**
   * Устанавливает массив позиционированных персонажей.
   *
   * @param {PositionedCharacter[]} positionedCharacters - Массив позиционированных персонажей.
   */
  setPositionedCharacters(positionedCharacters: PositionedCharacter[]): void {
    this.positionedCharacters = positionedCharacters;
  }

  /**
   * Получает доступные клетки для хода или атаки персонажа по его индексу.
   *
   * @param {number} index - Индекс персонажа.
   * @returns {number[]} Массив индексов доступных клеток.
   */
  getAvailableMoveCells(index: number): number[] {
    const characterPosition = findCharacterByIndex(this.positionedCharacters, index);
    if (!characterPosition) return [];

    const maxDistance = this.getMovementDistance(characterPosition.character.type);

    return this.getCellsInRange(index, maxDistance, true);
  }

  /**
   * Получает доступные клетки для атаки персонажа по его индексу.
   *
   * @param {number} index - Индекс персонажа.
   * @returns {number[]} Массив индексов доступных клеток.
   */
  getAvailableAttackCells(index: number): number[] {
    const characterPosition = findCharacterByIndex(this.positionedCharacters, index);
    if (!characterPosition) return [];

    const maxDistance = this.getAttackDistance(characterPosition.character.type);
    const isPlayerAttacker = isPlayerCharacter(characterPosition);

    return this.getCellsInRange(index, maxDistance, false, isPlayerAttacker);
  }

  /**
   * Получает максимальное расстояние хода или атаки персонажа по его типу.
   *
   * @param {CharacterType} type - Тип персонажа в формате CharacterType.
   * @returns {number} Максимальное расстояние хода или атаки.
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
   * Получает максимальное расстояние атаки персонажа по его типу.
   *
   * @param {CharacterType} type - Тип персонажа в формате CharacterType.
   * @returns {number} Максимальное расстояние атаки.
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
   * Получает доступные клетки в радиусе максимального расстояния хода или атаки персонажа.
   *
   * @param {number} index - Индекс персонажа.
   * @param {number} maxDistance - Максимальное расстояние хода или атаки.
   * @param {boolean} allowMove - Признак, указывающий, что ход разрешен.
   * @param {boolean} isPlayerAttacker - Признак, указывающий, что атакующий персонаж игрока.
   * 
   * @returns {number[]} Массив индексов доступных клеток.
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

    for (let y = 0; y < boardSize; y++) {
      for (let x = 0; x < boardSize; x++) {
        const distanceX: number = Math.abs(x - startX);
        const distanceY: number = Math.abs(y - startY);

        // Movement and attack allowed only in straight and diagonal lines (like a queen in chess)
        const isStraightOrDiagonal = x === startX || y === startY || distanceX === distanceY;
        if (!isStraightOrDiagonal) continue;

        const distance = Math.max(distanceX, distanceY);
        if (distance === 0 || distance > maxDistance) continue;

        const cellIndex: number = y * boardSize + x;

        if (allowMove) {
          // For movement, can jump over other characters, but cannot move to occupied cell
          const occupied = this.positionedCharacters.some((pc) => pc.position === cellIndex);
          if (!occupied) cellsInRange.push(cellIndex);
        } else {
          // For attack, cell must be occupied by enemy character
          const enemyCharacter = findCharacterByIndex(this.positionedCharacters, cellIndex);
          if (enemyCharacter && isPlayerCharacter(enemyCharacter) !== isPlayerAttacker) {
            cellsInRange.push(cellIndex);
          }
        }
      }
    }

    return cellsInRange;
  }
}
