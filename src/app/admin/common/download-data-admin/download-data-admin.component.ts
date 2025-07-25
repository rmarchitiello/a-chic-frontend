import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

// Moduli Angular comuni e Angular Material
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

// Interfacce condivise dal componente home
import { MediaCollection,  MediaMeta, MediaContext } from '../../../pages/home/home.component';

@Component({
  selector: 'app-download-data-admin',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatProgressSpinnerModule],
  templateUrl: './download-data-admin.component.html',
  styleUrl: './download-data-admin.component.scss'
})
export class DownloadDataAdminComponent implements OnInit {

  // Indica se non ci sono file da scaricare
  checkDataIsEmpty: boolean = false;

  // Elenco dei file ricevuti (MediaMeta, mi servono solo le url e le angolazioni singoli)
mediaInput: MediaCollection = {
  folder: '',
  items: []
}



  // Spinner attivo durante i download
  downloadInCorso: boolean = false;

  constructor(
    // Dati ricevuti dal componente padre (array di collezioni)
    @Inject(MAT_DIALOG_DATA) public data: MediaCollection,
    private dialogRef: MatDialogRef<DownloadDataAdminComponent>
  ) {}

  ngOnInit(): void {
    console.log('[DownloadDataAdminComponent] Media ricevuti per il download:', this.mediaInput);

    // Estrae tutti i media con url e angolazione
    this.mediaInput = this.data



    // Se non ci sono media, mostra messaggio e chiude popup
    //controllo se almeno qualche items ha dei media
this.checkDataIsEmpty = !this.mediaInput.items.some(item => item.media.length > 0);
if (this.checkDataIsEmpty) {
  setTimeout(() => this.chiudiPopUp(), 1000);
}

  }

  /**
   * Scarica tutti i file presenti nella lista
   */
downloadTutti(): void {
  this.downloadInCorso = true;

  this.mediaInput.items.forEach(item => {

    //recupero di quel MetaMedia le url sia frontali che altre e le inserisco in un array [url1, url2, url3 e cosi via...]
const assetsValidi: string[] = [
  this.getMediaFrontale(item.media),
  ...this.getMediaNoFrontale(item.media)
].filter((url): url is string => url !== null);

    assetsValidi.forEach(url => this.scaricaAsset(url, item.context.display_name || 'senza-nome'));
  });

  setTimeout(() => {
    this.downloadInCorso = false;
  }, 1000);
}


  /**
   * Scarica un singolo media
   */
downloadSingoloAsset(url: string, displayName?: string): void {
  this.downloadInCorso = true;

  if (displayName) {
    this.scaricaAsset(url, displayName);
  } else {
    console.warn('displayName assente: asset non scaricato');
  }

  setTimeout(() => {
    this.downloadInCorso = false;
  }, 1000);
}


private scaricaAsset(url: string, displayName: string): void {
  const estensione = this.getEstensione(url);
  const nomeFile = `${displayName}.${estensione}`;

  fetch(url)
    .then(response => {
      if (!response.ok) throw new Error(`Errore HTTP: ${response.status}`);
      return response.blob();
    })
    .then(blob => {
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = nomeFile;
      link.click();
      URL.revokeObjectURL(link.href);
    })
    .catch(err => {
      console.error(`Errore nel download di ${displayName}:`, err);
    });
}


 

  /**
   * Prende in pasto MediaMeta e restituisce una stringa
   */
getMediaFrontale(item: MediaMeta[]): string | null {
  return item.find(m => m.angolazione?.toLowerCase() === 'frontale')?.url || null;
}

  //come sopra prende in input un media item ed esce array di string di sole url non frontali di quel media
getMediaNoFrontale(item: MediaMeta[]): string[] {
  return (item || [])
    .filter(m => m.angolazione?.toLowerCase() !== 'frontale')
    .map(m => m.url);
}




  /**
   * Estrae l'estensione dal file partendo dall'URL Cloudinary
   */
  getEstensione(url: string): string {
    const parts = url.split('?')[0].split('.');
    return parts.length > 1 ? parts.pop()! : '';
  }

  /**
   * Chiude il dialog
   */
  chiudiPopUp(): void {
    this.dialogRef.close();
  }


// Mappa per tenere traccia dell'indice attuale per ogni media (display_name)
currentIndexes: { [displayName: string]: number } = {};

// Restituisce tutte le URL (frontale + altre) per un dato item
getAllAssets(item: { context: MediaContext; media: MediaMeta[] }): string[] {
  const front = this.getMediaFrontale(item.media);
  const extras = this.getMediaNoFrontale(item.media);
  return front ? [front, ...extras] : [...extras];
}

// Ottiene la URL attiva corrente per un dato display_name
getActiveAsset(displayName: string | undefined): string | null {
  // Se displayName è undefined, ritorna subito null
  if (!displayName) return null;

  // Trova il media item corrispondente
  const item = this.mediaInput.items.find(m => m.context.display_name === displayName);
  if (!item) return null;

  // Estrai tutti gli asset del media item
  const assets = this.getAllAssets(item);

  // Prende l’indice corrente o 0
  const index = this.currentIndexes[displayName] ?? 0;

  // Restituisce l’URL dell’asset attivo (o null se non esiste)
  return assets[index] || null;
}

// Passa all'immagine precedente (aggiorna l'indice)
prevImage(displayName?: string): void {
  if(displayName){
        const item = this.mediaInput.items.find(m => m.context.display_name === displayName);
  if (!item) return;

  const total = this.getAllAssets(item).length;
  const current = this.currentIndexes[displayName] ?? 0;
  this.currentIndexes[displayName] = (current - 1 + total) % total;
  }

}

// Passa all'immagine successiva (aggiorna l'indice)
nextImage(displayName?: string): void {

  if(displayName){
        const item = this.mediaInput.items.find(m => m.context.display_name === displayName);
  if (!item) return;

  const total = this.getAllAssets(item).length;
  const current = this.currentIndexes[displayName] ?? 0;
  this.currentIndexes[displayName] = (current + 1) % total;
  }

}



}
