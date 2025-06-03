import Character from '../Entities/Character';

/**
* Класс для представления позиционированного персонажа.
*/
export default class PositionedCharacter {
  readonly character: Character;
  readonly position: number;

  constructor(character: Character, position: number) {
    this.character = character;
    this.position = position;
  }
}
