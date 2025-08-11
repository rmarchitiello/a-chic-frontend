import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';

/** Riga piatta per la UI: nome, path completo e profondità (per il padding). */
interface FlatNode {
  fullPath: string;  // es. "borse/conchiglia/perlata"
  name: string;      // ultimo segmento: "perlata"
  depth: number;     // 0=radice, 1=figlio, 2=nipote
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
    MatTooltipModule
  ],
  templateUrl: './admin-folder-popup.component.html',
  styleUrls: ['./admin-folder-popup.component.scss']
})
export class AdminFolderPopUpComponent implements OnInit {

  /** Max livelli consentiti (es. "a/b/c" = 3). */
  readonly MAX_LEVELS = 3;

  /** Elenco cartelle normalizzato (arriva dal chiamante). */
  allFolders: string[] = [];

  /** Lista piatta ordinata per path completo (padre → figli). */
  flatNodes: FlatNode[] = [];

  /** Cartella selezionata. */
  selectedPath: string | null = null;

  constructor(
    private dialogRef: MatDialogRef<AdminFolderPopUpComponent, string[]>,
    @Inject(MAT_DIALOG_DATA) public data: string[],
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    console.log('[AdminFolderPopUp] input folders:', this.data);
    this.allFolders = this.normalizeFolders(this.data ?? []);
    this.rebuildFlatNodes();
  }

  // ───────────────────────────────────
  // Azioni (Aggiungi / Rinomina / Cancella)
  // ───────────────────────────────────

  onAdd(): void {
    const raw = window.prompt(
      `Inserisci la nuova cartella (max ${this.MAX_LEVELS} livelli)\n` +
      `Esempi:\n- borse\n- borse/conchiglia\n- borse/conchiglia/perlata`
    );
    if (raw === null) return;

    const path = this.normalizeSingle(raw);
    if (!path) return this.snack('Percorso non valido.', true);

    const levels = path.split('/').length;
    if (levels === 0 || levels > this.MAX_LEVELS) {
      return this.snack(`Puoi usare da 1 a ${this.MAX_LEVELS} livelli.`, true);
    }
    if (this.exists(path)) {
      return this.snack('Questa cartella esiste già.', true);
    }

    this.allFolders = this.normalizeFolders([...this.allFolders, path]);
    this.rebuildFlatNodes();
    this.selectedPath = path;

    console.log('[AdminFolderPopUp] aggiunta cartella:', path);
    this.snack('Cartella aggiunta.', false);
  }

  onRename(): void {
    if (!this.selectedPath) return this.snack('Seleziona una cartella da rinominare.', true);

    const current = this.selectedPath;
    const nuovo = window.prompt('Nuovo percorso completo:', current);
    if (nuovo === null) return;

    const newPath = this.normalizeSingle(nuovo);
    if (!newPath) return this.snack('Percorso non valido.', true);

    const levels = newPath.split('/').length;
    if (levels === 0 || levels > this.MAX_LEVELS) {
      return this.snack(`Puoi usare da 1 a ${this.MAX_LEVELS} livelli.`, true);
    }
    if (current.toLowerCase() !== newPath.toLowerCase() && this.exists(newPath)) {
      return this.snack('Esiste già una cartella con questo percorso.', true);
    }

    // Rinomino anche le sottocartelle con quel prefisso.
    const prefix = current + '/';
    const updated = this.allFolders.map((f: string) => {
      if (f === current) return newPath;
      if (f.startsWith(prefix)) return newPath + f.substring(prefix.length);
      return f;
    });

    this.allFolders = this.normalizeFolders(updated);
    this.rebuildFlatNodes();
    this.selectedPath = newPath;

    console.log('[AdminFolderPopUp] rinominata cartella:', current, '->', newPath);
    this.snack('Cartella rinominata.', false);
  }

  onDelete(): void {
    if (!this.selectedPath) return this.snack('Seleziona una cartella da cancellare.', true);

    const conferma = window.confirm(
      `Vuoi cancellare la cartella:\n${this.selectedPath}\n` +
      `e tutte le sue sottocartelle?`
    );
    if (!conferma) return;

    const prefix = this.selectedPath + '/';
    this.allFolders = this.normalizeFolders(
      this.allFolders.filter((f: string) => f !== this.selectedPath && !f.startsWith(prefix))
    );

    this.rebuildFlatNodes();
    console.log('[AdminFolderPopUp] cancellata cartella:', this.selectedPath);
    this.selectedPath = null;

    this.snack('Cartella cancellata.', false);
  }

  chiudiDialog(): void {
    console.log('[AdminFolderPopUp] chiusura (return folders):', this.allFolders);
    this.dialogRef.close(this.allFolders);
  }

  // ───────────────────────────────────
  // Interazione UI
  // ───────────────────────────────────

  onSelectPath(path: string): void {
    this.selectedPath = path;
    console.log('[AdminFolderPopUp] selezionata cartella:', path);
  }

  // ───────────────────────────────────
  // Snackbar helper
  // ───────────────────────────────────

  private snack(msg: string, isError: boolean): void {
    this.snackBar.open(msg, 'Chiudi', {
      duration: isError ? 1200 : 700,
      panelClass: isError ? 'snackbar-errore' : 'snackbar-ok',
      horizontalPosition: 'center',
      verticalPosition: 'top'
    });
  }

  // ───────────────────────────────────
  // Utility
  // ───────────────────────────────────

  /** Normalizza una voce: trim, unifica slash, rimuove slash ai bordi. */
  private normalizeSingle(s: string): string {
    return (s || '')
      .trim()
      .replace(/\/+/g, '/')
      .replace(/^\/|\/$/g, '');
  }

  /** Pulisce, deduplica (case-insensitive) e ordina le cartelle. */
  private normalizeFolders(folders: string[]): string[] {
    const seen = new Set<string>();
    const out: string[] = [];

    for (const raw of folders || []) {
      const n = this.normalizeSingle(raw);
      if (!n) continue;

      const key = n.toLowerCase();
      if (seen.has(key)) continue;
      seen.add(key);

      out.push(n);
    }

    // Ordino alfabeticamente per path completo (così i figli seguono il padre).
    out.sort((a, b) => a.localeCompare(b, 'it', { sensitivity: 'base' }));
    return out;
  }

  /** Controlla se la cartella esiste già (case-insensitive). */
  private exists(path: string): boolean {
    const target = path.toLowerCase();
    return this.allFolders.some(f => f.toLowerCase() === target);
  }

  /**
   * Costruisce la lista piatta **includendo i nodi intermedi**:
   * es. da "borse/conchiglia/perlata" creo anche "borse" e "borse/conchiglia".
   * Ordino infine per path completo per ottenere la sequenza padre → figli.
   */
  private rebuildFlatNodes(): void {
    const map = new Map<string, FlatNode>();

    // 1) Genero tutti i prefissi per ogni path (roots e intermedi inclusi).
    for (const raw of this.allFolders) {
      const parts = raw.split('/').filter(Boolean);         // ["borse","conchiglia","perlata"]
      let acc = '';
      parts.forEach((part, idx) => {
        acc = acc ? `${acc}/${part}` : part;               // "borse" → "borse/conchiglia" → ...
        if (!map.has(acc)) {
          map.set(acc, { fullPath: acc, name: part, depth: idx });
        }
      });
    }

    // 2) Converto in array e **ordino per fullPath** (non per depth),
    //    in modo che la gerarchia compaia naturale:
    //    accessori, accessori/charm, accessori/charm/completi, ...
    this.flatNodes = Array.from(map.values()).sort((a, b) =>
      a.fullPath.localeCompare(b.fullPath, 'it', { sensitivity: 'base' })
    );

    console.log('[AdminFolderPopUp] flatNodes:', this.flatNodes);
  }
}
