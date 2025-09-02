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

export function makeOptions(
  mode: CarouselMode,
  circular: boolean,
  duration: number,
  overrides: Partial<FlickingOptions> = {}
): Partial<FlickingOptions> {
  // Default comuni: se un domani voglio cambiare l’allineamento base,
  // lo faccio qui e si riflette su tutti i caroselli.
  const common: Partial<FlickingOptions> = { align: 'center' };

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
