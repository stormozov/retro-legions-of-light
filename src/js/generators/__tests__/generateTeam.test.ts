import { expect } from '@jest/globals';
import enemyTypes from '../../Entities/Enemies';
import heroTypes, { Magician, Swordsman } from '../../Entities/Heroes';
import { generateTeam } from '../generators';

describe('Функция generateTeam(allowedTypes, maxLevel, characterCount)', () => {
  it('передан heroTypes, 4 и 3; должен создать команду с 3 персонажами', () => {
    const allowedTypes = heroTypes;
    const maxLevel = 4;
    const characterCount = 3;

    const team = generateTeam(allowedTypes, maxLevel, characterCount);

    expect(team.size).toBe(characterCount);
  });

  it('передан Swordsman; должен создать команду с персонажами класса Swordsman', () => {
    const allowedTypes = [Swordsman];
    const maxLevel = 4;
    const characterCount = 5;

    const team = generateTeam(allowedTypes, maxLevel, characterCount);

    team.members.forEach((member) => expect(member).toBeInstanceOf(Swordsman));
  });

  it('передан enemyTypes, 2 и 10; должен создать команду с персонажами уровня не более 2', () => {
    const allowedTypes = enemyTypes;
    const maxLevel = 2;
    const characterCount = 10;

    const team = generateTeam(allowedTypes, maxLevel, characterCount);

    team.members.forEach((member) => {
      expect(member.level).toBeLessThanOrEqual(maxLevel);
    });
  });

  it('передан characterCount равный 0; должен создать пустую команду', () => {
    const allowedTypes = enemyTypes;
    const maxLevel = 4;
    const characterCount = 0;

    const team = generateTeam(allowedTypes, maxLevel, characterCount);

    expect(team.size).toBe(0);
  });

  it('передан пустой allowedTypes; должен выбросить исключение', () => {
    const allowedTypes: any[] = [];
    const maxLevel = 4;
    const characterCount = 3;

    expect(() => generateTeam(allowedTypes, maxLevel, characterCount)).toThrow();
  });

  it('передан Magician в allowedTypes; должно выдавать ошибку при невозможности \
создать команду из-за ограничений', () => {
    const allowedTypes = [Magician];
    const maxLevel = 1;
    const characterCount = 2; // Пытаемся создать команду из 2 магов

    expect(() => {
      generateTeam(allowedTypes, maxLevel, characterCount);
    }).toThrow(
      `Превышен лимит попыток генерации команды после ${characterCount * 100} попыток`
    );
  });

  it('должен добавлять не более одного мага в команду', () => {
    const allowedTypes = [Magician, Swordsman];
    const maxLevel = 4;
    const characterCount = 5;

    const team = generateTeam(allowedTypes, maxLevel, characterCount);

    const magicianCount = team.members.filter(
      (member) => member.constructor.name === 'Magician'
    ).length;

    expect(magicianCount).toBeLessThanOrEqual(1);
  });
});
