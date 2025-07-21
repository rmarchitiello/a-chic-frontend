import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

// Moduli Angular comuni e Angular Material
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

// Interfacce condivise dal componente home
import { MediaCollection, MediaItem, MediaAsset } from '../../../pages/home/home.component';

@Component({
  selector: 'app-download-data-admin',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatProgressSpinnerModule],
  templateUrl: './download-data-admin.component.html',
  styleUrl: './download-data-admin.component.scss'
})
export class DownloadDataAdminComponent implements OnInit {

  // Indica se non ci sono file da scaricare
  checkDataIsEmpty: boolean = false;

  // Elenco dei file ricevuti (MediaItem singoli)
  mediaInput: MediaItem[] = [];

  // Spinner attivo durante i download
  downloadInCorso: boolean = false;

  constructor(
    // Dati ricevuti dal componente padre (array di collezioni)
    @Inject(MAT_DIALOG_DATA) public data: MediaCollection[],
    private dialogRef: MatDialogRef<DownloadDataAdminComponent>
  ) {}

  ngOnInit(): void {
    // Estrae tutti gli oggetti MediaItem da tutte le collezioni
    this.mediaInput = this.data.flatMap(collezione => collezione.media);

    console.log('[DownloadDataAdminComponent] Media ricevuti per il download:', this.mediaInput);

    // Se non ci sono media, mostra messaggio e chiude popup
    this.checkDataIsEmpty = this.mediaInput.length === 0;
    if (this.checkDataIsEmpty) {
      setTimeout(() => this.chiudiPopUp(), 1000);
    }
  }

  /**
   * Scarica tutti i file presenti nella lista
   */
  downloadTutti(): void {
    this.downloadInCorso = true;

    this.mediaInput.forEach(media => this.scaricaSingolo(media));

    setTimeout(() => {
      this.downloadInCorso = false;
    }, 1000);
  }

  /**
   * Scarica un singolo media
   */
  downloadSingolo(media: MediaItem): void {
    this.downloadInCorso = true;

    this.scaricaSingolo(media);

    setTimeout(() => {
      this.downloadInCorso = false;
    }, 1000);
  }

  /**
   * Esegue il download effettivo di un media
   */
  private scaricaSingolo(media: MediaItem): void {
    const mediaFrontale = this.getMediaFrontale(media);

    if (!mediaFrontale) {
      console.warn(`Nessuna angolazione frontale trovata per: ${media.display_name}`);
      return;
    }

    const estensione = this.getEstensione(mediaFrontale.url);
    const nomeFile = `${media.display_name}.${estensione}`;

    fetch(mediaFrontale.url)
      .then(response => {
        if (!response.ok) throw new Error(`Errore HTTP: ${response.status}`);
        return response.blob();
      })
      .then(blob => {
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = nomeFile;
        link.click();
        URL.revokeObjectURL(link.href);
      })
      .catch(err => {
        console.error(`Errore nel download di ${media.display_name}:`, err);
      });
  }

  /**
   * Restituisce solo l'asset con angolazione "frontale", se presente
   */
  getMediaFrontale(item: MediaItem): MediaAsset | null {
    return item.meta.find(m => m.angolazione?.toLowerCase() === 'frontale') || null;
  }

  /**
   * Estrae l'estensione dal file partendo dall'URL Cloudinary
   */
  getEstensione(url: string): string {
    const parts = url.split('?')[0].split('.');
    return parts.length > 1 ? parts.pop()! : '';
  }

  /**
   * Chiude il dialog
   */
  chiudiPopUp(): void {
    this.dialogRef.close();
  }
}
