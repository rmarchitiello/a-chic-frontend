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
import { MediaCollection } from '../../../app.component';
import { MatProgressBarModule } from '@angular/material/progress-bar';
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
    MatMenuModule,
    MatProgressBarModule],
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

isLoading: boolean = false;

// Stato albero (tree) e cartelle root (principali)
tree: TreeNode[] = [];

/**
 * Elenco delle cartelle principali (primo livello), es. ["borse", "accessori", "baby"]
 * Usata per validare duplicati quando si crea una cartella main.
 */
cartellePrincipali: string[] = [];

cartellaDaAggiungere: string = '';
isConfig: boolean = false;

/**
 * Snapshot delle collections attuali (emesse dallo stream in ngOnInit).
 * Serve per controllare se una cartella padre contiene già media, così da
 * bloccare l’aggiunta di sottocategorie in quei casi.
 */
collectionsSnapshot: MediaCollection[] = [];

ngOnInit(): void {
  /**
   * Scegli lo stream corretto in base al tipo (config vs non-config) passato dal padre.
   * Questo rende il componente riutilizzabile.
   */
  const collections$ = this.data.isConfig
    ? this.sharedDataService.mediasCollectionsConfig$
    : this.sharedDataService.mediasCollectionsNonConfig$;

  /**
   * Mi sottoscrivo allo stream e ricostruisco lo stato locale ad ogni emissione.
   * takeUntil(destroy$) evita memory leak quando il componente viene distrutto.
   */
  collections$
    .pipe(takeUntil(this.destroy$))
    .subscribe((collections) => {
      // Memorizzo uno snapshot tipizzato per controlli successivi in onAggiungi/onRinomina
      this.collectionsSnapshot = (collections || []) as MediaCollection[];

      // Estraggo le folder in minuscolo per ricostruire il tree
      const folderEstratte = (collections || [])
        .map(c => c?.folder.toLowerCase())
        .filter(Boolean);

      // Reset dello stato locale per evitare duplicazioni
      this.tree = [];
      this.cartellePrincipali = [];

      console.log("Folder estratte: ", folderEstratte);

      // Ricostruisco struttura ad albero e cartelle principali
      this.treeInitialization(folderEstratte);
    });
}

/**
 * Normalizza un path:
 * - trim spazi
 * - toLowerCase
 * - sostituisce backslash con slash
 */
normalizzaPath(path: string): string {
  return path.trim().toLowerCase().replace(/\\/g, "/");
}

/**
 * Costruisce il tree a partire dall’elenco di path, popolando:
 * - this.tree (struttura gerarchica ricorsiva)
 * - this.cartellePrincipali (solo primo livello, senza duplicati)
 */
treeInitialization(inputPathString: string[]): void {
  console.log("Inizializzo l'array di TreeNode dall'array di path");

  const pathsNormalizzati = (inputPathString || [])
    .map(p => this.normalizzaPath(p))
    .filter(Boolean);

  let cartellePrincipaliTemp: string[] = [];

  for (const path of pathsNormalizzati) {
    const segments = path.split("/").filter(Boolean);
    let accumPath = "";
    let currentLevel = this.tree; // partenza dal top-level

    // Accumulo i candidati root
    cartellePrincipaliTemp.push(segments[0]);

    for (const segment of segments) {
      accumPath = accumPath ? `${accumPath}/${segment}` : segment;

      // Cerca il nodo a questo livello, altrimenti lo crea
      let existingNode = currentLevel.find(n => n.nodoCorrente === segment);
      if (!existingNode) {
        existingNode = {
          nodoCorrente: segment,
          fullPath: accumPath,
          child: []
        };
        currentLevel.push(existingNode);
      }

      // Scendi di livello nella gerarchia
      currentLevel = existingNode.child;
    }

    // Aggiorno la lista delle cartelle principali rimuovendo duplicati
    this.cartellePrincipali = [...new Set(cartellePrincipaliTemp)];
    console.log("Cartelle principali estratte: ", this.cartellePrincipali);
    console.log("Tree inizializzato: ", this.tree);
  }
}

/**
 * Aggiunta cartella:
 * - se mainFolder=true crea una cartella root (valida contro cartellePrincipali)
 * - altrimenti crea una sottocartella sotto `fullPath` (valida contro fratelli)
 * - BLOCCO: se il padre ha già media, impedisce la creazione di sottocategoria
 */
onAggiungi(mainFolder: boolean, fullPath?: string) {
  // 1) Limite di profondità: se già all’ultimo livello, blocca
  if (fullPath) {
    const checkMaxTree = fullPath.split('/').length === this.MAX_TREE;
    if (checkMaxTree) {
      this.mostraMessaggioSnakBar("Non puoi aggiungere altri filtri", true);
      return;
    }
  }

  let nodiGiaEsistenti: string[] | undefined;
  let initialPath: string | undefined; // base path per costruire la sottocartella

  if (mainFolder) {
    // 2) Creazione di una cartella di primo livello: confronto contro le root esistenti
    nodiGiaEsistenti = this.cartellePrincipali;
  } else {
    // 3) Creazione di una sottocartella: serve il path del padre
    if (!fullPath) {
      this.mostraMessaggioSnakBar('Devi selezionare una categoria padre', true);
      return;
    }

    // 3.a) BLOCCO: se il padre ha almeno un media, non permettere sottocategoria
    const parent = (this.collectionsSnapshot || []).find(
      (c) => (c.folder || '').trim().toLowerCase() === fullPath.trim().toLowerCase()
    );
    const parentHasMedia =
      !!parent &&
      Array.isArray(parent.items) &&
      parent.items.some(it => Array.isArray(it.media) && it.media.length > 0);

    if (parentHasMedia) {
      this.mostraMessaggioSnakBar(
        "Non puoi creare una sottocategoria: la categoria selezionata contiene già dei media.",
        true
      );
      return;
    }

    // 3.b) Ricava i nomi dei fratelli per validare duplicati e imposta la base del path
    const info = this.getNodiCorrispondenteFromFullPathRicevuto(fullPath);
    nodiGiaEsistenti = info?.nodiFigli; // elenco stringhe dei fratelli allo stesso livello
    initialPath = info?.fullPath;       // base per costruire il nuovo path
  }

  // 4) Dialog per inserire il nome della nuova cartella
  const dialogRef = this.dialog.open(ManageFolderDataComponent, {
    panelClass: 'popup-manage-folder',
    data: {
      operation: 'aggiungi',
      nodiGiaEsistenti // utile al dialog per validazione di unicità
    }
  });

  dialogRef.afterClosed().subscribe((result) => {
    // 5) Normalizza input e valida
    const nomeInserito = (result ?? '').toString().trim();
    if (!nomeInserito) {
      console.warn('Non è stato inserito nulla');
      return;
    }

    // 6) Duplicati: non permettere stesso nome tra i fratelli (case-insensitive)
    if (Array.isArray(nodiGiaEsistenti)) {
      const dup = nodiGiaEsistenti
        .map(n => (n ?? '').toString().trim().toLowerCase())
        .includes(nomeInserito.toLowerCase());
      if (dup) {
        this.mostraMessaggioSnakBar('Esiste già una cartella con questo nome allo stesso livello', true);
        return;
      }
    }

    // 7) Costruzione path finale:
    //    - se ho una base (sottocartella) concateno
    //    - altrimenti creo una cartella root con il nome inserito
    const base = (initialPath ?? '').trim();
    const path = base ? `${base}/${nomeInserito}` : nomeInserito;

    // 8) Chiamata backend: creazione su Cloudinary; al successo notifico reload cache
    this.isLoading = true;
    this.adminService.createFolder(path, this.data.isConfig).subscribe({
      next: () => {
        this.isLoading = false; // disattivo loading
        this.mostraMessaggioSnakBar('Categoria aggiunta con successo', false);
        this.sharedDataService.notifyCacheIsChanged();
      },
      error: (err) => {
        this.isLoading = false; // disattivo loading
        this.mostraMessaggioSnakBar('Errore generico durante l\'aggiunta della categoria', true);
        console.error(err);
      }
    });
  });
}




  chiudiDialog() {
    this.dialogRef.close();
  }


  onRinomina(fullPath: string) {
    console.log("Path ricevuto da rinominare: ", fullPath);

    // se il fullPath ricevuto da uno split length = 1 allora vuol dire che stiamo rinominando
    //una categoria principale quindi al pop up di manage folder data passiamo i nodi gia esitenti 
    // uguale alle categorie principali caricate precedentemente.
    let nodiGiaEsistenti: string[] = []
    if (fullPath.split('/').length === 1) {
      console.log("Stai tentando di rinominare una categoria principlale");
      console.log("Di seguito le categorie principali esistenti: ", this.cartellePrincipali);
      nodiGiaEsistenti = this.cartellePrincipali;
    }
    else {
      console.log("Stai tentando di rinominare una sottocategoria");
      console.log("Tree esistente: ", JSON.stringify(this.tree));

      const parts = fullPath.split('/').map(p => p.trim()).filter(Boolean);
      const parentPath = parts.slice(0, -1).join('/'); // es: "accessori/manici"
      const currentName = parts[parts.length - 1].toLowerCase();

      // funzione ricorsiva per trovare un nodo dato il fullPath
      const findNode = (nodes: any[], path: string): any | null => {
        for (const node of nodes) {
          if (node.fullPath.toLowerCase() === path.toLowerCase()) return node;
          if (node.child && node.child.length) {
            const found = findNode(node.child, path);
            if (found) return found;
          }
        }
        return null;
      };

      const parentNode = findNode(this.tree, parentPath);
      if (parentNode && Array.isArray(parentNode.child)) {
        nodiGiaEsistenti = parentNode.child
          .map((c: any) => c.nodoCorrente)
          .filter((n: string) => n && n.toLowerCase() !== currentName);
      }

      console.log("Fratelli allo stesso livello: ", nodiGiaEsistenti);
    }


    //agg qua 
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
      this.isLoading = true; // disattivo loading
      this.adminService.renameFolder(requestForRename, this.data.isConfig).subscribe({
        next: () => {
          this.isLoading = false; // disattivo loading
          console.log('Cartella rinominata sul cloud');
          this.mostraMessaggioSnakBar('Caterogia rinominata con successo', false);
          this.sharedDataService.notifyCacheIsChanged();
        },
        error: (err) => {
          this.isLoading = false; // disattivo loading
          this.mostraMessaggioSnakBar('Errore generico durante l\'aggiunta della categoria', true);
          console.error(err);
        }
      });
    });
  }

  onCancella(fullPath: string) {
    console.log("Nodo richiesto da eliminare ", fullPath);
    this.isLoading = true; 
    this.adminService.deleteFolder(fullPath, this.data.isConfig).subscribe({
      next: () => {
        this.isLoading = false;
        console.log('Cartella eliminata sul cloud');
        this.mostraMessaggioSnakBar('Caterogia elimintata con successo', false);
        this.sharedDataService.notifyCacheIsChanged();
      },
      error: (err) => {
        this.isLoading = false;
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


  getNodiCorrispondenteFromFullPathRicevuto(fullPath: string): NodiCorrispondentiFigliPiuFullPath | undefined {
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
        console.log("End metodo get nodi figli piu fullPath: ", endMethod)
        return endMethod;
      }

      // 4) Continua a scendere
      const children = Array.isArray(node?.child) ? node.child : [];
      if (children.length) stack.push(...children);
    }

    // 5) Non trovato
    return undefined;
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
