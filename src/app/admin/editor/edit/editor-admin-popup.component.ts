//component che mi serve per modificare un layout

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
import { DeleteDataAdminComponent } from '../../common/delete-data-admin/delete-data-admin.component';
import { DownloadDataAdminComponent } from '../../common/download-data-admin/download-data-admin.component';
import { UploadDataAdminComponent } from '../../common/upload-data-admin/upload-data-admin.component';
import { MediaCollection, MediaContext, MediaMeta, MediaItems } from '../../../pages/home/home.component';
import { MatTooltipModule } from '@angular/material/tooltip';
import { SharedDataService } from '../../../services/shared-data.service';
import { ViewMetadata } from '../view/view-metadata.component';
//importato per modificare i metadati (come nella fase di upload)
import { EditDataAdminComponent } from '../../common/edit-data-admin/edit-data-admin.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

/* NUOVO METODO DI UPLOAD DI UN MEDIA. . .
Voglio implementare una nuova funzionalita quando dall editor

trascino un file, in automatico viene subito caricato per poi modificare in metadata direttamente nella card, e, secondo me è molto piu scabile anziche aprire un 
pop up e gestire tutto da li.
Anche per i metadata voglio gestire tutto da editor quindi ogni valore nella card, sarà una reactive form.

Ora, per utilizzare le funzionalità del component di upload utilizzo l'approccio One-Way input binding, 
ovvero l'Editor mediante @Input nel figlio passa i campi in questo caso la folder e i file.
*/

@Component({
  selector: 'app-carosello-edit',
  standalone: true,
  templateUrl: './editor-admin-popup.component.html',
  styleUrl: './editor-admin-popup.component.scss',
  imports: [CommonModule, MatIconModule, MatTooltipModule,UploadDataAdminComponent,MatProgressSpinnerModule]
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

  //  Mappa di url no frontali ovvero, per ogni url non frontale associo un array di url non frontali
  //  urlFrontale: [url1_nofrontale, url2_nofrontale, url3_nofrontale]
  mapUrlsNoFrontali: { [urlFrontale: string]: string[] } = {};

  //ora ogni url frontale ha un suo context, per intederci ogni url frontale che è un immagine ha i suoi metadati
  //quindi creo una mappa inversa ovvero url frontale e metadati [url1, url2, url3] - [ctx1,ctx2,ctx3]
  //equivalente contextMap: Record<string, MediaContext> = {}; ma nei template non e gestito bene 
  contextMap: { [url: string]: MediaContext } = {};

  currentIndex: number = 0;

  // Mappa per tracciare l'indice dell'immagine non frontale attualmente visibile per ciascuna card
  currentSecondaryIndex: { [urlFrontale: string]: number } = {};




  constructor(
    //ricevo il dato dalla home
    //@Inject(MAT_DIALOG_DATA) public data: MediaCollection lo commento non serve perche ricevo l'input dal observable mediante subscribe,
    private dialogRef: MatDialogRef<EditorAdminPopUpComponent>,
    private sharedService: SharedDataService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) { }


  caricaMediaCollection(data: MediaCollection) {
    if (data) {
      console.log('[EditorAdminPopUpComponent] Media ricevuto:', data);
      // Assegna i dati ricevuti dal componente padre alla variabile locale
      this.inputFromFatherComponent = data;
      console.log("Dati ricevuti dalla home: ", JSON.stringify(this.inputFromFatherComponent));

      // Estrae il percorso della cartella
      this.folderInput = this.inputFromFatherComponent.folder;
      console.log("Folder ricevuta in ingresso: ", this.folderInput);

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



      console.log("Url frontali recuperate: ", this.mediasUrlsFrontale.length);
      console.log("Mappa Url non frontali recuperate: ", this.mapUrlsNoFrontali);

      //ora ogni url frontale ha un suo context, per intederci ogni url frontale che è un immagine ha i suoi metadati
      //quindi creo una mappa inversa ovvero url frontale e metadati [url1, url2, url3] - [ctx1,ctx2,ctx3]

      //assegno la mappa
      this.getContextFromMediaUrlsFrontali(this.mediasUrlsFrontale);
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
    // Impedisci il comportamento di default per il drag/drop a livello globale
    //non fa uploadre cose all esterno del drop
    window.addEventListener('dragover', this.preventBrowserDefault, false);
    window.addEventListener('drop', this.preventBrowserDefault, false);

    //primo caricamento quando home apre il pop up
    this.sharedService.mediaCollectionConfig$.subscribe(data => {

      if (data) {
        this.caricaMediaCollection(data);
      }

    });

    //SECONDO CARICAMENTO quando l'editor e ancora aperto e quindi è app component a inviare tutta la collezione
    //sono in ascolto di tutta la mediasCollections filtrando per folderSelezionata
    //questo metodo viene invocato successivamente quando l'upload invia la notifica
    //controllo se la folder selezionata è vuota perche se lo è vuol dire che stiamo a HomeComponent apre pop up e passa i dati qui
    //se invece la folder e piena vuol dire che l'upload ha notificato a home che c e stato un cambiamento e parte quest evento
    this.sharedService.mediasCollectionsConfig$.subscribe(data => {
      if (data.length > 0) {


        this.folderSelezionata = this.folderInput;
        if (this.folderSelezionata) {
          console.log("Folder selezionata: ", this.folderSelezionata);
          const mediasCollection: MediaCollection[] = data;
          this.inputFromFatherComponent = mediasCollection.find(
            mediaColl => mediaColl.folder === this.folderSelezionata
          ) || { folder: '', items: [] };
          console.log("Ricalcolo input from father: ", this.inputFromFatherComponent);
          console.log("Re invio i nuovi media collection: ")
          //chiamo la carica media collection per risettare input from father piu gli array delle no frontali ecc..
          this.caricaMediaCollection(this.inputFromFatherComponent);
        }
        else {
          console.log("La folder selezionata è vuota, quindi i dati li ha passati HomeComponent -> EditorComponent tramite pop up")
        }
      }



    });


  }


  private inizializzaIndiciSecondari(): void {
    for (const url of this.mediasUrlsFrontale) {
      if (this.mapUrlsNoFrontali[url]?.length > 0) {
        this.currentSecondaryIndex[url] = 0;
      }
    }
  }



  //restituisco l'array di url frontali
  getMediaUrlsFrontale(media: MediaMeta[]): string[] {
    return media
      .filter(m => m.angolazione === 'frontale') // prendo solo i frontali {url, angolazione}
      .map(m => m.url);                          // estrai le URL e creo l'array di string[]
  }

  //restituisco array di urls no fronale entrano gli items ed esce una mappa urlFrontale - urlNoFrontali
  getMediaUrlsNoFrontale(items: MediaItems[]): { [urlFrontale: string]: string[] } {
    const mappa: { [urlFrontale: string]: string[] } = {};

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
  getPreview(value: string, max = 18): string {
    this.descrizioneLunga = value.length > max //se la descrizione è grande ritorna true;
    if (typeof value !== 'string') return value as any;
    return value.length > max ? value.slice(0, max) + '...' : value;
  }
  //metodo che mi fa capire se un determinata stringa supera i 40 caratteri
  //se lo supera torna true
  isLongText(value: any): boolean {
    return typeof value === 'string' && !!value && value.length > 40;
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


  // Mostra l'immagine secondaria precedente
  prevSecondaryImage(url: string): void {
    if (this.mapUrlsNoFrontali[url]) {
      const total = this.mapUrlsNoFrontali[url].length;
      this.currentSecondaryIndex[url] =
        (this.currentSecondaryIndex[url] - 1 + total) % total;
    }
  }

  // Mostra l'immagine secondaria successiva
  nextSecondaryImage(url: string): void {
    if (this.mapUrlsNoFrontali[url]) {
      const total = this.mapUrlsNoFrontali[url].length;
      this.currentSecondaryIndex[url] =
        (this.currentSecondaryIndex[url] + 1) % total;
    }
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

  //pop up per eliminare un media
  apriPopUpEliminaMedia(): void {
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






  /* APERTURA DEL POP UP DI UPLOAD SIA MEDIANTE DRAG AND DROP CHE CON CLICK 
  Quando clicco normalmente si apre la finestra di upload e li o seleziono il file o
  faccio drad e drop (ma questo nella finestra di upload)
  
  Se apro invece il pop up mediante drag e drop passo direttamente all'upload il context isUploadComponent true o false e direttamente la lista dei file*/



  //pop up per editare i metadati
  //se viene chiamato dall'upload allora non deve restituire nulla ma anzi riceve dal subscribeConfiMediacollections tutta la collections 
  //perche se tenta di editare una card e mettere lo stesso nome deve andare in errore
  apriPopUpEditMedia(context: MediaContext, isUploadComponent: boolean): void {
    console.log("[EditorAdmin] context da editare: ", context);

    // Apro il popup passando file e metadati
    this.dialog.open(EditDataAdminComponent, {
      panelClass: 'popup-edit-metadati-dialog',
      data: {
        context: context,
        isUploadComponent: isUploadComponent
      }
    });

  }


  
  //pop up per caricare un media
  /* Posso sia cliccare per aprirlo che trascinare qualcosa all interno e si apre passando la lista dei file da caricare
  /* Puo accettare una lista di file da inviare al pop up di upload 
    Se la lista dei file non viene inviata allora li carico a mano nel pop up
    altrimenti accetta una lista di file oltre all input folder cosi si apre il pop up direttamente con i file da caricare
    Quindi se premo il tasto aggiungi prodotto, si apre il pop up senza lista di file.
    Se faccio drag e drop si apre direttamente il pop up con la lista dei file
  */

  apriPopUpUploadMedia(files?: File[]) {

    console.log("File sono droppati dall'editor ? " , this.isDragging);
    this.dialog.open(UploadDataAdminComponent, {
      panelClass: 'upload-dialog',
      disableClose: false,
      data: {inputFolder: this.folderInput, files: files} //se viene droppato dall editor allora aggiungiamo i file direttamente dall editor
    });


  }



  preventBrowserDefault(event: Event): void {
    event.preventDefault();
  }


  //mi fa capire se sono sull area di drop
  isDragging: boolean = false;

  onDragEnter(event: DragEvent) {
    this.isDragging = false;
    console.log("Sono entrato nel drag");
  }


  onDragOver(event: DragEvent) {
    this.isDragging = false;
    console.log("Ora mi sto spostando nella drop area");
    event.preventDefault(); // necessario per permettere il drop altrimenti il browser lo apre normalmente

  }

fileArray!: File[];               // Qui salvo i file validi da caricare
tipoAccettato: string | null = null;  // Uso questa variabile per tenere traccia del tipo generico accettato (es. 'image', 'video', 'audio')
mediaTypeDropped: 'image' | 'video' | 'audio' | '' = '';

readonly tipiSupportati = ['image', 'video', 'audio']; // Definisco i soli tipi MIME che accetto

// Metodo invocato quando l'utente rilascia i file nell'area di drop
// Metodo invocato quando l'utente rilascia dei file nell'area di drop
/* Quando chiamo la on drop si abilita a true la variabile che passa gli input al figlio*/
onDrop(event: DragEvent) {
  // Attivo il flag visivo per segnalare che un'area di drop è attiva
  this.isDragging = true;
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
      ? `Hai cercato di caricare 1 file che non è un${tipoEstensione === 'image' ? "’immagine" : ` ${tipoEstensione}`}. Scartato: ${estensioniScartate.join(', ')}`
      : `Hai cercato di caricare ${filesScartati.length} file che non sono ${tipoEstensione === 'image' ? 'immagini' : tipoEstensione + ' dello stesso tipo'}. Scartati: ${estensioniScartate.join(', ')}`;
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

  // L’upload o l’apertura di un popup sarà gestita in seguito (non lo eseguo qui direttamente)
}





  onDragLeave(event: DragEvent) {
    console.log("Sono uscito dalla area");
    this.isDragging = false;
  }

gestisciChiusuraUpload(valore: boolean) {
  this.isDragging = false;

  if (valore) {
    this.mostraMessaggioSnakBar("File caricati correttamente.", false);
  } else {
    this.mostraMessaggioSnakBar("Si è verificato un errore durante il caricamento.", true);
  }
}

    //snackbar
  mostraMessaggioSnakBar(messaggio: string, isError: boolean) {
    let panelClassCustom;
    if (isError) {
      panelClassCustom = 'snackbar-errore';
    }
    else {
      panelClassCustom = 'snackbar-ok';
    }
    this.snackBar.open(messaggio, 'Chiudi', {
      duration: 4000, // durata in ms
      panelClass: panelClassCustom, // classe CSS personalizzata
      horizontalPosition: 'center',
      verticalPosition: 'top'
    });
  }



}
