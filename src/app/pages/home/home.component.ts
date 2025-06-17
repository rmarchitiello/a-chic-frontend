import {
  Component,
  OnInit,
  OnDestroy,
  AfterViewChecked,
  ViewChildren,
  QueryList,
  ElementRef
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
  trigger('fadeIn', [
    transition(':enter', [
      style({ opacity: 0 }),       // iniziale
      animate('800ms ease-out', style({ opacity: 1 })) // finale
    ]),
    transition('* => *', [
      style({ opacity: 0 }),
      animate('800ms ease-out', style({ opacity: 1 }))
    ])
  ])
]

})

export class HomeComponent implements OnInit, OnDestroy, AfterViewChecked {
  images: string[] = [
    '/assets/home/images/1.jpg',
    '/assets/home/images/2.jpg',
    '/assets/home/images/3.jpg',
    '/assets/home/images/4.jpg',
    '/assets/home/images/5.jpg',
    '/assets/home/images/6.jpg',
    '/assets/home/images/7.jpg',
    '/assets/home/images/8.jpg',
    '/assets/home/images/9.jpg',
  ];

  videiConsigliati: any[] = [
    { url: 'https://res.cloudinary.com/dmf1qtmqd/video/upload/q_auto,f_auto/v1750144761/borsa-uncinetto_z5hzsp.mp4' },
    { url: 'https://res.cloudinary.com/dmf1qtmqd/video/upload/q_auto,f_auto/v1750144772/Estate_conchiglia_bianca_wct3ey_rfr0kt.mp4' },
    { url: 'https://res.cloudinary.com/dmf1qtmqd/video/upload/q_auto,f_auto/v1750144759/borsa-conchiglia-video_dhpzyx.mp4' },
    { url: 'https://res.cloudinary.com/dmf1qtmqd/video/upload/q_auto,f_auto/v1750144769/clutch3_lkiy6q_jzo8mw.mp4' },
    { url: 'https://res.cloudinary.com/dmf1qtmqd/video/upload/q_auto,f_auto/v1750144766/clutch2_nsthjx_ybhzzm.mp4' },
    { url: 'https://res.cloudinary.com/dmf1qtmqd/video/upload/q_auto,f_auto/v1750144764/clutch_axwzaj_srg3pv.mp4' }
  ];

  videoRighe: any[][] = [];

  modelli = [
    {
      img: '/assets/home/images/modello-conchiglia.jpg',
      routeCloudinary: '/borse/conchiglia',
      filterType: 'Conchiglia',
      nome: 'Modello Conchiglia',
      descrizione: 'Perfetta per il mare e le giornate estive'
    },
    {
      img: '/assets/home/images/modello-clutch.jpg',
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

  @ViewChildren('videoElement') videoElements!: QueryList<ElementRef<HTMLVideoElement>>;
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



  ngOnInit(): void {
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

    // Pre-calcola righe da 3 video
    const chunkSize = 3;
    for (let i = 0; i < this.videiConsigliati.length; i += chunkSize) {
      this.videoRighe.push(this.videiConsigliati.slice(i, i + chunkSize));
    }
  }

  ngAfterViewChecked(): void {
    if (!this.playedOnce && this.videoElements.length > 0) {
      this.playedOnce = true;
      setTimeout(() => {
        this.videoElements.forEach(ref => {
          const video = ref.nativeElement;
          video.muted = true;
          video.autoplay = true;
          video.playsInline = true;
          video.load(); // forza preload
          video.play().catch(err => {
            console.warn('⚠️ Video non riprodotto automaticamente:', err);
          });
        });
      }, 100); // piccolo ritardo per sicurezza
    }
  }

  ngOnDestroy(): void {
    clearInterval(this.intervalId);
  }

  nextImage(): void {
    if (this.images.length === 0) return;
    this.currentIndex = (this.currentIndex + 1) % this.images.length;
  }
}
