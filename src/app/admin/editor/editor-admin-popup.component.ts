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
}*/
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
@Component({
  selector: 'app-carosello-edit',
  templateUrl: './editor-admin-popup.component.html',
  styleUrls: ['./editor-admin-popup.component.scss','../../../styles.scss'],
  imports: [CommonModule, MatIconModule,CommonModule]
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






  currentIndex: number = 0;





  constructor(
    //ricevo il dato dalla home
    @Inject(MAT_DIALOG_DATA) public data: MediaCollection,
    private dialogRef: MatDialogRef<EditorAdminPopUpComponent>,
    private dialog: MatDialog

  ) {}

ngOnInit(): void {
  // Assegna i dati ricevuti dal componente padre alla variabile locale
  this.inputFromFatherComponent = this.data;
  console.log("Dati ricevuti dalla home: ", this.inputFromFatherComponent);

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
}


    ngOnDestroy(): void {
    this.chiudiDialog();
  }


getMediaUrlsFrontale(media: MediaMeta[]): string[] {
  return media
    .filter(m => m.angolazione === 'frontale') // prendo solo i frontali {url, angolazione}
    .map(m => m.url);                          // estrai le URL e creo l'array di string[]
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
