import { Component, Input, Output, OnInit, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { BreakpointObserver } from '@angular/cdk/layout';
import {
  trigger,
  state,
  style,
  animate,
  transition
} from '@angular/animations'; //importo le animazioni cosi nello scroll delle altre immagin non uso il set timeout


@Component({
  selector: 'app-dettagli',
  standalone: true, // Il componente è standalone (senza modulo dedicato)
  imports: [
    CommonModule,          // Per *ngIf, *ngClass, ecc.
    MatIconModule,         // Per eventuali icone Angular Material (es. mat-icon)
    MatButtonModule,        // Per eventuali pulsanti con stile Material
  ],
    animations: [
    trigger('slideAnimation', [
      state('in', style({ opacity: 1, transform: 'translateX(0)' })),
      state('out-left', style({ opacity: 0, transform: 'translateX(-40px)' })),
      state('out-right', style({ opacity: 0, transform: 'translateX(40px)' })),
      transition('* => in', [
        style({ opacity: 0, transform: 'translateX(20px)' }),
        animate('300ms ease-out')
      ]),
      transition('in => out-left', animate('300ms ease-in')),
      transition('in => out-right', animate('300ms ease-in'))
    ])
  ],
  templateUrl: './dettagli.component.html',  // Template HTML associato
  styleUrl: './dettagli.component.scss'      // Stili CSS/SCSS associati
})
export class DettagliComponent implements OnInit {


  
  // ======================================================
  // INPUT ricevuto dal componente padre (dati dell’immagine)
  // ======================================================
@Input() immagineFrontale!: string; //URL DELL IMMAGINE SELEZIONATA
@Input() descrizioneImmagineFrontale!: string; //URL DELL IMMAGINE SELEZIONATA

@Input() altreImmaginiDellaFrontale!: string[];  //URLS DELLE IMMAGINI LATERALI OBLIQUE DI QUELLA SELEZIONATA

  totaleImmagini: string[] = [];

  // ======================================================
  // OUTPUT emesso verso il padre quando il pannello viene chiuso
  // ======================================================
  @Output() chiudiDettaglio = new EventEmitter<void>();

  // ======================================================
  // Stato usato per attivare l’animazione di chiusura del pannello
  // ======================================================
  panelClosing = false;

  // ======================================================
  // Stato usato per attivare l’effetto sfocatura e overlay
  // Serve per attivare la classe `.attiva` sull’overlay
  // ======================================================
  attivo = false;

  // ======================================================
  // ngOnInit — eseguito quando il componente viene montato
  // Attiva l’effetto blur/sfocatura subito dopo il rendering
  // ======================================================


  //variabile che attiva lo scroll se ci sono piu immagini di quella frontale passata dal padre
  checkOtherImages: boolean = false;
  currentIndexOtherImage: number = 0; // serve x capire quale pagina voglio visualizzare 

      isMobile = false;

      //opacita quando traslo la mini immagine
immagineVisibile = false;


  // Variabile che rappresenta lo stato dell'animazione corrente
animationState: 'in' | 'out-left' | 'out-right' | '' = 'in';


//vediamo come fare lo swipe da mobile
// Variabile che memorizza la posizione iniziale del tocco sullo schermo
startX = 0;

/**
 * Evento attivato quando l'utente inizia il tocco (touchstart)
 * Registra la coordinata orizzontale (X) iniziale del tocco
 */
onTouchStart(event: TouchEvent): void {
  this.startX = event.changedTouches[0].screenX;
}

/**
 * Evento attivato quando l'utente termina il tocco (touchend)
 * Calcola la differenza tra il punto iniziale e finale del tocco
 * Se la differenza supera una soglia (es. 50px), considera lo swipe valido
 * Determina la direzione dello swipe:
 *  - Se verso sinistra, mostra l'immagine successiva
 *  - Se verso destra, mostra l'immagine precedente
 */
onTouchEnd(event: TouchEvent): void {
  const endX = event.changedTouches[0].screenX;
  const deltaX = endX - this.startX;

  // Controlla se lo swipe è significativo (più di 50px)
  if (Math.abs(deltaX) > 50) {
    if (deltaX < 0) {
      // Swipe verso sinistra: mostra immagine successiva
      this.slideLeft(); // swipe sinistra
    } else {
      // Swipe verso destra: mostra immagine precedente
      this.slideRight(); // swipe destra
    }
  }
}

/**
 * Esegue lo swipe verso sinistra:
 *  - Avvia un'animazione di uscita verso sinistra impostando lo stato
 *  - Attende che l'animazione termini (durata ~300ms)
 *  - Aggiorna l'indice all'immagine successiva
 *  - Reimposta lo stato per avviare animazione di entrata
 */
slideLeft(): void {
  // Se non siamo all'ultima immagine, possiamo proseguire
  if (this.currentIndexOtherImage < this.totaleImmagini.length - 1) {
    this.animationState = 'out-left';               // Inizia animazione di uscita verso sinistra
    setTimeout(() => {
      this.currentIndexOtherImage++;                // Incrementa l'indice
      this.animationState = 'in';                   // Cambia stato in 'in' per animazione di entrata
    }, 300);                                         // Attendiamo 300ms (durata animazione uscita)
  }
}

/**
 * Esegue lo swipe verso destra:
 *  - Avvia un'animazione di uscita verso destra impostando lo stato
 *  - Attende che l'animazione termini
 *  - Aggiorna l'indice all'immagine precedente
 *  - Reimposta lo stato per animazione di entrata
 */
slideRight(): void {
  // Se non siamo già alla prima immagine
  if (this.currentIndexOtherImage > 0) {
    this.animationState = 'out-right';              // Inizia animazione di uscita verso destra
    setTimeout(() => {
      this.currentIndexOtherImage--;                // Decrementa l'indice
      this.animationState = 'in';                   // Anima l'entrata della nuova immagine
    }, 300);                                         // 300ms per l'animazione di uscita
  }
}




constructor(private breakpointObserver: BreakpointObserver) {}

  ngOnInit(): void {
    console.log("Figlio immagine frontale", JSON.stringify(this.immagineFrontale));
    console.log("Figlio altre", JSON.stringify(this.altreImmaginiDellaFrontale));
    console.log("La descrizioneee: ", this.descrizioneImmagineFrontale);
    //Qui sommo l'array frontale piu l'array figlio cosi ho 4 pallini metto i 3 pallini per avere un unico array piatto con le immagini frontali e altre immagini
    this.totaleImmagini = [this.immagineFrontale, ...this.altreImmaginiDellaFrontale];
    console.log("Unico array frontale piu le altre: ", this.totaleImmagini)


    //intercetta se lo schermo è mobile o desktop
  this.breakpointObserver
    .observe(['(max-width: 768px)'])
    .subscribe(result => {
      this.isMobile = result.matches;
    });



    // Usa un piccolo delay per pe
    // rmettere alla classe `.attiva`
    // di essere applicata dopo il rendering iniziale, così da far
    // partire la transizione CSS in modo fluido
    setTimeout(() => {
      this.attivo = true; // Applica la classe CSS `.attiva` all’overlay
    }, 10); // 10ms sono sufficienti a differire al frame successivo

    //controllo se ci sono altre immagini di quella frontale se si sarà true e attiva il template in dettagli html
    this.checkOtherImages = this.altreImmaginiDellaFrontale.length > 0;

  this.immagineVisibile = true;

  }

  // ======================================================
  // closeWindow — chiamato al click sul bottone "Chiudi"
  // Rimuove la classe attiva, fa partire l’animazione di uscita
  // e notifica il componente padre dopo 400ms
  // ======================================================
  closeWindow(): void {
    this.panelClosing = true;  // Aggiunge la classe `.chiusura` per animare
    this.attivo = false;       // Rimuove effetto blur e oscuramento sfondo

    // Attende il completamento dell’animazione prima di chiudere
    setTimeout(() => {
      this.chiudiDettaglio.emit(); // Notifica al padre che può rimuovere il componente
    }, 400); // Deve corrispondere alla durata dell’animazione in SCSS
  }
}
