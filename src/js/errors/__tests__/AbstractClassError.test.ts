import { AbstractClassErrorType } from '../../types/types';
import AbstractClassError from '../AbstractClassError';

describe('Класс AbstractClassError', () => {
  const testCases: Array<[AbstractClassErrorType, string]> = [
    ['CONSTRUCTOR', 'Нельзя создавать экземпляр абстрактного класса напрямую.'],
    ['ABSTRACT', 'Класс является абстрактным.'],
    ['METHOD', 'Нельзя вызывать метод абстрактного класса напрямую.']
  ];

  test.each(testCases)('должен выбрасывать исключение с правильным сообщением \
для данного типа %s', (type, expectedMessage) => {
    const error = new AbstractClassError(type);

    expect(error.message).toBe(expectedMessage);
    expect(error.name).toBe('AbstractClassError');
    expect(error).toBeInstanceOf(Error);
  });

  it('должен быть экземпляром класса Error', () => {
    const error = new AbstractClassError('CONSTRUCTOR');
    expect(error).toBeInstanceOf(Error);
  });

  it('должен иметь правильное имя', () => {
    const error = new AbstractClassError('ABSTRACT');
    expect(error.name).toBe('AbstractClassError');
  });
});
