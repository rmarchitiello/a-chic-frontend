import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';
import { MediaCollection } from '../app.component';
@Injectable({
  providedIn: 'root'
})
export class SharedDataService {

  constructor() { }

  



  // Inizializzo leggendo il token dal sessionStorage, oppure null se non presente
  private isAdminSubject = new BehaviorSubject<boolean>(!!this.getAdminToken());
isAdmin$ = this.isAdminSubject.asObservable();

setAdminToken(token?: string | null): void {
  if (token) {
    sessionStorage.setItem('admin', token);
    this.isAdminSubject.next(true); // Sei loggato come admin
  } else {
    sessionStorage.removeItem('admin');
    this.isAdminSubject.next(false); // Sei sloggato
  }
}

private getAdminToken(): string | null {
  return sessionStorage.getItem('admin');
}




      /* qui invece creo un behavior subject di media collection perche uso questo subject per la parte di admin.
    in pratica nella parte di admin, ho un pop up che deve condividere i dati a realtime tra home e 
    editoradmincomponent che è suo figlio. Attualmente l'home component in data passava un array statico invece cosa faccio
    prima di chiamare il pop up passo la next all pop up e dentro il pop up faccio la subscribe dell evento 
    recuperando l'array poi se upload un documento o un media, la next viene inviata direttamente al figlio cosi 
    aggiorna dinamicamente. Faccio cosi in modo da non aggiornare con reload tutto e quindi fare un f5 e ricaricare il pop
    cosi facendo miglioro l'UI dell'utente che utilizza il sito e poi il padre fara la sunbscribe per ricevere
    i dati modificati dal figlio e cosi via */
private mediaCollectionConfig = new BehaviorSubject<MediaCollection | null>(null);
  mediaCollectionConfig$ = this.mediaCollectionConfig.asObservable();

  // Metodo per aggiornare il contenuto corrente della MediaCollection
  setMediaCollectionConfig(mediaCollection: MediaCollection): void {
    console.log("Shared service ricevuto:", mediaCollection);
    this.mediaCollectionConfig.next(mediaCollection);
  }

  // Metodo per ottenere l'ultimo valore settato senza sottoscrizione
  getMediaCollectionConfig(): MediaCollection | null {
    return this.mediaCollectionConfig.getValue();
  }

  // =====================================================================================
// 6. Tutte le MediaCollections di tipo "configurazione"
// Questa lista rappresenta i media legati alla configurazione completa.
// Viene aggiornata ad esempio dopo un upload o una modifica massiva da parte dell’admin.
// =====================================================================================

private mediasCollectionsConfigSubject = new BehaviorSubject<MediaCollection[]>([]);
mediasCollectionsConfig$ = this.mediasCollectionsConfigSubject.asObservable();

// Aggiorna l'intera lista delle MediaCollections di configurazione
setAllMediasCollectionsConfig(mediaCollection: MediaCollection[]): void {
  console.trace();
  console.log("SharedDataService - aggiornamento config:", mediaCollection);
  this.mediasCollectionsConfigSubject.next(mediaCollection);
}

// Restituisce l'ultimo valore della lista di MediaCollections di configurazione
// senza richiedere la sottoscrizione all'osservabile
getMediasCollectionsConfig(): MediaCollection[] {
  return this.mediasCollectionsConfigSubject.getValue();
}

// =====================================================================================
// 7. Tutte le MediaCollections di tipo "non configurazione"
// Questa lista contiene i media generici, non legati alla configurazione.
// Viene aggiornata quando vengono caricati o modificati media di questo tipo.
// =====================================================================================

private mediasCollectionsNonConfigSubject = new BehaviorSubject<MediaCollection[]>([]);
mediasCollectionsNonConfig$ = this.mediasCollectionsNonConfigSubject.asObservable();

// Aggiorna l'intera lista delle MediaCollections non di configurazione
setAllMediasCollectionsNonConfig(mediaCollection: MediaCollection[]): void {
  console.trace();
  console.log("SharedDataService - aggiornamento non config:", mediaCollection);
  this.mediasCollectionsNonConfigSubject.next(mediaCollection);
}

// Restituisce l'ultimo valore della lista di MediaCollections non di configurazione
// senza richiedere la sottoscrizione all'osservabile
getMediasCollectionsNonConfig(): MediaCollection[] {
  return this.mediasCollectionsNonConfigSubject.getValue();
}


//notifica ad app component che e cambiata la cache
private allCacheChangedSubject = new Subject<void>();
allCacheChanged$ = this.allCacheChangedSubject.asObservable();

notifyCacheIsChanged(): void {
  console.log("Sto notificando  . . .")
  this.allCacheChangedSubject.next();
}



}
