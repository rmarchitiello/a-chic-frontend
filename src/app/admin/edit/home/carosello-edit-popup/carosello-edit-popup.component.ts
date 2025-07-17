//qui avrò i metodi per modificare solo il carosello 
/* Nella home impostiamo il tasto di modifica, quel tasto di modifica chiama questo pop up 
e poi questo component chiama il pop up dinamicamente se in abse a una cancellazione ecc chiama i pop up common*/
import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogRef } from '@angular/material/dialog';
import { MatDialog } from '@angular/material/dialog';
import { DeleteDataAdminComponent } from '../../../common/delete-data-admin/delete-data-admin.component';
import { DownloadDataAdminComponent } from '../../../common/download-data-admin/download-data-admin.component';
import { ImmagineConfig } from '../../../../pages/home/home.component';



@Component({
  selector: 'app-carosello-edit',
  standalone: true,
  templateUrl: './carosello-edit-popup.component.html',
  styleUrl: './carosello-edit-popup.component.scss',
  imports: [CommonModule, MatIconModule]
})
export class CaroselloEditPopUpComponent implements OnInit {

immaginiCarosello: ImmagineConfig[] = [];


  displayName: string = '';
  currentIndex: number = 0;

  constructor(
    //ricevo il dato dalla home
    @Inject(MAT_DIALOG_DATA) public data: ImmagineConfig[],
    private dialogRef: MatDialogRef<CaroselloEditPopUpComponent>,
    private dialog: MatDialog

  ) {}

  ngOnInit(): void {
    this.immaginiCarosello = this.data;
    console.log("Dati ricevuti dalla home: ", JSON.stringify(this.immaginiCarosello));
  }

  prevImage(): void {
    if (this.currentIndex > 0) {
      this.currentIndex--;
    }
  }

  nextImage(): void {
    if (this.currentIndex < this.immaginiCarosello.length - 1) {
      this.currentIndex++;
    }
  }

apriPopUpEliminaImmagine(): void {
  // Recupero l'URL dell'immagine attualmente selezionata
  const urlDaEliminare = this.immaginiCarosello[this.currentIndex].url;
  console.log("Url immagine da eliminare: ", urlDaEliminare)
  // Apro il dialog di conferma eliminazione, passando l'URL al componente figlio
  const dialogRef = this.dialog.open(DeleteDataAdminComponent, {
    width: '90vw',
    disableClose: false,
    data: urlDaEliminare
  });

  // Dopo la chiusura del dialog (conferma o annulla)
  dialogRef.afterClosed().subscribe((eliminatoConSuccesso: boolean) => {

    // Solo se il figlio ha confermato e l'eliminazione è andata a buon fine
    if (eliminatoConSuccesso) {

      // Rimuovo l'immagine dall'array
      this.immaginiCarosello.splice(this.currentIndex, 1);

      // Correggo l'indice se siamo alla fine dell'array
      if (this.currentIndex >= this.immaginiCarosello.length) {
        this.currentIndex = Math.max(0, this.immaginiCarosello.length - 1);
      }
    } else {
      // Opzionale: puoi loggare o gestire un messaggio se l'eliminazione è stata annullata o fallita
      console.log('Eliminazione annullata o fallita.');
    }
  });
}



  apriPopUpdownloadMedia(): void {
    const dataInputDownload: ImmagineConfig = {
      url: this.immaginiCarosello[this.currentIndex].url,
      display_name: this.immaginiCarosello[this.currentIndex].display_name
    }

     this.dialog.open(DownloadDataAdminComponent, {
        width: '90vw',
        disableClose: false,
        data: dataInputDownload
  });

  }

  

  apriPopUpCaricaImmagine(){
    
  }

chiudiDialog(): void {
  this.dialogRef.close();
}
}
