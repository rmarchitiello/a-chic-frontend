import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { CommonModule, KeyValue } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MediaContext } from '../../../../pages/home/home.component';
import { SharedDataService } from '../../../../services/shared-data.service';
import { AdminService } from '../../../../services/admin.service';

@Component({
  selector: 'app-view-or-edit-descrizione',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatIconModule,
    MatButtonModule
  ],
  templateUrl: './view-or-edit-metadata.component.html',
  styleUrls: ['./view-or-edit-metadata.component.scss']
})
export class ViewOrEditMetadataComponent implements OnInit {

  // Modalità di modifica attiva/inattiva
  isEditing = false;

  // Mostra il pulsante "Conferma" se ci sono modifiche
  modificaInAttesaDiConferma = false;

  // URL dell'immagine a cui sono associati i metadati
  urlFrontaleInput: string = '';

  // Contesto originale, serve per ripristino
  originalContext: MediaContext = {};

  // Mappa stringa/stringa da usare con [(ngModel)] e *ngFor
  mediaContextMap: Record<string, string> = {};

  constructor(
    @Inject(MAT_DIALOG_DATA)
    public data: { urlFrontale: string; context: MediaContext },
    private dialogRef: MatDialogRef<ViewOrEditMetadataComponent>,
    private sharedDataService: SharedDataService,
    private adminService: AdminService
  ) {}

  ngOnInit(): void {
    // Inizializzo dati passati dal componente padre
    this.urlFrontaleInput = this.data.urlFrontale;
    this.originalContext = { ...this.data.context };

    // Converto ogni valore in stringa per sicurezza
    this.mediaContextMap = Object.fromEntries(
      Object.entries(this.data.context).map(([key, value]) => [key, String(value ?? '')])
    );
  }

  /**
   * Abilita la modalità modifica
   */
  attivaModifica(): void {
    this.isEditing = true;
    this.modificaInAttesaDiConferma = false;
  }

  /**
   * Salva le modifiche localmente e abilita il pulsante "Conferma"
   */
  salvaModifica(): void {
    this.isEditing = false;

    const nuovoContext = JSON.stringify(this.mediaContextMap);
    const originale = JSON.stringify(
      Object.fromEntries(
        Object.entries(this.originalContext).map(([k, v]) => [k, String(v ?? '')])
      )
    );

    this.modificaInAttesaDiConferma = nuovoContext !== originale;
  }

  /**
   * Ripristina i valori originali
   */
  annullaModifica(): void {
    this.mediaContextMap = Object.fromEntries(
      Object.entries(this.originalContext).map(([key, value]) => [key, String(value ?? '')])
    );
    this.isEditing = false;
    this.modificaInAttesaDiConferma = false;
  }

  /**
   * Invia i nuovi metadati al backend e chiude il dialog
   */
  confermaModificaContext(): void {
    const url = this.urlFrontaleInput;

    // Ricostruisco un MediaContext valido a partire dalla mappa
    const contextAggiornato: MediaContext = { ...this.mediaContextMap };
    console.log("Context Aggiornato: ", contextAggiornato);
    this.adminService.updateImageMetadata(url, contextAggiornato, true).subscribe({
      next: () => {
        this.sharedDataService.notifyConfigCacheIsChanged();

        // Chiudo il dialog restituendo i nuovi dati
        this.dialogRef.close({
          context: contextAggiornato,
          urlFrontale: url
        });
      },
      error: err => {
        console.error('Errore durante aggiornamento dei metadati:', err);
        // (opzionale) mostrare messaggio di errore visivo
      }
    });
  }

  /**
   * Chiude il dialog senza apportare modifiche
   */
  chiudiDialog(): void {
    this.dialogRef.close();
  }

  /**
   * Permette il tracking degli elementi in ngFor per evitare rigenerazione
   */
  trackByKey(index: number, item: KeyValue<string, string>): string {
    return item.key;
  }

  /**
   * Disabilita ordinamento alfabetico delle chiavi in ngFor
   */
  keyvalueCompare = (a: KeyValue<string, string>, b: KeyValue<string, string>): number => {
    return 0;
  };

  /**
   * Determina se il campo è numerico (quantita, prezzo, altezza...)
   */
  isCampoNumerico(chiave: string): boolean {
    return ['quantita', 'prezzo', 'altezza'].includes(chiave.toLowerCase());
  }
}
