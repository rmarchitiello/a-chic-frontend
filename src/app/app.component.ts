import { Component, OnInit, OnDestroy, NgZone, ChangeDetectorRef, ViewChild, AfterViewInit } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { CloudinaryService } from './services/cloudinary.service';
import { MatSidenavModule, MatSidenav } from '@angular/material/sidenav';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDividerModule } from '@angular/material/divider';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatMenuModule } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatExpansionModule } from '@angular/material/expansion';
import { AdminFolderPopUpComponent } from './admin/editor/admin-folder-popup/admin-folder-popup.component';
import {
  trigger,
  state,
  style,
  animate,
  transition
} from '@angular/animations';
import { FooterComponent } from './pages/footer/footer.component';
import { HeaderComponent } from './pages/header/header.component';
import { filter } from 'rxjs/operators';
import { BreakpointObserver } from '@angular/cdk/layout';
import { LiveChatComponent } from './pages/live-chat/live-chat.component';
import { SharedDataService } from './services/shared-data.service';
import { MatDialog } from '@angular/material/dialog';
import { AdminService } from './services/admin.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TopBannerComponent } from './pages/top-banner/top-banner.component';
import { ScrollingModule, CdkScrollable, ScrollDispatcher } from '@angular/cdk/scrolling';
import { Subscription } from 'rxjs';
import { auditTime } from 'rxjs/operators';

/* ============================
   INTERFACCE DATI MEDIA
   ============================ */

/** Descrive un singolo asset (immagine, video o audio) associato a un media. */
export interface MediaMeta {
  url: string;         // URL diretto al file su Cloudinary
  angolazione: string; // Es. 'frontale', 'laterale', 'retro'
}

/** Metadati dinamici associati a un media su Cloudinary. */
export interface MediaContext {
  display_name?: string;
  type?: 'image' | 'video' | 'audio' | '';
  descrizione?: string;
  quantita?: string;
  [key: string]: string | undefined;
}

export interface MediaItems {
  context: MediaContext;
  media: MediaMeta[];
}

/** Collezione di media appartenenti a una determinata cartella Cloudinary. */
export interface MediaCollection {
  folder: string;
  items: {
    context: MediaContext;
    media: MediaMeta[];
  }[];
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    MatToolbarModule,
    MatButtonModule,
    MatCardModule,
    MatMenuModule,
    MatIconModule,
    MatInputModule,
    MatAutocompleteModule,
    MatDividerModule,
    FormsModule,
    ReactiveFormsModule,
    RouterOutlet,
    MatExpansionModule,
    MatSidenavModule,
    FooterComponent,
    HeaderComponent,
    LiveChatComponent,
    MatProgressSpinnerModule,
    TopBannerComponent,
    ScrollingModule
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  animations: [
    trigger('expandCollapse', [
      state('void', style({ height: '0px', opacity: 0 })),
      state('*', style({ height: '*', opacity: 1 })),
      transition('void <=> *', animate('250ms ease-in-out'))
    ])
  ]
})
export class AppComponent implements OnInit, OnDestroy, AfterViewInit {

  /* ==========================================================
     VIEWCHILD
     - Ho UN SOLO sidenav nel template. Qui prendo la reference.
     - Ho rimosso la vecchia #sidenavDesktop per coerenza.
     ========================================================== */
  @ViewChild('sidenav') sidenav!: MatSidenav;

  /**
   * Uso la direttiva CdkScrollable perché lo scroller reale non è più window,
   * ma <mat-sidenav-content>. Con CdkScrollable intercetto gli eventi di scroll
   * e posso fare bridging verso window se mi serve (sticky, reveal, ecc.).
   */
  @ViewChild(CdkScrollable) scrollable?: CdkScrollable;
  private scrollSub?: Subscription;

  /* ==========================================================
     STATO APP / UI
     ========================================================== */
  title: string = 'A-chic bag';

  /** True se l'utente è in modalità admin. */
  isAdmin = false;

  /** True se la viewport è considerata mobile (<= 768px). */
  isMobile = false;

  /**
   * Stato di apertura del menu su mobile.
   * È vincolato all'[opened] del sidenav quando isMobile === true.
   */
  mobileMenuOpen = false;

  /**
   * Stato di apertura del menu su desktop.
   * È vincolato all'[opened] del sidenav quando isMobile === false.
   */
  desktopSidenavOpen = false;

  /** Path attualmente espanso nell'albero categorie (gestisce tutti i livelli). */
  categoriaEspansaPath: string = '';

  /** Elenco dei path cartella caricati. */
  foldersEstratte: string[] = [];

  /** Mappa: cartella → segmenti (es. "borse/conchiglia/perlata" → ["borse","conchiglia","perlata"]). */
  mapFolderWithCategorieESottoCategorie: { [folderKey: string]: string[] } = {};

  /** Elenco categorie di primo livello. */
  categorieNew: string[] = [];

  /** True se la route corrente è /home (mi serve per piccole differenze di layout). */
  isHomeRoute = false;

  /** True mentre sto rinfrescando la cache (mostro overlay spinner). */
  isRefreshing = false;

  /* ==========================================================
     GESTIONE SCROLL LOCK PER IL DRAWER MOBILE
     - Memorizzo la posizione di scroll da ripristinare quando chiudo il menu.
     ========================================================== */
  private _lockedScrollTop = 0;

  constructor(
    private router: Router,
    private cloudinaryService: CloudinaryService,
    private zone: NgZone,
    private cdr: ChangeDetectorRef,
    private breakpointObserver: BreakpointObserver,
    private sharedDataService: SharedDataService,
    private dialog: MatDialog,
    private adminService: AdminService,
    private snackBar: MatSnackBar,
    private scrollDispatcher: ScrollDispatcher
  ) {
    /**
     * Qui intercetto i cambi di route per capire se sono in /home.
     * Lo faccio nel costruttore così lo stato è sempre aggiornato anche ai primissimi navigation end.
     */
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        this.isHomeRoute = event.urlAfterRedirects === '/home';
      });
  }

  /* ==========================================================
     LIFECYCLE
     ========================================================== */

  ngOnInit(): void {
    /**
     * 1) Sottoscrivo lo stato admin esposto dal servizio condiviso.
     *    Mi serve per abilitare/disabilitare azioni a livello di UI.
     */
    this.sharedDataService.isAdmin$.subscribe((isAdmin: boolean) => {
      this.isAdmin = isAdmin;
    });

    /**
     * 2) Rilevo se sono in mobile usando BreakpointObserver.
     *    Aggiorno isMobile così il template decide mode/opened del sidenav.
     */
    this.breakpointObserver
      .observe(['(max-width: 768px)'])
      .subscribe(result => {
        this.isMobile = result.matches;
      });

    /**
     * 3) Primo caricamento media: config e non-config.
     *    Popolo lo stato nello SharedDataService e costruisco la mappa categorie.
     */
    this.caricaMediaFromCache(true);
    this.caricaMediaFromCache(false);

    /**
     * 4) Se la cache cambia (qualunque fonte), ricarico.
     */
    this.sharedDataService.allCacheChanged$.subscribe(() => {
      this.caricaMediaFromCache(true);
      this.caricaMediaFromCache(false);
    });
  }

  ngAfterViewInit(): void {
    /**
     * All'avvio, forzo lo stato "sbloccato" dello scroller
     * (se fossi in mobile e qualcosa aprisse il menu prima, evito glitch).
     */
    this.onDrawerState(false);

    /**
     * Bridge: quando il CdkScrollable scorre, rilancio un "scroll" sul window.
     * Questo è utile per componenti o direttive legacy che si aspettano window:scroll.
     * Uso auditTime(16) per alleggerire l'emissione (~60fps).
     */
    this.scrollSub = this.scrollDispatcher.scrolled()
      .pipe(auditTime(16))
      .subscribe(() => {
        window.dispatchEvent(new Event('scroll'));
      });
  }

  ngOnDestroy(): void {
    /** Pulisco la sottoscrizione allo scroll del CDK. */
    this.scrollSub?.unsubscribe();
  }

  /* ==========================================================
     SIDENAV / SCROLL LOCK
     ========================================================== */

  /**
   * Ritorno il contenitore che scorre realmente in Angular Material.
   * - Preferisco il CdkScrollable del template (sicuro e typed).
   * - In fallback interrogo il DOM per .mat-drawer-content / .mat-sidenav-content.
   */
  private getScrollerElement(): HTMLElement | null {
    return this.scrollable?.getElementRef().nativeElement
      ?? (document.querySelector('.mat-drawer-content, .mat-sidenav-content') as HTMLElement | null);
  }

  /**
   * Gestore per il lock dello sfondo quando il drawer è "over" su mobile.
   * Nota importante: se non sono in mobile, esco subito. Su desktop non devo bloccare nulla.
   *
   * Quando opened === true:
   *  - salvo la posizione di scroll corrente
   *  - rendo fisso il contenitore (position:fixed) e lo traslo verso l'alto di scrollTop
   *
   * Quando opened === false:
   *  - ripulisco gli stili inline
   *  - ripristino esattamente lo scroll precedente
   */
  onDrawerState(opened: boolean): void {
  // Desktop: non faccio nulla (deve poter scorrere .mat-sidenav-content)
  if (!this.isMobile) return;

  const body = document.body;

  if (opened) {
    // salvo la posizione attuale e congelo il body
    this._lockedScrollTop = window.scrollY || document.documentElement.scrollTop || 0;

    body.classList.add('no-scroll');
    body.style.position = 'fixed';
    body.style.top = `-${this._lockedScrollTop}px`;
    body.style.left = '0';
    body.style.right = '0';
    body.style.width = '100%';
    body.style.overflow = 'hidden'; // cintura di sicurezza
  } else {
    // sblocco e ripristino la posizione
    body.classList.remove('no-scroll');
    body.style.position = '';
    body.style.top = '';
    body.style.left = '';
    body.style.right = '';
    body.style.width = '';
    body.style.overflow = '';

    window.scrollTo(0, this._lockedScrollTop);
  }
}
  /**
   * Handler legacy che usavo per aprire/chiudere il menu su desktop
   * con il pulsante flottante. Ora che ho un solo sidenav, preferisco
   * delegare al componente header (menuToggle → sidenav.toggle()).
   * Mantengo comunque questa funzione per retrocompatibilità.
   */
  desktopSidenavOpenFun(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    // togglo il sidenav direttamente; l'(openedChange) allinea desktopSidenavOpen
    this.sidenav?.toggle();
  }

  /* ==========================================================
     COSTRUZIONE CATEGORIE / NAVIGAZIONE
     ========================================================== */

  /** Carico media dalla cache (config o non-config) e aggiorno stato condiviso. */
  caricaMediaFromCache(config: boolean): void {
    this.cloudinaryService.getMediaFromCache('', config).subscribe({
      next: (data: MediaCollection[]) => {
        if (config) {
          this.sharedDataService.setAllMediasCollectionsConfig(data);
        } else {
          this.sharedDataService.setAllMediasCollectionsNonConfig(data);
          this.calcolaCategoriePiuSottoCategorieEAltre(data);
        }
      },
      error: err => console.error('Errore caricamento media', err)
    });
  }

  /** Ricostruisco mappa cartelle → segmenti e calcolo i padri (L1). */
  calcolaCategoriePiuSottoCategorieEAltre(entryMedias: MediaCollection[]): void {
    this.foldersEstratte = [];
    this.mapFolderWithCategorieESottoCategorie = {};

    entryMedias.forEach(media => {
      if (media?.folder) this.foldersEstratte.push(media.folder.toLocaleLowerCase());
    });

    this.foldersEstratte.forEach(currentFolder => {
      const splitBySlash: string[] = currentFolder.split('/');
      this.mapFolderWithCategorieESottoCategorie[currentFolder] = splitBySlash;
    });

    this.categorieNew = this.getRootParents(this.mapFolderWithCategorieESottoCategorie);
  }

  /** Estraggo tutti i padri (primo segmento) unici. */
  getRootParents(map: { [folderKey: string]: string[] }): string[] {
    const out: string[] = [];
    for (const segs of Object.values(map)) {
      const first = segs[0];
      if (first && !out.includes(first)) out.push(first);
    }
    return out;
  }

  /** Ritorno tutti i figli diretti di un certo path. */
  getChildrenPaths(
    map: { [folderKey: string]: string[] },
    currentPath: string
  ): string[] {
    const parts = currentPath ? currentPath.split('/') : [];
    const depth = parts.length;
    const out: string[] = [];

    for (const segs of Object.values(map)) {
      if (segs.length <= depth) continue;

      let ok = true;
      for (let i = 0; i < depth; i++) {
        if (segs[i] !== parts[i]) { ok = false; break; }
      }
      if (!ok) continue;

      const childSegment = segs[depth];
      const childPath = depth === 0 ? childSegment : currentPath + '/' + childSegment;
      if (!out.includes(childPath)) out.push(childPath);
    }
    return out;
  }

  /**
   * Gestisco il click su una categoria:
   * - se ha figli, espando/chiudo il ramo
   * - se è una foglia, navigo e chiudo il menu
   */
  saveCategoriaAndToggle(categoriaCorrente: string): void {
    if (this.categoriaEspansaPath === categoriaCorrente) {
      this.categoriaEspansaPath = '';
      return;
    }

    const figli = this.getChildrenPaths(this.mapFolderWithCategorieESottoCategorie, categoriaCorrente);
    if (figli.length > 0) {
      this.categoriaEspansaPath = categoriaCorrente;
    } else {
      // Foglia: navigo e chiudo il drawer
      this.goToAndCloseSideNav(categoriaCorrente);
    }
  }

  /** True se `path` è esattamente quello espanso o un suo antenato. */
  isPathOpen(path: string): boolean {
    if (!path) return false;
    return this.categoriaEspansaPath === path
        || this.categoriaEspansaPath.startsWith(path + '/');
  }

  /** Utility: normalizzo un path o un segmento. */
  private normalizePath(input: string): string {
    return (input ?? '')
      .trim()
      .toLowerCase()
      .replace(/\/+/g, '/')
      .replace(/^\/|\/$/g, '');
  }

  /**
   * Navigazione generica.
   * - Le route supportano fino a due segmenti di path.
   * - Dal terzo segmento in poi trasformo i segmenti in query param "filtri".
   */
  goTo(pathOrCategoria: string, sottoCategoria?: string, filtri?: Record<string, string[]>): void {
    const staticRoutes = ['/home', '/recensioni', '/contatti', '/chi-siamo'];
    const firstArgTrim = (pathOrCategoria ?? '').trim();

    // Rotte statiche
    if (staticRoutes.includes(firstArgTrim)) {
      this.router.navigate([firstArgTrim], { queryParams: { filtri: ['Tutte'] } });
      return;
    }

    // Costruzione segmenti
    let segments: string[];
    if (!sottoCategoria && firstArgTrim.includes('/')) {
      const pathNudo = this.normalizePath(firstArgTrim);
      segments = pathNudo.split('/').filter(Boolean);
    } else {
      const cat = this.normalizePath(firstArgTrim);
      const sub = this.normalizePath(sottoCategoria ?? '');
      segments = sub ? [cat, sub] : [cat];
    }

    // Fino a 2 segmenti nel path
    const pathSegments = segments.slice(0, 2);

    // Dal terzo segmento in poi come filtri
    const extraFilterSegments = segments.slice(2);
    const filtriBase = extraFilterSegments.length > 0 ? extraFilterSegments : [];

    // Merge con eventuali filtri per chiave
    const lastRealSegment = pathSegments[pathSegments.length - 1] ?? '';
    const filtriDaRecord = filtri?.[lastRealSegment] ?? [];
    const filtriFinali = Array.from(new Set([
      ...filtriBase.filter(Boolean),
      ...filtriDaRecord.filter(Boolean)
    ]));

    this.router.navigate(['/', ...pathSegments], {
      queryParams: filtriFinali.length ? { filtri: filtriFinali } : {}
    });
  }

  /**
   * Naviga e chiude il sidenav.
   * - Vale sia per mobile (over) sia per desktop (side).
   */
  goToAndCloseSideNav(pathOrCategoria: string, sottoCategoria?: string): void {
    // 1) Navigo rispettando la regola dei 2 livelli + filtri
    this.goTo(pathOrCategoria, sottoCategoria);

    // 2) Chiudo il drawer e riallineo lo stato
    this.sidenav?.close();
    this.mobileMenuOpen = false;
    this.desktopSidenavOpen = false;
  }

  /* ==========================================================
     VARIE UTILITY UI
     ========================================================== */

  /** Capitalizzo la prima lettera di una stringa. */
  capitalizeFirstLetter(text: string): string {
    if (!text) return '';
    return text.charAt(0).toUpperCase() + text.slice(1);
  }

  /** Logout modalità admin. */
  logoutAdmin(): void {
    this.sharedDataService.setAdminToken(null);
    this.isAdmin = false;
  }

  /** Chiamo l'endpoint di refresh cache e mostro uno snackbar di esito. */
  refreshCache(): void {
    this.isRefreshing = true;
    this.adminService.refreshCache().subscribe({
      next: (data) => {
        this.isRefreshing = false;
        console.log('Cache aggiornata:', data);
        this.mostraMessaggioSnakBar('Cache aggiornata con successo', false);
        this.sharedDataService.notifyCacheIsChanged();
      },
      error: (err) => {
        this.isRefreshing = false;
        console.error('Errore durante il refresh della cache:', err);
        this.mostraMessaggioSnakBar('Errore durante il refresh della cache ', true);
      }
    });
  }

  /** Wrapper comodo per lo snackbar con stile ok/errore. */
  mostraMessaggioSnakBar(messaggio: string, isError: boolean): void {
    const panelClassCustom = isError ? 'snackbar-errore' : 'snackbar-ok';
    const duration = isError ? 1000 : 500;

    this.snackBar.open(messaggio, 'Chiudi', {
      duration,
      panelClass: panelClassCustom,
      horizontalPosition: 'center',
      verticalPosition: 'top'
    });
  }

  /** Apro il popup gestione cartelle: consentito solo se admin e non in mobile. */
  apriAdminFolderPopUp(): void {
    if (this.isMobile) return; // admin disabilitato su mobile
    if (!this.isAdmin) return;

    this.dialog.open(AdminFolderPopUpComponent, {
      disableClose: false,
      panelClass: 'popup-admin-folder',
      data: { isConfig: false }
    });
  }
}
