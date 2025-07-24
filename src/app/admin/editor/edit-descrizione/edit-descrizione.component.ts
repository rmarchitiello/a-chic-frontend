import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon'; // <-- IMPORTANTE
import { MatDialogRef } from '@angular/material/dialog';
@Component({
  selector: 'app-edit-descrizione',
  standalone: true,
  imports: [MatIconModule],
  templateUrl: './edit-descrizione.component.html',
  styleUrls: ['./edit-descrizione.component.scss']
})
export class EditDescrizioneComponent {
  constructor(
    private dialogRef: MatDialogRef<EditDescrizioneComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { urlFrontale: string; descrizione: string }
  ) {}


  chiudiDialog(){
    this.dialogRef.close();
  }
}
