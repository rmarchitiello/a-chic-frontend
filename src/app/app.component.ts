import { Component, OnInit, NgZone, ChangeDetectorRef } from '@angular/core';
import { RouterOutlet, Router,NavigationEnd   } from '@angular/router';
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
  strutturaCategorie: { [key: string]: string[] } = {};


    // Mappa sottocategorie → sottoSottoCategorie(filtri)
  strutturaSottoCategorie: { [key: string]: string[] } = {};


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

//gestione del cms, setto prima a false cosi quando carico il sito normale vedo tutto il sito
isCmsAttivo = false;

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

  ) {

    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      this.isHomeRoute = event.urlAfterRedirects === '/home';
    });
    
  }

  menuRefs: { [categoria: string]: any } = {};

  goToContatti(contatti: string){
        this.router.navigate([contatti]);

  }

  //dato che se ho la categoria e la sottoCategoria e devo fare questo controllo         (click)="(filtriSottoCategorie[sotto] && filtriSottoCategorie[sotto].length > 0) ? toggleSottoCategoria(sotto) : goTo(categoria, sotto)"
  //html non mi permette di aggiungere sindav.close quindi per chiuderla ho creato un metodo se c e categoria e sottocategoria vai e chiudi sidenav
goToAndCloseSideNav(categoria: string, sottoCategoria?: string ){
    if(categoria && sottoCategoria){
      this.goTo(categoria,sottoCategoria);
    }
    else{
      this.goTo(categoria);
    }
    this.sidenav.close();

    
}

  goToCookie(cookies: string){
    this.router.navigate([cookies]);
  }

   goToPrivacy(privacyes: string){
    this.router.navigate([privacyes]);
  }

setMenuRef(categoria: string, ref: any): boolean {
  this.menuRefs[categoria] = ref;
  return true;
}

  ngOnInit(): void {


    this.breakpointObserver
    .observe(['(max-width: 768px)'])
    .subscribe(result => {
      this.isMobile = result.matches;
    });
    console.log("Verifica se e cms");

    //verifica url iniziale perche is cms è false prima volta
      this.isCmsAttivo = this.router.url.startsWith('/cms');
    console.log("Iniziale isCmsAttivo?", this.isCmsAttivo);

    //acolto i successivi cambiamenti di rotta
  this.router.events
    .pipe(filter(event => event instanceof NavigationEnd))
    .subscribe((event: any) => {
      this.isCmsAttivo = event.url.startsWith('/cms');
      console.log("NavigationEnd isCmsAttivo?", this.isCmsAttivo);
    });

        console.log("cms attivo ? ", this.isCmsAttivo);
    console.log("...FLUSSO INIZIATO...")


    // Inizializza menuMap con nomi unici per i menu (es. Borse → menu_Borse)
this.menuMap = {};
this.categorie.forEach(categoria => {
  this.menuMap[categoria] = `menu_${categoria}`;
});
console.log("menu map" , this.menuMap)
    this.isMobile = window.innerWidth <= 768;

    // Rileva cambiamento di larghezza finestra
    window.addEventListener('resize', () => {
      this.zone.run(() => {
        this.isMobile = window.innerWidth <= 768;
        this.cdr.detectChanges();
      });
    });

    // Carica struttura immagini e categorie
    this.cloudinaryService.getImmagini().subscribe({
      next: (data: Record<string, any[]>) => {
        console.log("data service, ", data)
        this.categorieSottoCategorie = Object.keys(data);

        // Estrai le categorie principali (escludi "recensioni") cosi non lo metto nelle categorie
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


        // Estrai tutte le sotto-categorie uniche
        this.sottoCategorie = [
          ...new Set(
            this.categorieSottoCategorie
              .map(k => k.split('/'))
              .filter(parts => parts.length > 1 && parts[1].trim() !== '' && parts[1].toLowerCase() !== 'recensioni')
              .map(parts => parts[1])
          )
        ];

        // Crea la struttura dei filtri (sottocategoria → dettagli)
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

        // Converte ogni Set in array
        Object.keys(tempFiltri).forEach(key => {
          this.filtriSottoCategorie[key] = Array.from(tempFiltri[key]);
        });
        console.log("filtri sott: ", this.filtriSottoCategorie)

        // Costruisci struttura: categoria → sottocategorie
        const struttura: Record<string, Set<string>> = {};
        this.categorieSottoCategorie.forEach(item => {
          const [cat, sotto] = item.split('/');
          if (cat.toLowerCase() === 'recensioni') return;
          if (!struttura[cat]) struttura[cat] = new Set();
          if (sotto) struttura[cat].add(sotto);
        });

        for (const cat in struttura) {
          this.strutturaCategorie[cat] = Array.from(struttura[cat]);
        }
        console.log("strutturaaa: ", this.filtriSottoCategorie);

        // Inizializza filtro autocomplete
        this.searchControl.valueChanges.subscribe(val => {
          const valore = val?.toLowerCase() || '';
          this.filteredOpzioni = this.categorieSottoCategorie.filter(opt =>
            opt.toLowerCase().includes(valore)
          );
        });
      },
      error: (err) => {
        console.error('Errore nel caricamento delle immagini', err);
      }
    });
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
        console.log("aaaa", this.filtriSottoCategorie)
        console.log("path costruito: ", path);
    }

    const filtriAttivi = sottoCategoria && filtri ? filtri[sottoCategoria] : undefined;
    console.log("i filtri attivi sono: ", filtriAttivi);
    const queryParams = filtriAttivi?.length
        ? { filtri: ['Tutte', ...filtriAttivi] }
        : { filtri: ['Tutte'] };

    this.router.navigate([path], { queryParams });
  }
  
  goToMobileQueryParamFilter(categoria: string, sottoCategoria?: string, filtro?: string){
    let path: string;

    path = sottoCategoria
        ? `/${categoria.toLowerCase()}/${sottoCategoria.toLowerCase()}`
        : `/${categoria.toLowerCase()}`;

        const queryParams = filtro?.length ? { filtri: filtro } : {};
        console.log("Url filter invocato: ", path, "query param: ", queryParams);
        this.router.navigate([path], { queryParams });
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
