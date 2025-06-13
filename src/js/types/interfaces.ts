import { CharacterType } from './enums';
import { CharacterLevel, PossibleCharacterSetAttributes } from './types';
import { Theme } from '../types/enums';
import PositionedCharacter from '../Game/PositionedCharacter';
import Character from '../Entities/Character';

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

/**
 * Интерфейс ILevelTransitionService описывает публичный API класса LevelTransitionService.
 */
export interface ILevelTransitionService {
  startNewLevel(): void;
  advanceToNextTheme(): void;
  levelUpPlayerCharacters(): void;
  levelUpCharacter(character: Character): void;
  getCurrentTheme(): Theme;
  setCurrentTheme(theme: Theme): void;
  getPositionedCharacters(): PositionedCharacter[];
  setPositionedCharacters(positionedCharacters: PositionedCharacter[]): void;
}
