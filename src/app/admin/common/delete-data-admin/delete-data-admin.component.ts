import { Component, Inject, OnInit } from '@angular/core';
import { CmsService } from '../../../services/cms.service';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ImmagineConfig } from '../../../pages/home/home.component';
import { CommonModule } from '@angular/common';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatIconModule } from '@angular/material/icon';

/**
 * Estensione dell'interfaccia ImmagineConfig per includere lo stato di errore,
 * utile per evidenziare visivamente le immagini non eliminate con successo.
 */
interface ImmagineConErrore extends ImmagineConfig {
  erroreEliminazione?: boolean;   // Se true, mostra bordo rosso e tooltip
  dettaglioErrore?: string;       // Messaggio di errore restituito dal backend
}

@Component({
  selector: 'app-delete-data-admin',
  templateUrl: './delete-data-admin.component.html',
  styleUrl: './delete-data-admin.component.scss',
  standalone: true,
  imports: [
    CommonModule,
    MatTooltipModule,
    MatIconModule
  ]
})
export class DeleteDataAdminComponent implements OnInit {

  // Lista di immagini ricevute dal componente padre (una o più), con proprietà per gestione errori
  mediaInput: ImmagineConErrore[] = [];

  constructor(
    private cmsService: CmsService,
    private dialogRef: MatDialogRef<DeleteDataAdminComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ImmagineConfig[]
  ) {}

  ngOnInit(): void {
    // All'inizializzazione copio i dati ricevuti e li adatto all'interfaccia estesa
    this.mediaInput = this.data.map(img => ({
      ...img,
      erroreEliminazione: false,
      dettaglioErrore: ''
    }));
    console.log("Dati ricevuti da eliminare:", this.mediaInput);
  }

  /**
   * Metodo chiamato al click su uno dei pulsanti "Elimina".
   * Se allImages è true, elimina tutte le immagini ricevute.
   * Altrimenti elimina solo la prima immagine corrente.
   */
  deleteMedia(allImages: boolean = false, immagineSingola?: ImmagineConErrore): void {
  // Preparo la lista delle immagini da eliminare:
  // - Se viene passata un'immagine singola: elimino solo quella
  // - Se viene richiesto allImages: elimino tutte
  // - Altrimenti elimino solo la prima della lista
  const immaginiDaEliminare: ImmagineConErrore[] = immagineSingola
    ? [immagineSingola]
    : allImages
      ? this.mediaInput
      : [this.mediaInput[0]];

  // Estraggo solo gli URL da inviare al backend per l’eliminazione
  const urls: string[] = immaginiDaEliminare.map(img => img.url);

  console.log("Sto per eliminare l'immagine o le immagini . . .", urls);

  // Chiamo il servizio backend per eliminare le immagini
  this.cmsService.deleteImages(urls, true).subscribe({
    next: (res) => {
      if (res?.success) {
        console.log('Eliminazione completata con successo');

        // Caso 1: Eliminazione di una singola immagine specificata (da pulsante icona)
        if (immagineSingola) {
          // Rimuovo l'immagine dalla lista locale, senza chiudere il dialog
          this.mediaInput = this.mediaInput.filter(img => img.url !== immagineSingola.url);
        }

        // Caso 2: Eliminazione della prima immagine (da pulsante "Elimina immagine")
        else if (!allImages) {
          // Rimuovo la prima immagine dalla lista
          this.mediaInput = this.mediaInput.slice(1);
        }

        // Caso 3: Eliminazione di tutte le immagini (da pulsante "Elimina tutte le immagini")
        else {
          // Chiudo il dialog con successo
          this.dialogRef.close(true);

          // Forzo il reload della pagina per aggiornare completamente la vista
          // Questo evita che rimangano elementi in cache o visivamente non aggiornati
          setTimeout(() => {
            window.location.reload();
          }, 100);
        }
      } else {
        // Il backend ha risposto ma non ha eseguito l'eliminazione
        console.warn('Errore lato backend, nessun file eliminato');
        this.dialogRef.close(false);
      }
    },
    error: (err) => {
      console.error('Errore nella richiesta di eliminazione:', err);

      // Imposto stato di errore su ogni immagine che si tentava di eliminare
      for (const img of immaginiDaEliminare) {
        img.erroreEliminazione = true;
        img.dettaglioErrore = err?.error?.message || 'Errore durante l’eliminazione';
      }

      // Chiudo il dialog solo se era una eliminazione batch
      if (!immagineSingola) {
        this.dialogRef.close(false);
      }

      // In caso di errore su immagine singola, mantengo il dialog aperto per mostrare errore visivo
    }
  });
}




  /**
   * Metodo per chiudere il dialog senza eseguire nessuna operazione.
   */
  annulla(): void {
    this.dialogRef.close(false);
  }
}
