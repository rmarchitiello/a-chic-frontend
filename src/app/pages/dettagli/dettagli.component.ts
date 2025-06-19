import { Component, Input, Output, OnInit, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';

@Component({
  selector: 'app-dettagli',
  standalone: true, // Il componente è standalone (senza modulo dedicato)
  imports: [
    CommonModule,          // Per *ngIf, *ngClass, ecc.
    MatIconModule,         // Per eventuali icone Angular Material (es. mat-icon)
    MatButtonModule,        // Per eventuali pulsanti con stile Material
  ],
  templateUrl: './dettagli.component.html',  // Template HTML associato
  styleUrl: './dettagli.component.scss'      // Stili CSS/SCSS associati
})
export class DettagliComponent implements OnInit {


  
  // ======================================================
  // INPUT ricevuto dal componente padre (dati dell’immagine)
  // ======================================================
  @Input() dettaglio!: {
    display_name: string;   // Nome visualizzato (es. titolo immagine)
    url: string;            // URL immagine da visualizzare
  };

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

      isMobile = false;
constructor(private breakpointObserver: BreakpointObserver) {}

  ngOnInit(): void {
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
