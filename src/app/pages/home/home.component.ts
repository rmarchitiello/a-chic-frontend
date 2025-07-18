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
import { ScrollRevealDirective } from '../../shared/directives/scroll-reveal.directive';
import { Meta, Title } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { SharedDataService } from '../../services/shared-data.service';
import { MatDialog } from '@angular/material/dialog';
import { CaroselloEditPopUpComponent } from '../../admin/edit/home/carosello-edit-popup/carosello-edit-popup.component';

// Interfaccia per ogni angolazione o asset (immagine/video/audio)
export interface ImmagineMeta {
  url: string;
  angolazione: string;
  format?: string;
}

// Interfaccia completa di un file Cloudinary con metadati
export interface ImmagineCloudinary {
  display_name: string;
  descrizione: string;
  quantita: string;
  meta: ImmagineMeta[];
}

// Interfaccia per ogni asset da visualizzare nel template
export interface ImmagineConfig {
  url: string;
  display_name: string;
  type?: 'image' | 'video' | 'audio';
  descrizione?: string;
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
  isAdmin = false;
  caroselloImmagini: ImmagineConfig[] = [];
  recensioniImmagini: ImmagineConfig[] = [];
  modelliVideoInEvidenza: ImmagineConfig[] = [];
  immaginiCreazioni: ImmagineConfig[] = [];
  currentIndex = 0;
  currentRecensioneIndex = 0;
  intervalId!: ReturnType<typeof setInterval>;
  recensioneIntervalId!: ReturnType<typeof setInterval>;
  isMobile = false;
  mostraContenutoDopoCarosello = false;
  strutturaCategorie: { [key: string]: string[] | undefined } = {};
  categorieSottoCategorie: string[] = [];
  filtriSottoCategorie: Record<string, string[]> = {};
  onlyUrlBorse: string[] = [];

  constructor(
    private cloudinaryService: CloudinaryService,
    private breakpointObserver: BreakpointObserver,
    private titleService: Title,
    private metaService: Meta,
    private router: Router,
    private sharedDataService: SharedDataService,
    private dialog: MatDialog
  ) { }

  ngOnInit(): void {
    this.sharedDataService.isAdmin$.subscribe((token: string | null) => {
      this.isAdmin = !!token;
    });

    this.sharedDataService.strutturaCategorie$.subscribe(data => {
      if (Object.keys(data).length > 0) this.strutturaCategorie = data;
    });

    this.sharedDataService.categorieSottoCategorie$.subscribe(data => {
      if (data.length > 0) this.categorieSottoCategorie = data;
    });

    this.sharedDataService.filtriSottoCategorie$.subscribe(data => {
      if (Object.keys(data).length > 0) this.filtriSottoCategorie = data;
    });

    setTimeout(() => {
      const result = this.mapUrlBorseCompletamente().find(mB => mB.includes("borse"));
      this.onlyUrlBorse = result ? [result] : [];
    });

    this.titleService.setTitle('A-Chic | Borse all\'uncinetto e Accessori artigianali');
    this.metaService.addTags([
      { name: 'description', content: 'Borse fatte a mano...' },
      { name: 'keywords', content: 'borse, artigianato, carillon...' },
      { property: 'og:image', content: 'https://www.a-chic.it/assets/og-image.jpg' },
      { property: 'og:url', content: 'https://www.a-chic.it/home' },
      { name: 'twitter:image', content: 'https://www.a-chic.it/assets/og-image.jpg' }
    ]);

    window.scrollTo({ top: 0, behavior: 'smooth' });

    this.breakpointObserver.observe(['(max-width: 768px)']).subscribe(result => {
      this.isMobile = result.matches;
    });

    this.intervalId = setInterval(() => this.nextImage(), 2000);
    this.recensioneIntervalId = setInterval(() => this.nextRecensione(), 2000);

    this.cloudinaryService.getImmagini('', true).subscribe({
      next: (data: Record<string, ImmagineCloudinary[]>) => {
        const caroselloKey = Object.keys(data).find(k => k.toLowerCase().includes('home/carosello'));
        const recensioniKey = Object.keys(data).find(k => k.toLowerCase().includes('config/recensioni'));
        const videoEvidenzaKey = Object.keys(data).find(k => k.toLowerCase().includes('home/video'));
        const mieCreazioniKey = Object.keys(data).find(k => k.toLowerCase().includes('config/home/mie creazioni'));
        if (!caroselloKey || !recensioniKey || !videoEvidenzaKey || !mieCreazioniKey) return;

        this.caroselloImmagini = data[caroselloKey].flatMap(item =>
          item.meta.map(meta => ({
            url: meta.url,
            display_name: item.display_name,
            type: this.detectType(meta.url)
          }))
        );

        this.recensioniImmagini = data[recensioniKey].flatMap(item =>
          item.meta.map(meta => ({
            url: meta.url,
            display_name: item.display_name,
            type: this.detectType(meta.url)
          }))
        );

        this.modelliVideoInEvidenza = data[videoEvidenzaKey].flatMap(item =>
          item.meta.map(meta => ({
            url: meta.url,
            display_name: item.display_name,
            descrizione: item.descrizione,
            type: this.detectType(meta.url)
          }))
        );

        this.immaginiCreazioni = data[mieCreazioniKey].flatMap(item =>
          item.meta.map(meta => ({
            url: meta.url,
            display_name: item.display_name,
            type: this.detectType(meta.url)
          }))
        );
      },
      error: err => console.error('Errore caricamento media', err)
    });

    this.checkScroll();
  }

  detectType(url: string): 'image' | 'video' | 'audio' {
    if (url.match(/\.(mp4|webm)$/i)) return 'video';
    if (url.match(/\.(mp3|wav|ogg)$/i)) return 'audio';
    return 'image';
  }

  mapUrlBorseCompletamente(): string[] {
    const urlSet: Set<string> = new Set();
    this.categorieSottoCategorie.forEach(path => {
      const [categoria, sottoCategoria] = path.split('/');
      const url = `/${categoria.toLowerCase()}/${sottoCategoria.toLowerCase()}`;
      urlSet.add(url);
    });
    return Array.from(urlSet);
  }

  goTo(urlOrFilter: string, fromModelliInEvidenza?: boolean): void {
    if (fromModelliInEvidenza) {
      const url = `${this.onlyUrlBorse}?filtri=${encodeURIComponent(urlOrFilter)}`;
      this.router.navigateByUrl(url);
      return;
    }
    this.router.navigate([urlOrFilter]);
  }

  apriPopUpEditorCarosello(): void {
    this.dialog.open(CaroselloEditPopUpComponent, {
      width: '90vw',
      disableClose: false,
      data: this.caroselloImmagini,
    });
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      const videos: NodeListOf<HTMLVideoElement> = document.querySelectorAll('video');
      videos.forEach(video => {
        video.muted = true;
        video.play().catch(err => console.warn('Video non avviato:', err));
      });
    }, 300);
  }

  @HostListener('window:scroll', [])
  onWindowScroll() {
    this.checkScroll();
  }

  checkScroll() {
    const soglia = window.innerHeight * 0.6;
    this.mostraContenutoDopoCarosello = window.scrollY > soglia;
  }

  nextImage(): void {
    if (this.caroselloImmagini.length === 0) return;
    this.currentIndex = (this.currentIndex + 1) % this.caroselloImmagini.length;
  }

  nextRecensione(): void {
    if (this.recensioniImmagini.length === 0) return;
    this.currentRecensioneIndex = (this.currentRecensioneIndex + 1) % this.recensioniImmagini.length;
  }

  ngOnDestroy(): void {
    clearInterval(this.intervalId);
    clearInterval(this.recensioneIntervalId);
  }
}
