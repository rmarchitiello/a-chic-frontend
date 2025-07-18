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
  // Preparo la lista delle immagini da eliminare (una, tutte o solo la prima)
  const immaginiDaEliminare: ImmagineConErrore[] = immagineSingola
    ? [immagineSingola]
    : allImages
      ? this.mediaInput
      : [this.mediaInput[0]];

  // Estrai solo gli URL da inviare al backend
  const urls: string[] = immaginiDaEliminare.map(img => img.url);

  console.log("Sto per eliminare l'immagine o le immagini . . .", urls);
  this.cmsService.deleteImages(urls, true).subscribe({
    next: (res) => {
      if (res?.success) {
        console.log('Eliminazione completata con successo');

        // Rimuove l'immagine dalla lista se è singola
        if (immagineSingola) {
          this.mediaInput = this.mediaInput.filter(img => img.url !== immagineSingola.url);
        } else {
          this.dialogRef.close(true); // Chiude se è batch
        }
      } else {
        console.warn('Errore lato backend, nessun file eliminato');
        this.dialogRef.close(false);
      }
    },
    error: (err) => {
      console.error('Errore nella richiesta di eliminazione:', err);

      for (const img of immaginiDaEliminare) {
        img.erroreEliminazione = true;
        img.dettaglioErrore = err?.error?.message || 'Errore durante l’eliminazione';
      }

      if (!immagineSingola) {
        this.dialogRef.close(false); // Chiude il dialog solo se batch
      }
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
