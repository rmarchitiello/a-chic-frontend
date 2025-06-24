import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatDialogRef } from '@angular/material/dialog';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';
@Component({
  selector: 'app-cms-media-new-folder',
  standalone: true,
  templateUrl: './cms-media-new-folder.component.html',
  styleUrls: ['./cms-media-new-folder.component.scss'],
  imports: [
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    CommonModule
  ]
})
export class CmsMediaNewFolderComponent  {
  nomeCartella: string = '';
  rename: boolean = false;

  //mi serve per mandare il ritorno al padre quindi uso dialogRef nel template per poi passarlo in ngModel e nella close lo mando al padre
  constructor(public dialogRef: MatDialogRef<CmsMediaNewFolderComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { isRename: boolean } //sto dicendo guarda che qualcuno ti sta passando questa variabile data con dentro is rename
  ) {
      this.rename = this.data.isRename;

  }



}
