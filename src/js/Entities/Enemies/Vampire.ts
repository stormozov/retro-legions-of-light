import { CharacterType } from '../../types/enums';
import Character from '../Character';

/**
 * Класс персонажа `Vampire`.
 * 
 * Наследует свойства и методы класса `Character`.
 */
export default class Vampire extends Character {

  constructor() {
    super(1, CharacterType.Vampire);
    this.initDefaultAttributes(CharacterType.Vampire);
  }
}
