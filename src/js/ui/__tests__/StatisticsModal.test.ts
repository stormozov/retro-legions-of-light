import StatisticsModal from '../StatisticsModal';
import StatisticsService from '../../services/StatisticsService';
import * as utils from '../../utils/utils';

jest.mock('../../services/StatisticsService');

describe('Класс StatisticsModal', () => {
  let modalElement: HTMLElement;
  let modalBodyElement: HTMLElement;
  let closeButtonElement: HTMLElement;
  let clearButtonElement: HTMLElement;
  let statisticsServiceMock: jest.Mocked<StatisticsService>;
  let statisticsModal: StatisticsModal;
  const activeModalClass = 'active';
  const closingModalClass = 'closing';

  beforeEach(() => {
    // Setup DOM elements
    modalElement = document.createElement('div');
    modalElement.id = 'user-stats-modal';
    modalElement.classList.add('modal');

    modalBodyElement = document.createElement('div');
    modalBodyElement.classList.add('user-stats-modal__body');
    modalElement.appendChild(modalBodyElement);

    closeButtonElement = document.createElement('button');
    closeButtonElement.classList.add('user-stats-modal__close-button');
    modalElement.appendChild(closeButtonElement);

    clearButtonElement = document.createElement('button');
    clearButtonElement.classList.add('user-stats-modal__clear-button');
    modalElement.appendChild(clearButtonElement);

    // Mock document.getElementById to return modalElement
    jest.spyOn(document, 'getElementById').mockReturnValue(modalElement);

    // Mock translateMetricName utility function
    jest.spyOn(utils, 'translateMetricName').mockImplementation((key: string) => `translated-${key}`);

    // Create mock for StatisticsService
    statisticsServiceMock = {
      clearStatistics: jest.fn(),
      hasSavedStatistics: jest.fn(),
      stats: {},
    } as unknown as jest.Mocked<StatisticsService>;

    // Create instance of StatisticsModal with mocked service
    statisticsModal = new StatisticsModal(statisticsServiceMock);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Метод open()', () => {
    it('должен заполнить модальное окно и добавить класс active', () => {
      Object.defineProperty(statisticsServiceMock, 'stats', {
        get: () => ({ playerDefeats: 10, enemiesKilled: 5 }),
        configurable: true,
      });
      statisticsServiceMock.hasSavedStatistics.mockReturnValue(true);

      statisticsModal.open();

      expect(modalElement.classList.contains(activeModalClass)).toBe(true);
      expect(modalBodyElement.children.length).toBe(2);

      const statItems = Array.from(modalBodyElement.children);
      expect(statItems[0].textContent).toContain('translated-playerDefeats');
      expect(statItems[0].textContent).toContain('10');
      expect(statItems[1].textContent).toContain('translated-enemiesKilled');
      expect(statItems[1].textContent).toContain('5');
    });

    it('если modal отсутствует, ничего не происходит', () => {
      jest.spyOn(document, 'getElementById').mockReturnValue(null);
      const modal = new StatisticsModal(statisticsServiceMock);
      expect(() => modal.open()).not.toThrow();
    });
  });

  describe('Метод closeStatsModal()', () => {
    it('должен добавить класс closing и удалить active и closing после анимации', () => {
      statisticsModal.open();
      expect(modalElement.classList.contains(activeModalClass)).toBe(true);

      const removeEventListenerSpy = jest.spyOn(modalElement, 'removeEventListener');

      statisticsModal['closeStatsModal']();

      expect(modalElement.classList.contains(closingModalClass)).toBe(true);

      // Simulate animationend event
      const animationEndEvent = new Event('animationend');
      modalElement.dispatchEvent(animationEndEvent);

      expect(modalElement.classList.contains(activeModalClass)).toBe(false);
      expect(modalElement.classList.contains(closingModalClass)).toBe(false);
      expect(removeEventListenerSpy).toHaveBeenCalledWith('animationend', expect.any(Function));
    });

    it('если modal отсутствует, ничего не происходит', () => {
      jest.spyOn(document, 'getElementById').mockReturnValue(null);
      const modal = new StatisticsModal(statisticsServiceMock);
      expect(() => modal['closeStatsModal']()).not.toThrow();
    });

    it('если modal уже закрывается, ничего не происходит', () => {
      modalElement.classList.add(closingModalClass);
      expect(() => statisticsModal['closeStatsModal']()).not.toThrow();
    });
  });

  describe('Обработчики событий', () => {
    it('клик по кнопке закрытия; вызывает closeStatsModal', () => {
      const closeSpy = jest.spyOn(statisticsModal as any, 'closeStatsModal');
      closeButtonElement.click();

      expect(closeSpy).toHaveBeenCalled();
    });

    it('клик по оверлею; вызывает closeStatsModal', () => {
      const closeSpy = jest.spyOn(statisticsModal as any, 'closeStatsModal');

      const clickEvent = new MouseEvent('click', { bubbles: true });
      Object.defineProperty(clickEvent, 'target', { value: modalElement });
      modalElement.dispatchEvent(clickEvent);

      expect(closeSpy).toHaveBeenCalled();
    });

    it('клик по содержимому модального окна; не вызывает closeStatsModal', () => {
      const closeSpy = jest.spyOn(statisticsModal as any, 'closeStatsModal');
      const clickEvent = new MouseEvent('click', { bubbles: true });
      Object.defineProperty(clickEvent, 'target', { value: modalBodyElement });
      modalElement.dispatchEvent(clickEvent);
      expect(closeSpy).not.toHaveBeenCalled();
    });

    it('нажата кнопка ESC при открытом модальном окне; вызывает closeStatsModal', () => {
      const closeSpy = jest.spyOn(statisticsModal as any, 'closeStatsModal');

      statisticsModal.open();
      const keydownEvent = new KeyboardEvent('keydown', { key: 'Escape' });
      document.dispatchEvent(keydownEvent);

      expect(closeSpy).toHaveBeenCalled();
    });

    it('нажата кнопка ESC при закрытом модальном окне; не вызывает closeStatsModal', () => {
      const closeSpy = jest.spyOn(statisticsModal as any, 'closeStatsModal');

      const keydownEvent = new KeyboardEvent('keydown', { key: 'Escape' });
      document.dispatchEvent(keydownEvent);

      expect(closeSpy).not.toHaveBeenCalled();
    });

    it('нажата кнопка Enter при открытом модальном окне; не вызывает closeStatsModal', () => {
      const closeSpy = jest.spyOn(statisticsModal as any, 'closeStatsModal');

      statisticsModal.open();
      const keydownEvent = new KeyboardEvent('keydown', { key: 'Enter' });
      document.dispatchEvent(keydownEvent);

      expect(closeSpy).not.toHaveBeenCalled();
    });

    it('клик по кнопке очистки; вызывает clearStatistics, обновляет модальное окно и закрывает его', () => {
      jest.useFakeTimers();
      statisticsServiceMock.hasSavedStatistics.mockReturnValue(true);
      
      const populateSpy = jest.spyOn(statisticsModal as any, 'populateStatsModal');
      const closeSpy = jest.spyOn(statisticsModal as any, 'closeStatsModal');

      clearButtonElement.click();

      expect(statisticsServiceMock.clearStatistics).toHaveBeenCalled();
      expect(populateSpy).toHaveBeenCalled();

      jest.advanceTimersByTime(250);

      expect(closeSpy).toHaveBeenCalled();

      jest.useRealTimers();
    });
  });

  describe('Метод switchClearStatsButtonVisibility()', () => {
    it('есть статистика; показывает кнопку очистки статистики', () => {
      statisticsServiceMock.hasSavedStatistics.mockReturnValue(true);
      statisticsModal['switchClearStatsButtonVisibility']();

      expect(clearButtonElement.style.display).toBe('');
    });

    it('статистики нет; скрывает кнопку очистки статистики', () => {
      statisticsServiceMock.hasSavedStatistics.mockReturnValue(false);
      statisticsModal['switchClearStatsButtonVisibility']();

      expect(clearButtonElement.style.display).toBe('none');
    });
  });

  describe('Метод drawStatsItemsModal()', () => {
    it('отрисовывает элементы статистики в модальном окне', () => {
      Object.defineProperty(statisticsServiceMock, 'stats', {
        get: () => ({ playerDefeats: 3, enemiesKilled: 2 }),
        configurable: true,
      });

      statisticsModal['drawStatsItemsModal']();

      const statItems = Array.from(modalBodyElement.children);
      expect(statItems).toHaveLength(2);

      statItems.forEach((item) => {
        expect(item.className).toBe('user-stats-modal__stat-item');
      });

      const [firstItem, secondItem] = statItems;
      expect(firstItem.textContent).toMatch(/translated-playerDefeats.*3/);
      expect(secondItem.textContent).toMatch(/translated-enemiesKilled.*2/);
    });
  });

  describe('Метод populateStatsModal()', () => {
    it('statsModalBody отсутствует; ничего не происходит', () => {
      statisticsModal['statsModalBody'] = null;

      expect(() => statisticsModal['populateStatsModal']()).not.toThrow();
      expect(modalBodyElement.innerHTML).toBe('');
    });
  });
});
