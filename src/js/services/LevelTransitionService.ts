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

  levelUpAICharacters(characters: PositionedCharacter[]): void {
    for (const pc of characters) this.levelUpAICharacter(pc.character);
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

  /**
   * Увеличивает уровень указанного персонажа компьютера и обновляет его характеристики.
   * 
   * @param {Character} character - Персонаж, уровень которого нужно увеличить.
   */
  levelUpAICharacter(character: Character): void {
    const localStorageKey = 'aiCharacterStats';

    // Загружаем уровень и характеристики персонажа из localStorage
    this.loadAICharacterStats(character, localStorageKey);

    // Изменяем характеристики персонажа
    character.level += 1;
    character.attack = Math.round(
      Math.max(character.attack, character.attack * getRandomMultiplier(1.7, 0.6))
    );
    character.defense = Math.round(
      Math.max(character.defense, character.defense * getRandomMultiplier(1.5, 0.4))
    );

    // Обновляем уровень и характеристики персонажа в localStorage
    this.updateAICharacterStats(character, localStorageKey);
  }

  /**
   * Загружает уровень и характеристики персонажа компьютера из localStorage.
   * 
   * @param {Character} character - Персонаж, уровень и характеристики которого нужно загрузить.
   * @param {string} localStorageKey - Ключ в localStorage, из которого нужно загрузить данные.
   */
  private loadAICharacterStats(character: Character, localStorageKey: string): void {
    const aiCharacterStatsRaw = localStorage.getItem(localStorageKey);
    if (aiCharacterStatsRaw) {
      const aiCharacterStats = JSON.parse(aiCharacterStatsRaw);
      const typeKey = character.type.toLowerCase();
      
      if (aiCharacterStats[typeKey]) {
        character.level = aiCharacterStats[typeKey].level;
        character.attack = aiCharacterStats[typeKey].attack;
        character.defense = aiCharacterStats[typeKey].defense;
      }
    }
  }

  /**
   * Обновляет уровень и характеристики персонажа компьютера в localStorage.
   * 
   * @param {Character} character - Персонаж, уровень и характеристики которого нужно обновить.
   * @param {string} localStorageKey - Ключ в localStorage, в котором нужно сохранить данные.
   */
  private updateAICharacterStats(character: Character, localStorageKey: string): void {
    const aiCharacterStatsRawAfter = localStorage.getItem(localStorageKey);
    if (aiCharacterStatsRawAfter) {
      const aiCharacterStatsAfter = JSON.parse(aiCharacterStatsRawAfter);
      const typeKey = character.type.toLowerCase();
      
      if (aiCharacterStatsAfter[typeKey]) {
        aiCharacterStatsAfter[typeKey].level = character.level;
        aiCharacterStatsAfter[typeKey].attack = character.attack;
        aiCharacterStatsAfter[typeKey].defense = character.defense;

        localStorage.setItem(localStorageKey, JSON.stringify(aiCharacterStatsAfter));
      }
    }
  }
}
