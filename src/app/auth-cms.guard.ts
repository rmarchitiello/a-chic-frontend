/* mi serve per bloccare tutte le chiamate a cms se non si e fatta la logine che quindi nel local storage non esiste il token 

se non metto questo riesco a navigare nei component ma non vedo dati perche le chiamate vanno in 403 */


/** non serve ai fini dell autenticazione ma serve a bloccare l accesso ad altre rotte se non vede qualcosa in questo caso nel local storage. */
import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';

@Injectable({
  providedIn: 'root'   // rende il guard disponibile in tutta l’app
})
export class AuthCmsGuard  implements CanActivate {

  constructor(private router: Router) {}

  /** 
   * Viene eseguito da Angular prima di attivare la rotta.
   * Se torna true la navigazione continua, altrimenti viene bloccata.
   */
  canActivate(): boolean {
    // Recupero il token salvato dopo la login
    const token = localStorage.getItem('cms-login');

    // Se il token non esiste → reindirizzo alla pagina di login
    if (!token) {
      this.router.navigate(['/cms-login']);
      return false;            // blocca la navigazione
    }

    // Token presente → consenti l’accesso alla rotta
    return true;
  }
}
