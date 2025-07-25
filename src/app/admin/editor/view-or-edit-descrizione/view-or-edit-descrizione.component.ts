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
  modificaInAttesaDiConferma = false;

  constructor(
    @Inject(MAT_DIALOG_DATA)
    public data: { descrizione: string; urlFrontale: string }, // Dati in ingresso: testo + url
    private dialogRef: MatDialogRef<ViewOrEditDescrizioneComponent>
  ) {
    // Inizializzo la descrizione locale col valore ricevuto
    this.descrizioneModificata = data.descrizione;
  }

  // Attiva la modalità di modifica del testo.
// Resetta eventuali modifiche non confermate precedentemente.
attivaModifica(): void {
  this.isEditing = true;                    // Mostra la textarea e i pulsanti "Salva" e "Annulla"
  this.modificaInAttesaDiConferma = false; // Nasconde il pulsante "Conferma", se presente
}

// Salva temporaneamente il testo modificato e torna alla visualizzazione.
// Se il nuovo testo è diverso dall'originale, abilita il pulsante "Conferma".
salvaModifica(): void {
  this.isEditing = false; // Esce dalla modalità di modifica

  // Se il testo è stato effettivamente modificato rispetto all'originale
  if (this.descrizioneModificata !== this.data.descrizione) {
    this.modificaInAttesaDiConferma = true; // Abilita il pulsante "Conferma"
  }
}

// Annulla la modifica in corso.
// Ripristina il valore originale e torna alla modalità di visualizzazione.
annullaModifica(): void {
  this.descrizioneModificata = this.data.descrizione; // Ripristina il testo originale
  this.isEditing = false;                             // Esce dalla modalità di modifica
  this.modificaInAttesaDiConferma = false;            // Nasconde il pulsante "Conferma"
}

// Conferma definitivamente la descrizione modificata e chiude il popup.
// Se il testo è stato modificato e non è vuoto, restituisce i dati al chiamante.
// In caso contrario, chiude il dialog senza inviare nulla.
confermaDescrizioneAggiornata(): void {
  const nuovaDescrizione = this.descrizioneModificata?.trim();

  // Verifica che la descrizione sia diversa da quella originale e non vuota
  if (nuovaDescrizione && nuovaDescrizione !== this.data.descrizione) {
    // Chiude il dialog e restituisce i dati modificati
    this.dialogRef.close({
      descrizione: nuovaDescrizione,
      urlFrontale: this.data.urlFrontale
    });
  } else {
    // Se non ci sono modifiche valide, chiude semplicemente il dialog
    this.dialogRef.close();
  }
}

// Chiude il dialog senza salvare né restituire alcun dato.
chiudiDialog(): void {
  this.dialogRef.close();
}

}
