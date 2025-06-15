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
    const directions = [
      [0, 1],   // Вниз
      [1, 0],   // Вправо
      [0, -1],  // Вверх
      [-1, 0],  // Влево
      [1, 1],   // Вниз-вправо
      [1, -1],  // Вверх-вправо
      [-1, 1],  // Вниз-влево
      [-1, -1]  // Вверх-влево
    ];

    const startX = index % boardSize;
    const startY = Math.floor(index / boardSize);

    for (const [dx, dy] of directions) {
      for (let step = 1; step <= maxDistance; step++) {
        const x = startX + dx * step;
        const y = startY + dy * step;

        // Проверка выхода за границы доски
        if (x < 0 || x >= boardSize || y < 0 || y >= boardSize) break;

        const cellIndex = (y * boardSize) + x;

        allowMove
          ? this.processMoveCell(cellIndex, cellsInRange)
          : this.processAttackCell(cellIndex, isPlayerAttacker, cellsInRange);
      }
    }

    return cellsInRange;
  }

  /**
   * Проверяет, доступна ли клетка для хода. 
   * Если да, то добавляет индекс клетки в массив.
   *
   * @param {number} cellIndex - Индекс клетки.
   * @param {number[]} result - Результат обработки.
   */
  private processMoveCell(cellIndex: number, result: number[]): void {
    const isOccupied = this.positionedCharacters.some((pc) => pc.position === cellIndex);
    if (!isOccupied) result.push(cellIndex);
  }

  /**
   * Проверяет, доступна ли клетка для атаки. 
   * Если да, то добавляет индекс клетки в массив.
   *
   * @param {number} cellIndex - Индекс клетки.
   * @param {boolean} isPlayerAttacker - Флаг, указывающий, что атакующий персонаж игрока.
   * @param {number[]} result - Результат обработки.
   */
  private processAttackCell(
    cellIndex: number,
    isPlayerAttacker: boolean,
    result: number[]
  ): void {
    const character = findCharacterByIndex(
      this.positionedCharacters,
      cellIndex
    );
    if (character && isPlayerCharacter(character) !== isPlayerAttacker) {
      result.push(cellIndex);
    }
  }
}
