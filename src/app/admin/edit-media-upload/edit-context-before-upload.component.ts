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
  context: { [key: string]: string } = {
    nome_file: '',
    descrizione: '',
    quantita: '0',
    angolazione: ''
  };

  // Lista dinamica dei metadati aggiuntivi
  altriMetadati: { key: string; value: string }[] = [];

    // Aggiungi una nuova coppia vuota
aggiungiMetadato(): void {
  const chiaviPulite = this.altriMetadati
    .map(m => m.key?.trim().toLowerCase())
    .filter(k => !!k); // Esclude chiavi vuote/null

  const chiaviUniche = new Set(chiaviPulite);

  // Se ci sono chiavi duplicate o chiavi vuote, blocco
  if (chiaviPulite.length !== chiaviUniche.size) {
    alert('Attenzione: ci sono chiavi duplicate o vuote nei metadati esistenti.');
    return;
  }

  // Se tutto ok, aggiungo una nuova riga vuota
  this.altriMetadati.push({ key: '', value: '' });
}


  // Rimuovi una coppia per indice
  rimuoviMetadato(index: number): void {
    this.altriMetadati.splice(index, 1);
  }

  constructor(private dialogRef: MatDialogRef<EditContextBeforeUploadComponent>) {}

  /**
   * Metodo chiamato al click su "Conferma"
   * Chiude il dialog e restituisce i dati inseriti
   */
conferma(): void {
  const quantitaNum = Number(this.context['quantita']);

  // Validazione quantità: deve essere un numero >= 0
  if (isNaN(quantitaNum) || quantitaNum < 0) {
    alert('Inserisci una quantità valida maggiore o uguale a 0.');
    return;
  }

  // Aggiunta metadati dinamici con chiave normalizzata
  this.altriMetadati.forEach(m => {
    const chiaveOriginale = m.key?.trim();
    const valore = m.value?.trim();

    if (chiaveOriginale && valore) {
      const chiaveNormalizzata = this.normalizzaChiave(chiaveOriginale);
      this.context[chiaveNormalizzata] = valore;
    }
  });

  // Restituisce l'intero oggetto context al componente padre
  this.dialogRef.close(this.context);
}

  /**
   * Metodo chiamato al click su "Annulla"
   * Chiude il dialog senza restituire nulla
   */
  annulla(): void {
    this.dialogRef.close();
  }

//identifica se una chiave numerica ecc
  isNumericKey(key: string): boolean {
  if (!key) return false;
  const lower = key.toLowerCase();
  return lower.includes('prezzo') || lower.includes('sconto');
}

//esempio prezzo scontato  sarà prezzo_scontato
private normalizzaChiave(chiave: string): string {
  return chiave.trim().toLowerCase().replace(/\s+/g, '_');
}

//non aggiungo chiavi duplicate
// Verifica se la chiave all'indice i è duplicata tra gli altri metadati ma anche tra le static key nome_file angolazione descrizione e quantita 
isChiaveDuplicata(i: number): boolean {
  const currentKey = this.altriMetadati[i]?.key?.trim().toLowerCase();
  if (!currentKey) return false;

  const chiaviStatiche = ['nome_file', 'descrizione', 'quantita', 'angolazione'];

  // Verifica duplicati tra i metadati dinamici (escludendo se stesso)
  const duplicatoTraDinamici = this.altriMetadati
    .filter((_, idx) => idx !== i)
    .some(m => m.key?.trim().toLowerCase() === currentKey);

  // Verifica se la chiave corrisponde a uno dei campi statici
  const duplicatoConStatici = chiaviStatiche.includes(currentKey);

  return duplicatoTraDinamici || duplicatoConStatici;
}


// Restituisce true se almeno una chiave dinamica è duplicata
hasChiaviDuplicate(): boolean {
  return this.altriMetadati.some((_, i) => this.isChiaveDuplicata(i));
}


}
