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


  caroselloImmagini: string[] = [
    '/assets/home/images/carosello/1.jpg',
    '/assets/home/images/carosello/2.jpg',
    '/assets/home/images/carosello/3.jpg',
    '/assets/home/images/carosello/4.jpg',
    '/assets/home/images/carosello/5.jpg'
  ];




  modelliVideoInEvidenza = [
    {
      url: 'https://res.cloudinary.com/dmf1qtmqd/video/upload/v1750238268/Estate_Conchiglia_Bianca_Wct3ey_Rfr0kt_dtffzm.mp4',
      routeCloudinary: '/borse/conchiglia',
      filterType: 'Conchiglia',
      nome: 'Modello Conchiglia',
      descrizione: 'Perfetta per il mare e le giornate estive'
    },
    {
      url: 'https://res.cloudinary.com/dmf1qtmqd/video/upload/v1750189434/video_r2bh68.mp4',
      routeCloudinary: '/borse/pochette',
      filterType: 'Pochette',
      nome: 'Modello Clutch',
      descrizione: 'Elegante, sobria, sempre alla moda'
    }
  ];
  constructor(private router: Router, private cloudinaryService: CloudinaryService,
) {}

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

    //timer per avviare il carosello
      this.intervalId = setInterval(() => this.nextImage(), 2000);


      // Rileva se il dispositivo è mobile
  this.isMobile = window.innerWidth <= 768;
  window.addEventListener('resize', () => {
    this.isMobile = window.innerWidth <= 768;
  });


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
