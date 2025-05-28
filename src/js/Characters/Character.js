/**
 * Базовый класс, от которого наследуются классы персонажей.
 * 
 * @property {number} level - уровень персонажа, от 1 до 4.
 * @property {number} attack - показатель атаки.
 * @property {number} defense - показатель защиты.
 * @property {number} health - здоровье персонажа.
 * @property {string} type - строка с одним из допустимых значений:
 * - swordsman
 * - bowman
 * - magician
 * - daemon
 * - undead
 * - vampire
 */
export default class Character {
  constructor(level, type = 'generic') {
    this.level = level;
    this.attack = 0;
    this.defense = 0;
    this.health = 50;
    this.type = type;
    // TODO: выбросите исключение, если кто-то использует "new Character()"
  }
}
