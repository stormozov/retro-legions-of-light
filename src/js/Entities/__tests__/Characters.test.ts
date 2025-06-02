import AbstractClassError from '../../errors/AbstractClassError';
import { CharacterLevel, PossibleCharacterSetAttributes } from '../../types/types';
import Character from '../Character';
import Bowman from '../Heroes/Bowman';

describe('Модуль Characters', () => {
  describe('Класс Character', () => {
    describe('Конструктор', () => {
      it('создан объект класса; выбрасывает ошибку', () => {
        expect(() => new Character()).toThrow(new AbstractClassError('CONSTRUCTOR'));
      });
    })
  });

  describe('Класс Bowman', () => {
    let bowman: Bowman;

    beforeEach(() => {
      bowman = new Bowman();
    });

    describe('Конструктор', () => {
      it('создан объект класса; не выбрасывает ошибку', () => {
        expect(bowman).toBeInstanceOf(Character);
      });
    });

    describe('Метод setAttributes', () => {
      it('не переданы атрибуты attack и defense; устанавливает атрибуты по умолчанию', () => {
        bowman.setAttributes({});

        expect(bowman.attack).toBe(25);
        expect(bowman.defense).toBe(25);
      });

      it('переданы атрибуты attack и defense; устанавливает атрибуты', () => {
        bowman.setAttributes({ attack: 40, defense: 15 });

        expect(bowman.attack).toBe(40);
        expect(bowman.defense).toBe(15);
      });

      it('переданы все возможные атрибуты; устанавливает атрибуты', () => {
        const attributes: PossibleCharacterSetAttributes = {
          level: 2 as CharacterLevel,
          attack: 40,
          defense: 15,
          health: 100
        }

        bowman.setAttributes(attributes);

        expect(bowman.level).toBe(2);
        expect(bowman.attack).toBe(40);
        expect(bowman.defense).toBe(15);
        expect(bowman.health).toBe(100);
      });
    });
  });
});
