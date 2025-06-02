import { CharacterType } from '../../types/enums';
import Character from '../Character';

/**
 * Класс персонажа `Demon`.
 * 
 * Наследует свойства и методы класса `Character`.
 */
export default class Demon extends Character {

  constructor() {
    super(1, CharacterType.Demon);
    this.initDefaultAttributes(CharacterType.Demon);
  }
}
