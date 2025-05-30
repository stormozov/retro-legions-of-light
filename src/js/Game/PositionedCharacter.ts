import Character from '../Entities/Characters/Character';

export default class PositionedCharacter {
  private character: Character;
  private position: number;

  constructor(character: Character, position: number) {
    this.character = character;
    this.position = position;
  }
}
