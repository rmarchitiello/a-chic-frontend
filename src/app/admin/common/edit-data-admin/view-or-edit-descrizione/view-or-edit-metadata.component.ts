import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { CommonModule, KeyValue } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MediaContext } from '../../../../pages/home/home.component';
import { SharedDataService } from '../../../../services/shared-data.service';
import { AdminService } from '../../../../services/admin.service';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'app-view-or-edit-descrizione',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule
    
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

  onlyViewInput: boolean = false;

  constructor(
    @Inject(MAT_DIALOG_DATA)
    public data: { urlFrontale: string, onlyView: boolean, context: MediaContext },
    private dialogRef: MatDialogRef<ViewOrEditMetadataComponent>,
    private sharedDataService: SharedDataService,
    private adminService: AdminService
  ) {}

  ngOnInit(): void {
    // Inizializzo dati passati dal componente padre
    this.urlFrontaleInput = this.data.urlFrontale;
    this.originalContext = { ...this.data.context };
    this.onlyViewInput = this.data.onlyView;

    console.log("Il pop up e aperto in modalita no-editing: ", this.onlyViewInput);

    // Converto ogni valore in stringa per sicurezza
    this.mediaContextMap = Object.fromEntries(
      Object.entries(this.data.context).map(([key, value]) => [key, String(value ?? '')])
    );

    console.log("Context in entrata: ", JSON.stringify(this.mediaContextMap));
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
   * Permette il tracking degli elementi in ngFor per evitare rigenerazione perche altrimenti quando andavo a modificare un valore nella form 
   * ricaricava sempre il dom tipo come fa per il tooltip
   */
  trackByKey(index: number, item: KeyValue<string, string>): string {
    return item.key;
  }

/**
 * Restituisce un array di metadati [{ key, value }] modificabili,
 * escludendo i campi 'type' e 'angolazione'.
 * I metadati sono ordinati secondo una priorità stabilita:
 * Nome, Descrizione, Quantità, Prezzo, seguiti da eventuali altri metadati dinamici.
 */
contextModificabile() {
  // Filtro il contesto per escludere le chiavi non modificabili
  const contextFiltrato: MediaContext = Object.fromEntries(
    Object.entries(this.mediaContextMap)
      .filter(([key, _]) => key !== 'type' && key !== 'angolazione')
  );

  // Applico l'ordinamento personalizzato delle chiavi
  return this.ordinaChiaviMetadati(contextFiltrato);
}


/**
 * Restituisce un array di metadati in sola visualizzazione.
 * In questo caso viene restituita solo la chiave 'descrizione', se presente.
 * Utile per mostrare un riepilogo statico e non modificabile del contenuto.
 */
contextVisualizzabile() {
  // Opzionalmente loggo il contenuto per debug
  console.log(JSON.stringify(this.mediaContextMap));

  // Ritorno solo la chiave 'descrizione', se esiste
  return Object.entries(this.mediaContextMap)
    .filter(([key, _]) => key === 'descrizione')
    .map(([key, value]) => ({ key, value }));
}



/**
 * Restituisce un array ordinato di metadati [{ key, value }],
 * con priorità su Nome, Descrizione, Quantità, Prezzo,
 * seguiti da eventuali metadati dinamici.
 */
ordinaChiaviMetadati(context: MediaContext): { key: string; value: string }[] {
  // Ordine prioritario con nomi tecnici (non alias)
  const ordinePrioritario = ['display_name', 'descrizione', 'quantita', 'prezzo'];

  // Estrai tutte le chiavi effettive
  const tutteLeChiavi = Object.keys(context);

  // Ordina prima quelle prioritarie, se presenti
  const chiaviPrioritarie = ordinePrioritario.filter(k => tutteLeChiavi.includes(k));

  // Aggiungi le chiavi dinamiche, escludendo le prioritarie
  const chiaviRestanti = tutteLeChiavi.filter(k => !ordinePrioritario.includes(k));

  // Ritorna in ordine corretto
  return [...chiaviPrioritarie, ...chiaviRestanti].map(k => ({
    key: k,
    value: context[k] ?? ''
  }));
}

/**
   * Converte una chiave tecnica in un'etichetta leggibile.
   * Usa alias per chiavi note, con fallback generico.
   */
  normalizzaChiave(key: string): string {
    if (!key) return '';

    const alias: { [k: string]: string } = {
      display_name: 'Nome',
      descrizione: 'Descrizione',
      quantita: 'Quantità',
      prezzo: 'Prezzo',
      type: 'Tipo',
      angolazione: 'Angolazione'
    };

    return alias[key] || key
      .replace(/_/g, ' ')
      .toLowerCase()
      .replace(/\b\w/g, c => c.toUpperCase());
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
