import {
  Component,
  ViewChild,
  ElementRef,
  OnInit,
  Output,
  EventEmitter,
  OnDestroy
} from '@angular/core';
import { BreakpointObserver } from '@angular/cdk/layout';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-audio-player',
  standalone: true,
  templateUrl: './audio-player.component.html',
  styleUrls: ['./audio-player.component.scss'],
  imports: [MatIconModule, MatListModule, MatButtonModule, CommonModule]
})
export class AudioPlayerComponent implements OnInit, OnDestroy {
  @ViewChild('audioPlayer') audioPlayerRef!: ElementRef<HTMLAudioElement>;

  @Output() chiudiPlayer = new EventEmitter<void>();
  @Output() audioVisible = new EventEmitter<void>();

  isMobile = false;
  currentIndex: number | null = null;
  isPlaying = false;
  attivo = false;    // Apre pannello con animazione
  chiusura = false;  // Chiude pannello con animazione
  disableCarillonAudio: boolean = false
  // Lista audio disponibili
  assetCarllonAudioUrl = [
    { nome_canzone: 'Over The Raimbow', url: 'https://res.cloudinary.com/dmf1qtmqd/video/upload/v1750585255/Audio/Over_The_Raimbow_vyzoko.mp3' },
    { nome_canzone: 'Harry Potter', url: 'https://res.cloudinary.com/dmf1qtmqd/video/upload/v1750585254/Audio/Harry_Potter_jv8kjx.mp3' },
    { nome_canzone: 'Il Cerchio Della Vita', url: 'https://res.cloudinary.com/dmf1qtmqd/video/upload/v1750585254/Audio/Il_Cerchio_Della_Vita_awkrzg.mp3' },
    { nome_canzone: 'La Lelu', url: 'https://res.cloudinary.com/dmf1qtmqd/video/upload/v1750585255/Audio/La_Lelu_fhkzum.mp3' },
    { nome_canzone: 'River Flows In You', url: 'https://res.cloudinary.com/dmf1qtmqd/video/upload/v1750585255/Audio/River_Flows_in_You_dj3gid.mp3' },
    { nome_canzone: 'La Bella e la Bestia', url: 'https://res.cloudinary.com/dmf1qtmqd/video/upload/v1750585254/Audio/La_Bella_e_La_Bestia_pvsvs2.mp3' },
    { nome_canzone: 'Ninna Nanna', url: 'https://res.cloudinary.com/dmf1qtmqd/video/upload/v1750585255/Audio/Ninna_Nanna_ikcinv.mp3' }
  ];

  constructor(private breakpointObserver: BreakpointObserver,   private router: Router) {}

  ngOnInit(): void {
    this.disableCarillonAudio = true;
    // Attiva animazione di apertura
    setTimeout(() => this.attivo = true, 10);

    // Disabilita lo scroll globale
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';

    // Rileva se siamo su mobile
    this.breakpointObserver.observe(['(max-width: 768px)']).subscribe(result => {
      this.isMobile = result.matches;
    });

    //verifico la url corrente
      this.checkAudioSection(this.router.url);


        // Verifica anche dopo ogni navigazione
  this.router.events
    .pipe(filter(e => e instanceof NavigationEnd))
    .subscribe((e: NavigationEnd) => this.checkAudioSection(e.urlAfterRedirects));
  }


  private checkAudioSection(url: string): void {
  const path = url.split('?')[0]; // rimuove eventuali query string
  this.disableCarillonAudio = path === '/baby/carillon';
}

  ngOnDestroy(): void {
    // Riabilita lo scroll globale quando il componente viene distrutto
    document.body.style.overflow = '';
    document.documentElement.style.overflow = '';
  }

  togglePlay(url: string, index: number): void {
    const audioEl = this.audioPlayerRef.nativeElement;

    if (this.currentIndex === index && this.isPlaying) {
      audioEl.pause();
      this.isPlaying = false;
    } else {
      audioEl.src = url;
      audioEl.play();
      this.currentIndex = index;
      this.isPlaying = true;
    }
  }

  onEnded(): void {
    this.isPlaying = false;
  }

  // Chiude il pannello con animazione e sblocca lo scroll dopo 400ms
  closePlayer(): void {
    this.attivo = false;
    this.chiusura = true;

    setTimeout(() => {
      this.chiusura = false;
      this.chiudiPlayer.emit(); // dice al padre di fare mostraAudioPlayer = false
    }, 400);
  }
}
