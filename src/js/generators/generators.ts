import Character from '../Entities/Character';
import Team from '../Entities/Team';

/**
 * Формирует экземпляр персонажа из массива `allowedTypes` со
 * случайным уровнем от 1 до `maxLevel`.
 *
 * @param {Array} allowedTypes массив классов.
 * @param {number} maxLevel максимальный возможный уровень персонажа.
 * 
 * @returns {Generator} генератор, который при каждом вызове
 * возвращает новый экземпляр класса персонажа.
 *
 */
export function* characterGenerator(allowedTypes: Array<Function>, maxLevel: number): Generator<Character> {
  // TODO: write logic here
}

/**
 * Формирует массив персонажей на основе `characterGenerator`.
 * 
 * @param {Array} allowedTypes массив классов.
 * @param {number} maxLevel максимальный возможный уровень персонажа.
 * @param {number} characterCount количество персонажей, которое нужно сформировать.
 * 
 * @returns {Team} экземпляр `Team`, хранящий экземпляры персонажей. 
 * Количество персонажей в команде - `characterCount`.
 * */
export function generateTeam(allowedTypes: Array<any>, maxLevel: number, characterCount: number): void {
  // TODO: write logic here
}
