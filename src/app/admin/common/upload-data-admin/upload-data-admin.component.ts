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

import { Component, OnInit, OnDestroy } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { CmsService } from '../../../services/cms.service';
import { MatIcon } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
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
    private dialogRef: MatDialogRef<UploadDataAdminComponent>
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


uploadFiles(){
    console.log("Totale dei file da caricare: ", this.filesDaCaricare);
}

  /**
   * Metodo per chiudere il dialog (popup) manualmente, es. tramite pulsante "Chiudi"
   */
  chiudiDialog(): void {
    this.dialogRef.close();
  }

}
