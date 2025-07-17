// questa classe esegue l'upload di un documento immagine audio o video da pop up nella console quando siamo in modalita admin
/* come meccanismo di upload, uso drag and drop o anche l'upload semplice singolo. Ovvero, fare in modo di caricare piu 
file contemporaneamente, devo poi modificare il backend in modo che puo ricevere una lista di file

Come funziona drag and drop

dragover =  Succede quando il file è sopra l’area di drop. Devi impedire il 
            comportamento di default del browser (es. apertura file) e puoi aggiungere uno stile visivo.
            Difatti il browser che fa se trascino una foto nel browser lui me la apre

dragleave = L’utente ha spostato il file fuori dall’area (serve a rimuovere effetti visivi di hover).

drop = L’utente ha rilasciato il file. Qui si accede a event.dataTransfer.files per leggere i file e processarli. ci sono i file o il file da caricare
*/

import { Component, OnInit, OnDestroy, Inject  } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { CmsService } from '../../../services/cms.service';
import { MatIcon } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { CloudinaryDataUpload } from '../../../cms/cms-upload/cms-upload.component'; //interfaccia per poter chiamare l'upload di cmsservice per uploadare un file
@Component({
  selector: 'app-upload-data-admin',
  standalone: true,
  imports: [MatIcon,CommonModule],
  templateUrl: './upload-data-admin.component.html',
  styleUrl: './upload-data-admin.component.scss'
})
export class UploadDataAdminComponent implements OnInit, OnDestroy {

  constructor(
    private cmsService: CmsService,
    private dialogRef: MatDialogRef<UploadDataAdminComponent>,
    @Inject(MAT_DIALOG_DATA) public prepareDataUpload: CloudinaryDataUpload //LA FOLDER VIENE PASSATA DAL PADRE
  ) {}

  // Variabile booleana per attivare lo stile visivo quando un file è sopra l’area di drop
  isHovering = false;

  // Lista dei file selezionati o droppati, pronti per essere caricati
  filesDaCaricare: File[] = [];
  anteprimeFile: Map<File, string> = new Map(); // Mappa File → URL blob

  ngOnInit(): void {
    // Intercetta eventi drag and drop globali per impedire che il browser apra il file
    // se rilasciato fuori dalla drop zone (es. accidentalmente sul body o finestra)
    window.addEventListener('dragover', this.preventBrowserDefault, false);
    window.addEventListener('drop', this.preventBrowserDefault, false);
  }

aggiungiFiles(files: File[]) {
  files.forEach(file => {
    const giaPresente = this.filesDaCaricare.some(
      f => f.name === file.name && f.size === file.size
    );

    if (!giaPresente) {
      this.filesDaCaricare.push(file);

      const tipoGenerico = file.type.split('/')[0]; // image, video, audio, application...

      // Se è image, video o audio  creo un URL per preview
      if (['image', 'video', 'audio'].includes(tipoGenerico)) {
        const previewUrl = URL.createObjectURL(file);
        this.anteprimeFile.set(file, previewUrl);
      }
    }
  });
}


rimuoviFile(file: File): void {
  // Rimuove dalla lista file
  this.filesDaCaricare = this.filesDaCaricare.filter(f => f !== file);

  // Rimuove anche l’anteprima se presente
  this.anteprimeFile.delete(file);
}


rimuoviTuttiIFiles(): void {
  // Svuota l'elenco dei file da caricare
  this.filesDaCaricare = [];

  // Svuota tutte le anteprime
  this.anteprimeFile.clear();
}



  ngOnDestroy(): void {
    // Rimuove gli event listener globali quando il componente viene distrutto
    window.removeEventListener('dragover', this.preventBrowserDefault, false);
    window.removeEventListener('drop', this.preventBrowserDefault, false);
  }

  /**
   * Previene il comportamento predefinito del browser su eventi drag/drop
   * globali (come apertura del file se rilasciato fuori dalla drop-area)
   */
  preventBrowserDefault(event: Event): void {
    event.preventDefault();
  }

  /**
   * Evento scatenato quando un file viene trascinato sopra l’area di drop
   * Impedisce il comportamento di default del browser (apertura immagine)
   * e attiva la classe CSS .hover-active per cambiare stile visivo
   */
  onDragOver(event: DragEvent): void {
    event.preventDefault();
    this.isHovering = true;
  }

  /**
   * Evento scatenato quando il file esce dall’area di drop senza essere rilasciato
   * Serve a rimuovere lo stile di hover
   */
  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    this.isHovering = false;
  }

  /**
   * Evento scatenato quando uno o più file vengono rilasciati nell’area di drop
   * Recupera i file da event.dataTransfer.files e li gestisce (es. invio al backend)
   */
  onDrop(event: DragEvent): void {
    console.log("File caricato: ",JSON.stringify(event));
    event.preventDefault(); // Impedisce comportamento predefinito del browser
    this.isHovering = false;

    // Recupera i file rilasciati
    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      const fileArray = Array.from(files); // Converte FileList in array
      console.log('File ricevuti nel drop:', fileArray);
      //riempio l'array
    this.aggiungiFiles(fileArray);

    }
  }

onFileSelected(event: Event): void {
  const input = event.target as HTMLInputElement;
  const files = input.files;

  if (files && files.length > 0) {
    const fileArray = Array.from(files);
    this.aggiungiFiles(fileArray);
  }

  //reset
  input.value = '';
}



  /**
   * Metodo per chiudere il dialog (popup) manualmente, es. tramite pulsante "Chiudi"
   */
  chiudiDialog(): void {
    this.dialogRef.close();
  }



 /**
 * Metodo che gestisce l'upload multiplo di file verso Cloudinary,
 * inviando uno a uno ogni file selezionato o trascinato.
 */
uploadFiles(): void {
  // Verifica se ci sono file da caricare
  if (this.filesDaCaricare.length === 0) {
    console.warn("Nessun file selezionato per l'upload.");
    alert("Errore: seleziona almeno un file da caricare.");
    return;
  }

  // Controlla che la cartella di destinazione sia valorizzata
  const folder = this.prepareDataUpload.folder?.trim();
  if (!folder) {
    alert("Errore: specifica una cartella di destinazione.");
    return;
  }

  // Verifica che la cartella non abbia più di 3 livelli (es. A/B/C)
  const livelli = folder.split('/').filter(p => p.trim() !== '');
  if (livelli.length > 3) {
    alert("Errore: puoi usare al massimo 3 livelli di cartella (es. \"Borse/Conchiglia/Grande\").");
    return;
  }

  // Per ogni file, costruisce un FormData e lo invia separatamente
  this.filesDaCaricare.forEach((file: File) => {
    const formData = new FormData();

    // Inserisce il file effettivo da caricare
    formData.append('file', file);

    // Crea una copia dei metadati aggiornati dal form (descrizione, quantità, angolazione)
    const cloudinaryData: CloudinaryDataUpload = {
      folder: this.prepareDataUpload.folder,
      context: {
        nome_file: file.name.split('.')[0], // Nome base senza estensione
        descrizione: this.prepareDataUpload.context.descrizione,
        quantita: this.prepareDataUpload.context.quantita,
        angolazione: this.prepareDataUpload.context.angolazione
      }
    };

    // Log per verifica
    console.log("Caricamento in folder:", cloudinaryData.folder);
    console.log("Metadati associati:", cloudinaryData);

    // Inserisce il campo "cloudinary" come JSON stringificato
    formData.append('cloudinary', JSON.stringify(cloudinaryData));

    // Verifica se si tratta di contenuti di configurazione (usato per distinguere le cache)
    const isConfig = folder.toLowerCase().includes('config');

    // Chiama il servizio backend per l'upload del file
    this.cmsService.uploadMedia(formData, isConfig).subscribe({
      next: (res) => {
        console.log(`Upload riuscito per: ${file.name}`, res);
      },
      error: (err) => {
        console.error(`Errore durante l'upload di ${file.name}:`, err);
        if (err.error?.message) {
          alert(`Errore per ${file.name}: ${err.error.message}`);
        } else {
          alert(`Errore generico durante l'upload di ${file.name}.`);
        }
      }
    });
  });

  // Dopo l'invio, resetta tutti i campi e stati
  this.filesDaCaricare = [];
  this.anteprimeFile.clear();
  this.prepareDataUpload.context.descrizione = '';
  this.prepareDataUpload.context.quantita = '0';
  this.prepareDataUpload.context.angolazione = '';

  // Notifica finale all'utente
  alert("Upload in corso. Attendi la conferma per ogni file.");
}


}
