// Componente Angular per la gestione dell’eliminazione media da Cloudinary
import { Component, OnInit, Inject } from '@angular/core';
import { AdminService } from '../../../services/admin.service';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MediaCollection, MediaContext, MediaMeta } from '../../../pages/home/home.component';

// Estensione dell’interfaccia MediaItem per gestire errori, spinner e stato locale


// Uso MediaMetaConErrore dentro i media della collezione
export interface MediaMetaConErrore extends MediaMeta {
  erroreEliminazione?: boolean;
  dettaglioErrore?: string;
  inEliminazione?: boolean;
}

export interface MediaCollectionConErrore extends MediaCollection {
  items: {
    context: MediaContext;
    media: MediaMetaConErrore[];
  }[]; //  array, come nella definizione originale
}

/* 
  IL JSON DI ESEMPIO DI QUEST INTERFACCIA E COSI CAPIAMO PER OGNI ITEM OVVERO CAROSELLO1 PER OGNI MEDIA DI QUELL ITEM QUALE MEDIA META E ANDATO IN ERRORE
  {
  "folder": "creazioni/borsa-rossa",
  "items": [
    {
      "context": {
        "display_name": "borsa-rossa-001",
        "type": "image",
        "alt": "Borsa rossa artigianale",
        "categoria": "borse",
        "sottocategoria": "rosse"
      },
      "media": [
        {
          "url": "https://res.cloudinary.com/demo/image/upload/v1/borsa-rossa-frontale.jpg",
          "angolazione": "frontale",
          "erroreEliminazione": false,
          "dettaglioErrore": "",
          "inEliminazione": false
        },
        {
          "url": "https://res.cloudinary.com/demo/image/upload/v1/borsa-rossa-lato.jpg",
          "angolazione": "altra",
          "erroreEliminazione": true,
          "dettaglioErrore": "File non trovato su Cloudinary",
          "inEliminazione": false
        }
      ]
    },
    {
      "context": {
        "display_name": "borsa-rossa-002",
        "type": "image",
        "alt": "Borsa rossa con manici",
        "categoria": "borse",
        "sottocategoria": "rosse"
      },
      "media": [
        {
          "url": "https://res.cloudinary.com/demo/image/upload/v1/borsa-rossa-manici.jpg",
          "angolazione": "frontale",
          "erroreEliminazione": false,
          "dettaglioErrore": "",
          "inEliminazione": false
        }
      ]
    }
  ]
}

*/


@Component({
  selector: 'app-delete-data-admin',
  standalone: true,
  imports: [CommonModule, MatTooltipModule, MatIconModule, MatProgressSpinnerModule],
  templateUrl: './delete-data-admin.component.html',
  styleUrl: './delete-data-admin.component.scss'
})
export class DeleteDataAdminComponent implements OnInit {

  // Media da mostrare e gestire (con estensioni di stato)
mediaInput: MediaCollectionConErrore = {
  folder: '',
  items: []
};
  // Flag per mostrare lo spinner globale durante operazioni
  eliminazioneInCorso = false;

  // Flag se non ci sono media
  checkDataIsEmpty = false;

 

  constructor(
    private adminService: AdminService,
    private dialogRef: MatDialogRef<DeleteDataAdminComponent>,
    @Inject(MAT_DIALOG_DATA) public data: MediaCollection
  ) {}

  ngOnInit(): void {
    // Appiattisce le collezioni ricevute in un unico array di media con flag inizializzati
this.mediaInput = {
  ...this.data,
  erroreEliminazione: false,
  dettaglioErrore: '',
  inEliminazione: false
} as MediaCollectionConErrore;



    // Se non ci sono media, chiudi automaticamente il dialog
this.checkDataIsEmpty = !this.mediaInput.items.some(item => item.media.length > 0);
if (this.checkDataIsEmpty) {
  setTimeout(() => this.chiudiDialog(false), 1000);
}
  }

  /**
   * Elimina l’asset attualmente visibile nella card (immagine frontale o laterale selezionata)
   */
eliminaAssetSingolo(displayName: string): void {
  // Trova l'item corrispondente al display_name
  const item = this.mediaInput.items.find(i => i.context.display_name === displayName);
  if (!item) return;

  // Ottiene tutti gli asset associati (come oggetti)
  const assets = this.getAllAssets(item); // MediaMetaConErrore[]
  const currentIndex = this.currentIndexes[displayName] ?? 0;
  const asset = assets[currentIndex];

  if (!asset) return;

  // Chiamata al servizio per eliminare l'asset corrente
  this.adminService.deleteImages([asset.url], true).subscribe({
    next: res => {
      if (res?.success) {
        // Rimuove l'oggetto media con la URL corrispondente
        item.media = item.media.filter(m => m.url !== asset.url);

        // Se non ci sono più media associati, rimuove l'intero item
        if (item.media.length === 0) {
          this.mediaInput.items = this.mediaInput.items.filter(i => i !== item);
        }

        // Aggiorna l'indice corrente se necessario
        const tot = item.media.length;
        this.currentIndexes[displayName] = tot > 0 ? currentIndex % tot : 0;

        // Se non ci sono più item, aggiorna lo stato globale
        if (this.mediaInput.items.length === 0) {
          this.checkDataIsEmpty = true;
        }
      }
    },
    error: err => {
      // Se c'è errore, marca l'asset specifico come fallito
      const mediaErrore = item.media.find(m => m.url === asset.url);
      if (mediaErrore) {
        mediaErrore.erroreEliminazione = true;
        mediaErrore.dettaglioErrore = err?.error?.message || 'Errore durante l’eliminazione';
      }
    }
  });
}




  /**
   * Elimina **tutti** i media e tutti gli asset associati (frontale + laterali)
   */
eliminaTuttiIMedia(): void {
  // Estrae tutte le URL da eliminare dagli oggetti MediaMetaConErrore
  const tutteLeUrl: string[] = this.mediaInput.items.flatMap(item =>
    this.getAllAssets(item).map(m => m.url)
  );

  if (tutteLeUrl.length === 0) return;

  // Mostra spinner o effetto di eliminazione
  this.eliminazioneInCorso = true;

  // Richiama servizio per eliminare tutte le immagini
  this.adminService.deleteImages(tutteLeUrl, true).subscribe({
    next: res => {
      this.eliminazioneInCorso = false;

      if (res?.success) {
        // Pulizia degli item dopo eliminazione riuscita
        this.mediaInput.items = [];
        this.checkDataIsEmpty = true;

        // Chiude il dialog dopo breve ritardo
        setTimeout(() => this.chiudiDialog(true), 500);
      }
    },
    error: err => {
      this.eliminazioneInCorso = false;

      // Errore globale: segna ogni asset come fallito con messaggio dettagliato
      const messaggioErrore = err?.error?.message || 'Errore globale durante l’eliminazione';

      this.mediaInput.items.forEach(item => {
        item.media.forEach(media => {
          media.erroreEliminazione = true;
          media.dettaglioErrore = messaggioErrore;
        });
      });
    }
  });
}



  /**
   * Chiude il dialog e opzionalmente ricarica la pagina
   */
  chiudiDialog(reload?: boolean): void {
    this.dialogRef.close(reload);
    if (reload) {
      setTimeout(() => window.location.reload(), 400);
    }
  }

  /**
   * Chiude il dialog senza ricaricare
   */
  annulla(): void {
    this.dialogRef.close(false);
  }

  
  // Mappa per tenere traccia dell'indice attuale per ogni media (display_name)
 // Gestisce l’indice attivo dello slider per ogni media
  currentIndexes: { [displayName: string]: number } = {};

// Restituisce tutte le URL (frontale + altre) per un dato item
// Restituisce tutte le URL (frontale + non frontali) come string[]
getAllAssets(item: { context: MediaContext; media: MediaMetaConErrore[] }): MediaMetaConErrore[] {
  const front = this.getMediaFrontale(item.media);
  const extras = this.getMediaNoFrontale(item.media);
  return front ? [front, ...extras] : [...extras];
}


// Ottiene la URL attiva corrente per un dato display_name
getActiveAsset(displayName: string): MediaMetaConErrore | null {
  const item = this.mediaInput.items.find(m => m.context.display_name === displayName);
  if (!item) return null;

  const assets = this.getAllAssets(item);
  const index = this.currentIndexes[displayName] ?? 0;
  return assets[index] || null;
}

// Passa all'immagine precedente per un dato display_name
prevImage(displayName: string): void {
  const item = this.mediaInput.items.find(i => i.context.display_name === displayName);
  if (!item) return;

  const total = this.getAllAssets(item).length;
  const current = this.currentIndexes[displayName] ?? 0;
  this.currentIndexes[displayName] = (current - 1 + total) % total;
}

// Passa all'immagine successiva per un dato display_name
nextImage(displayName: string): void {
  const item = this.mediaInput.items.find(i => i.context.display_name === displayName);
  if (!item) return;

  const total = this.getAllAssets(item).length;
  const current = this.currentIndexes[displayName] ?? 0;
  this.currentIndexes[displayName] = (current + 1) % total;
}

// Ritorna l'oggetto MediaMetaConErrore corrispondente all'angolazione frontale (se presente) non possono ritornare string come nella download perche qui abbiamo esteso l interfaccia dobbiamo capire se la delete ha causato errore per quel media 
getMediaFrontale(media: MediaMetaConErrore[]): MediaMetaConErrore | null {
  return media.find(m => m.angolazione?.toLowerCase() === 'frontale') || null;
}

// Ritorna tutti gli oggetti MediaMetaConErrore con angolazione diversa da 'frontale'
getMediaNoFrontale(media: MediaMetaConErrore[]): MediaMetaConErrore[] {
  return (media || []).filter(m => m.angolazione?.toLowerCase() !== 'frontale');
}










}
