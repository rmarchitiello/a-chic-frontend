import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { CmsService } from '../../../services/cms.service';
import { MatDialogRef } from '@angular/material/dialog';

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
    @Inject(MAT_DIALOG_DATA) public data: CaroselloEditData,
    private cmsService: CmsService,
    private dialogRef: MatDialogRef<CaroselloEditComponent>
  ) {}

  ngOnInit(): void {
    this.immaginiCarosello = this.data;
    console.log("wewewewe: ", JSON.stringify(this.immaginiCarosello));
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

  eliminaImmagine(): void {
    const urlDaEliminare = this.immaginiCarosello.caroselloImmaginiInput[this.currentIndex];
    const confermato = window.confirm('Sei sicuro di voler eliminare questa immagine dal carosello?');
    if (!confermato) return;

    this.cmsService.deleteImages([urlDaEliminare],true).subscribe({
      next: () => {
        console.log('Eliminazione riuscita:', urlDaEliminare);
        this.immaginiCarosello.caroselloImmaginiInput.splice(this.currentIndex, 1);
        if (this.currentIndex >= this.immaginiCarosello.caroselloImmaginiInput.length) {
          this.currentIndex = Math.max(0, this.immaginiCarosello.caroselloImmaginiInput.length - 1);
        }
      },
      error: (err) => {
        console.error('Errore durante eliminazione:', err);
      }
    });
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
