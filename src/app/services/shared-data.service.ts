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
}
