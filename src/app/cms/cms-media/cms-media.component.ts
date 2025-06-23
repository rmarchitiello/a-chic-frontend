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
    // Osserva la larghezza dello schermo per abilitare/disabilitare la UI CMS su mobile
    this.breakpointObserver
      .observe(['(max-width: 768px)'])
      .subscribe(result => {
        this.isMobile = result.matches;
        this.loading = false;

        if (!this.isMobile) {
          this.loading = true;

          // Recupera la struttura ad albero delle cartelle dal backend
          this.cmsService.getFolders().subscribe({
            next: (foldersJson) => {
              console.log("Folders JSON ricevuto:", foldersJson);
              const treeData = this.convertToFullTree(foldersJson);
              console.log("TreeData generato:", JSON.stringify(treeData));
              this.dataSource.data = treeData;
              this.loading = false;
            },
            error: (err) => {
              console.error("Errore nel recupero delle cartelle:", err);
              this.loading = false;
            }
          });
        }
      });
  }

  /**
   * Converte OGNI livello della struttura JSON in un array di nodi,
   * mantenendo anche i figli vuoti come array per rendere visibile il toggle.
   */
convertToFullTree(obj: any): TreeNode[] {
  return Object.entries(obj).map(([key, value]) => {
    let children: TreeNode[] = [];

    // Se il valore è un oggetto, ricorsivamente costruiamo i figli
    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      children = this.convertToFullTree(value);
    }

    // Se è array (di contenuti finali, non cartelle), aggiungiamo children vuoti
    if (Array.isArray(value)) {
      children = []; // Rende il nodo espandibile ma senza figli
    }

    return {
      name: key,
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

  /**
   * Funzione utilizzata dal mat-tree per sapere se un nodo ha figli.
   * Anche i nodi con array vuoti sono considerati espandibili.
   */
hasChild = (_: number, node: TreeNode): boolean =>
  Array.isArray(node.children); // anche se children è vuoto

}
