import { METADATA } from './metadata.mjs';

/* -------------------------------------------- */
/*  Рендеринг                                  */

/* -------------------------------------------- */

/**
 * Добавляет дополнительные параметры импорта
 * @param {AdventureImporterV2} app  Приложение импорта
 * @param {HTMLElement} html         Элемент окна приложения импорта
 */
export function renderAdventureImporter(app, html) {
  if (app.adventure.pack !== METADATA.adventuresPackId) return;

  const controls = html.querySelector('.import-controls');

  if (!controls) return;

  const importOptions = game.settings.get(METADATA.moduleName, 'importOptions');

  controls.insertAdjacentHTML('beforeend', `<h2>${game.i18n.localize('AgWdh.IMPORT.Options')}</h2>`);
  controls.append(...formatOptions(importOptions));

  // Если приключение уже заимпорчено, то показываем список изменений
  const imported = !!game.settings.get('core', 'adventureImports')?.[METADATA.adventureUuid];
  if (imported) {
    const journal = app.adventure.journal.find(
      (j) => j._id === METADATA.changelogId,
    );
    const page = journal.pages.contents[journal.pages.contents.length - 1];
    new JournalEntry(journal).sheet.render(true, { pageId: page.id });
  }
}

/* -------------------------------------------- */

/**
 * Генерируем HTML для доп. параметров
 * @param {object} [importOptions]  Ранее заданные параметры, если есть
 * @returns {HTMLElement[]}
 */
function formatOptions(importOptions = {}) {
  return Object.entries(METADATA.importOptions).map(([name, config]) => {
    const initial = importOptions[name] ?? config.default;
    const field = new foundry.data.fields.BooleanField({ initial, label: config.label });
    const element = field.toFormGroup({ localize: true }, { name });
    const input = element.querySelector('input');
    const label = element.querySelector('label');
    label.classList.add('checkbox');
    label.insertAdjacentElement('afterbegin', input);
    element.querySelector('.form-fields').remove();
    return element;
  });
}

/* -------------------------------------------- */
/*  Параметры импорта                           */
/* -------------------------------------------- */

/**
 * Обработчики доп. параметров
 * @type {Record<string, Function>}
 */
const HANDLERS = { activateScene, displayJournal, customizeJoin };

/**
 * Выполнение задач после импорта
 * @param {Adventure} adventure  Документа приключения
 * @param {object} formData      Значение формы приключения, которую засабмитили
 */
export async function onImport(adventure, formData) {
  if (adventure.pack !== METADATA.adventuresPackId) return;
  const importOptions = {};
  for (const [name, config] of Object.entries(METADATA.importOptions)) {
    if (name in formData) importOptions[name] = formData[name];
    let { handler, lifecycle } = config;
    if (lifecycle !== 'post') continue;
    if (typeof handler === 'string') handler = HANDLERS[handler];
    if (typeof handler !== 'function') continue;
    if (formData[name]) await handler(adventure, config);
  }
  await game.settings.set(METADATA.moduleName, 'importOptions', importOptions);
  await initParty();
}

/* -------------------------------------------- */

/**
 * Выполнить задачи перед импортом
 * @param {Adventure} adventure                 Документ приключения
 * @param {object} importOptions                Параметры окна импорта
 * @param {Function[]} importOptions.preImport  Функция для регистрации других функций для выполнения перед импортом
 */
export function preImport(adventure, importOptions) {
  for (const [name, config] of Object.entries(METADATA.importOptions)) {
    let { handler, lifecycle } = config;

    if (lifecycle !== 'pre') continue;

    if (typeof handler === 'string') handler = HANDLERS[handler];

    if (typeof handler !== 'function') continue;

    if (importOptions[name]) {
      importOptions.preImport.push(handler);
      importOptions[METADATA.moduleName] ??= {};
      importOptions[METADATA.moduleName][name] = config;
    }
  }
}

/* -------------------------------------------- */

/**
 * Активировать начальную сцену
 * @param {Adventure} adventure        Приключение
 * @param {object} options             Параметры импорта
 * @param {string} options.documentId  ID сцены для активации
 * @returns {Promise<Scene>}
 */
export function activateScene(adventure, { documentId } = {}) {
  const scene = game.scenes.get(documentId);
  return scene?.activate();
}

/* -------------------------------------------- */

/**
 * Показать начальный журнал
 * @param {Adventure} adventure        Приключение
 * @param {object} options             Параметры импорта
 * @param {string} options.documentId  ID журнала для показа
 */
export function displayJournal(adventure, { documentId } = {}) {
  const journal = game.journal.get(documentId);
  journal?.sheet.render(true);
}

/* -------------------------------------------- */

/**
 * Изменить фоновое изображение и описание игрового мира
 * @param {Adventure} adventure        Приключение
 * @param {object} options             Параметры импорта
 * @param {string} options.background  Путь до фонового изображения для игрового мира
 * @returns {Promise<void>}
 */
export async function customizeJoin(adventure, { background } = {}) {
  const worldData = { background, action: 'editWorld', id: game.world.id, description: game.i18n.localize('AgWdh.Description') };
  await foundry.utils.fetchJsonWithTimeout(foundry.utils.getRoute('setup'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(worldData),
  });
  game.world.updateSource(worldData);
}

/* -------------------------------------------- */

/**
 * Инициализация токена группы.
 * Удаляет заранее созданного актёра, если в мире уже есть группа.
 * Иначе — делает заранее созданного актёра основной группой в мире.
 * @returns {Promise<void>}
 */
async function initParty() {
  const premade = game.actors.get(METADATA.partyId);
  const party = game.settings.get('dnd5e', 'primaryParty')?.actor;

  if (party && (party !== premade)) {
    premade?.delete();
  } else if (!party) {
    await game.settings.set('dnd5e', 'primaryParty', { actor: METADATA.partyId });
  }
}
