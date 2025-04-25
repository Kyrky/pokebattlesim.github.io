/**
 * @typedef {Object} PokemonBase
 * @property {number} id - Идентификатор покемона
 * @property {string} name - Имя покемона
 * @property {string[]} types - Типы покемона
 * @property {Object.<string, number>} stats - Базовые статы покемона
 */

/**
 * @typedef {Object} PokemonInstance
 * @property {number} id - Идентификатор покемона
 * @property {string} name - Имя покемона
 * @property {string[]} types - Типы покемона
 * @property {Object.<string, number>} stats - Базовые статы покемона
 * @property {number} level - Уровень покемона
 * @property {Object.<string, number>} iv - Individual Values покемона
 * @property {Object.<string, number>} ev - Effort Values покемона
 * @property {string} nature - Природа покемона
 * @property {string} ability - Способность покемона
 * @property {string} item - Предмет покемона
 * @property {MoveInstance[]} moves - Ходы покемона
 * @property {number} currentHp - Текущее здоровье
 */

/**
 * @typedef {Object} MoveInstance
 * @property {string} name - Название хода
 * @property {number} power - Сила хода
 * @property {number} accuracy - Точность хода
 * @property {number} priority - Приоритет хода
 * @property {number} pp - Очки силы хода
 * @property {string} type - Тип хода
 * @property {string} category - Категория хода (Physical, Special, Status)
 */

/**
 * @typedef {Object} BattleEvent
 * @property {number} turn - Номер хода
 * @property {number} actor - Индекс игрока (1 или 2)
 * @property {string} move - Название использованного хода
 * @property {number} damage - Нанесенный урон
 * @property {boolean} isCrit - Был ли критический удар
 * @property {string[]} [statusChanges] - Изменения статуса (опционально)
 */ 