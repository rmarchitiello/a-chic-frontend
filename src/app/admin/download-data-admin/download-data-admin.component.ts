import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { ImmagineConfig } from '../../pages/home/home.component';

@Component({
  selector: 'app-download-data-admin',
  imports: [CommonModule],
  templateUrl: './download-data-admin.component.html',
  styleUrl: './download-data-admin.component.scss'
})
export class DownloadDataAdminComponent {

  urlInput: string = '';
  displayNameInput: string = ''
  estensione: string = ''

  downloadSuccess: any = null;
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: ImmagineConfig, // dato ricevuto dal componente padre (es. URL immagine da scaricare )
    private dialogRef: MatDialogRef<DownloadDataAdminComponent>    

  ) { }

  ngOnInit(): void {
    // All'inizializzazione, assegno il dato ricevuto alla variabile di lavoro
    this.urlInput = this.data.url;
    console.log("Url ricevuta da scaricare:", this.urlInput);

    this.displayNameInput = this.data.display_name;
    console.log("Nome file ricevuto da scaricare:", this.displayNameInput);

    this.estensione = this.getEstensione(this.urlInput)
    console.log("Estensione da scaricare: ", this.estensione);

      //scarico il file
      this.downloadMedia();
      setTimeout(() => this.chiudiPopUp(), 1000); //chiudo il pop up dopo 3 secondi


  }


    downloadMedia(): void {
  const url = this.urlInput;
  const fileName = `${this.displayNameInput}.${this.estensione}`;

  fetch(url)
    .then(response => {
      if (!response.ok) {
        throw new Error(`Errore HTTP: ${response.status}`);
      }
      return response.blob();
    })
    .then(blob => {
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = fileName ;
      link.click();
      URL.revokeObjectURL(link.href);
      this.downloadSuccess = true; //  Successo
    })
    .catch(err => {
      console.error('Errore nel download:', err);
      this.downloadSuccess = false; //  Errore
    });
}



 getEstensione(url: string): string {
  const parts = url.split('?')[0].split('.'); // rimuove eventuali query string
  return parts.length > 1 ? parts.pop()! : '';
}

chiudiPopUp(){
  this.dialogRef.close();
}

}
