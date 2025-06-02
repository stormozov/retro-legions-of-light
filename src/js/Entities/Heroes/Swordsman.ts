import { CharacterType } from '../../types/enums';
import Character from '../Character';

/**
 * Класс персонажа `Swordsman`.
 * 
 * Наследует свойства и методы класса `Character`.
 */
export default class Swordsman extends Character {

  constructor() {
    super(1, CharacterType.Swordsman);
    this.initDefaultAttributes(CharacterType.Swordsman);
  }
}
