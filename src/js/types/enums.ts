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
 * import { Theme } from './themes';
 * const currentTheme = Theme.prairie;
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
