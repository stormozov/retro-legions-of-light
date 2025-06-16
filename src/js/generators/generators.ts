import Character from '../Entities/Character';
import Team from '../Entities/Team';
import { CharacterType } from '../types/enums';
import { CharacterLevel } from '../types/types';

/**
 * Формирует экземпляр персонажа из массива `allowedTypes` со
 * случайным уровнем от 1 до `maxLevel`.
 * 
 * @param {Character[]} allowedTypes массив разрешенных классов.
 * @param {number} maxLevel максимальный возможный уровень персонажа. 
 * Не может быть меньше 1.
 * 
 * @yields {Character} экземпляр случайного персонажа со случайным уровнем.
 */
export function* characterGenerator(
  allowedTypes: { new(level: number): Character }[], 
  maxLevel: number
): Generator<Character> {
  if (maxLevel < 1) {
    throw new Error('Аргумент maxLevel функции characterGenerator не должен быть меньше 1');
  }
  
  while (true) {
    // Выбираем случайный класс персонажа из allowedTypes
    const CharacterClass = allowedTypes[Math.floor(Math.random() * allowedTypes.length)];

    // Генерируем случайный уровень от 1 до maxLevel
    const level = Math.floor(Math.random() * maxLevel) + 1 as CharacterLevel;

    // Создаем экземпляр персонажа и возвращаем его
    yield new CharacterClass(level);
  }
}

/**
 * Формирует массив персонажей на основе `characterGenerator`.
 * 
 * @param {Character[]} allowedTypes массив разрешенных классов.
 * @param {number} maxLevel максимальный возможный уровень персонажа.
 * @param {number} characterCount количество персонажей, которое нужно сформировать.
 * 
 * @returns {Team} экземпляр `Team`, хранящий экземпляры персонажей. 
 * Количество персонажей в команде - `characterCount`.
 * */
export function generateTeam(
  allowedTypes: { new(level: number): Character }[], 
  maxLevel: number, 
  characterCount: number
): Team {
  const team = new Team();
  const generator = characterGenerator(allowedTypes, maxLevel);

  while (team.size < characterCount) {
    const character = generator.next().value;
    const instanceType = character.constructor.name;

    if (instanceType === CharacterType.Magician) {
      // Проверяем, что команда не содержит двух магов
      const hasMagician = team.members.some(
        (member) => member.constructor.name === CharacterType.Magician
      );
      if (!hasMagician) team.add(character);
    } else {
      team.add(character);
    }
  }

  return team;
}
