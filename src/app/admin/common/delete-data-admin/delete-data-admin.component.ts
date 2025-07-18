import { Component, Inject, OnInit } from '@angular/core';
import { CmsService } from '../../../services/cms.service';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MediaCloudinary } from '../../../pages/home/home.component';
import { CommonModule } from '@angular/common';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MediaMeta } from '../../../pages/home/home.component';
/**
 * Estensione dell'interfaccia ImmagineConfig per includere:
 * - stato di errore durante l'eliminazione
 * - messaggio di dettaglio errore
 * - stato di uscita animata (visiva)
 */

// ATTUALMENTE POSSIAMO CANCELLARE SOLO QUELLE FRONTALI
interface ImmagineConErrore extends MediaCloudinary {
  erroreEliminazione?: boolean;
  dettaglioErrore?: string;
  inEliminazione?: boolean; // Gestisce la scomparsa animata
}

@Component({
  selector: 'app-delete-data-admin',
  templateUrl: './delete-data-admin.component.html',
  styleUrl: './delete-data-admin.component.scss',
  imports: [
    CommonModule,
    MatTooltipModule,
    MatIconModule,
    MatProgressSpinnerModule
  ]
})
export class DeleteDataAdminComponent implements OnInit {

  // Lista delle immagini da eliminare, arricchite con flag per gestione errori e animazioni
  mediaInput: ImmagineConErrore[] = [];

  // Spinner globale per l'intera eliminazione batch
  eliminazioneInCorso = false;

  constructor(
    private cmsService: CmsService,
    private dialogRef: MatDialogRef<DeleteDataAdminComponent>,
    @Inject(MAT_DIALOG_DATA) public data: MediaCloudinary[]
  ) {}

  ngOnDestroy(): void {
  }

  ngOnInit(): void {
    // All'avvio del componente, clono ogni immagine con i flag per errore/animazione
    this.mediaInput = this.data.map(img => ({
      ...img,
      erroreEliminazione: false,
      dettaglioErrore: '',
      inEliminazione: false
    }));

    console.log('Dati ricevuti da eliminare:', this.mediaInput);
  }

  /**
   * Metodo per gestire l'eliminazione delle immagini.
   * Può eliminare una singola immagine (passata come parametro),
   * tutte le immagini (se allImages=true), o la prima della lista.
   */
deleteMedia(allImages: boolean = false, immagineSingola?: ImmagineConErrore): void {
  // Mostro lo spinner solo se non sto eliminando da una singola card
  if (!immagineSingola) {
    this.eliminazioneInCorso = true;
  }

  // Determino le immagini da elaborare:
  const immaginiDaEliminare: ImmagineConErrore[] = immagineSingola
    ? [immagineSingola]
    : allImages
      ? this.mediaInput
      : [this.mediaInput[0]];

  // Estraggo solo gli URL delle immagini frontali
  const urls = immaginiDaEliminare
    .map(img => this.getMediaFrontale(img)?.url)
    .filter((url): url is string => !!url); // Elimina i null

  // Se nessuna immagine ha angolazione frontale, segnalo e annullo
  if (urls.length === 0) {
    this.eliminazioneInCorso = false;

    immaginiDaEliminare.forEach(img => {
      img.erroreEliminazione = true;
      img.dettaglioErrore = 'Nessuna immagine frontale trovata per questa risorsa.';
    });

    console.warn('Nessuna immagine frontale valida trovata per eliminazione.');
    return;
  }

  // Chiamo il servizio per l’eliminazione dei file
  this.cmsService.deleteImages(urls, true).subscribe({
    next: (res) => {
      this.eliminazioneInCorso = false;

      if (res?.success) {
        console.log('Eliminazione riuscita:', urls);

        if (immagineSingola) {
          immagineSingola.inEliminazione = true;
          setTimeout(() => {
            this.mediaInput = this.mediaInput.filter(img => img !== immagineSingola);
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
        console.warn('Il backend ha risposto ma non ha confermato l’eliminazione.');
      }
    },

    error: (err) => {
      this.eliminazioneInCorso = false;
      console.error('Errore durante l’eliminazione:', err);

      immaginiDaEliminare.forEach(img => {
        const urlFrontale = this.getMediaFrontale(img)?.url;
        if (urlFrontale) {
          img.erroreEliminazione = true;
          img.dettaglioErrore = err?.error?.message || 'Errore durante l’eliminazione';
        }
      });
    }
  });
}



  /**
   * Metodo per chiudere manualmente il dialog (pulsante "Annulla")
   */
  annulla(): void {
    this.dialogRef.close(false);
  }

    chiudiDialog(reload: boolean): void {
    this.dialogRef.close();
            setTimeout(() => {
              if(reload){
              window.location.reload();

              }
        }, 400);
  }

    //di immagine cloduinary ottengo solo quelle con angolazione frontale poi vediamo come fare per le altre
  getMediaFrontale(item: MediaCloudinary): MediaMeta | null {
  return item.meta.find(m => m.angolazione?.toLowerCase() === 'frontale') || null;
}
}
