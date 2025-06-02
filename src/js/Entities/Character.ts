import characterData from '../data/characters.json';
import AbstractClassError from '../errors/AbstractClassError';
import { CharacterType } from '../types/enums';
import { ICharacter } from '../types/interfaces';
import { CharacterLevel, PossibleCharacterSetAttributes } from '../types/types';

/**
 * Базовый класс, от которого наследуются классы персонажей.
 * 
 * Реализовывает интерфейс `ICharacter`.
 * 
 * @property {CharacterLevel} level - уровень персонажа, от 1 до 4.
 * @property {number} attack - показатель атаки.
 * @property {number} defense - показатель защиты.
 * @property {number} health - здоровье персонажа.
 * @property {CharacterType} type - тип персонажа. Возможные значения:
 * - swordsman
 * - bowman
 * - magician
 * - daemon
 * - undead
 * - vampire
 * 
 * @throws Выбрасывается при попытке создать экземпляр абстрактного класса `Character`.
 * 
 * @abstract
 */
export default class Character implements ICharacter {
  level: CharacterLevel;
  readonly type: CharacterType;
  attack: number;
  defense: number;
  health: number;

  constructor(level: CharacterLevel = 1, type: CharacterType = CharacterType.Swordsman) {
    this.level = level;
    this.type = type;
    this.attack = 0;
    this.defense = 0;
    this.health = 50;
    
    if ( new.target === Character ) throw new AbstractClassError('CONSTRUCTOR');
  }

  /**
   * Инициализирует атрибуты персонажа по умолчанию.
   * 
   * @param type - тип персонажа.
   */
  protected initDefaultAttributes(type: CharacterType): void {
    const attrs = characterData.characters[type];

    this.setAttributes({
      attack: attrs.attack,
      defense: attrs.defense,
      health: attrs.health
    });
  }

  /**
   * Устанавливает атрибуты персонажа.
   * 
   * @param attrs - объект, содержащий атрибуты персонажа.
   */
  setAttributes(attrs: PossibleCharacterSetAttributes): void {
    const { level, attack, defense, health } = attrs;

    if ( level !== undefined ) this.level = level;
    if ( attack !== undefined ) this.attack = attack;
    if ( defense !== undefined ) this.defense = defense;
    if ( health !== undefined ) this.health = health;
  }
}
