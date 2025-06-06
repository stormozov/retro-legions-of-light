import { CharacterType } from '../../types/enums';
import Bowman from './Bowman';
import Magician from './Magician';
import Swordsman from './Swordsman';

const heroTypes = [ Bowman, Swordsman, Magician ];

export const playerCharacterTypes = [
  CharacterType.Swordsman, CharacterType.Bowman, CharacterType.Magician
];

export default heroTypes;

export {
  Bowman,
  Swordsman,
  Magician
}
