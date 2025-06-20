import StatisticsService from '../services/StatisticsService';

/**
 * Класс для работы с модальным окном статистики игры.
 */
export default class StatisticsModal {
  private statisticsService: StatisticsService;
  private statsModal: HTMLElement | null;
  private statsModalBody: HTMLElement | null;
  private statsModalCloseBtn: HTMLElement | null;

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

    this.initEventListeners();
  }

  /**
   * Инициализирует обработчики событий для модального окна статистики игры.
   */
  private initEventListeners(): void {
    if (this.statsModalCloseBtn) {
      this.statsModalCloseBtn.addEventListener('click', () => this.closeStatsModal());
    }
    if (this.statsModal) {
      this.statsModal.addEventListener('click', (event) => {
        if (event.target === this.statsModal) this.closeStatsModal();
      });
    }
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
   * Закрывает модальное окно статистики игры.
   */
  private closeStatsModal(): void {
    if (!this.statsModal) return;
    this.statsModal.classList.remove(this.modalActiveClass);
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
    const stats = this.statisticsService.stats;
    
    for (const [key, value] of Object.entries(stats)) {
      const statItem = document.createElement('div');
      statItem.className = 'user-stats-modal__stat-item';
      
      const statName = document.createElement('span');
      statName.textContent = key;
      
      const statValue = document.createElement('span');
      statValue.textContent = String(value);
      
      statItem.appendChild(statName);
      statItem.appendChild(statValue);
      this.statsModalBody.appendChild(statItem);
    }
  }
}
