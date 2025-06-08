import enemyTypes from '../../Entities/Enemies';
import heroTypes from '../../Entities/Heroes';
import { generateTeam } from '../../generators/generators';
import { CharacterType } from '../../types/enums';
import TeamPositioner from '../TeamPositioner';

describe('Класс TeamPositioner', () => {
  describe('Функция generateAndPositionTeams()', () => {
    it('вызван метод; должен вернуть массив из 4 персонажей', () => {
      const positionedCharacters = TeamPositioner.generateAndPositionTeams();
      expect(positionedCharacters.length).toBe(4);
    });

    it('вызван метод; должен вернуть массив, содержащий персонажей из обоих команд', () => {
      const positionedCharacters = TeamPositioner.generateAndPositionTeams();
      let playerCount = 0;
      let opponentCount = 0;

      positionedCharacters.forEach((character) => {
        if (
          character.character.type === CharacterType.Swordsman 
          || character.character.type === CharacterType.Bowman 
          || character.character.type === CharacterType.Magician
        ) {
          playerCount++;
        } else if (
          character.character.type === CharacterType.Undead 
          || character.character.type === CharacterType.Demon 
          || character.character.type === CharacterType.Vampire
        ) {
          opponentCount++;
        }
      });

      expect(playerCount).toBe(2);
      expect(opponentCount).toBe(2);
    });
  });

  describe('Функция createPositionedCharacterArrays()', () => {
    it('вызван метод; должен вернуть массив позиционированных персонажей', () => {
      const playerTeam = generateTeam(heroTypes, 4, 2);
      const opponentTeam = generateTeam(enemyTypes, 4, 2);
      const playerPositions = [0, 1];
      const opponentPositions = [6, 7];

      const positionedCharacters = TeamPositioner.createPositionedCharacterArrays(
        playerTeam,
        opponentTeam,
        playerPositions,
        opponentPositions
      );

      expect(positionedCharacters.length).toBe(4);
      expect(positionedCharacters[0].position).toBe(0);
      expect(positionedCharacters[2].position).toBe(6);
    });
  });

  describe('Функция getRandomPositions()', () => {
    const columns = [0, 1];
    const boardSize = 8;

    it('columns - [0, 1], count - 3, boardSize - 8; должен вернуть уникальные позиции', () => {
      const count = 3;      

      const positions = TeamPositioner.getRandomPositions(columns, count, boardSize);
      const uniquePositions = new Set(positions);

      expect(positions.length).toBe(uniquePositions.size);
    });

    it('columns - [0, 1], count - 5, boardSize - 8; должен вернуть позиции в пределах доски', () => {
      const count = 5;

      const positions = TeamPositioner.getRandomPositions(columns, count, boardSize);
      positions.forEach((pos) => {
        expect(pos).toBeGreaterThanOrEqual(0);
        expect(pos).toBeLessThan(boardSize * boardSize);
      });
    });
  });
});
