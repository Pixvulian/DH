import { AgWdhJournalSheet } from './journal-sheet.mjs';
import { onImport, preImport, renderAdventureImporter } from './importer.mjs';
import { METADATA } from './metadata.mjs';

Hooks.once('init', async () => {
  game.settings.register(METADATA.moduleName, 'importOptions', {
    scope: 'world',
    config: false,
    type: Object,
    default: {},
  });

  // Register Journal Sheet
  foundry.applications.apps.DocumentSheetConfig.registerSheet(
    JournalEntry, METADATA.moduleName, AgWdhJournalSheet, {
      types: ['base'],
      label: 'AgWdh.JOURNAL.Title',
      makeDefault: false,
    },
  );
});

Hooks.on('ready', async () => {
  const imported = !!game.settings.get('core', 'adventureImports')?.[METADATA.adventureUuid];

  if (!imported && game.user.isGM) {
    const pack = game.packs.get(METADATA.adventuresPackId);
    const adventure = await pack.getDocument(METADATA.adventureId);
    adventure.sheet.render(true);
  }

  game.socket.on(`module.${METADATA.moduleName}`, ({ type, payload }) => {
    if (!game.user.isActiveGM) return;

    if (type === 'floorCollapse') {
      const macro = fromUuidSync(payload.macroUuid);
      const region = fromUuidSync(payload.regionUuid);
      const actor = fromUuidSync(payload.actorUuid);
      macro.execute({ region, actor });
    }
  });
});

/* -------------------------------------------- */
/*  Окно импорта приключения					        */
/* -------------------------------------------- */

Hooks.on('renderAdventureImporterV2', renderAdventureImporter);
Hooks.on('importAdventure', onImport);
Hooks.on('preImportAdventure', preImport);
