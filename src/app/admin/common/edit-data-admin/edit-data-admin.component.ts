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
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatSnackBar } from '@angular/material/snack-bar';

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
    MatIcon,
    MatSnackBarModule
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
    @Inject(MAT_DIALOG_DATA) public data: { file: File; context: { [key: string]: string } },
    private snackBar: MatSnackBar
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
  this.chiaveCompilata = !!value?.trim();
}

onCheckValore(value: string): void {
  this.valoreCompilato = !!value?.trim();
}


aggiungiMetadato(): void {

  // 1) se l’utente sta lasciando a metà la riga corrente, avvisa e termina
  if (!(this.chiaveCompilata && this.valoreCompilato)) {
this.snackBar.open('Compila prima CHIAVE e VALORE della riga corrente', 'Chiudi', {
  duration: 4000,
});
    return;
  }

  // 2) Controlla se ci sono chiavi duplicate
  const chiavi = Object.keys(this.mapContextInputData);
  const chiaviPulite = chiavi.map(k => k.trim().toLowerCase()).filter(k => k !== '');
  const chiaviUniche = new Set(chiaviPulite);

  if (chiaviPulite.length !== chiaviUniche.size) {
this.snackBar.open('Attenzione: ci sono chiavi duplicate o vuote.', 'Chiudi', {
  duration: 4000,
});
    return;
  }

  // 3) Crea una chiave temporanea univoca
  const nuovaChiave = `__temp_${Date.now()}`;
  this.mapContextInputData[nuovaChiave] = '';

  // 4) Aggiorna tutte le strutture collegate
  this.tutteLeChiavi.push(nuovaChiave);
  this.etichetteChiavi[nuovaChiave] = this.normalizzaChiave(nuovaChiave);

  // 5) Blocca ulteriori aggiunte finché l’utente non compila la nuova riga
  this.chiaveCompilata = false;
  this.valoreCompilato = false;

  console.log('Aggiunto nuovo metadato:', nuovaChiave);
}


  /** Rimuove il metadato indicato solo se non è protetto */
rimuoviMetadato(index: number): void {
  const chiaveDaRimuovere = this.tutteLeChiavi[index];

  // 1. blocco eventuale su chiavi protette
  if (this.isChiaveProtetta(chiaveDaRimuovere)) return;

  // 2. rimozione vera e propria
  delete this.mapContextInputData[chiaveDaRimuovere];
  this.tutteLeChiavi.splice(index, 1);
  delete this.etichetteChiavi[chiaveDaRimuovere];

  // 3. ***aggiornamento dei flag***
  if (this.tutteLeChiavi.length === 0) {
    // Nessuna riga rimasta → lascio l’utente creare la prossima
    this.chiaveCompilata  = true;
    this.valoreCompilato = true;
  } else {
    // Calcolo i flag sulla NUOVA “riga corrente” (ultima dell’elenco)
    const ultimaChiave = this.tutteLeChiavi[this.tutteLeChiavi.length - 1];
    this.chiaveCompilata  = !!ultimaChiave.trim();
    this.valoreCompilato = !!this.mapContextInputData[ultimaChiave]?.trim();
  }

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

/** Chiude il dialog solo se tutti i metadati sono validi */
conferma(): void {

  /* ───────────────────────────────────────────────────────
     1) CONTROLLA CHIAVI / VALORI VUOTI
     Verifica che ogni coppia chiave/valore abbia contenuto.
     Serve a evitare conferme con righe incomplete.
  ─────────────────────────────────────────────────────── */
  const righeIncomplete = Object.entries(this.mapContextInputData).filter(
    ([k, v]) => k.trim() === '' || v?.trim() === ''
  );

  if (righeIncomplete.length > 0) {
  this.snackBar.open('Compila prima CHIAVE e VALORE della riga corrente', 'Chiudi', {
    duration: 4000,
  });    return;
  }

  /* ───────────────────────────────────────────────────────
     2) CONTROLLA CHIAVI DUPLICATE
     Usa la versione "pulita" (trim e lowercase) per evitare collisioni
     tra chiavi come "Materiale" e "materiale".
  ─────────────────────────────────────────────────────── */
  const chiaviPulite = Object.keys(this.mapContextInputData)
    .map(k => k.trim().toLowerCase());

  const duplicate = chiaviPulite.find(
    (val, idx, arr) => arr.indexOf(val) !== idx
  );

  if (duplicate) {
this.snackBar.open(`La chiave "${duplicate}" è duplicata: modificala prima di confermare.`, 'Chiudi', {
  duration: 4000,
});
    return;
  }

  /* ───────────────────────────────────────────────────────
     3) VALIDAZIONE QUANTITÀ
     Verifica che la chiave "quantita" esista, sia numerica e ≥ 0.
  ─────────────────────────────────────────────────────── */
  const quantitaStr = this.mapContextInputData['quantita'];
  const quantitaNum = Number(quantitaStr);

  if (
    quantitaStr === undefined ||                  // campo mancante
    quantitaStr.trim() === '' ||                 // campo vuoto
    isNaN(quantitaNum) ||                        // non è un numero
    quantitaNum < 0                              // numero negativo
  ) {
this.snackBar.open('Inserisci una QUANTITÀ valida (numero ≥ 0).', 'Chiudi', {
  duration: 4000,
});    return;
  }

  /* ───────────────────────────────────────────────────────
     4) COSTRUISCI OGGETTO FINALE DA RITORNARE
     Crea una copia pulita del contesto, con chiavi e valori trim.
     Nessuna normalizzazione formattata qui: si usano le chiavi effettive.
  ─────────────────────────────────────────────────────── */
  const contextFinale: MediaContext = {};

  Object.entries(this.mapContextInputData).forEach(([chiave, valore]) => {
    const k = chiave.trim();   // chiave reale usata come oggetto
    const v = valore.trim();   // valore normalizzato
    contextFinale[k] = v;
  });

  // ✅ Chiude il dialog e restituisce i metadati validati
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

  trackByIndex(index: number, item: string): number {
  return index;
}


  /**
 * Gestisce la modifica del nome di una chiave da parte dell’utente.
 * Quando l’utente cambia il nome di un metadato (es. da '' a 'materiale'),
 * aggiorna l'oggetto `mapContextInputData` spostando il valore alla nuova chiave,
 * eliminando la vecchia, e aggiornando tutte le strutture correlate.
 */
onRenameChiave(index: number, nuovaChiave: string): void {
  const chiavi = Object.keys(this.mapContextInputData);
  const chiaveVecchia = chiavi[index];

  const nuovaChiavePulita = nuovaChiave.trim();

  // Se la nuova chiave è vuota o identica a quella vecchia, esco
  if (!nuovaChiavePulita || chiaveVecchia === nuovaChiavePulita) return;

  // Se esiste già, non permetto la sovrascrittura
  if (this.mapContextInputData.hasOwnProperty(nuovaChiavePulita)) {
    this.snackBar.open('Chiave già esistente', 'Chiudi', { duration: 3000 });
    return;
  }

  // Copio il valore dalla vecchia chiave, poi elimino la vecchia
  this.mapContextInputData[nuovaChiavePulita] = this.mapContextInputData[chiaveVecchia];
  delete this.mapContextInputData[chiaveVecchia];

  // Aggiorno anche i flag se vuoi:
  this.onCheckChiave(nuovaChiavePulita);
}


getChiave(index: number): string {
  return Object.keys(this.mapContextInputData)[index];
}


  



}
