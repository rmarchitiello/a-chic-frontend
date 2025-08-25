//component che mi serve per modificare un layout
//Posso anche editare i metadati in line ora

/* L'EDITOR E UN COMPONENT DOVE ALL INTERNO POSSO CANCELLARE UPLOADARE CANCELLARE EDITARE METADATI POSSO FARE TUTTO
MOSTRA LA LISTA DI CIO CHE C E DENTRO  
In pratica l'editor mi consente di lavorare su un json del genere

{
  "folder": "Config/Home/Carosello",
  "items": [
    {
      "context": {
        "display_name": "carosello1",
        "descrizione": "Descrizione da inserire",
        "quantita": "0",
        "type": "image",
        "meta": [
          {
            "url": "https://res.cloudinary.com/dmf1qtmqd/image/upload/v1753187994/Config/Home/Carosello/fjepnyh5hhxavojr1rwi.jpg",
            "angolazione": "frontale"
          }
        ]
      },
      "media": [
        {
          "url": "https://res.cloudinary.com/dmf1qtmqd/image/upload/v1753187994/Config/Home/Carosello/fjepnyh5hhxavojr1rwi.jpg",
          "angolazione": "frontale"
        }
      ]
    },
    {
      "context": {
        "display_name": "carosello2",
        "descrizione": "Descrizione da inserire",
        "quantita": "0",
        "type": "image",
        "meta": [
          {
            "url": "https://res.cloudinary.com/dmf1qtmqd/image/upload/v1753187995/Config/Home/Carosello/ierl8pdvjrw4hqycilpg.jpg",
            "angolazione": "frontale"
          }
        ]
      },
      "media": [
        {
          "url": "https://res.cloudinary.com/dmf1qtmqd/image/upload/v1753187995/Config/Home/Carosello/ierl8pdvjrw4hqycilpg.jpg",
          "angolazione": "frontale"
        }
      ]
    },
    {
      "context": {
        "display_name": "carosello3",
        "descrizione": "Descrizione da inserire",
        "quantita": "0",
        "type": "image",
        "meta": [
          {
            "url": "https://res.cloudinary.com/dmf1qtmqd/image/upload/v1753187996/Config/Home/Carosello/dmze13wwipefvmsghn8z.jpg",
            "angolazione": "frontale"
          }
        ]
      },
      "media": [
        {
          "url": "https://res.cloudinary.com/dmf1qtmqd/image/upload/v1753187996/Config/Home/Carosello/dmze13wwipefvmsghn8z.jpg",
          "angolazione": "frontale"
        }
      ]
    }
  ]
}
  
ESSENDO CHE IL TOOL TIP NON PUO AVERE degli ngFor dove l'array viene restituito da un metodo devo caricare prima tutti gli array
per questo carico gli array mediaurls frontale 




/* Questo component espone dei vari pop up per editare eliminare fare la download upload dei media.
  Il pop up di upload posso aprirlo o cliccando sul bottone aggiungi o con drag and drop
*/


import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogRef } from '@angular/material/dialog';
import { MatDialog } from '@angular/material/dialog';
import { UploadDataAdminComponent } from '../../common/upload-data-admin/upload-data-admin.component';
import { MediaCollection, MediaContext, MediaMeta, MediaItems } from '../../../app.component';
import { MatTooltipModule } from '@angular/material/tooltip';
import { SharedDataService } from '../../../services/shared-data.service';
import { ViewMetadata } from '../view/view-metadata.component';
//importato per modificare i metadati (come nella fase di upload)
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { FormControl, FormGroup, FormArray, Validators } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { AdminService } from '../../../services/admin.service';
import { MatTableModule } from '@angular/material/table';
import { MatMenuModule } from '@angular/material/menu';
import { Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
/* NUOVO METODO DI UPLOAD DI UN MEDIA. . .
Voglio implementare una nuova funzionalita quando dall editor

trascino un file, in automatico viene subito caricato per poi modificare in metadata direttamente nella card, e, secondo me è molto piu scabile anziche aprire un 
pop up e gestire tutto da li.
Anche per i metadata voglio gestire tutto da editor quindi ogni valore nella card, sarà una reactive form.

Ora, per utilizzare le funzionalità del component di upload utilizzo l'approccio One-Way input binding, 
ovvero l'Editor mediante @Input nel figlio passa i campi in questo caso la folder e i file.
*/

export interface UpdateAngolazioneMedia {
  /** URL che deve diventare il nuovo frontale */
  urlDaRendereFrontale: string;

  /** Elenco completo di tutti gli URL (frontale attuale + secondari) */
  urlsTotali: string[];
}


@Component({
  selector: 'app-carosello-edit',
  standalone: true,
  templateUrl: './editor-admin-popup.component.html',
  styleUrl: './editor-admin-popup.component.scss',
  imports: [CommonModule,
    MatIconModule,
    MatTooltipModule,
    UploadDataAdminComponent,
    MatProgressSpinnerModule,
    MatInputModule,
    MatFormFieldModule,
    ReactiveFormsModule,
    MatTableModule,
    MatMenuModule
  ]
})
export class EditorAdminPopUpComponent implements OnInit, OnDestroy {

  inputFromFatherComponent: MediaCollection = {
    folder: '',
    items: []
  }

  //salvo l'url corrente quando il mouse è sopra
  hoveredCard: string | null = null; // URL della card su cui si trova il mouse

  //mi salvo le varie variabili
  folderInput: string = '';
  itemsInput: MediaItems[] = [];
  contextsInput: MediaContext[] = [];
  mediasInput: MediaMeta[] = [];

  disabledMoreVertButton: boolean = false; //se sto scaricando cancellando ecc disabilito per un momento il bottone

  //questa folder la salvo perche
  /* Ciclo di vita, alla prima apertura del pop up da parte della home, inviamo un media collection 
   Quando pero facciamo l'upload e viene chiuso il pop up di upload, notifichiamo ad app component guarda
   devi leggere la cache, perche e stata aggiornata ok ? App component rilegge la cache perche e in ascolto
   del subject di notify manda i messaggi alla home ma, non manda i messaggi all editor del pop up, questo perche?
   perche il pop up di editor e ancora aperto e quindi non viene chiamato il metodo 
       this.sharedDataService.setMediaCollectionConfig(this.carosello);
 che serve a passare i dati nuovi a questo component. Allora che faccio ? ascolto tutte le mediasCollectionsConfig e in base a questa folder
 folderSelezionata che salvo nell on init in fase di apertura del pop up filtro questa folder con mediasCollectionsConfig in modo da reperire 
 il mediaCollection e lavorarci e risettare inputFromFather */
  folderSelezionata: string = '';
  //carico le url frontali dai media input da dare in pasto al template
  mediasUrlsFrontale: string[] = []

  //  Mappa di url no frontali ovvero, per ogni url  frontale associo un array di url non frontali
  //  urlFrontale: [url1_nofrontale, url2_nofrontale, url3_nofrontale]
  mapUrlsNoFrontali: { [urlFrontale: string]: string[] | undefined } = {};

  //ora ogni url frontale ha un suo context, per intederci ogni url frontale che è un immagine ha i suoi metadati
  //quindi creo una mappa inversa ovvero url frontale e metadati [url1, url2, url3] - [ctx1,ctx2,ctx3]
  //equivalente contextMap: Record<string, MediaContext> = {}; ma nei template non e gestito bene 
  contextMap: { [url: string]: MediaContext } = {};

  currentIndex: number = 0;


  isConfigFolder: boolean = false;




  constructor(
    //ricevo il dato dalla home
    //@Inject(MAT_DIALOG_DATA) public data: MediaCollection lo commento non serve perche ricevo l'input dal observable mediante subscribe,
    private dialogRef: MatDialogRef<EditorAdminPopUpComponent>,
    private sharedService: SharedDataService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private adminService: AdminService,
    @Inject(MAT_DIALOG_DATA) public data: { isConfigMode: boolean}
  ) { }

  caricaMediaCollection(data: MediaCollection) {
    if (data) {
      console.log('[EditorAdminPopUpComponent] Media ricevuto:', data);
      // Assegna i dati ricevuti dal componente padre alla variabile locale
      this.inputFromFatherComponent = data;
      console.log("Dati ricevuti dalla home: ", JSON.stringify(this.inputFromFatherComponent));
      //carico tutte le url complete:
      this.tutteLeUrl = data.items.flatMap(item => item.media.map(m => m.url));
      console.log("Tutte le urls caricate", JSON.stringify(this.tutteLeUrl));
      // Estrae il percorso della cartella
      this.folderInput = this.inputFromFatherComponent.folder || this.folderSelezionata;
      console.log("Folder ricevuta in ingresso: ", this.folderInput);

      if (this.folderInput.toLocaleLowerCase().includes('config')) {
        this.isConfigFolder = true;
        console.log("Cartella di config")
      } else {
        this.isConfigFolder = false;
        console.log("Cartella normale")
      }


      // Estrae l'array di elementi (ciascuno contenente context e media)
      this.itemsInput = this.inputFromFatherComponent.items;
      console.log("Items ricevuti in ingresso: ", this.itemsInput);

      // Estrae tutti i context da ciascun item per uso diretto (es. visualizzazione, modifica)
      this.contextsInput = this.inputFromFatherComponent.items.map(item => item.context);
      console.log("Contexts ricevuti in ingresso: ", this.contextsInput);

      // Estrae tutti i media (immagini, video, ecc.) da tutti gli items in un unico array piatto
      this.mediasInput = this.itemsInput.flatMap(item => item.media);
      console.log("Media ricevuti in ingresso: ", this.mediasInput);

      //carico le url frontali da dare al template
      this.mediasUrlsFrontale = this.getMediaUrlsFrontale(this.mediasInput);

      //carico le url non fronali
      this.mapUrlsNoFrontali = this.getMediaUrlsNoFrontale(this.itemsInput);

      //inizializzo la mappa degli indici delle foto non frontali
      this.inizializzaIndiciSecondari();
      this.inizializzaIndiceAngolazioni();



      console.log("Url frontali recuperate: ", this.mediasUrlsFrontale.length);
      console.log("Mappa Url non frontali recuperate: ", JSON.stringify(this.mapUrlsNoFrontali));

      //ora ogni url frontale ha un suo context, per intederci ogni url frontale che è un immagine ha i suoi metadati
      //quindi creo una mappa inversa ovvero url frontale e metadati [url1, url2, url3] - [ctx1,ctx2,ctx3]

      //assegno la mappa
      this.getContextFromMediaUrlsFrontali(this.mediasUrlsFrontale);
      console.log("Context recuperatooo: ", this.getContextFromMediaUrlsFrontali(this.mediasUrlsFrontale));
      /*
        La mappa sara
        urlFrontale1: {
            display_name:
            quantita:
            prezzo:
            altro ...
        }
      */
    }
    else {
      console.warn('[EditorAdminPopUpComponent] Nessun media disponibile (è null)');
    }
  }

  ngOnDestroy(): void {
    console.log("Distrutto");
    window.removeEventListener('dragover', this.preventBrowserDefault, false);
    window.removeEventListener('drop', this.preventBrowserDefault, false);
  }

  ngOnInit(): void {

  // Previene l'apertura del file nel browser se droppato fuori dalla zona consentita
  window.addEventListener('dragover', this.preventBrowserDefault, false);
  window.addEventListener('drop', this.preventBrowserDefault, false);

  if (this.data.isConfigMode) {
    // Primo caricamento (Home apre pop up in modalità config)
    this.sharedService.mediaCollectionConfig$.subscribe(data => {
      console.log("[EditorComponent] sto ricevendo i dati (config): ", JSON.stringify(data));
      if (data) {
        this.caricaMediaCollection(data);
      }
    });

    // Secondo caricamento (upload notifica AppComponent → aggiorna lista config)
    this.sharedService.mediasCollectionsConfig$.subscribe(data => {
      this.gestisciAggiornamentoLista(data);
    });

  } else {
    // Primo caricamento (Cloudinary apre pop up in modalità non-config)
    this.sharedService.mediaCollectionNonConfig$.subscribe(data => {
      console.log("[EditorComponent] sto ricevendo i dati (non-config): ", data);
      if (data) {
        this.caricaMediaCollection(data);
      }
    });

    // Secondo caricamento (upload notifica AppComponent → aggiorna lista non-config)
    this.sharedService.mediasCollectionsNonConfig$.subscribe(data => {
      console.log("Secondo caricamento da app component a editor", this.data.isConfigMode);
      this.gestisciAggiornamentoLista(data);
    });
  }
}

private gestisciAggiornamentoLista(data: MediaCollection[]): void {
  if (data.length > 0) {
    this.folderSelezionata = this.folderInput;
    if (this.folderSelezionata) {
      console.log("Folder selezionata: ", this.folderSelezionata);
      this.inputFromFatherComponent = data.find(
        mediaColl => mediaColl.folder === this.folderSelezionata
      ) || { folder: '', items: [] };
      console.log("Ricalcolo input from father: ", this.inputFromFatherComponent);
      console.log("Re invio i nuovi media collection: ");
      this.caricaMediaCollection(this.inputFromFatherComponent);
    } else {
      console.log("La folder selezionata è vuota, quindi i dati li ha passati tramite pop up");
    }
  } else {
    console.warn("Nessuna media collection ricevuta.");
    this.inputFromFatherComponent = { folder: this.folderInput ?? '', items: [] };
    this.caricaMediaCollection(this.inputFromFatherComponent);
  }
}



  /* PER GLI INDICI SECONDARI */
  currentSecondaryIndex: { [urlFrontale: string]: number | undefined } = {};


  private inizializzaIndiciSecondari(): void {
    for (const url of this.mediasUrlsFrontale) {
      // metti sempre un valore: -1 = frontale
      this.currentSecondaryIndex[url] = -1;
    }
  }

  prevSecondaryImage(url: string): void {
    const secondarie = this.mapUrlsNoFrontali[url] || [];
    if (!secondarie.length) return;

    const currentIndex = this.currentSecondaryIndex[url] ?? -1; // -1 = frontale
    const prevIndex = (currentIndex + secondarie.length + 1) % (secondarie.length + 1) - 1;

    // Aggiorna entrambe le mappe
    this.currentSecondaryIndex[url] = prevIndex;
    this.indiciAngolazioniMap[url] = prevIndex;
  }

  nextSecondaryImage(url: string): void {
    const secondarie = this.mapUrlsNoFrontali[url] || [];
    if (!secondarie.length) return;

    const currentIndex = this.currentSecondaryIndex[url] ?? -1; // -1 = frontale
    const nextIndex = (currentIndex + 2) % (secondarie.length + 1) - 1;

    // Aggiorna entrambe le mappe
    this.currentSecondaryIndex[url] = nextIndex;
    this.indiciAngolazioniMap[url] = nextIndex;
  }



  /* ---------------------------   */



  //restituisco l'array di url frontali
  getMediaUrlsFrontale(media: MediaMeta[]): string[] {
    return media
      .filter(m => m.angolazione === 'frontale') // prendo solo i frontali {url, angolazione}
      .map(m => m.url);                          // estrai le URL e creo l'array di string[]
  }

  //restituisco array di urls no fronale entrano gli items ed esce una mappa urlFrontale - urlNoFrontali
  getMediaUrlsNoFrontale(items: MediaItems[]): { [urlFrontale: string]: string[] } {
    const mappa: { [urlFrontale: string]: string[] } = {};
    console.log("Items miei: ", items)
    // Itero ogni oggetto MediaItem
    items.forEach(item => {

      // Estrai le URL frontali da questo MediaItem
      const urlsFrontali = item.media
        .filter(m => m.angolazione === 'frontale')
        .map(m => m.url);

      // Estrai le URL non frontali da questo MediaItem
      const urlsNonFrontali = item.media
        .filter(m => m.angolazione !== 'frontale')
        .map(m => m.url);

      // Per ogni URL frontale, associala alle non frontali (se presenti)
      urlsFrontali.forEach(urlFrontale => {
        if (urlsNonFrontali.length > 0) {
          mappa[urlFrontale] = urlsNonFrontali;
        }
      });


    });
    return mappa;
  }

  //questo metodo mi serve per caricare anzi assegnare la mappa   contextMap: { [url: string]: MediaContext } = {}; a partire da una serie di url frontali
  getContextFromMediaUrlsFrontali(urlsFrontali: string[]) {
    const itemsInIngresso = this.itemsInput;

    // Resetto la mappa
    this.contextMap = {};

    // Ciclo tutte le URL frontali
    for (const url of urlsFrontali) {
      // Cerco l'item che contiene questa URL nei suoi media
      const itemTrovato = itemsInIngresso.find(item =>
        item.media.some(m => m.url === url)
      );

      // Se trovato, associo questa URL al suo context
      if (itemTrovato) {
        this.contextMap[url] = itemTrovato.context;
      }
    }
  }

  //dato che alcuni dei campi del context sono molto lunghi con questo metodo calcolo i caratteri di ogni context cosi
  //mostro una preview sul sito
  // Mostra i primi N caratteri e aggiunge "…" se la stringa è più lunga
  descrizioneLunga: boolean = false;
  maxLength: number = 30;
  getPreview(value: string, max = this.maxLength): string {
    this.descrizioneLunga = value.length > max //se la descrizione è grande ritorna true;
    if (typeof value !== 'string') return value as any;
    return value.length > max ? value.slice(0, max) + '...' : value;
  }
  //metodo che mi fa capire se un determinata stringa supera i 40 caratteri
  //se lo supera torna true
  isLongText(value: any): boolean {
    return typeof value === 'string' && !!value && value.length > this.maxLength;
  }

  capitalizeFirstLetter(text: string): string {
    if (!text) return '';
    return text.charAt(0).toUpperCase() + text.slice(1);
  }





  /* 
    METODO CHE PRENDE UN CONTEXT IN INGRESSO, esempio
    {
      display_name
      descrizione
      quantita
      ciao pippo
    }
  
    e restituisce
    {
      Nome File
      Descrizione
      Quantita
      Ciao Pippo e cosi via...
    }
  
    

  */


  /**
 * Restituisce un array ordinato di metadati da visualizzare,
 * escludendo la chiave 'angolazione' e applicando etichette leggibili.
 */
  getOrderedFormattedEntries(context: MediaContext): { key: string, label: string, value: string }[] {
    // Ordine prioritario dei metadati da mostrare
    const ordine = ['display_name', 'descrizione', 'type', 'quantita'];

    // Etichette personalizzate per i campi noti
    const customLabels: { [key: string]: string } = {
      display_name: 'Nome File',
      descrizione: 'Descrizione',
      type: 'Tipo',
      quantita: 'Quantità'
    };

    // Chiavi da escludere dalla visualizzazione (es. 'angolazione' è tecnica)
    const chiaviDaEscludere = ['angolazione'];

    // Costruisco un array con chiave, etichetta leggibile e valore (convertito in stringa)
    const entries = Object.entries(context)
      // Rimuovo eventuali chiavi che non devono essere mostrate
      .filter(([key]) => !chiaviDaEscludere.includes(key))
      // Formatto ogni entry con etichetta e valore
      .map(([key, value]) => ({
        key,
        // Se presente una label personalizzata, la uso; altrimenti capitalizzo la chiave
        label: customLabels[key] || key.replace(/_/g, ' ').replace(/\w\S*/g, w => w.charAt(0).toUpperCase() + w.slice(1)),
        value: value ?? ''
      }));

    // Restituisco le entry ordinate: prima quelle nell'elenco 'ordine', poi le restanti
    return [
      ...entries
        .filter(e => ordine.includes(e.key))
        .sort((a, b) => ordine.indexOf(a.key) - ordine.indexOf(b.key)),
      ...entries
        .filter(e => !ordine.includes(e.key))
    ];
  }






  chiudiDialog(): void {
    this.dialogRef.close();
  }



  /* POP UP DELL EDITOR */

  //pop up per visualizzare i metadati
  apriPopUpViewMetadata(url: string, context: MediaContext): void {

    // Apertura del dialog Angular Material per il componente ViewMetadata
    this.dialog.open(ViewMetadata, {
      data: { urlFrontale: url, context: context },
      panelClass: 'popup-view-dialog' // Questo collega lo stile alla .cdk-overlay-pane
    });
  }

  //pop up per eliminare un media non serve piu al momento
  /* apriPopUpEliminaMedia(): void {
    // Recupero l'URL dell'immagine attualmente selezionata
    const mediaDaEliminare = this.inputFromFatherComponent;
    console.log("Media da eliminare: ", mediaDaEliminare)
    // Apro il dialog di conferma eliminazione, passando l'URL al componente figlio
    const dialogRef = this.dialog.open(DeleteDataAdminComponent, {
      width: '90vw',
      disableClose: false,
      data: mediaDaEliminare
    });

    // Dopo la chiusura del dialog (conferma o annulla)
    dialogRef.afterClosed().subscribe((eliminatoConSuccesso: boolean) => {

      // Solo se il figlio ha confermato e l'eliminazione è andata a buon fine
      if (eliminatoConSuccesso) {

        // Rimuovo l'immagine dall'array
        this.inputFromFatherComponent.items.splice(this.currentIndex, 1);

        // Correggo l'indice se siamo alla fine dell'array
        if (this.currentIndex >= this.inputFromFatherComponent.items.length) {
          this.currentIndex = Math.max(0, this.inputFromFatherComponent.items.length - 1);
        }
      } else {
        // Opzionale: puoi loggare o gestire un messaggio se l'eliminazione è stata annullata o fallita
        console.log('Eliminazione annullata o fallita.');
      }
    });
  }

  //pop up per scaricare un media
  apriPopUpDownloadMedia(): void {
    const mediaDaScaricare = this.inputFromFatherComponent;
    console.log("Oggetti da scaricare: ", mediaDaScaricare)
    this.dialog.open(DownloadDataAdminComponent, {
      width: '90vw',
      disableClose: false,
      data: mediaDaScaricare
    });




  }


*/



  /* APERTURA DEL POP UP DI UPLOAD SIA MEDIANTE DRAG AND DROP CHE CON CLICK 
  Quando clicco normalmente si apre la finestra di upload e li o seleziono il file o
  faccio drad e drop (ma questo nella finestra di upload)
  
  Se apro invece il pop up mediante drag e drop passo direttamente all'upload il context isUploadComponent true o false e direttamente la lista dei file*/







  //pop up per caricare un media
  /* Posso sia cliccare per aprirlo che trascinare qualcosa all interno e si apre passando la lista dei file da caricare
  /* Puo accettare una lista di file da inviare al pop up di upload 
    Se la lista dei file non viene inviata allora li carico a mano nel pop up
    altrimenti accetta una lista di file oltre all input folder cosi si apre il pop up direttamente con i file da caricare
    Quindi se premo il tasto aggiungi prodotto, si apre il pop up senza lista di file.
    Se faccio drag e drop si apre direttamente il pop up con la lista dei file
  */

  apriPopUpUploadMedia(files?: File[]) {

    console.log("File sono droppati dall'editor ? ", this.isDragging);
    this.dialog.open(UploadDataAdminComponent, {
      panelClass: 'upload-dialog',
      disableClose: false,
      data: { inputFolder: this.folderInput, files: files } //se viene droppato dall editor allora aggiungiamo i file direttamente dall editor
    });


  }



  preventBrowserDefault(event: Event): void {
    event.preventDefault();
  }


  //mi fa capire se sono sull area di drop
  isDragging: boolean = false;

  //gestisco lo spinner con una variabile diversa
  isUploading: boolean = false;

  //per attivare l'altro component a ricevere i dati
  showUploadComponent: boolean = false
  onDragEnter(event: DragEvent): void {
    this.isDragging = true; // ✅ entri nel dropzone → attiva stile
    console.log("Sono entrato nel drag");
  }

  onDragOver(event: DragEvent): void {
    this.isDragging = true; // ✅ continui a passare sopra → resta attivo
    event.preventDefault(); // ✅ necessario per consentire il drop
    console.log("Ora mi sto spostando nella drop area");
  }

  fileArray!: File[];               // Qui salvo i file validi da caricare
  tipoAccettato: string | null = null;  // Uso questa variabile per tenere traccia del tipo generico accettato (es. 'image', 'video', 'audio')
  mediaTypeDropped: 'image' | 'video' | 'audio' | '' = '';

  readonly tipiSupportati = ['image', 'video', 'audio']; // Definisco i soli tipi MIME che accetto

  isDropped: boolean = false;
  // Metodo invocato quando l'utente rilascia i file nell'area di drop
  // Metodo invocato quando l'utente rilascia dei file nell'area di drop
  /* Quando chiamo la on drop si abilita a true la variabile che passa gli input al figlio*/
  onDrop(event: DragEvent) {
    // Attivo il flag visivo per segnalare che un'area di drop è attiva
    this.isDragging = false;
    this.isDropped = true;
    console.log("Variabile is dropped: ", this.isDropped);
    console.log("Ho droppato nell'area");

    // Impedisco il comportamento di default del browser (es. apertura file)
    event.preventDefault();

    // Recupero i file trascinati
    const files = event.dataTransfer?.files;
    if (!files || files.length === 0) return;

    // Converto la FileList in un array per una gestione più comoda
    const arrayFiles = Array.from(files);

    // Filtro solo i file il cui tipo MIME rientra tra quelli supportati (image, video, audio)
    const filesSupportati = arrayFiles.filter(file => {
      const tipo = file.type.split('/')[0];
      return this.tipiSupportati.includes(tipo);
    });

    // Se nessuno dei file è supportato, blocco l’operazione e avviso l’utente
    if (filesSupportati.length === 0) {
      this.mostraMessaggioSnakBar(
        "I file rilasciati non sono supportati. Puoi caricare solo immagini, video o audio.",
        true
      );
      return;
    }

    // Calcolo quanti file supportati ci sono per ciascun tipo generico (image, video, audio)
    const tipiContati: { [tipo: string]: number } = {};
    filesSupportati.forEach(file => {
      const tipoGenerico = file.type.split('/')[0];
      tipiContati[tipoGenerico] = (tipiContati[tipoGenerico] || 0) + 1;
    });

    // Determino il tipo prevalente: quello con il maggior numero di file presenti
    const tipoPrevalente = Object.keys(tipiContati).reduce((a, b) => {
      return tipiContati[a] > tipiContati[b] ? a : b;
    });

    // Verifico che il tipo prevalente sia uno di quelli accettati
    if (!this.tipiSupportati.includes(tipoPrevalente)) {
      this.mostraMessaggioSnakBar(
        "Tipo di file non supportato. Puoi caricare solo immagini, video o audio.",
        true
      );
      return;
    }

    // Imposto il tipo accettato e lo comunico anche al componente figlio
    this.tipoAccettato = tipoPrevalente as 'image' | 'video' | 'audio';
    this.mediaTypeDropped = tipoPrevalente as 'image' | 'video' | 'audio';

    // Seleziono solo i file che appartengono al tipo prevalente
    const filesValidi = filesSupportati.filter(file => {
      return file.type.split('/')[0] === this.tipoAccettato;
    });

    // Identifico i file che, pur essendo supportati, non corrispondono al tipo prevalente
    const filesScartati = filesSupportati.filter(file => !filesValidi.includes(file));
    const estensioniScartate = Array.from(new Set(
      filesScartati.map(file => file.name.split('.').pop()?.toLowerCase() || 'sconosciuto')
    ));

    // Se ci sono file scartati, mostro un messaggio di errore informativo
    if (filesScartati.length > 0) {
      const tipoEstensione = this.tipoAccettato;
      const msg = filesScartati.length === 1
        ? `Hai cercato di caricare 1 file che non è un${tipoEstensione === 'image' ? "’immagine" : ` ${tipoEstensione.toUpperCase()}`}. Scartato: ${estensioniScartate.join(', ')}`
        : `Hai cercato di caricare ${filesScartati.length} file che non sono ${tipoEstensione === 'image' ? 'immagini' : tipoEstensione.toLocaleLowerCase() + ' dello stesso tipo'}. Scartati: ${estensioniScartate.join(', ')}`;
      console.warn(msg);
      this.mostraMessaggioSnakBar(msg, true);
    }

    // Se dopo il filtro non rimane nessun file valido, interrompo e mostro messaggio
    if (filesValidi.length === 0) {
      this.mostraMessaggioSnakBar(
        "Nessun file valido da caricare. Tutti i file sono stati scartati.",
        true
      );
      return;
    }

    // Salvo i file validi in memoria per l’upload
    this.fileArray = filesValidi;
    //  Mostro il componente per gestire l’upload
    this.showUploadComponent = true;
    this.isUploading = true;
    // L’upload o l’apertura di un popup sarà gestita in seguito (non lo eseguo qui direttamente)
  }





  onDragLeave(event: DragEvent) {
    console.log("Sono uscito dalla area");
    this.isDragging = false;
  }

  //serve per cambiare l'icone da cloud_upload a cloud_upload_done per poi ritornare dopo 2 secondi a quella normale
  uploadSuccess: boolean = false;


  gestisciChiusuraUpload(valore: boolean): void {
    // Nasconde il componente di upload
    this.showUploadComponent = false;

    // Ferma lo spinner
    this.isUploading = false;

    // Disattiva qualsiasi stato di trascinamento residuo
    this.isDragging = false;

    // Mostra il messaggio di esito
    if (valore) {
      this.uploadSuccess = true; // ✅ Mostra icona success

      // Dopo 2 secondi, torna a quella normale
      setTimeout(() => this.uploadSuccess = false, 2000);

      this.mostraMessaggioSnakBar("File caricati correttamente.", false);
      this.isDropped = false;
    } else {
      this.mostraMessaggioSnakBar("Si è verificato un errore durante il caricamento.", true);
    }
  }


  //snackbar
  mostraMessaggioSnakBar(messaggio: string, isError: boolean) {
    let panelClassCustom;
    let duration;
    if (isError) {
      panelClassCustom = 'snackbar-errore';
      duration = 1000;
    }
    else {
      panelClassCustom = 'snackbar-ok';
      duration = 500;
    }
    this.snackBar.open(messaggio, 'Chiudi', {
      duration: duration, // durata in ms
      panelClass: panelClassCustom, // classe CSS personalizzata
      horizontalPosition: 'center',
      verticalPosition: 'top'
    });
  }


  //metodo che serve per abilitare l'editing del valore del metadata corrente 
  /* 
    Ho un json del genere da modificare.
     {"url":"https://res.cloudinary.com/dmf1qtmqd/image/upload/v1754085953/Config/Home/Carosello/refbn0oykij41gfewavn.jpg",
            "contextFormatted":{
                "key":"descrizione",
                "label":"Descrizione",
                "value":"Da inserire"}
}

Creo un singolo form control per ogni key, non ha senso creare un form group perche qua la mia form è un solo campo alla volta

  */

  private resetEditingStates(): void {
    this.isAddingMetadataFromForm = false;
    this.editMetadataInline = false;
    this.campoInlineInEditing = null;
  }

  //quando clicco su span devo poter visualizzare quel campo da editare mentre gli altri no
  campoInlineInEditing: string | null = null;

  /* 
    Form controls perche per ogni chiave creo un suo form control
  */
  formControlsInline: { [campoId: string]: FormControl } = {};

  editMetadataInline: boolean = false;
  //e vale campo campoInlineInEditing  https://res.cloudinary.com/dmf1qtmqd/image/upload/v1754085953/Config/Home/Carosello/refbn0oykij41gfewavn.jpg_descrizione
  editMetaDataInline(contextFormatted: { key: string; label: string; value: string }, url: string): void {


    this.resetEditingStates(); // 👈 disattiva tutto

    this.editMetadataInline = true;

    const campoId = `${url}_${contextFormatted.key}`; //cosi sono sicuro di prendere univocamente quella descrizione di quella url
    this.campoInlineInEditing = `${url}_${contextFormatted.key}`;
    console.log('[Edit Inline] Editing:', JSON.stringify({ url: url, contextFormatted }));
    console.log("campo campoInlineInEditing ", this.campoInlineInEditing) // 

    // Crea il FormControl solo se non esiste cosi non duplica i form control
    if (!this.formControlsInline[campoId]) {
      this.formControlsInline[campoId] = new FormControl(contextFormatted.value, Validators.required); // do come valore iniziale non '' ma la inizializzo con il suo valore del campo key
    }

    console.log("Form control generato: ", this.formControlsInline)

  }


  // Conferma la modifica inline del singolo metadato
  confermaValoreInline(context: MediaContext, key: string, label: string, url: string): void {
    console.log("Context in ingresso: ", JSON.stringify(context));
    const campoId = `${url}_${key}`;
    const control = this.formControlsInline[campoId];

    // 1) Verifica che esista il FormControl
    if (!control) {
      console.warn('FormControl non trovato per', campoId);
      return;
    }

    // 2) Se non è valido, mostro solo l’errore di validazione
    if (!control.valid) {
      control.markAsTouched();
      this.mostraMessaggioSnakBar(`Controlla i dati inseriti in "${label.toUpperCase()}".`, true);
      return;
    }

    // 3) Normalizzo il valore in ingresso (trim per stringhe)
    const rawValue = control.value;
    const nuovoValore = typeof rawValue === 'string' ? rawValue.trim() : rawValue;

    // 4) Se non è cambiato, esco in silenzio (niente messaggi, niente chiamate)
    const currentValue = context[key];
    const canonCorrente = key === 'quantita' ? String(currentValue ?? '') : String(currentValue ?? '');
    const canonNuovo = key === 'quantita' ? String(nuovoValore ?? '') : String(nuovoValore ?? '');
    if (canonNuovo === canonCorrente) {
      // pulizia e uscita dall’editing, ma nessun messaggio
      this.campoInlineInEditing = null;
      delete this.formControlsInline[campoId];
      return;
    }

    // 5) Regola specifica per "display_name": evita duplicati su altri prodotti
    if (key === 'display_name') {
      const nuovoValoreLower = String(nuovoValore).toLocaleLowerCase();

      const esisteGia = this.itemsInput.some(item =>
        item.context.display_name?.toLocaleLowerCase() === nuovoValoreLower &&
        !this.getMediaUrlsFrontale(item.media).includes(url) // escludi l’item corrente
      );

      if (esisteGia) {
        this.mostraMessaggioSnakBar(
          `"${label}" non aggiornato: esiste già un altro prodotto con lo stesso ${label.toUpperCase()}.`,
          true
        );
        control.setErrors?.({ duplicate: true });
        return;
      }
    }

    // 6) Aggiorno il context locale
    //    - "quantita": nel form è numero, verso backend salviamo come stringa
    if (key === 'quantita') {
      context[key] = String(nuovoValore);
    } else {
      context[key] = nuovoValore;
    }

    // 7) Uscita dalla modalità di editing e pulizia del controllo inline
    this.campoInlineInEditing = null;
    delete this.formControlsInline[campoId];

    // 8) Persistenza lato backend
    this.adminService.updateImageMetadata(url, context, this.isConfigFolder).subscribe({
      next: () => {
        this.mostraMessaggioSnakBar(`"${label.toUpperCase()}" è stato aggiornato correttamente.`, false);
        this.sharedService.notifyCacheIsChanged();
      },
      error: (err) => {
        console.error("Errore durante l'aggiornamento dei metadati:", err);
        this.mostraMessaggioSnakBar(`Non è stato possibile aggiornare "${label.toUpperCase()}". Riprova.`, true);
      }
    });
  }

  // Annulla l’editing del singolo metadato (nessuna persistenza)
  annullaValoreInline(context: MediaContext, key: string, url: string): void {
    const campoId = `${url}_${key}`;
    const control = this.formControlsInline[campoId];

    if (control) {
      // ripristina il valore originale mostrato prima dell'editing
      const originale = context[key] ?? '';
      control.setValue(originale, { emitEvent: false });
      control.markAsPristine();
      control.markAsUntouched();
      control.updateValueAndValidity({ onlySelf: true, emitEvent: false });
    }

    // esci dalla modalità editing e pulisci il controllo inline
    this.campoInlineInEditing = null;
    delete this.formControlsInline[campoId];

    // opzionale: piccolo feedback
    // this.mostraMessaggioSnakBar(`Modifica di "${key}" annullata.`, false);
  }




  trackByContextFormatted(item: any): string {
    // Se contextFormatted ha una chiave unica, tipo `key`, usala come identificatore
    return item.key;
  }


  rimuoviMetadatoInline(context: any, key: string, label: string, url: string): void {
    console.log('Context in ingresso:', context, ' | chiave da rimuovere:', key, ' | url:', url);

    // Campi non rimovibili
    const nonRimovibili = new Set(['display_name', 'type']);
    if (nonRimovibili.has(key)) {
      this.mostraMessaggioSnakBar(`"${label.toUpperCase()}" non può essere rimosso.`, true);
      return;
    }

    // Se stai editando questo campo, esci dall’editing
    const campoId = `${url}_${key}`;
    if (this.campoInlineInEditing === campoId) {
      this.campoInlineInEditing = null;
    }

    // Rimuovi l’eventuale FormControl collegato
    const ctrl = this.formControlsInline[campoId];
    if (ctrl) {
      ctrl.clearValidators?.();
      ctrl.clearAsyncValidators?.();
      ctrl.reset(undefined, { emitEvent: false });
      ctrl.updateValueAndValidity({ emitEvent: false });
      delete this.formControlsInline[campoId];
    }

    // Se il metadato non esiste nel context
    if (!(key in context)) {
      this.mostraMessaggioSnakBar(`"${label.toUpperCase()}" non è presente.`, true);
      return;
    }

    // Aggiorna il context (immutabile per forzare il refresh)
    const updatedContext = { ...context };
    delete updatedContext[key];

    // Sincronizza strutture locali (se usi una mappa url → context)
    this.contextMap[url] = updatedContext;

    // Allinea anche itemsInput se necessario
    const item = this.itemsInput?.find(i => this.getMediaUrlsFrontale(i.media)?.includes(url));
    if (item) {
      item.context = updatedContext;
    }

    console.log('Context aggiornato (chiave rimossa):', updatedContext);

    // Persisti lato backend
    this.adminService.updateImageMetadata(url, updatedContext, this.isConfigFolder).subscribe({
      next: () => {
        this.sharedService.notifyCacheIsChanged();
        this.mostraMessaggioSnakBar(`"${label.toUpperCase()}" è stato rimosso.`, false);
      },
      error: (err) => {
        console.error('Errore durante la rimozione del metadato:', err);
        this.mostraMessaggioSnakBar(`Non è stato possibile rimuovere "${label.toUpperCase()}". Riprova.`, true);
      }
    });
  }


  /* metodo per aggiungere dinamicamente dei metadati inline 
  
  Creo un form array con un form group con due control key e value in modo da ottenere un json del genere:
      [
{
  "key": "materiale":
  "valore": "pelle"
},
{
  "key" :  "prezzo",
  "valore" : "10.90"
}
]
  */

  //oggetto chiave valore corrispondono ai miei metadati
  metadataFormGroup: FormGroup = new FormGroup({
    key: new FormControl('', Validators.required),
    valore: new FormControl('', Validators.required)
  });

  //array di form group di metadati dinamici
  metadataFormArray: FormArray = new FormArray([this.metadataFormGroup]);



  currentMetadataTargetUrl: string | null | undefined = null;
  isAddingMetadataFromForm: boolean = false;
  //inizializza il gruppo vuoto 
  aggiungiMetadati(url: string) {
    this.resetEditingStates(); // 👈 disattiva tutto

    this.currentMetadataTargetUrl = url;
    this.isAddingMetadataFromForm = true;

    //inizio a creare il form group
    /* non creo una mappa url form group anche perche viene modificata una form per volta con  metadataFormByUrl: Record<string, FormGroup> = {}; */
    this.metadataFormGroup.reset({
      key: '',
      valore: ''
    });

  }

  //setta l'array
  salvaMetadato(url: string) {
    // valori dal form
    const keyRaw = (this.metadataFormGroup.get('key')?.value ?? '').toString().toLowerCase();
    const valueRaw = (this.metadataFormGroup.get('valore')?.value ?? '').toString().toLowerCase();

    const keyInput = keyRaw.trim();
    const valueInput = valueRaw.trim();

    // 1) entrambi i campi devono essere valorizzati (con messaggi specifici)
    const isKeyEmpty = !keyInput;
    const isValueEmpty = !valueInput;

    if (isKeyEmpty && isValueEmpty) {
      this.mostraMessaggioSnakBar('Compila sia entrambe le sezioni.', true);
      return;
    }
    if (isKeyEmpty) {
      this.mostraMessaggioSnakBar('Devi inserire una chiave.', true);
      return;
    }
    if (isValueEmpty) {
      this.mostraMessaggioSnakBar(`Devi inserire un valore da associare a "${keyInput.toUpperCase()}"`, true);
      return;
    }

    // 2) normalizzazione chiave
    let keyNorm = keyInput.toLowerCase();
    if (keyNorm === 'nome') keyNorm = 'display_name';
    else if (keyNorm === 'tipo') keyNorm = 'type';

    // 3) trova il context della card target
    const item = this.itemsInput
      .find(i => i.media?.some(m => m.url === url && m.angolazione === 'frontale'));

    if (!item) {
      this.mostraMessaggioSnakBar('Elemento non trovato per l’URL selezionato.', true);
      return;
    }

    const context = item.context ?? {};
    const keysTrovate = Object.keys(context).map(k => k.toLowerCase());

    // 4) check duplicati
    if (keysTrovate.includes(keyNorm)) {
      const userEcho = keyNorm === 'display_name' ? 'Nome' : keyNorm === 'type' ? 'Tipo' : keyInput;
      this.mostraMessaggioSnakBar(`Non puoi inserire "${userEcho.toUpperCase()}": esiste già.`, true);
      return;
    }

    // 5) salvataggio per la sola card target aggiornando il context
    const nuovoContext = item.context = { ...context, [keyNorm]: valueInput };
    console.log("Nuovo context: ", nuovoContext);

    this.adminService.updateImageMetadata(url, nuovoContext, this.isConfigFolder).subscribe({
      next: (data) => {
        // OK: aggiorna UI/stato locale se serve
        this.mostraMessaggioSnakBar('Metadato salvato correttamente.', false);
        this.sharedService.notifyCacheIsChanged(); //notifico l'app component
        // chiudi form di aggiunta
        this.isAddingMetadataFromForm = false;
        this.currentMetadataTargetUrl = null;
        this.metadataFormGroup.reset({ key: '', valore: '' });
      },
      error: (err) => {
        console.error('Errore updateImageMetadata', err);
        this.mostraMessaggioSnakBar('Errore nel salvataggio dei metadati.', true);
      }
    })

    // 6) chiusura e reset dello staging
    this.isAddingMetadataFromForm = false;
    this.currentMetadataTargetUrl = undefined;
    this.metadataFormGroup.reset({ key: '', valore: '' });
  }

  annullaAggiunta(): void {
    // chiudi la mini-form e pulisci lo stato
    this.isAddingMetadataFromForm = false;
    this.currentMetadataTargetUrl = null;           // se tipizzata string | null
    this.metadataFormGroup.reset({ key: '', valore: '' });

    // opzionale: feedback UI
    // this.mostraMessaggioSnakBar('Aggiunta annullata.', false);
  }

  //sono sopra i metadata di quella url pero??
  espandiMetaDati: string | null = null;
  onEspandiMetadati(url: string) {
    this.espandiMetaDati = url;
  }

  onChiudiMetaDati() {
    this.espandiMetaDati = null;
  }





  //attiva uno spinner di eliminazione spinner solo di quella url
  isDeletingMap: { [url: string]: boolean } = {};

  /* 
  
  Contesto
Hai una preview card per ogni media "frontale" (quindi una sola card per ogni gruppo di immagini).
Ogni card può visualizzare una o più immagini, ad esempio:

1 immagine frontale (quella base)

0 o più immagini secondarie (angolazioni diverse)

Obiettivo
Per ogni card, devo sapere quale immagine è attualmente visibile nella galleria.
Questa immagine può essere:

l’immagine frontale (indice -1)

una delle secondarie (indice 0, 1, ecc.)

Per gestire quale immagine è selezionata in ciascuna card, ti serve una mappa.
creo la selectedImageIndexMap: { [urlFrontale: string]: number }
 

Significato:
La chiave è l’URL dell’immagine frontale (cioè l’identificatore della card)

Il valore è un numero:

-1 → significa che nella card è visibile l’immagine frontale

0, 1, 2, ... → significa che nella card è visibile una delle immagini secondarie (presa da mapUrlsNoFrontali[urlFrontale])

// selectedImageIndexMap tiene traccia dell'immagine attualmente visibile in ciascuna card.
// La chiave è l'URL dell'immagine frontale (che identifica la card).
// Il valore è:
// -1 se si sta visualizzando l'immagine frontale
//  0, 1, 2... se si sta visualizzando una delle immagini secondarie
  */

  /* Funzione che a partire da this.mapUrlsNoFrontali crea la mappa con gli indici per capire a quale non frontale corrisponde */

  /**
   * Crea una mappa che tiene traccia dell'indice attivo corrente
   * per ciascuna URL frontale nella mappa this.mapUrlsNoFrontali.
   *
   * Il valore iniziale per ogni voce è 0.
   * 
   * chiamo in on init la this.inizializzaIndiceAngolazioni();
   per creare gli indici
   */
  indiciAngolazioniMap: { [urlFrontale: string]: number } = {};

  inizializzaIndiceAngolazioni(): void {
    this.indiciAngolazioniMap = {};

    for (const urlFrontale in this.mapUrlsNoFrontali) {
      if (this.mapUrlsNoFrontali.hasOwnProperty(urlFrontale)) {
        // Per ogni URL frontale inizializza l'indice corrente a 0
        this.indiciAngolazioniMap[urlFrontale] = -1; //immagine fronale
      }
    }

    console.log('Mappa indici angolazioni inizializzata:', this.indiciAngolazioniMap);
  }

  tutteLeUrl: string[] = [];

  cancellaMedia(url: string, all: boolean, cancellazioneMassiva: boolean): void {
    //se non e una cancellazione massiva allora esegui la cancellazione normale
    if(!cancellazioneMassiva){
    // Attiva lo spinner per la card associata a questa URL
    this.isDeletingMap[url] = true;
    this.disabledMoreVertButton = true;
    // Inizializza l'elenco delle URL da eliminare
    let urlOrUrlsDaEliminare: string[] = [];

    if (all) {
      // Caso "Elimina tutto": elimina sia la URL frontale sia tutte le sue secondarie
      const urlsNoFrontali: string[] = this.mapUrlsNoFrontali?.[url] || [];

      console.log("URL non frontali da eliminare:", urlsNoFrontali);
      console.log("URL frontale da eliminare:", url);

      // Costruisce un array completo delle URL da eliminare
      urlOrUrlsDaEliminare = [...urlsNoFrontali, url];

      console.log("Tutte le URL da eliminare:", urlOrUrlsDaEliminare);

    } else {
      // Caso "Elimina il media corrente" (solo una URL)

      let checkIsUrlFrontale: boolean = false;

      // Verifica se l'URL corrisponde a un media frontale con altre angolazioni
      if (this.mapUrlsNoFrontali[url]) {
        checkIsUrlFrontale = this.mediasUrlsFrontale.includes(url) && this.mapUrlsNoFrontali[url]?.length > 0;
      }

      if (checkIsUrlFrontale) {
        // Non permettere di eliminare una media usata come anteprima
        console.warn("Tentativo di eliminazione del media frontale bloccato.");
        this.mostraMessaggioSnakBar("Non puoi eliminare un media utilizzato come anteprima", true);
      } else {
        // Elimina solo la URL richiesta
        urlOrUrlsDaEliminare = [url];
        console.log("Eliminiamo solo la seguente URL:", urlOrUrlsDaEliminare);
      }
    }

    // Se ci sono URL da eliminare, procedi con la chiamata al servizio
    if (urlOrUrlsDaEliminare.length > 0) {
      console.log("Avvio procedura di eliminazione...");
      
      console.log("Tasto disabilitato: ", this.disabledMoreVertButton);
      this.adminService.deleteImages(urlOrUrlsDaEliminare, this.isConfigFolder).subscribe({
        next: (response) => {
          console.log("Cancellazione completata:", response);
          this.disabledMoreVertButton= false;
          this.mostraMessaggioSnakBar(
            "Cancellazione avvenuta con successo, media eliminati: " + urlOrUrlsDaEliminare.length,
            false
          );

          // Reset degli indici a -1 per la galleria corrispondente alla URL frontale
          this.currentSecondaryIndex[url] = -1;
          this.indiciAngolazioniMap[url] = -1;

          // Notifica ad altri componenti che la cache è cambiata
          this.sharedService.notifyCacheIsChanged();

          // Disattiva lo spinner
          this.isDeletingMap[url] = false;
        },
        error: (err) => {
          console.error("Errore durante la cancellazione:", err);
          this.disabledMoreVertButton = false;
          this.mostraMessaggioSnakBar("Errore durante l'eliminazione", true);

          // Disattiva lo spinner anche in caso di errore
          this.isDeletingMap[url] = false;
        }
      });
    } else {
      this.disabledMoreVertButton = false;
      // Nessuna eliminazione da eseguire
      this.isDeletingMap[url] = false;
    }
  }
  else{
      if(this.tutteLeUrl.length > 0){
        //mostro lo spinner overlay (non fa niente se e quello di upload)
        this.isUploading = true;
          this.adminService.deleteImages(this.tutteLeUrl, this.isConfigFolder).subscribe({
        next: (response) => {
          this.isUploading = false;
          console.log("Cancellazione completata:", response);
          this.disabledMoreVertButton= false;
          this.mostraMessaggioSnakBar(
            "Cancellazione avvenuta con successo, media eliminati: " + this.tutteLeUrl.length,
            false
          );
          // Notifica ad altri componenti che la cache è cambiata
          this.sharedService.notifyCacheIsChanged();
        },
        error: (err) => {
          this.isUploading = false;
          console.error("Errore durante la cancellazione:", err);
        }
      });
        
        
      }
  }

  }



  //prende l url frontale e recupera in base all indice quella di altra angolazione
  getUrlCorrente(urlFrontale: string): string {
    const index = this.indiciAngolazioniMap[urlFrontale] ?? -1;

    if (index === -1) {
      return urlFrontale;
    }

    const secondarie = this.mapUrlsNoFrontali[urlFrontale] || [];
    return secondarie[index] || urlFrontale;
  }

  trovaUrlFrontaleAssociata(urlSecondaria: string): string {
    for (const frontale in this.mapUrlsNoFrontali) {
      const secondarie = this.mapUrlsNoFrontali[frontale] || [];
      if (secondarie.includes(urlSecondaria)) {
        return frontale;
      }
    }
    return urlSecondaria; // fallback
  }


  /**
 * Avvia il download di uno o più asset della card.
 * • Se all === true   ⇒ scarica l’URL frontale più tutte le secondarie.
 * • Se all === false  ⇒ scarica solo l’URL passato (già frontale o secondario).
 * Il nome file può essere personalizzato con displayName.
 */
  scaricaMedia(url: string, all: boolean, displayName?: string): void {
    let urlsDaScaricare: string[] = [];

    if (all) {
      // Recupera le angolazioni secondarie legate alla stessa card
      const secondarie: string[] = this.mapUrlsNoFrontali?.[url] || [];
      // Includi anche l’immagine (o video/audio) frontale
      urlsDaScaricare = [...secondarie, url];
    } else {
      // Scarica solo l’asset corrente
      urlsDaScaricare = [url];
    }

    // Avvio download per ciascun URL
    urlsDaScaricare.forEach((currentUrl, index) => {
      // Se ti serve costruire un nome file con l’indice:
      const nomeFile = `${displayName}_${index}`;
      this.scaricaAsset(currentUrl, nomeFile);
    });

  }

  /* ------------------------------------------------------------------ */
  /* Funzioni di supporto                                               */
  /* ------------------------------------------------------------------ */

  /** Scarica il singolo asset tramite fetch + link simulato */
  private scaricaAsset(url: string, displayName?: string): void {
    const estensione = this.getEstensione(url);
    // Usa displayName se presente, altrimenti “File”
    const nomeFile = displayName ? `${displayName}.${estensione}` : `File.${estensione}`;

    fetch(url)
      .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.blob();
      })
      .then(blob => {
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = nomeFile;
        link.click();
        URL.revokeObjectURL(link.href);
      })
      .catch(err => console.error(`Download fallito per ${url}`, err));
  }

  /** Estrae l’estensione (jpg, mp4, ecc.) dall’URL Cloudinary */
  private getEstensione(url: string): string {
    const parts = url.split('?')[0].split('.');
    return parts.length > 1 ? parts.pop()! : '';
  }

  //metodo che consente di trasformare un media da altra angolazione a frontale e quella frontale diventa altra
  //questo perche devo avere una sola angolazione
  /**
   * Promuove un media da secondario a frontale.
   */
  rendiMediaFrontale(url: string, urlDaRendereFrontale: string): void {
    console.log('Metodo invocato per trasformare un media in un frontale');

    // Recupera l’array di URL secondari; se la chiave non esiste, usa un array vuoto.
    const urlsNoFrontali = this.mapUrlsNoFrontali[url] ?? [];
    console.log('urls no frontali recuperate', JSON.stringify(urlsNoFrontali));

    const obj: UpdateAngolazioneMedia = {
      urlDaRendereFrontale,
      // L’array completo deve contenere prima l’URL frontale attuale
      // seguito dagli URL secondari, evitando duplicati.
      urlsTotali: [url, ...urlsNoFrontali.filter(u => u !== url)]
    };

    console.log('JSON da inviare al backend', JSON.stringify(obj));

    this.adminService.updateAngolazioneMedia(obj, this.isConfigFolder).subscribe({
      next: (data) => {
        console.log('Aggiornamento completato con successo:', data);
        this.mostraMessaggioSnakBar('Anteprima impostata correttamente', false);
        this.sharedService.notifyCacheIsChanged();
      },
      error: (error) => {
        console.error('Si è verificato un errore durante l’aggiornamento:', error);
        this.mostraMessaggioSnakBar('Errore durante l’impostazione dell’anteprima', true);
      }
    });


    // Esempio di chiamata al servizio:
    // this.mediaService.setFrontale(obj).subscribe(...);
  }


  /*Nuova funzionalità di upload
    Le card sono droppabili in modo tale da aggiungere un media andando a droppare direttamente su quel media
   Qui la drag leave non la usiamo perche, se inserissi la drag leave su preview card, se mi muovo nella card
   e quindi vado poi su media gallery, viene chiamata la drag leave perche sono uscito dal dom anche se 
   media gallery è figlio quindi creo una sorta di on drag leave con un timeout
   quindi non ho bisogno piu di onDragLeave, ma uso onDragOver cosi quando sono sulla card si attiva 
   quando esco on drag over non viene piu chiamato e quindi con un timeout (perche sa che sono uscito) mette la variabile
   is dragging a null
    */

  isDraggingOnCard: string | null = null;
  private dragOverTimeout: any = null; // per controllare l'uscita dalla card

  onDragEnterOnCard(event: DragEvent, url: string) {
    // Non serve fare nulla qui, ma puoi loggare se vuoi
    console.log("Sono entrato");
  }

  onDragOverOnCard(event: DragEvent, url: string) {
    event.preventDefault(); // necessario per abilitare il drop
    console.log("Sono sopra la card");

    // Imposta lo stato attivo per questa card
    this.isDraggingOnCard = url;

    // Cancella il timeout precedente (se esiste)
    if (this.dragOverTimeout) {
      clearTimeout(this.dragOverTimeout);
    }

    // Imposta un nuovo timeout: se non riceve altri dragover in 100ms, resetta lo stato
    this.dragOverTimeout = setTimeout(() => {
      this.isDraggingOnCard = null;
    }, 100);
  }

  arrayFilesDroppatiOnCard: File[] = [];
  onDropOnCard(event: DragEvent, url: string) {
    this.isDraggingOnCard = null;

    const files = event.dataTransfer?.files;
    if (!files || files.length === 0) return;

    this.arrayFilesDroppatiOnCard = Array.from(files);


    // Filtro solo i file il cui tipo MIME rientra tra quelli supportati (image, video, audio)
    const filesSupportati = this.arrayFilesDroppatiOnCard.filter(file => {
      const tipo = file.type.split('/')[0];
      return this.tipiSupportati.includes(tipo);
    });

    // Se nessuno dei file è supportato, blocco l’operazione e avviso l’utente
    if (filesSupportati.length === 0) {
      this.mostraMessaggioSnakBar(
        "I file rilasciati non sono supportati. Puoi caricare solo immagini, video o audio.",
        true
      );
      return;
    }


    // Calcolo quanti file supportati ci sono per ciascun tipo generico (image, video, audio)
    const tipiContati: { [tipo: string]: number } = {};
    filesSupportati.forEach(file => {
      const tipoGenerico = file.type.split('/')[0];
      tipiContati[tipoGenerico] = (tipiContati[tipoGenerico] || 0) + 1;
    });

    // Determino il tipo prevalente: quello con il maggior numero di file presenti
    const tipoPrevalente = Object.keys(tipiContati).reduce((a, b) => {
      return tipiContati[a] > tipiContati[b] ? a : b;
    });

    // Verifico che il tipo prevalente sia uno di quelli accettati
    if (!this.tipiSupportati.includes(tipoPrevalente)) {
      this.mostraMessaggioSnakBar(
        "Tipo di file non supportato. Puoi caricare solo immagini, video o audio.",
        true
      );
      return;
    }

    // Imposto il tipo accettato e lo comunico anche al componente figlio
    this.tipoAccettato = tipoPrevalente as 'image' | 'video' | 'audio';
    this.mediaTypeDropped = tipoPrevalente as 'image' | 'video' | 'audio';

    // Seleziono solo i file che appartengono al tipo prevalente
    const filesValidi = filesSupportati.filter(file => {
      return file.type.split('/')[0] === this.tipoAccettato;
    });

    // Identifico i file che, pur essendo supportati, non corrispondono al tipo prevalente
    const filesScartati = filesSupportati.filter(file => !filesValidi.includes(file));
    const estensioniScartate = Array.from(new Set(
      filesScartati.map(file => file.name.split('.').pop()?.toLowerCase() || 'sconosciuto')
    ));

    // Se ci sono file scartati, mostro un messaggio di errore informativo
    if (filesScartati.length > 0) {
      const tipoEstensione = this.tipoAccettato;
      const msg = filesScartati.length === 1
        ? `Hai cercato di caricare 1 file che non è un${tipoEstensione === 'image' ? "’immagine" : ` ${tipoEstensione.toUpperCase()}`}. Scartato: ${estensioniScartate.join(', ')}`
        : `Hai cercato di caricare ${filesScartati.length} file che non sono ${tipoEstensione === 'image' ? 'immagini' : tipoEstensione.toLocaleLowerCase() + ' dello stesso tipo'}. Scartati: ${estensioniScartate.join(', ')}`;
      console.warn(msg);
      this.mostraMessaggioSnakBar(msg, true);
      
    }

    // Se dopo il filtro non rimane nessun file valido, interrompo e mostro messaggio
    if (filesValidi.length === 0) {
      this.mostraMessaggioSnakBar(
        "Nessun file valido da caricare. Tutti i file sono stati scartati.",
        true
      );
      return;
    }

    // Salvo i file validi in memoria per l’upload
    this.arrayFilesDroppatiOnCard = filesValidi;
    console.log("Totale dei file da caricare: ", this.arrayFilesDroppatiOnCard);

    //inizio a costruire il form data in base a quanti file devo caricare e la folder di input
    //non do un context iniziale perche il backend cosa dovra fare
    /* 1 effettuare una chiamata sul cloud per verificare se quel public id esiste a sistema
       2 se esiste recuperare il context
       3 effettuare l'upload delle altre angolazioni con il context recuperato
       4 aggiornare la cache */
    if (this.arrayFilesDroppatiOnCard.length > 0) {
      const formData: FormData = new FormData();

      //appendo tutti i file
      console.log("File da appendere", this.arrayFilesDroppatiOnCard);
      this.arrayFilesDroppatiOnCard.forEach(file => {
        formData.append('file', file);
      })
      //appendo la folder
      console.log("Folder da appendere: ", this.folderInput);
      formData.append('folder', this.folderInput);

      //appendo anche la url da fornire al backend
      console.log("Url frontale da appendere: ", url);
      formData.append('urlFrontaleDiInput', url);

      this.isUploading = true;
      console.log("Form Data finale da inviare all'upload exist frontale nuovo metodo: ", JSON.stringify(formData));
      this.adminService.uploadMediaExistFrontale(formData, this.isConfigFolder).subscribe({
        next: (response) => {
          this.isUploading = false;
          console.log('Upload riuscito:', response);
          this.sharedService.notifyCacheIsChanged();
          this.mostraMessaggioSnakBar('File caricati correttamente', false);
        },
        error: (err) => {
          this.isUploading = false;
          console.error('Errore durante l\'upload:', err);
          this.mostraMessaggioSnakBar('Errore durante il caricamento dei file', true);
        }
      });
    }
    else {
      this.isUploading = false;
      this.mostraMessaggioSnakBar('Errore nel caricamento di altri file', true);
    }
    
  }

  /* Nuovo metodo che serve per individuare il tipo di tag da utilizzare in base alla url corrente. Questo perche 
  Supponiamo in una card ho 5 media di cui 1 media un jpg (di cui frontale) e 2 media mp3 2 media mp4
  cosa succede, che vedremo solo il media con url frontale quindi vederemo solo jpeg perche lo switch case lo 
  facciamo sulla url dei media frontali
  
  Nel template avevamo
   <!-- ===== IMMAGINE ===== -->
              <ng-container *ngSwitchCase="'image'">
                <!-- Se esiste almeno una secondaria e l'indice è valido (>= 0) uso la secondaria -->
                <ng-container
                  *ngIf="(mapUrlsNoFrontali[url]?.length || 0) > 0 && (currentSecondaryIndex[url] ?? -1) >= 0; else frontaleImg">
                  <img class="gallery-media" [src]="mapUrlsNoFrontali[url]![currentSecondaryIndex[url]!]"
                    [alt]="'Vista alternativa di ' + context.display_name" />
                </ng-container>
                <!-- Fallback: frontale -->
                <ng-template #frontaleImg>
                  <img class="gallery-media" [src]="url" [alt]="'Immagine frontale di ' + context.display_name" />
                </ng-template>
              </ng-container>

  */
/**
 * Determina il tipo del media attualmente visibile in una card,
 * tenendo conto del fatto che potrebbe essere selezionato un media secondario.
 *
 * Se esiste una secondaria con indice valido, si analizza quella.
 * Altrimenti si usa il media frontale come riferimento.
 *
 * Il tipo viene dedotto dal suffisso del file (estensione).
 * Sono supportati i principali formati:
 * - Immagini: .jpg, .jpeg, .png, .webp, .gif, .bmp, .tiff, .svg
 * - Video: .mp4, .webm, .mov, .avi, .mkv, .mpeg, .ogv
 * - Audio: .mp3, .wav, .ogg, .aac, .flac, .m4a
 *
 * Restituisce 'image' se nessuna estensione nota è trovata.
 */
getTipoMediaCorrente(urlFrontale: string): 'image' | 'video' | 'audio' {
  const secondarie = this.mapUrlsNoFrontali[urlFrontale] || [];
  const indiceSecondaria = this.currentSecondaryIndex[urlFrontale] ?? -1;

  const urlCorrente = (secondarie.length > 0 && indiceSecondaria >= 0)
    ? secondarie[indiceSecondaria]
    : urlFrontale;

  if (urlCorrente.match(/\.(mp4|webm|mov|avi|mkv|mpeg|ogv)$/i)) return 'video';
  if (urlCorrente.match(/\.(mp3|wav|ogg|aac|flac|m4a)$/i)) return 'audio';
  if (urlCorrente.match(/\.(jpg|jpeg|png|webp|gif|bmp|tiff|svg)$/i)) return 'image';

  return 'image';
}

}
