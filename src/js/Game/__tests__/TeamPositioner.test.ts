import enemyTypes from '../../Entities/Enemies';
import heroTypes from '../../Entities/Heroes';
import { generateTeam } from '../../generators/generators';
import { CharacterType } from '../../types/enums';
import GamePlay from '../GamePlay';
import PositionedCharacter from '../PositionedCharacter';
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

    describe('Ошибка генерации команд в методе generateAndPositionTeams()', () => {
      let showMessageMock: jest.SpyInstance;
      let generateTeamMock: jest.SpyInstance;
      const errorMessage = 'Ошибка при генерации команд. Попробуйте начать новую игру.';

      beforeEach(() => {
        showMessageMock = jest.spyOn(GamePlay, 'showMessage').mockImplementation(() => {});
        generateTeamMock = jest.spyOn(require('../../generators/generators'), 'generateTeam')
          .mockImplementation(() => { throw new Error('Test error'); });
      });

      afterEach(() => {
        generateTeamMock.mockRestore();
        showMessageMock.mockRestore();
      });

      it('Искусственно вызвана ошибка; должен показать сообщение об ошибке при генерации команд', () => {
        TeamPositioner.generateAndPositionTeams();

        expect(showMessageMock).toHaveBeenCalledTimes(1);
        expect(showMessageMock).toHaveBeenCalledWith(errorMessage);
      });
    });

    describe('Функция repositionExistingTeam()', () => {
      let team: PositionedCharacter[];

      beforeEach(() => {
        team = TeamPositioner.generateAndPositionTeams();
      });

      it('вызван метод; должен вернуть массив той же длины, что и входной', () => {
        const repositioned = TeamPositioner.repositionExistingTeam(team);
        expect(repositioned.length).toBe(team.length);
      });

      it('не указаны колонки; должен позиционировать персонажей в колонках по умолчанию', () => {
        const repositioned = TeamPositioner.repositionExistingTeam(team);
        repositioned.forEach((pc) => {
          const col = pc.position % TeamPositioner.boardSize;
          expect(TeamPositioner.playerColumns).toContain(col);
        });
      });

      it('указаны колонки [2, 3]; должен позиционировать персонажей в них', () => {
        const allowedColumns = [2, 3];
        const repositioned = TeamPositioner.repositionExistingTeam(team, allowedColumns);
        repositioned.forEach((pc) => {
          const col = pc.position % TeamPositioner.boardSize;
          expect(allowedColumns).toContain(col);
        });
      });

      it('передан пустой массив; должен вернуть пустой массив', () => {
        const repositioned = TeamPositioner.repositionExistingTeam([]);
        expect(repositioned).toEqual([]);
      });

      it('вызван метод; должен вернуть уникальные позиции', () => {
        const repositioned = TeamPositioner.repositionExistingTeam(team);
        const positions = repositioned.map((pc) => pc.position);
        const uniquePositions = new Set(positions);
        
        expect(positions.length).toBe(uniquePositions.size);
      });

      it('boardSize равен 10; должен успешно позиционировать персонажей', () => {
        const boardSize = 10;
        const repositioned = TeamPositioner.repositionExistingTeam(team, undefined, boardSize);
        repositioned.forEach((pc) => {
          expect(pc.position).toBeGreaterThanOrEqual(0);
          expect(pc.position).toBeLessThan(boardSize * boardSize);
        });
      });
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

  describe('Функция generateAndPositionOpponentTeam()', () => {
    it('вызван метод; должен вернуть массив позиционированных персонажей', () => {
      const opponentTeam = TeamPositioner.generateAndPositionOpponentTeam();

      expect(opponentTeam.length).toBeGreaterThan(0);
      opponentTeam.forEach((pc) => {
        expect(pc.position % TeamPositioner.boardSize).toBeGreaterThanOrEqual(6);
        expect(pc.position % TeamPositioner.boardSize).toBeLessThanOrEqual(7);
      });
    });
  });
});
