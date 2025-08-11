//per il momento mostro solo la descrizione

import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { MediaContext } from '../../../app.component';
import { MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
@Component({
  selector: 'app-view-metadata',
  standalone: true,
  imports: [CommonModule,MatDialogModule,MatIconModule,MatTooltipModule],
  templateUrl: './view-metadata.component.html',
  styleUrls: ['./view-metadata.component.scss']
})
export class ViewMetadata implements OnInit {

  // URL dell'immagine da visualizzare nel popup
  urlFrontaleInput: string = '';

  // Mappa dei metadati, usata per costruire il contenuto visualizzabile
  mediaContextMap: MediaContext = {};

  constructor(
    @Inject(MAT_DIALOG_DATA)
    public data: { urlFrontale: string; context: MediaContext },
    private dialogRef: MatDialogRef<ViewMetadata>
  ) {}

  /**
   * Inizializzazione del componente: recupera l'URL e i metadati dal dialog.
   */
  ngOnInit(): void {
    this.urlFrontaleInput = this.data.urlFrontale;
    this.mediaContextMap = { ...this.data.context };
  }

  /**
   * Chiude il popup senza salvare nulla.
   */
  chiudiDialog(): void {
    this.dialogRef.close();
  }

  /**
   * Restituisce solo la chiave 'descrizione', se presente.
   * Questo metodo può essere esteso per mostrare anche altri metadati.
   */
  contextVisualizzabile(): { key: string; value: string }[] {
    return Object.entries(this.mediaContextMap)
      .filter(([key, value]) => key === 'descrizione' && value !== undefined)
      .map(([key, value]) => ({ key, value: value! }));
  }


  /**
 * Restituisce la chiave formattata in modo leggibile.
 * Es: 'display_name' -> 'Display name'
 */
normalizzaChiave(chiave: string): string {
  if (!chiave) return '';
  // Sostituisce underscore con spazi e mette in maiuscolo la prima lettera
  return chiave.replace(/_/g, ' ').replace(/^./, c => c.toUpperCase());
}

/**
 * Metodo di ottimizzazione per *ngFor: restituisce la chiave del metadato come identificativo univoco.
 * Aiuta Angular a tracciare meglio gli elementi nella lista.
 */
trackByKey(index: number, item: { key: string; value: string }): string {
  return item.key;
}

}
