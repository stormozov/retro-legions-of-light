import { AbstractClassErrorType } from '../types/types';

/**
 * Специальный тип ошибки, который выбрасывается при попытке создания экземпляра
 * абстрактного класса или вызова его абстрактных методов.
 * 
 * Эта ошибка позволяет идентифицировать ситуации, когда код пытается использовать 
 * абстрактный класс как обычный, что является нарушением объектно-ориентированного
 * программирования.
 * 
 * @param {AbstractClassErrorType} type - Тип ошибки.
 * 
 * @example
 * ```typescript
 * import { AbstractClassError } from './AbstractClassError';
 * import { AbstractClass } from './AbstractClass';
 *
 * try {
 *   const instance = new AbstractClass();
 * } catch (error) {
 *   if (error instanceof AbstractClassError) {
 *     // Обработка ошибки
 *   }
 * }
 * ```
 * 
 * @class
 * @extends Error
 */
export default class AbstractClassError extends Error {

  /**
   * Сообщения для каждого типа ошибки.
   */
  static readonly MESSAGES = {
    CONSTRUCTOR: 'Нельзя создавать экземпляр абстрактного класса напрямую.',
    ABSTRACT: 'Класс является абстрактным.',
    METHOD: 'Нельзя вызывать метод абстрактного класса напрямую.'
  };

  constructor(type: AbstractClassErrorType) {
    super(AbstractClassError.MESSAGES[type]);
    this.name = 'AbstractClassError';
  }
}
