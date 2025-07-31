/**
 * Questo componente Angular consente l'upload di file multimediali (immagini, audio, video)
 * tramite drag and drop o selezione manuale, in modalità popup.
 * La cartella di destinazione viene fornita dal componente padre.
 * I metadati dei file sono gestiti e personalizzabili prima dell'invio.
 */

import { Component, OnInit, OnDestroy, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { AdminService } from '../../../services/admin.service';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialogModule } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MediaContext } from '../../../pages/home/home.component';
import { MatDialog } from '@angular/material/dialog';
import { FormsModule } from '@angular/forms';
import { EditDataAdminComponent } from '../edit-data-admin/edit-data-admin.component';
import { SharedDataService } from '../../../services/shared-data.service';
import { MatTableModule } from '@angular/material/table';
import { MatRadioModule } from '@angular/material/radio';
import { firstValueFrom } from 'rxjs'; // Necessario per convertire l'observable in promise

export interface UploadResult {
  key_file: string;
  status: 'ok' | 'ko';
  angolazione: string,
  reason?: string;
}

@Component({
  selector: 'app-upload-data-admin',
  standalone: true,
  imports: [
    MatIconModule,
    CommonModule,
    MatProgressSpinnerModule,
    MatDialogModule,
    MatTooltipModule,
    FormsModule,
    MatTableModule,
    MatRadioModule
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

  mancaFrontaleMethod(): boolean {
    return !this.fileSelezionatoComeFrontale;
  }
  /**
   * Metodo per aprire un popup e modificare i metadati di un file selezionato.
   * In input passa il file, così da leggere o creare i metadati associati.
   */
  apriPopUpEditMedia(file: File, isUploadComponent: boolean): void {
    // Recupero i metadati già presenti oppure inizializzo a oggetto vuoto
    const metadataEsistenti = this.metadatiPerFile.get(file) || {};

    // Clono i metadati per evitare modifiche dirette prima della conferma
    const metadataClonati: MediaContext = { ...metadataEsistenti };

    // Apro il popup passando file e metadati
    const dialogRef = this.dialog.open(EditDataAdminComponent, {
      panelClass: 'popup-edit-metadati-dialog',
      data: {
        file,
        context: metadataClonati,
        isUploadComponent: isUploadComponent
      }
    });

    dialogRef.afterClosed().subscribe((result: MediaContext | undefined) => {
      console.log("DialogRed chiamato", result);
      if (result) {
        console.log("[UploadDataAdmin] RICEVO CONTEXT AGGIORNATO: ", result);
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
        this.filesDaCaricare = [...this.filesDaCaricare, file]; // per il mat data table

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
  async uploadFiles(fileInput?: File): Promise<void> {
    let risultatiTotali: string[] = []; // variabile che inserisco tutti i risultati se qui dentro trovo almeno un ko non chiudo il pop up 

    // Controlla che ci siano file da caricare
    if (this.filesDaCaricare.length === 0) {
      alert("Errore: seleziona almeno un file da caricare.");
      return;
    }

    // Verifica che l'utente abbia specificato una cartella
    const folder = this.inputFolder?.trim();
    if (!folder) {
      alert("Errore: specifica una cartella di destinazione.");
      return;
    }

    const isConfig = folder.toLowerCase().includes('config');

    // ───── Step 1: Recupero del file frontale (se presente) ─────
    const fileDaCaricareFrontale = this.filesDaCaricare.find(f => {
      const meta = this.metadatiPerFile.get(f);
      return meta?.['angolazione'] === 'frontale';
    });

    if (fileDaCaricareFrontale) {
      console.log("File frontale identificato:", fileDaCaricareFrontale.name);
      console.log("Metadati del file frontale:", this.metadatiPerFile.get(fileDaCaricareFrontale));
    } else {
      console.warn("Nessun file frontale trovato tra i file selezionati.");
    }

    const filesDaCaricareNonFrontali = fileInput
      ? [fileInput].filter(f => this.metadatiPerFile.get(f)?.['angolazione'] !== 'frontale')
      : this.filesDaCaricare.filter(f => this.metadatiPerFile.get(f)?.['angolazione'] !== 'frontale');

    console.log("File con altre angolazioni da caricare:");
    filesDaCaricareNonFrontali.forEach(f => {
      const meta = this.metadatiPerFile.get(f);
      console.log(`- ${f.name} → angolazione: ${meta?.['angolazione']}`);
    });

    const numeroDeiFileDaCaricare =
      filesDaCaricareNonFrontali.length + (fileDaCaricareFrontale ? 1 : 0);
    console.log("Numero totale di file da caricare:", numeroDeiFileDaCaricare);

    this.uploadInCorso = true;
    this.statoUpload.clear();
    this.motiviErroreUpload.clear();

    // Prepara il FormData per il file frontale
    const formDataFrontale = new FormData();
    let contextFrontale: MediaContext | undefined;
    if (fileDaCaricareFrontale) {
       contextFrontale = this.metadatiPerFile.get(fileDaCaricareFrontale); 
      console.log("Context recuperato per il file frontale:", contextFrontale);

      if (contextFrontale) {
        formDataFrontale.append('file', fileDaCaricareFrontale);
        formDataFrontale.append('folder', folder);
        formDataFrontale.append('cloudinary', JSON.stringify(contextFrontale));
      }
    }
     

    // ───── Caricamento del file frontale con attesa risposta ─────
    const risultatoCaricamentoFrontale = await this.caricaMediaInToCloud(formDataFrontale, isConfig);
    console.log("Inizio a caricare la frontale", JSON.stringify(risultatoCaricamentoFrontale));

    //recupero il campo status
    const statusFrontale = risultatoCaricamentoFrontale.find(r => r.angolazione === 'frontale')?.status;
    console.log("Risultato caricamento della frontale (solo status):", statusFrontale);


    if (statusFrontale === 'ok') {
      if(filesDaCaricareNonFrontali.length > 0){

     
      console.log(" La frontale è stata caricata correttamente, adesso procedo al caricamento delle altre angolazioni...");
      risultatiTotali.push(statusFrontale); //inizio a inserire il primo stato
      let formDataNonFrontale = new FormData();
      //creo il contex per la non frontale sovrascrivendo l'angolazione
      let contextNonFrontale: MediaContext | undefined = contextFrontale;
        if (contextFrontale) {
          contextNonFrontale = {
          ...contextFrontale,
          angolazione: 'altra'  // Sovrascrive solo la chiave angolazione
        };

      console.log("Anche per le non frontali carico il seguente context: ", contextFrontale);


    }
      for (const file of filesDaCaricareNonFrontali) {
        // Crea un nuovo FormData per ogni file non frontale
        formDataNonFrontale.append('file', file);
        formDataNonFrontale.append('folder', folder);
        formDataNonFrontale.append('cloudinary', JSON.stringify(contextNonFrontale));
      }

      
        // Attende il caricamento e stampa il risultato
        const risultatoCaricamentoNonFrontali = await this.caricaMediaInToCloud(formDataNonFrontale, isConfig);
        console.log("aaaaa", JSON.stringify(risultatoCaricamentoNonFrontali));
        // Trova il primo risultato che NON è frontale e recupera solo il campo 'status'
        const statusNonFrontale: string[] = risultatoCaricamentoNonFrontali.map(r => r.status);
        // Logga correttamente lo status del file non frontale
        console.log("Risultato caricamento della non frontale (solo status):", statusNonFrontale);
        // Aggiunge lo status alla lista dei risultati totali (string[])

        //mi serve sapere se c e almeno un ko 
         statusNonFrontale.push(statusFrontale);
         const statusFinale: boolean = statusNonFrontale.some(s => s === 'ko')

        const rapportinoUpload = {
            totale_file: numeroDeiFileDaCaricare,
            status_frontali_caricati: statusFrontale,
            status_non_frontali_caricati: statusNonFrontale,
            status_finale: statusFinale ? 'ko' : 'ok' // se in totale, ci sono dei ko non chiudere il pop up altrimenti chiudi il pop up e invia la notifica ad app component

        }
        console.log("Rapportino finale: ", rapportinoUpload);
      
      if(rapportinoUpload.status_finale === 'ko'){
        console.log("Ci sono stati errori durante l'upload di una non frontale")
      }
      else{
        this.chiudiDialog();
      }
    } else {
          console.log("Non ci sono altre angolazioni per quest immagine");
    }

    } else {
      console.error(" Errore nel caricamento della frontale. Upload interrotto.");
    }


    this.uploadInCorso = false; //disabilito lo spinner di caricamento


    // Qui puoi continuare con il caricamento degli altri file...
  }



  // Metodo asincrono per inviare i media al backend e attendere la risposta
  async caricaMediaInToCloud(formData: FormData, isConfig: boolean): Promise<UploadResult[]> {
    try {
      // Utilizziamo firstValueFrom per trasformare l'observable (restituito da uploadMedia)
      // in una Promise. Questo ci consente di usare 'await' e scrivere codice più lineare.
      const response = await firstValueFrom(this.adminService.uploadMedia(formData, isConfig));

      // Verifica che la risposta contenga un array valido
      if (Array.isArray(response?.data)) {
        console.log("Risposta dal backend dettagli ok e ko:", JSON.stringify(response.data));

        // Elaboriamo ciascun risultato restituito dal backend
        response.data.forEach((uploadResult: UploadResult) => {
          console.log("File attuali:", this.filesDaCaricare.map(f => f.name));
          console.log("Risultato ricevuto:", uploadResult);

          // Trova il file corrispondente tramite il nome
          const fileMatch = this.filesDaCaricare.find(f => f.name === uploadResult.key_file);

          if (fileMatch) {
            // Aggiorna lo stato dell'upload per quel file
            this.statoUpload.set(fileMatch, uploadResult.status);

            if (uploadResult.status === 'ko') {
              // Salva il motivo dell'errore
              this.motiviErroreUpload.set(fileMatch, uploadResult.reason || 'Errore sconosciuto');
            } else {
              // Se il caricamento è andato a buon fine, rimuove il file dalla lista
              this.statoUpload.delete(fileMatch);
              this.filesDaCaricare = this.filesDaCaricare.filter(f => f !== fileMatch);
            }
          } else {
            // File non trovato nella lista: log di avviso
            console.warn(`File non trovato per chiave: ${uploadResult.key_file}`);
          }
        });

        // Ritorna la lista dei risultati ricevuti
        return response.data;
      } else {
        // La risposta non contiene dati validi: restituisce array vuoto o può generare un errore
        console.error("Risposta backend non valida o mancante");
        return [];
      }

    } catch (err) {
      // Gestione degli errori in fase di richiesta HTTP
      console.error("Errore durante upload:", err);
      this.filesDaCaricare.forEach(file => {
        this.statoUpload.set(file, 'ko');
        this.motiviErroreUpload.set(file, "Errore generico durante l'upload");
      });
      return []; // In caso di errore, restituiamo un array vuoto per coerenza
    }
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
      //  Deseleziono il frontale, ma conservo i metadati
      const metadati = this.metadatiPerFile.get(file);
      if (metadati) {
        this.metadatiPerFile.set(file, {
          ...metadati,
          angolazione: 'altra' //  Cambio solo l'angolazione
        });
      }
      this.fileSelezionatoComeFrontale = null;
      // Non azzero ultimoFileFrontaleSelezionato perché potrei riselezionare lo stesso file
      console.log(' Frontale deselezionato (ma metadati conservati):', file.name);
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
    //  Propaga i metadati comuni a tutti i file del gruppo (escluso angolazione)
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
  if (key === 'display_name') return 'Nome';
  return key
    .replace(/_/g, ' ')                   // sostituisce "_" con spazio
    .toLowerCase()                        // converte tutto in minuscolo
    .replace(/\b\w/g, char => char.toUpperCase()); // mette maiuscola all'inizio di ogni parola
}

}