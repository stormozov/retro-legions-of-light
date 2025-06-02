import { CharacterType } from '../../types/enums';
import Character from '../Character';

/**
 * Класс персонажа `Undead`.
 * 
 * Наследует свойства и методы класса `Character`.
 */
export default class Undead extends Character {

  constructor() {
    super(1, CharacterType.Undead);
    this.initDefaultAttributes(CharacterType.Undead);
  }
}
