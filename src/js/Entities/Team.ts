import Character from './Character';

/**
 * Класс, представляющий персонажей команды.
 * 
 * Например
 * @example
 * ```js
 * const members = [new Swordsman(2), new Bowman(1)]
 * const team = new Team(members);
 *
 * team.members // [swordsman, bowman]
 * ```
 * */
export default class Team {
  private readonly _members: Set<Character>;

  constructor(members: Character[] = []) {
    this._members = new Set(members);
  }

  /**
   * Возвращает персонажей в команде в виде массива.
   * @returns {Character[]} массив персонажей, входящих в команду.
   */
  get members(): Character[] {
    return [...this._members];
  }

  /**
   * Возвращает количество персонажей в команде.
   * @returns {number} количество персонажей в команде
   */
  get size(): number {
    return this._members.size;
  }

  /**
   * Добавляет одного персонажа в команду.
   * @param character - персонаж, которого нужно добавить в команду.
   * @returns this Возвращаем this для поддержки цепочек
   */
  add(character: Character): this {
    this._members.add(character);
    return this;
  }

  /**
   * Добавляет несколько персонажей в команду.
   * @param characters - массив персонажей, которых нужно добавить в команду.
   * @returns this
   */
  addAll(characters: Character[]): this {
    characters.forEach((character) => this._members.add(character));
    return this;
  }

  /**
   * Удаляет персонажа из команды.
   * @param character - персонаж, которого нужно удалить из команды.
   * @returns {Boolean} true, если персонаж был удален, иначе false.
   */
  remove(character: Character): boolean {
    return this._members.delete(character);
  }

  /**
   * Проверяет есть ли персонаж в команде.
   * @param character - персонаж, которого нужно проверить.
   * @returns {Boolean} true, если персонаж есть в команде, иначе false.
   */
  has(character: Character): boolean {
    return this._members.has(character);
  }

  /**
   * Полностью очищает команду.
   */
  clear(): void {
    this._members.clear();
  }
}
