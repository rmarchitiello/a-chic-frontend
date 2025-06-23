import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-cms-media-new-folder',
  standalone: true,
  templateUrl: './cms-media-new-folder.component.html',
  styleUrls: ['./cms-media-new-folder.component.scss'],
  imports: [
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule
  ]
})
export class CmsMediaNewFolderComponent {
  nomeCartella: string = '';

  constructor(public dialogRef: MatDialogRef<CmsMediaNewFolderComponent>) {}

  creaCartella(): void {
    this.dialogRef.close(this.nomeCartella.trim()); //restiusco al padre il nome della cartella da creare
  }
}
