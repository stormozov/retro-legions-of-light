import enemyTypes from '../Entities/Enemies';
import heroTypes from '../Entities/Heroes';
import Team from '../Entities/Team';
import { generateTeam } from '../generators/generators';
import GamePlay from './GamePlay';
import PositionedCharacter from './PositionedCharacter';

/**
* Класс для генерации и позиционирования команд для последующей отрисовки на доске.
*/
export default class TeamPositioner {
  static boardSize = 8;
  static playerColumns = [0, 1];
  static opponentColumns = [6, 7];
  static maxLevel = 4;
  static playerCharacterCount = 2;
  static opponentCharacterCount = 2;

  /**
   * Генерирует и отрисовывает команды.
   *
   * @returns {PositionedCharacter[]} Массив позиционированных персонажей.
   */
  static generateAndPositionTeams(): PositionedCharacter[] {
    // Создаем команду героев и команду врагов
    let playerTeam: Team;
    let opponentTeam: Team;

    try {
      playerTeam = generateTeam(
        heroTypes,
        TeamPositioner.maxLevel,
        TeamPositioner.playerCharacterCount
      );
      opponentTeam = generateTeam(
        enemyTypes,
        TeamPositioner.maxLevel,
        TeamPositioner.opponentCharacterCount
      );
    } catch (e) {
      GamePlay.showMessage('Ошибка при генерации команд. Попробуйте начать новую игру.');
      return [];
    }

    // Получаем случайные позиции для каждого персонажа
    const playerPositions = TeamPositioner.getRandomPositions(
      TeamPositioner.playerColumns, 
      TeamPositioner.playerCharacterCount, 
      TeamPositioner.boardSize
    );
    const opponentPositions = TeamPositioner.getRandomPositions(
      TeamPositioner.opponentColumns, 
      TeamPositioner.opponentCharacterCount, 
      TeamPositioner.boardSize
    );

    // Создаем и возвращаем массив с позиционированными персонажами
    return TeamPositioner.createPositionedCharacterArrays(
      playerTeam,
      opponentTeam,
      playerPositions,
      opponentPositions
    );
  }

  /**
   * Создает массивы позиционированных персонажей.
   *
   * @param {Team} playerTeam - Команда игрока.
   * @param {Team} opponentTeam - Команда противника.
   * @param {number[]} playerPositions - Позиции игроков.
   * @param {number[]} opponentPositions - Позиции противников.
   *
   * @returns {PositionedCharacter[]} Массив позиционированных персонажей.
   */
  static createPositionedCharacterArrays(
    playerTeam: Team,
    opponentTeam: Team,
    playerPositions: number[],
    opponentPositions: number[]
  ): PositionedCharacter[] {
    const positionedCharacters: PositionedCharacter[] = [];

    playerTeam.members.forEach((character, index) => {
      positionedCharacters.push(new PositionedCharacter(character, playerPositions[index]));
    });

    opponentTeam.members.forEach((character, index) => {
      positionedCharacters.push(new PositionedCharacter(character, opponentPositions[index]));
    });

    return positionedCharacters;
  }

  /**
   * Генерирует случайные позиции на доске.
   *
   * @param {number[]} columns - Массив столбцов, из которых выбираются случайные позиции.
   * @param {number} count - Количество позиций, которые нужно сгенерировать.
   * @param {number} boardSize - Размер доски.
   *
   * @returns {number[]} Массив случайных позиций.
   */
  static getRandomPositions(columns: number[], count: number, boardSize: number): number[] {
    const positions: number[] = [];

    while ( positions.length < count ) {
      const row = Math.floor(Math.random() * boardSize);
      const col = columns[Math.floor(Math.random() * columns.length)];
      const pos = row * boardSize + col;

      if ( !positions.includes(pos) ) positions.push(pos);
    }

    return positions;
  }

  /**
   * Позиционирует существующую команду в указанных колонках.
   *
   * @param {PositionedCharacter[]} existingTeam - Существующая команда с персонажами.
   * @param {number[]} allowedColumns - Разрешённые столбцы для позиционирования.
   * @param {number} boardSize - Размер доски.
   *
   * @returns {PositionedCharacter[]} Массив позиционированных персонажей с новыми позициями.
   */
  static repositionExistingTeam(
    existingTeam: PositionedCharacter[],
    allowedColumns: number[] = TeamPositioner.playerColumns,
    boardSize: number = TeamPositioner.boardSize
  ): PositionedCharacter[] {
    const count = existingTeam.length;
    const newPositions = TeamPositioner.getRandomPositions(allowedColumns, count, boardSize);
    return existingTeam.map((pc, index) => {
      return new PositionedCharacter(pc.character, newPositions[index]);
    });
  }

  /**
   * Генерирует и позиционирует команду противника.
   *
   * @param {number} maxLevel - Максимальный уровень персонажей.
   * @param {number} count - Количество персонажей.
   * @param {number[]} allowedColumns - Разрешённые столбцы для позиционирования.
   * @param {number} boardSize - Размер доски.
   *
   * @returns {PositionedCharacter[]} Массив позиционированных персонажей противника.
   */
  static generateAndPositionOpponentTeam(
    maxLevel: number = TeamPositioner.maxLevel,
    count: number = TeamPositioner.opponentCharacterCount,
    allowedColumns: number[] = TeamPositioner.opponentColumns,
    boardSize: number = TeamPositioner.boardSize
  ): PositionedCharacter[] {
    const opponentTeam = generateTeam(enemyTypes, maxLevel, count);
    const opponentPositions = TeamPositioner.getRandomPositions(allowedColumns, count, boardSize);
    return opponentTeam.members.map((character, index) => {
      return new PositionedCharacter(character, opponentPositions[index]);
    });
  }
}
