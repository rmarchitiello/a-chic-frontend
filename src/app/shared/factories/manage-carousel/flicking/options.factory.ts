// ─────────────────────────────────────────────────────────────────────────────
// src/app/shared/flicking/flicking-options.factory.ts
// ─────────────────────────────────────────────────────────────────────────────
//
// QUI COSA STO FACENDO
// - Mi creo una *micro factory* per generare le `options` di Flicking.
// - La richiamo ovunque devo configurare un carosello: scelgo una modalità
//   semantica (no-scroll / freeScroll / snap), decido `circular` e `duration`,
//   e, se serve, applico override puntuali.
//
// COME LA USO (esempi pratici che userò nel componente):
//   options: makeOptions('freeScroll', false, 400)
//   options: makeOptions('no-scroll', true, 250, { align: 'center' })
//
// NOTA: qui genero SOLO le options (nessun plugin); i plugin li istanzio
//       con la micro-factory dedicata, così tengo le responsabilità separate.
//
import type { FlickingOptions } from '@egjs/flicking';

// Le modalità "semantiche" che passo alla factory.
// - 'no-scroll'  → voglio bloccare il drag nativo (inputType: [])
// - 'freeScroll' → scorrimento libero
// - 'snap'       → scatto a pannello
export type CarouselMode = 'no-scroll' | 'freeScroll' | 'snap';
/* 

Valori possibili di align

align può essere:

"prev" → allinea il pannello attivo al bordo iniziale del viewport
(a sinistra in orizzontale, in alto in verticale).
È quello giusto per le griglie “by-2/3/4”.

"center" → allinea il pannello al centro del viewport.
Perfetto per l’hero a 1-up (by-1).

"next" → allinea il pannello al bordo finale del viewport
(a destra / in basso).

Numero in px → posizione fissa dal bordo iniziale del viewport.
Esempio: align: 40 → 40px dal bordo sinistro.

Percentuale (stringa) → posizione relativa alla larghezza/altezza del viewport.
Esempio: align: "20%" → al 20% della larghezza (quasi come un “left: 20%”).

Nota: align decide dove si “aggancia” il pannello quando lo snap avviene; non è uno stile CSS.
*/
export type AlignType = 'prev' | 'center' | 'next' 

export function makeOptions(
  mode: CarouselMode,
  align: AlignType,
  circular: boolean,
  duration: number,
  overrides: Partial<FlickingOptions> = {}
): Partial<FlickingOptions> {
  // Default comuni: se un domani voglio cambiare l’allineamento base,
  // lo faccio qui e si riflette su tutti i caroselli.
  const common: Partial<FlickingOptions> = { align: align };

  // Scelgo una base in funzione della modalità che passo.
  let base: Partial<FlickingOptions>;
  switch (mode) {
    case 'no-scroll':
      // Voglio un carosello che NON si trascina con touch/mouse:
      // metto moveType 'snap' (atterro su una card) e disabilito il drag nativo.
      // Ricordo a me stesso: Arrow/AutoPlay (se attivi) possono comunque muovere la camera via API.
      base = { ...common, moveType: 'snap', inputType: [] };
      break;

    case 'freeScroll':
      // Scorrimento libero: non “snappero” sulle card, ideale per liste a flusso.
      base = { ...common, moveType: 'freeScroll' };
      break;

    case 'snap':
    default:
      // Modalità classica a scatto: ogni gesto/click atterra su un pannello allineato.
      base = { ...common, moveType: 'snap' };
      break;
  }

  // Compongo il risultato finale:
  // - unisco la base con i parametri obbligatori che decido a chiamata
  // - applico eventuali override (che vincono sempre)
  const result: Partial<FlickingOptions> = { ...base, circular, duration, ...overrides };

  // Enforce extra per 'no-scroll' (anche se qualcuno prova a cambiarlo negli override).
  if (mode === 'no-scroll') {
    result.inputType = [];
  }

  return result;
}
