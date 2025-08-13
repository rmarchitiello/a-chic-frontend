/* Questo component serve per ricevere il nome della folder e comunica con AdminFolderComponent
In pratica, quando creo o rinomino una folder faccio uscire un piccolo pop up che mi consente di 
aprire questo component. Quando viene chiuso o premo invia, si chiude il pop up e sottocriviamo 
l'output all AdminFolderComponent
*/
import { Component, OnInit, Inject  } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-menage-folder-data',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatInputModule
  ],
  templateUrl: './manage-folder-data.component.html',
  styleUrl: './manage-folder-data.component.scss'
})
export class ManageFolderDataComponent implements OnInit {

  /**
   * FormGroup “contenitore” per il singolo controllo.
   * Avere un FormGroup permette ad Angular di gestire
   * correttamente (ngSubmit) ed evitare il submit nativo del browser.
   */
  form!: FormGroup;

  /**
   * Controllo reattivo usato dal template con [formControl].
   * Viene anche registrato dentro al FormGroup, così non devi
   * cambiare il template attuale.
   */
  setInputFolder!: FormControl<string>;

  label: string = '';
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: {operation: string, cartellePrincipali: string[]},
    private dialogRef: MatDialogRef<ManageFolderDataComponent>,
    private snackBar: MatSnackBar
  ) {}



  ngOnInit(): void {
    
    if(this.data.operation.toLocaleLowerCase() === 'aggiungi'){
      this.label = "Aggiungi Cartella";
    }else if(this.data.operation === 'rinomina'){
      this.label = "Rinomina Cartella";
    }
    else {
      this.label = "Inserisci"
    }
    
    console.log("Operazione ricevuta: ", this.label);
    // Istanzia il FormControl con i validator richiesti.
    // - required: non consente stringhe vuote
    // - pattern: consente solo lettere, numeri, underscore e trattino (niente spazi o caratteri speciali)
    this.setInputFolder = new FormControl<string>('', {
      nonNullable: true,
      validators: [
        Validators.required,
        Validators.pattern(/^[a-zA-Z0-9_-]+$/) // Nessuno spazio o carattere speciale
      ]
    });

    // Registra il controllo dentro a un FormGroup.
    // In questo modo puoi aggiungere altri campi in futuro senza cambiare struttura.
    this.form = new FormGroup({
      setInputFolder: this.setInputFolder
    });
  }

  /**
   * Gestisce il submit del form.
   * Viene chiamato da (ngSubmit) nel template.
   * Chiude il dialog SOLO se:
   * - il valore trim-mato ha lunghezza > 0
   * - il controllo è valido rispetto ai validator (required + pattern)
   * In caso contrario mostra messaggi specifici e NON chiude.
   */
  onSubmit(): void {
  // 1) Normalizzazione del valore
  const raw = this.setInputFolder.value ?? '';
  const value = raw.toString().trim();
  console.log('Folder inserita:', value);

  // 2) Blocco invio se vuoto (dopo trim)
  if (value.length === 0) {
    this.mostraMessaggioSnakBar('Il campo è obbligatorio', true);
    return;
  }

  // 3) Blocco invio se non passa i validator (pattern, ecc.)
  if (this.setInputFolder.invalid) {
    // Mostra il messaggio specifico più utile
    if (this.setInputFolder.hasError('pattern')) {
      this.mostraMessaggioSnakBar('Non sono consentiti caratteri speciali', true);
    } else if (this.setInputFolder.hasError('required')) {
      // In teoria non ci arrivi qui perché abbiamo già gestito value.length === 0
      this.mostraMessaggioSnakBar('Il campo è obbligatorio', true);
    } else {
      this.mostraMessaggioSnakBar('Controlla i dati inseriti', true);
    }
    return;
  }

  /* SEZIONE AGGIUNTA CATEGORIE PRINCIPALI */
  // 4) Controllo duplicati sulle cartelle principali (normalizzato: trim + lowercase)
  const elenco = Array.isArray(this.data?.cartellePrincipali)
    ? this.data.cartellePrincipali
    : [];

  const esistentiNormalizzati = elenco
    .filter(v => v != null)
    .map(v => String(v).trim().toLowerCase());

  if (esistentiNormalizzati.includes(value.toLowerCase())) {
    this.mostraMessaggioSnakBar('Attenzione: esiste già questa categoria', true);
    return; // IMPORTANTE: fermarsi qui
  }
  /* FINE SEZIONE AGGIUNTA CATEGORIE PRINCIPALI */

  // 5) Tutto ok: feedback e chiusura con il valore
  this.dialogRef.close(value);
}


  /**
   * Wrapper centralizzato per mostrare messaggi in snackbar.
   * Usa due classi pannello differenti per ok/errore e durata diversa.
   */
  mostraMessaggioSnakBar(messaggio: string, isError: boolean): void {
    const panelClassCustom = isError ? 'snackbar-errore' : 'snackbar-ok';
    const duration = isError ? 1000 : 500;

    this.snackBar.open(messaggio, 'Chiudi', {
      duration,
      panelClass: panelClassCustom,
      horizontalPosition: 'center',
      verticalPosition: 'top'
    });
  }
}
