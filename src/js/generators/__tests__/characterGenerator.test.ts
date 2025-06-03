import heroTypes from '../../Entities/Heroes';
import { characterGenerator } from '../generators';

describe('Функция characterGenerator(allowedTypes, maxLevel)', () => {
  it('переданы heroTypes и 3; генерирует экземпляры персонажей с 1 до 3 уровня', () => {
    const maxLevel = 3;
    const generator = characterGenerator(heroTypes, maxLevel);

    const character1 = generator.next().value;
    const character2 = generator.next().value;

    expect(character1.level).toBeGreaterThanOrEqual(1);
    expect(character1.level).toBeLessThanOrEqual(maxLevel);
    expect(character2.level).toBeGreaterThanOrEqual(1);
    expect(character2.level).toBeLessThanOrEqual(maxLevel);
  });

  it('переданы heroTypes и 2; генерирует экземпляры разрешенных персонажей', () => {
    const generator = characterGenerator(heroTypes, 2);

    const character1 = generator.next().value;
    const character2 = generator.next().value;

    expect(heroTypes).toContainEqual(character1.constructor);
    expect(heroTypes).toContainEqual(character2.constructor);
  });

  it('передан макс. уровень меньше 1; выбрасывает ошибку', () => {
    expect(() => {
      const generator = characterGenerator(heroTypes, 0);
      generator.next();
    }).toThrow('Аргумент maxLevel функции characterGenerator не должен быть меньше 1');
  });  

  it('генерируем 100 персонажей; генератор должен продолжать генерировать персонажей при бесконечном вызове', () => {
    const maxLevel = 2;
    const generator = characterGenerator(heroTypes, maxLevel);

    const characters = new Set();

    // Генерируем 100 персонажей
    for (let i = 0; i < 100; i++) {
      const character = generator.next().value;
      characters.add(character.type);
    };

    // Проверяем, что хотя бы один тип был сгенерирован
    expect(characters.size).toBeGreaterThan(0);
    // Проверяем, что все типы присутствуют
    expect(characters).toEqual(new Set(['bowman', 'swordsman', 'magician']));
  });
});
