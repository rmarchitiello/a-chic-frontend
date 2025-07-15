import { Component, OnInit } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { BreakpointObserver } from '@angular/cdk/layout'; // Necessario per rilevare la dimensione dello schermo
import { CommonModule } from '@angular/common';
@Component({
  selector: 'app-chi-siamo',
  standalone: true,
  imports: [MatCardModule, CommonModule],
  templateUrl: './chi-siamo.component.html',
  styleUrls: ['./chi-siamo.component.scss']
})
export class ChiSiamoComponent implements OnInit {

  // Variabile che indica se la visualizzazione è su dispositivo mobile
  isMobile: boolean = false;

  constructor(private breakpointObserver: BreakpointObserver) {}

  ngOnInit(): void {
        // Esegue scroll in alto all'apertura del componente
    window.scrollTo({ top: 0, behavior: 'smooth' });
    // Osserva se la larghezza dello schermo è inferiore o uguale a 768px
    this.breakpointObserver.observe(['(max-width: 768px)'])
      .subscribe(result => {
        this.isMobile = result.matches;
      });


  }



  siteUrl   = 'https://www.a-chic.it';   // ← metti il dominio definitivo
  siteTitle = 'A-Chic – Borse fatte a mano';
  siteText  = 'Scopri le borse all’uncinetto di A-Chic!';

shareSite(): void {
  const shareData = {
    title: this.siteTitle,
    text : this.siteText,
    url  : this.siteUrl
  };

  /* -------------------------------------------------------------
     1) Browser moderno con API Web Share apre airdrop gmail whats app tutto sempre se esiste sull iphone, altrimenti via web normale con const waUrl
     ------------------------------------------------------------- */
  if (navigator.share) {
    navigator
      .share(shareData)
      .catch(err => {
        // L’utente può annullare oppure si può verificare un errore.
        // Non è grave: non fare altro che loggare in console.
        console.debug('Condivisione annullata / errore:', err);
      });
    return;
  }

  /* -------------------------------------------------------------
     2) Fallback: apre WhatsApp Web con testo pre-compilato
     ------------------------------------------------------------- */
  const waUrl =
    'https://wa.me/?text=' +
    encodeURIComponent(`${this.siteText} ${this.siteUrl}`);

  window.open(waUrl, '_blank');
}
}
