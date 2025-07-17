import { Component, Inject, OnInit } from '@angular/core';
import { CmsService } from '../../../services/cms.service';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';


@Component({
  selector: 'app-delete-data-admin',
  templateUrl: './delete-data-admin.component.html',
  styleUrl: './delete-data-admin.component.scss',
  standalone: true,
  imports: [] // inserire i moduli Angular Material se si usa standalone
})
export class DeleteDataAdminComponent implements OnInit {

  // URL dell'immagine o media da eliminare
  mediaInput: string = '';

  constructor(
    private cmsService: CmsService,
    private dialogRef: MatDialogRef<DeleteDataAdminComponent>,
    @Inject(MAT_DIALOG_DATA) public data: string // dato ricevuto dal componente padre (es. URL immagine)
  ) {}

  ngOnInit(): void {
    // All'inizializzazione, assegno il dato ricevuto alla variabile di lavoro
    this.mediaInput = this.data;
    console.log("Dato ricevuto da eliminare:", this.mediaInput);
  }

  // Metodo chiamato al click sul pulsante "Elimina"
  deleteMedia(): void {
    this.cmsService.deleteImages([this.mediaInput], true).subscribe({
      next: () => {
        // Eliminazione avvenuta con successo: chiudo il popup e ritorno true al padre
        console.log('Eliminazione riuscita:', this.mediaInput);
        this.dialogRef.close(true);
      },
      error: (err) => {
        // Errore durante l'eliminazione: loggo errore e chiudo comunque il dialog con false
        console.error('Errore durante eliminazione:', err);
        this.dialogRef.close(false);
      }
    });
  }

  // Metodo per annullare e chiudere il popup senza fare nulla
  annulla(): void {
    this.dialogRef.close(false);
  }
}
