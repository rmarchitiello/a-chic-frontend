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
*/
import { Component, Inject, OnInit,OnDestroy } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogRef } from '@angular/material/dialog';
import { MatDialog } from '@angular/material/dialog';
import { DeleteDataAdminComponent } from '../common/delete-data-admin/delete-data-admin.component';
import { DownloadDataAdminComponent } from '../common/download-data-admin/download-data-admin.component';
import { UploadDataAdminComponent } from '../common/upload-data-admin/upload-data-admin.component';
import { MediaCollection, MediaContext, MediaMeta, MediaItems } from '../../pages/home/home.component';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'app-carosello-edit',
  standalone: true, 
  templateUrl: './editor-admin-popup.component.html',
  styleUrls: ['./editor-admin-popup.component.scss','../../../styles.scss'],
  imports: [CommonModule, MatIconModule,MatTooltipModule]
})
export class EditorAdminPopUpComponent implements OnInit {

inputFromFatherComponent: MediaCollection = {
  folder: '',
  items: []
}


  //mi salvo le varie variabili
  folderInput: string = '';
  itemsInput: MediaItems[] = [];
  contextsInput: MediaContext[] = [];
  mediasInput: MediaMeta[] = [];


  //carico le url frontali dai media input da dare in pasto al template
  mediasUrlsFrontale: string[] = []

    //ora ogni url frontale ha un suo context, per intederci ogni url frontale che è un immagine ha i suoi metadati
  //quindi creo una mappa inversa ovvero url frontale e metadati [url1, url2, url3] - [ctx1,ctx2,ctx3]
//equivalente contextMap: Record<string, MediaContext> = {}; ma nei template non e gestito bene 
  contextMap: { [url: string]: MediaContext } = {};

  currentIndex: number = 0;





  constructor(
    //ricevo il dato dalla home
    @Inject(MAT_DIALOG_DATA) public data: MediaCollection,
    private dialogRef: MatDialogRef<EditorAdminPopUpComponent>,
    private dialog: MatDialog,
  ) {}






ngOnInit(): void {
  // Assegna i dati ricevuti dal componente padre alla variabile locale
  this.inputFromFatherComponent = this.data;
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
  console.log("Url frontali recuperate: ", this.mediasUrlsFrontale.length);
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


    ngOnDestroy(): void {
    this.chiudiDialog();
  }


getMediaUrlsFrontale(media: MediaMeta[]): string[] {
  return media
    .filter(m => m.angolazione === 'frontale') // prendo solo i frontali {url, angolazione}
    .map(m => m.url);                          // estrai le URL e creo l'array di string[]
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
getPreview(value: string, max = 40): string {
  if (typeof value !== 'string') return value as any;
  return value.length > max ? value.slice(0, max) + ' …' : value;
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

getOrderedFormattedEntries(context: MediaContext): { key: string, label: string, value: string }[] {
  const ordine = ['display_name', 'descrizione', 'type', 'quantita'];

  const customLabels: { [key: string]: string } = {
    display_name: 'Nome File',
    descrizione: 'Descrizione',
    type: 'Tipo',
    quantita: 'Quantità'
  };

  // Trasforma le entry in array con chiave, etichetta formattata e valore
  const entries = Object.entries(context).map(([key, value]) => ({
    key,
    label: customLabels[key] || key.replace(/_/g, ' ').replace(/\w\S*/g, w => w.charAt(0).toUpperCase() + w.slice(1)),
    value: value ?? ''
  }));

  // Ordina prima le chiavi definite in ordine, poi le altre
  return [
    ...entries.filter(e => ordine.includes(e.key)).sort((a, b) => ordine.indexOf(a.key) - ordine.indexOf(b.key)),
    ...entries.filter(e => !ordine.includes(e.key))
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
  folderToUpload: string =  'Config/Home/Carosello'; //anche qui rendere dinamico
   
  apriPopUpCaricaMedia(){

     this.dialog.open(UploadDataAdminComponent, {
        width: '90vw',
        disableClose: false,
        data: this.folderToUpload
  });
  }





  chiudiDialog(): void {
    this.dialogRef.close();
            setTimeout(() => {
          window.location.reload();
        }, 400);
  }

}
