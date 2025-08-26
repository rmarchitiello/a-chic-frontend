/**
 * Questo componente Angular consente l'upload di file multimediali (immagini, audio, video)
 * tramite drag and drop o selezione manuale, in modalità popup.
 * La cartella di destinazione viene fornita dal componente padre.
 * I metadati dei file sono gestiti e personalizzabili prima dell'invio.
 * 
 * 
 * 
 *
 * 
 * 
 * Evento	Quando si attiva	Cosa segnala
dragenter	 Appena entra nel div (anche di 1px)	INGRESSO
dragover	 Ogni millisecondo finché ci stai sopra	MOVIMENTO
dragleave	 Quando esci dal div	USCITA
drop	📥 Quando rilasci il file	INSERIMENTO
 */

import { Component, OnInit, OnDestroy, Inject, Input, EventEmitter, Output } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { AdminService } from '../../../services/admin.service';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialogModule } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MediaContext } from '../../../app.component';
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
    @Inject(MAT_DIALOG_DATA) public data: { inputFolder: string, files?: File[], onlyAnteprime: boolean } // La cartella viene fornita dal padre
    /* Se viene inviata anche la lista dei file vuol dire che editor component non ha premuto il tasto per aggiungere  ma ha droppato direttamente lui */
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

  @Input() inputFolderFromEdiorOneWayBinding!: string;
  @Input() droppedByEditorOneWayBinding!: boolean;
  @Input() filesDroppedFromEditorOneWayBinding!: File[];
  @Input() typeMediaFromEditorOneWayBinding: 'image' | 'video' | 'audio' | '' = '';
  @Input() isOnlyAnteprima!: boolean; //variabile che mi viene passata dall editor per capire se devo caricare anteprime o anteprime + altre (serve al backend praticamente);
  @Output() eventoChiudiUpload = new EventEmitter<boolean>(); //emetto al padre l'evento di fine upload

  isDroppedByEditor: boolean = false;


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
    //quest if, serve al massimo per gestire l'apertura del pop up dall editor, ma al momento non viene aperto piu
    if(this.data.onlyAnteprime){
      this.isOnlyAnteprima = this.data.onlyAnteprime;
    }

    if(this.isOnlyAnteprima){
      console.log("[UploadDataAdminComponent] stai caricando solo le anteprime");
    }
    else{
      console.log("[UploadDataAdminComponent] stai caricando anteprime + altre angolazioni");
    }

    console.log("UploadDataAdminComponent inizializzato", this.dialogRef);
    this.isDroppedByEditor = this.droppedByEditorOneWayBinding
    console.log("Droppato dall editor ? ", this.isDroppedByEditor)

    this.inputFolder = this.data?.inputFolder || this.inputFolderFromEdiorOneWayBinding;
    console.log("Folder dove caricare: ", this.inputFolder);




    //quando l'editor droppa aggiungo i file e chiamo l'upload
    if (this.isDroppedByEditor) {
      const filesDroppedFromEditor = this.data?.files || this.filesDroppedFromEditorOneWayBinding;
      console.log("Files droppati dall editor: ", filesDroppedFromEditor);
      this.aggiungiFiles(filesDroppedFromEditor);
      console.log("File aggiunto sto per caricare: . . . ")
      this.uploadFiles();
    }



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

    this.sharedService.notifyCacheIsChanged(); // anche se la notifichi, il dialog non si chiude
  }



  /**
 * Avvia l'upload dei file (singolo o multiplo)
 */
  /**
 * Avvia l'upload dei file (singolo o multiplo) applicando la logica:
 * - isOnlyAnteprima = true  → TUTTI i file come 'frontale' (item separati)
 * - isOnlyAnteprima = false → 1° file 'frontale' + gli altri 'altra' (stesso display_name del frontale)
 */
async uploadFiles(): Promise<void> {
  console.log("Inizio metodo di upload");

  // ─────────────────────────────────────────────────────────────────────────────
  // 1) Validazioni iniziali e setup
  // ─────────────────────────────────────────────────────────────────────────────
  const folder = this.inputFolder?.trim();
  console.log("folder input: ", folder);

  if (!folder) {
    alert("Errore: specifica una cartella di destinazione.");
    return;
  }

  const isConfig = folder.toLowerCase().includes('config');
  let risultatiTotali: string[] = []; // per eventuali aggregazioni di stato (resto della tua logica)

  // ─────────────────────────────────────────────────────────────────────────────
  // 2) Preparazione metadati per ogni file (solo se upload da editor)
  //    Genero display_name univoci e assegno l'angolazione in base a isOnlyAnteprima
  // ─────────────────────────────────────────────────────────────────────────────
  if (this.isDroppedByEditor) {
    console.log("UPLOAD DA EDITOR");
    console.log("File da caricare droppati dall'editor:", this.filesDaCaricare);
    console.log("Media input type ricevuto:", this.typeMediaFromEditorOneWayBinding);

    const timestamp = Date.now();

    this.filesDaCaricare.forEach((file, index) => {
      // Se SOLO ANTEPRIME → tutti 'frontale'
      // Altrimenti → primo 'frontale', gli altri 'altra'
      const angolazione = this.isOnlyAnteprima
        ? 'frontale'
        : (index === 0 ? 'frontale' : 'altra');

      const context: MediaContext = {
        display_name: 'Nome_' + timestamp + '_' + index,      // univoco per file
        type: this.typeMediaFromEditorOneWayBinding,           // 'image' | 'video' | 'audio'
        descrizione: "Da inserire",
        quantita: "0",
        angolazione
      };

      this.metadatiPerFile.set(file, context);
    });
  }

  // Verifica minimi: deve esserci almeno 1 file
  if (this.filesDaCaricare.length === 0) {
    alert("Errore: seleziona almeno un file da caricare.");
    return;
  }

  // Pulizia stato UI upload
  this.uploadInCorso = true;
  this.statoUpload.clear();
  this.motiviErroreUpload.clear();

  // ─────────────────────────────────────────────────────────────────────────────
  // 3) BRANCH A → SOLO ANTEPRIME (this.isOnlyAnteprima === true)
  //    Invia un unico POST con N file e per ciascuno il proprio metadato 'frontale'.
  //    Ogni file è un item separato (display_name univoco).
  // ─────────────────────────────────────────────────────────────────────────────
  if (this.isOnlyAnteprima) {
    console.log("Modalità attiva: SOLO ANTEPRIME → tutti i file saranno 'frontale'");

    const formDataAllFrontali = new FormData();

    for (const file of this.filesDaCaricare) {
      const ctx = this.metadatiPerFile.get(file);
      // sicurezza: se per qualunque motivo mancasse, costruisco un context minimo
      const ctxFront = ctx ? { ...ctx, angolazione: 'frontale' } : {
        display_name: 'Nome_' + Date.now() + '_0',
        type: this.typeMediaFromEditorOneWayBinding,
        descrizione: "Da inserire",
        quantita: "0",
        angolazione: 'frontale'
      };

      formDataAllFrontali.append('file', file);                               // file corrente
      formDataAllFrontali.append('folder', folder);                           // cartella
      formDataAllFrontali.append('cloudinary', JSON.stringify(ctxFront));     // metadato per quel file
    }

    try {
      const res = await this.caricaMediaInToCloud(formDataAllFrontali, isConfig);
      const hasKo = Array.isArray(res) && res.some(r => r.status === 'ko');

      if (hasKo) {
        console.warn("Alcuni upload (solo anteprime) non sono andati a buon fine");
        this.eventoChiudiUpload.emit(false);
      } else {
        if (this.isDroppedByEditor) {
          console.log("Editor mode: non chiudo dialog, notifico aggiornamento cache");
          this.sharedService.notifyCacheIsChanged();
          this.eventoChiudiUpload.emit(true);
        } else {
          this.chiudiDialog();
        }
      }
    } catch (e) {
      console.error("Errore durante upload (solo anteprime):", e);
      this.eventoChiudiUpload.emit(false);
    } finally {
      this.uploadInCorso = false;
    }

    return; // IMPORTANTISSIMO: non eseguire il branch successivo
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // 4) BRANCH B → FRONTALE + ALTRE ANGOLAZIONI (this.isOnlyAnteprima === false)
  //    4.1) Invio il frontale (1 file + 1 metadato)
  //    4.2) Se ok, invio le altre angolazioni (N file + N metadati con CONTEXT DEL FRONTALE)
  // ─────────────────────────────────────────────────────────────────────────────

  // 4.1 Individua il file frontale (da mappa metadati)
  let fileDaCaricareFrontale = this.filesDaCaricare.find(
    f => this.metadatiPerFile.get(f)?.['angolazione'] === 'frontale'
  );

  // Se non lo troviamo (caso limite), forziamo il primo come frontale per robustezza
  if (!fileDaCaricareFrontale) {
    console.warn("Nessun file marcato 'frontale' trovato: forzo il primo file come frontale");
    const primo = this.filesDaCaricare[0];
    const metaPrimo = this.metadatiPerFile.get(primo) || {
      display_name: 'Nome_' + Date.now() + '_0',
      type: this.typeMediaFromEditorOneWayBinding,
      descrizione: "Da inserire",
      quantita: "0",
      angolazione: 'frontale'
    };
    this.metadatiPerFile.set(primo, { ...metaPrimo, angolazione: 'frontale' });
    fileDaCaricareFrontale = primo;
  }

  const filesDaCaricareNonFrontali = this.filesDaCaricare.filter(
    f => this.metadatiPerFile.get(f)?.['angolazione'] !== 'frontale'
  );

  console.log("File frontale identificato:", fileDaCaricareFrontale?.name);
  console.log("File con altre angolazioni da caricare:",
    filesDaCaricareNonFrontali.map(f => f.name));

  // 4.2 Prepara e invia il POST del FRONTALE
  const formDataFrontale = new FormData();
  const contextFrontale = this.metadatiPerFile.get(fileDaCaricareFrontale)!; // context del frontale

  formDataFrontale.append('file', fileDaCaricareFrontale);
  formDataFrontale.append('folder', folder);
  formDataFrontale.append('cloudinary', JSON.stringify({
    ...contextFrontale,
    angolazione: 'frontale'  // sicurezza
  }));

  const risultatoCaricamentoFrontale = await this.caricaMediaInToCloud(formDataFrontale, isConfig);
  console.log("Inizio a caricare la frontale", JSON.stringify(risultatoCaricamentoFrontale));

  // Status del frontale
  const statusFrontale = risultatoCaricamentoFrontale.find(r => r.angolazione === 'frontale')?.status;
  console.log("Risultato caricamento della frontale (solo status):", statusFrontale);

  if (statusFrontale !== 'ok') {
    // Se il frontale fallisce, interrompo il processo (senza altre angolazioni)
    if (this.isDroppedByEditor) {
      console.log("Editor mode: notifico comunque la cache e l'esito KO");
      this.sharedService.notifyCacheIsChanged();
      this.eventoChiudiUpload.emit(false);
    } else {
      console.error("Errore nel caricamento della frontale. Upload interrotto.");
      this.eventoChiudiUpload.emit(false);
    }
    this.uploadInCorso = false;
    return;
  }

  // 4.3 Se non ci sono altre angolazioni da caricare → chiusura positiva
  if (filesDaCaricareNonFrontali.length === 0) {
    console.log("Frontale caricato, nessuna 'altra' angolazione presente");
    if (this.isDroppedByEditor) {
      this.sharedService.notifyCacheIsChanged();
      this.eventoChiudiUpload.emit(true);
    } else {
      this.chiudiDialog();
    }
    this.uploadInCorso = false;
    return;
  }

  // 4.4 Prepara il POST per le ALTRE angolazioni
  //     CORRELAZIONE: uso lo STESSO context del frontale ma con 'angolazione: altra'
  const formDataNonFrontale = new FormData();
  const contextNonFrontale = { ...contextFrontale, angolazione: 'altra' };

  for (const file of filesDaCaricareNonFrontali) {
    formDataNonFrontale.append('file', file);                                   // aggiungo ogni file "altra"
    formDataNonFrontale.append('folder', folder);                               // stessa cartella
    formDataNonFrontale.append('cloudinary', JSON.stringify(contextNonFrontale)); // STESSO display_name del frontale
  }

  const risultatoCaricamentoNonFrontali = await this.caricaMediaInToCloud(formDataNonFrontale, isConfig);
  console.log("Risultati upload 'altra' angolazione:", JSON.stringify(risultatoCaricamentoNonFrontali));

  // 4.5 Costruisco esito complessivo per decidere chiusura/notifica
  let statusNonFrontale: string[] = risultatoCaricamentoNonFrontali.map(r => r.status);
  statusNonFrontale.push(statusFrontale as string);
  const statusFinaleKo = statusNonFrontale.some(s => s === 'ko');

  const rapportinoUpload = {
    totale_file: filesDaCaricareNonFrontali.length + 1,
    status_frontali_caricati: statusFrontale,
    status_non_frontali_caricati: statusNonFrontale,
    status_finale: statusFinaleKo ? 'ko' : 'ok'
  };
  console.log("Rapportino finale: ", rapportinoUpload);

  if (statusFinaleKo) {
    console.log("Ci sono stati errori durante l'upload di almeno una 'altra' angolazione");
    this.eventoChiudiUpload.emit(false);
  } else {
    if (this.isDroppedByEditor) {
      console.log("Editor mode: notifico aggiornamento cache e chiudo OK");
      this.sharedService.notifyCacheIsChanged();
      this.eventoChiudiUpload.emit(true);
    } else {
      this.chiudiDialog();
    }
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // 5) Fine → disabilito lo spinner
  // ─────────────────────────────────────────────────────────────────────────────
  this.uploadInCorso = false;
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