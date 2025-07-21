//qui avrò i metodi per modificare solo il carosello 
/* Nella home impostiamo il tasto di modifica, quel tasto di modifica chiama questo pop up 
e poi questo component chiama il pop up dinamicamente se in abse a una cancellazione ecc chiama i pop up common*/


/* Per l'upload per farlo piu veloce e piu efficiente uso il drag and drop
Anche come per gli altri component ci sara il pop up di caricamento

Questo component genera sempre dei tasti di upload delete download di qualche media 
*/
import { Component, Inject, OnInit, OnDestroy } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogRef } from '@angular/material/dialog';
import { MatDialog } from '@angular/material/dialog';
import { DeleteDataAdminComponent } from '../common/delete-data-admin/delete-data-admin.component';
import { DownloadDataAdminComponent } from '../common/download-data-admin/download-data-admin.component';
import { UploadDataAdminComponent } from '../common/upload-data-admin/upload-data-admin.component';
import { MediaCollection } from '../../pages/home/home.component';
@Component({
  selector: 'app-carosello-edit',
  templateUrl: './edit-admin-popup.component.html',
  styleUrls: ['./edit-admin-popup.component.scss','../../../styles.scss'],
  imports: [CommonModule, MatIconModule]
})
export class EditAdminPopUpComponent implements OnInit {

mediaInput: MediaCollection[] = [];


  displayName: string = '';
  currentIndex: number = 0;





  constructor(
    //ricevo il dato dalla home
    @Inject(MAT_DIALOG_DATA) public data: MediaCollection[],
    private dialogRef: MatDialogRef<EditAdminPopUpComponent>,
    private dialog: MatDialog

  ) {}

  ngOnInit(): void {
    this.mediaInput = this.data;
    console.log("Dati ricevuti dalla home: ", JSON.stringify(this.mediaInput));
  }

  prevImage(): void {
    if (this.currentIndex > 0) {
      this.currentIndex--;
    }
  }

    ngOnDestroy(): void {
    this.chiudiDialog();
  }

  nextImage(): void {
    if (this.currentIndex < this.mediaInput.length - 1) {
      this.currentIndex++;
    }
  }

apriPopUpEliminaMedia(): void {
  // Recupero l'URL dell'immagine attualmente selezionata
  const mediaDaEliminare = this.mediaInput;
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
      this.mediaInput.splice(this.currentIndex, 1);

      // Correggo l'indice se siamo alla fine dell'array
      if (this.currentIndex >= this.mediaInput.length) {
        this.currentIndex = Math.max(0, this.mediaInput.length - 1);
      }
    } else {
      // Opzionale: puoi loggare o gestire un messaggio se l'eliminazione è stata annullata o fallita
      console.log('Eliminazione annullata o fallita.');
    }
  });
}



apriPopUpDownloadMedia(): void {
  const mediaDaScaricare = this.mediaInput;
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
