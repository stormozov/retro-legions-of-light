import { CharacterType } from '../../types/enums';
import Character from '../Character';

/**
 * Класс персонажа `Magician`.
 * 
 * Наследует свойства и методы класса `Character`.
 */
export default class Magician extends Character {

  constructor() {
    super(1, CharacterType.Magician);
    this.initDefaultAttributes(CharacterType.Magician);
  }
}
