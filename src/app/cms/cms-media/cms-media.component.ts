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
import { CmsMediaNewFolderComponent } from '../cms-media-new-folder/cms-media-new-folder.component';
import { MatDialog } from '@angular/material/dialog';
import { CloudinaryService } from '../../services/cloudinary.service';
import { GalleriaPopupComponent } from './galleria-popup/galleria-popup.component';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { Router } from '@angular/router';
import { MatSelectModule } from '@angular/material/select';
// Ogni nodo rappresenta una cartella o sottocartella
interface TreeNode {
  name: string;
  fullPath: string; // aggiunto
  children?: TreeNode[];
}

/* interfacce immagini START **/
export interface ImmagineMeta {
  url: string;
  angolazione: string;
}

export interface ImmagineCloudinary {
  display_name: string;
  descrizione: string;
  quantita: string;
  meta: ImmagineMeta[];
}

export interface RispostaImmagini {
  [percorso: string]: ImmagineCloudinary[]; // CIOE STO DICENDO CHE RispostaImmagini è un oggetto con chiavi dinamiche Borse/Conchiglia/Cono con all nterni diplay name ecc...
}

/* cosi

{
  "Accessori/Charm": [
    {
      "display_name": "Ciliegie",
      "descrizione": "Charm per borsa conchiglia",
      "quantita": "0",
      "meta": [
        {
          "url": "http://res.cloudinary.com/dmf1qtmqd/image/upload/v1750512832/Accessori/Charm/Ciliegie_hknjho.jpg",
          "angolazione": "frontale"
        }
      ]
    },
    {
      "display_name": "Fiori",
      "descrizione": "Charm per borsa conchiglia",
      "quantita": "0",
      "meta": [
        {
          "url": "http://res.cloudinary.com/dmf1qtmqd/image/upload/v1750512832/Accessori/Charm/Fiori_wpnzhm.jpg",
          "angolazione": "frontale"
        }
      ]
    },*/
/* interfacce immagini end **/


/* interface aggiornamento immagine meta */
export interface MetaUpdate {
  urlImmagine: string;
  context:   
  {
                nome_file?: string,
                descrizione?: string,
                quantita?: string
            }
}



export interface RenameFolder {
      oldPath: string,
      newPath: string
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
    MatProgressSpinnerModule,
    MatFormFieldModule,
    FormsModule,
    MatInputModule,
  MatSelectModule  ]
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
    private breakpointObserver: BreakpointObserver,
    private dialog: MatDialog,
    private cloudinaryService: CloudinaryService,
    private router: Router
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
loadFolders(refresh?: boolean): void {
  this.loading = true;

  this.cmsService.getFolders(refresh).subscribe({
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


//devo caricare le immagini dala cache una volta cancellate:
loadImages(): void {
  this.loading = true;

  this.cmsService.getAllImages().subscribe({
    next: (data: RispostaImmagini) => {
      // Sovrascrive l'intera struttura delle immagini da mostrare
      this.immaginiRecuperateDaMostrare = data; //risetto le nuove immagini da mostrare
      console.log('Immagini aggiornate:', this.immaginiRecuperateDaMostrare);
      this.loading = false;
    },
    error: (err) => {
      console.error('Errore durante il caricamento delle immagini:', err);
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



//creo anche un pop up galleria Component che al click mi escono le varie angolazioni GalleriaPopupComponent

/* rispetto al pop up folder  dove li devo ricevere un ritorno dal pop up e quindi uso MatDialogRef, qui uso 
MAT_DIALOG_INJECT PER PASSARE LE IMMAGINI META NEL POP UP E MOSTRARLE quindi MatDialogRef per ricevere un ritorno
INJECT MAT DIALOG PER MANDARE */
apriPopUpGalleriaFotoNoFrontali(immagineMeta: ImmagineMeta[]) {
    const dialogRef = this.dialog.open(GalleriaPopupComponent, {
        width: '90vw', // per grandezza pop up
        data: immagineMeta.filter(meta => meta.angolazione !== 'frontale')  //quando uso data sto inviando al pop up e uso inject passo tutti i meta tranne frontale
      });
      
     dialogRef.afterClosed().subscribe(() => {
  this.loadImages(); // Ricarica immagini solo dopo la chiusura effettiva
});

}

// se elimino la frontale devo eliminare tutto
eliminaImmagini(img: ImmagineCloudinary): void {

  const confermato = window.confirm(`Sei sicuro di voler eliminare la cartella "${img.display_name}"?`);
  if (!confermato) {
    console.log("Eliminazione annullata dall'utente");
    return;
  }

  // Estrae tutte le URL delle immagini da eliminare (dalla proprietà meta)
  const urlsDaEliminare: string[] = img.meta.map((m: ImmagineMeta) => m.url);

  console.log("Immagini o immagine da eliminare: ", urlsDaEliminare);

  // Chiama il servizio per eliminare le immagini e si sottoscrive al risultato
  this.cmsService.deleteImages(urlsDaEliminare).subscribe({
    next: (res) => {
      console.log('Eliminazione riuscita:', res);
      console.log("Sto aggiornando la nuova cache immagini: ");
      this.loadImages(); //serve per ricaricare la nuova cache
    },
    error: (err) => {
      console.error('Errore durante eliminazione immagini:', err);
    }
  });
}



/* PER CREARE LA CARTELLA, MOSTRO UN POP UP CIOE, QUANDO CLICCO SUL + PER CREARE LA CARTELLA CHIAMO apriPopUpAddFolder 
passando il node.fullPath
importo import { MatDialog } from '@angular/material/dialog';
 il pop up sara un nuovo component ovviamente con un suo template che ovviamente importo CmsMediaNewFolderComponent 
 Passo il nome della cartella all addFolder che chiama cms service e aggiunge con add folder la cartella nel cloud e aggiorna la cache e leggo la cache
 */

apriPopUpAddFolder(node: any): void {
  const parentPath = node.fullPath; // cartella in cui voglio creare la nuova

  const dialogRef = this.dialog.open(CmsMediaNewFolderComponent, {
        width: '90vw', // per grandezza pop up
              data: {
      isRename: false  // passo al figlio se è una rinomina oppure no !
        }
      });

  // Ricevo il nome della nuova cartella dopo la chiusura del popup
  dialogRef.afterClosed().subscribe((nomeCartella: string) => {
    if (nomeCartella) {
      console.log('Nome cartella da creare:', nomeCartella);
      const fullPath = parentPath ? `${parentPath}/${nomeCartella}` : nomeCartella;

      this.addFolder(fullPath);

    }
  });
}



//rename folder
apriPopUpRenameFolder(node: any): void {

  const fullPath = node.fullPath;
  let cartellaSceltaDaRinominare = node.name;

  console.log("Path corrente: ", fullPath);
  console.log("Cartella scelta da rinominare: ", cartellaSceltaDaRinominare)

  //apro il pop up
    const dialogRef = this.dialog.open(CmsMediaNewFolderComponent, {
    width: '90vw',
        data: {
      isRename: true  // passo al figlio se è una rinomina oppure no !
        }
  });

  // quando chiudo il pop up devo ricevere l'ouput del figlio
    dialogRef.afterClosed().subscribe((nomeCartella: string) => {
    if (nomeCartella) {
        
let newFullPath: string;

if (fullPath.includes('/')) {
  // Ho almeno un segmento padre: sostituisco l’ultimo segmento
  const parti = fullPath.split('/');             // es. ["Accessori", "Charm", "A"]
  parti[parti.length - 1] = nomeCartella;   // es. ["Accessori", "Charm", "D"]
  newFullPath = parti.join('/');                 // "Accessori/Charm/D"
} else {
  // La cartella è in radice: prendo direttamente il nuovo nome
  newFullPath = nomeCartella;               // "D"
}

      const requestRenameFolder: RenameFolder = {
            oldPath : fullPath,
            newPath : newFullPath
      }

      console.log("Request per effettuare la rename: ", JSON.stringify(requestRenameFolder));

        this.cmsService.renameFolder(requestRenameFolder).subscribe({
    next: (data) => {
      // Sovrascrive l'intera struttura delle immagini da mostrare
      console.log('Effettuata la rinomina della folder:', data);
      this.loading = false;
    },
    error: (err) => {
      console.error('Errore durante la rename della folder:', err);
      this.loading = false;
    }
  });

      //carico le nuove cartelle
      console.log("Carico la nuova cartella: ")
      this.loadFolders();
    }
  });


}




//metodo per aggiungere una nuova cartella
addFolder(fullPath: string) {
  // Recupera il percorso completo della cartella da cancellare (es. 'lol/aaa')
  const folderDaCreare = fullPath
  console.log("full path passato: ", fullPath);

  //controllo, se ci sono piu path posso creare fino a 3 livelli Borse/conchiglia/cono e basta poi c devono essere le foto
    const livelli = fullPath.split("/");
     if (livelli.length > 3) {
    alert("Non puoi creare più di due livelli di sottocartelle.");
    return;
  }


  // Effettua la chiamata DELETE al servizio CMS
  this.cmsService.createFolder(folderDaCreare).subscribe({
    next: (result) => {
      // Stampa conferma in console
      console.log("Risposta della creazione: ", result);

      // Dopo la creazione, ricarica l'albero delle cartelle
      this.loadFolders();
    },
    error: (err) => {
      // Stampa l'errore dettagliato in console
      console.error("Errore nella creazione della folder:", err.error);
        // Qualsiasi altro errore generico
        alert("Errore imprevisto durante la creazione.");
      
    }
  });
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

/*Ora quando clicco un nodo, setto in automatica la variabile nodoSelezionato Borse/Conchiglia/Cono 
  Devo andare a leggere il file cache_immagini.json dal backend e recuperare tutte le info di Borse/Conchiglia/Cono o  Borse/Conchiglia/Perlata e cosi via.
*/
  /**
   * Metodo richiamato al click su un nodo dell’albero.
   * Salva il nodo selezionato per visualizzarne i contenuti.
   */

immaginiRecuperateDaMostrare: RispostaImmagini = {};

onNodeClick(node: TreeNode): void {
  this.nodoSelezionato = node;
  console.log('Nodo selezionato:', node.fullPath);

  // Recupera le immagini relative al percorso selezionato
  this.cloudinaryService.getImmagini(node.fullPath).subscribe({
    next: (immagini) => {
      console.log('Immagini recuperate:', immagini);
      this.immaginiRecuperateDaMostrare = immagini;
    },
    error: (err) => {
      console.error('Errore durante il recupero delle immagini:', err);
    }
  });
}

//uso queste funzioni per mostrare se un video audio o foto
getTipo(url: string): 'image' | 'video' | 'audio' {
  if (/\.(mp4|webm|avi)$/i.test(url)) return 'video';
  if (/\.(mp3|wav|ogg)$/i.test(url)) return 'audio';
  return 'image';
}

//visualizzo solo le frontali se video e audio va bene tutto 
haImmaginiFrontali(img: ImmagineCloudinary): boolean {
  return img.meta.some(m => {
    const tipo = this.getTipo(m.url);
    // Se è immagine, mostra solo se angolazione === 'frontale'
    if (tipo === 'image') return m.angolazione === 'frontale';
    // Se è video o audio, mostra sempre
    return tipo === 'video' || tipo === 'audio';
  });
}


//aggiornamento metadati immagine
// Tiene traccia dell'immagine attualmente in modifica
immagineInModifica: any = null;

/**
 * Mostra il form di modifica per l'immagine selezionata.
 * Se clicchi una seconda volta sulla stessa immagine, chiude il form.
 */

valoriModifica: {
  descrizione?: string;
  quantita?: string;
  nome_file?: string;
  angolazione?: string;  
} = {};


apriFormModifica(img: ImmagineCloudinary): void {
  console.log('Immagine da modificare:', img);

  // Se clicco di nuovo sulla stessa immagine, chiudo il form
  if (this.immagineInModifica === img) {
    this.immagineInModifica = null;
    this.valoriModifica = {};
    return;
  }

  // Altrimenti apro il form di modifica
  this.immagineInModifica = img;

  // Inizializzo i valori modificabili con quelli correnti
  this.valoriModifica = {
    descrizione: img.descrizione,
    quantita:    img.quantita,
    nome_file:   img.display_name,
    // Specifico il tipo di 'm' per evitare 'implicit any'
    angolazione: (img.meta.find((m: ImmagineMeta) => !!m.angolazione) as ImmagineMeta | undefined)
                   ?.angolazione ?? 'frontale'
  };
}





onSubmitModifica(img: any): void {
  // Recupero i valori modificati dal form oppure mantengo quelli originali
  const nuovaDescrizione = this.valoriModifica.descrizione ?? img.descrizione;
  const nuovaQuantita = this.valoriModifica.quantita ?? img.quantita;
  const nuovoNome = this.valoriModifica.nome_file ?? img.display_name;

  // Verifico se almeno uno dei campi è stato realmente modificato
  const descrizioneModificata = nuovaDescrizione !== img.descrizione;
  const quantitaModificata    = nuovaQuantita !== img.quantita;
  const nomeModificato        = nuovoNome !== img.display_name;

  // Se nessun campo è stato modificato, interrompo l'operazione
  if (!descrizioneModificata && !quantitaModificata && !nomeModificato) {
    console.log('Nessuna modifica rilevata');
    return;
  }

  // Preparo l'oggetto di aggiornamento con i dati aggiornati
  const aggiornamento = {
    // Trovo l'URL dell'immagine frontale per identificare il file da aggiornare
    urlImmagine: img.meta.find((m: any) => m.angolazione === 'frontale')?.url,

    // Contesto dei metadati da aggiornare
    context: {
      descrizione: nuovaDescrizione,
      quantita: nuovaQuantita,
      nome_file: nuovoNome
      // Se in futuro vuoi includere anche l'angolazione, va aggiunto qui
    }
  };

  // Stampo l'oggetto di aggiornamento in console per debug
  console.log("Aggiornamento da inviare:", aggiornamento);

  // Invio l'aggiornamento al backend tramite il metodo dedicato
  this.aggiornaMetaImmagine(aggiornamento);

  // Dopo l'invio, chiudo il form e resetto i valori del form
  this.immagineInModifica = null;
  this.valoriModifica = {};
}


goToCaricaContenuti(caricaContenutiPath: string){
        this.router.navigate([caricaContenutiPath]);
}

/* metodo per aggiornare l immagine */
aggiornaMetaImmagine(img: MetaUpdate): void {
  console.log(". . . Aggiornamento meta in corso . . . ")
  const confermato = window.confirm(`Sei sicuro di voler aggiornare l'immagine ?`);
  if (!confermato) {
    console.log("Aggiornamento annullato dall'utente");
    return;
  }

  // Estrae tutte le URL delle immagini da eliminare (dalla proprietà meta)
  const urlDaAggiornare: string = img.urlImmagine;

  console.log("Immagine da aggiornare ", urlDaAggiornare);
  console.log("Metadati da aggiornare: ", img.context);
  // Chiama il servizio per eliminare le immagini e si sottoscrive al risultato
  this.cmsService.updateImageMetadata(img.urlImmagine, img.context).subscribe({
    next: (res) => {
      console.log('Aggiornamento riuscito:', res);
      console.log("Sto aggiornando la nuova cache : ");
      this.loadImages(); //serve per ricaricare la nuova cache
    },
    error: (err) => {
      console.error('Errore durante la modifica:', err);
    }
  });
}



}
