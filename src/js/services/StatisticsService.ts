
import { UserStatistic } from '../types/types';
import GameStateService from './GameStateService';
import GameState from '../Game/GameState';

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

  private gameStateService: GameStateService;
  private gameState: GameState;

  /**
   * Создает экземпляр класса StatisticsService.
   * 
   * @param {GameStateService} gameStateService - Сервис для работы с состоянием игры.
   */
  constructor(gameStateService: GameStateService) {
    this.gameStateService = gameStateService;
    this.gameState = this.gameStateService.load();

    const stats = this.gameState.statistics;
    this.playerDefeats = stats.playerDefeats;
    this.enemiesKilled = stats.enemiesKilled;
    this.totalLevelsCompleted = stats.totalLevelsCompleted;
    this.maxLevelReached = stats.maxLevelReached;
    this.saveUsageCount = stats.saveUsageCount;
    this.loadUsageCount = stats.loadUsageCount;
  }

  /**
   * Возвращает статистику игры.
   * 
   * @returns {UserStatistic} - Объект, содержащий статистику игры.
   */
  get stats(): UserStatistic {
    return {
      playerDefeats: this.playerDefeats,
      enemiesKilled: this.enemiesKilled,
      totalLevelsCompleted: this.totalLevelsCompleted,
      maxLevelReached: this.maxLevelReached,
      saveUsageCount: this.saveUsageCount,
      loadUsageCount: this.loadUsageCount,
    };
  }

  /**
   * Сохраняет статистику игры в localStorage.
   * @private
   */
  private saveStatistics(): void {
    this.gameState.statistics = this.stats;
    this.gameStateService.save(this.gameState);
  }

  /**
   * Увеличивает количество поражений игрока.
   */
  incrementPlayerDefeats(): void {
    this.playerDefeats += 1;
    this.saveStatistics();
  }

  /**
   * Увеличивает количество убитых врагов.
   */
  incrementEnemiesKilled(): void {
    this.enemiesKilled += 1;
    this.saveStatistics();
  }

  /**
   * Увеличивает количество завершенных уровней за все время игры.
   */
  incrementTotalLevelsCompleted(): void {
    this.totalLevelsCompleted += 1;
    this.saveStatistics();
  }

  /**
   * Обновляет максимально достигнутый уровень.
   */
  updateMaxLevelReached(level: number): void {
    if (level > this.maxLevelReached) {
      this.maxLevelReached = level;
      this.saveStatistics();
    }
  }

  /**
   * Увеличивает количество использований кнопки сохранения.
   */
  incrementSaveUsage(): void {
    this.saveUsageCount += 1;
    this.saveStatistics();
  }

  /**
   * Увеличивает количество использований кнопки загрузки.
   */
  incrementLoadUsage(): void {
    this.loadUsageCount += 1;
    this.saveStatistics();
  }
}
