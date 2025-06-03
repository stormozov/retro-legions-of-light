import { expect } from '@jest/globals';
import Team from '../Team';
import { Demon, Undead, Vampire } from '../Enemies';
import Character from '../Character';

describe('Класс Team', () => {
  let team: Team;
  let character1: Demon;
  let character2: Vampire;
  let character3: Undead;
  let members: Character[];

  beforeEach(() => {
    team = new Team();
    character1 = new Demon();
    character2 = new Vampire();
    character3 = new Undead();
    members = [ character1, character2, character3 ];
  });

  it('вызван геттер members(); возвращает пустой массив', () => {
    expect(team.members).toEqual([]);
  });

  it('вызван геттер size(); возвращается кол-во персонажей в команде', () => {
    const testedData = [
      { memberList: [], size: 0 },
      { memberList: members.slice(0, 1), size: 1 },
      { memberList: members.slice(0, 2), size: 2 },
      { memberList: members, size: 3 },
    ]

    testedData.forEach(({ memberList, size }) => {
      team = new Team(memberList);
      expect(team.size).toBe(size);
    });
  });

  it('вызван метод add(); команда содержит добавленного персонажа', () => {
    team.add(character1);
    expect(team.members).toContain(character1);
  });

  it('вызван метод addAll(); команда содержит добавленных персонажей', () => {
    team.addAll(members);
    expect(team.members).toEqual(expect.arrayContaining(members));
  });

  it('вызван метод remove(); команда не содержит удаленного персонажа', () => {
    team.add(character1);
    team.remove(character1);

    expect(team.members).not.toContain(character1);
  });

  it('вызван метод remove() с персонажем которого нет в команде; не выбрасывается исключение', () => {
    team.remove(character1);

    expect(team.size).toBe(0);
  });

  it('вызван метод has(); возвращается true, если персонаж есть в команде', () => {
    team.add(character1);
    expect(team.has(character1)).toBe(true);
  });

  it('вызван метод has(); возвращается false, если персонажа нет в команде', () => {
    expect(team.has(character1)).toBe(false);
  });

  it('вызван метод clear(); команда пуста', () => {
    team.addAll(members);
    team.clear();

    expect(team.members).toEqual([]);
  });
});
