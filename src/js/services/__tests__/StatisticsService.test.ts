import StatisticsService from '../StatisticsService';
import { UserStatistic } from '../../types/types';

describe('Класс StatisticsService', () => {
  let mockLoad: jest.Mock;
  let mockSave: jest.Mock;
  let gameStateServiceMock: { load: jest.Mock; save: jest.Mock };
  let statisticsService: StatisticsService;
  let confirmSpy: jest.SpyInstance;

  const initialStats: UserStatistic = {
    playerDefeats: 1,
    enemiesKilled: 2,
    totalLevelsCompleted: 3,
    maxLevelReached: 4,
    saveUsageCount: 5,
    loadUsageCount: 6,
  };

  const mockGameState = {
    statistics: { ...initialStats },
  };

  beforeEach(() => {
    mockLoad = jest.fn().mockReturnValue(mockGameState);
    mockSave = jest.fn();

    gameStateServiceMock = {
      load: mockLoad,
      save: mockSave,
    };

    statisticsService = new StatisticsService(gameStateServiceMock as any);

    confirmSpy = jest.spyOn(global, 'confirm');
  });

  afterEach(() => {
    jest.clearAllMocks();
    confirmSpy.mockRestore();
  });

  it('должен загрузить исходные статистические данные из GameStateService', () => {
    expect(mockLoad).toHaveBeenCalled();
    expect(statisticsService.stats).toEqual(initialStats);
  });

  describe('Метод incrementPlayerDefeats()', () => {
    it('должен увеличивать количество поражений игрока и сохранять статистику', () => {
      const prev = statisticsService.stats.playerDefeats;
      statisticsService.incrementPlayerDefeats();

      expect(statisticsService.stats.playerDefeats).toBe(prev + 1);
      expect(mockSave).toHaveBeenCalledWith(mockGameState);
    });
  });

  describe('Метод incrementEnemiesKilled()', () => {
    it('должен увеличить количество убитых врагов и сохранить статистику', () => {
      const prev = statisticsService.stats.enemiesKilled;
      statisticsService.incrementEnemiesKilled();

      expect(statisticsService.stats.enemiesKilled).toBe(prev + 1);
      expect(mockSave).toHaveBeenCalledWith(mockGameState);
    });
  });

  describe('Метод incrementTotalLevelsCompleted()', () => {
    it('должен увеличить общее количество пройденных уровней и сохранить статистику', () => {
      const prev = statisticsService.stats.totalLevelsCompleted;
      statisticsService.incrementTotalLevelsCompleted();

      expect(statisticsService.stats.totalLevelsCompleted).toBe(prev + 1);
      expect(mockSave).toHaveBeenCalledWith(mockGameState);
    });
  });

  describe('Метод updateMaxLevelReached()', () => {
    it('новый уровень выше текущего; должен обновить максимально достигнутый уровень и сохранить изменения', () => {
      const newLevel = statisticsService.stats.maxLevelReached + 1;
      statisticsService.updateMaxLevelReached(newLevel);

      expect(statisticsService.stats.maxLevelReached).toBe(newLevel);
      expect(mockSave).toHaveBeenCalledWith(mockGameState);
    });

    it('новый уровень ниже или равен предыдущему; не должен обновить максимально достигнутый уровень', () => {
      const newLevel = statisticsService.stats.maxLevelReached;
      statisticsService.updateMaxLevelReached(newLevel);

      expect(statisticsService.stats.maxLevelReached).toBe(newLevel);
      expect(mockSave).not.toHaveBeenCalled();
    });
  });

  describe('Метод incrementSaveUsage()', () => {
    it('должен увеличить значение "saveUsageCount" и сохранить статистику', () => {
      const prev = statisticsService.stats.saveUsageCount;
      statisticsService.incrementSaveUsage();

      expect(statisticsService.stats.saveUsageCount).toBe(prev + 1);
      expect(mockSave).toHaveBeenCalledWith(mockGameState);
    });
  });

  describe('Метод incrementLoadUsage()', () => {
    it('должен увеличить значение "loadUsageCount" и сохранить статистику', () => {
      const prev = statisticsService.stats.loadUsageCount;
      statisticsService.incrementLoadUsage();

      expect(statisticsService.stats.loadUsageCount).toBe(prev + 1);
      expect(mockSave).toHaveBeenCalledWith(mockGameState);
    });
  });

  describe('Метод clearStatistics()', () => {
    it('пользователь подтверждает очистку статистики; должен очистить статистику и сохранить', () => {
      confirmSpy.mockReturnValue(true);
      statisticsService.clearStatistics();

      expect(statisticsService.stats).toEqual({
        playerDefeats: 0,
        enemiesKilled: 0,
        totalLevelsCompleted: 0,
        maxLevelReached: 0,
        saveUsageCount: 0,
        loadUsageCount: 0
      });
      expect(mockSave).toHaveBeenCalledWith(mockGameState);
    });

    it('пользователь отменяет действие; не должен очищать статистику или сохранять данные', () => {
      confirmSpy.mockReturnValue(false);
      const beforeStats = { ...statisticsService.stats };
      statisticsService.clearStatistics();

      expect(statisticsService.stats).toEqual(beforeStats);
      expect(mockSave).not.toHaveBeenCalled();
    });
  });

  describe('Метод hasSavedStatistics()', () => {
    it('любая статистика не равна нулю; должен вернуть true', () => {
      expect(statisticsService.hasSavedStatistics()).toBe(false);
    });

    it('все статистики равны нулю; должен вернуть false', () => {
      confirmSpy.mockReturnValue(true);
      statisticsService.clearStatistics();

      expect(statisticsService.hasSavedStatistics()).toBe(false);
    });
  });
});
