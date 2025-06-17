import { UserStatistic } from '../types/types';

/**
 * Сервис для хранения и управления статистикой игры.
 */
export default class StatisticsService {
  private playerDefeats: number;
  private enemiesKilled: number;
  private totalLevelsCompleted: number;
  private maxLevelReached: number;
  private saveUsageCount: number;
  private loadUsageCount: number;

  constructor() {
    this.playerDefeats = 0;
    this.enemiesKilled = 0;
    this.totalLevelsCompleted = 0;
    this.maxLevelReached = 0;
    this.saveUsageCount = 0;
    this.loadUsageCount = 0;
  }

  /**
   * Увеличивает количество поражений игрока.
   */
  incrementPlayerDefeats(): void {
    this.playerDefeats += 1;
  }

  /**
   * Увеличивает количество убитых врагов.
   */
  incrementEnemiesKilled(): void {
    this.enemiesKilled += 1;
  }

  /**
   * Увеличивает количество завершенных уровней за все время игры.
   */
  incrementTotalLevelsCompleted(): void {
    this.totalLevelsCompleted += 1;
  }

  /**
   * Обновляет максимально достигнутый уровень.
   */
  updateMaxLevelReached(level: number): void {
    if (level > this.maxLevelReached) {
      this.maxLevelReached = level;
    }
  }

  /**
   * Увеличивает количество использований кнопки сохранения.
   */
  incrementSaveUsage(): void {
    this.saveUsageCount += 1;
  }

  /**
   * Увеличивает количество использований кнопки загрузки.
   */
  incrementLoadUsage(): void {
    this.loadUsageCount += 1;
  }

  /**
   * Возвращает статистику игры.
   * 
   * @returns {UserStatistic} - Объект, содержащий статистику игры.
   */
  getStats(): UserStatistic {
    return {
      playerDefeats: this.playerDefeats,
      enemiesKilled: this.enemiesKilled,
      totalLevelsCompleted: this.totalLevelsCompleted,
      maxLevelReached: this.maxLevelReached,
      saveUsageCount: this.saveUsageCount,
      loadUsageCount: this.loadUsageCount,
    };
  }
}
