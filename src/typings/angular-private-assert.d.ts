/**
 * Augmenta (non sostituisce) i tipi di @angular/core aggiungendo
 * l’helper privato ɵassertType richiesto dal template-type-checker.
 */
import '@angular/core';          // importa i tipi esistenti, così viene fatta una “merge declaration”
// eslint-disable-next-line @typescript-eslint/no-explicit-any
declare module '@angular/core' {
  export function ɵassertType<T>(value: any): asserts value is T;
}
