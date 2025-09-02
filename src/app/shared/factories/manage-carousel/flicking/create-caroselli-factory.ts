// ─────────────────────────────────────────────────────────────────────────────
// src/app/shared/flicking/create-caroselli-factory.ts
// ─────────────────────────────────────────────────────────────────────────────
//
// QUI COSA STO FACENDO
// - Mi creo una factory che *crea il carosello completo* (options + plugins + otherOption + data).
// - Io le passo già le options (dalla micro-factory `makeOptions`) e i plugin
//   (dalla micro-factory `makePlugins`), più i metadati UI.
// - La factory mi restituisce un oggetto tipato `ImieiCaroselli` pronto da usare.
//
// PERCHÉ MI SERVE
// - Centralizzo la costruzione del carosello in un punto solo.
// - Evito incongruenze tra UI e logica (es. frecce/bullet): se non specifico i flag,
//   li inferisco dai plugin (Arrow/Pagination) che ho passato.
//
// ─────────────────────────────────────────────────────────────────────────────

import type { FlickingOptions } from '@egjs/flicking';     // tipo per le options
import type { Plugin } from '@egjs/ngx-flicking';          // tipo per l'array di plugin
import { MediaCollection } from '../../../../app.component';
// Mi servono i costruttori reali per riconoscere Arrow/Pagination tra i plugin
import { Arrow, Pagination } from '@egjs/flicking-plugins';

// ── Tipi condivisi (tengo il file autoconsistente) ───────────────────────────

/**
 * In OtherOption raccolgo le opzioni UI/semantiche (non tecniche di Flicking).
 * `onChangedCarosello` è UNA STRINGA che rappresenta *il nome di una classe CSS*
 * che applico quando cambia slide (es. "zoom-enter"). Devo assicurarmi di
 * avere quella classe definita nel mio SCSS locale, altrimenti non si vede nulla.
 */
export interface OtherOption {
  onChangedCarosello: string;     // es. 'zoom-enter' → devo avere .zoom-enter nel mio SCSS. cioe quando creo il carosello e metto pippo devo assicurarmi che nel mio scss ci sia la classe pippo perche cosa succede quando cambia il carosello viene applicata la classe altirmenti non viene applicata
  editKey: string;                // chiave per aprire l'editor admin
  tooltip: string;                // testo tooltip del pulsante admin
  titoloSezione?: string;         // titolo opzionale sopra il carosello
  haveArrow: boolean;             // controllo visibilità frecce lato UI
  haveBullet: boolean;            // controllo visibilità bullet lato UI
  wrapperClass?: string;          // classe CSS per il <ngx-flicking>
  panelClass?: string;            // classe CSS per i pannelli interni
}

/**
 * Contratto del mio carosello.
 * - `options`: configurazione tecnica Flicking (circular, duration, moveType, ecc.)
 * - `plugins`: istanze *nuove* dei plugin (Arrow, Pagination, Fade, AutoPlay, ...)
 * - `otherOption`: meta UI e comportamento personalizzato
 * - `data`: la mia collezione di media da renderizzare
 */
export interface ImieiCaroselli {
  options: Partial<FlickingOptions>;
  otherOption: OtherOption;
  plugins: Plugin[];
  data: MediaCollection;
}

// ── La factory vera e propria ────────────────────────────────────────────────

export function createCarousel(args: {
  // dati + options + plugin (già creati dalle micro-factory)
  data: MediaCollection;
  options: Partial<FlickingOptions>;
  plugins: Plugin[];

  // meta/UI
  editKey: string;
  tooltip: string;
  titoloSezione?: string;
  onChangedCarosello?: string; // stringa con il nome classe CSS da applicare al cambio slide

  // classi CSS
  wrapperClass?: string;
  panelClass?: string;

  // (opzionali) posso forzare i flag se non voglio l’inferenza automatica
  haveArrow?: boolean;
  haveBullet?: boolean;
}): ImieiCaroselli {
  const {
    data,
    options,
    plugins,
    editKey,
    tooltip,
    titoloSezione,
    onChangedCarosello = '', // se vuoto → nessuna classe extra applicata
    wrapperClass = 'flicking-default',
    panelClass = 'panel-default',
    haveArrow,
    haveBullet,
  } = args;

  // Inferisco la presenza di Arrow/Pagination dai plugin passati,
  // a meno che non mi sia stato chiesto esplicitamente di forzare i flag.
  const inferredHaveArrow = haveArrow ?? plugins.some(p => p instanceof Arrow);
  const inferredHaveBullet = haveBullet ?? plugins.some(p => p instanceof Pagination);

  const otherOption: OtherOption = {
    onChangedCarosello,
    editKey,
    tooltip,
    titoloSezione,
    haveArrow: inferredHaveArrow,
    haveBullet: inferredHaveBullet,
    wrapperClass,
    panelClass,
  };

  // Ritorno l’oggetto completo, pronto per essere pushato nell’array dei miei caroselli.
  return {
    data,
    options,
    plugins,
    otherOption,
  };
}
