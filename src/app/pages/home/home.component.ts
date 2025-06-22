import {
  Component,
  OnInit,
  OnDestroy
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
import { Router } from '@angular/router';
import { CloudinaryService } from '../../services/cloudinary.service';
import { BreakpointObserver } from '@angular/cdk/layout';



@Component({
  selector: 'app-home',
  standalone: true,
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule,
    MatCardModule
  ],
animations: [
  trigger('fadeInOut', [
    transition(':enter', [
      style({ opacity: 0 }),
      animate('2000ms ease-out', style({ opacity: 1 })),
    ]),
    transition(':leave', [
      animate('2000ms ease-out', style({ opacity: 0 })),
    ]),
  ])
]

})

export class HomeComponent implements OnInit, OnDestroy {


caroselloImmagini: {
  display_name?: string;
  format?: string;
  height?: number;
  width?: number;
  url?: string;
}[] = [];




  modelliVideoInEvidenza = [
    {
      url: 'https://res.cloudinary.com/dmf1qtmqd/video/upload/v1750585487/Video/Estate_Conchiglia_Bianca_Wct3ey_Rfr0kt_dtffzm_krhe0u.mp4',
      routeCloudinary: '/borse/conchiglia',
      filterType: 'Conchiglia',
      nome: 'Modello Conchiglia',
      descrizione: 'Perfetta per il mare e le giornate estive'
    },
    {
      url: 'https://res.cloudinary.com/dmf1qtmqd/video/upload/v1750585489/Video/video_r2bh68_j7tmxq.mp4',
      routeCloudinary: '/borse/pochette',
      filterType: 'Pochette',
      nome: 'Modello Clutch',
      descrizione: 'Elegante, sobria, sempre alla moda'
    }
  ];
  constructor(private router: Router, private cloudinaryService: CloudinaryService,private breakpointObserver: BreakpointObserver) {}

goToComponentCloudinary(routeCloudinary: string, filterType: string) {
  this.router.navigate([routeCloudinary], {
    queryParams: {
      filtri: this.filtriSottoCategorie[filterType]
    }
  });
}


  currentIndex = 0;
  intervalId!: ReturnType<typeof setInterval>;
  playedOnce = false;

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

      isMobile = false;


        // OGNI 4 secondi per oppure il tempo definito sotto dal timer chiama nextImage che cambia sempre current index cosi nel template mostro solo un immagine alla volta
    nextImage(): void {
    if (this.caroselloImmagini.length === 0) return;
    this.currentIndex = (this.currentIndex + 1) % this.caroselloImmagini.length;
  }

  ngOnInit(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });  // Rileva se il dispositivo è mobile

    //timer per avviare il carosello
      this.intervalId = setInterval(() => this.nextImage(), 2000);

//rilevo disp mobile anziche pc
  this.breakpointObserver
    .observe(['(max-width: 768px)'])
    .subscribe(result => {
      this.isMobile = result.matches;
    });

    this.cloudinaryService.getImmagini().subscribe({
      next: (data: Record<string, any[]>) => {
// Estrae tutte le immagini dal gruppo "Carosello" nel risultato ricevuto
// Utilizza flatMap per ottenere un array piatto di URL (string[])
// Ogni elemento 'item' rappresenta un oggetto con proprietà 'display_name', 'descrizione', 'quantita' e un array 'meta'
// Per ogni elemento, mappa l'array 'meta' estraendo il campo 'url' di ciascuna immagine
// Il risultato finale è un array contenente solo gli URL delle immagini del carosello
this.caroselloImmagini = data['Carosello'].flatMap(item =>
  item.meta.map((m: { url: string }) => m.url)
);

        console.log("Carosello immagini: ", this.caroselloImmagini);
        this.categorieSottoCategorie = Object.keys(data);

        // Estrai le categorie principali (escludi "recensioni")
        this.categorie = [
          ...new Set(
            this.categorieSottoCategorie
              .map(k => k.split('/')[0])
                  .filter(c => {
                  const lower = c.toLowerCase();
                return lower !== 'recensioni' && lower !== 'carosello';
                 })          )
        ];

        console.log("Categorie: ", this.categorie);

        // Estrai tutte le sotto-categorie uniche
        this.sottoCategorie = [
          ...new Set(
            this.categorieSottoCategorie
              .map(k => k.split('/'))
              .filter(parts => parts.length > 1 && parts[1].trim() !== '' && parts[1].toLowerCase() !== 'recensioni')
              .map(parts => parts[1])
          )
        ];

        console.log("Sotto Categorie: ", this.sottoCategorie);

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
  this.filtriSottoCategorie[key] = ['Tutte', ...Array.from(tempFiltri[key])];
});

        console.log("Filtri: ", this.filtriSottoCategorie);

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

      },
      error: (err) => {
        console.error('Errore nel caricamento delle immagini', err);
      }
    });

    this.intervalId = setInterval(() => this.nextImage(), 4000);

  }


  ngOnDestroy(): void {
      clearInterval(this.intervalId);
  }


}
