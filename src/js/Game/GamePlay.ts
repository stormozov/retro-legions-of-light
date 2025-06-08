import { calcHealthLevel, calcTileType } from '../utils/utils';
import { 
  CellEventListener, 
  GameActionListener,
} from '../types/types';
import PositionedCharacter from './PositionedCharacter';
import { CellHighlight, Cursor } from '../types/enums';

export default class GamePlay {
  private boardSize: number;
  private container: HTMLElement | null;
  private boardEl: HTMLElement | null;
  private cells: HTMLDivElement[];
  private newGameEl: HTMLElement | null;
  private saveGameEl: HTMLElement | null;
  private loadGameEl: HTMLElement | null;

  private cellClickListeners: CellEventListener[];
  private cellEnterListeners: CellEventListener[];
  private cellLeaveListeners: CellEventListener[];
  private newGameListeners: GameActionListener[];
  private saveGameListeners: GameActionListener[];
  private loadGameListeners: GameActionListener[];

  constructor() {
    this.boardSize = 8;
    this.container = null;
    this.boardEl = null;
    this.cells = [];
    this.newGameEl = null;
    this.saveGameEl = null;
    this.loadGameEl = null;

    this.cellClickListeners = [];
    this.cellEnterListeners = [];
    this.cellLeaveListeners = [];
    this.newGameListeners = [];
    this.saveGameListeners = [];
    this.loadGameListeners = [];
  }

  bindToDOM(container: HTMLElement): void {
    this.container = container;
  }

  /**
   * Отрисовывает доску с определенной тематикой.
   *
   * @param theme
   */
  drawUi(theme: string): void {
    this.checkBinding();

    this.container!.innerHTML = `
        <div class="controls">
            <button data-id="action-restart" class="btn">Новая игра</button>
            <button data-id="action-save" class="btn">Сохранить</button>
            <button data-id="action-load" class="btn">Загрузить</button>
        </div>
        <div class="board-container">
            <div data-id="board" class="board"></div>
        </div>
      `;

    this.newGameEl = this.container!.querySelector('[data-id=action-restart]');
    this.saveGameEl = this.container!.querySelector('[data-id=action-save]');
    this.loadGameEl = this.container!.querySelector('[data-id=action-load]');

    this.newGameEl!.addEventListener('click', (event) => this.onNewGameClick(event));
    this.saveGameEl!.addEventListener('click', (event) => this.onSaveGameClick(event));
    this.loadGameEl!.addEventListener('click', (event) => this.onLoadGameClick(event));

    this.boardEl = this.container!.querySelector('[data-id=board]') as HTMLDivElement;
    this.boardEl.classList.add(theme);

    for ( let i = 0; i < this.boardSize ** 2; i += 1 ) {
      const cellEl = document.createElement('div');
      cellEl.classList.add('cell', 'map-tile', `map-tile-${calcTileType(i, this.boardSize)}`);
      cellEl.addEventListener('mouseenter', (event) => this.onCellEnter(event));
      cellEl.addEventListener('mouseleave', (event) => this.onCellLeave(event));
      cellEl.addEventListener('click', (event) => this.onCellClick(event));

      this.boardEl.appendChild(cellEl);
    }

    this.cells = Array.from(this.boardEl.children) as HTMLDivElement[];
  }

  /**
 * Рисует фигуры (с символами) на доске.
 *
 * @param {FigurePositionInBoard} positions массив объектов {position, character}
 */
  redrawPositions(positions: PositionedCharacter[]): void {
    for ( const cell of this.cells ) cell.innerHTML = '';

    const fragment = document.createDocumentFragment();

    for ( const position of positions ) {
      const cellEl = this.boardEl!.children[position.position] as HTMLDivElement;
      const charEl = document.createElement('div');
      charEl.classList.add('character', position.character.type);

      const healthEl = document.createElement('div');
      healthEl.classList.add('health-level');

      const healthIndicatorEl = document.createElement('div');
      healthIndicatorEl.classList.add(
        'health-level-indicator',
        `health-level-indicator-${calcHealthLevel(position.character.health)}`
      );
      healthIndicatorEl.style.width = `${position.character.health}%`;

      healthEl.appendChild(healthIndicatorEl);
      charEl.appendChild(healthEl);
      fragment.appendChild(charEl);

      cellEl.appendChild(fragment);
    }
  }

  /**
   * Добавляет прослушиватель к указателю мыши для ячейки.
   *
   * @param callback
   */
  addCellEnterListener(callback: CellEventListener): void {
    this.cellEnterListeners.push(callback);
  }

  /**
   * Добавляет прослушиватель для выхода мыши из ячейки.
   *
   * @param callback
   */
  addCellLeaveListener(callback: CellEventListener): void {
    this.cellLeaveListeners.push(callback);
  }

  /**
   * Добавляет прослушиватель для клика мыши по ячейке.
   *
   * @param callback
   */
  addCellClickListener(callback: CellEventListener): void {
    this.cellClickListeners.push(callback);
  }

  /**
   * Добавляет прослушиватель для нажатия кнопки "New Game".
   *
   * @param callback
   */
  addNewGameListener(callback: GameActionListener): void {
    this.newGameListeners.push(callback);
  }

  /**
   * Добавляет прослушиватель для нажатия кнопки "Save Game".
   *
   * @param callback
   */
  addSaveGameListener(callback: GameActionListener): void {
    this.saveGameListeners.push(callback);
  }

  /**
   * Добавляет прослушиватель для нажатия кнопки "Load Game".
   *
   * @param callback
   */
  addLoadGameListener(callback: GameActionListener): void {
    this.loadGameListeners.push(callback);
  }

  private onCellEnter(event: MouseEvent): void {
    event.preventDefault();
    const index = this.cells.indexOf(event.currentTarget as HTMLDivElement);
    this.cellEnterListeners.forEach((o) => o.call(null, index));
  }

  private onCellLeave(event: MouseEvent): void {
    event.preventDefault();
    const index = this.cells.indexOf(event.currentTarget as HTMLDivElement);
    this.cellLeaveListeners.forEach((o) => o.call(null, index));
  }

  private onCellClick(event: MouseEvent): void {
    const index = this.cells.indexOf(event.currentTarget as HTMLDivElement);
    this.cellClickListeners.forEach((o) => o.call(null, index));
  }

  private onNewGameClick(event: Event): void {
    event.preventDefault();
    this.newGameListeners.forEach((o) => o.call(null));
  }

  private onSaveGameClick(event: Event): void {
    event.preventDefault();
    this.saveGameListeners.forEach((o) => o.call(null));
  }

  private onLoadGameClick(event: Event): void {
    event.preventDefault();
    this.loadGameListeners.forEach((o) => o.call(null));
  }

  static showError(message: string): void {
    alert(message);
  }

  static showMessage(message: string): void {
    alert(message);
  }

  selectCell(index: number, color: CellHighlight = CellHighlight.Yellow): void {
    this.deselectCell(index);
    this.cells[index].classList.add('selected', `selected-${color}`);
  }

  deselectCell(index: number): void {
    const cell = this.cells[index];
    Array.from(cell.classList)
      .filter((className) => className.startsWith('selected'))
      .forEach((className) => cell.classList.remove(className));
  }

  showCellTooltip(message: string, index: number): void {
    this.cells[index].title = message;
  }

  hideCellTooltip(index: number): void {
    this.cells[index].title = '';
  }

  showDamage(index: number, damage: number): Promise<void> {
    return new Promise((resolve) => {
      const cell = this.cells[index];
      const damageEl = document.createElement('span');
      damageEl.textContent = damage.toString();
      damageEl.classList.add('damage');

      cell.appendChild(damageEl);

      damageEl.addEventListener('animationend', () => {
        cell.removeChild(damageEl);
        resolve();
      });
    });
  }

  setCursor(cursor: Cursor): void {
    if ( this.boardEl ) this.boardEl.style.cursor = cursor;
  }

  private checkBinding(): void {
    if ( this.container === null ) {
      throw new Error('GamePlay not bind to DOM');
    }
  }
}
