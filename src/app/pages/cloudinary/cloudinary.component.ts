  import {
    Component,
    OnInit,
    OnDestroy,
    ViewChild,
    Output,
    EventEmitter,
    ElementRef
  } from '@angular/core';
  import { CommonModule } from '@angular/common';
  import { CloudinaryService } from '../../services/cloudinary.service';
  import { ActivatedRoute } from '@angular/router';

  import { MatCardModule } from '@angular/material/card';
  import { MatButtonModule } from '@angular/material/button';
  import { MatSelectModule } from '@angular/material/select';
  import { MatFormFieldModule } from '@angular/material/form-field';
  import { MatSidenavModule } from '@angular/material/sidenav';
  import { MatToolbarModule } from '@angular/material/toolbar';
  import { MatListModule } from '@angular/material/list';
  import { MatIconModule } from '@angular/material/icon';
  import { MatExpansionModule } from '@angular/material/expansion';
  import { FormsModule } from '@angular/forms';
  import { combineLatest } from 'rxjs';
  import { DettagliComponent } from '../../pages/dettagli/dettagli.component';
  import { BreakpointObserver } from '@angular/cdk/layout';
  import { AudioPlayerComponent } from '../../pages/audio-player/audio-player.component';
  import { Router, NavigationEnd } from '@angular/router';
  import { filter } from 'rxjs/operators';   // RxJS ≤ 7.7
  import { tap, switchMap, takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Meta, Title } from '@angular/platform-browser';

  @Component({
    selector: 'app-cloudinary',
    standalone: true,
    imports: [
      CommonModule,
      MatCardModule,
      MatButtonModule,
      MatSelectModule,
      MatFormFieldModule,
      MatSidenavModule,
      MatToolbarModule,
      MatListModule,
      MatIconModule,
      MatExpansionModule,
      FormsModule,
      DettagliComponent,
      AudioPlayerComponent,
      MatProgressSpinnerModule
    ],
    templateUrl: './cloudinary.component.html',
    styleUrl: './cloudinary.component.scss'
  })
  export class CloudinaryComponent implements OnInit, OnDestroy {
    categoria: string | null = null;
    sottoCategoria: string | null = null;
    isPlaying = false;
    isMobile = false;
    filtroSelezionato: string = 'Tutte';
    filtriAttivi: string[] = [];
    filtriRicevuti: string[] = [];

immaginiFrontali: any[] = [];
altreImmagini: any[] = [];
immaginiFrontaliPaginata: any[] = []; // usata per la visualizzazione paginata

  //praticamente è una variabile che contiene tutte le immagini di quel dipsplay name che non sia frontale passata a dettagli component per mostrare in scroll le altre immagini
altreImmaginiSelezionate: string[] = [];

//passo al figlio
descrizioneImmagineFrontale: string = '';

//per mostrare l'audio template nuovo
mostraAudioPlayer: boolean = false;

//se clicco l'audio mostra il template nuovo
onAudioIconClick(event: Event): void {
  event.stopPropagation();
  console.log('[CLICK AUDIO] prima:', this.mostraAudioPlayer);   // <-- deve comparire
  this.immagineSelezionata = null;
  this.mostraAudioPlayer = !this.mostraAudioPlayer;
  console.log('[CLICK AUDIO] dopo :', this.mostraAudioPlayer);   // true / false alternato
}

//per chiudere la sidenav da dettagli component 
@Output() richiediChiusuraSidenavAppComp = new EventEmitter<void>();




    //paginazione prendo le prime 10 foto
    fotoPerPagina: number = 10;
    numeroDiPagine: number = 0; // da calcolare in carica immagini divisione tra foto trovate tutte / quante foto voglio vedere
    paginaCorrente: number = 1; //setto la pagina corrente ovvio 1 perche mi serve nel metodo carica altri per incrementare la pagina


paginaPrecedente(): void {
  if (this.paginaCorrente > 1) {
    this.paginaCorrente--;
    this.caricaAltreImmagini();
  }
}

paginaSuccessiva(): void {
  if (this.paginaCorrente < this.numeroDiPagine) {
    this.paginaCorrente++;
    this.caricaAltreImmagini();
  }
}

    constructor(
      private cloudinaryService: CloudinaryService,
      private route: ActivatedRoute,
      private breakpointObserver: BreakpointObserver,
      private router: Router,
      private titleService: Title,
      private metaService: Meta

    ) {}



/* Passo a dettagli component tramite input param nel senso non uso routing per passare i dettagli 
a DettagliComponent che è il componente figlio di ClaudinaryComponent, ma uso @Input */

immagineSelezionata: any | null = null; //variabile da passare a DettagliComponent per l'immagine selezionata



// Metodo chiamato al click su una card immagine
// Al click dell'immagine passo la singola immagine a questa funzione
onImmagineClick(item: any): void {
  // Se il pannello audio è aperto, lo chiudo e blocco l'azione
  if (this.mostraAudioPlayer) {
    this.mostraAudioPlayer = false;
    return;
  }

  console.log("Immagine cliccata:", item);

  // Salvo la descrizione della frontale da passare al pannello dettagli
  this.descrizioneImmagineFrontale = item.descrizione;

  // Salvo l'immagine selezionata (url) da mostrare nel dettaglio
  this.immagineSelezionata = item.url;

  // Cerco se ci sono immagini con angolazioni diverse dalla frontale
  const immaginiCorrelate = this.altreImmagini.find(
    (a: { display_name: string }) =>
      a.display_name?.trim().toLowerCase() === item.display_name?.trim().toLowerCase()
  );

  // Se ci sono immagini angolate, le salvo. Altrimenti svuoto l'array.
  this.altreImmaginiSelezionate = immaginiCorrelate?.meta?.length
    ? immaginiCorrelate.meta.map((m: { url: string }) => m.url)
    : [];

  console.log("Altre immagini selezionate:", this.altreImmaginiSelezionate);

  // Blocca lo scroll della pagina mentre il pannello dettagli è aperto
  document.body.style.overflow = 'hidden';
  document.documentElement.style.overflow = 'hidden';
}



/*ora devo passare l'immagine selezionata al figlio e come si fa ? devo passarla dal template
Ovvero, nel DettagliComponent definisco @Input nomeVariabile!: any in pratica è come se DettagliComponent sta 
esponendo un campo che il Padre gli deve mandare
Il campo figlio di chiama @Input() dettaglio!: { display_name: string; url: string };
ora nel template devo passare dettaglio
        <app-dettagli [dettaglio]="immagineSelezionata"></app-dettagli>
Ovvero in DettagliComponent ci sarà una variabile dettaglio che vale immagineSelezionata passata dal padre nel template
*/

//questo serve per eliminare il ghosting tra l animazione del pannello che scompare e il tag html <app-dettagli questo perche il comando di eliminare il tag ovvero quando immagine selezionata e null e tra 400 secondi e non subito
handleChiudiDettaglio() {
      console.log('PADRE: ricevo chiusura, ora tolgo il dettagli');

  // Attendi la fine dell'animazione
  setTimeout(() => {
    this.immagineSelezionata = null;

    // Riabilita lo scroll del body
    document.body.style.overflow = '';
        document.documentElement.style.overflow = '';

  }, 400); // tempo identico all'animazione di chiusura
}

handleChiudiAudioPlayer(): void {
  console.log('PADRE: ricevo chiusura, ora tolgo il player');

  this.mostraAudioPlayer = false; // <--- OK qui

  document.body.style.overflow = '';
  document.documentElement.style.overflow = '';
}



//loading x lo spinner delle immagini 
isLoading: boolean = false;

//nascondo il tasto audio carillon
isAudioIconVisible: boolean = false;
setAudioVisible(){
  this.isAudioIconVisible = true;
}
// RxJS Subject che uso per interrompere le subscription quando il componente viene distrutto
private destroy$ = new Subject<void>();

ngOnInit(): void {

  this.titleService.setTitle('A-Chic | Borse e Accessori unici fatti a mano');

this.metaService.addTags([
  { name: 'description', content: 'Scopri la collezione A-Chic: borse all\'uncinetto, charm personalizzati, carillon artigianali e manici fatti a mano.' },
  { name: 'keywords', content: 'borse fatte a mano, charm artigianali, carillon handmade, accessori uncinetto, borse crochet, borse personalizzate, moda artigianale' },
  { name: 'robots', content: 'index, follow' },

  // Open Graph
  { property: 'og:title', content: 'A-Chic | Collezione borse e charm artigianali' },
  { property: 'og:description', content: 'Borse crochet fatte a mano, charm personalizzati, carillon artigianali. Unici come te.' },
  { property: 'og:image', content: 'https://www.a-chic.it/assets/images/rosa.jpg' },
  { property: 'og:url', content: 'https://www.a-chic.it/home' },
  { property: 'og:type', content: 'website' },

  // Twitter Card
  { name: 'twitter:card', content: 'summary_large_image' },
  { name: 'twitter:title', content: 'A-Chic | Accessori fatti a mano: borse, charm, carillon' },
  { name: 'twitter:description', content: 'Ogni creazione A-Chic è realizzata a mano: borse all\'uncinetto, charm esclusivi, carillon artigianali.' },
  { name: 'twitter:image', content: 'https://www.a-chic.it/assets/images/rosa.jpg' }
]);






  /* -------------------------------------------------------------------
   * 1. Gestione del tasto audio “Carillon”
   * ----------------------------------------------------------------- */

  // Verifico subito, al primo caricamento, se la rotta corrente è /baby/carillon
  const currentPath = this.router.url.split('?')[0]; // rimuovo eventuali query string
  this.isAudioIconVisible = currentPath === '/baby/carillon';
  console.log('[INIT] isAudioIconVisible:', this.isAudioIconVisible);

  // Mi iscrivo agli eventi di navigazione futuri per aggiornare il flag
  this.router.events
    .pipe(
      filter((e): e is NavigationEnd => e instanceof NavigationEnd) // considero solo NavigationEnd
    )
    .subscribe(() => {
      const path = this.router.url.split('?')[0];
      this.isAudioIconVisible = path === '/baby/carillon';
      console.log('[ROUTE CHANGE] isAudioIconVisible:', this.isAudioIconVisible);
    });

  /* -------------------------------------------------------------------
   * 2. Rilevo se il dispositivo è mobile con BreakpointObserver
   * ----------------------------------------------------------------- */

  this.breakpointObserver
    .observe(['(max-width: 768px)'])
    .subscribe(result => {
      this.isMobile = result.matches;
    });

  /* -------------------------------------------------------------------
   * 3. Reazione a cambi di rotta e query param
   *    - combineLatest unisce parametri di percorso e query string
   *    - tap esegue side-effects (reset + loader)
   *    - switchMap annulla eventuali richieste HTTP precedenti
   * ----------------------------------------------------------------- */

  combineLatest([
    this.route.paramMap,
    this.route.queryParams
  ])
  .pipe(
    // Side-effects: attivo loader e svuoto dati vecchi
    tap(() => {
      this.isLoading = true;                    // mostro lo spinner
      this.immaginiFrontali = [];               // svuoto le liste
      this.immaginiFrontaliPaginata = [];
      this.altreImmagini = [];
      this.immagineSelezionata = null;
      this.altreImmaginiSelezionate = [];
      this.numeroDiPagine = 0;
      this.paginaCorrente = 1;
    }),

    // Estraggo i parametri e chiamo il servizio Cloudinary
    switchMap(([params, queryParams]) => {
      // Categoria e sottocategoria dalla rotta
      this.categoria = params.get('categoria');
      this.sottoCategoria = params.get('sottoCategoria');

      // Filtri dalla query string
      const raw = queryParams['filtri'];
      const filtri = raw ? (Array.isArray(raw) ? raw : [raw]) : [];
      this.filtriRicevuti = filtri;
      this.filtroSelezionato = filtri[0] || 'Tutte';
      this.filtriAttivi = ['Tutte', ...filtri.filter(f => f !== 'Tutte')];

      // Aggiorno la visibilità dell’icona audio se necessario
      const path = this.router.url.split('?')[0];
      this.isAudioIconVisible = path === '/baby/carillon';

      // Ritorno l’Observable della chiamata HTTP; con switchMap le richieste precedenti vengono annullate
      return this.cloudinaryService.getImmagini();
    }),

    // Chiudo la subscription quando il componente viene distrutto
    takeUntil(this.destroy$)
  )
  .subscribe({
    // Elabora i dati ricevuti e disattiva il loader
    next: data => {
      this.caricaImmagini(data);
      this.isLoading = false;
    },
    // Gestione dell’errore con disattivazione del loader
    error: err => {
      console.error('Errore nel caricamento immagini:', err);
      this.isLoading = false;
    }
  });
}





ngOnDestroy(): void {
  this.destroy$.next();
  this.destroy$.complete();

  // Ripristino lo scroll del body se era stato bloccato da un pannello
  document.body.style.overflow = '';
  document.documentElement.style.overflow = '';
}








caricaImmagini(data: Record<string, any[]>): void {
  // Esce dalla funzione se non è presente la categoria
  if (!this.categoria) return;

  // Costruisco il path base con categoria e sottocategoria
  const basePath = this.sottoCategoria
    ? `${this.categoria}/${this.sottoCategoria}`.toLowerCase()
    : this.categoria.toLowerCase();

  console.log('Base path per il caricamento immagini:', basePath);

  // Inizializzo array
  let immaginiComplessive: any[] = [];

  // Se sono su mobile, imposto il filtro selezionato come il primo disponibile
  if (this.isMobile) {
    this.filtroSelezionato = this.filtriRicevuti[0] || 'Tutte';
    console.log('Filtro selezionato (mobile):', this.filtroSelezionato);
  }

  // Gestisco i dati in base al filtro selezionato
  if (this.filtroSelezionato === 'Tutte') {
    // Carico tutte le immagini compatibili con il path
    immaginiComplessive = Object.keys(data)
      .filter(key =>
        key.toLowerCase() === basePath ||
        key.toLowerCase().startsWith(`${basePath}/`)
      )
      .flatMap(key => data[key]);
  } else {
    // Cerco la chiave con filtro applicato
    const chiaveFiltroCompleta = `${basePath}/${this.filtroSelezionato}`.toLowerCase();
    const chiaveReale = Object.keys(data).find(
      k => k.toLowerCase().trim() === chiaveFiltroCompleta.trim()
    );

    console.log('Chiave reale trovata:', chiaveReale);

    if (chiaveReale) {
      immaginiComplessive = data[chiaveReale];
    } else {
      console.warn('Nessuna immagine trovata per il filtro selezionato.');
    }
  }

  console.log("Immagini complessive:", JSON.stringify(immaginiComplessive));

  // Estraggo tutte le immagini con metadata
  const tutteLeImmagini = immaginiComplessive.flatMap(item =>
    (item.meta || []).map((img: any) => ({
      ...img,
      display_name: item.display_name,
      descrizione: item.descrizione,
      quantita: item.quantita
    }))
  );

  // Salvo solo le immagini frontali
  this.immaginiFrontali = tutteLeImmagini.filter(img => img.angolazione === 'frontale');

  // Salvo le immagini non frontali, raggruppate per display_name
  this.altreImmagini = immaginiComplessive
    .map((item: any) => {
      const altre = (item.meta || []).filter((img: any) => img.angolazione !== 'frontale');
      if (altre.length > 0) {
        return {
          display_name: item.display_name,
          descrizione: item.descrizione,
          meta: altre
        };
      }
      return null;
    })
    .filter((item: any) => item !== null); // Rimuovo i null

  // Calcolo la paginazione
  this.paginaCorrente = 1;
  this.numeroDiPagine = Math.ceil(this.immaginiFrontali.length / this.fotoPerPagina);
  this.immaginiFrontaliPaginata = this.immaginiFrontali.slice(0, this.fotoPerPagina);

  console.log('Immagini frontali:', this.immaginiFrontali);
  console.log('Immagini paginate:', this.immaginiFrontaliPaginata);
  console.log('Altre immagini:', this.altreImmagini);
}


caricaAltreImmagini(): void {
  // Calcola gli indici per la pagina corrente
  const inizio = (this.paginaCorrente - 1) * this.fotoPerPagina;
  const fine = this.paginaCorrente * this.fotoPerPagina;

  // Estrae la porzione paginata delle immagini frontali
  this.immaginiFrontaliPaginata = this.immaginiFrontali.slice(inizio, fine);

  console.log("Immagini frontali visibili nella pagina corrente:", JSON.stringify(this.immaginiFrontaliPaginata));

  // Scroll automatico in cima alla finestra dopo il rendering
  setTimeout(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, 100);
}









    primaLetteraGrande(str: any): string {
      if (!str) return '';
      return str.charAt(0).toUpperCase() + str.slice(1);
    }
  }
