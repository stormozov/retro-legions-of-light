import { Bowman } from '../../Entities/Heroes';
import { CellHighlight, Cursor } from '../../types/enums';
import GamePlay from '../GamePlay';
import PositionedCharacter from '../PositionedCharacter';

describe('Класс GamePlay', () => {
  let gamePlay: GamePlay;
  let container: HTMLElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
    gamePlay = new GamePlay();
    gamePlay.bindToDOM(container);
    gamePlay.drawUi('test-theme');
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  describe('Инициализация, bindToDOM(), drawUi() и обработчики событий', () => {
    it('экземпляр создан; должен иметь корректные начальные значения', () => {
      expect(gamePlay).toBeDefined();
      expect((gamePlay as any).boardSize).toBe(8);
      expect((gamePlay as any).container).toBe(container);
      expect((gamePlay as any).cells.length).toBe(64);
    });

    it('метод bindToDOM() должен привязывать контейнер', () => {
      expect((gamePlay as any).container).toBe(container);
    });

    it('метод drawUi() должен создать интерфейс доски и элементы управления', () => {
      const controls = container.querySelector('.controls');
      const boardContainer = container.querySelector('.board-container');
      const board = container.querySelector('.board');

      expect(controls).not.toBeNull();
      expect(boardContainer).not.toBeNull();
      expect(board).not.toBeNull();
      expect(board?.classList.contains('test-theme')).toBe(true);
    });

    it('метод drawUi() должен создать 64 ячейки с классами cell и map-tile', () => {
      const cells = (gamePlay as any).cells;
      expect(cells.length).toBe(64);

      cells.forEach((cell: HTMLElement) => {
        expect(cell.classList.contains('cell')).toBe(true);
        expect(cell.classList.contains('map-tile')).toBe(true);
      });
    });

    it('обработчики событий кнопок должны быть зарегистрированы', () => {
      expect((gamePlay as any).newGameEl).not.toBeNull();
      expect((gamePlay as any).saveGameEl).not.toBeNull();
      expect((gamePlay as any).loadGameEl).not.toBeNull();
      expect((gamePlay as any).statsGameEl).not.toBeNull();
    });

    it('клик по кнопкам должен вызвать соответствующие слушатели', async () => {
      const newGameListener = jest.fn();
      const saveGameListener = jest.fn();
      const loadGameListener = jest.fn();
      const statsGameListener = jest.fn();

      gamePlay.addNewGameListener(newGameListener);
      gamePlay.addSaveGameListener(saveGameListener);
      gamePlay.addLoadGameListener(loadGameListener);
      gamePlay.addStatsGameListener(statsGameListener);

      (gamePlay as any).newGameEl.click();
      (gamePlay as any).saveGameEl.click();
      (gamePlay as any).loadGameEl.click();
      (gamePlay as any).statsGameEl.click();

      expect(newGameListener).toHaveBeenCalled();
      expect(saveGameListener).toHaveBeenCalled();
      expect(loadGameListener).toHaveBeenCalled();
      expect(statsGameListener).toHaveBeenCalled();
    });

    it('события mouseenter, mouseleave и click по ячейке должны вызывать слушатели', () => {
      const enterListener = jest.fn();
      const leaveListener = jest.fn();
      const clickListener = jest.fn();

      gamePlay.addCellEnterListener(enterListener);
      gamePlay.addCellLeaveListener(leaveListener);
      gamePlay.addCellClickListener(clickListener);

      const firstCell = (gamePlay as any).cells[0];
      ['mouseenter', 'mouseleave', 'click'].forEach((eventType) => {
        const event = new MouseEvent(eventType, { bubbles: true });
        firstCell.dispatchEvent(event);
      });

      expect(enterListener).toHaveBeenCalledWith(0);
      expect(leaveListener).toHaveBeenCalledWith(0);
      expect(clickListener).toHaveBeenCalledWith(0);
    });

    it('drawUi() без bindToDOM() должен выбрасывать исключение', () => {
      const unboundGamePlay = new GamePlay();
      expect(() => unboundGamePlay.drawUi('theme')).toThrow('GamePlay not bind to DOM');
    });
  });

  describe('Метод redrawPositions()', () => {
    it('должен очищать содержимое всех ячеек перед перерисовкой', () => {
      const cells = (gamePlay as any).cells;
      cells.forEach((cell: HTMLElement) => cell.innerHTML = 'test');

      gamePlay.redrawPositions([]);
      cells.forEach((cell: HTMLElement) => expect(cell.innerHTML).toBe(''));
    });

    it('должен рисовать символы персонажей и индикатор здоровья', () => {
      const character1 = new Bowman();
      character1.health = 75;
      const character2 = new Bowman();
      character2.health = 75;

      const positions: PositionedCharacter[] = [
        { position: 0, character: character1 },
        { position: 10, character: character2 },
      ];

      gamePlay.redrawPositions(positions);

      positions.forEach(({ position, character }) => {
        const cell = (gamePlay as any).boardEl.children[position] as HTMLElement;
        const charEl = cell.querySelector('.character')!;
        const healthIndicator = charEl.querySelector('.health-level-indicator') as HTMLElement;

        expect(charEl.classList.contains(character.type)).toBe(true);
        expect(healthIndicator.style.width).toBe(`${character.health}%`);
      });
    });
  });

  describe('Методы selectCell(), deselectCell(), showCellTooltip(), hideCellTooltip()', () => {
    it('selectCell() с дефолтным цветом должен добавлять класс selected-yellow', () => {
      gamePlay.selectCell(0);
      const cell = (gamePlay as any).cells[0];

      expect(cell.classList.contains('selected')).toBe(true);
      expect(cell.classList.contains('selected-yellow')).toBe(true);
    });

    it('selectCell() с указанием цвета должен добавлять соответствующий класс', () => {
      gamePlay.selectCell(0, CellHighlight.Red);
      const cell = (gamePlay as any).cells[0];

      expect(cell.classList.contains('selected')).toBe(true);
      expect(cell.classList.contains('selected-red')).toBe(true);
    });

    it('deselectCell() должен удалять все классы selected', () => {
      const selectClasses = ['selected', 'selected-yellow', 'selected-red'];
      const cell = (gamePlay as any).cells[0];
      cell.classList.add(...selectClasses);

      gamePlay.deselectCell(0);

      selectClasses.forEach((selectClass) => expect(cell.classList.contains(selectClass)).toBe(false));
    });

    it('showCellTooltip() должен устанавливать title ячейки', () => {
      gamePlay.showCellTooltip('Test tooltip', 0);
      expect((gamePlay as any).cells[0].title).toBe('Test tooltip');
    });

    it('hideCellTooltip() должен очищать title ячейки', () => {
      (gamePlay as any).cells[0].title = 'Old tooltip';
      gamePlay.hideCellTooltip(0);

      expect((gamePlay as any).cells[0].title).toBe('');
    });
  });

  describe('Методы showDamage() и animateHealthChange()', () => {
    it('showDamage() должен показать урон и удалить его после анимации', async () => {
      const index = 0;
      const damage = 10;
      const promise = gamePlay.showDamage(index, damage);
      const cell = (gamePlay as any).cells[index];
      const damageEl = cell.querySelector('.damage');

      expect(damageEl).not.toBeNull();
      expect(damageEl!.textContent).toBe(damage.toString());

      damageEl?.dispatchEvent(new Event('animationend'));
      await expect(promise).resolves.toBeUndefined();
      expect(cell.querySelector('.damage')).toBeNull();
    });

    it('animateHealthChange() должен изменить ширину индикатора здоровья', async () => {
      const position = 0;
      const fromHealth = 100;
      const toHealth = 50;
      const cell = (gamePlay as any).boardEl.children[position] as HTMLElement;

      const healthIndicator = document.createElement('div');
      healthIndicator.classList.add('health-level-indicator');
      cell.appendChild(healthIndicator);

      const promise = gamePlay.animateHealthChange(position, fromHealth, toHealth);
      await expect(promise).resolves.toBeUndefined();
      expect(healthIndicator.style.width).toBe(`${toHealth}%`);
    });

    it('animateHealthChange() должен разрешаться, если индикатор отсутствует', async () => {
      const position = 0;
      const fromHealth = 100;
      const toHealth = 50;
      const cell = (gamePlay as any).boardEl.children[position] as HTMLElement;

      const healthIndicator = cell.querySelector('.health-level-indicator');
      if (healthIndicator) cell.removeChild(healthIndicator);

      const promise = gamePlay.animateHealthChange(position, fromHealth, toHealth);
      await expect(promise).resolves.toBeUndefined();
    });
  });

  describe('статические методы showError(), showMessage() и setCursor()', () => {
    it('GamePlay.showError() должен вызвать messageModal.open()', () => {
      const spy = jest.spyOn((GamePlay as any).messageModal, 'open').mockImplementation(() => { });
      const message = 'Ошибка!';

      GamePlay.showError(message);
      expect(spy).toHaveBeenCalledWith(message);
      
      spy.mockRestore();
    });

    it('GamePlay.showMessage() должен вызвать messageModal.open()', () => {
      const spy = jest.spyOn((GamePlay as any).messageModal, 'open').mockImplementation(() => { });
      const message = 'Сообщение';

      GamePlay.showMessage(message);

      expect(spy).toHaveBeenCalledWith(message);

      spy.mockRestore();
    });

    it('setCursor() должен установить стиль курсора', () => {
      gamePlay.setCursor(Cursor.Pointer);
      expect((gamePlay as any).boardEl.style.cursor).toBe(Cursor.Pointer);
    });

    it('setCursor() не должен выбрасывать ошибку при отсутствии boardEl', () => {
      (gamePlay as any).boardEl = null;
      expect(() => gamePlay.setCursor(Cursor.Pointer)).not.toThrow();
    });
  });
});
