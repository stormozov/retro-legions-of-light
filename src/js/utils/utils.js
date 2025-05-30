import TILE_TYPES from '../types/tile-types.js';

/**
 * Возвращает тип ячейки на поле.
 * 
 * @param {number} index - индекс поля.
 * @param {number} boardSize - размер квадратного поля (в длину или ширину).
 * 
 * @returns {string} тип ячейки на поле:
 * - top-left
 * - top-right
 * - top
 * - bottom-left
 * - bottom-right
 * - bottom
 * - right
 * - left
 * - center
 *
 * @example
 * ```js
 * calcTileType(0, 8); // top-left
 * calcTileType(1, 8); // top
 * calcTileType(7, 8); // top-right
 * ```
 * */
export function calcTileType(index, boardSize) {
  const row = Math.floor(index / boardSize);
  const col = index % boardSize;
  const colType = col === 0 ? 0 : col === boardSize - 1 ? 2 : 1;
  
  if (row === 0) return TILE_TYPES[0][colType]; // верхний ряд
  if (row === boardSize - 1) return TILE_TYPES[2][colType]; // нижний ряд
  
  return TILE_TYPES[1][colType]; // средние ряды
}

export function calcHealthLevel(health) {
  if (health < 15) return 'critical';
  if (health < 50) return 'normal';

  return 'high';
}
