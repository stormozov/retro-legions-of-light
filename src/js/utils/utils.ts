import Character from '../Entities/Character';
import { playerCharacterTypes } from '../Entities/Heroes';
import PositionedCharacter from '../Game/PositionedCharacter';
import { FieldCellEdgeType } from '../types/types';

/**
 * Определяет тип края для позиции в линейном диапазоне (строка/столбец).
 * 
 * @param position - Позиция в диапазоне (от 0 до size-1).
 * @param size - Размер диапазона.
 * 
 * @returns {number} Тип края:
 *   - 0: начало диапазона (первая позиция).
 *   - 2: конец диапазона (последняя позиция).
 *   - 1: середина диапазона.
 */
export function getFieldCellEdgeType(position: number, size: number): FieldCellEdgeType {
  if (position === 0) return 0;
  if (position === size - 1) return 2;
  return 1;
}

/**
 * Определяет тип ячейки на игровом поле по её индексу.
 * 
 * @param {number} index - Плоский индекс ячейки.
 * @param {number} boardSize - Размер квадратного поля.
 * 
 * @returns {string} Тип ячейки. Возможные значения:
 *   - 'top-left':    верхний-левый угол
 *   - 'top':         верхний край (не угловой)
 *   - 'top-right':   верхний-правый угол
 *   - 'left':        левый край (не угловой)
 *   - 'center':      центр (не на краях)
 *   - 'right':       правый край (не угловой)
 *   - 'bottom-left': нижний-левый угол
 *   - 'bottom':      нижний край (не угловой)
 *   - 'bottom-right':нижний-правый угол
 *
 * @example
 * ```js
 * calcTileType(5, 8);   // 'top'
 * calcTileType(56, 8);  // 'bottom-left'
 * calcTileType(18, 8);  // 'center'
 * ```
 */
export function calcTileType(index: number, boardSize: number): string {
  const rowType = getFieldCellEdgeType(Math.floor(index / boardSize), boardSize);
  const colType = getFieldCellEdgeType(index % boardSize, boardSize);

  return [
    'top-left', 'top', 'top-right',
    'left', 'center', 'right',
    'bottom-left', 'bottom', 'bottom-right'
  ][rowType * 3 + colType];
}

/**
 * Возвращает уровень здоровья персонажа.
 * 
 * @param {number} health - здоровье персонажа в виде целого числа.
 * 
 * @returns {string} уровень здоровья в виде строки:
 * - critical
 * - normal
 * - high
 */
export function calcHealthLevel(health: number): string {
  if (health < 15) return 'critical';
  if (health < 50) return 'normal';

  return 'high';
}

/**
 * Форматирует информацию о персонаже в виде строки.
 * 
 * @param {Character} character - объект персонажа с информацией о персонаже.
 * 
 * @returns {string} строка с информацией о персонаже в формате "🎖1 ⚔10 🛡40 ❤50", где:
 * - 🎖1 - уровень персонажа.
 * - ⚔10 - атака персонажа.
 * - 🛡40 - защита персонажа.
 * - ❤50 - здоровье персонажа.
 */
export function formatCharacterInfo(character: Character): string {
  return `🎖${character.level} ⚔${character.attack} 🛡${character.defense} ❤${character.health}`;
}

/**
 * Находит персонажа в списке позиционированных персонажей по индексу.
 * 
 * @param {PositionedCharacter[]} characters - список персонажей.
 * @param {number} index - индекс персонажа в списке.
 * 
 * @returns {PositionedCharacter | undefined} персонаж с указанным индексом или 
 * undefined, если персонаж не найден.
 */
export function findCharacterByIndex(
  characters: PositionedCharacter[], 
  index: number
): PositionedCharacter | undefined {
  return characters.find((character) => character.position === index);
}

/**
   * Проверяет, является ли тип переданного персонажа типом игрока.
   * @param {PositionedCharacter} positionedCharacter - Позиционированный персонаж.
   * @returns {boolean} - true, если персонаж игрока, иначе false.
   */
export function isPlayerCharacter(positionedCharacter: PositionedCharacter): boolean {
  return playerCharacterTypes.includes(positionedCharacter.character.type);
}

/**
 * Переводит ключ метрики на русский язык с пробелами.
 * 
 * @param {string} key - Ключ метрики на английском языке.
 * @returns {string} Перевод ключа на русский язык с пробелами.
 */
export function translateMetricName(key: string): string {
  const mapping: Record<string, string> = {
    playerDefeats: 'Поражения игрока',
    enemiesKilled: 'Убито врагов',
    totalLevelsCompleted: 'Завершено уровней',
    maxLevelReached: 'Максимальный уровень',
    saveUsageCount: 'Использовано сохранений',
    loadUsageCount: 'Использовано загрузок',
  };
  
  return mapping[key] || key;
}
