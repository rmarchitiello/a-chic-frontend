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
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';


export interface RenameFolderRequest {
  oldPath: string,
  newPath: string
}

interface NodiCorrispondentiFigliPiuFullPath {
  fullPath: string,
  nodiFigli: string[]
}
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

  private destroy$ = new Subject<void>();

  readonly MAX_TREE = 3;


  constructor(
    private dialogRef: MatDialogRef<AdminFolderPopUpComponent, string[]>,
    @Inject(MAT_DIALOG_DATA) public data: { isConfig: boolean },
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
  cartellePrincipali: string[] = []; // [borse, accessori, baby, ] categorie principali

  cartellaDaAggiungere: string = '';

  isConfig: boolean = false;
  ngOnInit(): void {

    /* 
      Qui, devo poter leggere da due subject diversi mediasCollectionConfig o mediasCollectionNonConfig
      In base al valore passato dal padre cosi rendo il component riutilizzabile, cioe se il padre gli passa
      isConfig true allora leggo dal subscribe delle config altrimenti da quello normale:
    */
     const collections$ = this.data.isConfig
    ? this.sharedDataService.mediasCollectionsConfig$
    : this.sharedDataService.mediasCollectionsNonConfig$;

    //uso take until cosi si distrugge questo subscribe se esco 
    //carico direttamente dal subscribe
    collections$
      .pipe(takeUntil(this.destroy$))
      .subscribe((collections) => {
        // ) ricalcolo le nuove folder
        const folderEstratte = (collections || []) // array di folder ['borse/conchiglia/perlata, borsa/conchiglia/naturale]
          .map(c => c?.folder.toLowerCase())
          .filter(Boolean);

        // 2) reset stato locale per evitare duplicazioni
        this.tree = [];
        this.cartellePrincipali = [];
        console.log("Folder estratte: ", folderEstratte);
        // 3) ricostruisco l’albero
        this.treeInitialization(folderEstratte);
      });
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
      console.log("Cartelle principali estratte: ", this.cartellePrincipali);
      console.log("Tree inizializzato: ", this.tree);
    }

  }



  chiudiDialog() {
    this.dialogRef.close();
  }


  onRinomina(fullPath: string) {
      console.log("Path ricevuto da rinominare: ", fullPath);

    // se il fullPath ricevuto da uno split length = 1 allora vuol dire che stiamo rinominando
    //una categoria principale quindi al pop up di manage folder data passiamo i nodi gia esitenti 
    // uguale alle categorie principali caricate precedentemente.
    let nodiGiaEsistenti: string[]  = []
    if(fullPath.split('/').length === 1 ){
        console.log("Stai tentando di rinominare una categoria principlale");
        console.log("Di seguito le categorie principali esistenti: ", this.cartellePrincipali);
        nodiGiaEsistenti = this.cartellePrincipali;
    }


      const dialogRef = this.dialog.open(ManageFolderDataComponent, {
          panelClass: 'popup-manage-folder',
          data: {
          operation: 'rinomina',
              nodiGiaEsistenti: nodiGiaEsistenti
    }
  });

  
  dialogRef.afterClosed().subscribe((result) => {
    console.log('Nome nuova cartella: ', result);

    // Normalizzo l’input del dialog: evita errori se undefined/null e rimuove spazi
    const nomeInserito = (result ?? '').toString().trim();
    if (!nomeInserito) {
      console.warn('Non è stato inserito nulla');
      return; // IMPORTANTE: esci qui se vuoto
    }

    console.log('Nome cartella ricevuta e controllata: ', nomeInserito);
    let requestForRename: RenameFolderRequest = {
      oldPath: fullPath,
      newPath: nomeInserito
    }
  this.adminService.renameFolder(requestForRename, this.data.isConfig).subscribe({
      next: () => {
        console.log('Cartella rinominata sul cloud');
        this.mostraMessaggioSnakBar('Caterogia rinominata con successo', false);
        this.sharedDataService.notifyCacheIsChanged();
      },
      error: (err) => {
        this.mostraMessaggioSnakBar('Errore generico durante l\'aggiunta della categoria', true);
        console.error(err);
      }
    });
  });
    
  }

  onCancella(fullPath: string) {
    console.log("Nodo richiesto da eliminare ", fullPath);
    this.adminService.deleteFolder(fullPath, this.data.isConfig).subscribe({
      next: () => {
        console.log('Cartella eliminata sul cloud');
        this.mostraMessaggioSnakBar('Caterogia elimintata con successo', false);
        this.sharedDataService.notifyCacheIsChanged();
      },
      error: (err) => {
        this.mostraMessaggioSnakBar('Errore generico durante l\'eliminazione della categoria', true);
        console.error(err);
      }
    });
  }



/**
 * Cerca nel tree (qualsiasi profondità) il nodo con fullPath corrispondente.
 * Confronto case-insensitive tramite toLowerCase().
 * Ritorna il nodo trovato oppure undefined se non esiste.
 * Ritorna l'array dei nodi corrispondenti esempio supponiamo di avere questo json
 * [
  {
    "folder": "Borse/Conchiglia/Perlata",
    "items": [
      {
        "context": {
          "display_name": "Nome_1754661682779_0",
          "descrizione": "Da inserire",
          "quantita": "0",
          "type": "image"
        },
        "media": [
          {
            "url": "https://res.cloudinary.com/dmf1qtmqd/image/upload/v1754661682/Config/Home/Carosello/onahqzydigelhllaqu5i.jpg",
            "angolazione": "frontale"
          }
        ]
      }
	 },
   {
    "folder": "Borse/Cono/Perlata",
    "items": [
      {
        "context": {
          "display_name": "Nome_1754661682779_0",
          "descrizione": "Da inserire",
          "quantita": "0",
          "type": "image"
        },
        "media": [
          {
            "url": "https://res.cloudinary.com/dmf1qtmqd/image/upload/v1754661682/Config/Home/Carosello/onahqzydigelhllaqu5i.jpg",
            "angolazione": "frontale"
          }
        ]
      }
	 }
	}
]
  se clicco su borse lui mi da conchiglia e cono e cosi via 
 */

  
getNodiCorrispondenteFromFullPathRicevuto(fullPath: string): NodiCorrispondentiFigliPiuFullPath | undefined{
  console.log("Full Path Ricevuto: ", fullPath);
  // 1) Normalizza il target
  const target = (fullPath ?? '').toLowerCase().trim();
  if (!target) return undefined;

  // 2) DFS iterativa nel tree
  const stack = [...(this.tree ?? [])];

  while (stack.length) {
    const node = stack.pop()!; //elimina ultimo oggetto dall array
    const nodePath = String(node?.fullPath ?? '').toLowerCase();

    // 3) Se è il nodo cercato, ritorna i SUOI FIGLI come array di stringhe
    if (nodePath === target) {
      const children = Array.isArray(node?.child) ? node.child : [];
      const endMethod = {
        fullPath: fullPath,
        nodiFigli: children.map(c => String(c?.nodoCorrente ?? ''))
      } 
      console.log("End metodo get nodi figli piu fullPath: ",endMethod )
      return endMethod;
    }

    // 4) Continua a scendere
    const children = Array.isArray(node?.child) ? node.child : [];
    if (children.length) stack.push(...children);
  }

  // 5) Non trovato
  return undefined;
}


 
//se viene passato mainFolder a true allora sto aggiungendo una cartella main altrimenti sotto cartella
/* Ovviamente se non passo la fullPath vuol dire che sto creando una cartella main
altrimenti e una sottocartella */ 
onAggiungi(mainFolder: boolean, fullPath?: string) {
  if(fullPath){
    const checkMaxTree = fullPath.split('/').length === this.MAX_TREE;
    console.log("Max tree current: ", checkMaxTree)
    if(checkMaxTree){
        this.mostraMessaggioSnakBar("Non puoi aggiungere altri filtri", true);
        return;
    }
  }
  let nodiGiaEsistenti: string[] | undefined;
  let initialPath: string | undefined; // path base del nodo selezionato (se non mainFolder)

  if (mainFolder) {
    // Aggiunta di una cartella di primo livello: confronta contro le principali
    nodiGiaEsistenti = this.cartellePrincipali;
  } else {
    if (fullPath) {
      // ATTENZIONE: questa funzione deve restituire un oggetto { nodiFigli: string[], fullPath: string }
      // Se invece restituisce un array, qui non funzionerebbe: adegua la funzione o questo accesso.
      const info = this.getNodiCorrispondenteFromFullPathRicevuto(fullPath);
      nodiGiaEsistenti = info?.nodiFigli;
      initialPath = info?.fullPath;
    } else {
      this.mostraMessaggioSnakBar('Devi inserire un valore', true);
      return;
    }
  }

  console.log('Nodi estratti: ', nodiGiaEsistenti);

  const dialogRef = this.dialog.open(ManageFolderDataComponent, {
    panelClass: 'popup-manage-folder',
    data: {
      operation: 'aggiungi',
      nodiGiaEsistenti: nodiGiaEsistenti
    }
  });

  dialogRef.afterClosed().subscribe((result) => {
    console.log('Categoria inserita: ', result);

    // Normalizzo l’input del dialog: evita errori se undefined/null e rimuove spazi
    const nomeInserito = (result ?? '').toString().trim();
    if (!nomeInserito) {
      console.warn('Non è stato inserito nulla');
      return; // IMPORTANTE: esci qui se vuoto
    }

    console.log('Nome cartella ricevuta e controllata: ', nomeInserito);
    this.cartellaDaAggiungere = nomeInserito;

    // Costruzione del path:
    // - initialPath può essere undefined (es. mainFolder === true) → usa stringa vuota
    const base = (initialPath ?? '').trim();
    const path = base ? `${base}/${nomeInserito}` : nomeInserito;

    this.adminService.createFolder(path, this.data.isConfig).subscribe({
      next: () => {
        console.log('Cartella aggiunta sul cloud');
        this.mostraMessaggioSnakBar('Caterogia aggiunta con successo', false);
        this.sharedDataService.notifyCacheIsChanged();
      },
      error: (err) => {
        this.mostraMessaggioSnakBar('Errore generico durante l\'aggiunta della categoria', true);
        console.error(err);
      }
    });
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
