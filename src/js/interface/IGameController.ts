/**
 * Интерфейс IGameController управляет игровым процессом.
 * @interface
 */
export default interface IGameController {
  init(): void;
  onCellClick(index: number): void;
  onCellEnter(index: number): void;
  onCellLeave(index: number): void;
}
