import {
  Component,
  OnInit,
  OnDestroy,
  AfterViewInit,
  HostListener
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import {
  trigger,
  transition,
  style,
  animate
} from '@angular/animations';
import { BreakpointObserver } from '@angular/cdk/layout';
import { ScrollRevealDirective } from '../../shared/directives/scroll-reveal.directive';
import { Meta, Title } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { SharedDataService } from '../../services/shared-data.service';
import { MatDialog } from '@angular/material/dialog';
import { EditorAdminPopUpComponent } from '../../admin/editor/edit/editor-admin-popup.component';

/* DEFINISCO LE INTERFACCE */
/**
 * Descrive un singolo asset (immagine, video o audio) associato a un media.
 * Include l'URL e l'angolazione dell'asset.
 */
export interface MediaMeta {
  url: string;              // URL diretto al file su Cloudinary
  angolazione: string;      // Es. 'frontale', 'laterale', 'retro'
}


/* Sono gli attributi ovvero i metadata su cloudinary*/
export interface MediaContext {
  display_name?: string;
  type?: 'image' | 'video' | 'audio' | '';
  descrizione?: string;
  quantita?: string;
  // altri metadati dinamici: prezzo, materiale, colore, ecc.
  [key: string]: string | undefined;
}


export interface MediaItems {
  context: MediaContext
  media: MediaMeta[]
}


/**
 * Collezione di media appartenenti a una determinata cartella Cloudinary.
 * Oggetto principale per ogni sezione (es. Carosello, Recensioni, Video in evidenza).
 */
export interface MediaCollection {
  folder: string;
  items: {
    context: MediaContext;
    media: MediaMeta[];
  }[];
}



/*
 * ESEMPIO JSON corrispondente:
Quindi per ogni folder (chiave) ho piu items ovvero piu metadata e media di quell immagine i media rappresentano le angolazioni mentre context i metadati
Gli items contengono tutti i media con i metadati e poi in media ci sono le avrie angolazioni
{
  "folder": "Config/Home/Recensioni",
  "items": [
    {
      "context": {
        "display_name": "Recensione 1",
        "descrizione": "Una recensione positiva",
        "quantita": "0",
        "autore": "Cliente A"
      },
      "media": [
        {
          "url": "https://res.cloudinary.com/demo/image/upload/v1/recensione1.jpg",
          "angolazione": "frontale"
        }
      ]
    },
    {
      "context": {
        "display_name": "Recensione 2",
        "descrizione": "Altra testimonianza",
        "quantita": "0",
        "autore": "Cliente B"
      },
      "media": [
        {
          "url": "https://res.cloudinary.com/demo/image/upload/v1/recensione2.jpg",
          "angolazione": "frontale"
        }
      ]
    }
  ]
}



*/






@Component({
  selector: 'app-home',
  standalone: true,
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule,
    MatCardModule,
    ScrollRevealDirective
  ],
  animations: [
    trigger('fadeInOut', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('2000ms ease-out', style({ opacity: 1 }))
      ]),
      transition(':leave', [
        animate('2000ms ease-out', style({ opacity: 0 }))
      ])
    ])
  ]
})
export class HomeComponent implements OnInit, OnDestroy, AfterViewInit {
  isAdmin = false;

  carosello: MediaCollection = {
    folder: '',
    items: []
  };


  recensioni: MediaCollection = {
    folder: '',
    items: []
  };

  modelliInEvidenza: MediaCollection = {
    folder: '',
    items: []
  };

  creazioni: MediaCollection = {
    folder: '',
    items: []
  };



  currentIndex = 0;
  currentRecensioneIndex = 0;
  intervalId!: ReturnType<typeof setInterval>;
  recensioneIntervalId!: ReturnType<typeof setInterval>;
  isMobile = false;
  mostraContenutoDopoCarosello = false;
  strutturaCategorie: { [key: string]: string[] | undefined } = {};
  categorieSottoCategorie: string[] = [];
  filtriSottoCategorie: Record<string, string[]> = {};
  onlyUrlBorse: string[] = [];

  constructor(
    private breakpointObserver: BreakpointObserver,
    private titleService: Title,
    private metaService: Meta,
    private router: Router,
    private sharedDataService: SharedDataService,
    private dialog: MatDialog
  ) { }

  //ci sono le folders di tutto il MediaCollection in modo da creare le chiavi caroselloKey ecc
  foldersKey: string[] = [];

  ngOnInit(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });

    this.sharedDataService.isAdmin$.subscribe((token: string | null) => {
      this.isAdmin = !!token;
    });

    this.sharedDataService.strutturaCategorie$.subscribe(data => {
      if (Object.keys(data).length > 0) this.strutturaCategorie = data;
    });

    this.sharedDataService.categorieSottoCategorie$.subscribe(data => {
      if (data.length > 0) this.categorieSottoCategorie = data;
    });

    this.sharedDataService.filtriSottoCategorie$.subscribe(data => {
      if (Object.keys(data).length > 0) this.filtriSottoCategorie = data;
    });

    setTimeout(() => {
      const result = this.mapUrlBorseCompletamente().find(mB => mB.includes("borse"));
      this.onlyUrlBorse = result ? [result] : [];
    });

    this.titleService.setTitle('A-Chic | Borse all\'uncinetto e Accessori artigianali');
    this.metaService.addTags([
      { name: 'description', content: 'Borse fatte a mano...' },
      { name: 'keywords', content: 'borse, artigianato, carillon...' },
      { property: 'og:image', content: 'https://www.a-chic.it/assets/og-image.jpg' },
      { property: 'og:url', content: 'https://www.a-chic.it/home' },
      { name: 'twitter:image', content: 'https://www.a-chic.it/assets/og-image.jpg' }
    ]);


    this.breakpointObserver.observe(['(max-width: 768px)']).subscribe(result => {
      this.isMobile = result.matches;
    });

    this.intervalId = setInterval(() => this.nextImage(), 2000);
    this.recensioneIntervalId = setInterval(() => this.nextRecensione(), 2000);

    // Non carico più la config manualmente, uso la subscription al servizio (devo farlo anche per i no config)
    this.sharedDataService.mediasCollectionsConfig$.subscribe({
      next: (data: MediaCollection[]) => {


        
        // Funzione per normalizzare le stringhe (spazi rimossi, lowercase)
        const normalizza = (val: string | undefined): string =>
          (val || '').trim().toLowerCase().replace(/\s+/g, '');

        // Funzione per trovare una collezione corrispondente a una chiave normalizzata
        const trovaCollezione = (key: string | undefined): MediaCollection | undefined => {
          const keyNormalizzato = normalizza(key);
          return data.find(d => normalizza(d.folder) === keyNormalizzato);
        };

        // Estraggo le chiavi folder del json Media Collection e le salvo in un array 
        this.foldersKey = data.map(d => d.folder);
        console.log('[HomeComponent] FoldersKey estract:', this.foldersKey);

        // Quando app component mi da la lista delle chiavi, vado a vedere quali folder hanno carosello e la recupero e la utilizzo
        //come chiave per input file per tutta l'app al massimo proprio se durante la get app component non mi da valori la cablo a mano
        // Trovo la chiave corrispondente alla cartella "carosello" oppure uso un fallback statico
        const caroselloKey = this.matchFolderName('carosello', this.foldersKey) || 'Config/Home/Carosello';

        if (caroselloKey) {
          console.log("Carosello Key: ", caroselloKey);

          // Cerco la collezione corrispondente alla chiave trovata
          const caroselloCollection = trovaCollezione(caroselloKey);

          // Se la collezione esiste, la assegno
          if (caroselloCollection) {
            this.carosello = {
              folder: caroselloKey,
              items: caroselloCollection.items
            };
          } else {
            // Se la collezione non esiste, assegno comunque la chiave con un array vuoto
            this.carosello = {
              folder: caroselloKey,
              items: []
            };
          }

          console.log('[HomeComponent] - carosello:', this.carosello);
        }

        // Trovo la chiave corrispondente alla cartella "recensioni" oppure uso un fallback statico
        const recensioniKey = this.matchFolderName('recensioni', this.foldersKey) || 'Config/Home/Recensioni';

        if (recensioniKey) {
          console.log("Recensioni Key: ", recensioniKey);

          // Cerco la collezione corrispondente alla chiave trovata
          const recensioniCollection = trovaCollezione(recensioniKey);

          // Se la collezione esiste, la assegno
          if (recensioniCollection) {
            this.recensioni = {
              folder: recensioniKey,
              items: recensioniCollection.items
            };
          } else {
            // Se la collezione non esiste, assegno comunque la chiave con un array vuoto
            this.recensioni = {
              folder: recensioniKey,
              items: []
            };
          }

          console.log('[HomeComponent] - recensioni:', this.recensioni);
        }

        // Trovo la chiave corrispondente alla cartella "modelli in evidenza" oppure uso un fallback statico
        const modelliEvidenzaKey = this.matchFolderName('modelli in evidenza', this.foldersKey) || 'Config/Home/Modelli In Evidenza';

        if (modelliEvidenzaKey) {
          console.log("Modelli in evidenza Key: ", modelliEvidenzaKey);

          // Cerco la collezione corrispondente alla chiave trovata
          const modelliEvidenzaCollection = trovaCollezione(modelliEvidenzaKey);

          // Se la collezione esiste, la assegno
          if (modelliEvidenzaCollection) {
            this.modelliInEvidenza = {
              folder: modelliEvidenzaKey,
              items: modelliEvidenzaCollection.items
            };
          } else {
            // Se la collezione non esiste, assegno comunque la chiave con un array vuoto
            this.modelliInEvidenza = {
              folder: modelliEvidenzaKey,
              items: []
            };
          }

          console.log('[HomeComponent] - modelli in evidenza:', this.modelliInEvidenza);
        }

        // Trovo la chiave corrispondente alla cartella "mie creazioni" oppure uso un fallback statico
        const creazioniKey = this.matchFolderName('mie creazioni', this.foldersKey) || 'Config/Home/Mie Creazioni';

        if (creazioniKey) {
          console.log("Creazioni Key: ", creazioniKey);

          // Cerco la collezione corrispondente alla chiave trovata
          const creazioniCollection = trovaCollezione(creazioniKey);

          // Se la collezione esiste, la assegno
          if (creazioniCollection) {
            this.creazioni = {
              folder: creazioniKey,
              items: creazioniCollection.items
            };
          } else {
            // Se la collezione non esiste, assegno comunque la chiave con un array vuoto
            this.creazioni = {
              folder: creazioniKey,
              items: []
            };
          }

          console.log('[HomeComponent] - creazioni:', this.creazioni);
        }
      











      },
      error: err => console.error('Errore caricamento media config', err)
    });


    this.checkScroll();
  }


  fuzzyIncludes(source: string, target: string): boolean {
    const cleanedSource = source.replace(/\s+/g, '').toLowerCase();
    const cleanedTarget = target.replace(/\s+/g, '').toLowerCase();

    let sourceIndex = 0;
    for (let i = 0; i < cleanedTarget.length; i++) {
      const targetChar = cleanedTarget[i];
      sourceIndex = cleanedSource.indexOf(targetChar, sourceIndex);
      if (sourceIndex === -1) return false;
      sourceIndex++;
    }

    return true;
  }

  matchFolderName(input: string, folders: string[]): string | null {
    const cleanedInput = input.replace(/\s+/g, '').toLowerCase();

    for (const folder of folders) {
      const cleanedFolder = folder.replace(/\s+/g, '').toLowerCase();

      // Se corrispondono in modalità fuzzy, ritorno l'originale
      if (this.fuzzyIncludes(cleanedFolder, cleanedInput)) {
        return folder; // <-- Ritorna l'originale esattamente come in folders[]
      }
    }

    return null;
  }



  detectType(url: string): 'image' | 'video' | 'audio' {
    if (url.match(/\.(mp4|webm)$/i)) return 'video';
    if (url.match(/\.(mp3|wav|ogg)$/i)) return 'audio';
    return 'image';
  }

  mapUrlBorseCompletamente(): string[] {
    const urlSet: Set<string> = new Set();
    this.categorieSottoCategorie.forEach(path => {
      const [categoria, sottoCategoria] = path.split('/');
      const url = `/${categoria.toLowerCase()}/${sottoCategoria.toLowerCase()}`;
      urlSet.add(url);
    });
    return Array.from(urlSet);
  }

  goTo(urlOrFilter: string, fromModelliInEvidenza?: boolean): void {
    if (fromModelliInEvidenza) {
      const url = `${this.onlyUrlBorse}?filtri=${encodeURIComponent(urlOrFilter)}`;
      this.router.navigateByUrl(url);
      return;
    }
    this.router.navigate([urlOrFilter]);
  }

  /* Uso questo metodo dove voglio per editare il contenuto dei media di quella*/
  /* come funzionano i pop up
  
  Quanod apro un pop up nel mio home component html viene generato un <div class="cdk-overlay-pane popup-edit-admin"> con un   <div class="mat-dialog-container">

  ovvero questo templattino qua 
 <div class="cdk-overlay-pane popup-edit-admin">
  <div class="mat-dialog-container">
    <!-- il tuo template -->
  </div>
</div>
Ora quando indico un panelClass quindi una classe personalizzata devo scrivere nel scss home component 
  🔍 ::ng-deep .popup-edit-admin .mat-dialog-container { ... }
il che vuol dire :

::ng-deep
→ Dice ad Angular:
“Applica questi stili anche ai componenti figli, anche se sono incapsulati.”
(Serve perché Angular normalmente isola gli stili di ogni componente.)

.popup-edit-admin
→ È la classe personalizzata che hai specificato in panelClass quando hai aperto il dialog. Cioe non la definisco nel mio scss ma:
“Quando crei il popup, aggiungi la classe popup-edit-admin al contenitore principale del dialog.”
Ottenendo quest html:

<div class="cdk-overlay-pane popup-edit-admin">
  <mat-dialog-container>
    <!-- Qui dentro c'è il tuo template -->
  </mat-dialog-container>
</div>


.mat-dialog-container
→ È il contenitore interno usato da Angular Material per il contenuto del dialog.
Tu non lo scrivi, ma Angular Material lo crea automaticamente.

ORA LA PARTE IMPORTANTE E MAT-DIALOG-CONTAINER PERCHE LI ASSEGNAMO LA CLASSE 
/* Stili per il contenitore esterno del dialog: cdk-overlay-pane */
  //      ::ng-deep .popup-edit-admin {
  //          display: flex !important;
  //          justify-content: center;
  //          align-items: center;
  //          background: rgba(0, 0, 0, 0.6); /* Sfondo scuro se vuoi */
  //}

  /* Stili per il contenitore interno del contenuto del dialog */
  //  ::ng-deep .popup-edit-admin .mat-dialog-container {
  //      width: 90vh !important;
  //      height: 90vh !important;
  //      max-width: 100vw !important;
  //      max-height: 100vh !important;
  //      border-radius: 20px;
  //      background-color: white;
  //      padding: 2rem;
  //      overflow: auto;
  //      box-shadow: 0 0 20px rgba(0, 0, 0, 0.2);
  //}

  /*quindi con il primo stile sto dicendo ng deep definisco la classe popup-edit-admin questa classe per poi fare 
  ::ng-deep .popup-edit-admin .mat-dialog-container { CIOE IL MATDIALOG CONTAINER DI POP UP EDIT ADMIN DEVE ESSERE COSI
PER DEFINIRE POI IL MIO POP UP <div class="cdk-overlay-pane popup-edit-admin">
  <mat-dialog-container class="mat-dialog-container">
    <!-- Qui va il tuo componente -->
  </mat-dialog-container>
</div>
MAGARI PER DARE UNA BORDATURA ECC

se non metto panel class non posso dire il pop up lo voglio quadrato

in definitiva popup-admin-color  quando viene passato serve per settare il contenitore del pop up se quello e piccolo tutto il pop up sara piccolo
e quindi si fa questa cosa:

::ng-deep .popup-admin-color {
  display: flex !important;
  justify-content: center;
  align-items: center;
  background: rgba(0, 0, 0, 0.6); // Sfondo dietro la modale
  padding: 1rem; // Importante per evitare che il contenitore tocchi i bordi
  box-sizing: border-box;
}



*/






  ngAfterViewInit(): void {
    setTimeout(() => {
      const videos: NodeListOf<HTMLVideoElement> = document.querySelectorAll('video');
      videos.forEach(video => {
        video.muted = true;
        video.play().catch(err => console.warn('Video non avviato:', err));
      });
    }, 300);
  }

  @HostListener('window:scroll', [])
  onWindowScroll() {
    this.checkScroll();
  }

  checkScroll() {
    const soglia = window.innerHeight * 0.6;
    this.mostraContenutoDopoCarosello = window.scrollY > soglia;
  }

  //gli items sono i media ovvero contengono i metadati piu i media ovvero le url vere e proprie
  nextImage(): void {
    if (!this.carosello || this.carosello.items.length === 0) return;
    const total = this.carosello.items.length;
    this.currentIndex = (this.currentIndex + 1) % total;
  }


  nextRecensione(): void {
    if (!this.recensioni || this.recensioni.items.length === 0) return;
    const total = this.recensioni.items.length;
    this.currentRecensioneIndex = (this.currentRecensioneIndex + 1) % total;
  }



  ngOnDestroy(): void {
    clearInterval(this.intervalId);
    clearInterval(this.recensioneIntervalId);
  }



  //Entra un array di Meta ed esce solo quello frontale ovvero la url
  getMediaFrontale(mediaItems: MediaMeta[]): string | null {
    return mediaItems.find(asset => asset.angolazione?.toLowerCase() === 'frontale')?.url || null;
  }


  // Controllo se esistono media per non far andare ngFor in errore
  hasMedia(media: MediaMeta[]): boolean {
    return Array.isArray(media) && media.length > 0;
  }


  /* QUESTO E IL VECCHIO METODO DOVE IN DATA PASSAVO L'ARRAY STATICO E SUCCEDEVA CHE SE NEL FIGLIO 
  INSERIVO UN MEDIA NON LO VEDEVO SUBITO AGGIORNATO, INVECE ORA CHE FACCIO UTILIZZO SUBJECT UN OSBSERVABLE
  CHE OSSERVA I CAMBIAMENTI OVVERO QUI FACCIO LA NEXT AL FIGLIO SENZA FARE data: this.carosello E QUINDI
  NON FACCIO PIU L'INJECT DI LA MA FARO LA SUBSCRIBE INFATTI MI SOTTOSCRIVO AL SUBJCT ANDANDO A RECUPERARE I DATI DAL PADRE 
  PASSANDOLI AL FIGLIO

  apriPopUpEditorAdmin(): void {
    // Log utile per debugging: mostra i dati del carosello che stai passando al popup
    console.log("[HomeComponent] sto passando il carosello da editare: ", this.carosello);

    // Apertura del dialog (popup) Angular Material
    this.dialog.open(EditorAdminPopUpComponent, {
      // Se impostato su true, l'utente NON può chiudere il popup cliccando fuori o premendo ESC
      // In questo caso lo lasciamo su false per consentire la chiusura standard
      disableClose: false,

      // Dati da passare al componente del popup, in questo caso il carosello
      data: this.carosello,

      // Classe personalizzata per applicare stili personalizzati al dialog
      // Questa classe viene usata nel file SCSS con ::ng-deep .popup-admin-editor
      panelClass: 'popup-admin-editor',

      // (FACOLTATIVO) Se vuoi forzare grandezza piena anche da qui:
      width: '100vw',
      height: '100vh',
      maxWidth: '100vw',
      autoFocus: false // Disattiva focus automatico per evitare "salti" in contenuti lunghi
    });
  }
*/

  apriPopUpEditorAdmin(): void {

    //chiamo l'observable per passare la media collection al figlio
    //ovviamente ora è fatta x il carosello ma sarà dinamico
    this.sharedDataService.setMediaCollectionConfig(this.carosello);
    console.log("[HomeComponent] invio subject al component [EditorAdminPopUpComponent] ", this.carosello);
    // Apertura del dialog (popup) Angular Material
    this.dialog.open(EditorAdminPopUpComponent, {
      disableClose: false,
      panelClass: 'popup-admin-editor',
    });
  }


}
