import { ICharacter } from '../../types/interfaces';

/**
 * Базовый класс, от которого наследуются классы персонажей.
 * 
 * Реализовывает интерфейс `ICharacter`
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
export default class Character implements ICharacter {
  level: number;
  type: string;
  attack: number;
  defense: number;
  health: number;
  // TODO: Написать enum для типа персонажа

  constructor(level: number, type: string = 'generic') {
    this.level = level;
    this.type = type;
    this.attack = 0;
    this.defense = 0;
    this.health = 50;
    // TODO: выбросите исключение, если кто-то использует "new Character()"
  }
}
