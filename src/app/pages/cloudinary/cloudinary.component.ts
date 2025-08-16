import {
  Component,
  OnInit,
  OnDestroy,
  Output,
  EventEmitter
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, NavigationEnd, Params, Router } from '@angular/router';
import { BreakpointObserver } from '@angular/cdk/layout';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { DettagliComponent } from '../../pages/dettagli/dettagli.component';
import { AudioPlayerComponent } from '../../pages/audio-player/audio-player.component';
import { Meta, Title } from '@angular/platform-browser';
import { MatDialog } from '@angular/material/dialog';
import { EditorAdminPopUpComponent } from '../../admin/editor/edit/editor-admin-popup.component';

import { Subject, combineLatest } from 'rxjs';
import { filter, map, takeUntil } from 'rxjs/operators';

import { SharedDataService } from '../../services/shared-data.service';

/* Interfacce centralizzate dal progetto */
import {
  MediaCollection,
  MediaItems,
  MediaMeta,
  MediaContext
} from '../../app.component';

@Component({
  selector: 'app-cloudinary',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatProgressSpinnerModule,
    DettagliComponent,
    AudioPlayerComponent
  ],
  templateUrl: './cloudinary.component.html',
  styleUrl: './cloudinary.component.scss'
})
export class CloudinaryComponent implements OnInit, OnDestroy {
  /** Stato responsive e admin */
  isMobile = false;
  isAdmin = false;

  /** Loading per lo spinner */
  isLoading = false;

  /**
   * Griglia: solo le immagini frontali già “flattenate” per il template.
   * Uso campi opzionali del context con fallback stringa vuota.
   */
  immaginiFrontali: Array<{
    url: string;
    display_name: string;
    descrizione: string;
    quantita: string;
  }> = [];

  /**
   * Raggruppo le non-frontali per display_name per alimentare il pannello dettagli.
   * Ogni gruppo contiene url delle angolazioni alternative.
   */
  altreImmagini: Array<{
    display_name: string;
    descrizione: string;
    meta: Array<{ url: string }>;
  }> = [];

  /** Vista paginata, numero pagine e dimensione pagina */
  immaginiFrontaliPaginata: typeof this.immaginiFrontali = [];
  fotoPerPagina = 10;
  numeroDiPagine = 0;
  paginaCorrente = 1;

  /** Stato pannelli overlay (audio e dettagli) */
  mostraAudioPlayer = false;
  isAudioIconVisible = false; // visibile solo su /baby/carillon

  /** Dati per il pannello dettagli */
  immagineSelezionata: string | null = null;
  altreImmaginiSelezionate: string[] = [];
  descrizioneImmagineFrontale = '';

  /** Eventuale richiesta al padre di chiudere la sidenav */
  @Output() richiediChiusuraSidenavAppComp = new EventEmitter<void>();

  /**
   * Con questo Subject posso chiudere tutte le subscribe attive quando il componente
   * viene distrutto. Lo uso con takeUntil(this.destroy$) nelle pipe.
   */
  private destroy$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private dialog: MatDialog,
    private breakpointObserver: BreakpointObserver,
    private sharedData: SharedDataService,
    private titleService: Title,
    private metaService: Meta
  ) {}

  ngOnInit(): void {
    /** Imposto rapidamente i metadati principali della pagina */
    this.titleService.setTitle('A-Chic | Borse e Accessori unici fatti a mano');
    this.metaService.updateTag({
      name: 'description',
      content:
        "Scopri la collezione A-Chic: borse all'uncinetto, charm personalizzati, carillon artigianali e manici fatti a mano."
    });

    /**
     * Gestisco la visibilità dell’icona audio:
     * la rendo visibile solo quando il path è esattamente /baby/carillon.
     */
    const setAudioIconForPath = () => {
      const path = this.router.url.split('?')[0];
      this.isAudioIconVisible = path === '/baby/carillon';
    };
    setAudioIconForPath();

    /** Mi iscrivo ai cambi di navigazione per aggiornare la visibilità dell’icona audio */
    this.router.events
      .pipe(
        // pipe(): qui applico operatori RxJS alla sorgente prima del subscribe
        filter((e): e is NavigationEnd => e instanceof NavigationEnd),
        // takeUntil(): chiuderà automaticamente questa subscription quando emetto destroy$
        takeUntil(this.destroy$)
      )
      .subscribe(() => setAudioIconForPath());

    /**
     * Preparo tre sorgenti reattive che mi servono per costruire la vista:
     * - mobile$: true/false se sono in mobile
     * - isAdmin$: stato admin
     * - route params + query param "filtri" per matchare le cartelle
     * - mediasCollectionsNonConfig$: la cache con i veri media dedicati al catalogo
     */
    const mobile$ = this.breakpointObserver
      .observe(['(max-width: 768px)'])
      .pipe(
        // pipe(): trasformo l’oggetto BreakpointState in un boolean matches
        map(state => state.matches)
      );

    /** Combino tutte le sorgenti che mi interessano per questa vista */
    combineLatest([
      mobile$,
      this.sharedData.isAdmin$,
      this.route.params,
      this.route.queryParams,
      this.sharedData.mediasCollectionsNonConfig$
    ])
      .pipe(
        // takeUntil(): chiudo l’intera catena quando il componente viene distrutto
        takeUntil(this.destroy$),
        map(([isMob, isAdm, params, query, data]) => {
          // Aggiorno piccoli stati UI non derivati dal template
          this.isMobile = isMob;
          this.isAdmin = isAdm;

          // Metto lo spinner e resetto le liste prima di ricalcolare
          this.isLoading = true;
          this.immaginiFrontali = [];
          this.immaginiFrontaliPaginata = [];
          this.altreImmagini = [];
          this.paginaCorrente = 1;
          this.numeroDiPagine = 0;

          // Ricostruisco le card a partire da route + cache
          const { frontali, nonFrontaliGrouped } = this.buildFromRoute(params, query, data);
          this.immaginiFrontali = frontali;
          this.altreImmagini = nonFrontaliGrouped;

          // Paginazione
          this.numeroDiPagine = Math.max(
            1,
            Math.ceil(this.immaginiFrontali.length / this.fotoPerPagina)
          );
          this.aggiornaPagina();

          this.isLoading = false;
          return true;
        })
      )
      .subscribe();
  }

  ngOnDestroy(): void {
    /**
     * Qui emetto un valore su destroy$.
     * Tutte le subscribe che ho protetto con takeUntil(this.destroy$) si chiuderanno
     * in automatico, evitando memory leak.
     */
    this.destroy$.next();
    this.destroy$.complete();

    // Ripristino lo scroll nel caso fosse stato bloccato dai pannelli
    document.body.style.overflow = '';
    document.documentElement.style.overflow = '';
  }

  /* =========================================================================
     Costruzione dei dati dal path della route e dalla cache non-config
     ========================================================================= */

  private buildFromRoute(
    params: Params,
    query: Params,
    data: MediaCollection[] | null | undefined
  ): {
    frontali: Array<{ url: string; display_name: string; descrizione: string; quantita: string }>;
    nonFrontaliGrouped: Array<{ display_name: string; descrizione: string; meta: Array<{ url: string }> }>;
  } {
    if (!Array.isArray(data) || data.length === 0) {
      return { frontali: [], nonFrontaliGrouped: [] };
    }

    // Leggo i segmenti della route: categoria / sottoCategoria / filtri (dal 3° livello in poi)
    const categoria = (params['categoria'] ?? '').toString().trim().toLowerCase();
    const sottoCategoria = (params['sottoCategoria'] ?? '').toString().trim().toLowerCase();
    const filtriPath = (query['filtri'] ?? '').toString().trim();
    const filtri = filtriPath
      ? filtriPath.split('/').map((s: string) => s.trim().toLowerCase()).filter(Boolean)
      : [];

    // Utility: splitto una folder in segmenti normalizzati
    const splitPath = (p: string) =>
      p.split('/').map(s => s.trim().toLowerCase()).filter(Boolean);

    /**
     * Filtro le collezioni in base al prefisso di path richiesto:
     * /:categoria
     * /:categoria/:sottoCategoria
     * /:categoria/:sottoCategoria? + /filtri/a/b/...
     * Confronto i segmenti dall’inizio della folder (prefisso).
     */
    const matchesRoute = (folder: string): boolean => {
      const segs = splitPath(folder);
      const wanted: string[] = [];
      if (categoria) wanted.push(categoria);
      if (sottoCategoria) wanted.push(sottoCategoria);
      if (filtri.length) wanted.push(...filtri);
      if (wanted.length > segs.length) return false;
      for (let i = 0; i < wanted.length; i++) {
        if (segs[i] !== wanted[i]) return false;
      }
      return true;
    };

    const collections = data.filter(c => matchesRoute(c.folder));

    // Appiattisco in due strutture: frontali e nonFrontaliGrouped
    const frontali: Array<{ url: string; display_name: string; descrizione: string; quantita: string }> = [];
    const nonFrontaliGrouped: Array<{ display_name: string; descrizione: string; meta: Array<{ url: string }> }> = [];

    for (const col of collections) {
      for (const item of col.items ?? []) {
        const ctx: MediaContext = item.context ?? {};
        const media: MediaMeta[] = Array.isArray(item.media) ? item.media : [];

        // Trovo la frontale
        const front = media.find(m => (m.angolazione ?? '').toLowerCase() === 'frontale');
        if (front?.url) {
          frontali.push({
            url: front.url,
            display_name: ctx.display_name ?? '',
            descrizione: ctx.descrizione ?? '',
            quantita: ctx.quantita ?? ''
          });
        }

        // Raccolgo le non frontali (altre angolazioni)
        const nonFrontali = media.filter(m => (m.angolazione ?? '').toLowerCase() !== 'frontale' && !!m.url);
        if (nonFrontali.length > 0) {
          nonFrontaliGrouped.push({
            display_name: ctx.display_name ?? '',
            descrizione: ctx.descrizione ?? '',
            meta: nonFrontali.map(n => ({ url: n.url }))
          });
        }
      }
    }

    return { frontali, nonFrontaliGrouped };
  }

  /* =========================================================================
     Paginazione
     ========================================================================= */

  paginaPrecedente(): void {
    if (this.paginaCorrente > 1) {
      this.paginaCorrente--;
      this.aggiornaPagina();
    }
  }

  paginaSuccessiva(): void {
    if (this.paginaCorrente < this.numeroDiPagine) {
      this.paginaCorrente++;
      this.aggiornaPagina();
    }
  }

  private aggiornaPagina(): void {
    const start = (this.paginaCorrente - 1) * this.fotoPerPagina;
    const end = start + this.fotoPerPagina;
    this.immaginiFrontaliPaginata = this.immaginiFrontali.slice(start, end);

    // Porto l’utente in cima dopo il cambio pagina per migliore UX
    setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 50);
  }

  /* =========================================================================
     Interazioni UI: card, pannello dettagli, pannello audio
     ========================================================================= */

  onImmagineClick(item: { url: string; display_name: string; descrizione: string; quantita: string }): void {
    // Se l’audio è aperto, lo chiudo e non apro il dettaglio
    if (this.mostraAudioPlayer) {
      this.mostraAudioPlayer = false;
      return;
    }

    // Popolo i dati del dettaglio
    this.descrizioneImmagineFrontale = item.descrizione;
    this.immagineSelezionata = item.url;

    // Recupero le altre angolazioni per lo stesso display_name
    const gruppo = this.altreImmagini.find(
      g => g.display_name.trim().toLowerCase() === (item.display_name ?? '').trim().toLowerCase()
    );
    this.altreImmaginiSelezionate = gruppo?.meta?.map(m => m.url) ?? [];

    // Blocco lo scroll mentre il dettaglio è aperto
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = '';
  }

  handleChiudiDettaglio(): void {
    // Aspetto la fine dell’animazione del figlio prima di rimuovere la view
    setTimeout(() => {
      this.immagineSelezionata = null;
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    }, 400);
  }

  onAudioIconClick(event: Event): void {
    event.stopPropagation();
    // Se stavo mostrando un dettaglio, lo chiudo per non sovrapporre le view
    this.immagineSelezionata = null;
    this.mostraAudioPlayer = !this.mostraAudioPlayer;
  }

  handleChiudiAudioPlayer(): void {
    this.mostraAudioPlayer = false;
    document.body.style.overflow = '';
    document.documentElement.style.overflow = '';
  }

  /* =========================================================================
     Utility minime
     ========================================================================= */

  primaLetteraGrande(str: string | null | undefined): string {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
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



/**
 * Apre il popup admin “normale” per la cartella corrente del catalogo.
 * Ricavo la folder dai segmenti della rotta (categoria / sottoCategoria / ?filtri=...).
 * Cerco la MediaCollection NON-CONFIG corrispondente; se non esiste, ne creo una vuota.
 * Poi passo la collezione al popup tramite SharedDataService e apro il dialog.
 */
apriPopUpEditorAdmin(): void {
  console.log('[CloudinaryComponent] apriPopUpEditorAdmin(): avvio…');

  // 1) Ricostruisco la folder dai params + query (?filtri=...)
  const categoria: string = (this.route.snapshot.params['categoria'] ?? '').toString().trim();
  const sottoCategoria: string = (this.route.snapshot.params['sottoCategoria'] ?? '').toString().trim();
  const filtriPath: string = (this.route.snapshot.queryParams['filtri'] ?? '').toString().trim();

  const segments: string[] = [];

  if (categoria) segments.push(categoria);
  if (sottoCategoria) segments.push(sottoCategoria);

  // Escludo "Tutte" dai filtri
  if (filtriPath) {
    const extra = filtriPath
      .split('/')
      .map((s: string) => s.trim())
      .filter((s: string) => s && s.toLowerCase() !== 'tutte');

    segments.push(...extra);
  }

  if (segments.length === 0) {
    console.warn('[CloudinaryComponent] apriPopUpEditorAdmin(): nessun segmento di folder; popup non aperto.');
    return;
  }

  // FolderKey in lowercase
  const folderKey: string = segments.join('/').toLowerCase();
  console.log('[CloudinaryComponent] apriPopUpEditorAdmin(): folderKey ricavata =', folderKey);

  // 2) Snapshot della cache NON-CONFIG
  const nonConfigList: MediaCollection[] = this.sharedData.getMediasCollectionsNonConfig() ?? [];
  console.log('[CloudinaryComponent] snapshot NON-CONFIG:', nonConfigList);

  // 3) Cerca la collezione; se non c'è, creane una vuota per quella folder
  const existing: MediaCollection | undefined = nonConfigList.find(
    (c: MediaCollection) => (c.folder ?? '').toLowerCase() === folderKey
  );

  const toEdit: MediaCollection = existing ?? { folder: folderKey, items: [] };

  if (existing) {
    console.log('[CloudinaryComponent] collezione trovata per folder:', existing.folder, existing);
  } else {
    console.warn('[CloudinaryComponent] nessuna collezione trovata. Creo collezione vuota per folder:', folderKey);
  }

  // 4) Passa la collezione all’editor NON-CONFIG
  this.sharedData.setMediaCollectionNonConfig(toEdit);
  console.log('[CloudinaryComponent] MediaCollection NON-CONFIG inviata al popup:', toEdit);

  // 5) Apri il dialog
  this.dialog.open(EditorAdminPopUpComponent, {
    disableClose: false,
      data: { isConfigMode: false },
    panelClass: 'popup-admin-editor'
  });

  console.log('[CloudinaryComponent] apriPopUpEditorAdmin(): dialog aperto.');
}

apriPopUpEditorAdminCarillonAudio(): void {
  console.log('[CloudinaryComponent] apriPopUpEditorAdminCarillonAudio(): avvio…');

  const configList: MediaCollection[] = this.sharedData.getMediasCollectionsConfig() ?? [];
  console.log('[CloudinaryComponent] snapshot CONFIG:', configList);

  // Cerco la folder config/carillon/audio (match case-insensitive, anche se cambia il path esatto)
  const target = configList.find(c =>
    (c.folder ?? '').toLowerCase().includes('config/carillon/audio')
  );

  const toEdit: MediaCollection = target ?? { folder: 'config/carillon/audio', items: [] };

  if (target) {
    console.log('[CloudinaryComponent] collezione audio carillon trovata:', target.folder, target);
  } else {
    console.warn('[CloudinaryComponent] nessuna collezione audio trovata. Creo collezione vuota per: config/carillon/audio');
  }

  // Passo la collezione all’editor tramite il BehaviorSubject condiviso
  this.sharedData.setMediaCollectionConfig(toEdit);
  console.log('[CloudinaryComponent] MediaCollection (carillon audio) inviata al popup:', toEdit);

  // Apro il dialog (full screen tramite .popup-admin-editor nel tuo SCSS)
  this.dialog.open(EditorAdminPopUpComponent, {
    disableClose: false,
          data: { isConfigMode: true },
    panelClass: 'popup-admin-editor'
  });

  console.log('[CloudinaryComponent] apriPopUpEditorAdminCarillonAudio(): dialog aperto.');
}
}
