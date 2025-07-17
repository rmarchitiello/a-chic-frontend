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


// ====== 4. Stato admin (token JWT) ======

// Inizializzo leggendo il token dal sessionStorage, oppure null se non presente
private isAdminSubject = new BehaviorSubject<string | null>(this.getAdminToken());

// Observable pubblico
isAdmin$ = this.isAdminSubject.asObservable();

// Metodo privato che legge il token dallo storage
private getAdminToken(): string | null {
  return sessionStorage.getItem('admin-cms');
}

// Metodo pubblico per aggiornare il token (oppure rimuoverlo)
setAdminToken(token: string | null): void {
  if (token) {
    sessionStorage.setItem('admin-cms', token);
    this.isAdminSubject.next(token); // Notifica con il token aggiornato
  } else {
    sessionStorage.removeItem('admin-cms');
    this.isAdminSubject.next(null); // Notifica logout
  }
}


}
