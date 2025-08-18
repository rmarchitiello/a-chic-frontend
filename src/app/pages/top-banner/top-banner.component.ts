import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BreakpointObserver } from '@angular/cdk/layout';

@Component({
  selector: 'app-top-banner',
  standalone: true,               // componente standalone (senza modulo dedicato)
  imports: [CommonModule],        // importa CommonModule per *ngIf, *ngFor ecc.
  templateUrl: './top-banner.component.html',
  styleUrls: ['./top-banner.component.scss']
})
export class TopBannerComponent implements OnInit {

  // Flag che indica se l’utente è su mobile (<= 768px)
  isMobile = false;

  // Testo da mostrare nel banner (duplicato in HTML per lo scroll continuo)
  bannerText: string =
    '🚧 Sito in aggiornamento // Tutti gli articoli sono sold out // Seguici sui social per restare aggiornati sulle prossime novità ✨';

  constructor(private breakpointObserver: BreakpointObserver) {}

  ngOnInit(): void {
    // Osserva i cambi di dimensione dello schermo
    // Se la viewport è <= 768px imposta isMobile = true
    this.breakpointObserver
      .observe(['(max-width: 768px)'])
      .subscribe(result => {
        this.isMobile = result.matches;
      });
  }
}
