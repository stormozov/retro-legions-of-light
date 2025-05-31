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
