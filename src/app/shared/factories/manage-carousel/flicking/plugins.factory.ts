// ─────────────────────────────────────────────────────────────────────────────
// src/app/shared/flicking/plugins.factory.ts
// ─────────────────────────────────────────────────────────────────────────────
//
// QUI COSA STO FACENDO
// - Mi creo una *micro factory* per generare l'array di Plugin[] di Flicking.
// - Ogni chiamata a `makePlugins(...)` mi restituisce SEMPRE **istanze nuove**.
//   Questo è fondamentale per evitare conflitti tra caroselli (es. Arrow che
//   “si stacca” dal precedente quando riuso la stessa istanza).
//
// COME LA USO (esempi pratici che userò nel componente):
//   plugins: makePlugins({ fade: true, arrow: true, pagination: 'bullet' })
//   plugins: makePlugins({ fade: true, arrow: { /* es. moveByViewportSize: true */ }, pagination: 'bullet' })
//   plugins: makePlugins({ fade: true, arrow: false, pagination: false, autoplay: 2500 })
//
// NOTA: qui genero SOLO i plugin; le options le creo con la micro-factory
//       dedicata (`makeOptions`). Insieme mantengo responsabilità separate.
//
// ─────────────────────────────────────────────────────────────────────────────

import { Arrow, Pagination, AutoPlay, Fade } from '@egjs/flicking-plugins';
import type { Plugin } from '@egjs/ngx-flicking';

// Derivo i tipi direttamente dai costruttori: così resto compatibile
// con la versione installata dei plugin senza dover indovinare le interfacce.
type ArrowOpts = ConstructorParameters<typeof Arrow>[0];
type PaginationOpts = ConstructorParameters<typeof Pagination>[0];
type AutoPlayOpts = ConstructorParameters<typeof AutoPlay>[0];
type PaginationType = NonNullable<PaginationOpts>['type'];

/**
 * Opzioni "semantiche" che decido a chiamata.
 * - `fade`: accendo/spegno l'effetto Fade (di default lo tengo acceso).
 * - `arrow`: posso passare `true` per Arrow "base", `false` per disattivarlo,
 *            oppure un oggetto opzioni (es. `{ moveByViewportSize: true }`
 *            per spingere di una viewport in freeScroll, o `{ prevEl, nextEl }`
 *            se uso frecce custom nel DOM).
 * - `pagination`: `false` per niente pallini; altrimenti tipo "bullet" | "fraction"
 *                 o direttamente l'oggetto opzioni di Pagination.
 * - `autoplay`: `false` per niente autoplay; oppure un numero (ms) come scorciatoia
 *               per `{ duration: ms }`, o l'oggetto opzioni completo di AutoPlay.
 */
export interface MakePluginsOpts {
  fade?: boolean;                                   // default: true
  arrow?: boolean | ArrowOpts;                      // true = Arrow() base; oggetto = Arrow(opzioni)
  pagination?: false | PaginationType | PaginationOpts; // false = niente Pagination
  autoplay?: false | number | AutoPlayOpts;         // number = duration ms (es. 2500)
}

/**
 * Factory dei plugin.
 * Ogni volta che la chiamo, costruisco da zero un array di Plugin[] coerente
 * con i toggle che ho passato. Così evito di riusare istanze tra caroselli.
 */
export function makePlugins(opts: MakePluginsOpts = {}): Plugin[] {
  const {
    fade = true,
    arrow = true,
    pagination = 'bullet',
    autoplay = false,
  } = opts;

  // Creo sempre un array nuovo: niente riuso di istanze tra caroselli.
  const plugins: Plugin[] = [];

  // 1) Fade (di default lo accendo: è leggero e rende il passaggio più gradevole)
  if (fade) {
    plugins.push(new Fade());
  }

  // 2) Arrow (se true creo l'istanza base; se è un oggetto, passo le opzioni)
  //    Esempi utili:
  //    - freeScroll “a pagina”: { moveByViewportSize: true }
  //    - frecce custom nel DOM: { prevEl: '#prevX', nextEl: '#nextX' }
  if (arrow) {
    plugins.push(typeof arrow === 'object' ? new Arrow(arrow) : new Arrow());
  }

  // 3) Pagination (bullet/fraction/scrollbar o opzioni complete)
  if (pagination) {
    plugins.push(
      typeof pagination === 'string'
        ? new Pagination({ type: pagination })
        : new Pagination(pagination)
    );
  }

  // 4) AutoPlay (numero come scorciatoia, altrimenti opzioni complete)
  if (autoplay) {
    plugins.push(
      typeof autoplay === 'number'
        ? new AutoPlay({ duration: autoplay })
        : new AutoPlay(autoplay)
    );
  }

  // Ritorno istanze nuove ad ogni chiamata (questa è la chiave per non “rompere” altri caroselli).
  return plugins;
}

// ─────────────────────────────────────────────────────────────────────────────
// NOTE OPERATIVE (mi ricordo):
// - Non condivido MAI lo stesso array/istanze tra caroselli: chiamo sempre
//   `makePlugins(...)` per ciascun carosello.
// - Se un carosello è in "no-scroll" (inputType: [] nelle options) ma metto Arrow
//   o AutoPlay qui, il carosello si muoverà comunque: Arrow/AutoPlay usano le API
//   e non il drag nativo. Quindi per un vero “fermo” non aggiungo Arrow/AutoPlay.
// - In freeScroll, se voglio frecce “più incisive”, passo `arrow: { moveByViewportSize: true }`.
// ─────────────────────────────────────────────────────────────────────────────
