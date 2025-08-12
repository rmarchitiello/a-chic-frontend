/* Questo component serve per ricevere il nome della folder e comunica con AdminFolderComponent
In pratica, quando creo o rinomino una folder faccio uscire un piccolo pop up che mi consente di 
aprire questo component. Quando viene chiuso o premo invia, si chiude il pop up e sottocriviamo 
l'output all AdminFolderComponent
*/
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { FormControl } from '@angular/forms';
import { MatInputModule } from '@angular/material/input'; 
import { Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-menage-folder-data',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatInputModule
    
  ],
  templateUrl: './manage-folder-data.component.html',
  styleUrl: './manage-folder-data.component.scss'
})
export class ManageFolderDataComponent implements OnInit {

  setInputFolder!: FormControl;

  constructor(
      private dialogRef: MatDialogRef<ManageFolderDataComponent>,
      private snackBar: MatSnackBar
  ){

  }

  ngOnInit(): void {
        //istanzio la form
        this.setInputFolder = new FormControl('',  [
    Validators.required,
    Validators.pattern(/^[a-zA-Z0-9\s]+$/) // consente solo lettere, numeri e spazi
  ])

  }

onSubmit(): void {
  if (this.setInputFolder.value.trim() > 0 && this.setInputFolder.valid) {
    // Chiude il dialog passando il valore del campo
    this.dialogRef.close(this.setInputFolder.value);
    return;
  }

  // Mostra messaggi di errore specifici
  if (this.setInputFolder.hasError('pattern')) {
    this.mostraMessaggioSnakBar('Non sono consentiti caratteri speciali', true);
  } else if (this.setInputFolder.hasError('required')) {
    this.mostraMessaggioSnakBar('Il campo è obbligatorio', true);
  }
}


  mostraMessaggioSnakBar(messaggio: string, isError: boolean) {
    let panelClassCustom;
    let duration;
    if (isError) {
      panelClassCustom = 'snackbar-errore';
      duration = 1000;
    }
    else {
      panelClassCustom = 'snackbar-ok';
      duration = 500;
    }
    this.snackBar.open(messaggio, 'Chiudi', {
      duration: duration, // durata in ms
      panelClass: panelClassCustom, // classe CSS personalizzata
      horizontalPosition: 'center',
      verticalPosition: 'top'
    });
  }



}
