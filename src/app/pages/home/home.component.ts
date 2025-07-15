import {
  Component,
  OnInit,
  OnDestroy,
  AfterViewInit,
  HostListener
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
import { CloudinaryService } from '../../services/cloudinary.service';
import { BreakpointObserver } from '@angular/cdk/layout';
import { ScrollRevealDirective } from '../../shared/directives/scroll-reveal.directive'; // percorso corretto
import { Meta, Title } from '@angular/platform-browser';

// Interfaccia per ogni immagine nella lista meta
export interface ImmagineMeta {
  url: string;
  angolazione: string;
}

// Interfaccia per ogni oggetto immagine Cloudinary
export interface ImmagineCloudinary {
  display_name: string;
  descrizione: string;
  quantita: string;
  meta: ImmagineMeta[];
}

// Interfaccia per i modelli in evidenza (video)
interface ModelloEvidenza {
  url: string;
  display_name: string;
  descrizione: string;
}

@Component({
  selector: 'app-home',
  standalone: true,
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule,
    MatCardModule,
    ScrollRevealDirective
  ],
  animations: [
    trigger('fadeInOut', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('2000ms ease-out', style({ opacity: 1 }))
      ]),
      transition(':leave', [
        animate('2000ms ease-out', style({ opacity: 0 }))
      ])
    ])
  ]
})
export class HomeComponent implements OnInit, OnDestroy, AfterViewInit {

  // Array di URL delle immagini del carosello principale
  caroselloImmagini: string[] = [];

  // Array di URL delle immagini delle recensioni
  recensioniImmagini: string[] = [];

  // Array di video modelli in evidenza
  modelliVideoInEvidenza: ModelloEvidenza[] = [];

  // Indici per i caroselli
  currentIndex = 0;
  currentRecensioneIndex = 0;

  // Timer per i caroselli
  intervalId!: ReturnType<typeof setInterval>;
  recensioneIntervalId!: ReturnType<typeof setInterval>;

  // Flag per distinguere mobile/desktop
  isMobile = false;

  // Flag per mostrare contenuti dopo lo scroll oltre il carosello
  mostraContenutoDopoCarosello = false;

  immaginiCreazioni: string[] = [];


  constructor(
    private cloudinaryService: CloudinaryService,
    private breakpointObserver: BreakpointObserver,
    private titleService: Title,
    private metaService: Meta
  ) {}

  ngOnInit(): void {
        // Titolo della pagina
    this.titleService.setTitle('A-Chic | Borse all\'uncinetto e Accessori artigianali');

    this.metaService.addTags([
  { name: 'description', content: 'Borse all\'uncinetto fatte a mano, carillon artigianali e accessori unici. A-Chic è passione, eleganza e artigianalità.' },
  { name: 'keywords', content: 'borse uncinetto, borse fatte a mano, carillon artigianali, accessori crochet, manici artigianali, borse handmade, moda artigianale' },
  { name: 'robots', content: 'index, follow' },

  // Open Graph
  { property: 'og:title', content: 'A-Chic | Borse e Carillon fatti a mano' },
  { property: 'og:description', content: 'Scopri le borse all\'uncinetto e i carillon artigianali di A-Chic. Ogni creazione è fatta a mano con amore.' },
  { property: 'og:image', content: 'https://www.a-chic.it/assets/og-image.jpg' },
  { property: 'og:url', content: 'https://www.a-chic.it/home' },
  { property: 'og:type', content: 'website' },

  // Twitter Card
  { name: 'twitter:card', content: 'summary_large_image' },
  { name: 'twitter:title', content: 'A-Chic | Borse all\'uncinetto e Carillon artigianali' },
  { name: 'twitter:description', content: 'Eleganza e artigianato si incontrano: borse uniche, manici lavorati a mano e carillon dal sapore unico.' },
  { name: 'twitter:image', content: 'https://www.a-chic.it/assets/og-image.jpg' }
]);






    // Scroll iniziale in cima alla pagina
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Rileva se lo schermo è mobile
    this.breakpointObserver
      .observe(['(max-width: 768px)'])
      .subscribe(result => {
        this.isMobile = result.matches;
      });

    // Avvia rotazione immagini carosello e recensioni
    this.intervalId = setInterval(() => this.nextImage(), 2000);
    this.recensioneIntervalId = setInterval(() => this.nextRecensione(), 2000);

    // Carica i contenuti multimediali da Cloudinary
    this.cloudinaryService.getImmagini('', true).subscribe({
      next: (data: Record<string, ImmagineCloudinary[]>) => {
        const caroselloKey = Object.keys(data).find(d => d.toLowerCase().includes('home/carosello'));
        const recensioniKey = Object.keys(data).find(d => d.toLowerCase().includes('config/recensioni'));
        const videoEvidenzaHomeKey = Object.keys(data).find(d => d.toLowerCase().includes('home/video'));
        const mieCreazioniKey = Object.keys(data).find(d => d.toLowerCase().includes('config/home/mie creazioni'));
        if (!caroselloKey || !recensioniKey || !videoEvidenzaHomeKey || !mieCreazioniKey) {
          console.warn('Chiavi mancanti in Cloudinary');
          return;
        }

        // Popola array immagini carosello
        this.caroselloImmagini = data[caroselloKey]
          .flatMap(item => item.meta)
          .map(m => m.url);

        // Popola array recensioni
        this.recensioniImmagini = data[recensioniKey]
          .flatMap(item => item.meta)
          .map(m => m.url);

        // Popola array video modelli in evidenza
        this.modelliVideoInEvidenza = data[videoEvidenzaHomeKey].flatMap(item =>
          item.meta.map(metaItem => ({
            url: metaItem.url,
            display_name: item.display_name,
            descrizione: item.descrizione
          }))
        );

        this.immaginiCreazioni = data[mieCreazioniKey].flatMap(item => item.meta)
          .map(m => m.url);
      },
      error: (err) => {
        console.error('Errore nel caricamento delle immagini da Cloudinary', err);
      }
    });

    // Controlla se è necessario mostrare i contenuti successivi
    this.checkScroll();
  }

  ngAfterViewInit(): void {
    // Avvia i video visibili al caricamento iniziale
    setTimeout(() => {
      const videos: NodeListOf<HTMLVideoElement> = document.querySelectorAll('video');
      videos.forEach(video => {
        video.muted = true;
        video.play().catch(err => {
          console.warn('Video non avviato:', err);
        });
      });
    }, 300);
  }

  // Ascolta lo scroll della finestra
  @HostListener('window:scroll', [])
  onWindowScroll() {
    this.checkScroll();
  }

  // Verifica se mostrare la sezione dopo il carosello
  checkScroll() {
    const soglia = window.innerHeight * 0.6;
    this.mostraContenutoDopoCarosello = window.scrollY > soglia;
  }

  // Scorri avanti nel carosello principale
  nextImage(): void {
    if (this.caroselloImmagini.length === 0) return;
    this.currentIndex = (this.currentIndex + 1) % this.caroselloImmagini.length;
  }

  // Scorri avanti nelle recensioni
  nextRecensione(): void {
    if (this.recensioniImmagini.length === 0) return;
    this.currentRecensioneIndex = (this.currentRecensioneIndex + 1) % this.recensioniImmagini.length;
  }

  ngOnDestroy(): void {
    // Interrompi i timer dei caroselli per evitare memory leak
    clearInterval(this.intervalId);
    clearInterval(this.recensioneIntervalId);
  }
}
