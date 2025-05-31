/**
 * Интерфейс для персонажа.
 */
export interface ICharacter {
  level: number;
  type: string;
  attack: number;
  defense: number;
  health: number;
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
