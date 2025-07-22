import { Component, OnInit, Inject } from '@angular/core';
import { MediaCollection } from '../../../pages/home/home.component';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-edit-data-admin',
  imports: [],
  templateUrl: './edit-data-admin.component.html',
  styleUrl: './edit-data-admin.component.css'
})
export class EditDataAdminComponent implements OnInit{


    constructor(
    // Dati ricevuti dal componente padre (array di collezioni)
    @Inject(MAT_DIALOG_DATA) public data: MediaCollection,
    private dialogRef: MatDialogRef<EditDataAdminComponent>
  ) {}

mediaInput: MediaCollection = {
  folder: '',
  items: []
}
  ngOnInit(): void {
    //assegno l'input
    this.mediaInput = this.data;
      console.log("[EditDataAdminComponent] dati ricevuti da modificare ", JSON.stringify(this.data))
  }


  annulla(): void {
    this.dialogRef.close();
  }

}
