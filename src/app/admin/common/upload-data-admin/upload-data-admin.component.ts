// questa classe esegue l'upload di un documento immagine audio o video da pop up nella console quando siamo in modalita admin
/* come meccanismo di upload, uso drag and drop o anche l'upload semplice singolo. Ovvero, fare in modo di caricare piu 
file contemporaneamente, devo poi modificare il backend in modo che puo ricevere una lista di file

Come funziona drag and drop

dragover =  Succede quando il file è sopra l’area di drop. Devi impedire il 
            comportamento di default del browser (es. apertura file) e puoi aggiungere uno stile visivo.
            Difatti il browser che fa se trascino una foto nel browser lui me la apre

dragleave = L’utente ha spostato il file fuori dall’area (serve a rimuovere effetti visivi di hover).

drop = L’utente ha rilasciato il file. Qui si accede a event.dataTransfer.files per leggere i file e processarli. ci sono i file o il file da caricare

QUESTO COMPONENTE, CONSENTE DI UPLOADARE UN MEDIA LA FOLDER IN INGRESSO VIENE FORNITA DAL PADRE
*/

import { Component, OnInit, OnDestroy, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { CmsService } from '../../../services/cms.service';
import { MatIcon } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { CloudinaryDataUpload } from '../../../cms/cms-upload/cms-upload.component'; //interfaccia per poter chiamare l'upload di cmsservice per uploadare un file
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialog } from '@angular/material/dialog';
import { MatDialogModule } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { EditDataAdminComponent } from '../edit-data-admin/edit-data-admin.component';
@Component({
  selector: 'app-upload-data-admin',
  imports: [
    MatIcon,
    CommonModule,
    MatProgressSpinnerModule,
    MatDialogModule,
    MatTooltipModule],
  templateUrl: './upload-data-admin.component.html',
  styleUrl: './upload-data-admin.component.scss'
})
export class UploadDataAdminComponent implements OnInit, OnDestroy {

  constructor(
    private cmsService: CmsService,
    private dialog: MatDialog,
    private dialogRef: MatDialogRef<UploadDataAdminComponent>,
    @Inject(MAT_DIALOG_DATA) public folder: string //LA FOLDER VIENE PASSATA DAL PADRE
  ) { }

  // Variabile booleana per attivare lo stile visivo quando un file è sopra l’area di drop
  isHovering = false;

  // Lista dei file selezionati o droppati, pronti per essere caricati
  filesDaCaricare: File[] = [];
  anteprimeFile: Map<File, string> = new Map(); // Mappa File → URL blob

  ngOnInit(): void {
    // Intercetta eventi drag and drop globali per impedire che il browser apra il file
    // se rilasciato fuori dalla drop zone (es. accidentalmente sul body o finestra)
    window.addEventListener('dragover', this.preventBrowserDefault, false);
    window.addEventListener('drop', this.preventBrowserDefault, false);
  }

aggiungiFiles(files: File[]) {
  files.forEach(file => {
    const giaPresente = this.filesDaCaricare.some(
      f => f.name === file.name && f.size === file.size
    );

    if (!giaPresente) {
      // ✅ Aggiungo alla lista dei file da caricare
      this.filesDaCaricare.push(file);

      // ✅ Creo anteprima se è immagine, video o audio
      const tipoGenerico = file.type.split('/')[0];
      if (['image', 'video', 'audio'].includes(tipoGenerico)) {
        const previewUrl = URL.createObjectURL(file);
        this.anteprimeFile.set(file, previewUrl);
      }

      // ✅ Imposto i metadati iniziali predefiniti per il file
      this.metadatiPerFile.set(file, {
        nome_file: file.name.split('.')[0],
        angolazione: 'frontale',
        quantita: '0',
        descrizione: 'Descrizione da inserire'
      });
    }
  });
}



  rimuoviFile(file: File): void {
    // Rimuove dalla lista file
    this.filesDaCaricare = this.filesDaCaricare.filter(f => f !== file);

    // Rimuove anche l’anteprima se presente
    this.anteprimeFile.delete(file);
  }


  rimuoviTuttiIFiles(): void {
    // Svuota l'elenco dei file da caricare
    this.filesDaCaricare = [];

    // Svuota tutte le anteprime
    this.anteprimeFile.clear();
  }



  ngOnDestroy(): void {
    // Rimuove gli event listener globali quando il componente viene distrutto
    window.removeEventListener('dragover', this.preventBrowserDefault, false);
    window.removeEventListener('drop', this.preventBrowserDefault, false);
  }

  /**
   * Previene il comportamento predefinito del browser su eventi drag/drop
   * globali (come apertura del file se rilasciato fuori dalla drop-area)
   */
  preventBrowserDefault(event: Event): void {
    event.preventDefault();
  }

  /**
   * Evento scatenato quando un file viene trascinato sopra l’area di drop
   * Impedisce il comportamento di default del browser (apertura immagine)
   * e attiva la classe CSS .hover-active per cambiare stile visivo
   */
  onDragOver(event: DragEvent): void {
    event.preventDefault();
    this.isHovering = true;
  }

  /**
   * Evento scatenato quando il file esce dall’area di drop senza essere rilasciato
   * Serve a rimuovere lo stile di hover
   */
  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    this.isHovering = false;
  }

  /**
   * Evento scatenato quando uno o più file vengono rilasciati nell’area di drop
   * Recupera i file da event.dataTransfer.files e li gestisce (es. invio al backend)
   */
  onDrop(event: DragEvent): void {
    console.log("File caricato: ", JSON.stringify(event));
    event.preventDefault(); // Impedisce comportamento predefinito del browser
    this.isHovering = false;

    // Recupera i file rilasciati
    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      const fileArray = Array.from(files); // Converte FileList in array
      console.log('File ricevuti nel drop:', fileArray);
      //riempio l'array
      this.aggiungiFiles(fileArray);

    }
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const files = input.files;
    console.log("File aggiunto all array: ", files);
    if (files && files.length > 0) {
      const fileArray = Array.from(files);
      this.aggiungiFiles(fileArray);
    }

    //reset
    input.value = '';
  }



  /**
   * Metodo per chiudere il dialog (popup) manualmente, es. tramite pulsante "Chiudi"
   */
  chiudiDialog(reload: boolean): void {
    this.dialogRef.close();
    setTimeout(() => {
      if (reload) {
        window.location.reload();
      }
    }, 400);
  }



  /**
  * Metodo che gestisce l'upload multiplo di file verso Cloudinary,
  * inviando uno a uno ogni file selezionato o trascinato.
  */
  // Stato di caricamento per ogni file (verde = ok, rosso = errore)
  statoUpload: Map<File, 'ok' | 'ko'> = new Map();
  uploadInCorso: boolean = false; // dichiarala all'inizio del componente
  motiviErroreUpload = new Map<File, string>(); //tooltip mi appoggio e vedo qual e l errore


  //setto il context da popUp
  nome_file: string = '';
  descrizione: string = '';
  quantita: string = '';
  angolazione: string = '';

    //variabile che se ho 3 file da caricare e ne carico uno alla volta, viene incrementato sempre cosi non faccio la reload del pop up 
    //quando questa variabile assume la length di filesDaCaricare.length allora effettua la reload perche vuol dire che è andato tutto bene 
  counterFile: number = 0;
  uploadFiles(fileInput?: File): void {

  // ✅ Caso 1: Nessun file da caricare → blocco e avviso
  if (this.filesDaCaricare.length === 0) {
    alert("Errore: seleziona almeno un file da caricare.");
    return;
  }

  // ✅ Caso 2: Caricamento singolo (se è stato passato fileInput)
  // Altrimenti carico l'intera lista
  let filesDaCaricare: File[];
  if (fileInput) {
    filesDaCaricare = this.filesDaCaricare.filter(f => f === fileInput);
    console.log("Carico singolo file:", fileInput.name);
  } else {
    filesDaCaricare = this.filesDaCaricare;
    console.log("Carico tutti i file:", filesDaCaricare.map(f => f.name));
  }

  // ✅ Controllo che sia stata specificata una cartella di destinazione
  const folder = this.folder?.trim();
  if (!folder) {
    alert("Errore: specifica una cartella di destinazione.");
    return;
  }

  // ✅ Verifico che la struttura della cartella sia valida (massimo 3 livelli)
  const livelli = folder.split('/').filter(p => p.trim() !== '');
  if (livelli.length > 3) {
    alert('Errore: puoi usare al massimo 3 livelli di cartella (es. "Borse/Conchiglia/Grande").');
    return;
  }

  // ✅ Inizio fase di upload: resetto gli stati di caricamento
  this.uploadInCorso = true;
  this.statoUpload.clear();
  this.motiviErroreUpload.clear();

  const formData = new FormData();
  const metadataList: CloudinaryDataUpload[] = [];

  // ✅ Preparo ogni file con i relativi metadati
  filesDaCaricare.forEach((file: File) => {
    formData.append('file', file);

    const context = this.metadatiPerFile.get(file) || {
      nome_file: file.name.split('.')[0],
      descrizione: '',
      quantita: '0',
      angolazione: 'frontale'
    };

    const metadata: CloudinaryDataUpload = {
      folder,
      context
    };

    metadataList.push(metadata);
  });

  // ✅ Aggiungo i metadati al FormData
  metadataList.forEach(metadata => {
    formData.append('cloudinary', JSON.stringify(metadata));
  });

  // ✅ Verifico se è una cartella di configurazione
  const isConfig = folder.toLowerCase().includes('config');

  // ✅ Invio al backend
  this.cmsService.uploadMedia(formData, isConfig).subscribe({
    next: (res) => {
      console.log('Upload completato:', res);
      let ciSonoErrori = false;

      // ✅ Gestisco la risposta del backend
      if (Array.isArray(res.data)) {
        res.data.forEach((uploadResult: any) => {
          const nomeFile = uploadResult.nome_file;
          const stato = uploadResult.status;
          const motivo = uploadResult.reason;

          // ✅ Cerco il file corrispondente nella lista caricata
          const fileMatch = filesDaCaricare.find(f => {
            const meta = this.metadatiPerFile.get(f);
            const nomeAssociato = meta && 'nome_file' in meta ? meta['nome_file'] : f.name.split('.')[0];
            return nomeAssociato === nomeFile;
          });

          if (fileMatch) {
            this.statoUpload.set(fileMatch, stato);

            if (stato === 'ko') {
              ciSonoErrori = true;
              if (motivo) {
                this.motiviErroreUpload.set(fileMatch, motivo);
              }
            }

            // ✅ Se OK → rimuovo file da lista e da stato dopo 2s
            if (stato === 'ok') {
              setTimeout(() => {
                this.statoUpload.delete(fileMatch);
                this.filesDaCaricare = this.filesDaCaricare.filter(f => f !== fileMatch);

                // ✅ Se tutti i file sono stati caricati, ricarico la pagina
                if (!ciSonoErrori && this.filesDaCaricare.length === 0) {
                  setTimeout(() => {
                    window.location.reload();
                  }, 800);
                }
              }, 2000);
            }
          }
        });
      }

      this.uploadInCorso = false;
    },

    error: (err) => {
      console.error("Errore durante l'upload dei file:", err);

      // ✅ In caso di errore generico → segno tutti i file come KO
      this.filesDaCaricare.forEach((file: File) => {
        this.statoUpload.set(file, 'ko');
        this.motiviErroreUpload.set(file, 'Errore generico durante l\'upload');
      });

      this.uploadInCorso = false;
    }
  });
}


  // Questo metodo serve per poter editare un anteprima di un file aprendo un pop up 
  //in input passo il file in modo da creare una mappa file metadati
  // Mappa che associa ciascun file ai suoi metadati (nome file, descrizione, quantità, angolazione e altri campi personalizzati)
// Viene aggiornata ogni volta che si apre il popup per modificare i metadati del file
metadatiPerFile: Map<File, CloudinaryDataUpload['context']> = new Map();

// Questo metodo serve per aprire un popup e modificare i metadati di un file selezionato
// In input passo il file, così da leggere o creare i metadati associati
apriPopUpEditFile(file: File): void {
  // Recupero i metadati già salvati per il file, se presenti; altrimenti uso un oggetto vuoto
  const metadataEsistenti = this.metadatiPerFile.get(file) || {};

  // Clono i metadati per evitare modifiche dirette in memoria se l'utente annulla il popup
  const metadataClonati = JSON.parse(JSON.stringify(metadataEsistenti));

  // Apro il popup passando il file e i metadati correnti (già salvati o vuoti)
  // In questo modo se l’utente ha già compilato qualcosa, ritrova i valori precedenti
  const dialogRef = this.dialog.open(EditDataAdminComponent, {
    width: '720px',
    maxHeight: '90vh',
    panelClass: 'popup-metadati-dialog',
    data: {
      file,
      context: metadataClonati
    }
  });

  // Quando il popup viene chiuso, controllo se l'utente ha cliccato su "Salva"
  // Se sì, aggiorno la mappa dei metadati con i nuovi valori restituiti
  dialogRef.afterClosed().subscribe((result) => {
    if (result) {
      this.metadatiPerFile.set(file, result);
      console.log("Metadati ricevuti da [EditContextBeforeUploadComponent]:", result);
    }
  });
}




//de normalizzo le chiavi normalizzate da edit context before upload solo per la visualizzazione
// Utility nel component
formatKeyLabel(key: string): string {
  return key
    .replace(/_/g, ' ')
    .toLowerCase()
    .replace(/\b\w/g, char => char.toUpperCase());
}


}
