/**
 * Типы ячейки на поле.
 * 
 * Представляет собой 2D массив с типами ячейки на поле.
 * 
 * @type {string[][]}
 */
const TILE_TYPES: string[][] = [
  ['top-left', 'top', 'top-right'],
  ['left', 'center', 'right'],
  ['bottom-left', 'bottom', 'bottom-right']
];

export default TILE_TYPES;
