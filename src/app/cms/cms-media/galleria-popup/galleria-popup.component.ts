import { Component, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Inject } from '@angular/core';
import { ImmagineMeta } from '../cms-media.component';  // Import dell'interfaccia per i dati delle immagini
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-galleria-popup',
  standalone: true,
  templateUrl: './galleria-popup.component.html',
  styleUrl: './galleria-popup.component.scss',
  imports: [CommonModule, MatIconModule]
})
export class GalleriaPopupComponent implements OnInit {

  // Array di immagini (angolazioni) ricevute dal componente padre tramite dialog
  immaginiMetaDaMostrare: ImmagineMeta[] = [];

  // Indice corrente dell'immagine visualizzata nella galleria
  currentIndex = 0;

  // Ricezione dei dati passati dal componente padre attraverso MAT_DIALOG_DATA
  constructor(@Inject(MAT_DIALOG_DATA) public data: ImmagineMeta[]) {}

  // Durante l'inizializzazione assegno le immagini ricevute alla variabile locale
  ngOnInit(): void {
    this.immaginiMetaDaMostrare = this.data;
    console.log("Immagini meta ricevute: ", this.immaginiMetaDaMostrare);
  }

  // Mostra l'immagine precedente nella galleria
  prevImage(): void {
    if (this.currentIndex > 0) {
      this.currentIndex--;
    }
  }

  // Mostra l'immagine successiva nella galleria
  nextImage(): void {
    if (this.currentIndex < this.immaginiMetaDaMostrare.length - 1) {
      this.currentIndex++;
    }
  }
}
