import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatMenuModule } from '@angular/material/menu';

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
interface TreeNode  {
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
  MatMenuModule  ],
  templateUrl: './admin-folder-popup.component.html',
  styleUrls: ['./admin-folder-popup.component.scss']
})
export class AdminFolderPopUpComponent implements OnInit {

  

  

  constructor(
    private dialogRef: MatDialogRef<AdminFolderPopUpComponent, string[]>,
    @Inject(MAT_DIALOG_DATA) public data: string[],
    private snackBar: MatSnackBar
  ) {}

  // Definizione d'esempio dell'interfaccia, per contesto.
// interface TreeNode {
//   nodoCorrente: string;
//   fullPath: string;
//   child: TreeNode[];
// }

tree: TreeNode[] = [];


ngOnInit(): void {
  console.log('[AdminFolderPopUp] input folders:', this.data);
  this.treeInitialization(this.data);
  console.log("Tree inizializzato di seguito l'oggetto ottenuto: ", JSON.stringify(this.tree))
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

  for (const path of pathsNormalizzati) {
    const segments = path.split("/").filter(Boolean);
    let accumPath = "";
    let currentLevel = this.tree; // parte dall'array top-level

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
  }

}
  onAdd(){

  }

  onRename(){

  }

  onDelete(){

  }

  onSelectPath(fullPath: string){
    
  }
  chiudiDialog(){
    this.dialogRef.close();
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


  onModifica(nodo: string){

  }

  onRinomina(nodo: string){

  }

  onCancella(nodo: string){

  }

  onAggiungiFiglio(nodo: string){
    
  }

}
