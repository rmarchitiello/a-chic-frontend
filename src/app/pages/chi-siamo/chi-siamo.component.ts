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
    // Osserva se la larghezza dello schermo è inferiore o uguale a 768px
    this.breakpointObserver.observe(['(max-width: 768px)'])
      .subscribe(result => {
        this.isMobile = result.matches;
      });

    // Esegue scroll in alto all'apertura del componente
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}
