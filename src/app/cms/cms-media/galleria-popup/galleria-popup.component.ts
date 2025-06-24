import { Component, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Inject } from '@angular/core';
import { ImmagineMeta } from '../cms-media.component';  // Import dell'interfaccia per i dati delle immagini
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { CmsService } from '../../../services/cms.service';
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
  constructor(@Inject(MAT_DIALOG_DATA) public data: ImmagineMeta[], private cmsService: CmsService) {}

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


  //Metodo che mi permette di cancellare un immagine meta  
  eliminaImmagine(img: ImmagineMeta): void {
  
    const confermato = window.confirm(`Sei sicuro di voler eliminare l'immagine ? `);
    if (!confermato) {
      console.log("Eliminazione annullata dall'utente");
      return;
    }
  
    // Estrae tutte le URL delle immagini da eliminare (dalla proprietà meta)
    const urlDaEliminare = [img.url]; // se parti da zero
  

    console.log("Immagine da eliminare: ", urlDaEliminare);
  
    // Chiama il servizio per eliminare le immagini e si sottoscrive al risultato
    this.cmsService.deleteImages(urlDaEliminare).subscribe({
      next: (res) => {
        console.log('Eliminazione riuscita:', res);
          // Rimuove l'immagine dall'array
          this.immaginiMetaDaMostrare.splice(this.currentIndex, 1);
            // Se l'indice attuale è oltre l'ultimo elemento, lo decrementa
  if (this.currentIndex >= this.immaginiMetaDaMostrare.length) {
    this.currentIndex = Math.max(0, this.immaginiMetaDaMostrare.length - 1);
  }
      },
      error: (err) => {
        console.error('Errore durante eliminazione immagini:', err);
      }
    });
  }
}
