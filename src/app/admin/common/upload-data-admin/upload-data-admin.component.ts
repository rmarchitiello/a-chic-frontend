/**
 * Questo componente Angular consente l'upload di file multimediali (immagini, audio, video)
 * tramite drag and drop o selezione manuale, in modalità popup.
 * La cartella di destinazione viene fornita dal componente padre.
 * I metadati dei file sono gestiti e personalizzabili prima dell'invio.
 */

import { Component, OnInit, OnDestroy, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { AdminService } from '../../../services/admin.service';
import { MatIcon } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialogModule } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MediaContext } from '../../../pages/home/home.component';
import { MatDialog } from '@angular/material/dialog';
import { FormsModule } from '@angular/forms';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { EditDataAdminComponent } from '../edit-data-admin/edit-data-admin.component';
@Component({
  selector: 'app-upload-data-admin',
  standalone: true,
  imports: [
    MatIcon,
    CommonModule,
    MatProgressSpinnerModule,
    MatDialogModule,
    MatTooltipModule,
    FormsModule,
    MatCheckboxModule
  ],
  templateUrl: './upload-data-admin.component.html',
  styleUrl: './upload-data-admin.component.scss'
})
export class UploadDataAdminComponent implements OnInit, OnDestroy {

  constructor(
    private adminService: AdminService,
    private dialog: MatDialog,
    private dialogRef: MatDialogRef<UploadDataAdminComponent>,
    @Inject(MAT_DIALOG_DATA) public folder: string // La cartella viene fornita dal padre
  ) { }

  isHovering = false; // Evidenzia drop-zone
  filesDaCaricare: File[] = []; // Lista dei file selezionati
  anteprimeFile: Map<File, string> = new Map(); // Anteprima dei file

  //creo una mappa per settare i metadati per quel file
  metadatiPerFile: Map<File, MediaContext> = new Map(); // Metadati per file

  statoUpload: Map<File, 'ok' | 'ko'> = new Map(); // Stato di ogni file caricato
  motiviErroreUpload = new Map<File, string>(); // Motivi errore
  uploadInCorso: boolean = false; // Flag di caricamento



fileSelezionatoComeFrontale: File | null = null;
  
/**
 * Metodo per selezionare un file come "frontale"
 * - Se viene deselezionato, rimuove il flag e cancella "angolazione" dai metadati
 * - Se viene selezionato un nuovo file, trasferisce i metadati dal vecchio
 * - Mantiene un solo file frontale alla volta
 */
private ultimoFileFrontaleSelezionato: File | null = null;

selezionaFrontale(file: File, isChecked: boolean): void {
const nuovoFile = file;

  if (!isChecked) {
    // ❌ Deseleziono il frontale, ma conservo i metadati
    const metadati = this.metadatiPerFile.get(file);
    if (metadati) {
      this.metadatiPerFile.set(file, {
        ...metadati,
        angolazione: 'altra' // ✅ Cambio solo l'angolazione
      });
    }
    this.fileSelezionatoComeFrontale = null;
    // Non azzero ultimoFileFrontaleSelezionato perché potrei riselezionare lo stesso file
    console.log('❌ Frontale deselezionato (ma metadati conservati):', file.name);
    return;
  }

  const vecchioFile = this.ultimoFileFrontaleSelezionato;

  console.log('File selezionato:', nuovoFile);
  console.log('Ultimo frontale selezionato:', vecchioFile);

  let metadatiDaTrasferire: MediaContext | undefined;

  // Se esiste un precedente frontale diverso dal nuovo, salvo e rimuovo i suoi metadati
  if (vecchioFile) {
    console.log("Vecchio file")
    const metadatiVecchio = this.metadatiPerFile.get(vecchioFile);
    console.log("Vecchi metadati", metadatiVecchio);
    if (metadatiVecchio) {
      metadatiDaTrasferire = { ...metadatiVecchio };
    }
    this.metadatiPerFile.delete(vecchioFile);
  }

  // Recupero eventuali metadati già associati al nuovo file (potrebbero essere incompleti)
  const metadatiEsistenti = this.metadatiPerFile.get(nuovoFile);

  let metadatiFinali: MediaContext;

  if (metadatiDaTrasferire) {
    // Uso i metadati del precedente frontale
    metadatiFinali = {
      ...metadatiDaTrasferire,
      angolazione: 'frontale'
    };
    console.log('Metadati trasferiti dal vecchio frontale:', metadatiFinali);
  } else if (metadatiEsistenti) {
    // Uso quelli già presenti sul nuovo file
    metadatiFinali = {
      ...metadatiEsistenti,
      angolazione: 'frontale'
    };
    console.log('Metadati esistenti aggiornati:', metadatiFinali);
  } else {
    // Nessun metadato disponibile, uso valori base
    metadatiFinali = {
      display_name: nuovoFile.name.split('.')[0],
      angolazione: 'frontale',
      descrizione: 'Da inserire',
      quantita: '0'
    };
    console.log('Metadati creati da zero:', metadatiFinali);
  }

  // Applico i metadati al nuovo frontale selezionato
  this.metadatiPerFile.set(nuovoFile, metadatiFinali);

  // Imposto angolazione 'altra' a tutti gli altri file
  this.metadatiPerFile.forEach((metadati, f) => {
    if (f !== nuovoFile) {
      this.metadatiPerFile.set(f, {
        ...metadati,
        angolazione: 'altra'
      });
    }
  });

  // Aggiorno gli stati interni
  this.fileSelezionatoComeFrontale = nuovoFile;
  this.ultimoFileFrontaleSelezionato = nuovoFile;

  console.log('Nuovo frontale impostato:', nuovoFile.name);
  console.log('Stato metadati finale:', this.metadatiPerFile);
}




/**
 * Metodo per aprire un popup e modificare i metadati di un file selezionato.
 * In input passa il file, così da leggere o creare i metadati associati.
 */
apriPopUpEditFile(file: File): void {
  // Recupera i metadati già salvati per il file, oppure usa un oggetto vuoto
  const metadataEsistenti = this.metadatiPerFile.get(file) || {};
  console.log("Metadati esistenti per il file selezionato:", metadataEsistenti);

  // Clona i metadati per evitare modifiche dirette se l'utente annulla
  const metadataClonati: MediaContext = { ...metadataEsistenti };

  // Apre il popup passando il file e i metadati correnti
  const dialogRef = this.dialog.open(EditDataAdminComponent, {
    width: '720px',
    maxHeight: '90vh',
    panelClass: 'popup-metadati-dialog',
    data: {
      file,
      context: metadataClonati
    }
  });

  // Quando il popup viene chiuso
  dialogRef.afterClosed().subscribe((result) => {
    if (result) {
      // Se è il file frontale, imposta sempre angolazione = frontale
      if (this.fileSelezionatoComeFrontale === file) {
        result.angolazione = 'frontale';
      }

      // Aggiorna la mappa dei metadati
      this.metadatiPerFile.set(file, result);
      console.log("Metadati aggiornati per", file.name, ":", result);
    }
  });
}




  ngOnInit(): void {
    //non fa uploadre cose all esterno del drop
    window.addEventListener('dragover', this.preventBrowserDefault, false);
    window.addEventListener('drop', this.preventBrowserDefault, false);
  }

  //non fa uploadre cose all esterno del drop
  ngOnDestroy(): void {
    window.removeEventListener('dragover', this.preventBrowserDefault, false);
    window.removeEventListener('drop', this.preventBrowserDefault, false);
  }
  //non fa uploadre cose all esterno del drop

  preventBrowserDefault(event: Event): void {
    event.preventDefault();
  }


  onDragOver(event: DragEvent): void {
    event.preventDefault();
    this.isHovering = true;
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    this.isHovering = false;
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    this.isHovering = false;
    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      this.aggiungiFiles(Array.from(files));
    }
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const files = input.files;
    if (files && files.length > 0) {
      this.aggiungiFiles(Array.from(files));
    }
    input.value = '';
  }

  
  aggiungiFiles(files: File[]): void {
    files.forEach(file => {
      const giaPresente = this.filesDaCaricare.some(
        f => f.name === file.name && f.size === file.size
      );
      if (!giaPresente) {
        this.filesDaCaricare.push(file);

        const tipoGenerico = file.type.split('/')[0];
        if (["image", "video", "audio"].includes(tipoGenerico)) {
          const previewUrl = URL.createObjectURL(file);
          this.anteprimeFile.set(file, previewUrl);
        }


        console.log("Tutti i files da aggiungere: ", this.filesDaCaricare);
      }
    });
  }








rimuoviFile(file: File): void {
  // Rimuovo dalla lista dei file
  this.filesDaCaricare = this.filesDaCaricare.filter(f => f !== file);

  // Rimuovo anteprima e metadati
  this.anteprimeFile.delete(file);
  this.metadatiPerFile.delete(file);

  // Se il file rimosso era quello selezionato come frontale, lo azzero
  if (this.fileSelezionatoComeFrontale === file) {
    this.fileSelezionatoComeFrontale = null;
  }
}


  rimuoviTuttiIFiles(): void {
    this.filesDaCaricare = [];
    this.anteprimeFile.clear();
    this.metadatiPerFile.clear();
  }

  chiudiDialog(reload: boolean): void {
    this.dialogRef.close();
    setTimeout(() => {
      if (reload) window.location.reload();
    }, 400);
  }

  /**
 * Avvia l'upload dei file (singolo o multiplo)
 */
  uploadFiles(fileInput?: File): void {
    if (this.filesDaCaricare.length === 0) {
      alert("Errore: seleziona almeno un file da caricare.");
      return;
    }

    const filesDaCaricare = fileInput
      ? this.filesDaCaricare.filter(f => f === fileInput)
      : this.filesDaCaricare;

    const folder = this.folder?.trim();
    if (!folder) {
      alert("Errore: specifica una cartella di destinazione.");
      return;
    }

    const livelli = folder.split('/').filter(p => p.trim() !== '');
    if (livelli.length > 3) {
      alert('Errore: massimo 3 livelli di cartella consentiti.');
      return;
    }

    this.uploadInCorso = true;
    this.statoUpload.clear();
    this.motiviErroreUpload.clear();

    const formData = new FormData();
    const metadataList: MediaContext[] = [];

    filesDaCaricare.forEach(file => {
      formData.append('file', file);
      const context = this.metadatiPerFile.get(file);
      if (context) metadataList.push(context);
    });

    metadataList.forEach(metadata => {
      formData.append('cloudinary', JSON.stringify(metadata));
    });

    const isConfig = folder.toLowerCase().includes('config');

    this.adminService.uploadMedia(formData, isConfig).subscribe({
      next: (res) => {
        if (Array.isArray(res.data)) {
          res.data.forEach((uploadResult: { nome_file: string; status: 'ok' | 'ko'; reason?: string }) => {
            const fileMatch = filesDaCaricare.find(f => f.name.split('.')[0] === uploadResult.nome_file);
            if (fileMatch) {
              this.statoUpload.set(fileMatch, uploadResult.status);

              if (uploadResult.status === 'ko') {
                this.motiviErroreUpload.set(fileMatch, uploadResult.reason || 'Errore sconosciuto');
              } else {
                setTimeout(() => {
                  this.statoUpload.delete(fileMatch);
                  this.filesDaCaricare = this.filesDaCaricare.filter(f => f !== fileMatch);
                  if (this.filesDaCaricare.length === 0) {
                    setTimeout(() => window.location.reload(), 800);
                  }
                }, 2000);
              }
            }
          });
        }
        this.uploadInCorso = false;
      },
      error: (err) => {
        console.error("Errore durante upload:", err);
        this.filesDaCaricare.forEach(file => {
          this.statoUpload.set(file, 'ko');
          this.motiviErroreUpload.set(file, 'Errore generico durante l' + "'upload");
        });
        this.uploadInCorso = false;
      }
    });
  }


  formatKeyLabel(key: string): string {
    return key.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, char => char.toUpperCase());
  }

}