import { Component, OnInit, NgZone, ChangeDetectorRef } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { CloudinaryService } from './services/cloudinary.service';
import { MatSidenavModule } from '@angular/material/sidenav';
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
import {
  trigger,
  state,
  style,
  animate,
  transition
} from '@angular/animations';
import { ViewChild } from '@angular/core';
import { MatSidenav } from '@angular/material/sidenav';
import { FooterComponent } from './pages/footer/footer.component';
import { HeaderComponent } from './pages/header/header.component';
import { filter } from 'rxjs/operators';
import { BreakpointObserver } from '@angular/cdk/layout';
import { LiveChatComponent } from './pages/live-chat/live-chat.component';
import { SharedDataService } from './services/shared-data.service';
import { MediaCollection } from './pages/home/home.component';
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
    LiveChatComponent
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
  @ViewChild('sidenav') sidenav!: MatSidenav;
  @ViewChild('sidenavDesktop') sidenavDesktop!: MatSidenav;

  isAdmin: boolean = false;


  title = 'a-chic';
  // Mappa per collegare categoria → nome riferimento mat-menu
  menuMap: { [categoria: string]: string } = {};

  // Tutte le combinazioni categoria/sottocategoria (es. "Borse/Clutch")
  categorieSottoCategorie: string[] = [];

  // Lista categorie principali (es. "Borse", "Accessori")
  categorie: string[] = [];

  // Sottocategorie uniche (es. "Clutch", "Conchiglia")
  sottoCategorie: string[] = [];

  // Filtri associati alle sottocategorie (es. Clutch: ["Paillettes"])
  filtriSottoCategorie: Record<string, string[]> = {};

  // Mappa categoria → sottocategorie
  strutturaCategorie: { [key: string]: string[] | undefined } = {};


  // Mappa sottocategorie → sottoSottoCategorie(filtri)
  strutturaSottoCategorie: { [key: string]: string[] | undefined } = {};


  // Controllo barra di ricerca
  searchControl = new FormControl('');

  // Suggerimenti per autocomplete
  filteredOpzioni: string[] = [];

  // True se siamo su un dispositivo mobile
  isMobile = false;

  // Stato apertura menu mobile
  mobileMenuOpen = false;

  // traccio quale categoria è espansa 
  categoriaEspansa: string | null = null;

  desktopSidenavOpen = false; // chiusa all'inizio


  //i filtri delle sottocategorie
  sottoCategoriaEspansa: string | null = null;


  toggleCategoria(cat: string): void {
    this.categoriaEspansa = this.categoriaEspansa === cat ? null : cat;
    this.sottoCategoriaEspansa = null; // reset quando cambio categoria
  }

  toggleSottoCategoria(sotto: string): void {
    this.sottoCategoriaEspansa = this.sottoCategoriaEspansa === sotto ? null : sotto;
  }

  isHomeRoute = false;

  constructor(
    private router: Router,
    private cloudinaryService: CloudinaryService,
    private zone: NgZone,
    private cdr: ChangeDetectorRef,
    private breakpointObserver: BreakpointObserver,
    private sharedDataService: SharedDataService

  ) {

    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      this.isHomeRoute = event.urlAfterRedirects === '/home';
    });

  }

  ngAfterViewInit() {
    console.log('[APP] ViewChild sidenav:', this.sidenav);
    console.log('[APP] ViewChild sidenavDesktop:', this.sidenavDesktop);
  }


  //per chiudere la sidenav dal figlio ovvero dettagli e cloudinary component, ovvero dettagli emette l evento al figlio cloudinry che emetto l evento a app component 
  chiudiSidenavDaFiglio(): void {
    if (this.sidenav) this.sidenav.close();
    if (this.sidenavDesktop) this.sidenavDesktop.close();
  }





  menuRefs: { [categoria: string]: any } = {};

  goToContatti(contatti: string) {
    this.router.navigate([contatti]);

  }

  //dato che se ho la categoria e la sottoCategoria e devo fare questo controllo         (click)="(filtriSottoCategorie[sotto] && filtriSottoCategorie[sotto].length > 0) ? toggleSottoCategoria(sotto) : goTo(categoria, sotto)"
  //html non mi permette di aggiungere sindav.close quindi per chiuderla ho creato un metodo se c e categoria e sottocategoria vai e chiudi sidenav
  goToAndCloseSideNav(categoria: string, sottoCategoria?: string) {


    if (categoria && sottoCategoria) {
      this.goTo(categoria, sottoCategoria);
    }
    else {
      this.goTo(categoria);
    }


    if (this.sidenavDesktop) this.sidenavDesktop.close(); // questo attiverà (closed)
    if (this.sidenav) this.sidenav.close(); // per mobile
    this.desktopSidenavOpen = false;


  }

  goToCookie(cookies: string) {
    this.router.navigate([cookies]);
  }

  goToPrivacy(privacyes: string) {
    this.router.navigate([privacyes]);
  }

  setMenuRef(categoria: string, ref: any): boolean {
    this.menuRefs[categoria] = ref;
    return true;
  }

  isPaginaCloudinaryAttiva = false;
  Array = Array;

  logoutAdmin(): void {
    // Rimuove il flag di login admin dal localStorage
    sessionStorage.removeItem('admin');

    // Forza il ricaricamento della pagina per uscire dalla modalità admin
    window.location.reload();
  }


  ngOnInit(): void {

    this.sharedDataService.isAdmin$.subscribe((token: string | null) => {
      this.isAdmin = !!token; // true se c'è un token, false se null

      if (this.isAdmin) {
      }
    });


    // Osserva la larghezza dello schermo per determinare se siamo su mobile
    this.breakpointObserver
      .observe(['(max-width: 768px)'])
      .subscribe(result => {
        this.isMobile = result.matches;
      });

    // Rileva dimensioni iniziali della finestra (fallback)
    this.isMobile = window.innerWidth <= 768;

    // Aggiungi un listener per aggiornare `isMobile` in tempo reale al resize
    window.addEventListener('resize', () => {
      this.zone.run(() => {
        this.isMobile = window.innerWidth <= 768;
        this.cdr.detectChanges(); // forza aggiornamento del binding
      });
    });


    // Ascolta i cambi di rotta per aggiornare dinamicamente  e `isPaginaCloudinaryAttiva`
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        const url = event.urlAfterRedirects.toLowerCase();


        // Verifica se siamo su una pagina Cloudinary (cioè una route che contiene una categoria)
        const matchCategoria = this.categorie.some(cat =>
          url.includes(`/${cat.toLowerCase()}`)
        );
        this.isPaginaCloudinaryAttiva = matchCategoria;

        // Verifica se siamo in home per eventuali personalizzazioni
        this.isHomeRoute = url === '/home';

      });

    //carico la config cache infatti cache e true e la passo via subject alla home ed a altri component
    console.log("Sto chiamando la cache config")
this.cloudinaryService.getImmagini('', true).subscribe({
  next: (data: MediaCollection[]) => {
    if ( data.length > 0) {
      console.log("[AppComponent] Carico le configurazioni e invio al subscribe perché ci sono i dati: ", data);

      // Inoltro i dati al servizio condiviso
      this.sharedDataService.setAllMediasCollectionsConfig(data);
    } else {
      console.warn("[AppComponent] Nessun dato disponibile dalla cache");
    }
  },
  error: err => console.error('Errore durante il caricamento media:', err)
});


    //riceve la notifica da altri component e re invia la cache config
this.sharedDataService.configCacheChanged$.subscribe(() => {
  console.log("Ho ricevuto la notifica ricarico i media")
  // Quando ricevo la notifica, rileggo la cache aggiornata
      this.cloudinaryService.getImmagini('', true).subscribe({
      next: (data: MediaCollection[]) => {
          console.log("I dati sono: ",data);
        console.log("[AppComponent] Carico le configurazioni e invio al subscribe: ", data);
        this.sharedDataService.setAllMediasCollectionsConfig(data);



      },
      error: err => console.error('Errore caricamento media', err)
    });
});


    // Richiama il servizio per ottenere le immagini e costruire la struttura dinamica
    this.cloudinaryService.getImmagini().subscribe({
      next: (data: Record<string, any[]>) => {
        console.log("[AppComponent] Carico i media non config", data);

        // Ottieni tutte le combinazioni categoria/sottocategoria
        this.categorieSottoCategorie = Object.keys(data);

        // Estrai categorie principali (escludendo 'recensioni' e 'carosello')
        this.categorie = [
          ...new Set(
            this.categorieSottoCategorie
              .map(k => k.split('/')[0])
              .filter(c => {
                const lower = c.toLowerCase();
                return lower !== 'recensioni' && lower !== 'carosello';
              })
          )
        ];

        // Estrai tutte le sottocategorie uniche
        this.sottoCategorie = [
          ...new Set(
            this.categorieSottoCategorie
              .map(k => k.split('/'))
              .filter(parts => parts.length > 1 && parts[1].trim() !== '' && parts[1].toLowerCase() !== 'recensioni')
              .map(parts => parts[1])
          )
        ];

        // Costruisci la mappa dei filtri per ogni sottocategoria
        const tempFiltri: Record<string, Set<string>> = {};
        this.categorieSottoCategorie.forEach(item => {
          const parts = item.split('/');
          if (parts.length === 3 && parts[1].toLowerCase() !== 'recensioni') {
            const sotto = parts[1];
            const dettaglio = parts[2];
            if (!tempFiltri[sotto]) {
              tempFiltri[sotto] = new Set();
            }
            tempFiltri[sotto].add(dettaglio);
          }
        });
        // Converti ogni set in array
        Object.keys(tempFiltri).forEach(key => {
          this.filtriSottoCategorie[key] = Array.from(tempFiltri[key]);
        });


        // Costruisci la struttura categoria → sottocategorie
        const struttura: Record<string, Set<string>> = {};
        this.categorieSottoCategorie.forEach(item => {
          const [cat, sotto] = item.split('/');
          if (cat.toLowerCase() === 'recensioni') return;
          if (!struttura[cat]) struttura[cat] = new Set();
          if (sotto) struttura[cat].add(sotto);
        });

        // Trasforma i Set in array
        for (const cat in struttura) {
          this.strutturaCategorie[cat] = Array.from(struttura[cat]);
        }


        // Inizializza l'autocomplete per la barra di ricerca
        this.searchControl.valueChanges.subscribe(val => {
          const valore = val?.toLowerCase() || '';
          this.filteredOpzioni = this.categorieSottoCategorie.filter(opt =>
            opt.toLowerCase().includes(valore)
          );
        });

        //passo i dati condivisi cosi l'altro component fa il subscribe e legge queste variabili
        this.sharedDataService.setStrutturaCategorie(this.strutturaCategorie);
        this.sharedDataService.setCategorieSottoCategorie(this.categorieSottoCategorie);
        this.sharedDataService.setFiltriSottoCategorie(this.filtriSottoCategorie);


        // Costruisci dinamicamente la mappa per i mat-menu (menuMap)
        this.menuMap = {};
        this.categorie.forEach(categoria => {
          this.menuMap[categoria] = `menu_${categoria}`;
        });
      },
      error: (err) => {
        console.error('Errore nel caricamento delle immagini', err);
      }
    });







  }

  desktopSidenavOpenFun() {
    window.scrollTo({ top: 0, behavior: 'smooth' });

    if (!this.desktopSidenavOpen) {
      this.desktopSidenavOpen = true;
    }
    else {
      this.desktopSidenavOpen = false;
    }
  }

  // Navigazione generica (sia link statici che dinamici)
  goTo(categoria: string, sottoCategoria?: string, filtri?: Record<string, string[]>): void {
    let path: string;

    if (
      categoria === '/home' ||
      categoria === '/recensioni' ||
      categoria === '/contatti' ||
      categoria === '/chi-siamo'
    ) {
      path = categoria;
    } else {
      path = sottoCategoria
        ? `/${categoria.toLowerCase()}/${sottoCategoria.toLowerCase()}`
        : `/${categoria.toLowerCase()}`;


    }

    const filtriAttivi = sottoCategoria && filtri ? filtri[sottoCategoria] : undefined;
    const queryParams = filtriAttivi?.length
      ? { filtri: ['Tutte', ...filtriAttivi] }
      : { filtri: ['Tutte'] };

    this.router.navigate([path], { queryParams });
  }

  goToMobileQueryParamFilter(categoria: string, sottoCategoria?: string, filtro?: string) {
    let path: string;

    path = sottoCategoria
      ? `/${categoria.toLowerCase()}/${sottoCategoria.toLowerCase()}`
      : `/${categoria.toLowerCase()}`;

    const queryParams = filtro?.length ? { filtri: filtro } : {};

    this.router.navigate([path], { queryParams });

    if (this.sidenavDesktop) this.sidenavDesktop.close(); // questo attiverà (closed)
    if (this.sidenav) this.sidenav.close(); // per mobile
    this.desktopSidenavOpen = false;

  }




  // Selezione autocomplete
  vaiAllaCategoria(percorso: string): void {
    const [categoria, sotto] = percorso.split('/');
    this.goTo(categoria, sotto);
  }

  // Toggle menu mobile (in caso di implementazione futura con sidenav)
  toggleMobileMenu(): void {
    this.mobileMenuOpen = !this.mobileMenuOpen;
  }
}
