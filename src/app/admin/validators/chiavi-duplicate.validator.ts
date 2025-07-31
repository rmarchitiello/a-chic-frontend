/* creo un validator solo per i form array per le chiavi duplicate */

import {
  AbstractControl,
  FormArray,
  FormGroup,
  ValidationErrors,
  ValidatorFn
} from '@angular/forms';

/**
 * Ritorna `{ chiaviDuplicate: true }` se nel FormArray esistono
 * due (o più) controlli con la stessa chiave, altrimenti `null`.
 */
export const chiaviDuplicateValidator: ValidatorFn = (
  control: AbstractControl
): ValidationErrors | null => {
  if (!(control instanceof FormArray)) {
    return null;                            // protetto: si applica solo ai FormArray
  }

  const valori: string[] = control.controls
    .map(c => (c as FormGroup).get('key')?.value?.trim().toLowerCase())
    .filter(v => !!v);                      // scarta chiavi vuote

  // Set per individuare i duplicati
  const viste = new Set<string>();
  for (const k of valori) {
    if (viste.has(k)) {
      return { chiaviDuplicate: true };     // duplicato trovato
    }
    viste.add(k);
  }
  return null;                              // nessun duplicato
};
