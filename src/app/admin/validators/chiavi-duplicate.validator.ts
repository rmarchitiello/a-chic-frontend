/* ===========================================================================
   VALIDATORE PERSONALIZZATO  ▸  FormArray di metadati aggiunti
   ---------------------------------------------------------------------------
   Obiettivi gestiti contemporaneamente
   ------------------------------------
   1.  Individuare chiavi DUPLICATE all’interno del FormArray stesso
   2.  Individuare chiavi che coincidono con quelle “RISERVATE” (già presenti
       nel gruppo padre – metadati esistenti)

   Comportamento
   -------------
   • Il validator non restituisce più l’errore a livello di FormArray soltanto,
     ma lo propaga direttamente ai singoli FormControl `key` coinvolti:
        -  { chiaviDuplicate: true }   → chiave duplicata nel FormArray
        -  { chiaviRiservate: true }   → chiave già esistente nel padre
   • Il FormArray risulta `invalid` se almeno una riga ha uno di questi errori.
   • I controlli “innocenti” restano validi, perciò il template può mostrare
     il messaggio solo sulle righe interessate.

   Utilizzo
   --------
     const riservate = Object.keys(this.formControlsFromFather);
     this.metadatiAggiunti = new FormArray(
       [],
       chiaviValidatorEsteso(riservate)
     );

   ========================================================================== */

import {
  AbstractControl,
  FormArray,
  FormControl,
  FormGroup,
  ValidationErrors,
  ValidatorFn
} from '@angular/forms';

/**
 * Factory → restituisce un ValidatorFn parametrizzabile con la lista di chiavi
 * già esistenti (riservate).
 *
 * @param reservedKeys  elenco di chiavi provenienti dal gruppo padre
 */
export function chiaviValidatorEsteso(reservedKeys: string[]): ValidatorFn {
  /* normalizza le chiavi riservate una sola volta (case-insensitive) */
  const reserved = new Set(
    reservedKeys.map(k => k.trim().toLowerCase())
  );

  /* ------------- ValidatorFn vero e proprio ------------- */
  return (control: AbstractControl): ValidationErrors | null => {

    /* Applica SOLO ai FormArray (fail-safe) */
    if (!(control instanceof FormArray)) {
      return null;
    }

    /* 1.  Rimuove eventuali errori pre-esistenti da ogni FormControl `key` */
    control.controls.forEach(ctrl => {
      const keyCtrl = (ctrl as FormGroup).get('key') as FormControl;
      if (keyCtrl?.errors) {
        /* toglie solo i nostri errori, lascia altri eventuali validator */
        delete keyCtrl.errors['chiaviDuplicate'];
        delete keyCtrl.errors['chiaviRiservate'];
        if (Object.keys(keyCtrl.errors).length === 0) {
          keyCtrl.setErrors(null);
        }
      }
    });

    /* 2.  Mappa <chiave, primoFormControlTrovato> per individuare duplicati */
    const viste = new Map<string, FormControl>();

    /* Flag per capire se l’array, nel complesso, dovrà risultare invalid */
    let arrayNonValido = false;

    control.controls.forEach(ctrl => {
      const keyCtrl = (ctrl as FormGroup).get('key') as FormControl;
      const raw      = keyCtrl.value?.toString().trim();
      const keyNorm  = raw?.toLowerCase() ?? '';

      /* Skip se la chiave è vuota */
      if (!keyNorm) return;

      const duplicatoInterno   = viste.has(keyNorm);
      const conflittoRiservato = reserved.has(keyNorm);

      /* Se c’è un duplicato interno o conflitto con riservate,
         marca questo keyCtrl con gli errori appropriati             */
      if (duplicatoInterno || conflittoRiservato) {
        keyCtrl.setErrors({
          ...(keyCtrl.errors || {}),
          ...(duplicatoInterno   ? { chiaviDuplicate: true } : {}),
          ...(conflittoRiservato ? { chiaviRiservate: true } : {})
        });

        /* Se duplicato interno, marca anche la PRIMA occorrenza coinvolta */
        if (duplicatoInterno) {
          const primoCtrl = viste.get(keyNorm)!;
          primoCtrl.setErrors({
            ...(primoCtrl.errors || {}),
            chiaviDuplicate: true
          });
        }
        arrayNonValido = true;
      }

      /* Memorizza la prima occorrenza della chiave (se non già presente) */
      if (!viste.has(keyNorm)) {
        viste.set(keyNorm, keyCtrl);
      }
    });

    /* 3.  Se almeno un controllo è invalid, ritorna un errore generico
           (chiaviNonValide) – utile se vuoi bloccare tutto il FormArray */
    return arrayNonValido ? { chiaviNonValide: true } : null;
  };
}
