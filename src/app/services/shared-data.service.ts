import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SharedDataService {

  constructor() {}

  // ====== 1. strutturaCategorie ======
  private strutturaCategorieSubject = new BehaviorSubject<{ [key: string]: string[] | undefined }>({});
  strutturaCategorie$ = this.strutturaCategorieSubject.asObservable();
  setStrutturaCategorie(data: { [key: string]: string[] | undefined }) {
    this.strutturaCategorieSubject.next(data);
  }

  // ====== 2. categorieSottoCategorie ======
  private categorieSottoCategorieSubject = new BehaviorSubject<string[]>([]);
  categorieSottoCategorie$ = this.categorieSottoCategorieSubject.asObservable();
  setCategorieSottoCategorie(data: string[]) {
    this.categorieSottoCategorieSubject.next(data);
  }

  // ====== 3. filtriSottoCategorie ======
  // Esempio: { "Conchiglia": ["Naturale", "Perlata"] }
  private filtriSottoCategorieSubject = new BehaviorSubject<Record<string, string[]>>({});
  filtriSottoCategorie$ = this.filtriSottoCategorieSubject.asObservable();
  setFiltriSottoCategorie(data: Record<string, string[]>) {
    this.filtriSottoCategorieSubject.next(data);
  }


// ====== 4. Stato admin ======

// Variabile privata che rappresenta lo stato attuale dell'utente admin.
// Viene inizializzata leggendo il valore dal localStorage tramite il metodo checkAdminLogin().
private isAdminSubject = new BehaviorSubject<boolean>(this.checkAdminLogin());

// Observable pubblico che espone lo stato admin a tutti i componenti.
// I componenti possono iscriversi per reagire a eventuali cambiamenti (es. login o logout admin).
isAdmin$ = this.isAdminSubject.asObservable();

// Metodo privato che controlla se l'utente è loggato come admin.
// Ritorna true se nel localStorage esiste la voce "admin-login" con valore "true".
private checkAdminLogin(): boolean {
  return sessionStorage.getItem('admin-login') === 'true';
}

// Metodo pubblico per aggiornare lo stato di login admin.
// Se status è true → salva il flag nel localStorage e aggiorna lo stato reattivo.
// Se status è false → rimuove il flag dal localStorage e aggiorna lo stato reattivo.
setIsAdmin(status: boolean): void {
  if (status) {
    sessionStorage.setItem('admin-login', 'true');
  } else {
    sessionStorage.removeItem('admin-login');
  }

  // Aggiorna il valore del BehaviorSubject, notificando tutti gli iscritti.
  this.isAdminSubject.next(status);
}

}
