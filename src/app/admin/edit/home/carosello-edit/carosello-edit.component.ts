import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogRef } from '@angular/material/dialog';
import { MatDialog } from '@angular/material/dialog';
import { DeleteDataAdminComponent } from '../../../delete-data-admin/delete-data-admin.component';

interface CaroselloEditData {
  caroselloImmaginiInput: string[];      
}

@Component({
  selector: 'app-carosello-edit',
  standalone: true,
  templateUrl: './carosello-edit.component.html',
  styleUrl: './carosello-edit.component.scss',
  imports: [CommonModule, MatIconModule]
})
export class CaroselloEditComponent implements OnInit {

immaginiCarosello: CaroselloEditData = {
  caroselloImmaginiInput: []
};
  displayName: string = '';
  currentIndex: number = 0;

  constructor(
    //ricevo il dato dalla home
    @Inject(MAT_DIALOG_DATA) public data: CaroselloEditData,
    private dialogRef: MatDialogRef<CaroselloEditComponent>,
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
    if (this.currentIndex < this.immaginiCarosello.caroselloImmaginiInput.length - 1) {
      this.currentIndex++;
    }
  }

apriPopUpEliminaImmagine(): void {
  // Recupero l'URL dell'immagine attualmente selezionata
  const urlDaEliminare = this.immaginiCarosello.caroselloImmaginiInput[this.currentIndex];

  // Apro il dialog di conferma eliminazione, passando l'URL al componente figlio
  const dialogRef = this.dialog.open(DeleteDataAdminComponent, {
    width: '90vw',
    data: urlDaEliminare
  });

  // Dopo la chiusura del dialog (conferma o annulla)
  dialogRef.afterClosed().subscribe((eliminatoConSuccesso: boolean) => {

    // Solo se il figlio ha confermato e l'eliminazione è andata a buon fine
    if (eliminatoConSuccesso) {

      // Rimuovo l'immagine dall'array
      this.immaginiCarosello.caroselloImmaginiInput.splice(this.currentIndex, 1);

      // Correggo l'indice se siamo alla fine dell'array
      if (this.currentIndex >= this.immaginiCarosello.caroselloImmaginiInput.length) {
        this.currentIndex = Math.max(0, this.immaginiCarosello.caroselloImmaginiInput.length - 1);
      }
    } else {
      // Opzionale: puoi loggare o gestire un messaggio se l'eliminazione è stata annullata o fallita
      console.log('Eliminazione annullata o fallita.');
    }
  });
}



  caricaNuovaImmagine(){
    
  }

  downloadMedia(): void {
    const url = this.immaginiCarosello.caroselloImmaginiInput[this.currentIndex];
    const nomeFile = `${this.displayName}_carosello_${this.currentIndex + 1}.jpg`;

    fetch(url)
      .then(r => r.blob())
      .then(blob => {
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = nomeFile;
        link.click();
        URL.revokeObjectURL(link.href);
      })
      .catch(err => console.error('Errore nel download:', err));
  }

chiudiDialog(): void {
  this.dialogRef.close();
}
}
