/*
  QUESTO COMPONENTE viene utilizzato per editare i context quindi i metadata viene usato sia dall'upload per editare i meta
  in fase di upload ma viene usato anche da EditDataComponent per editare i metadata gia caricati prima
*/

import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// Angular Material Modules
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MediaContext } from '../../../pages/home/home.component';

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
  templateUrl: './edit-data-admin.component.html',
  styleUrl: './edit-data-admin.component.scss'
})
export class EditDataAdminComponent implements OnInit {

  // Oggetto contenente i metadati statici (nome_file, descrizione, quantità, angolazione)
  // È un oggetto indicizzato per supportare anche metadati aggiuntivi dinamici
  context: MediaContext  = {
    nome_file: '',
    descrizione: '',
    quantita: '0',
    angolazione: ''
  };

  // Array che rappresenta i metadati personalizzati (chiave-valore)
  altriMetadati: { key: string; value: string }[] = [];

  // Inietto nel costruttore i dati ricevuti dal padre: file e context associato (già salvato)
  constructor(
    private dialogRef: MatDialogRef<EditDataAdminComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { file: File; context: { [key: string]: string } }
  ) {}

  // All’inizializzazione del componente, popolo i campi del form con i metadati già presenti
ngOnInit(): void {
  const ctx = this.data.context || {};

  // Popolo i campi statici
  this.context = {
    display_name: ctx['display_name'] || '',
    descrizione: ctx['descrizione'] || '',
    quantita: ctx['quantita'] || '0',
    angolazione: ctx['angolazione'] || ''
  };

  // Tutti gli altri metadati vanno nei dinamici
  this.altriMetadati = Object.entries(ctx)
    .filter(([key]) => !['display_name', 'descrizione', 'quantita', 'angolazione'].includes(key))
    .map(([key, value]) => ({ key, value }));
    
  console.log("Context statico:", this.context);
  console.log("Metadati dinamici:", this.altriMetadati);
}


  // Aggiunge un nuovo metadato dinamico (se non ci sono chiavi duplicate o vuote)
  aggiungiMetadato(): void {
    const chiaviPulite = this.altriMetadati
      .map(m => m.key?.trim().toLowerCase())
      .filter(k => !!k); // Escludo chiavi vuote

    const chiaviUniche = new Set(chiaviPulite);

    // Se ci sono chiavi duplicate o vuote, blocco l'aggiunta
    if (chiaviPulite.length !== chiaviUniche.size) {
      alert('Attenzione: ci sono chiavi duplicate o vuote nei metadati esistenti.');
      return;
    }

    // Aggiungo un metadato vuoto
    this.altriMetadati.push({ key: '', value: '' });
  }

  // Rimuove un metadato dinamico dato il suo indice
  rimuoviMetadato(index: number): void {
    this.altriMetadati.splice(index, 1);
  }

  // Metodo chiamato quando l'utente conferma e clicca "Salva"
  conferma(): void {
    const quantitaNum = Number(this.context['quantita']);

    // Verifico che la quantità sia un numero >= 0
    if (isNaN(quantitaNum) || quantitaNum < 0) {
      alert('Inserisci una quantità valida maggiore o uguale a 0.');
      return;
    }

    // Aggiungo i metadati dinamici al contesto principale (normalizzando la chiave)
    this.altriMetadati.forEach(m => {
      const chiaveOriginale = m.key?.trim();
      const valore = m.value?.trim();

      if (chiaveOriginale && valore) {
        const chiaveNormalizzata = this.normalizzaChiave(chiaveOriginale);
        this.context[chiaveNormalizzata] = valore;
      }
    });

    // Restituisco il contesto al componente padre
    this.dialogRef.close(this.context);
  }

  // Metodo chiamato quando l'utente annulla l'operazione
  annulla(): void {
    this.dialogRef.close();
  }

  // Ritorna true se una chiave (es. 'prezzo') sembra essere di tipo numerico
  isNumericKey(key: string): boolean {
    if (!key) return false;
    const lower = key.toLowerCase();
    return lower.includes('prezzo') || lower.includes('sconto');
  }

  // Rende coerente la chiave del metadato: minuscolo + spazi convertiti in underscore
  private normalizzaChiave(chiave: string): string {
    return chiave.trim().toLowerCase().replace(/\s+/g, '_');
  }

  // Verifica se la chiave all’indice `i` è già presente tra i dinamici o tra i campi statici
  isChiaveDuplicata(i: number): boolean {
    const currentKey = this.altriMetadati[i]?.key?.trim().toLowerCase();
    if (!currentKey) return false;

    const chiaviStatiche = ['nome_file', 'descrizione', 'quantita', 'angolazione'];

    // Controllo duplicati tra i metadati dinamici (escludendo se stesso)
    const duplicatoTraDinamici = this.altriMetadati
      .filter((_, idx) => idx !== i)
      .some(m => m.key?.trim().toLowerCase() === currentKey);

    // Controllo duplicato rispetto alle chiavi statiche
    const duplicatoConStatici = chiaviStatiche.includes(currentKey);

    return duplicatoTraDinamici || duplicatoConStatici;
  }

  // Ritorna true se almeno una chiave dinamica è duplicata
  hasChiaviDuplicate(): boolean {
    return this.altriMetadati.some((_, i) => this.isChiaveDuplicata(i));
  }
}
