import {
  Component,
  OnInit,
  OnDestroy,
  HostListener,
  ViewChild,
  ElementRef
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { CloudinaryService } from '../../services/cloudinary.service';
import { ActivatedRoute } from '@angular/router';

import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatExpansionModule } from '@angular/material/expansion';

@Component({
  selector: 'app-cloudinary',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatSelectModule,
    MatFormFieldModule,
    MatSidenavModule,
    MatToolbarModule,
    MatListModule,
    MatIconModule,
    MatExpansionModule
  ],
  templateUrl: './cloudinary.component.html',
  styleUrl: './cloudinary.component.scss'
})
export class CloudinaryComponent implements OnInit, OnDestroy {
  immagini: any[] = [];
  immaginiVisibili: any[] = [];
  categoria: string | null = null;
  sottoCategoria: string | null = null;
  currentIndex = 0;
  step = 3;
  tutteCaricate = false;
  isLoading = false;
  configurazioni: any[] = [];
  selectedAudioUrl: string | null = null;
  isPlaying = false;
  sidebarOpen = false;
  isMobile = false;
  filtroSelezionato: string = 'Tutte';
  filtriAttivi: string[] = [];
  filtriRicevuti: string[] = [];

  @ViewChild('audioPlayer', { static: true }) audioPlayer!: ElementRef<HTMLAudioElement>;

  assetAudioUrl: any[] = [
    { nome_canzone: 'Over The Raimbow', url: 'https://res.cloudinary.com/dmf1qtmqd/video/upload/v1750144292/Over_The_Raimbow_o6gs3v_nnaa92.mp3' },
    { nome_canzone: 'Harry Potter', url: 'https://res.cloudinary.com/dmf1qtmqd/video/upload/v1750144294/Harry_Potter_ymoryk_nc4rxa.mp3' },
    { nome_canzone: 'Il Cerchio Della Vita', url: 'https://res.cloudinary.com/dmf1qtmqd/video/upload/v1750144295/Il_Cerchio_Della_Vita_egiyfx_krdqmy.mp3' },
    { nome_canzone: 'La Lelu', url: 'https://res.cloudinary.com/dmf1qtmqd/video/upload/v1750144289/La_Lelu_ailhh7_gyxvvg.mp3' },
    { nome_canzone: 'River Flows In You', url: 'https://res.cloudinary.com/dmf1qtmqd/video/upload/v1750144293/River_Flows_in_You_dcggnx_jfblym.mp3' },
    { nome_canzone: 'La Bella e la Bestia', url: 'https://res.cloudinary.com/dmf1qtmqd/video/upload/v1750144288/La_Bella_e_la_Bestia_zmy4mo_hfmcx2.mp3' },
    { nome_canzone: 'Ninna Nanna', url: 'https://res.cloudinary.com/dmf1qtmqd/video/upload/v1750144290/Ninna_Nanna_vmvcgv_t10gav.mp3' }
  ];

  constructor(
    private cloudinaryService: CloudinaryService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.isMobile = window.innerWidth <= 768;
    window.addEventListener('resize', () => {
      this.isMobile = window.innerWidth <= 768;
    });

    this.route.paramMap.subscribe(params => {
      this.filtroSelezionato = 'Tutte';
      this.stopAudio();
      this.categoria = params.get('categoria');
      this.sottoCategoria = params.get('sottoCategoria');
      this.caricaImmagini();
      this.caricaConfigurazioni(this.sottoCategoria);
    });

    this.route.queryParams.subscribe(queryParams => {
      this.filtroSelezionato = 'Tutte';
      const raw = queryParams['filtri'];
      const filtriRicevuti = raw ? (Array.isArray(raw) ? raw : [raw]) : [];
      this.filtriRicevuti = filtriRicevuti;
      this.filtriAttivi = ['Tutte', ...filtriRicevuti.filter(f => f !== 'Tutte')];
      if (!this.filtroSelezionato) this.filtroSelezionato = 'Tutte';
    });
  }

  ngOnDestroy(): void {
    this.stopAudio();
  }

  // Scroll desktop
  @HostListener('window:scroll', [])
  onWindowScroll(): void {
    const scrollTop = window.scrollY;
    const viewportHeight = window.innerHeight;
    const fullHeight = document.body.scrollHeight;
    const isBottom = scrollTop + viewportHeight >= fullHeight - 100;
    if (isBottom && !this.tutteCaricate && !this.isLoading) {
      this.caricaAltri();
    }
  }

  // Scroll mobile all'interno del mat-sidenav-content
  onCustomScroll(event: Event): void {
    const element = event.target as HTMLElement;
    const scrollTop = element.scrollTop;
    const viewportHeight = element.clientHeight;
    const scrollHeight = element.scrollHeight;
    const isBottom = scrollTop + viewportHeight >= scrollHeight - 100;
    if (isBottom && !this.tutteCaricate && !this.isLoading) {
      this.caricaAltri();
    }
  }

  toggleSidebar(): void {
    this.sidebarOpen = !this.sidebarOpen;
  }

  onFiltroClick(filtro: string): void {
    this.filtroSelezionato = filtro;
    this.caricaImmagini();
  }

  caricaConfigurazioni(sottoCategoria: any): void {
    this.cloudinaryService.getConfig(sottoCategoria).subscribe({
      next: (data) => {
        const chiave = this.primaLetteraGrande(this.sottoCategoria);
        const configurazioniTrovate = data[chiave];
        this.configurazioni = Array.isArray(configurazioniTrovate) ? configurazioniTrovate : [];
      },
      error: () => {
        this.configurazioni = [];
      }
    });
  }

  caricaImmagini(): void {
    if (!this.categoria) return;
    const basePath = this.sottoCategoria
      ? `${this.categoria}/${this.sottoCategoria}`.toLowerCase()
      : this.categoria.toLowerCase();

    this.cloudinaryService.getImmagini().subscribe({
      next: (data: Record<string, any[]>) => {
        let immaginiDaMostrare: any[] = [];

        if (this.filtroSelezionato === 'Tutte') {
          immaginiDaMostrare = Object.keys(data)
            .filter(key =>
              key.toLowerCase() === basePath ||
              key.toLowerCase().startsWith(`${basePath}/`)
            )
            .flatMap(key => data[key]);
        } else {
          const chiaveFiltroCompleta = `${basePath}/${this.filtroSelezionato}`.toLowerCase();
          const chiaveReale = Object.keys(data).find(
            k => k.toLowerCase().trim() === chiaveFiltroCompleta.trim()
          );
          if (chiaveReale) {
            immaginiDaMostrare = data[chiaveReale];
          }
        }

        this.immagini = immaginiDaMostrare;
        this.currentIndex = 0;
        this.immaginiVisibili = [];
        this.tutteCaricate = false;

        this.caricaAltri();

        setTimeout(() => {
          const fullHeight = document.body.scrollHeight;
          const viewportHeight = window.innerHeight;
          if (fullHeight <= viewportHeight && !this.tutteCaricate && !this.isLoading) {
            this.caricaAltri();
          }
        }, 100);
      },
      error: err => console.error('Errore caricamento immagini:', err)
    });
  }

  caricaAltri(): void {
    this.isLoading = true;
    const prossimi = this.immagini.slice(this.currentIndex, this.currentIndex + this.step);
    this.immaginiVisibili.push(...prossimi);
    this.currentIndex += this.step;
    if (this.currentIndex >= this.immagini.length) {
      this.tutteCaricate = true;
    }
    setTimeout(() => {
      this.isLoading = false;
    }, 200);
  }

  togglePlayback(): void {
    const player = this.audioPlayer.nativeElement;
    if (!this.selectedAudioUrl) return;
    if (this.isPlaying) {
      player.pause();
      this.isPlaying = false;
    } else {
      player.src = this.selectedAudioUrl;
      player.play()
        .then(() => this.isPlaying = true)
        .catch(err => console.error('Errore audio:', err));
    }
  }

  stopAudio(): void {
    const player = this.audioPlayer.nativeElement;
    player.pause();
    player.currentTime = 0;
    this.isPlaying = false;
  }

  onAudioChange(): void {
    this.stopAudio();
    this.isPlaying = false;
  }

  primaLetteraGrande(str: any): string {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
  }
}
