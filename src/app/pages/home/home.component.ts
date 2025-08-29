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

/* Per i caroselli installo 
• @egjs/ngx-flicking (il componente Angular del carosello)
• @egjs/flicking-plugins (autoplay, frecce, pallini, ecc.)

npm i @egjs/ngx-flicking @egjs/flicking-plugins

Come faccio a vedere i plugin a disposizione?
vado qui C:\aChicConsole\a-chic-frontend\node_modules\@egjs\flicking-plugins\dist
ci sono vari css se voglio utilizzare per esempio i pagination faccio nel ts cosi 

import { Pagination } from '@egjs/flicking-plugins';
e in plugin faccio
plugins: Plugin[] = [
  new Arrow(),
  new Pagination({ type: 'bullet' })
];

Pero se poi voglio usare i pallini devo importare anche il css dei pallini e questo mi conviene farlo nello style.css
@import "@egjs/flicking-plugins/dist/pagination.css";

per mettere i pallini uso questo tag html
<div in-viewport class="flicking-pagination"></div>

Se voglio sovrascrivere questo stile basta andare in a-chic-console ecc e prendere il css pagination.css
prendo la classe flicking-pagination e magari voglio cambiare come devono essewre i bullet quindi la copio dal  file 
.flicking-pagination-bullet {
  display: inline-block;
  width: 8px;
  height: 8px;
  margin: 0 4px;
  border-radius: 50%;
  background-color: rgb(10 10 10 / 10%); --> imposto red !important per esempio cosi vado a sovrascrivere
  cursor: pointer;
  font-size: 1rem;
}
*/



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
import { SharedDataService } from '../../services/shared-data.service';
import { MatDialog } from '@angular/material/dialog';
import { EditorAdminPopUpComponent } from '../../admin/editor/edit/editor-admin-popup.component';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MediaCollection, MediaMeta } from '../../app.component';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { NgxFlickingModule } from '@egjs/ngx-flicking';
import { Plugin,FlickingOptions  } from '@egjs/ngx-flicking';
import { Arrow,Pagination, AutoPlay,Fade } from '@egjs/flicking-plugins'; //qui Fade fa lo switch a dissolvenza, 
//per ricevere l index corrente della slide devo lavorare sul tag quindi
import { ViewChild } from '@angular/core';
import { NgxFlickingComponent } from '@egjs/ngx-flicking';

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
    ScrollRevealDirective,
    MatTooltipModule,
    NgxFlickingModule
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
// ScrollOption è tipizzato come Partial<FlickingOptions>
// → significa che puoi definire solo le proprietà che ti servono
//   senza dover scrivere tutte quelle disponibili in FlickingOptions.
scrollOption: Partial<FlickingOptions> = {
  // rende il carosello "circolare" (loop infinito)
  // → se sei all’ultima slide e vai avanti, torni alla prima
  // → se sei alla prima e vai indietro, vai all’ultima
  circular: true,

  // durata dell’animazione della *camera* quando cambia slide
  // valore predefinito = 500 (ms)
  // se lo imposti a 0:
  //   → disattivi l’animazione della camera
  //   → la camera salta subito alla nuova posizione
  //   → utile insieme al plugin Fade, perché così non vedi lo "scorrimento" laterale
  duration: 0, //funziona al click subito cambia slide con inputType[] che non imposto nulla non slida piu

  // tipo di movimento usato quando fai swipe o cambi slide
  // - "snap" (default): la slide si "aggancia" sempre alla più vicina
  // - "freeScroll": scorrimento libero con inerzia (puoi fermarti a metà slide)
  // - "strict": simile a snap, ma più rigido sul conteggio delle slide
  // NB: se usi "freeScroll", il plugin Fade perde senso perché la camera continuerà a muoversi
  moveType: "snap",
  inputType: [] //se faccio cosi il carosello non è slideabile ma solo cliccando prev e next
};

plugins: Plugin[] = [
  new Fade(),   // gestisce la transizione a dissolvenza
  new Arrow(),
  new Pagination({ type: 'bullet' }),
  new AutoPlay({ duration: 100000 })
];

/* Esempio, come ottengo l indice corrente? 
voglio fare in modo da ottenere l indice corrente del carosello
purtroppo non esiste un opzione index quindi cosa faccio, 
intercetto l'evento NON NATIVO di angular ma NATIVO DI ngx-flicking
quest evento si chiama (changed)="getIndiceCorrente($event)"
e in questo evento ci sono N proprita una di queste e index. ogni volta che cambia quel tag
assegno l index a una variabile di classe
Se la voglio leggere per esempio al click, creo un evento in questo caso NATIVO di angular (click)="ottengoIndiceCorrente()" ma non faccio $event
perche altrimenti catturo l'evento di click. Al click vado a leggere esempioIndex
di seguito l'html  di esempio
<ngx-flicking
  [options]="scrollOption"
  (changed)="getIndiceCorrente($event)"
  (click)="ottengoIndiceCorrente()"
  [plugins]="plugins"
  style="display:block; width:100%;"
>
Supponiamo che al click voglio andare nell indice 4   

ottengoIndiceCorrente(){
  console.log("Sono nell indice: ", this.esempioIndex)
  //voglio andare all indice 3 faccio
  this.esempioIndex = 3
  pero devo dire al tag guarda devi andare all indice 3 allora uso view child quindi inizio a lavorare sul tag tramite #flickingTag 

  <ngx-flicking
  #flickingTag
  [options]="scrollOption"
  (changed)="getIndiceCorrente($event)"
  (click)="ottengoIndiceCorrente()"
  [plugins]="plugins"
  style="display:block; width:100%;"
>
  import import { ViewChild } from "@angular/core";
import { NgxFlickingComponent } from "@egjs/ngx-flicking";

poi   @ViewChild("flickingTag") flickingTag?: NgxFlickingComponent;
e nella

ottengoIndiceCorrente(){
  console.log("Sono nell indice: ", this.esempioIndex)
  //voglio andare all indice 3 faccio
  this.esempioIndex = 3
  this.flickingTag?.moveTo(this.esempioIndex)
}
*/
@ViewChild("flickingTag") flickingTag?: NgxFlickingComponent;



/* Essendo che il carosello flicking non ha un evento nativo di no scroll (nel senso quando scrollo)
non voglio vedere un effetto rullo voglio che l immagine cambia ma non con un effetto rullo allora cosa faccio
metto 
duration 0 e inputType[], mettendo inputType[] sto dicendo il carosello scrolla solo premendo nei tasti pre e next, allora cosa faccio.
simulo io uno swipe sia da mouse che da touch utilizzando gli eventi nativi mousedown scatta quando tengo premuto il click del mouse
mouseup (scatta) quando stacco il dito dal mouse e uguale a un click ma non deve essere cosi perche tra mouse down e up deve starci mouse move
*/

//simulo uno swipe
asseX: number = 0;
saveAsseX(event: any){
  this.asseX = event.clientX;
  console.log("AsseX iniziale ", this.asseX)
}

//prendo l'asse x settato col mouse down e lo calcolo con quello corrente
checkIfScrollDxorSx(event: MouseEvent) {

  //vedo prima se l'evento appartiene a una freccia se si non continuo  e procedo col carosello did efault 
  if ((event.target as HTMLElement).closest('.flicking-arrow-prev, .flicking-arrow-next')) {
  return; // clic su freccia: esci
}


  //salvo gli elementi totali perche in base a che sto scrollando a destra e a sinistra ricalcolo l indice corrente e faccio la moveTo
  const elementiTotaliInCarosello = this.flickingTag?.panels.length;


  console.log("Questo è l'asse X dove ho rilasciato il click:", event.clientX);

  // delta = posizione finale - posizione iniziale
  const deltaX = event.clientX - this.asseX;
  console.log("Scostamento dell'asse X:", deltaX);

  if (deltaX > 0) {
    console.log("Swipe da sinistra verso destra → scroll a sinistra");
    this.prevIndex(elementiTotaliInCarosello)
  } else if (deltaX < 0) {
    console.log("Swipe da destra verso sinistra → scroll a destra");
    this.nextIndex(elementiTotaliInCarosello)
  } else {
    console.log("Nessuno spostamento, probabilmente click");
  }
}

prevIndex(totaleElementiCarosello: number | undefined) {
  // Leggo l'indice corrente del carosello
  const currentIndex = this.flickingTag?.index;

  // Controllo che currentIndex e totale siano definiti
  if (currentIndex !== undefined && totaleElementiCarosello !== undefined) {
    // Calcolo il nuovo indice andando indietro di 1
    // Aggiungo totaleElementiCarosello per evitare valori negativi
    // E poi faccio il modulo per restare nel range 0..(totale-1)
    const nuovoIndex = (currentIndex - 1 + totaleElementiCarosello) % totaleElementiCarosello;

    // Muovo il carosello al nuovo indice
    this.flickingTag?.moveTo(nuovoIndex);
    console.log(`Prev: da ${currentIndex} a ${nuovoIndex}`);
  }
}

nextIndex(totaleElementiCarosello: number | undefined) {
  // Leggo l'indice corrente del carosello
  const currentIndex = this.flickingTag?.index;

  // Controllo che currentIndex e totale siano definiti
  if (currentIndex !== undefined && totaleElementiCarosello !== undefined) {
    // Calcolo il nuovo indice andando avanti di 1
    // Uso il modulo per tornare a 0 quando supero l'ultima slide
    const nuovoIndex = (currentIndex + 1) % totaleElementiCarosello;

    // Muovo il carosello al nuovo indice
    this.flickingTag?.moveTo(nuovoIndex);
    console.log(`Next: da ${currentIndex} a ${nuovoIndex}`);
  }
}


  /**
   * Stato admin reattivo.
   */
  isAdmin = false;

  /**
   * Sezioni della home. Ogni sezione è una MediaCollection.
   */
  carosello: MediaCollection = { folder: '', items: [] };
  recensioni: MediaCollection = { folder: '', items: [] };
  modelliInEvidenza: MediaCollection = { folder: '', items: [] };
  creazioni: MediaCollection = { folder: '', items: [] };

  /**
   * Indici per rotazioni automatiche.
   */
  currentIndex = 0;
  currentRecensioneIndex = 0;

  /**
   * ID degli intervalli; avviati solo quando ci sono elementi.
   */
  intervalId?: ReturnType<typeof setInterval>;
  recensioneIntervalId?: ReturnType<typeof setInterval>;

  /**
   * Stato responsive e visibilità contenuti successivi.
   */
  isMobile = false;
  mostraContenutoDopoCarosello = false;

  /**
   * Teardown delle subscribe.
   */
  private destroy$ = new Subject<void>();

  constructor(
    private breakpointObserver: BreakpointObserver,
    private titleService: Title,
    private metaService: Meta,
    private sharedDataService: SharedDataService,
    private dialog: MatDialog
  ) {}

    slides = [1, 2, 3, 4];


  ngOnInit(): void {
    // Scroll iniziale in alto.
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Stato admin derivato dal token salvato nello SharedDataService.
    this.sharedDataService.isAdmin$
      .pipe(takeUntil(this.destroy$))
      .subscribe(isAdmin => {
        this.isAdmin = isAdmin;
      });

    // SEO di base. updateTag evita duplicazioni tra ricreazioni del componente.
    this.titleService.setTitle('A-Chic | Borse all\'uncinetto e Accessori artigianali');
    this.metaService.updateTag({ name: 'description', content: 'Borse fatte a mano...' });
    this.metaService.updateTag({ name: 'keywords', content: 'borse, artigianato, carillon...' });
    this.metaService.updateTag({ property: 'og:image', content: 'https://www.a-chic.it/assets/og-image.jpg' });
    this.metaService.updateTag({ property: 'og:url', content: 'https://www.a-chic.it/home' });
    this.metaService.updateTag({ name: 'twitter:image', content: 'https://www.a-chic.it/assets/og-image.jpg' });

    // Breakpoint per adattare il layout.
    this.breakpointObserver
      .observe(['(max-width: 768px)'])
      .pipe(takeUntil(this.destroy$))
      .subscribe(result => {
        this.isMobile = result.matches;
      });

    /**
     * Lettura reattiva della cache media.
     * Si ricavano le chiavi delle quattro sezioni direttamente dalle folder in input.
     * Il confronto è basato sulla parte finale della folder (tail), senza hard-coding di stringhe intere.
     */
    this.sharedDataService.mediasCollectionsConfig$
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data: MediaCollection[]) => {
          if (!Array.isArray(data)) return;

          // Funzione locale: trova una collezione la cui folder termina con il tail indicato.
          // Esempio: tail "config/home/carosello" o semplicemente "/carosello".
          const findByTail = (tail: string) =>
            data.find(c => c.folder.toLowerCase().endsWith(tail.toLowerCase()));

          // Tails attesi per le quattro sezioni. Si usano i segmenti finali per tollerare prefissi diversi.
          const tailCarosello = '/carosello';
          const tailRecensioni = '/recensioni';
          const tailModelli = '/modelli in evidenza';
          const tailCreazioni = '/le mie creazioni';

          // Carosello
          const cCarosello = findByTail(tailCarosello);
          this.carosello = {
            folder: cCarosello?.folder ?? 'config/home/carosello',
            items: cCarosello?.items ?? []
          };

          // Recensioni
          const cRecensioni = findByTail(tailRecensioni);
          this.recensioni = {
            folder: cRecensioni?.folder ?? 'config/home/recensioni',
            items: cRecensioni?.items ?? []
          };

          // Modelli in evidenza
          const cModelli = findByTail(tailModelli);
          this.modelliInEvidenza = {
            folder: cModelli?.folder ?? 'config/home/modelli in evidenza',
            items: cModelli?.items ?? []
          };

          // Mie creazioni
          const cCreazioni = findByTail(tailCreazioni);
          this.creazioni = {
            folder: cCreazioni?.folder ?? 'config/home/le mie creazioni',
            items: cCreazioni?.items ?? []
          };

          // Avvio degli intervalli solo se esistono elementi e non sono già partiti.
          if (this.carosello.items.length > 0 && !this.intervalId) {
            this.intervalId = setInterval(() => this.nextImage(), 2000);
          }
          if (this.recensioni.items.length > 0 && !this.recensioneIntervalId) {
            this.recensioneIntervalId = setInterval(() => this.nextRecensione(), 2000);
          }
        },
        error: err => console.error('Errore caricamento media config', err)
      });

    // Valutazione iniziale dello scroll per mostrare il contenuto dopo il carosello.
    this.checkScroll();
  }

  ngAfterViewInit(): void {
    // Avvio silenzioso dei video dopo il rendering, con fallback in caso di policy browser.
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

  /**
   * Mostra il blocco successivo al carosello quando si supera il 60% dell'altezza viewport.
   */
  private checkScroll() {
    const soglia = window.innerHeight * 0.6;
    this.mostraContenutoDopoCarosello = window.scrollY > soglia;
  }

  /**
   * Rotazione del carosello immagini.
   */
  private nextImage(): void {
    const total = this.carosello.items.length;
    if (total === 0) return;
    this.currentIndex = (this.currentIndex + 1) % total;
  }

  /**
   * Rotazione delle recensioni.
   */
  private nextRecensione(): void {
    const total = this.recensioni.items.length;
    if (total === 0) return;
    this.currentRecensioneIndex = (this.currentRecensioneIndex + 1) % total;
  }

  ngOnDestroy(): void {
    // Pulizia intervalli e completamento del subject per annullare le subscribe attive.
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = undefined;
    }
    if (this.recensioneIntervalId) {
      clearInterval(this.recensioneIntervalId);
      this.recensioneIntervalId = undefined;
    }
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Restituisce la URL del media con angolazione "frontale", se presente.
   */
  getMediaFrontale(mediaItems: MediaMeta[]): string | null {
    return mediaItems.find(a => a.angolazione?.toLowerCase() === 'frontale')?.url ?? null;
  }

  /**
   * Verifica per evitare errori nei *ngFor* quando l'array non è definito o vuoto.
   */
  hasMedia(media: MediaMeta[]): boolean {
    return Array.isArray(media) && media.length > 0;
  }

  /**
   * Apre il popup editor admin per la sezione richiesta.
   * Passa la MediaCollection scelta tramite SharedDataService e applica una panelClass
   * che potrà essere stilizzata via SCSS con selettore ::ng-deep legato alla classe stessa.
   */
  apriPopUpEditorAdmin(valoreDaEditare: string): void {
    let toEdit: MediaCollection;
    if (valoreDaEditare === 'carosello') {
      toEdit = this.carosello;
    } else if (valoreDaEditare === 'creazioni') {
      toEdit = this.creazioni;
    } else if (valoreDaEditare === 'recensioni') {
      toEdit = this.recensioni;
    } else if (valoreDaEditare === 'modelliEvidenza') {
      toEdit = this.modelliInEvidenza;
    } else {
      toEdit = this.carosello;
    }

    console.log("Invio i dati all editor, ",JSON.stringify(toEdit));
    this.sharedDataService.setMediaCollectionConfig(toEdit);
    this.dialog.open(EditorAdminPopUpComponent, {
      disableClose: false,
      data: { isConfigMode: true },

      panelClass: 'popup-admin-editor'
    });
  }


  checkEstensione(url: string, tipo: 'image' | 'video' | 'audio'): boolean {
  if (!url) return false;

  const lowerUrl = url.toLowerCase();

  const estensioni = {
    image: ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.avif'],
    video: ['.mp4', '.webm', '.ogg', '.mov', '.m4v'],
    audio: ['.mp3', '.wav', '.ogg', '.m4a', '.aac', '.flac']
  };

  return estensioni[tipo].some(ext => lowerUrl.endsWith(ext));
}

}
