/**
 * Questo componente Angular consente l'upload di file multimediali (immagini, audio, video)
 * tramite drag and drop o selezione manuale, in modalità popup.
 * La cartella di destinazione viene fornita dal componente padre.
 * I metadati dei file sono gestiti e personalizzabili prima dell'invio.
 */

import { Component, OnInit, OnDestroy, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { AdminService } from '../../../services/admin.service';
import { MatIcon } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialogModule } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MediaCollection, MediaContext } from '../../../pages/home/home.component';
import { MatDialog } from '@angular/material/dialog';
import { FormsModule } from '@angular/forms';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { EditDataAdminComponent } from '../edit-data-admin/edit-data-admin.component';
import { SharedDataService } from '../../../services/shared-data.service';
@Component({
  selector: 'app-upload-data-admin',
  standalone: true,
  imports: [
    MatIcon,
    CommonModule,
    MatProgressSpinnerModule,
    MatDialogModule,
    MatTooltipModule,
    FormsModule,
    MatCheckboxModule
  ],
  templateUrl: './upload-data-admin.component.html',
  styleUrl: './upload-data-admin.component.scss'
})
export class UploadDataAdminComponent implements OnInit, OnDestroy {

  constructor(
    private adminService: AdminService,
    private dialog: MatDialog,
    private sharedService: SharedDataService,
    private dialogRef: MatDialogRef<UploadDataAdminComponent>,
    @Inject(MAT_DIALOG_DATA) public folder: string // La cartella viene fornita dal padre
  ) { }

  isHovering = false; // Evidenzia drop-zone
  filesDaCaricare: File[] = []; // Lista dei file selezionati
  anteprimeFile: Map<File, string> = new Map(); // Anteprima dei file

  //creo una mappa per settare i metadati per quel file
  metadatiPerFile: Map<File, MediaContext> = new Map(); // Metadati per file

  statoUpload: Map<File, 'ok' | 'ko'> = new Map(); // Stato di ogni file caricato
  motiviErroreUpload = new Map<File, string>(); // Motivi errore
  uploadInCorso: boolean = false; // Flag di caricamento
  
  inputFolder: string = '';


fileSelezionatoComeFrontale: File | null = null;
  


/**
 * Metodo per aprire un popup e modificare i metadati di un file selezionato.
 * In input passa il file, così da leggere o creare i metadati associati.
 */
apriPopUpEditFile(file: File): void {
  // Recupero i metadati già presenti oppure inizializzo a oggetto vuoto
  const metadataEsistenti = this.metadatiPerFile.get(file) || {};

  // Clono i metadati per evitare modifiche dirette prima della conferma
  const metadataClonati: MediaContext = { ...metadataEsistenti };

  // Apro il popup passando file e metadati
  const dialogRef = this.dialog.open(EditDataAdminComponent, {
    width: '720px',
    maxHeight: '90vh',
    panelClass: 'popup-metadati-dialog',
    data: {
      file,
      context: metadataClonati
    }
  });

  dialogRef.afterClosed().subscribe((result: MediaContext | undefined) => {
    if (result) {
      // Se il file è quello selezionato come frontale, imposto angolazione frontale
      if (this.fileSelezionatoComeFrontale === file) {
        result['angolazione'] = 'frontale';
      } else {
        result['angolazione'] = 'altra';
      }

      // Aggiorno il file corrente con i nuovi metadati
      this.metadatiPerFile.set(file, result);
      console.log("Metadati aggiornati per", file.name, ":", result);

      // Propago i metadati modificati (tranne l'angolazione) anche agli altri file
      this.metadatiPerFile.forEach((metadati, f) => {
        if (f !== file) {
          const angolazioneCorrente = this.fileSelezionatoComeFrontale === f ? 'frontale' : 'altra';

          // Creo una copia dei metadati aggiornati
          this.metadatiPerFile.set(f, {
            ...result,
            ['angolazione']: angolazioneCorrente
          });

          console.log("Metadati propagati a", f.name);
        }
      });

      console.log("Tutti i metadati aggiornati:", this.metadatiPerFile);
    }
  });
}





  ngOnInit(): void {
      console.log("UploadDataAdminComponent inizializzato", this.dialogRef);

    this.inputFolder = this.folder;
    console.log("Folder dove caricare: ", this.inputFolder);

    //non fa uploadre cose all esterno del drop
    window.addEventListener('dragover', this.preventBrowserDefault, false);
    window.addEventListener('drop', this.preventBrowserDefault, false);
  }

  //non fa uploadre cose all esterno del drop
  ngOnDestroy(): void {
    console.log("Distrutto");
    window.removeEventListener('dragover', this.preventBrowserDefault, false);
    window.removeEventListener('drop', this.preventBrowserDefault, false);
  }
  //non fa uploadre cose all esterno del drop

  preventBrowserDefault(event: Event): void {
    event.preventDefault();
  }


  onDragOver(event: DragEvent): void {
    event.preventDefault();
    this.isHovering = true;
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    this.isHovering = false;
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    this.isHovering = false;
    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      this.aggiungiFiles(Array.from(files));
    }
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const files = input.files;
    if (files && files.length > 0) {
      this.aggiungiFiles(Array.from(files));
    }
    input.value = '';
  }

private fileUsatoComeModelloMetadati: File | null = null;

aggiungiFiles(files: File[]): void {
  if (!files || files.length === 0) return;

  // Se è il primo file che si aggiunge, sarà usato come base per i metadati
  const primoFileNuovo = files.find(f => {
    return !this.filesDaCaricare.some(existing =>
      existing.name === f.name && existing.size === f.size
    );
  });

  // Se è il primo file caricato in assoluto, salvo come modello
  if (!this.fileUsatoComeModelloMetadati && primoFileNuovo) {
    this.fileUsatoComeModelloMetadati = primoFileNuovo;
  }

  files.forEach(file => {
    const giaPresente = this.filesDaCaricare.some(
      f => f.name === file.name && f.size === file.size
    );

    if (!giaPresente) {
      this.filesDaCaricare.push(file);

      const tipoGenerico = file.type.split('/')[0];
      if (["image", "video", "audio"].includes(tipoGenerico)) {
        const previewUrl = URL.createObjectURL(file);
        this.anteprimeFile.set(file, previewUrl);
      }

      // Recupero i metadati dal file modello, se presente
      let metadatiComuni = null;
      if (this.fileUsatoComeModelloMetadati) {
        const meta = this.metadatiPerFile.get(this.fileUsatoComeModelloMetadati);
        if (meta) {
          metadatiComuni = {
            ...meta,
            angolazione: 'altra' // Tutti "altra" tranne il frontale
          };
        }
      }

      // Se non ci sono ancora metadati, inizializza con valori fissi
      if (!metadatiComuni) {
        metadatiComuni = {
          display_name: file.name.split('.')[0],
          descrizione: 'Da inserire',
          quantita: '0',
          angolazione: 'altra'
        };
      }

      this.metadatiPerFile.set(file, metadatiComuni);

      console.log(`File aggiunto: ${file.name}`, metadatiComuni);
    }
  });

  console.log("Lista completa dei file da caricare:", this.filesDaCaricare);
}








rimuoviFile(file: File): void {
  // Rimuovo dalla lista dei file
  this.filesDaCaricare = this.filesDaCaricare.filter(f => f !== file);

  // Rimuovo anteprima e metadati
  this.anteprimeFile.delete(file);
  this.metadatiPerFile.delete(file);

  // Se il file rimosso era quello selezionato come frontale, lo azzero
  if (this.fileSelezionatoComeFrontale === file) {
    this.fileSelezionatoComeFrontale = null;
  }
}


rimuoviTuttiIFiles(): void {
  //  Svuoto completamente i file da caricare
  this.filesDaCaricare = [];

  //  Svuoto anche le anteprime
  this.anteprimeFile.clear();

  //  Svuoto tutti i metadati associati
  this.metadatiPerFile.clear();

  //  Azzero anche lo stato del file frontale selezionato
  this.fileSelezionatoComeFrontale = null;
  this.ultimoFileFrontaleSelezionato = null;
}


chiudiDialog(): void {
  console.log("Chiusura richiesta, dialogRef è:", this.dialogRef);

  if (this.dialogRef) {
    this.dialogRef.close();
  } else {
    console.warn("❌ dialogRef non disponibile: popup non può essere chiuso");
  }

  this.sharedService.notifyConfigCacheIsChanged(); // anche se la notifichi, il dialog non si chiude
}



  /**
 * Avvia l'upload dei file (singolo o multiplo)
 */
  uploadFiles(fileInput?: File): void {
  // Controlla che ci siano file da caricare
  if (this.filesDaCaricare.length === 0) {
    alert("Errore: seleziona almeno un file da caricare.");
    return;
  }

  // Se è stato passato un singolo file, carichiamo solo quello. Altrimenti carichiamo tutti.
  const filesDaCaricare = fileInput
    ? this.filesDaCaricare.filter(f => f === fileInput)
    : this.filesDaCaricare;

  // Ordiniamo i file mettendo davanti il file con angolazione 'frontale'
  filesDaCaricare.sort((a, b) => {
    const metaA = this.metadatiPerFile.get(a);
    const metaB = this.metadatiPerFile.get(b);
    const angA = metaA?.['angolazione'];
    const angB = metaB?.['angolazione'];
    if (angA === 'frontale') return -1;
    if (angB === 'frontale') return 1;
    return 0;
  });

  // Log dell'ordine finale dei file da caricare
  console.log("Ordine finale dei file da caricare:");
  filesDaCaricare.forEach(f => {
    const meta = this.metadatiPerFile.get(f);
    console.log(`- ${f.name} → angolazione: ${meta?.['angolazione']}`);
  });

  // Verifica che l'utente abbia specificato una cartella
  const folder = this.inputFolder?.trim();
  if (!folder) {
    alert("Errore: specifica una cartella di destinazione.");
    return;
  }

  // Inizializza lo stato
  this.uploadInCorso = true;
  this.statoUpload.clear();
  this.motiviErroreUpload.clear();

  const formData = new FormData();
  const metadataList: { folder: string; context: MediaContext }[] = [];

  // Aggiungiamo i file al FormData e raccogliamo i relativi metadati
  filesDaCaricare.forEach(file => {
    const context = this.metadatiPerFile.get(file);
    if (context) {
      formData.append('file', file);
      metadataList.push({ folder, context });
    }
  });

  // Salviamo il numero di file da caricare
  const numeroDeiFileDaCaricare = filesDaCaricare.length;

  // Aggiungiamo i metadati in formato JSON al FormData
  metadataList.forEach(metadata => {
    formData.append('cloudinary', JSON.stringify(metadata));
  });

  // Verifica se si tratta di una cartella di configurazione
  const isConfig = folder.toLowerCase().includes('config');

  // Invia la richiesta al backend
  this.adminService.uploadMedia(formData, isConfig).subscribe({
    next: (res) => {
      // Verifica che la risposta contenga un array valido
      if (Array.isArray(res.data)) {
        console.log("Risposta dal backend dettagli ok e ko:", JSON.stringify(res.data));

        // Contatori per tenere traccia dello stato degli upload
        let numeroOk = 0;
        let contatoreRisposte = 0;

        // Elaborazione di ciascun risultato ricevuto
        res.data.forEach((uploadResult: { key_file: string; status: 'ok' | 'ko'; reason?: string }) => {
          console.log("File attuali:", this.filesDaCaricare.map(f => f.name));
          console.log("Risultato ricevuto:", uploadResult);

          // Cerca il file originale tramite nome
          const fileMatch = this.filesDaCaricare.find(f => f.name === uploadResult.key_file);

          if (fileMatch) {
            // Aggiorna lo stato dell'upload
            this.statoUpload.set(fileMatch, uploadResult.status);

            if (uploadResult.status === 'ko') {
              this.motiviErroreUpload.set(fileMatch, uploadResult.reason || 'Errore sconosciuto');
            } else {
              numeroOk++;
              this.statoUpload.delete(fileMatch);
              this.filesDaCaricare = this.filesDaCaricare.filter(f => f !== fileMatch);
            }
          } else {
            console.warn(`File non trovato per chiave: ${uploadResult.key_file}`);
          }

          // Incrementa il numero di risposte elaborate
          contatoreRisposte++;

          // Quando tutte le risposte sono state elaborate, verifica se chiudere il dialog
          if (contatoreRisposte === numeroDeiFileDaCaricare) {
            this.uploadInCorso = false;

            if (numeroOk === numeroDeiFileDaCaricare) {
              console.log("Tutti i file OK, chiudo il dialog");
              this.chiudiDialog();
            } else {
              console.warn("Alcuni file non sono stati caricati correttamente.");
            }
          }
        });
      } else {
        console.error("Risposta backend non valida o mancante");
        this.uploadInCorso = false;
      }
    },
    error: (err) => {
      // Gestione degli errori generici durante l'upload
      console.error("Errore durante upload:", err);
      this.filesDaCaricare.forEach(file => {
        this.statoUpload.set(file, 'ko');
        this.motiviErroreUpload.set(file, "Errore generico durante l'upload");
      });
      this.uploadInCorso = false;
    }
  });
}




/**
 * Metodo per selezionare un file come "frontale"
 * - Se viene deselezionato, rimuove il flag e cancella "angolazione" dai metadati
 * - Se viene selezionato un nuovo file, trasferisce i metadati dal vecchio
 * - Mantiene un solo file frontale alla volta
 */
private ultimoFileFrontaleSelezionato: File | null = null;

selezionaFrontale(file: File, isChecked: boolean): void {
const nuovoFile = file;

  if (!isChecked) {
    // ❌ Deseleziono il frontale, ma conservo i metadati
    const metadati = this.metadatiPerFile.get(file);
    if (metadati) {
      this.metadatiPerFile.set(file, {
        ...metadati,
        angolazione: 'altra' // ✅ Cambio solo l'angolazione
      });
    }
    this.fileSelezionatoComeFrontale = null;
    // Non azzero ultimoFileFrontaleSelezionato perché potrei riselezionare lo stesso file
    console.log('❌ Frontale deselezionato (ma metadati conservati):', file.name);
    return;
  }

  const vecchioFile = this.ultimoFileFrontaleSelezionato;

  console.log('File selezionato:', nuovoFile);
  console.log('Ultimo frontale selezionato:', vecchioFile);

  let metadatiDaTrasferire: MediaContext | undefined;

  // Se esiste un precedente frontale diverso dal nuovo, salvo e rimuovo i suoi metadati
if (vecchioFile && vecchioFile !== nuovoFile) {
  console.log("Vecchio file");
  const metadatiVecchio = this.metadatiPerFile.get(vecchioFile);
  console.log("Vecchi metadati", metadatiVecchio);
  if (metadatiVecchio) {
    // Trasferisco i metadati, ma aggiorno anche il vecchio con angolazione 'altra'
    metadatiDaTrasferire = { ...metadatiVecchio };
    this.metadatiPerFile.set(vecchioFile, {
      ...metadatiVecchio,
      angolazione: 'altra'
    });
  }
}


  // Recupero eventuali metadati già associati al nuovo file (potrebbero essere incompleti)
  const metadatiEsistenti = this.metadatiPerFile.get(nuovoFile);

  let metadatiFinali: MediaContext;

  if (metadatiDaTrasferire) {
    // Uso i metadati del precedente frontale
    metadatiFinali = {
      ...metadatiDaTrasferire,
      angolazione: 'frontale'
    };
    console.log('Metadati trasferiti dal vecchio frontale:', metadatiFinali);
  } else if (metadatiEsistenti) {
    // Uso quelli già presenti sul nuovo file
    metadatiFinali = {
      ...metadatiEsistenti,
      angolazione: 'frontale'
    };
    console.log('Metadati esistenti aggiornati:', metadatiFinali);
  } else {
    // Nessun metadato disponibile, uso valori base
    metadatiFinali = {
      display_name: nuovoFile.name.split('.')[0],
      angolazione: 'frontale',
      descrizione: 'Da inserire',
      quantita: '0'
    };
    console.log('Metadati creati da zero:', metadatiFinali);
  }

  // Applico i metadati al nuovo frontale selezionato
  this.metadatiPerFile.set(nuovoFile, metadatiFinali);

  // Imposto angolazione 'altra' a tutti gli altri file
// ✅ Propaga i metadati comuni a tutti i file del gruppo (escluso angolazione)
this.metadatiPerFile.forEach((metadati, f) => {
  if (f === nuovoFile) return; // Salto il frontale, già aggiornato

  const metadatiAggiornati: MediaContext = {
    ...metadatiFinali,
    angolazione: 'altra' // Tutti gli altri diventano 'altra'
  };

  this.metadatiPerFile.set(f, metadatiAggiornati);
});

  // Aggiorno gli stati interni
  this.fileSelezionatoComeFrontale = nuovoFile;
  this.ultimoFileFrontaleSelezionato = nuovoFile;

  console.log('Nuovo frontale impostato:', nuovoFile.name);
  console.log('Stato metadati finale:', this.metadatiPerFile);
}


  formatKeyLabel(key: string): string {
    return key.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, char => char.toUpperCase());
  }

}