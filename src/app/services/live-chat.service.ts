import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { io, Socket } from 'socket.io-client';
import { Subject, Observable } from 'rxjs';
import { ChatMessage } from '../pages/live-chat/live-chat.component';

//messaggio che ricevo dal server al client



@Injectable({
  providedIn: 'root'
})
export class LiveChatService {

  private urlSocketServer = environment.apiBaseUrl; // corretto: singolare
  private socket!: Socket;          // istanza privata

  /* Perche si usa observable ?
  si usa perche se avessi fatto 
  private systemMsgSubject: ChatMessage = ''
  e poi quando ricevo l'evento faccio:
  this.systemMsgSubject = data

  e poi per mandare il valore al component 
  getSystemMessages(): Observable<ChatMessage> {
  return this.systemMsgSubject

  FUNZIONA ANCHE COSI !! ma solo una volta, altrimenti devo fare polling e chiaamre la getMessage ogni millisecondo per ricevere il valore
  INVECE se riduco quella variabile a un oobservale in modo tale che il mio getSystemMessage diventa un observable, quando lo vado a mettere nell onit
  capisce subito che si è aggiornato perche faccio this.service.getSystemMessage.subscribe ecc.. tipo come i cambi rotta quando c e subscribe, 
  viene sempre chiamato in modo reattivo abbiamo l'update della variabile.


  In pratica quando ricevo dei dati dall esterno asincronamente (in questo caso non so quando il bot di telegram mi risponde), creo un Subject. Un subject anch egli e un
  observable infatti uso systemMsgSubject.next(data) per ricevere il dato 
  Avrei potuto fare public systemProjecy ecc... e il componente che deve leggere quella variabile, puo leggerla. Ma, se la variabile è public 
  rischio che quella variabile puo essere letta anche da altri componenti e perdo la logica di programmazione di observable. 
  Quindi uso il get, (setter e getter = incapsulamento) per poter accedere a quella variabile.
  Ritornando l'observable subject.
  nel metodo get poi faccio a Observable per proteggere il subject da modifiche esterne. altrimenti posso fare return this.systemMsgSubjkect pero se metto cosi un component potrebbe 
  sottoscrivere l'obervable con la get e fare .next  e .next si usa per emettere un nuovo valore nell observable andando a sovrascirvere la variabile data che telegram c ha dato.
}
  */
  private systemMsgSubject = new Subject<ChatMessage>(); //osservable


  //utilizzato per connettermi al socket
/**
 * Apro la connessione WebSocket e, già nell’hand-shake,
 * passo al server il mio sessionId salvato in localStorage.
 */
connect(): void {
  // recupero il sessionId che avevo messo nel localStorage
  const sessionId = localStorage.getItem('sessionId') || 'unknown';

  // stabilisco la connessione; forzo il transport WebSocket
  // e inserisco sessionId nel campo `auth`
  //invio il sessionId
  this.socket = io(this.urlSocketServer, {
    transports: ['websocket'],
    auth: { sessionId } // nell oggetto auth assegno il sessionId
  });

  //sono in ascolto se il server mi invia qualcosa
    this.socket.on('system-message', data => {
    console.log("Il server mi sta inviando questo messaggio: ", data) //ora come passo data al component ? devo esportare un observable in modo che LiveChatComponent acquisce quel valore
    this.systemMsgSubject.next(data); // passo il messaggio al componente
  });

  // intercetto eventuali errori di hand-shake / connessione
  this.socket.on('connect_error', err => {
    console.error('Errore di connessione WebSocket:', err);
  });
}

//serve per inviare il messaggio al backend
sendUserMessage(messaggioUtente: string): void {
  if (this.socket && this.socket.connected) {
    this.socket.emit('user-message', messaggioUtente);
  } else {
    console.warn('Socket non connesso, impossibile inviare il messaggio.');
  }
}

//metodo per esporre l obervable al componente 
getSystemMessages(): Observable<ChatMessage> {
  return this.systemMsgSubject.asObservable();
}

}
