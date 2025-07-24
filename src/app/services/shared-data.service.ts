import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { MediaCollection } from '../pages/home/home.component';
@Injectable({
  providedIn: 'root'
})
export class SharedDataService {

  constructor() { }

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



      /* qui invece creo un behavior subject di media collection perche uso questo subject per la parte di admin.
    in pratica nella parte di admin, ho un pop up che deve condividere i dati a realtime tra home e 
    editoradmincomponent che è suo figlio. Attualmente l'home component in data passava un array statico invece cosa faccio
    prima di chiamare il pop up passo la next all pop up e dentro il pop up faccio la subscribe dell evento 
    recuperando l'array poi se upload un documento o un media, la next viene inviata direttamente al figlio cosi 
    aggiorna dinamicamente. Faccio cosi in modo da non aggiornare con reload tutto e quindi fare un f5 e ricaricare il pop
    cosi facendo miglioro l'UI dell'utente che utilizza il sito e poi il padre fara la sunbscribe per ricevere
    i dati modificati dal figlio e cosi via */
private mediaCollectionSubject = new BehaviorSubject<MediaCollection | null>(null);
mediaCollection$ = this.mediaCollectionSubject.asObservable();

//qua faccio la next 
setMediaCollection(mediaCollection: MediaCollection) {
  console.log("Shared service ricevuto: ", mediaCollection);
  this.mediaCollectionSubject.next(mediaCollection);
}

//questo dovrei usarlo una tantum per leggerne il valore ma se voglio condividere faccio la subscribe
//cioe serve per leggere il valore una tantum senza sottoscrivermi al subject
//leggo l'ultimo valore che è stato next da qualche parte 
getMediaCollection(): MediaCollection | null {
  return this.mediaCollectionSubject.getValue();
}


}
