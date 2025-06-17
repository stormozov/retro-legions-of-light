import Character from '../Entities/Character';
import Demon from '../Entities/Enemies/Demon';
import Undead from '../Entities/Enemies/Undead';
import Vampire from '../Entities/Enemies/Vampire';
import Bowman from '../Entities/Heroes/Bowman';
import Magician from '../Entities/Heroes/Magician';
import Swordsman from '../Entities/Heroes/Swordsman';
import { CharacterType, Theme } from '../types/enums';
import { UserStatistic } from '../types/types';
import PositionedCharacter from './PositionedCharacter';

/**
 * Класс GameState представляет состояние игры.
 */
export default class GameState {
  isPlayerTurn: boolean;
  positionedCharacters: PositionedCharacter[];
  selectedCellIndex: number | null;
  currentTheme: Theme;
  gameOver: boolean;
  statistics: UserStatistic;

  constructor() {
    this.isPlayerTurn = true;
    this.positionedCharacters = [];
    this.selectedCellIndex = null;
    this.currentTheme = Theme.Prairie;
    this.gameOver = false;
    this.statistics = {
      playerDefeats: 0,
      enemiesKilled: 0,
      totalLevelsCompleted: 0,
      maxLevelReached: 0,
      saveUsageCount: 0,
      loadUsageCount: 0,
    };
  }

  /**
   * Создает объект GameState из переданного объекта.
   * 
   * @param {object} object - Объект, из которого создается GameState.
   * @returns {GameState} - Созданный объект GameState.
   * 
   * @static
   */
  static from(object: any): GameState {
    const state = new GameState();
    state.isPlayerTurn = object.isPlayerTurn;
    state.selectedCellIndex = object.selectedCellIndex;
    state.currentTheme = object.currentTheme;
    state.gameOver = object.gameOver;

    if ( Array.isArray(object.positionedCharacters) ) {
      state.positionedCharacters = object.positionedCharacters.map((pcObj: any) => {
        const character = GameState.createCharacterFromObject(pcObj.character);
        return new PositionedCharacter(character, pcObj.position);
      });
    } else {
      state.positionedCharacters = [];
    }

    if (object.statistics) {
      state.statistics = {
        playerDefeats: object.statistics.playerDefeats ?? 0,
        enemiesKilled: object.statistics.enemiesKilled ?? 0,
        totalLevelsCompleted: object.statistics.totalLevelsCompleted ?? 0,
        maxLevelReached: object.statistics.maxLevelReached ?? 0,
        saveUsageCount: object.statistics.saveUsageCount ?? 0,
        loadUsageCount: object.statistics.loadUsageCount ?? 0,
      };
    }

    return state;
  }

  /**
   * Преобразует экземпляр GameState в простой объект для сериализации.
   * 
   * @returns {object} - Простой объект, пригодный для JSON.stringify.
   */
  toObject(): object {
    return {
      isPlayerTurn: this.isPlayerTurn,
      positionedCharacters: this.positionedCharacters.map(pc => ({
        character: {
          level: pc.character.level,
          type: pc.character.type,
          attack: pc.character.attack,
          defense: pc.character.defense,
          health: pc.character.health,
        },
        position: pc.position,
      })),
      currentTheme: this.currentTheme,
      gameOver: this.gameOver,
      statistics: this.statistics,
    };
  }

  /**
   * Создает экземпляр Character соответствующего подкласса из простого объекта.
   * 
   * @param {object} obj - Объект с данными персонажа.
   * @returns {Character} - Экземпляр Character.
   * 
   * @static
   */
  static createCharacterFromObject(obj: any): Character {
    const CharacterClass = this.getCharacterClassByType(obj.type);
    const character = new CharacterClass();

    character.level = obj.level;
    character.attack = obj.attack;
    character.defense = obj.defense;
    character.health = obj.health;

    return character;
  }

  /**
   * Возвращает класс персонажа по его типу.
   * 
   * @param {string | CharacterType} type - Тип персонажа.
   * @returns {typeof Character} - Класс персонажа.
   * 
   * @static
   */
  private static getCharacterClassByType(type: string | CharacterType): typeof Character {
    switch (type) {
      case CharacterType.Swordsman:
        return Swordsman;
      case CharacterType.Bowman:
        return Bowman;
      case CharacterType.Magician:
        return Magician;
      case CharacterType.Demon:
        return Demon;
      case CharacterType.Undead:
        return Undead;
      case CharacterType.Vampire:
        return Vampire;
      default:
        return Swordsman;
    }
  }
}
