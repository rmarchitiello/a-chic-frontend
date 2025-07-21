// Componente Angular per la gestione dell’eliminazione media da Cloudinary
import { Component, OnInit, Inject } from '@angular/core';
import { CmsService } from '../../../services/cms.service';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MediaCollection, MediaItem, MediaAsset } from '../../../pages/home/home.component';

// Estensione dell’interfaccia MediaItem per gestire errori, spinner e stato locale
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

  // Media da mostrare e gestire (con estensioni di stato)
  mediaInput: MediaItemConErrore[] = [];

  // Flag per mostrare lo spinner globale durante operazioni
  eliminazioneInCorso = false;

  // Flag se non ci sono media
  checkDataIsEmpty = false;

  // Gestisce l’indice attivo dello slider per ogni media
  currentIndexes: { [displayName: string]: number } = {};

  constructor(
    private cmsService: CmsService,
    private dialogRef: MatDialogRef<DeleteDataAdminComponent>,
    @Inject(MAT_DIALOG_DATA) public data: MediaCollection[]
  ) {}

  ngOnInit(): void {
    // Appiattisce le collezioni ricevute in un unico array di media con flag inizializzati
    this.mediaInput = this.data.flatMap(col => col.media).map(m => ({
      ...m,
      erroreEliminazione: false,
      dettaglioErrore: '',
      inEliminazione: false
    }));

    // Se non ci sono media, chiudi automaticamente il dialog
    this.checkDataIsEmpty = this.mediaInput.length === 0;
    if (this.checkDataIsEmpty) {
      setTimeout(() => this.chiudiDialog(false), 1000);
    }
  }

  /**
   * Elimina l’asset attualmente visibile nella card (immagine frontale o laterale selezionata)
   */
  eliminaAssetSingolo(media: MediaItemConErrore): void {
    const activeAsset = this.getActiveAsset(media.display_name);
    if (!activeAsset) return;

    this.cmsService.deleteImages([activeAsset.url], true).subscribe({
      next: res => {
        if (res?.success) {
          // Rimuove l’asset visibile dalla lista meta
          media.meta = media.meta.filter(a => a !== activeAsset);

          // Se non restano asset, rimuove tutto il media
          if (media.meta.length === 0) {
            media.inEliminazione = true;
            setTimeout(() => {
              this.mediaInput = this.mediaInput.filter(m => m !== media);
            }, 300);
          } else {
            // Se ci sono ancora asset, aggiorna l’indice corrente
            const tot = media.meta.length;
            const cur = this.currentIndexes[media.display_name] ?? 0;
            this.currentIndexes[media.display_name] = cur >= tot ? 0 : cur;
          }
        }
      },
      error: err => {
        media.erroreEliminazione = true;
        media.dettaglioErrore = err?.error?.message || 'Errore durante l’eliminazione';
      }
    });
  }

  /**
   * Elimina **tutti** i media e tutti gli asset associati (frontale + laterali)
   */
  eliminaTuttiIMedia(): void {
  if (this.mediaInput.length === 0) return;

  this.eliminazioneInCorso = true;

  const tutteLeUrl = this.mediaInput.flatMap(media => media.meta.map(m => m.url));

  this.cmsService.deleteImages(tutteLeUrl, true).subscribe({
    next: res => {
      this.eliminazioneInCorso = false;
      if (res?.success) {
        this.mediaInput = [];
        this.checkDataIsEmpty = true;
        setTimeout(() => this.chiudiDialog(true), 500);
      }
    },
    error: err => {
      this.eliminazioneInCorso = false;
      // Puoi anche gestire un errore globale qui
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

  /**
   * Restituisce l’asset con angolazione 'frontale', se presente
   */
  getMediaFrontale(item: MediaItem): MediaAsset | null {
    return item.meta.find(m => m.angolazione?.toLowerCase() === 'frontale') || null;
  }

  /**
   * Restituisce tutti gli asset con angolazione diversa da 'frontale'
   */
  getMediaNoFrontale(item: MediaItem): MediaAsset[] {
    return (item.meta || []).filter(m => m.angolazione?.toLowerCase() === 'altra');
  }

  /**
   * Restituisce tutti gli asset (frontale + altri)
   */
  getAllAssets(media: MediaItem): MediaAsset[] {
    const front = this.getMediaFrontale(media);
    const extras = this.getMediaNoFrontale(media);
    return front ? [front, ...extras] : [...extras];
  }

  /**
   * Restituisce l’asset visibile correntemente per un certo media
   */
  getActiveAsset(displayName: string): MediaAsset | null {
    const media = this.mediaInput.find(m => m.display_name === displayName);
    if (!media) return null;

    const assets = this.getAllAssets(media);
    const index = this.currentIndexes[displayName] ?? 0;
    return assets[index] || null;
  }

  /**
   * Naviga all’asset precedente nella card
   */
  prevImage(displayName: string): void {
    const media = this.mediaInput.find(m => m.display_name === displayName);
    if (!media) return;

    const total = this.getAllAssets(media).length;
    const current = this.currentIndexes[displayName] ?? 0;
    this.currentIndexes[displayName] = (current - 1 + total) % total;
  }

  /**
   * Naviga all’asset successivo nella card
   */
  nextImage(displayName: string): void {
    const media = this.mediaInput.find(m => m.display_name === displayName);
    if (!media) return;

    const total = this.getAllAssets(media).length;
    const current = this.currentIndexes[displayName] ?? 0;
    this.currentIndexes[displayName] = (current + 1) % total;
  }
}
