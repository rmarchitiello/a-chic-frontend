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


caricamento qui dentro direttamente:
dragover	Quando un file viene trascinato sopra l'area	Serve per permettere il drop e attivare un effetto visivo
dragleave	Quando il file esce dall’area (senza lasciarlo)	Serve per ripristinare lo stile (es. togli hover attivo)
drop	Quando il file viene effettivamente lasciato	Serve per recuperare i file e avviare il caricamento

*/
import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogRef } from '@angular/material/dialog';
import { MatDialog } from '@angular/material/dialog';
import { DeleteDataAdminComponent } from '../common/delete-data-admin/delete-data-admin.component';
import { DownloadDataAdminComponent } from '../common/download-data-admin/download-data-admin.component';
import { UploadDataAdminComponent } from '../common/upload-data-admin/upload-data-admin.component';
import { MediaCollection, MediaContext, MediaMeta, MediaItems } from '../../pages/home/home.component';
import { MatTooltipModule } from '@angular/material/tooltip';
import { SharedDataService } from '../../services/shared-data.service';
import { ViewOrEditMetadataComponent } from '../common/edit-data-admin/view-or-edit-descrizione/view-or-edit-metadata.component';
@Component({
  selector: 'app-carosello-edit',
  standalone: true,
  templateUrl: './editor-admin-popup.component.html',
  styleUrl: './editor-admin-popup.component.scss',
  imports: [CommonModule, MatIconModule, MatTooltipModule]
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
  ) { }

  /**  ------------  UPLOAD DEI FILE DRAG E DROP ------------ */
  // Variabile per lo stato visivo dell'hover drag&drop
  isHovering: boolean = false;

  filesDaCaricare: File[] = []; // Lista dei file selezionati

  anteprimeFile: Map<File, string> = new Map(); // Anteprima dei file che sto per caricare

  metadatiPerFile: Map<File, MediaContext> = new Map(); // Metadati per file che sto per caricare

  // Metodo chiamato quando si trascina un file sopra l'area
  onDragOver(event: DragEvent): void {
    event.preventDefault(); // Necessario per permettere il drop
    this.isHovering = true; // Attiva lo stile visivo dell'area
  }

  // Metodo chiamato quando il file esce dall’area di drop
  onDragLeave(event: DragEvent): void {
    event.preventDefault(); // Previene comportamenti indesiderati
    this.isHovering = false; // Rimuove lo stile visivo
  }

  // Metodo chiamato quando l’utente rilascia un file sull’area di drop
  onDrop(event: DragEvent): void {
    event.preventDefault();
    this.isHovering = false;
    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      this.aggiungiFiles(Array.from(files));
      console.log("Files droppati da aggiungere: ", files)
    }
  }

  // Metodo chiamato quando l’utente seleziona file dal file picker
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const files = input.files;
    if (files && files.length > 0) {
      this.aggiungiFiles(Array.from(files));
      console.log("Files selezionati da aggiungere: ", files)

    }
    input.value = '';
  }

  // Metodo centrale per elaborare i file caricati (drag o picker)
  aggiungiFiles(files: File[]): void {
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

        // Inizializza i metadati base
        const meta: MediaContext = {
          display_name: file.name.split('.')[0],
          nome_file: file.name.split('.')[0],
          angolazione: 'frontale',
          quantita: '0',
          descrizione: 'Descrizione da inserire'
        };

        this.metadatiPerFile.set(file, meta);
        console.log("Lista di tutti i file da caricare: ", this.filesDaCaricare);
      }
    });
  }

  rimuoviFile(file: File): void {
    this.filesDaCaricare = this.filesDaCaricare.filter(f => f !== file);
    this.anteprimeFile.delete(file);
    this.metadatiPerFile.delete(file);
  }

  rimuoviTuttiIFiles(): void {
    this.filesDaCaricare = [];
    this.anteprimeFile.clear();
    this.metadatiPerFile.clear();
  }

  //per non far droppare roba fuori con le foto e non mi apre il browser
  preventDefaultGlobal = (event: DragEvent) => {
    event.preventDefault();
  };

  ngOnDestroy(): void {
    window.removeEventListener('dragover', this.preventDefaultGlobal, false);
    window.removeEventListener('drop', this.preventDefaultGlobal, false);
  }
  /*--------------FINE UPLOAD-----------------*/

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
      console.log("Mappa Url non frontali recuperate: ", JSON.stringify(this.mapUrlsNoFrontali));

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

  ngOnInit(): void {

    // Previene comportamento di default del browser per file trascinati fuori area
    window.addEventListener('dragover', this.preventDefaultGlobal, false);
    window.addEventListener('drop', this.preventDefaultGlobal, false);

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

      console.log("Mappa ritornata: ", JSON.stringify(mappa));

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

  //apro solo il pop up della descrizione se passo onlyView vedo solo il pop up in fase di visualizzazione e non di editing
apriPopUpViewOrEditMetadataComponent(url: string, onlyView: boolean, context: MediaContext): void {
  // Log iniziale per confermare la modalità del popup (visualizzazione o modifica)
  console.log("Pop up di edit in sola fase di visualizzazione: ", onlyView);

  // Inizializzo la variabile che conterrà il context privo della chiave "angolazione"
  let contextSenzaAngolazione: MediaContext | undefined = undefined;

  // Se il context è valido, rimuovo la chiave "angolazione" per evitare di modificarla
  if (context) {
    contextSenzaAngolazione = Object.fromEntries(
      Object.entries(context).filter(([key, _]) => key !== 'angolazione')
    );
    console.log("Sto inviando il seguente context: ", contextSenzaAngolazione);
  }

  // Apertura del dialog Angular Material per il componente ViewOrEditMetadataComponent
  this.dialog.open(ViewOrEditMetadataComponent, {
    data: {
      urlFrontale: url,                         // URL dell'immagine selezionata
      onlyView: onlyView,                       // Flag che determina se mostrare solo in lettura
      context: contextSenzaAngolazione          // Metadati senza angolazione
    },
    // Specifico la larghezza solo se non siamo in modalità view-only
  ...(onlyView ? {} : { width: '1000px', height: '1000px' }),
    // Applico una classe CSS diversa in base alla modalità
    panelClass: onlyView
      ? 'popup-descrizione-viewonly'            // Stile visivo per modalità sola lettura
      : 'popup-descrizione-dialog'              // Stile per modalità modifica completa
  });
}




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

  apriPopUpDownloadMedia(): void {
    const mediaDaScaricare = this.inputFromFatherComponent;
    console.log("Oggetti da scaricare: ", mediaDaScaricare)
    this.dialog.open(DownloadDataAdminComponent, {
      width: '90vw',
      disableClose: false,
      data: mediaDaScaricare
    });




  }




  //input statico al momento 
  //input che serve per caricare il file

  apriPopUpUploadMedia() {
    this.dialog.open(UploadDataAdminComponent, {
      width: '90vw',
      disableClose: false,
      data: this.folderInput
    });

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

}
