import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { ImmagineConfig } from '../../../pages/home/home.component';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-download-data-admin',
  imports: [CommonModule,MatIconModule,MatProgressSpinnerModule],
  templateUrl: './download-data-admin.component.html',
  styleUrl: './download-data-admin.component.scss'
})
export class DownloadDataAdminComponent {

  mediaInput: ImmagineConfig[] = [];
  estensione: string = ''
  downloadInCorso: boolean = false;
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: ImmagineConfig[], // dato ricevuto dal componente padre (es. URL immagine da scaricare )
    private dialogRef: MatDialogRef<DownloadDataAdminComponent>    

  ) { }

  ngOnInit(): void {
    // All'inizializzazione, assegno il dato ricevuto alla variabile di lavoro
      console.log("[DownloadDataAdminComponent] oggetti ricevuti da scaricare: ", this.mediaInput);
      this.mediaInput = this.data;

      //scarico il file
     // setTimeout(() => this.chiudiPopUp(), 1000); //chiudo il pop up dopo 3 secondi


  }


 downloadMedia(piuFile: boolean = false, media?: ImmagineConfig): void {
  this.downloadInCorso = true;

  const scaricaFile = (file: ImmagineConfig) => {
    const estensione = this.getEstensione(file.url);
    const nomeFile = `${file.display_name}.${estensione}`;

    fetch(file.url)
      .then(response => {
        if (!response.ok) throw new Error(`Errore HTTP: ${response.status}`);
        return response.blob();
      })
      .then(blob => {
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = nomeFile;
        link.click();
        URL.revokeObjectURL(link.href);
      })
      .catch(err => {
        console.error(`Errore nel download di ${file.display_name}:`, err);
      });
  };

  if (piuFile) {
    // Download di tutti i media uno alla volta
    this.mediaInput.forEach(file => scaricaFile(file));
  } else if (media) {
    // Download di un singolo file
    scaricaFile(media);
  }

  setTimeout(() => {
    this.downloadInCorso = false;
    // this.chiudiPopUp(); // opzionale se vuoi chiudere subito dopo
  }, 1000);
}



 getEstensione(url: string): string {
  const parts = url.split('?')[0].split('.'); // rimuove eventuali query string
  return parts.length > 1 ? parts.pop()! : '';
}

chiudiPopUp(){
  this.dialogRef.close();
}

}
