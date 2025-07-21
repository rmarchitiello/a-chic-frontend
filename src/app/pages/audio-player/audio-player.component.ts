import {
  Component,
  Output,
  EventEmitter,
  OnInit
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { BreakpointObserver } from '@angular/cdk/layout';
import {
  trigger,
  state,
  style,
  animate,
  transition
} from '@angular/animations';
import { MatListModule } from '@angular/material/list';
import { MediaItem } from '../home/home.component';
import { CloudinaryService } from '../../services/cloudinary.service';

/** Modello per ogni traccia audio */
export interface AssetAudio {
  nome_canzone: string;
  url: string;
}

@Component({
  selector: 'app-audio-player',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule,
    MatListModule
  ],
  templateUrl: './audio-player.component.html',
  styleUrls: ['./audio-player.component.scss'],
  animations: [
    trigger('panelSlideAnimation', [
      state('in',  style({ transform: 'translateY(0)',   opacity: 1 })),
      state('out', style({ transform: 'translateY(100%)', opacity: 0 })),
      transition('void => in', [
        style({ transform: 'translateY(100%)', opacity: 0 }),
        animate('400ms ease-out')
      ]),
      transition('in => out', [
        animate('400ms ease-in')
      ])
    ])
  ]
})
export class AudioPlayerComponent implements OnInit {

  /* ──────────────────────────────────────────
     ⬇︎  Stato e configurazione component
  ───────────────────────────────────────────*/
  attivo = false;                 // Sfocatura + overlay visibile
  panelClosing = false;           // Sfocatura in uscita
  panelAnimationState: 'in' | 'out' = 'in';
  isMobile = false;               // Breakpoint < 768 px
  currentIndex: number | null = null;
  isPlaying = false;

  /** Output al padre (chiusura animazione) */
  @Output() chiusuraAnimazioneCompleta = new EventEmitter<void>();

  /** Lista di melodie estratte da Cloudinary */
  assetCarllonAudioUrl: AssetAudio[] = [];

  constructor(
    private breakpointObserver: BreakpointObserver,
    private cloudinaryService:  CloudinaryService
  ) {}

  /* ──────────────────────────────────────────
     ⬇︎  Inizializzo: carico audio + responsive
  ───────────────────────────────────────────*/
  ngOnInit(): void {

    this.cloudinaryService.getImmagini('', true).subscribe(
      (response: Record<string, MediaItem[]>) => {
        // 1. Trovo la cartella audio del carillon
        const audioKey = Object.keys(response)
          .find(k => k.toLowerCase().includes('config/carillon/audio'));

        if (!audioKey) {
          console.warn('Nessuna cartella trovata per il carillon');
          return;
        }

        // 2. Estraggo (nome_canzone, url) da tutti i meta[]
        this.assetCarllonAudioUrl = response[audioKey]
          .flatMap(item =>
            item.meta.map(meta => ({
              nome_canzone: item.display_name,
              url:         meta.url
            }))
          );

        // 3. Imposto "mobile" se viewport < 768 px
        this.breakpointObserver
          .observe(['(max-width: 768px)'])
          .subscribe(result => {
            this.isMobile = result.matches;
          });

        // 4. Attivo overlay e animazione dopo il rendering
        setTimeout(() => {
          this.attivo = true;
          this.panelAnimationState = 'in';
        }, 10);
      },
      error => console.error('Errore caricamento audio', error)
    ); // ← chiudo subscribe
  }     // ← chiudo ngOnInit

  /* ──────────────────────────────────────────
     ⬇︎  Chiudo il pannello con animazione
  ───────────────────────────────────────────*/
  closeWindow(): void {
    this.attivo = false;
    this.panelClosing = true;
    this.panelAnimationState = 'out';

    setTimeout(() => {
      this.chiusuraAnimazioneCompleta.emit(); // notifico il padre
      this.panelClosing = false;
    }, 400); // deve combaciare con la durata animazione
  }

  /* ──────────────────────────────────────────
     ⬇︎  Gestisco play / pause delle tracce
  ───────────────────────────────────────────*/
  togglePlay(url: string, index: number): void {
    const audioEl = document.querySelector('audio') as HTMLAudioElement;
    if (!audioEl) return;

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
}
