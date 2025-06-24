import StatisticsService from '../services/StatisticsService';
import { translateMetricName } from '../utils/utils';

/**
 * Класс для работы с модальным окном статистики игры.
 */
export default class StatisticsModal {
  private statisticsService: StatisticsService;
  private statsModal: HTMLElement | null;
  private statsModalBody: HTMLElement | null;
  private statsModalCloseBtn: HTMLElement | null;
  private clearStatsModalBtn: HTMLElement | null;

  private modalActiveClass = 'active';

  /**
   * Создает экземпляр класса StatisticsModal.
   * 
   * @param {StatisticsService} statisticsService - Сервис для работы с статистикой игры.
   */
  constructor(statisticsService: StatisticsService) {
    this.statisticsService = statisticsService;

    this.statsModal = document.getElementById('user-stats-modal');
    this.statsModalBody = this.statsModal.querySelector('.user-stats-modal__body');
    this.statsModalCloseBtn = this.statsModal.querySelector('.user-stats-modal__close-button');
    this.clearStatsModalBtn = this.statsModal.querySelector('.user-stats-modal__clear-button');

    this.initEventListeners();
  }

  /**
   * Инициализирует обработчики событий для модального окна статистики игры.
   */
  private initEventListeners(): void {
    this.handleCloseModalWithBtn();
    this.handleCloseModalWithOverlay();
    this.handleCloseModalWithEsc();
    this.handleClearStatsBtn();
  }

  /**
   * Открывает модальное окно статистики игры.
   */
  open(): void {
    if (!this.statsModal) return;
    this.populateStatsModal();
    this.statsModal.classList.add(this.modalActiveClass);
  }

  /**
   * Закрывает модальное окно статистики игры с помощью кнопки.
   * @private
   */
  private handleCloseModalWithBtn(): void {
    if (this.statsModalCloseBtn) {
      this.statsModalCloseBtn.addEventListener('click', () => this.closeStatsModal());
    }
  }

  /**
   * Закрывает модальное окно статистики игры с помощью оверлея.
   * @private
   */
  private handleCloseModalWithOverlay() {
    if (this.statsModal) {
      this.statsModal.addEventListener('click', (event) => {
        if (event.target === this.statsModal) this.closeStatsModal();
      });
    }
  }

  /**
   * Закрывает модальное окно статистики игры с помощью клавиши Escape.
   * @private
   */
  private handleCloseModalWithEsc() {
    if (this.statsModal) {
      document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && this.statsModal.classList.contains(this.modalActiveClass)) {
          this.closeStatsModal();
        }
      });
    }
  }

  /**
   * Обрабатывает нажатие кнопки "Очистить статистику" в модальном окне статистики игры.
   * @private
   */
  private handleClearStatsBtn() {
    if (this.clearStatsModalBtn) {
      this.clearStatsModalBtn.addEventListener('click', () => {
        this.statisticsService.clearStatistics();
        this.populateStatsModal();
        setTimeout(() => this.closeStatsModal(), 250);
      });
    }
  }

  /**
   * Закрывает модальное окно статистики игры.
   */
  private closeStatsModal(): void {
    if (!this.statsModal) return;

    // Если уже закрывается, ничего не делаем
    if (this.statsModal.classList.contains('closing')) return;

    // Добавляем закрывающий класс для запуска анимации
    this.statsModal.classList.add('closing');

    // Дожидаемся завершения анимации, чтобы удалить активные и закрывающие классы
    const onAnimationEnd = () => {
      this.statsModal.classList.remove(this.modalActiveClass);
      this.statsModal.classList.remove('closing');
      this.statsModal.removeEventListener('animationend', onAnimationEnd);
    };

    this.statsModal.addEventListener('animationend', onAnimationEnd);
  }

  /**
   * Очищает содержимое модального окна статистики игры.
   */
  private clearStatsModal(): void {
    if (this.statsModalBody) this.statsModalBody.innerHTML = '';
  }

  /**
   * Заполняет модальное окно статистики игры данными о результатах.
   */
  private populateStatsModal() {
    if (!this.statsModalBody) return;

    this.clearStatsModal();
    this.switchClearStatsButtonVisibility();
    this.drawStatsItemsModal();
  }

  /**
   * Переключает видимость кнопки clearStatsModalBtn в зависимости от наличия статистики.
   * @private
   */
  private switchClearStatsButtonVisibility(): void {
    // Проверяем, нет ли в статистике пустых значений или значений, равны 0
    const hasStats: boolean = this.statisticsService.hasSavedStatistics();

    // Переключение видимости кнопки clearStatsModalBtn в зависимости от наличия статистики
    this.clearStatsModalBtn.style.display = hasStats ? '' : 'none';
  }

  /**
   * Отрисовывает все метрики статистики в модальном окне.
   * @private
   */
  private drawStatsItemsModal(): void {
    for (const [key, value] of Object.entries(this.statisticsService.stats)) {
      const statItem = document.createElement('div');
      statItem.className = 'user-stats-modal__stat-item';

      const statName = document.createElement('span');
      statName.textContent = translateMetricName(key);

      const statValue = document.createElement('span');
      statValue.textContent = String(value);

      statItem.appendChild(statName);
      statItem.appendChild(statValue);
      this.statsModalBody.appendChild(statItem);
    }
  }
}
