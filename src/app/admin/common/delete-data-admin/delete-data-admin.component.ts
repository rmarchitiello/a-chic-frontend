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
  // Attivo lo spinner visivo solo per eliminazioni massive o batch
  if (!immagineSingola) {
    this.eliminazioneInCorso = true;
  }

  // Costruisco l'elenco delle immagini da eliminare:
  // - una singola se viene passata come parametro
  // - tutte se allImages è true
  // - solo la prima immagine se nessun parametro specificato
  const immaginiDaEliminare: ImmagineConErrore[] = immagineSingola
    ? [immagineSingola]
    : allImages
      ? this.mediaInput
      : [this.mediaInput[0]];

  // Estraggo gli URL da inviare al backend per la cancellazione
  const urls: string[] = immaginiDaEliminare.map(img => img.url);

  console.log('Sto per eliminare queste immagini:', urls);

  // Chiamo il servizio che si occupa dell'eliminazione lato server
  this.cmsService.deleteImages(urls, true).subscribe({
    next: (res) => {
      // Disattivo lo spinner visivo (solo per eliminazione batch)
      this.eliminazioneInCorso = false;

      // Se il backend ha confermato il successo
      if (res?.success) {
        console.log('Eliminazione riuscita');

        // Se sto eliminando una singola immagine (da pulsante su card)
        if (immagineSingola) {
          immagineSingola.inEliminazione = true;

          // Rimuovo l'immagine dalla lista dopo breve delay
          setTimeout(() => {
            this.mediaInput = this.mediaInput.filter(img => img.url !== immagineSingola.url);
          }, 300);
        }

        // Se sto eliminando solo la prima immagine dell'elenco
        else if (!allImages) {
          this.mediaInput[0].inEliminazione = true;

          // Rimuovo solo la prima immagine dopo breve delay
          setTimeout(() => {
            this.mediaInput = this.mediaInput.slice(1);
          }, 300);
        }

        // Se sto eliminando tutte le immagini contemporaneamente
        else {
          // Chiudo il dialog passando "true" per notificare esito positivo
          this.dialogRef.close(true);

          // Forzo il refresh della pagina dopo breve ritardo
          setTimeout(() => {
            window.location.reload();
          }, 100);
        }
      } else {
        // Il backend ha risposto ma non ha confermato alcuna eliminazione
        console.warn('Il backend ha risposto ma non ha eliminato alcun file');

        // In questo caso non chiudo il dialog: lascio che l'utente lo faccia manualmente
      }
    },

    error: (err) => {
      // Disattivo lo spinner anche in caso di errore
      this.eliminazioneInCorso = false;

      console.error('Errore durante l\'eliminazione:', err);

      // Per ogni immagine coinvolta, assegno un errore visivo e un dettaglio descrittivo
      for (const img of immaginiDaEliminare) {
        img.erroreEliminazione = true;
        img.dettaglioErrore = err?.error?.message || 'Errore durante l’eliminazione';
      }

      // Non chiudo il dialog: voglio che l'utente possa vedere i messaggi di errore sulle immagini
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
