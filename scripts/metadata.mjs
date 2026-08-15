const METADATA = {
  moduleName: 'ag-wdh',
  adventureUuid: 'Compendium.ag-wdh.adventure.Adventure.BIth15cLzR6isdH3',
  adventuresPackId: 'ag-wdh.adventure',
  adventureId: 'BIth15cLzR6isdH3',
  changelogId: 'qn4h6rlJw9LUyNtS',
  guideId: 'MOzTsDKKS2tyCPt6',
  landingId: 'nhO2AQVKV1fjs2mL',
  partyId: 'KNaSL1h8p8XChJwh',
  cssClass: 'ag-wdh',
  worldBackgroundSrc: 'modules/ag-wdh/assets/arts/adventure-cover.webp',
};

METADATA.importOptions = {
  activateScene: {
    label: 'AgWdh.IMPORT.ActivateScene',
    default: true,
    handler: 'activateScene',
    lifecycle: 'post',
    documentId: METADATA.landingId,
  },
  displayJournal: {
    label: 'AgWdh.IMPORT.DisplayJournal',
    default: true,
    handler: 'displayJournal',
    lifecycle: 'post',
    documentId: METADATA.guideId,
  },
  customizeJoin: {
    label: 'AgWdh.IMPORT.CustomizeJoin',
    default: false,
    handler: 'customizeJoin',
    lifecycle: 'post',
    background: METADATA.worldBackgroundSrc,
  },
}

export { METADATA };
