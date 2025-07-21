import { Component, Inject, OnInit } from '@angular/core';
import { CmsService } from '../../../services/cms.service';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MediaCollection, MediaItem, MediaAsset } from '../../../pages/home/home.component';

// Interfaccia estesa per gestire errori ed effetti visivi
interface MediaItemConErrore extends MediaItem {
  erroreEliminazione?: boolean;
  dettaglioErrore?: string;
  inEliminazione?: boolean;
}

@Component({
  selector: 'app-delete-data-admin',
  standalone: true,
  imports: [CommonModule, MatTooltipModule, MatIconModule, MatProgressSpinnerModule],
  templateUrl: './delete-data-admin.component.html',
  styleUrl: './delete-data-admin.component.scss'
})
export class DeleteDataAdminComponent implements OnInit {

  // Lista di media (singoli) con flag di errore
  mediaInput: MediaItemConErrore[] = [];

  // Stato per spinner
  eliminazioneInCorso: boolean = false;

  // Stato per media vuoti
  checkDataIsEmpty: boolean = false;

  constructor(
    private cmsService: CmsService,
    private dialogRef: MatDialogRef<DeleteDataAdminComponent>,
    @Inject(MAT_DIALOG_DATA) public data: MediaCollection[]
  ) {}

  ngOnInit(): void {
    // Appiattisce tutti i media in un array unico con flag iniziali
    this.mediaInput = this.data.flatMap(col => col.media).map(m => ({
      ...m,
      erroreEliminazione: false,
      dettaglioErrore: '',
      inEliminazione: false
    }));

    this.checkDataIsEmpty = this.mediaInput.length === 0;

    if (this.checkDataIsEmpty) {
      setTimeout(() => this.chiudiDialog(false), 1000);
    }
  }

  /**
   * Elimina uno o più file
   */
  deleteMedia(allImages: boolean = false, immagineSingola?: MediaItemConErrore): void {
    if (!immagineSingola) {
      this.eliminazioneInCorso = true;
    }

    const immaginiDaEliminare: MediaItemConErrore[] = immagineSingola
      ? [immagineSingola]
      : allImages
        ? this.mediaInput
        : [this.mediaInput[0]];

    const urls = immaginiDaEliminare
      .map(media => this.getMediaFrontale(media)?.url)
      .filter((url): url is string => !!url);

    if (urls.length === 0) {
      this.eliminazioneInCorso = false;

      immaginiDaEliminare.forEach(media => {
        media.erroreEliminazione = true;
        media.dettaglioErrore = 'Nessuna angolazione frontale trovata.';
      });

      return;
    }

    this.cmsService.deleteImages(urls, true).subscribe({
      next: res => {
        this.eliminazioneInCorso = false;

        if (res?.success) {
          if (immagineSingola) {
            immagineSingola.inEliminazione = true;
            setTimeout(() => {
              this.mediaInput = this.mediaInput.filter(m => m !== immagineSingola);
            }, 300);
          } else if (!allImages) {
            this.mediaInput[0].inEliminazione = true;
            setTimeout(() => {
              this.mediaInput = this.mediaInput.slice(1);
            }, 300);
          } else {
            this.dialogRef.close(true);
            setTimeout(() => window.location.reload(), 100);
          }
        } else {
          console.warn('Eliminazione non confermata dal backend.');
        }
      },
      error: err => {
        this.eliminazioneInCorso = false;
        immaginiDaEliminare.forEach(media => {
          const urlFrontale = this.getMediaFrontale(media)?.url;
          if (urlFrontale) {
            media.erroreEliminazione = true;
            media.dettaglioErrore = err?.error?.message || 'Errore durante l’eliminazione';
          }
        });
      }
    });
  }

  /**
   * Ritorna solo l’asset con angolazione frontale, se presente
   */
  getMediaFrontale(item: MediaItem): MediaAsset | null {
    return item.meta.find(m => m.angolazione?.toLowerCase() === 'frontale') || null;
  }

  //come sopra prende in input un media item ed esce un media asset anzi un array di media asset perche posso avere piu immagini non frontali
getMediaNoFrontale(item: MediaItem): MediaAsset[] {
  return (item.meta || []).filter(m => m.angolazione?.toLowerCase() === 'altra');
}

  /**
   * Chiude il dialog
   */
  chiudiDialog(reload: boolean): void {
    this.dialogRef.close();
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




//qua quando ho piu immagini le slido io quindi devo creare per ogni nome file il suo indice corrente
// Mappa per tenere traccia dell'indice attuale per ogni media
currentIndexes: { [displayName: string]: number } = {};

// Ritorna l’array completo (frontale + extra) per il media
getAllAssets(media: MediaItem): MediaAsset[] {
  const front = this.getMediaFrontale(media);
  const extras = this.getMediaNoFrontale(media);
  return front ? [front, ...extras] : [...extras];
}

// Ottieni l’elemento attivo
getActiveAsset(displayName: string): MediaAsset | null {
  const media = this.mediaInput.find(m => m.display_name === displayName);
  if (!media) return null;

  const assets = this.getAllAssets(media);
  const index = this.currentIndexes[displayName] ?? 0;
  return assets[index] || null;
}

// Vai all’immagine precedente
prevImage(displayName: string): void {
  const media = this.mediaInput.find(m => m.display_name === displayName);
  if (!media) return;

  const total = this.getAllAssets(media).length;
  const current = this.currentIndexes[displayName] ?? 0;
  this.currentIndexes[displayName] = (current - 1 + total) % total;
}

// Vai all’immagine successiva
nextImage(displayName: string): void {
  const media = this.mediaInput.find(m => m.display_name === displayName);
  if (!media) return;

  const total = this.getAllAssets(media).length;
  const current = this.currentIndexes[displayName] ?? 0;
  this.currentIndexes[displayName] = (current + 1) % total;
}

}
