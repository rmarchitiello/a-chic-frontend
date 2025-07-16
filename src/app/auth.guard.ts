import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router, UrlTree } from '@angular/router';

@Injectable({
  providedIn: 'root'  // Rende il guard disponibile a tutta l'applicazione Angular
})
export class AuthGuard implements CanActivate {

  constructor(private router: Router) {}

  /**
   * Metodo invocato automaticamente da Angular quando si tenta di accedere a una rotta protetta.
   * Riceve come parametri lo snapshot della rotta e lo stato attuale del router.
   * Se restituisce true o una UrlTree, la navigazione è permessa.
   * Se restituisce false, la navigazione è bloccata.
   */
  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean | UrlTree {
    
    // Recupero il percorso della rotta richiesta
    const url = state.url;

    // Verifico se si tratta di una rotta CMS
    if (url.startsWith('/cms')) {
      const cmsToken = localStorage.getItem('cms-login');

      // Se il token CMS non è presente, reindirizzo alla pagina di login CMS
      if (!cmsToken) {
        return this.router.parseUrl('/cms-login');
      }

      // Token CMS valido → accesso consentito
      return true;
    }

    // Verifico se si tratta della sezione admin (modifica contenuti del sito)
    if (url.startsWith('/admin')) {
      const adminToken = localStorage.getItem('admin-login');

      // Se il token Admin non è presente, reindirizzo alla pagina di login Admin
      if (!adminToken) {
        return this.router.parseUrl('/admin-login');
      }

      // Token Admin valido → accesso consentito
      return true;
    }

    // Se la rotta non è né CMS né Admin, blocco l’accesso
    return false;
  }
}
