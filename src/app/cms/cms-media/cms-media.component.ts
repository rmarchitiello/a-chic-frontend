import { Component, OnInit } from '@angular/core';
import { CmsService } from '../../services/cms.service';
import { NestedTreeControl } from '@angular/cdk/tree';
import { MatTreeNestedDataSource } from '@angular/material/tree';
import { CommonModule } from '@angular/common';
import { MatTreeModule } from '@angular/material/tree';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { BreakpointObserver } from '@angular/cdk/layout';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

// Ogni nodo rappresenta una cartella o sottocartella
interface TreeNode {
  name: string;
  fullPath: string; // aggiunto
  children?: TreeNode[];
}


@Component({
  selector: 'app-cms-media',
  standalone: true,
  templateUrl: './cms-media.component.html',
  styleUrl: './cms-media.component.scss',
  imports: [
    CommonModule,
    MatTreeModule,
    MatIconModule,
    MatButtonModule,
    MatProgressSpinnerModule
  ]
})
export class CmsMediaComponent implements OnInit {

  // Controllo ad albero nidificato
  treeControl = new NestedTreeControl<TreeNode>(node => node.children);

  // Sorgente dati per il mat-tree
  dataSource = new MatTreeNestedDataSource<TreeNode>();

  // Rileva se il dispositivo è mobile
  isMobile: boolean = false;

  // Stato di caricamento iniziale
  loading: boolean = true;

  // Nodo attualmente selezionato nell’albero
  nodoSelezionato: TreeNode | null = null;

  constructor(
    private cmsService: CmsService,
    private breakpointObserver: BreakpointObserver
  ) {}

  ngOnInit(): void {
  // Osserva la larghezza dello schermo
  this.breakpointObserver
    .observe(['(max-width: 768px)'])
    .subscribe(result => {
      this.isMobile = result.matches;
      this.loading = false;

      if (!this.isMobile) {
        this.loadFolders(); // carica cartelle
      }
    });
}


  //metodo per caricare le cartelle dalla cash:
loadFolders(): void {
  this.loading = true;

  this.cmsService.getFolders().subscribe({
    next: (foldersJson) => {
      const treeData = this.convertToFullTree(foldersJson);
      this.dataSource.data = treeData;
      this.loading = false;
    },
    error: (err) => {
      console.error("Errore nel recupero delle cartelle:", err);
      this.loading = false;
    }
  });
}



  /**
 * Converte la struttura JSON in un array di nodi per mat-tree.
 * Ogni nodo contiene:
 * - name: il nome della cartella
 * - children: eventuali sottocartelle (anche vuote se è un array)
 * - fullPath: il percorso completo utile per operazioni come la cancellazione
 *
 * @param obj Oggetto JSON delle cartelle ricevuto da Cloudinary
 * @param currentPath Percorso parziale accumulato (inizia come stringa vuota)
 * @returns Array di nodi TreeNode con struttura ricorsiva
 */
convertToFullTree(obj: any, currentPath: string = ''): TreeNode[] {

  return Object.entries(obj).map(([key, value]) => {
    const fullPath = currentPath ? `${currentPath}/${key}` : key;

    let children: TreeNode[] = [];

    // Se il valore è un oggetto, costruisce ricorsivamente i figli
    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      children = this.convertToFullTree(value, fullPath);
    }

    // Se è un array, significa che è una foglia (senza sottocartelle)
    if (Array.isArray(value)) {
      children = []; // serve per rendere espandibile anche se vuota
    }

    // Log del nodo completo

    return {
      name: key,
      fullPath: fullPath,
      children: children
    };
  });
}


  /**
   * Metodo richiamato al click su un nodo dell’albero.
   * Salva il nodo selezionato per visualizzarne i contenuti.
   */
  onNodeClick(node: TreeNode): void {
    this.nodoSelezionato = node;
    console.log('Nodo selezionato:', node);
  }

  refreshFolders(): void {
  this.loading = true;
  console.log("chiamo la refresh");
  this.cmsService.getFolders(true).subscribe({
    next: (foldersJson) => {
      const treeData = this.convertToFullTree(foldersJson);
      this.dataSource.data = treeData;
      this.loading = false;
    },
    error: (err) => {
      console.error("Errore nel recupero delle cartelle:", err);
      this.loading = false;
    }
  });
}


  /**
   * Funzione utilizzata dal mat-tree per sapere se un nodo ha figli.
   * Anche i nodi con array vuoti sono considerati espandibili.
   */
hasChild = (_: number, node: TreeNode): boolean =>
  Array.isArray(node.children); // anche se children è vuoto

//metodo per aggiungere una nuova cartella
categoriaFolder(node: any, nomeFolderDaCreare: string){

    const folderSorgente = node;
    const nomeFolder = nomeFolderDaCreare;
    const nuovoPercorso = `${folderSorgente.fullPath}/${nomeFolder}`;
    console.log("Folder dove si vuole creare la cartella" , folderSorgente);
    console.log("Folder da creare" , nomeFolder);
    console.log("Nuovo percorso da creare" , nuovoPercorso);


}

deleteFolder(node: any) {
  // Recupera il percorso completo della cartella da cancellare (es. 'lol/aaa')
  const folderDaCancellare = node;
  console.log("Cartella da cancellare:", folderDaCancellare);

  //chiedo all utente se vuole cancellare la cartella
    const confermato = window.confirm(`Sei sicuro di voler eliminare la cartella "${folderDaCancellare}"?`);

      // Se l'utente annulla, interrompi l'operazione
  if (!confermato) {
    console.log("Eliminazione annullata dall'utente");
    return;
  }


  // Effettua la chiamata DELETE al servizio CMS
  this.cmsService.deleteFolder(folderDaCancellare).subscribe({
    next: (result) => {
      // Stampa conferma in console
      console.log("Risposta della cancellazione: ", result);

      // Dopo la cancellazione, ricarica l'albero delle cartelle
      this.loadFolders();
    },
    error: (err) => {
      // Stampa l'errore dettagliato in console
      console.error("Errore nella cancellazione della folder:", err.error);

      // Se l'errore indica che la cartella non è vuota, avvisa l'utente
      if (err.error.error.includes("Folder is not empty")) {
        alert("Impossibile eliminare la cartella: contiene ancora file o sottocartelle.");
      } else {
        // Qualsiasi altro errore generico
        alert("Errore imprevisto durante la cancellazione.");
      }
    }
  });
}





}
