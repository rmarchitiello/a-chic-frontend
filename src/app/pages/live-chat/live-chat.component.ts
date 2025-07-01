/*
  Questo sarà il mio componente di chat visibile in tutta l'app.
  Uso uuid per identificare la sessione utente anche senza login.
  Installazione: npm install uuid
*/

import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { v4 as uuidv4 } from 'uuid';
import { BreakpointObserver } from '@angular/cdk/layout';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { LiveChatService } from '../../services/live-chat.service';

export interface ChatMessage {
  sessionId: string,
  testo: string;              // contenuto
  tipo : 'utente' | 'sistema'; // mittente (ci basta questo)
}


@Component({
  selector: 'app-live-chat',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule
  ],
  templateUrl: './live-chat.component.html',
  styleUrls: ['./live-chat.component.scss']
})
export class LiveChatComponent implements OnInit {

  // ID univoco per tracciare l'utente anche senza login
  sessionId: string = '';

  // Flag per mostrare la versione mobile
  isMobile: boolean = false;

  // Controlla se la chat è aperta
  chatAperta: boolean = false;

  // Lista dei messaggi (può essere estesa con oggetti più complessi)
  messaggi: { testo: string, tipo: 'utente' | 'sistema' }[] = [];

  // Messaggio attuale scritto dall'utente
  messaggioCorrente: string = '';

  saveConversationHystori: ChatMessage[] = [];


  //scrollo in automatico il body quando arrivano messaggi nuovi
  @ViewChild('contenitoreChat') contenitoreChat!: ElementRef;


  scrollaInBasso(): void {
  setTimeout(() => {
    const el = this.contenitoreChat?.nativeElement;
    if (el) {
      el.scrollTop = el.scrollHeight;
    }
  }, 50); // ritardo minimo per attendere il rendering
}


  constructor(private breakpointObserver: BreakpointObserver, private liveChatService: LiveChatService) { }

  ngOnInit(): void {




    // Recupero sessione da localStorage
    this.sessionId = localStorage.getItem('sessionId') || '';

    // Se non esiste, la genero
    if (!this.sessionId) {
      console.log("SessionId non presente, lo genero...");
      this.sessionId = uuidv4();
      localStorage.setItem('sessionId', this.sessionId);
    }

    console.log("SessionId loggato:", this.sessionId);
    //instauriamo la connessione col backend via socket
    /* 
      Nella root del progetto installo socket-io client --> npm i socket.io-client
      Come qualsiasi funzione che si interfacci cool backend creo il service 
    */
    this.liveChatService.connect(); // apre la connessione socket


    // Controllo se siamo su mobile o desktop
    this.breakpointObserver
      .observe(['(max-width: 768px)'])
      .subscribe(result => {
        this.isMobile = result.matches;
      });

      //recupero lo storico delle conversazioni...
        const storico = localStorage.getItem('saveConvHistory');
  if (storico) {
    this.saveConversationHystori = JSON.parse(storico);
    this.messaggi = [...this.saveConversationHystori]; // Mostro i messaggi salvati
  } else {
    this.messaggi.push({
      testo: 'Ciao! Come possiamo aiutarti?',
      tipo: 'sistema'
    });

  }



    //ricevo l'obersable dal server
  this.liveChatService.getSystemMessages().subscribe(messaggio => {
    this.messaggi.push(messaggio);
    this.salvaConversazione(); // aggiorno lo storico
        this.scrollaInBasso(); // scroll dopo invio

  });



  }

  // Apre il pannello della chat
  apriChat() {
    this.chatAperta = true;
  }

  // Chiude il pannello della chat
  chiudiChat() {
    this.chatAperta = false;
  }

  // Invio del messaggio corrente
  inviaMessaggio() {
    const testo = this.messaggioCorrente.trim();
    if (!testo) return;

    // Aggiungo il messaggio come utente
    this.messaggi.push({
      testo,
      tipo: 'utente'
    });

    console.log("Messaggio inviato a telegram: ", testo);

    //invio il messaggio al backend
    this.liveChatService.sendUserMessage(testo);

    // Resetto il campo di input
    this.messaggioCorrente = '';

      this.salvaConversazione(); // aggiorno lo storico


        this.scrollaInBasso(); // scroll dopo invio


  }

  //salvo l history
  salvaConversazione(): void {
  localStorage.setItem('saveConvHistory', JSON.stringify(this.messaggi));
}
}
