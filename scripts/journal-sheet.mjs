import { METADATA } from './metadata.mjs';

export class AgWdhJournalSheet extends dnd5e.applications.journal.JournalSheet5e {
  constructor(doc, options) {
    super(doc, options);
    this.options.classes.push(METADATA.cssClass);
  }

  /* --------------------------------------------- */
  /*  Отрисовка контента журнала                   */
  /* --------------------------------------------- */

  /** @inheritdoc */
  async _render(...args) {
    await super._render(...args);
    const [html] = this._element;
    const header = html.querySelector('.journal-entry-content .journal-header');

    html.querySelectorAll('[data-type="Scene"]').forEach((link) => {
      link.setAttribute('data-tooltip', game.i18n.localize('AgWdh.JOURNAL.JumpToScene'));
    });

    // Вставить навигационную панель в шапку журнала
    const nav = this.document.getFlag(METADATA.moduleName, 'navigation');
    if (nav) {
      const getDocument = (id) => {
        if (!this.document.pack) return game.journal.get(id);
        return game.packs.get(this.document.pack).getDocument(id);
      };
      const previous = nav.previous ? await getDocument(nav.previous) : null;
      const up = nav.up ? await getDocument(nav.up) : null;
      const next = nav.next ? await getDocument(nav.next) : null;
      header.insertAdjacentHTML(
        'afterend', `
        <nav class="book-navigation">
          <ul>
            <li>${
          previous
            ? `<a class="content-link" data-link data-uuid="${previous.uuid}" rel="prev" data-tooltip="${game.i18n.localize('AgWdh.JOURNAL.Previous')}" data-tooltip-direction="LEFT">${previous.name}</a>`
            : ''
        }</li>
            <li>${
          up
            ? `<a class="content-link parent" data-link data-uuid="${up.uuid}" data-tooltip="${game.i18n.localize('AgWdh.JOURNAL.Up')}">${up.name}</a>`
            : ''
        }</li>
            <li>${
          next
            ? `<a class="content-link" data-link data-uuid="${next.uuid}" rel="next" data-tooltip="${game.i18n.localize('AgWdh.JOURNAL.Next')}" data-tooltip-direction="RIGHT">${next.name}</a>`
            : ''
        }</li>
          </ul>
        </nav>
      `);
    }
  }
}
