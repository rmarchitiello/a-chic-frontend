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
import { AlignType, makeOptions } from './options.factory';
import { makePlugins } from './plugins.factory';
import { CarouselMode } from './options.factory';
import { MakePluginsOpts } from './plugins.factory';
import { Arrow, Pagination } from '@egjs/flicking-plugins';
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
  titoloSezione?: string;     // titolo opzionale sopra il carosello per introdurlo praticamente
  wrapperTitoloSezioneClass: string[]; //contenitore del titolo
  titoloSezioneClass: string[]; // classe CSS per come deve essere fatto il titolo della sezione
  wrapperClass: string[];      // classe CSS per il <ngx-flicking>
  panelClass: string[];        // classe CSS per i pannelli interni
  panelsNames: string[]       //Nome dei vari pannelli ovvero slides
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
  hasArrow: boolean;          //purtroppo serve questa variabile perche dobbiamo dare l info ALL UI che le frecce non devono essere presenti
  hasBullet: boolean;
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
  mode: CarouselMode;            // 'no-scroll' | 'freeScroll' | 'snap'
  circular: boolean;
  align: AlignType
  duration: number;
  optionsOverrides?: Partial<FlickingOptions>;

  // plugin (toggle/opzioni della micro-factory)
  plugins?: MakePluginsOpts;     // se omesso, userò Fade+Arrow+Bullet, niente autoplay

  // meta/UI
  editKey: string;
  tooltip: string;
  titoloSezione?: string;   //titolo da impostare sopra ogni sezione se vogliamo per presentare magari il carosello che poi viene in basso
  wrapperTitoloSezioneClass: string[]; //imposto il contenitore del titolo del carosello
  titoloSezioneClass: string[]  //Ogni carosello imposta come deve essere fatto il titolo con quale classe 
  onChangedCarosello?: string;   // stringa: nome classe CSS che applico al cambio slide (es. 'zoom-enter')
  panelsName: string[];     //nome dei pannelli che sarebbero i display name
  // classi CSS
  wrapperClass: string[];
  panelClass: string[];
}): ImieiCaroselli {
  // ───────────────────────────────── 1) OPTIONS  ─────────────────────────────────
  // Creo le options con la mia micro-factory. Qui decido *comportamento* (no-scroll/free/snap),
  // e imposto i parametri base `circular` e `duration`. Gli override vincono sempre.
  const options = makeOptions(
    params.mode,
    params.align,
    params.circular,
    params.duration,
    params.optionsOverrides ?? {}
  );

  // ───────────────────────────────── 2) PLUGINS  ─────────────────────────────────
  // Decido i plugin da usare. Non tocco mai `params` (non mutuo input): lavoro su una *copia*.
  let pluginOptsEffettive: MakePluginsOpts;

  if (params.plugins) {
    // Mi hanno passato dei toggle → parto da quelli (copia superficiale)
    pluginOptsEffettive = { ...params.plugins };

    // Se sono in 'no-scroll', **disabilito sempre Arrow**:
    // voglio che non funzioni nulla via frecce (solo autoplay/eventuali API).
    if (params.mode === 'no-scroll') {
      pluginOptsEffettive.arrow = false;
      // Se volessi forzare una UI pulita, potrei anche spegnere i bullet qui:
      // pluginOptsEffettive.pagination = false;
    }
  } else {
    // Non mi hanno passato nulla → imposto io dei default *espliciti*
    pluginOptsEffettive = {
      fade: true,
      arrow: true,
      pagination: 'bullet',
      autoplay: false,
    };

    // Anche nel ramo default, se è 'no-scroll' spengo Arrow per coerenza.
    if (params.mode === 'no-scroll') {
      pluginOptsEffettive.arrow = false;
      // (facoltativo) pulizia totale: pluginOptsEffettive.pagination = false;
    }
  }

  // Ora istanzio **NUOVE** istanze dei plugin (mai riusare tra caroselli).
  const plugins = makePlugins(pluginOptsEffettive);

  // ─────────────────────────── 3) FLAG UI (hasArrow / hasBullet) ───────────────────────────
  // Non mi fido dei toggle passati in ingresso: calcolo i flag **dai plugin reali** creati.
  const hasArrow = plugins.some(p => p instanceof Arrow);
  const hasBullet = plugins.some(p => p instanceof Pagination);

  // ───────────────────────────── 4) OTHER OPTION (meta UI) ─────────────────────────────
  // Compongo i metadati UI con default *espliciti* (if/else).
  // `onChangedCarosello` è una *stringa* con il nome della classe CSS che applico al cambio slide.
  // Devo assicurarmi che quella classe esista nel mio SCSS locale (es. .zoom-enter).
  const onChanged = typeof params.onChangedCarosello === 'string' ? params.onChangedCarosello : '';

  const wrapperClass = typeof params.wrapperClass === 'string'
    ? params.wrapperClass
    : 'flicking-default';

  const panelClass = typeof params.panelClass === 'string'
    ? params.panelClass
    : 'panel-default';

  const otherOption: OtherOption = {
    onChangedCarosello: onChanged,
    editKey: params.editKey,
    tooltip: params.tooltip,
    titoloSezione: params.titoloSezione,
    wrapperTitoloSezioneClass: params.wrapperTitoloSezioneClass,
    titoloSezioneClass: params.titoloSezioneClass,
    wrapperClass: params.wrapperClass,
    panelClass: params.panelClass,
    panelsNames: params.panelsName
  };

  // ───────────────────────────── 5) OUTPUT CAROSELLO COMPLETO ─────────────────────────────
  // Ritorno l’oggetto nel formato atteso dalla UI.
  // Nota: `hasArrow` / `hasBullet` sono **la verità** che la UI deve usare per mostrare/nascondere.
  return {
    data: params.data,
    options,
    plugins,
    otherOption,
    hasArrow,
    hasBullet,
  };
}