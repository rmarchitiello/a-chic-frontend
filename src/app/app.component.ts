import { Component, OnInit, NgZone, ChangeDetectorRef, ViewChild } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { CloudinaryService } from './services/cloudinary.service';
import { MatSidenavModule, MatSidenav } from '@angular/material/sidenav';
import { FormsModule, ReactiveFormsModule, FormControl } from '@angular/forms';
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
    TopBannerComponent
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
export class AppComponent implements OnInit {

  // Riferimenti ai due sidenav (mobile e desktop)
  @ViewChild('sidenav') sidenav!: MatSidenav;
  @ViewChild('sidenavDesktop') sidenavDesktop!: MatSidenav;

  // Stato modalità admin
  isAdmin: boolean = false;

  // True se siamo su un dispositivo mobile
  isMobile = false;

  // Stato apertura menu mobile
  mobileMenuOpen = false;

  // Stato apertura menu desktop
  desktopSidenavOpen = false;

  // Path della categoria attualmente espansa (gestisce tutti i livelli)
  categoriaEspansaPath: string = '';

  // Array delle cartelle trovate nel caricamento (path completi)
  foldersEstratte: string[] = [];

  // Mappa cartella → array segmenti (es. "borse/conchiglia/perlata" → ["borse","conchiglia","perlata"])
  mapFolderWithCategorieESottoCategorie: { [folderKey: string]: string[] } = {};

  // Lista categorie di primo livello (padri)
  categorieNew: string[] = [];

  // Flag per verificare se siamo nella homepage
  isHomeRoute = false;

  constructor(
    private router: Router,
    private cloudinaryService: CloudinaryService,
    private zone: NgZone,
    private cdr: ChangeDetectorRef,
    private breakpointObserver: BreakpointObserver,
    private sharedDataService: SharedDataService,
    private dialog: MatDialog,
    private adminService: AdminService,
    private snackBar: MatSnackBar
  ) {
    // Monitoraggio della route per sapere se siamo in /home
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      this.isHomeRoute = event.urlAfterRedirects === '/home';
    });
  }

  ngOnInit(): void {
    // Sottoscrizione allo stato admin
    this.sharedDataService.isAdmin$.subscribe((isAdmin: boolean) => {
  this.isAdmin = isAdmin;
});

    // Rilevamento modalità mobile in base alla larghezza dello schermo
    this.breakpointObserver
      .observe(['(max-width: 768px)'])
      .subscribe(result => {
        this.isMobile = result.matches;
      });

    // Primo caricamento media (config + no config)
    this.caricaMediaFromCache(true);
    this.caricaMediaFromCache(false);

    // Ricarico media ogni volta che il servizio segnala un cambio
    this.sharedDataService.allCacheChanged$.subscribe(() => {
      this.caricaMediaFromCache(true);
      this.caricaMediaFromCache(false);
    });
      console.log("IsAdmin?: ", this.isAdmin);
      console.log("IsMobile?: ", this.isMobile);
  }

  // Chiude entrambe le sidenav (richiamabile dai figli)
  chiudiSidenavDaFiglio(): void {
    if (this.sidenav) this.sidenav.close();
    if (this.sidenavDesktop) this.sidenavDesktop.close();
  }

  // Caricamento media dalla cache
  caricaMediaFromCache(config: boolean) {
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

  // Calcola la mappa e i padri
  calcolaCategoriePiuSottoCategorieEAltre(entryMedias: MediaCollection[]) {
    this.foldersEstratte = [];
    this.mapFolderWithCategorieESottoCategorie = {};

    // Estraggo tutti i path cartella
    entryMedias.forEach(media => {
      if (media?.folder) {
        this.foldersEstratte.push(media.folder.toLocaleLowerCase());
      }
    });

    // Costruisco la mappa
    this.foldersEstratte.forEach(currentFolder => {
      const splitBySlash: string[] = currentFolder.split('/');
      this.mapFolderWithCategorieESottoCategorie[currentFolder] = splitBySlash;
    });

    // Ricavo le categorie di primo livello
    this.categorieNew = this.getRootParents(this.mapFolderWithCategorieESottoCategorie);
  }

  // Estrae tutti i padri (primo segmento) unici
  getRootParents(map: { [folderKey: string]: string[] }): string[] {
    const out: string[] = [];
    for (const segs of Object.values(map)) {
      const first = segs[0];
      if (first && !out.includes(first)) out.push(first);
    }
    return out;
  }

  // Ritorna tutti i figli diretti di un certo path
  getChildrenPaths(
    map: { [folderKey: string]: string[] },
    currentPath: string
  ): string[] {
    const parts = currentPath ? currentPath.split("/") : [];
    const depth = parts.length;
    const out: string[] = [];

    for (const segs of Object.values(map)) {
      if (segs.length <= depth) continue;

      let ok = true;
      for (let i = 0; i < depth; i++) {
        if (segs[i] !== parts[i]) {
          ok = false;
          break;
        }
      }
      if (!ok) continue;

      const childSegment = segs[depth];
      const childPath = depth === 0 ? childSegment : currentPath + "/" + childSegment;
      if (!out.includes(childPath)) out.push(childPath);
    }
    return out;
  }

  // Salva la categoria cliccata e gestisce espansione/chiusura
  saveCategoriaAndToggle(categoriaCorrente: string) {
    console.log("Categoria cliccata: ", categoriaCorrente);
    if (this.categoriaEspansaPath === categoriaCorrente) {
      this.categoriaEspansaPath = "";
      return;
    }
    const figli = this.getChildrenPaths(this.mapFolderWithCategorieESottoCategorie, categoriaCorrente);
    if (figli.length > 0) {
      this.categoriaEspansaPath = categoriaCorrente;
    } else {
            console.log("Navigo")

      // È una foglia: qui puoi decidere se navigare
      this.goToAndCloseSideNav(categoriaCorrente);
    }
  }

  // Aperto se path è esattamente quello espanso oppure un suo antenato
isPathOpen(path: string): boolean {
  if (!path) return false;
  return this.categoriaEspansaPath === path
      || this.categoriaEspansaPath.startsWith(path + '/');
}


  // Apre/chiude la sidenav desktop
  desktopSidenavOpenFun() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    this.desktopSidenavOpen = !this.desktopSidenavOpen;
  }

/** Normalizza un path o un segmento:
 *  - trim, minuscole
 *  - comprime slash doppi
 *  - rimuove slash iniziale/finale
 */
private normalizePath(input: string): string {
  return (input ?? '')
    .trim()
    .toLowerCase()
    .replace(/\/+/g, '/')
    .replace(/^\/|\/$/g, '');
}

/** Navigazione generica.
 *  NOTA DI PROGETTO: la configurazione delle route Angular supporta fino al SECONDO livello:
 *    /:categoria
 *    /:categoria/:sottoCategoria
 *  Dal TERZO livello in poi, i segmenti vengono passati come query param "filtri".
 *
 *  Accetta:
 *   - path completo:          goTo('borse/conchiglia/perlata/estiva')
 *   - categoria sola:         goTo('borse')
 *   - categoria+sottocat:     goTo('borse', 'conchiglia')
 *   - rotte statiche:         goTo('/home')
 *
 *  Il parametro "filtri" (opzionale) può aggiungere altri filtri mappati per chiave.
 *  Gli eventuali segmenti oltre il secondo vengono SEMPRE aggiunti a query param "filtri".
 */
goTo(pathOrCategoria: string, sottoCategoria?: string, filtri?: Record<string, string[]>): void {
  // 1) Rotte statiche: navigazione diretta
  const staticRoutes = ['/home', '/recensioni', '/contatti', '/chi-siamo'];
  const firstArgTrim = (pathOrCategoria ?? '').trim();
  if (staticRoutes.includes(firstArgTrim)) {
    this.router.navigate([firstArgTrim], { queryParams: { filtri: ['Tutte'] } });
    return;
  }

  // 2) Normalizzazione input: costruisco l'elenco segmenti
  //    - Se passo un path completo (con '/'), lo parso in segmenti
  //    - Altrimenti uso categoria (+ opzionale sottocategoria)
  let segments: string[];
  if (!sottoCategoria && firstArgTrim.includes('/')) {
    const pathNudo = this.normalizePath(firstArgTrim);
    segments = pathNudo.split('/').filter(Boolean);
  } else {
    const cat = this.normalizePath(firstArgTrim);
    const sub = this.normalizePath(sottoCategoria ?? '');
    segments = sub ? [cat, sub] : [cat];
  }

  // 3) Rispetto le route: prendo al massimo i primi due segmenti per il path
  const pathSegments = segments.slice(0, 2);
  //    Dal terzo segmento in poi diventano filtri
  const extraFilterSegments = segments.slice(2);

  // 4) Costruzione dei query param "filtri"
// Se ci sono segmenti extra (dal terzo in poi), uso solo quelli
// Altrimenti nessun filtro
const filtriBase = extraFilterSegments.length > 0
  ? extraFilterSegments
  : [];

  //    Se mi passano anche "filtri" (Record<chiave, string[]>), aggiungo quelli della chiave
  //    identificata dall'ultimo segmento "reale" del path (categoria o sottocategoria se presente)
  const lastRealSegment = pathSegments[pathSegments.length - 1] ?? '';
  const filtriDaRecord = filtri?.[lastRealSegment] ?? [];

  //    Query params finali, evitando duplicati e vuoti
  const filtriFinali = Array.from(new Set([...filtriBase.filter(Boolean), ...filtriDaRecord.filter(Boolean)]));

  // 5) Navigazione: uso i segmenti (1 o 2) come path, filtri come query param
  //    Esempi:
  //    - ["borse"]                           -> /borse?filtri=Tutte
  //    - ["borse","conchiglia"]              -> /borse/conchiglia?filtri=Tutte
  //    - ["borse","conchiglia"], extra "perlata" -> /borse/conchiglia?filtri=Tutte&filtri=perlata
this.router.navigate(['/', ...pathSegments], {
  queryParams: filtriFinali.length ? { filtri: filtriFinali } : {}
});
}

/** Naviga e chiude le sidenav.
 *  NOTA: accetta sia un path completo (un solo argomento) sia coppia categoria/sottocategoria.
 *  Ricorda: le route supportano fino al secondo livello; tutto oltre va nei query param "filtri".
 */
goToAndCloseSideNav(pathOrCategoria: string, sottoCategoria?: string): void {
  // Esegue la navigazione rispettando la regola dei 2 livelli + filtri
  this.goTo(pathOrCategoria, sottoCategoria);

  // Chiude entrambe le sidenav (desktop e mobile) se presenti
  this.sidenavDesktop?.close();
  this.sidenav?.close();

  // Allinea lo stato del toggle desktop
  this.desktopSidenavOpen = false;
}


  // Utility per capitalizzare testo
  capitalizeFirstLetter(text: string): string {
    if (!text) return '';
    return text.charAt(0).toUpperCase() + text.slice(1);
  }

  // Logout modalità admin
  logoutAdmin(): void {
    this.sharedDataService.setAdminToken(null);
    this.isAdmin = false;
  }
isRefreshing: boolean = false;
refreshCache() {
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


  mostraMessaggioSnakBar(messaggio: string, isError: boolean) {
    let panelClassCustom;
    let duration;
    if (isError) {
      panelClassCustom = 'snackbar-errore';
      duration = 1000;
    }
    else {
      panelClassCustom = 'snackbar-ok';
      duration = 500;
    }
    this.snackBar.open(messaggio, 'Chiudi', {
      duration: duration, // durata in ms
      panelClass: panelClassCustom, // classe CSS personalizzata
      horizontalPosition: 'center',
      verticalPosition: 'top'
    });
  }

apriAdminFolderPopUp(): void {
  if (this.isMobile) return;        // admin disabilitato su mobile
  if (!this.isAdmin) return;

  // Normalizzo un minimo (trim, rimozione slash doppi, dedup, sort)
  
  this.dialog.open(AdminFolderPopUpComponent, {
    disableClose: false,
    panelClass: 'popup-admin-folder', // o una tua classe dedicata
    data: {isConfig: false}
  });
}


}
