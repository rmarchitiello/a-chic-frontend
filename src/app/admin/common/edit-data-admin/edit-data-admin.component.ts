/*
  Questo componente viene utilizzato per editare i metadati (context) associati a un file.
  È usato in due casi principali:
  - Durante l'upload, per permettere all'utente di modificare i metadati prima dell'invio.
  - Per modificare i metadati di file già presenti su Cloudinary (via EditDataComponent).
*/

import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// Moduli Angular Material
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
// Interfaccia context usata nel componente padre
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

  // Metadati in input (modificabili via form)
  mapContextInputData: { [key: string]: string } = {};

  // Backup per annullamento modifiche
  backUpContext: { [key: string]: string } = {};

  // Lista di tutte le chiavi correnti, usata nel *ngFor del template
  tutteLeChiavi: string[] = [];

  // Mappa delle etichette leggibili da mostrare (es. display_name → Nome)
  etichetteChiavi: { [chiave: string]: string } = {};

  // Chiavi protette: non modificabili o cancellabili
  chiaviProtette: string[] = ['display_name', 'descrizione', 'quantita'];


  //controlla se chiave valore del metadato aggiunto ci sono:


  constructor(
    private dialogRef: MatDialogRef<EditDataAdminComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { file: File; context: { [key: string]: string } }
  ) {}

  ngOnInit(): void {
    // Clono il context in input per modificarlo localmente
    this.mapContextInputData = { ...this.data.context };

    // Salvo una copia per eventuale annullamento modifiche
    this.backUpContext = { ...this.mapContextInputData };

    // Popolo la lista di chiavi da visualizzare (escludendo quelle tecniche)
    this.tutteLeChiavi = Object.keys(this.mapContextInputData).filter(k => k !== 'type');

    // Creo la mappa di etichette leggibili
    this.etichetteChiavi = this.tutteLeChiavi.reduce((acc, chiave) => {
      acc[chiave] =
        chiave === 'display_name' ? 'Nome' :
        chiave === 'descrizione' ? 'Descrizione' :
        chiave === 'quantita' ? 'Quantità' :
        this.normalizzaChiave(chiave);
      return acc;
    }, {} as { [key: string]: string });

    console.log('[EditDataAdmin] Metadati ricevuti:', this.mapContextInputData);
  }

  /** Restituisce true se una chiave è tra quelle protette */
  isChiaveProtetta(chiave: string): boolean {
    return this.chiaviProtette.includes(chiave);
  }

/** Aggiunge un nuovo metadato con una chiave temporanea univoca */

    /** Stato interno dei due campi */
  private chiaveCompilata  = true;
  private valoreCompilato = true;

  /** Event handler per l’input “chiave” */
  onCheckChiave(value: string): void {
    this.chiaveCompilata = this.isNonEmpty(value);
    console.log('Chiave compilata:', this.chiaveCompilata);
  }

  /** Event handler per l’input “valore” */
  onCheckValore(value: string): void {
    this.valoreCompilato = this.isNonEmpty(value);
    console.log('Valore compilato:', this.valoreCompilato);
  }


  /** Utile anche per futuri controlli */
  private isNonEmpty(s: string | null | undefined): boolean {
    return !!s?.trim();
  }

aggiungiMetadato(): void {

  // 1) se l’utente sta lasciando a metà la riga corrente, avvisa e termina
  if (!(this.chiaveCompilata && this.valoreCompilato)) {
    alert('Compila prima CHIAVE e VALORE della riga corrente');
    return;
  }


  const chiavi = Object.keys(this.mapContextInputData);
  const chiaviPulite = chiavi.map(k => k.trim().toLowerCase()).filter(k => k !== '');
  const chiaviUniche = new Set(chiaviPulite);

  // Blocco in caso di chiavi duplicate o vuote
  if (chiaviPulite.length !== chiaviUniche.size) {
    alert('Attenzione: ci sono chiavi duplicate o vuote.');
    return;
  }

  // Creo una nuova chiave temporanea univoca
  const nuovaChiave = ' ';
  this.mapContextInputData[nuovaChiave] = ''; // valore iniziale vuoto

  // Aggiungo la nuova chiave all’elenco
  this.tutteLeChiavi.push(nuovaChiave);

  // Assegno l’etichetta leggibile per la nuova chiave
  this.etichetteChiavi[nuovaChiave] = this.normalizzaChiave(nuovaChiave);

  // Imposto il flag per disabilitare il pulsante fino a completamento

  console.log('Aggiunto nuovo metadato:', nuovaChiave);


    this.chiaveCompilata  = false;
    this.valoreCompilato = false;
}

  /** Rimuove il metadato indicato solo se non è protetto */
  rimuoviMetadato(index: number): void {
    const chiaveDaRimuovere = this.tutteLeChiavi[index];
    if (this.isChiaveProtetta(chiaveDaRimuovere)) return;

    delete this.mapContextInputData[chiaveDaRimuovere];
    this.tutteLeChiavi.splice(index, 1);
    delete this.etichetteChiavi[chiaveDaRimuovere];

    console.log('Rimosso metadato:', chiaveDaRimuovere);
  }

  /** Restituisce true se la chiave suggerisce un campo numerico (prezzo, sconto, quantita) */
  isNumericKey(key: string): boolean {
    if (!key) return false;
    const lower = key.toLowerCase();
    return lower.includes('prezzo') || lower.includes('sconto') || lower.includes('quantita');
  }

  /** Verifica se la chiave corrente è duplicata (usata per evidenziare l'errore nel form) */
  isChiaveDuplicata(chiave: string, indexCorrente: number): boolean {
    return this.tutteLeChiavi.filter((k, i) => k === chiave && i !== indexCorrente).length > 0;
  }

  /** Chiude il dialog salvando i metadati normalizzati */
  conferma(): void {
    // Validazione quantità
    const quantitaNum = Number(this.mapContextInputData['quantita']);
    if ('quantita' in this.mapContextInputData && (isNaN(quantitaNum) || quantitaNum < 0)) {
      alert('Inserisci una quantità valida maggiore o uguale a 0.');
      return;
    }

    const contextFinale: MediaContext = {};

    // Normalizzo e includo solo chiavi con valore non vuoto
    Object.entries(this.mapContextInputData).forEach(([chiave, valore]) => {
      const k = chiave.trim();
      const v = valore?.trim();
      if (k && v) {
        contextFinale[this.normalizzaChiave(k)] = v;
      }
    });

    this.dialogRef.close(contextFinale);
  }

  /** Chiude il dialog senza salvare le modifiche */
  chiudiDialog(): void {
    this.mapContextInputData = { ...this.backUpContext };
    console.log('Modifiche annullate. Metadati ripristinati.', this.mapContextInputData);
    this.dialogRef.close(this.backUpContext);
  }

  /** Converte una chiave tecnica (es. display_name, pippoFranco) in etichetta leggibile */
  normalizzaChiave(chiave: string): string {
    if (!chiave) return '';
    const conSpazi = chiave
      .replace(/_/g, ' ')                   // underscore → spazio
      .replace(/([a-z])([A-Z])/g, '$1 $2'); // camelCase → spazio
    return conSpazi
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  /** Rende maiuscola la prima lettera del valore, senza alterare il resto */
  normalizzaValore(val: string): string {
    if (!val) return '';
    return val.charAt(0).toUpperCase() + val.slice(1);
  }

  



}
