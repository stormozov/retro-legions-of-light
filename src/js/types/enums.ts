/**
 * Перечисление возможных тем оформления, основанных на природных ландшафтах.
 * 
 * Каждая тема представляет собой уникальный визуальный стиль, вдохновленный
 * определенным природным биотопом.
 *
 * Доступные темы:
 * @property {string} prairie: Тема, основанная на степном/прерийном ландшафте
 * @property {string} desert: Тема, основанная на пустынном ландшафте
 * @property {string} arctic: Тема, основанная на арктическом/полярном ландшафте
 * @property {string} mountain: Тема, основанная на горном ландшафте
 *
 * @example
 * ```typescript
 * import { Theme } from './types/enums';
 * const currentTheme = Theme.Prairie;
 * ```
 *
 * @enum {string}
 */
export enum Theme {
  Prairie = 'prairie',
  Desert = 'desert',
  Arctic = 'arctic',
  Mountain = 'mountain',
}

/**
 * Перечисление возможных типов персонажей.
 *
 * @enum {string}
 */
export enum CharacterType {
  Swordsman = 'swordsman',
  Bowman = 'bowman',
  Magician = 'magician',
  Demon = 'demon',
  Undead = 'undead',
  Vampire = 'vampire',
}

/**
 * Перечисления возможных курсоров.
 * 
 * @enum {string}
 */
export enum Cursor {
  Auto = 'auto',
  Pointer = 'pointer',
  Crosshair = 'crosshair',
  NotAllowed = 'not-allowed',
}
