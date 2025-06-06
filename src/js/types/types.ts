import { CharacterType } from './enums';

/**
 * Тип позиции ячейки относительно края поля в одном измерении (строка или столбец).
 * 
 * Значения:
 * - `0`: Крайняя начальная позиция (первая строка/первый столбец)
 * - `1`: Срединная позиция (не первая и не последняя в строке/столбце)
 * - `2`: Крайняя конечная позиция (последняя строка/последний столбец)
 * 
 * @example
 * Для поля 8x8:
 * - Левый край: колонка 0 → тип 0
 * - Центральные колонки: 1-6 → тип 1
 * - Правый край: колонка 7 → тип 2
 */
export type FieldCellEdgeType = 0 | 1 | 2;

/**
* Представляет позицию фигуры на доске.
*/
export type FigurePositionInBoard = {
  position: number;
  character: { type: string; health: number; };
};

/**
* Тип для функции слушателя события ячейки.
* @param index - Индекс ячейки.
*/
export type CellEventListener = (index: number) => void;

/**
* Тип для функции слушателя события игры.
*/
export type GameActionListener = () => void;

/**
 * Тип для уровня персонажа.
 */
export type CharacterLevel = 1 | 2 | 3 | 4;

/**
 * Возможные свойства класса персонажа.
 */
export type PossibleCharacterSetAttributes = {
  level?: CharacterLevel;
  attack?: number;
  defense?: number;
  health?: number;
}

/**
 * Тип ошибки, возникающий при взаимодействии с абстрактным классом.
 */
export type AbstractClassErrorType = 'CONSTRUCTOR' | 'ABSTRACT' | 'METHOD';

/**
 * Тип объекта, передаваемого в метод класса GameState.
 */
export type isPlayerTurnObject = { isPlayerTurn: boolean };
