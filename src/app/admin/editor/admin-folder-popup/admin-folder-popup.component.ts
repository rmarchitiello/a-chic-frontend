import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
interface FlatNode {
  fullPath: string;  // es: "borse/conchiglia/perlata"
  name: string;      // ultimo segmento: "perlata"
  depth: number;     // 0 per root, 1 per figli, 2 per nipoti
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

  /** Limite massimo livelli consentiti: es. "a/b/c" => 3 */
  readonly MAX_LEVELS = 3;

  /** Elenco piatto delle cartelle normalizzato e ordinato */
  allFolders: string[] = [];

  /** Struttura piatta per la UI: ogni riga porta nome e profondità per l'indentazione */
  flatNodes: FlatNode[] = [];

  /** Percorso selezionato (serve per rinomina/cancella) */
  selectedPath: string | null = null;

  constructor(
    private dialogRef: MatDialogRef<AdminFolderPopUpComponent, string[]>,
    @Inject(MAT_DIALOG_DATA) public data: string[],  // ricevo direttamente le folder
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    console.log('[AdminFolderPopUp] input folders:', this.data);
    this.allFolders = this.normalizeFolders(this.data ?? []);
    this.rebuildFlatNodes();
  }

  // =====================================================================
  // Azioni: Aggiungi / Rinomina / Cancella
  // =====================================================================

  onAdd(): void {
    const raw = window.prompt(
      `Inserisci la nuova cartella (max ${this.MAX_LEVELS} livelli)\n` +
      `Esempi:\n- borse\n- borse/conchiglia\n- borse/conchiglia/perlata`
    );
    if (raw === null) return;

    const path = this.normalizeSingle(raw);
    if (!path) {
      this.mostraMessaggioSnakBar('Percorso non valido.', true);
      return;
    }
    const levels = path.split('/').length;
    if (levels === 0 || levels > this.MAX_LEVELS) {
      this.mostraMessaggioSnakBar(`Puoi usare da 1 a ${this.MAX_LEVELS} livelli.`, true);
      return;
    }
    if (this.exists(path)) {
      this.mostraMessaggioSnakBar('Questa cartella esiste già.', true);
      return;
    }

    this.allFolders = this.normalizeFolders([...this.allFolders, path]);
    this.rebuildFlatNodes();
    this.selectedPath = path;
    console.log('[AdminFolderPopUp] aggiunta cartella:', path);
    this.mostraMessaggioSnakBar('Cartella aggiunta.', false);
  }

  onRename(): void {
    if (!this.selectedPath) {
      this.mostraMessaggioSnakBar('Seleziona una cartella da rinominare.', true);
      return;
    }

    const current = this.selectedPath;
    const nuovo = window.prompt('Nuovo percorso completo:', current);
    if (nuovo === null) return;

    const newPath = this.normalizeSingle(nuovo);
    if (!newPath) {
      this.mostraMessaggioSnakBar('Percorso non valido.', true);
      return;
    }
    const levels = newPath.split('/').length;
    if (levels === 0 || levels > this.MAX_LEVELS) {
      this.mostraMessaggioSnakBar(`Puoi usare da 1 a ${this.MAX_LEVELS} livelli.`, true);
      return;
    }
    if (current.toLowerCase() !== newPath.toLowerCase() && this.exists(newPath)) {
      this.mostraMessaggioSnakBar('Esiste già una cartella con questo percorso.', true);
      return;
    }

    // Rinomino anche le eventuali sottocartelle
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
    this.allFolders = this.normalizeFolders(
      this.allFolders.filter((f: string) => f !== this.selectedPath && !f.startsWith(prefix))
    );
    this.rebuildFlatNodes();
    console.log('[AdminFolderPopUp] cancellata cartella:', this.selectedPath);
    this.selectedPath = null;

    this.mostraMessaggioSnakBar('Cartella cancellata.', false);
  }

  onClose(): void {
    console.log('[AdminFolderPopUp] chiusura, ritorno folders:', this.allFolders);
    this.dialogRef.close(this.allFolders);
  }

  // =====================================================================
  // Interazione UI
  // =====================================================================

  onSelectPath(path: string): void {
    this.selectedPath = path;
    console.log('[AdminFolderPopUp] selezionata cartella:', path);
  }

  // =====================================================================
  // Snackbar (tua utility)
  // =====================================================================

  mostraMessaggioSnakBar(messaggio: string, isError: boolean): void {
    let panelClassCustom: string;
    let duration: number;

    if (isError) {
      panelClassCustom = 'snackbar-errore';
      duration = 1000;
    } else {
      panelClassCustom = 'snackbar-ok';
      duration = 500;
    }

    this.snackBar.open(messaggio, 'Chiudi', {
      duration,
      panelClass: panelClassCustom,
      horizontalPosition: 'center',
      verticalPosition: 'top'
    });
  }

  // =====================================================================
  // Utility: normalizzazione, dedup, lookup, lista piatta
  // =====================================================================

  /** Normalizza una singola cartella: trim, unifica slash, rimuove slash ai bordi */
  private normalizeSingle(s: string): string {
    return (s || '')
      .trim()
      .replace(/\/+/g, '/')      // unisco slash multipli
      .replace(/^\/|\/$/g, '');  // tolgo slash iniziale/finale
  }

  /** Normalizza lista: pulizia, dedup case-insensitive, ordinamento */
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

    out.sort((a: string, b: string) => a.localeCompare(b, 'it', { sensitivity: 'base' }));
    return out;
  }

  /** Verifica se esiste già la cartella (case-insensitive) */
  private exists(path: string): boolean {
    const target = path.toLowerCase();
    return this.allFolders.some((f: string) => f.toLowerCase() === target);
  }

  /** Ricostruisce la lista piatta con nome e profondità per l'indentazione */
  private rebuildFlatNodes(): void {
    this.flatNodes = (this.allFolders || []).map((full: string) => {
      const parts = full.split('/').filter(Boolean);
      const name = parts[parts.length - 1] ?? full;
      const depth = Math.max(0, parts.length - 1);
      return { fullPath: full, name, depth };
    });
  }

  chiudiDialog(){
    this.dialogRef.close()
  }
}
