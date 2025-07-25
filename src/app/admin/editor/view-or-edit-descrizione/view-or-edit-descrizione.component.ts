import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MediaCollection } from '../../../pages/home/home.component';
import { SharedDataService } from '../../../services/shared-data.service';
import { AdminService } from '../../../services/admin.service';
import { MediaContext } from '../../../pages/home/home.component';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-view-or-edit-descrizione',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatIconModule,
    MatButtonModule
  ],
  templateUrl: './view-or-edit-descrizione.component.html',
  styleUrls: ['./view-or-edit-descrizione.component.scss']
})
export class ViewOrEditDescrizioneComponent implements OnInit {
  isEditing = false;                    // Modalità di modifica attiva
  descrizioneModificata: string;        // Valore locale della descrizione
  modificaInAttesaDiConferma = false;   // True se c'è una modifica non ancora confermata

  mediaCollectionInput: MediaCollection = {
    folder: '',
    items: []
  };

  mediaContextInput: MediaContext = {
    display_name: '',
    descrizione: '',
    quantita: ''
  };

  constructor(
    @Inject(MAT_DIALOG_DATA)
    public data: { urlFrontale: string; context: MediaContext }, // Dati iniziali passati dal padre
    private dialogRef: MatDialogRef<ViewOrEditDescrizioneComponent>,
    private sharedDataService: SharedDataService,
    private adminService: AdminService
  ) {
    // Inizializzo la descrizione modificabile con il valore ricevuto
this.descrizioneModificata = data.context.descrizione ?? '';
  }

  ngOnInit(): void {
    // Mi iscrivo una sola volta allo stato condiviso per leggere i dati aggiornati
    this.sharedDataService.mediaCollection$.pipe(take(1)).subscribe(media => {
      if (media) {
        this.mediaCollectionInput = media;

        console.log("[ViewOrEditDescrizione] Ricevuta mediaCollection dal padre:", media);

        // Trova l’item che contiene l’URL selezionato
        const itemTrovato = media.items.find(item =>
          item.media.some(m => m.url === this.data.urlFrontale)
        );

        if (itemTrovato && itemTrovato.context) {
          // Copia tutti i metadati presenti, inclusi quelli dinamici
          this.mediaContextInput = { ...itemTrovato.context };

          // Fallback: assicura che descrizione non sia undefined
          this.mediaContextInput.descrizione = this.mediaContextInput.descrizione || '';
        }

        console.log('[ViewOrEditDescrizione] Context originale:', this.mediaContextInput);
      }
    });
  }

  attivaModifica(): void {
    this.isEditing = true;
    this.modificaInAttesaDiConferma = false;
  }

  salvaModifica(): void {
    this.isEditing = false;

    if (this.descrizioneModificata !== this.data.context.descrizione) {
      this.modificaInAttesaDiConferma = true;
    }
  }

  annullaModifica(): void {
this.descrizioneModificata = this.data.context.descrizione ?? '';
    this.isEditing = false;
    this.modificaInAttesaDiConferma = false;
  }

  /**
   * Conferma la modifica e aggiorna i metadati:
   * 1. Chiama il backend (`adminService`)
   * 2. Solo se ha successo, aggiorna `mediaCollection$` nel `SharedDataService`
   * 3. Chiude il popup restituendo i nuovi dati
   */
  confermaDescrizioneAggiornata(): void {
    const nuovaDescrizione = this.descrizioneModificata?.trim();
    const urlFrontale = this.data.urlFrontale;

    if (nuovaDescrizione && nuovaDescrizione !== this.mediaContextInput.descrizione) {
      const nuovoContext: MediaContext = {
        ...this.mediaContextInput,
        descrizione: nuovaDescrizione
      };

      console.log("Nuovo context da aggiornare:", nuovoContext);

      this.adminService.updateImageMetadata(urlFrontale, nuovoContext, true).subscribe({
        next: () => {
          console.log('Descrizione aggiornata con successo');

          // Aggiorna la mediaCollection condivisa
          this.sharedDataService.mediaCollection$.pipe(take(1)).subscribe(collezioneCorrente => {
            if (!collezioneCorrente) return;

            const itemsAggiornati = collezioneCorrente.items.map(item => {
              const contieneUrl = item.media.some(m => m.url === urlFrontale);
              return contieneUrl
                ? { ...item, context: nuovoContext }
                : item;
            });

            // Notifica il padre con la nuova collezione aggiornata
            this.sharedDataService.setMediaCollection({
              folder: collezioneCorrente.folder,
              items: itemsAggiornati
            });
          });

          // Chiude il dialog restituendo i nuovi dati opzionali
          this.dialogRef.close({
            descrizione: nuovaDescrizione,
            urlFrontale: urlFrontale
          });
        },
        error: err => {
          console.error('Errore durante l\'aggiornamento della descrizione:', err);
          // Qui potresti mostrare un messaggio visivo all’utente se serve
        }
      });
    } else {
      // Se la descrizione è vuota o non è cambiata, chiude senza salvare
      this.dialogRef.close();
    }
  }

  // Chiude il dialog senza effettuare alcuna modifica
  chiudiDialog(): void {
    this.dialogRef.close();
  }
}
