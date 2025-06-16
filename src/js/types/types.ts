import PositionedCharacter from '../Game/PositionedCharacter';

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
 * Тип позиционированного персонажа или null.
 */
export type PositionedCharacterOrNull = PositionedCharacter | null;

/**
 * Тип, представляющий объект, содержащий информацию об атакующем и его целях.
 *
 * @type AttackerWithTargets
 * @property {PositionedCharacter} attacker - Объект, представляющий атакующего 
 * персонажа.
 * @property {PositionedCharacter[]} attackTargets - Массив объектов, 
 * представляющих цели, на которые может атаковать атакующий.
 */
export type AttackerWithTargets = {
  attacker: PositionedCharacter;
  attackTargets: PositionedCharacter[];
}

/**
 * Тип, представляющий объект, содержащий информацию об атакующем и его цели.
 *
 * @type selectedBestAttackerAndTarget
 * @property {PositionedCharacter} attacker - Объект, представляющий атакующего 
 * персонажа.
 * @property {PositionedCharacter} targetPosition - Объект, представляющий цель, 
 * на которую может атаковать атакующий.
 */
export type selectedBestAttackerAndTarget = { 
  attacker: PositionedCharacter; 
  targetPosition: PositionedCharacter 
}

/**
 * Тип, представляющий объект, содержащий информацию об более подходящем атакующем
 * и более подходящей ячейке для перемещения.
 *
 * @type foundBestMove
 * @property {PositionedCharacterOrNull} bestAttacker - Объект, представляющий атакующего 
 * персонажа.
 * @property {number | null} bestTargetMoveCell - Индекс ячейки, на которую может атаковать 
 * атакующий.
 */
export type foundBestMove = { 
  bestAttacker: PositionedCharacterOrNull, 
  bestTargetMoveCell: number | null 
}

/**
 * Тип, представляющий объект с двумя массивами: 
 * - один для компьютерных персонажей, 
 * - другой — для игровых.
 * 
 * @type ComputerAndPlayerCharacters
 * @property {PositionedCharacter[]} computerCharacters - Массив компьютерных персонажей.
 * @property {PositionedCharacter[]} playerCharacters - Массив игровых персонажей.
 */
export type ComputerAndPlayerCharacters = {
  computerCharacters: PositionedCharacter[];
  playerCharacters: PositionedCharacter[];
}

/**
 * Интерфейс, описывающий приоритетную цель атаки.
 * Используется для определения порядка атаки между персонажами в игре.
 * 
 * Содержит информацию об атакующем персонаже, его цели и приоритете атаки.
 * Приоритет определяет очерёдность атаки: чем ниже число, тем раньше происходит атака.
 * 
 * @interface AttackerTargetPriority
 * @property {PositionedCharacter} attacker - Атакующий персонаж с координатами
 * @property {PositionedCharacter} target - Цель атаки с координатами
 * @property {number} priority - Приоритет атаки (меньшее число = выше приоритет)
 * 
 * @example
 * const attackPriority: AttackerTargetPriority = {
 *   attacker: { id: 1, x: 10, y: 20 },
 *   target: { id: 2, x: 15, y: 25 },
 *   priority: 2
 * };
 */
export type AttackerTargetPriority = {
  attacker: PositionedCharacter;
  target: PositionedCharacter;
  priority: number;
};
