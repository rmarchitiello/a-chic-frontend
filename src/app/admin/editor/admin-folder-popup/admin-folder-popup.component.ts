import { Component, OnInit, OnDestroy, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

interface AdminFolderDialogData {
  allFolders: string[];
  maxLevels?: number; // default 3
}

interface FolderNode {
  name: string;
  fullPath: string;
  children: FolderNode[];
}

@Component({
  selector: 'app-admin-folder-popup',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatIconModule,
    MatListModule,
    MatDialogModule,
    MatSnackBarModule
  ],
  templateUrl: './admin-folder-popup.component.html',
  styleUrls: ['./admin-folder-popup.component.scss']
})
export class AdminFolderPopUpComponent implements OnInit, OnDestroy {

  allFolders: string[] = [];
  tree: FolderNode[] = [];
  selectedPath: string | null = null;

  maxLevels = 3;

  constructor(
    private dialogRef: MatDialogRef<AdminFolderPopUpComponent, { folders: string[] }>,
    @Inject(MAT_DIALOG_DATA) public data: AdminFolderDialogData,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.maxLevels = Number(this.data?.maxLevels ?? 3);
    this.allFolders = this.normalizeFolders(this.data?.allFolders ?? []);
    this.rebuildTree();
  }

  ngOnDestroy(): void {}

  /** Snackbar centralizzata: uso classi diverse per errore / ok */
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

  private normalizeFolders(paths: string[]): string[] {
    const clean = paths
      .map((p: string) => (p ?? '').trim().replace(/\/+/g, '/').replace(/^\/|\/$/g, ''))
      .filter((p: string) => !!p);

    const unique = Array.from(new Set(clean));
    unique.sort((a, b) => a.localeCompare(b));
    return unique;
  }

  private rebuildTree(): void {
    this.tree = this.buildFolderTree(this.allFolders);
  }

  private buildFolderTree(paths: string[]): FolderNode[] {
    const root: FolderNode[] = [];
    const index = new Map<string, FolderNode>();

    for (const full of paths) {
      const segments: string[] = full.split('/').filter(Boolean);
      let acc = '';
      let parentChildren = root;

      for (const seg of segments) {
        acc = acc ? `${acc}/${seg}` : seg;

        let node = index.get(acc);
        if (!node) {
          node = { name: seg, fullPath: acc, children: [] };
          index.set(acc, node);
          parentChildren.push(node);
          parentChildren.sort((a, b) => a.name.localeCompare(b.name));
        }
        parentChildren = node.children;
      }
    }
    return root;
  }

  onSelectNode(node: FolderNode): void {
    this.selectedPath = node.fullPath;
  }

  onSelectFlat(path: string): void {
    this.selectedPath = path;
  }

  onAdd(): void {
    const raw = window.prompt(
      `Inserisci la nuova cartella (max ${this.maxLevels} livelli)\n` +
      `Es: borse\nborse/conchiglia\nborse/conchiglia/perlata`
    );
    if (raw === null) return;

    const path = this.normalizeSingle(raw);
    if (!path) {
      this.mostraMessaggioSnakBar('Percorso non valido.', true);
      return;
    }

    const levels = path.split('/').length;
    if (levels === 0 || levels > this.maxLevels) {
      this.mostraMessaggioSnakBar(`Puoi creare da 1 a ${this.maxLevels} livelli.`, true);
      return;
    }

    if (this.allFolders.some(f => f.toLowerCase() === path.toLowerCase())) {
      this.mostraMessaggioSnakBar('Questa cartella esiste già.', true);
      return;
    }

    this.allFolders.push(path);
    this.allFolders = this.normalizeFolders(this.allFolders);
    this.rebuildTree();
    this.selectedPath = path;

    this.mostraMessaggioSnakBar('Cartella aggiunta.', false);
  }

  onRename(): void {
    if (!this.selectedPath) {
      this.mostraMessaggioSnakBar('Seleziona una cartella da rinominare.', true);
      return;
    }

    const current = this.selectedPath;
    const nuovo = window.prompt(
      `Nuovo nome percorso completo per:\n${current}`,
      current
    );
    if (nuovo === null) return;

    const newPath = this.normalizeSingle(nuovo);
    if (!newPath) {
      this.mostraMessaggioSnakBar('Percorso non valido.', true);
      return;
    }

    const levels = newPath.split('/').length;
    if (levels === 0 || levels > this.maxLevels) {
      this.mostraMessaggioSnakBar(`Puoi usare da 1 a ${this.maxLevels} livelli.`, true);
      return;
    }

    if (current.toLowerCase() !== newPath.toLowerCase() &&
        this.allFolders.some(f => f.toLowerCase() === newPath.toLowerCase())) {
      this.mostraMessaggioSnakBar('Esiste già una cartella con questo percorso.', true);
      return;
    }

    const prefix = current + '/';
    const updated: string[] = this.allFolders.map(f => {
      if (f === current) return newPath;
      if (f.startsWith(prefix)) {
        return newPath + f.substring(prefix.length);
      }
      return f;
    });

    this.allFolders = this.normalizeFolders(updated);
    this.rebuildTree();
    this.selectedPath = newPath;

    this.mostraMessaggioSnakBar('Cartella rinominata.', false);
  }

  onDelete(): void {
    if (!this.selectedPath) {
      this.mostraMessaggioSnakBar('Seleziona una cartella da cancellare.', true);
      return;
    }

    const conferma = window.confirm(
      `Vuoi cancellare la cartella:\n${this.selectedPath}\n` +
      `e tutte le sue sottocartelle?`
    );
    if (!conferma) return;

    const prefix = this.selectedPath + '/';
    const filtered = this.allFolders.filter(f => f !== this.selectedPath && !f.startsWith(prefix));

    this.allFolders = this.normalizeFolders(filtered);
    this.rebuildTree();
    this.selectedPath = null;

    this.mostraMessaggioSnakBar('Cartella cancellata.', false);
  }

  onClose(): void {
    this.dialogRef.close({ folders: this.allFolders });
  }

  private normalizeSingle(input: string): string {
    return (input ?? '')
      .trim()
      .replace(/\/+/g, '/')
      .replace(/^\/|\/$/g, '');
  }
}
