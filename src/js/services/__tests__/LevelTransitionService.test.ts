import Demon from '../../Entities/Enemies/Demon';
import Undead from '../../Entities/Enemies/Undead';
import Vampire from '../../Entities/Enemies/Vampire';
import Bowman from '../../Entities/Heroes/Bowman';
import Swordsman from '../../Entities/Heroes/Swordsman';
import GamePlay from '../../Game/GamePlay';
import GameState from '../../Game/GameState';
import PositionedCharacter from '../../Game/PositionedCharacter';
import TeamPositioner from '../../Game/TeamPositioner';
import { Theme } from '../../types/enums';
import { CharacterLevel } from '../../types/types';
import * as utils from '../../utils/utils';
import LevelTransitionService from '../LevelTransitionService';

jest.mock('../../Game/TeamPositioner');
jest.mock('../../utils/utils');

describe('Класс LevelTransitionService', () => {
  let positionedCharacters: PositionedCharacter[];
  let gamePlay: GamePlay;
  let gameState: GameState;
  let service: LevelTransitionService;

  beforeEach(() => {
    positionedCharacters = [
      new PositionedCharacter(new Bowman(), 0),
      new PositionedCharacter(new Swordsman(), 1),
      new PositionedCharacter(new Undead(), 6),
    ];

    gamePlay = {
      drawUi: jest.fn(),
      redrawPositions: jest.fn(),
    } as unknown as GamePlay;

    gameState = {
      isPlayerTurn: false,
    } as GameState;

    // Мокаем методы позиционирования команды
    (TeamPositioner.repositionExistingTeam as jest.Mock).mockImplementation((team) => team);
    (TeamPositioner.generateAndPositionOpponentTeam as jest.Mock).mockReturnValue([
      new PositionedCharacter(new Demon(), 6),
      new PositionedCharacter(new Vampire(), 7),
    ]);
    (TeamPositioner.boardSize as unknown) = 8;
    (TeamPositioner.opponentColumns as unknown) = [6, 7];

    // Мокаем функции utils
    (utils.isPlayerCharacter as jest.Mock).mockImplementation((pc: PositionedCharacter) => {
      return ['bowman', 'swordsman'].includes(pc.character.type);
    });
    (utils.getRandomMultiplier as jest.Mock).mockImplementation(() => 1.1);

    // Мокаем localStorage
    const localStorageMock = (() => {
      let store: Record<string, string> = {};
      return {
        getItem: jest.fn((key: string) => store[key] || null),
        setItem: jest.fn((key: string, value: string) => {
          store[key] = value;
        }),
        clear: jest.fn(() => {
          store = {};
        }),
      };
    })();
    Object.defineProperty(global, 'localStorage', { value: localStorageMock });

    service = new LevelTransitionService(positionedCharacters, Theme.Prairie, gamePlay, gameState);
  });

  describe('Метод startNewLevel()', () => {
    it('должен изменить положение команды игрока, создать команду противника, повысить уровень персонажей ИИ, \
обновить положение персонажей, перерисовать пользовательский интерфейс и сбросить состояние игры', () => {
      service.startNewLevel();

      // Команда игроков должна изменить положение
      expect(TeamPositioner.repositionExistingTeam).toHaveBeenCalled();

      // Новая команда противников должна быть создана
      expect(TeamPositioner.generateAndPositionOpponentTeam).toHaveBeenCalled();

      // Уровень персонажей ИИ должен быть повышен
      expect(service['positionedCharacters'].length).toBeGreaterThan(0);

      // Методы класса gamePlay должны быть вызваны
      expect(gamePlay.drawUi).toHaveBeenCalledWith(Theme.Prairie);
      expect(gamePlay.redrawPositions).toHaveBeenCalledWith(service['positionedCharacters']);

      // gameState должен быть сброшен
      expect(gameState.isPlayerTurn).toBe(true);
    });

    it('столбец не входит в список opponentColumns; должен исправить позицию противника', () => {
      // Мокаем функции generateAndPositionOpponentTeam для возврата PositionedCharacter 
      // с недопустимым столбцом (например, столбцом 5)
      const invalidPosition = 5; // столбца 5 нет в opponentColumns [6,7]
      const row = 1; // произвольная строка
      const position = row * (TeamPositioner.boardSize as number) + invalidPosition;

      const character = new Demon();
      const invalidOpponent = new PositionedCharacter(character, position);

      (TeamPositioner.generateAndPositionOpponentTeam as jest.Mock).mockReturnValue([invalidOpponent]);

      service.startNewLevel();

      const updatedOpponents = service['positionedCharacters'].filter(pc => !utils.isPlayerCharacter(pc));
      expect(updatedOpponents.length).toBe(1);

      const correctedPosition = row * (TeamPositioner.boardSize as number) 
        + (TeamPositioner.opponentColumns as number[])[0];

      expect(updatedOpponents[0].position).toBe(correctedPosition);
      expect(updatedOpponents[0].character).toBe(character);
    });
  });

  describe('Метод advanceToNextTheme()', () => {
    const themeNames: Record<Theme, string> = {
      [Theme.Prairie]: 'Прерии',
      [Theme.Desert]: 'Пустыни',
      [Theme.Arctic]: 'Арктики',
      [Theme.Mountain]: 'Горы'
    };

    const testCases = [
      { from: Theme.Prairie, to: Theme.Desert },
      { from: Theme.Desert, to: Theme.Arctic },
      { from: Theme.Arctic, to: Theme.Mountain },
      { from: Theme.Mountain, to: Theme.Prairie }
    ];

    testCases.forEach(({ from, to }) => {
      it(`должен сменить тему с ${themeNames[from]} на ${themeNames[to]}`, () => {
        service['currentTheme'] = from;
        service.advanceToNextTheme();

        expect(service['currentTheme']).toBe(to);
      });
    });
  });

  describe('Метод levelUpPlayerCharacters()', () => {
    it('должны повышать уровень только игровые персонажи', () => {
      const levelUpCharacterSpy = jest.spyOn(service, 'levelUpCharacter');
      service.levelUpPlayerCharacters();

      // Должен вызывать levelUpCharacter только для игровых персонажей (лучника, мечника)
      expect(levelUpCharacterSpy).toHaveBeenCalledTimes(2);
      expect(levelUpCharacterSpy).toHaveBeenCalledWith(positionedCharacters[0].character);
      expect(levelUpCharacterSpy).toHaveBeenCalledWith(positionedCharacters[1].character);
    });
  });

  describe('Метод levelUpAICharacters()', () => {
    it('должен повысить уровень ИИ-персонажей и обновить localStorage', () => {
      const aiCharacters = [
        new PositionedCharacter(new Demon(), 6),
        new PositionedCharacter(new Vampire(), 7),
      ];

      // Шпионим за приватными методами с помощью приведения к любому типу
      const levelUpAICharacterSpy = jest.spyOn(service as any, 'levelUpAICharacter');
      const updateAICharacterStatsSpy = jest.spyOn(service as any, 'updateAICharacterStats');

      service.levelUpAICharacters(aiCharacters);

      expect(levelUpAICharacterSpy).toHaveBeenCalledTimes(aiCharacters.length);
      expect(updateAICharacterStatsSpy).toHaveBeenCalled();

      // localStorage должен быть обновлен
      expect(localStorage.setItem).toHaveBeenCalled();
    });

    it('свойства персонажа есть в localStorage; должен установить свойства персонажа из savedStats', () => {
      const savedStats = {
        demon: {
          level: 5,
          attack: 50,
          defense: 40,
        },
      };

      // Мокаем localStorage.getItem, чтобы вернуть строку JSON с сохранёнными статистическими данными
      (localStorage.getItem as jest.Mock).mockReturnValue(JSON.stringify(savedStats));

      const demonCharacter = new Demon();
      demonCharacter.level = 1;
      demonCharacter.attack = 10;
      demonCharacter.defense = 10;

      const positionedDemon = new PositionedCharacter(demonCharacter, 6);

      service.levelUpAICharacters([positionedDemon]);

      expect(demonCharacter.level).toBe(savedStats.demon.level + 1); // Уровень увелич. на 1 после сохранения статистики
      expect(demonCharacter.attack).toBeGreaterThanOrEqual(savedStats.demon.attack);
      expect(demonCharacter.defense).toBeGreaterThanOrEqual(savedStats.demon.defense);
    });

    it('localStorage.getItem выдаёт ошибку при loadAICharacterStats; должен возвращать null', () => {
      // Мокаем localStorage.getItem для выдачи ошибки
      (localStorage.getItem as jest.Mock).mockImplementation(() => {
        throw new Error('Test error');
      });

      const result = (service as any).loadAICharacterStats();

      expect(result).toBeNull();
    });

    it('возникает исключение при использовании localStorage.setItem в updateAICharacterStats; \
должен перехватывать и обрабатывать исключение', () => {
      const aiCharacters = [new PositionedCharacter(new Demon(), 6)];

      (localStorage.setItem as jest.Mock).mockImplementation(() => {
        throw new Error('Test error in setItem');
      });

      expect(() => {
        service.levelUpAICharacters(aiCharacters);
      }).not.toThrow();

      (localStorage.setItem as jest.Mock).mockRestore();
    });
  });

  describe('Метод loadAICharacterStats()', () => {
    it('при парсинге JSON не является объектом; должен возвращать null', () => {
      (localStorage.getItem as jest.Mock).mockReturnValue(JSON.stringify('not an object'));

      const result = (service as any).loadAICharacterStats();

      expect(result).toBeNull();
    });

    it('при парсинге JSON равен null; должен возвращать null', () => {
      (localStorage.getItem as jest.Mock).mockReturnValue('null');

      const result = (service as any).loadAICharacterStats();

      expect(result).toBeNull();
    });
  });

  describe('Метод levelUpAICharacter()', () => {
    it('уровень персонажа равен 7; должен увеличить только уровень персонажа', () => {
      const character = new Demon();
      character.level = 7 as CharacterLevel;
      character.attack = 10;
      character.defense = 10;

      const aiCharacterStats: Record<string, any> = {};

      (service as any).levelUpAICharacter(character, aiCharacterStats);

      // Ожидается, что уровень персонажа увеличился на 1
      expect(character.level).toBe(8);

      // Ожидается, что атака и защита персонажа останутся прежними
      expect(character.attack).toBe(10);
      expect(character.defense).toBe(10);
    });
  });

  describe('Метод levelUpCharacter()', () => {
    it('персонаж с уровнем 2 и здоровьем 50; должен повысить уровень, здоровье, силу атаки и защиту', () => {
      const character = new Bowman();
      character.health = 50;

      service.levelUpCharacter(character);

      expect(character.level).toBe(2);
      expect(character.health).toBeGreaterThan(50);
      expect(character.attack).toBeGreaterThanOrEqual(0);
      expect(character.defense).toBeGreaterThanOrEqual(0);
    });

    it('уровень у персонажа 6 и здоровье 50; должен повысить только уровень персонажа', () => {
      const character = new Bowman();
      character.health = 50;
      character.level = 6 as CharacterLevel;

      const oldAttack = character.attack;
      const oldDefense = character.defense;

      service.levelUpCharacter(character);

      // Ожидается, что уровень персонажа увеличился на 1
      expect(character.level).toBe(7);

      // Ожидается, что атака и защита персонажа останутся прежними
      expect(character.attack).toBe(oldAttack);
      expect(character.defense).toBe(oldDefense);
    });

    it('здоровье персонажа равно 0; не должен менять характеристики', () => {
      const character = new Bowman();
      character.health = 0;

      const oldLevel = character.level;
      const oldAttack = character.attack;
      const oldDefense = character.defense;

      service.levelUpCharacter(character);

      // Ожидается, что характеристики персонажа останутся прежними
      expect(character.level).toBe(oldLevel);
      expect(character.attack).toBe(oldAttack);
      expect(character.defense).toBe(oldDefense);
    });
  });
});
