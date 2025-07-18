import { Component, Inject, OnInit } from '@angular/core';
import { CmsService } from '../../../services/cms.service';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ImmagineConfig } from '../../../pages/home/home.component';
import { CommonModule } from '@angular/common';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

/**
 * Estensione dell'interfaccia ImmagineConfig per includere:
 * - stato di errore durante l'eliminazione
 * - messaggio di dettaglio errore
 * - stato di uscita animata (visiva)
 */
interface ImmagineConErrore extends ImmagineConfig {
  erroreEliminazione?: boolean;
  dettaglioErrore?: string;
  inEliminazione?: boolean; // Gestisce la scomparsa animata
}

@Component({
  selector: 'app-delete-data-admin',
  templateUrl: './delete-data-admin.component.html',
  styleUrl: './delete-data-admin.component.scss',
  standalone: true,
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
    @Inject(MAT_DIALOG_DATA) public data: ImmagineConfig[]
  ) {}

  ngOnDestroy(): void {
    this.chiudiDialog();
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
    // Attivo lo spinner globale solo se è un'eliminazione totale o batch
    if (!immagineSingola) {
      this.eliminazioneInCorso = true;
    }

    // Determino le immagini da inviare al backend
    const immaginiDaEliminare: ImmagineConErrore[] = immagineSingola
      ? [immagineSingola]
      : allImages
        ? this.mediaInput
        : [this.mediaInput[0]];

    // Estraggo gli URL per la richiesta HTTP
    const urls: string[] = immaginiDaEliminare.map(img => img.url);

    console.log('Sto per eliminare queste immagini:', urls);

    this.cmsService.deleteImages(urls, true).subscribe({
      next: (res) => {
        // Disattivo lo spinner globale (se attivo)
        this.eliminazioneInCorso = false;

        if (res?.success) {
          console.log('Eliminazione riuscita');

          // Caso: eliminazione immagine singola da pulsante icona
          if (immagineSingola) {
            immagineSingola.inEliminazione = true;

            setTimeout(() => {
              this.mediaInput = this.mediaInput.filter(img => img.url !== immagineSingola.url);
            }, 300);
          }

          // Caso: elimina solo la prima immagine
          else if (!allImages) {
            this.mediaInput[0].inEliminazione = true;

            setTimeout(() => {
              this.mediaInput = this.mediaInput.slice(1);
            }, 300);
          }

          // Caso: elimina tutte le immagini
          else {
            // Chiudo il dialog con esito positivo
            this.dialogRef.close(true);

            // Ricarico la pagina per forzare aggiornamento della lista completa
            setTimeout(() => {
              window.location.reload();
            }, 100);
          }
        } else {
          console.warn('Il backend ha risposto ma non ha eliminato alcun file');
          this.dialogRef.close(false);
        }
      },

      error: (err) => {
        this.eliminazioneInCorso = false;

        console.error('Errore durante l\'eliminazione:', err);

        // Imposto errore su ogni immagine coinvolta
        for (const img of immaginiDaEliminare) {
          img.erroreEliminazione = true;
          img.dettaglioErrore = err?.error?.message || 'Errore durante l’eliminazione';
        }

        // Se batch, chiudo il dialog. Se singola, lo mantengo aperto per mostrare errore visivo
        if (!immagineSingola) {
          this.dialogRef.close(false);
        }
      }
    });
  }

  /**
   * Metodo per chiudere manualmente il dialog (pulsante "Annulla")
   */
  annulla(): void {
    this.dialogRef.close(false);
  }

    chiudiDialog(): void {
    this.dialogRef.close();
            setTimeout(() => {
          window.location.reload();
        }, 400);
  }
}
