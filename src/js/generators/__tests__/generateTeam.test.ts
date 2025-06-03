import { expect } from '@jest/globals';
import enemyTypes from '../../Entities/Enemies';
import heroTypes, { Swordsman } from '../../Entities/Heroes';
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
});
