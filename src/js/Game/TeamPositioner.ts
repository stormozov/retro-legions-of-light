import enemyTypes from '../Entities/Enemies';
import heroTypes from '../Entities/Heroes';
import Team from '../Entities/Team';
import { generateTeam } from '../generators/generators';
import PositionedCharacter from './PositionedCharacter';

/**
* Класс для генерации и позиционирования команд для последующей отрисовки на доске.
*/
export default class TeamPositioner {

  /**
   * Генерирует и отрисовывает команды.
   *
   * @returns {PositionedCharacter[]} Массив позиционированных персонажей.
   */
  static generateAndPositionTeams(): PositionedCharacter[] {
    // Подготавливаем параметры
    const boardSize = 8;
    const playerColumns = [5];
    const opponentColumns = [6, 7];
    const maxLevel = 4;
    const playerCharacterCount = 2;
    const opponentCharacterCount = 2;

    // Создаем команду героев и команду врагов
    const playerTeam = generateTeam(heroTypes, maxLevel, playerCharacterCount);
    const opponentTeam = generateTeam(enemyTypes, maxLevel, opponentCharacterCount);

    // Получаем случайные позиции для каждого персонажа
    const playerPositions = TeamPositioner.getRandomPositions(playerColumns, playerCharacterCount, boardSize);
    const opponentPositions = TeamPositioner.getRandomPositions(opponentColumns, opponentCharacterCount, boardSize);

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
} 
