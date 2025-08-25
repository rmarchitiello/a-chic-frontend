import { Component } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogRef } from '@angular/material/dialog';
@Component({
  selector: 'app-conferma-delete-massiva',
  imports: [MatIconModule,MatButtonModule],
  templateUrl: './conferma-delete-massiva.component.html',
  styleUrl: './conferma-delete-massiva.component.scss'
})
export class ConfermaDeleteMassivaComponent {

  constructor(private dialogRef: MatDialogRef<ConfermaDeleteMassivaComponent>){

  }


  
  chiudiDialog(siOrNo: boolean): void {
    this.dialogRef.close(siOrNo);
  }

}
