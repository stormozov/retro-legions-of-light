import { CharacterType } from '../../types/enums';
import Character from '../Character';

/**
 * Класс персонажа `Bowman`.
 * 
 * Наследует свойства и методы класса `Character`.
 */
export default class Bowman extends Character {

  constructor() {
    super(1, CharacterType.Bowman);
    this.initDefaultAttributes(CharacterType.Bowman);
  }
}
