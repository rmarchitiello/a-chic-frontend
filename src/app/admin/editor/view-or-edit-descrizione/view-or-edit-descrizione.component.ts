import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-view-or-edit-descrizione',
  standalone: true,
  imports: [
    CommonModule,       // Per *ngIf, *ngFor, ecc.
    FormsModule,        // Per [(ngModel)] sulla textarea
    MatIconModule,      // Per <mat-icon>
    MatButtonModule     // Per <button mat-button> ecc.
  ],
  templateUrl: './view-or-edit-descrizione.component.html',
  styleUrls: ['./view-or-edit-descrizione.component.scss']
})
export class ViewOrEditDescrizioneComponent {
  isEditing = false;                   // Modalità modifica attiva/inattiva
  descrizioneModificata: string;       // Copia modificabile della descrizione iniziale

  constructor(
    @Inject(MAT_DIALOG_DATA)
    public data: { descrizione: string; urlFrontale: string }, // Dati in ingresso: testo + url
    private dialogRef: MatDialogRef<ViewOrEditDescrizioneComponent>
  ) {
    // Inizializzo la descrizione locale col valore ricevuto
    this.descrizioneModificata = data.descrizione;
  }

  // Entra in modalità modifica
  attivaModifica(): void {
    this.isEditing = true;
  }

  // Esce dalla modalità modifica mantenendo il nuovo testo
  salvaModifica(): void {
    this.isEditing = false;
  }

  // Ripristina la descrizione iniziale e torna in visualizzazione
  annullaModifica(): void {
    this.descrizioneModificata = this.data.descrizione;
    this.isEditing = false;
  }

  // Chiude il popup e invia dati SOLO se la descrizione è cambiata e non vuota
  confermaDescrizioneAggiornata(): void {
    const nuovaDescrizione = this.descrizioneModificata?.trim();

    // Se la descrizione è cambiata e non è vuota, invio i dati
    if (nuovaDescrizione && nuovaDescrizione !== this.data.descrizione) {
      this.dialogRef.close({
        descrizione: nuovaDescrizione,
        urlFrontale: this.data.urlFrontale
      });
    } else {
      // Altrimenti chiudo normalmente senza restituire nulla
      this.dialogRef.close();
    }
  }

  // Metodo generico per chiudere il dialog senza inviare dati
  chiudiDialog(): void {
    this.dialogRef.close();
  }
}
