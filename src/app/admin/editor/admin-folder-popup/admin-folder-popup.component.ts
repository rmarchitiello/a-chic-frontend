import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatMenuModule } from '@angular/material/menu';
import { MatDialog } from '@angular/material/dialog';
import { ManageFolderDataComponent } from './menage-folder-data/manage-folder-data.component';
import { AdminService } from '../../../services/admin.service';
import { SharedDataService } from '../../../services/shared-data.service';
/* Interfaccia per gestire i path
  Voglio ottenre da borse/conchiglia/perlata borse/conchiglia/naturale, accessori/charm questo json

  [
  {
    "nodoCorrente": "borse",
    "fullPath": "borse",
    "child": [
      {
        "nodoCorrente": "conchiglia",
        "fullPath": "borse/conchiglia",
        "child": [
          {
            "nodoCorrente": "perlata",
            "fullPath": "borse/conchiglia/perlata",
            "child": []
          }
        ]
      }
    ]
  },
  {
    "nodoCorrente": "accessori",
    "fullPath": "accessori",
    "child": [
      {
        "nodoCorrente": "charm",
        "fullPath": "accessori/charm",
        "child": [
          {
            "nodoCorrente": "completi",
            "fullPath": "accessori/charm/completi",
            "child": []
          },
          {
            "nodoCorrente": "gia sai",
            "fullPath": "accessori/charm/gia sai",
            "child": []
          }
        ]
      }
    ]
  },
  {
    "nodoCorrente": "baby",
    "fullPath": "baby",
    "child": [
      {
        "nodoCorrente": "carillon",
        "fullPath": "baby/carillon",
        "child": []
      }
    ]
  }
]

*/
//interfaccia ricorsiva
/* child e un array di tree node questo perche chuld contiene nodocorrente full path e child e cosi via */
interface TreeNode {
  nodoCorrente: string,
  fullPath: string,
  child: TreeNode[]
}

@Component({
  selector: 'app-admin-folder-popup',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule,
    MatTooltipModule,
    MatMenuModule],
  templateUrl: './admin-folder-popup.component.html',
  styleUrls: ['./admin-folder-popup.component.scss']
})
export class AdminFolderPopUpComponent implements OnInit {


  readonly MAX_TREE = 3;


  constructor(
    private dialogRef: MatDialogRef<AdminFolderPopUpComponent, string[]>,
    @Inject(MAT_DIALOG_DATA) public data: { folderEstratte: string[], isConfig: boolean },
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
    private adminService: AdminService,
    private sharedDataService: SharedDataService
  ) { }

  // Definizione d'esempio dell'interfaccia, per contesto.
  // interface TreeNode {
  //   nodoCorrente: string;
  //   fullPath: string;
  //   child: TreeNode[];
  // }

  tree: TreeNode[] = [];

  /* questa variabile serve per prendere tutte le cartelle principali
  in modo tale che quando vado a creare una folder padre vado a checkare se gia esiste
  */
  cartellePrincipali: string[] = [];

  cartellaDaAggiungere: string = '';

  isConfig: boolean = false;
  ngOnInit(): void {
    console.log('[AdminFolderPopUp] input folders:', this.data);
    this.treeInitialization(this.data.folderEstratte);
    console.log("Tree inizializzato di seguito l'oggetto ottenuto: ", JSON.stringify(this.tree));
    console.log("Cartelle principali: ", this.cartellePrincipali);
  }

  // Normalizza un path per sicurezza:
  // - trim degli spazi ai bordi
  // - tutto minuscolo
  // - sostituisce backslash con slash
  normalizzaPath(path: string): string {
    return path
      .trim()
      .toLowerCase()
      .replace(/\\/g, "/");
  }

  // Costruisce l'albero a partire da un array di path tipo:
  // ["borse/conchiglia/perlata", "borse/conchiglia/naturale", "borse/cono"]
  treeInitialization(inputPathString: string[]): void {
    console.log("Inizializzo l'array di TreeNode dall'array di path");

    const pathsNormalizzati = (inputPathString || [])
      .map(p => this.normalizzaPath(p))
      .filter(Boolean);

    //creo anche l'array di cartelle principali
    let cartellePrincipaliTemp: string[] = [];
    for (const path of pathsNormalizzati) {
      const segments = path.split("/").filter(Boolean);
      let accumPath = "";
      let currentLevel = this.tree; // parte dall'array top-level

      cartellePrincipaliTemp.push(segments[0]); //carico tutte le cartelle principali

      for (const segment of segments) {
        accumPath = accumPath ? `${accumPath}/${segment}` : segment;

        // cerca il nodo a questo livello
        let existingNode = currentLevel.find(n => n.nodoCorrente === segment);

        if (!existingNode) {
          existingNode = {
            nodoCorrente: segment,
            fullPath: accumPath,
            child: []
          };
          currentLevel.push(existingNode);
        }

        // scende di un livello
        currentLevel = existingNode.child;
      }

      //carico le cartelle principali in modo che quando aggiungo quella padre mi lancia un errore 
      this.cartellePrincipali = [...new Set(cartellePrincipaliTemp)]; //elimino i duplicati
    }

  }


  onSelectPath(fullPath: string) {

  }
  chiudiDialog() {
    this.dialogRef.close();
  }



  onModifica(nodo: string) {

  }

  onRinomina(nodo: string) {

  }

  onCancella(nodo: string) {

  }

  onAggiungiFiglio(nodo: string) {
    console.log("Nodo cliccato: ", nodo);
  }



  onAggiungiCartellaPrincipale() {

    const dialogRef = this.dialog.open(ManageFolderDataComponent, {
      panelClass: 'popup-manage-folder',
      data: {
        operation: 'aggiungi',
        cartellePrincipali: this.cartellePrincipali
      }
    });

    dialogRef.afterClosed().subscribe((result) => {
      console.log("Nome cartella ricevuta e controllata: ", result);
      this.cartellaDaAggiungere = result;
      //procedo ad aggiungere la categoria nella cache
      //la validazione la faccio nel pop up cosi se non e valida non esco infatti al pop up passo le cartelle principali

      //tutto è valido procediamo con l'aggiunta della cartella
      this.adminService.createFolder(this.cartellaDaAggiungere, this.data.isConfig).subscribe({
        next: (res) => {
          console.log("Cartella aggiunta sul cloud");
          this.mostraMessaggioSnakBar("Caterogia aggiunta con successo", false);
          this.sharedDataService.notifyCacheIsChanged();
        },
        error: (err) => {
          this.mostraMessaggioSnakBar("Errore generico durante l'aggiunta della categoria", true);
          console.error(err);
        }
      }

      )
    });



  }

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
