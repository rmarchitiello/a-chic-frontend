import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// Angular Material Modules
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';

@Component({
  selector: 'app-edit-context-before-upload',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIcon
  ],
  templateUrl: './edit-context-before-upload.component.html',
  styleUrl: './edit-context-before-upload.component.scss'
})
export class EditContextBeforeUploadComponent {
  // Campi compilabili dall'utente nel popup
  nome_file: string = '';
  descrizione: string = '';
  quantita: string = '0';
  angolazione: string = '';

  constructor(private dialogRef: MatDialogRef<EditContextBeforeUploadComponent>) {}

  /**
   * Metodo chiamato al click su "Conferma"
   * Chiude il dialog e restituisce i dati inseriti
   */
  conferma(): void {
  const quantitaNum = Number(this.quantita);
  if (isNaN(quantitaNum) || quantitaNum < 0) {
    alert('Inserisci una quantità valida maggiore o uguale a 0.');
    return;
  }

  this.dialogRef.close({
    nome_file: this.nome_file,
    descrizione: this.descrizione,
    quantita: this.quantita,
    angolazione: this.angolazione
  });
}


  /**
   * Metodo chiamato al click su "Annulla"
   * Chiude il dialog senza restituire nulla
   */
  annulla(): void {
    this.dialogRef.close();
  }
}
