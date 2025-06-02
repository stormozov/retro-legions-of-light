import { CharacterType } from './enums';
import { CharacterLevel, PossibleCharacterSetAttributes } from './types';

/**
 * Интерфейс для персонажа.
 */
export interface ICharacter {
  level: CharacterLevel;
  type: CharacterType;
  attack: number;
  defense: number;
  health: number;

  setAttributes(attrs: PossibleCharacterSetAttributes): void;
}

/**
 * Интерфейс IGameController управляет игровым процессом.
 * @interface
 */
export interface IGameController {
  init(): void;
  onCellClick(index: number): void;
  onCellEnter(index: number): void;
  onCellLeave(index: number): void;
}
