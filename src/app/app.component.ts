import { Component, OnInit, NgZone, ChangeDetectorRef } from '@angular/core';
import { RouterOutlet, Router } from '@angular/router';
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
    MatSidenavModule
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
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

  // Controllo barra di ricerca
  searchControl = new FormControl('');

  // Suggerimenti per autocomplete
  filteredOpzioni: string[] = [];

  // True se siamo su un dispositivo mobile
  isMobile = false;

  // Stato apertura menu mobile
  mobileMenuOpen = false;

  constructor(
    private router: Router,
    private cloudinaryService: CloudinaryService,
    private zone: NgZone,
    private cdr: ChangeDetectorRef
  ) {}

  menuRefs: { [categoria: string]: any } = {};

setMenuRef(categoria: string, ref: any): boolean {
  this.menuRefs[categoria] = ref;
  return true;
}

  ngOnInit(): void {
    // Inizializza menuMap con nomi unici per i menu (es. Borse → menu_Borse)
this.menuMap = {};
this.categorie.forEach(categoria => {
  this.menuMap[categoria] = `menu_${categoria}`;
});

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
        this.categorieSottoCategorie = Object.keys(data);

        // Estrai le categorie principali (escludi "recensioni")
        this.categorie = [
          ...new Set(
            this.categorieSottoCategorie
              .map(k => k.split('/')[0])
              .filter(c => c.toLowerCase() !== 'recensioni')
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
    }

    const filtriAttivi = sottoCategoria && filtri ? filtri[sottoCategoria] : undefined;
    const queryParams = filtriAttivi?.length ? { filtri: filtriAttivi } : {};


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
