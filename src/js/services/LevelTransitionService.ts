import Character from '../Entities/Character';
import GamePlay from '../Game/GamePlay';
import GameState from '../Game/GameState';
import PositionedCharacter from '../Game/PositionedCharacter';
import TeamPositioner from '../Game/TeamPositioner';
import { Theme } from '../types/enums';
import { ILevelTransitionService } from '../types/interfaces';
import { isPlayerCharacter } from '../utils/utils';

/**
 * Класс LevelTransitionService предоставляет методы для перехода к следующему уровню игры.
 */
export default class LevelTransitionService implements ILevelTransitionService {
  private positionedCharacters: PositionedCharacter[];
  private currentTheme: Theme;
  private gamePlay: GamePlay;
  private gameState: GameState;

  constructor(
    positionedCharacters: PositionedCharacter[],
    currentTheme: Theme,
    gamePlay: GamePlay,
    gameState: GameState
  ) {
    this.positionedCharacters = positionedCharacters;
    this.currentTheme = currentTheme;
    this.gamePlay = gamePlay;
    this.gameState = gameState;
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

    // Объединяем обе команды
    this.positionedCharacters.splice(
      0, 
      this.positionedCharacters.length, 
      ...repositionedPlayerTeam, 
      ...newOpponentTeam
    );

    // Обновляем UI
    this.gamePlay.drawUi(this.currentTheme);
    this.gamePlay.redrawPositions(this.positionedCharacters);

    // Сбрасываем состояние игры
    this.gameState.isPlayerTurn = true;
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
    for ( const pc of this.positionedCharacters ) {
      if ( isPlayerCharacter(pc) ) {
        this.levelUpCharacter(pc.character);
      }
    }
  }

  /**
   * Увеличивает уровень указанного персонажа и обновляет его характеристики.
   * @param {Character} character - Персонаж, уровень которого нужно увеличить.
   */
  levelUpCharacter(character: Character): void {
    if ( character.health > 0 ) {
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
   * Возвращает текущую тему карты.
   * @returns {Theme} Текущая тема карты.
   */
  getCurrentTheme(): Theme {
    return this.currentTheme;
  }

  /**
   * Устанавливает текущую тему карты.
   * @param {Theme} theme - Текущая тема карты.
   */
  setCurrentTheme(theme: Theme): void {
    this.currentTheme = theme;
  }

  /**
   * Возвращает расположение персонажей на карте.
   * @returns {PositionedCharacter[]} Массив позиционных персонажей.
   */
  getPositionedCharacters(): PositionedCharacter[] {
    return this.positionedCharacters;
  }

  /**
   * Устанавливает расположение персонажей на карте.
   * @param {PositionedCharacter[]} positionedCharacters Массив позиционных персонажей.
   */
  setPositionedCharacters(positionedCharacters: PositionedCharacter[]): void {
    this.positionedCharacters = positionedCharacters;
  }
}
