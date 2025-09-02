// ─────────────────────────────────────────────────────────────────────────────
// src/app/shared/flicking/create-caroselli-factory.ts
// ─────────────────────────────────────────────────────────────────────────────
//
// QUI COSA STO FACENDO
// - Creo un carosello *completo* (options + plugins + otherOption + data) usando
//   le MIE due micro-factory: `makeOptions` e `makePlugins`.
// - Io passo i dati (MediaCollection) + i parametri semantici per options e plugin,
//   e ottengo un `ImieiCaroselli` pronto da pushare nel mio array `this.carousels`.
//
// PERCHÉ MI SERVE
// - Centralizzo tutto in un punto solo, evitando di ripetere boilerplate.
// - Tengo coerenti UI e logica: i flag `haveArrow/haveBullet` li sincronizzo
//   direttamente con ciò che ho chiesto nei plugin.
//
// ─────────────────────────────────────────────────────────────────────────────

import type { FlickingOptions } from '@egjs/flicking';   // tipo per le options
import type { Plugin } from '@egjs/ngx-flicking';        // tipo per l'array di plugin
import { MediaCollection } from '../../../../app.component';
// Importo le mie micro-factory (le uso QUI dentro)
import { makeOptions } from './options.factory';
import { makePlugins } from './plugins.factory';
import { CarouselMode } from './options.factory';
import { MakePluginsOpts } from './plugins.factory';
// ── Tipi condivisi (tengo il file autoconsistente) ───────────────────────────

/**
 * In OtherOption raccolgo le opzioni UI/semantiche (non tecniche di Flicking).
 * `onChangedCarosello` è UNA STRINGA che rappresenta *il nome di una classe CSS*
 * che applico quando cambia slide (es. "zoom-enter"). Devo assicurarmi di
 * avere quella classe definita nel mio SCSS locale, altrimenti non si vedrà nulla.
 */
export interface OtherOption {
  onChangedCarosello: string; // es. 'zoom-enter' → devo avere .zoom-enter nel mio SCSS
  editKey: string;            // chiave per aprire l'editor admin
  tooltip: string;            // testo tooltip del pulsante admin
  titoloSezione?: string;     // titolo opzionale sopra il carosello
  haveArrow: boolean;         // controllo visibilità frecce lato UI
  haveBullet: boolean;        // controllo visibilità bullet lato UI
  wrapperClass?: string;      // classe CSS per il <ngx-flicking>
  panelClass?: string;        // classe CSS per i pannelli interni
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

/**
 * Creo un carosello usando direttamente le mie micro-factory:
 * - `mode/circular/duration/optionsOverrides` → vanno a `makeOptions(...)`
 * - `plugins` → oggetto opzioni che inoltro a `makePlugins(...)`
 *
 * NB: `plugins` è nel formato della mia micro-factory (MakePluginsOpts), es:
 *     { fade: true, arrow: { moveByViewportSize: true }, pagination: 'bullet', autoplay: 2500 }
 */
export function createCarousel(params: {
  // dati
  data: MediaCollection;

  // options (semantiche)
  mode: CarouselMode;                       // 'no-scroll' | 'freeScroll' | 'snap'
  circular: boolean;
  duration: number;
  optionsOverrides?: Partial<FlickingOptions>;

  // plugin (passo i toggle/opzioni della micro-factory)
  plugins?: MakePluginsOpts;                // se omesso: default sensati sotto

  // meta/UI
  editKey: string;
  tooltip: string;
  titoloSezione?: string;
  onChangedCarosello?: string;              // nome classe CSS da applicare al cambio slide

  // classi CSS
  wrapperClass?: string;
  panelClass?: string;

  // (opzionali) forzo i flag UI se non voglio la sincronizzazione automatica
  haveArrow?: boolean;
  haveBullet?: boolean;
}): ImieiCaroselli {
  const {
    data,
    mode,
    circular,
    duration,
    optionsOverrides = {},

    // default plugin sensati: Fade on, Arrow on, Bullet on, niente autoplay
    plugins: pluginOpts = { fade: true, arrow: true, pagination: 'bullet', autoplay: false },

    editKey,
    tooltip,
    titoloSezione,
    onChangedCarosello = '',

    wrapperClass = 'flicking-default',
    panelClass = 'panel-default',

    haveArrow,
    haveBullet,
  } = params;

  // 1) Options dalla micro-factory (scelgo la modalità e imposto i parametri base)
  const options = makeOptions(mode, circular, duration, optionsOverrides);

  // 2) Plugins dalla micro-factory (ogni chiamata → istanze nuove)
  const plugins = makePlugins(pluginOpts);

  // 3) Flag UI coerenti ai plugin richiesti (posso comunque forzarli via parametri)
  const inferredHaveArrow = haveArrow ?? !!pluginOpts.arrow;
  const inferredHaveBullet = haveBullet ?? !!pluginOpts.pagination;

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

  return { data, options, plugins, otherOption };
}
