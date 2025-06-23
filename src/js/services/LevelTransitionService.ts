import Character from '../Entities/Character';
import GamePlay from '../Game/GamePlay';
import GameState from '../Game/GameState';
import PositionedCharacter from '../Game/PositionedCharacter';
import TeamPositioner from '../Game/TeamPositioner';
import { Theme } from '../types/enums';
import { ILevelTransitionService } from '../types/interfaces';
import { getRandomMultiplier, isPlayerCharacter } from '../utils/utils';
import AbstractService from './AbstractService';

/**
 * Класс LevelTransitionService предоставляет методы для перехода к следующему уровню игры.
 */
export default class LevelTransitionService 
  extends AbstractService 
  implements ILevelTransitionService {

  private readonly localStorageKey = 'aiCharacterStats';
  
  constructor(
    positionedCharacters: PositionedCharacter[],
    currentTheme: Theme,
    gamePlay: GamePlay,
    gameState: GameState
  ) {
    super(positionedCharacters, currentTheme, gamePlay, gameState);
  }

  /**
   * Начинает новый уровень игры.
   * 
   * Создает новую команду противника и объединяет ее с текущей командой игрока.
   * Затем отрисовывает новую тему карты и обновляет позиции персонажей на карте.
   */
  startNewLevel(): void {
    // Сохраняем текущую команду игрока (оставшихся в живых персонажей)
    const currentPlayerTeam = this.positionedCharacters.filter(
      (pc) => isPlayerCharacter(pc) && pc.character.health > 0
    );

    // Позиционируем существующую команду игрока в колонках 0 и 1
    const repositionedPlayerTeam = TeamPositioner.repositionExistingTeam(
      currentPlayerTeam,
    );

    // Генерируем и позиционируем новую команду противника в колонках 6 и 7
    const newOpponentTeam = TeamPositioner.generateAndPositionOpponentTeam();

    this.levelUpAICharacters(newOpponentTeam);

    // Проверяем позиции противника, чтобы убедиться, что он был в пределах 6 и 7 столбцов
    const validOpponentTeam = newOpponentTeam.map((pc) => {
      const col = pc.position % TeamPositioner.boardSize;

      if (!TeamPositioner.opponentColumns.includes(col)) {
        // Корректируем положение, сдвинув столбец на 6 (или 7) позиций
        const row = Math.floor(pc.position / TeamPositioner.boardSize);
        const correctedPosition = row * TeamPositioner.boardSize + TeamPositioner.opponentColumns[0];
        
        return new PositionedCharacter(pc.character, correctedPosition);
      }

      return pc;
    });

    // Объединяем обе команды
    this.positionedCharacters.splice(
      0, 
      this.positionedCharacters.length, 
      ...repositionedPlayerTeam, 
      ...validOpponentTeam
    );

    // Обновляем UI
    this.gamePlay!.drawUi(this.currentTheme!);
    this.gamePlay!.redrawPositions(this.positionedCharacters);

    // Сбрасываем состояние игры
    this.gameState!.isPlayerTurn = true;
  }

  /**
   * Переходит к следующей теме карты.
   */
  advanceToNextTheme(): void {
    switch (this.currentTheme) {
      case Theme.Prairie:
        this.currentTheme = Theme.Desert;
        break;
      case Theme.Desert:
        this.currentTheme = Theme.Arctic;
        break;
      case Theme.Arctic:
        this.currentTheme = Theme.Mountain;
        break;
      case Theme.Mountain:
      default:
        this.currentTheme = Theme.Prairie;
        break;
    }
  }

  /**
   * Увеличивает уровень персонажей игрока.
   */
  levelUpPlayerCharacters(): void {
    for (const pc of this.positionedCharacters) {
      if (isPlayerCharacter(pc)) {
        this.levelUpCharacter(pc.character);
      }
    }
  }

  /**
   * Увеличивает уровень персонажей компьютера.
   * 
   * @param {PositionedCharacter[]} characters - Массив персонажей компьютера.
   */
  levelUpAICharacters(characters: PositionedCharacter[]): void {
    // Загружаем данные из localStorage один раз
    let aiCharacterStats = this.loadAICharacterStats();

    // Если данные отсутствуют или некорректны, инициализируем пустой объект
    if (!aiCharacterStats || typeof aiCharacterStats !== 'object') {
      aiCharacterStats = {};
    }

    // Обновляем характеристики каждого персонажа
    for (const pc of characters) {
      this.levelUpAICharacter(pc.character, aiCharacterStats);
    }

    // Сохраняем обновленные данные в localStorage один раз
    this.updateAICharacterStats(aiCharacterStats);
  }

  /**
   * Увеличивает уровень указанного персонажа компьютера и обновляет его характеристики.
   * 
   * @param {Character} character - Персонаж, уровень которого нужно увеличить.
   * @param {Record<string, any>} aiCharacterStats - Объект с данными персонажей из localStorage.
   */
  private levelUpAICharacter(character: Character, aiCharacterStats: Record<string, any>): void {
    const typeKey = character.type.toLowerCase();

    // Загружаем текущие характеристики из aiCharacterStats, если есть
    const savedStats = aiCharacterStats[typeKey];

    if (savedStats) {
      character.level = savedStats.level;
      character.attack = savedStats.attack;
      character.defense = savedStats.defense;
    }

    // Увеличиваем уровень персонажа на 1
    character.level += 1;

    // Конфигурируем диапазоны множителей для атаки и защиты
    const attackMultiplier = getRandomMultiplier(1.7, 0.6);
    const defenseMultiplier = getRandomMultiplier(1.5, 0.4);

    // Обновляем характеристики с учетом множителей, гарантируя, что значения не уменьшатся
    character.attack = Math.round(Math.max(character.attack, character.attack * attackMultiplier));
    character.defense = Math.round(Math.max(character.defense, character.defense * defenseMultiplier));

    // Обновляем объект aiCharacterStats для сохранения
    aiCharacterStats[typeKey] = {
      level: character.level,
      attack: character.attack,
      defense: character.defense,
    };
  }

  /**
   * Загружает данные персонажей компьютера из localStorage.
   * Добавлена обработка ошибок и валидация.
   * 
   * @returns {Record<string, any> | null} Объект с данными персонажей или null.
   */
  private loadAICharacterStats(): Record<string, any> | null {
    try {
      const raw = localStorage.getItem(this.localStorageKey);
      if (!raw) return null;

      const parsed = JSON.parse(raw);
      if (typeof parsed !== 'object' || parsed === null) return null;

      return parsed;
    } catch (error) {
      return null;
    }
  }

  /**
   * Сохраняет данные персонажей компьютера в localStorage.
   * Добавлена обработка ошибок.
   * 
   * @param {Record<string, any>} aiCharacterStats - Объект с данными персонажей.
   */
  private updateAICharacterStats(aiCharacterStats: Record<string, any>): void {
    try {
      localStorage.setItem(this.localStorageKey, JSON.stringify(aiCharacterStats));
    } catch (error) {
      return;
    }
  }

  /**
   * Увеличивает уровень указанного персонажа игрока и обновляет его характеристики.
   * 
   * @param {Character} character - Персонаж, уровень которого нужно увеличить.
   */
  levelUpCharacter(character: Character): void {
    if (character.health > 0) {
      // Увеличиваем уровень персонажа на 1
      character.level += 1;

      const newHealth = Math.round(Math.min(character.health + 80, 100));

      // Устанавливаем здоровье на новое значение
      character.health = newHealth;

      // Вычисляем коэффициент увеличения характеристик на основе нового здоровья
      const coefficient = (80 + newHealth) / 100;

      // Обновляем атаку и защиту персонажа по формуле:
      // Math.max(attackBefore, attackBefore * (80 + life) / 100)
      character.attack = Math.round(Math.max(character.attack, character.attack * coefficient));
      character.defense = Math.round(Math.max(character.defense, character.defense * coefficient));
    }
  }
}
