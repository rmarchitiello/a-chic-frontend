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
}
