import {
  Component,
  Output,
  EventEmitter,
  OnInit,
  OnDestroy
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { BreakpointObserver } from '@angular/cdk/layout';
import {
  trigger,
  state,
  style,
  animate,
  transition
} from '@angular/animations';
import { Subject, takeUntil, map } from 'rxjs';

/* Prendo i tipi centralizzati dal progetto */
import { MediaCollection, MediaItems, MediaMeta, MediaContext } from '../../app.component';
import { SharedDataService } from '../../services/shared-data.service';

/** Modello per ogni traccia audio che visualizzo nel player */
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
export class AudioPlayerComponent implements OnInit, OnDestroy {

  /** Stato pannello e player */
  attivo = false;                 // overlay visibile
  panelClosing = false;           // stato in chiusura
  panelAnimationState: 'in' | 'out' = 'in';
  isMobile = false;               // < 768px
  currentIndex: number | null = null;
  isPlaying = false;

  /** Event al padre quando l’animazione di chiusura è finita */
  @Output() chiusuraAnimazioneCompleta = new EventEmitter<void>();

  /** Tracce pronte per il template */
  assetCarllonAudioUrl: AssetAudio[] = [];

  /** Subject per chiudere in modo pulito le subscribe (takeUntil) */
  private destroy$ = new Subject<void>();

  constructor(
    private breakpointObserver: BreakpointObserver,
    private sharedData: SharedDataService
  ) {}

  ngOnInit(): void {
    /**
     * 1) Rilevo responsive: mi iscrivo al BreakpointObserver.
     *    Uso pipe() per trasformare il BreakpointState in boolean, e takeUntil()
     *    per chiudere la subscription quando il componente si distrugge.
     */
    this.breakpointObserver
      .observe(['(max-width: 768px)'])
      .pipe(
        map(state => state.matches),
        takeUntil(this.destroy$)
      )
      .subscribe(isMob => (this.isMobile = isMob));

    /**
     * 2) Prendo i media CONFIG dalla cache condivisa e costruisco la playlist.
     *    - pipe(): concateno operatori RxJS per trasformare lo stream prima del subscribe.
     *    - map(): estraggo la collezione giusta e faccio il flatten in AssetAudio[].
     *    - takeUntil(): chiudo in automatico alla distruzione del componente.
     */
    this.sharedData.mediasCollectionsConfig$
      .pipe(
        map((collections: MediaCollection[]) => this.buildPlaylistFromConfig(collections)),
        takeUntil(this.destroy$)
      )
      .subscribe(tracce => {
        this.assetCarllonAudioUrl = tracce;

        // Attivo overlay e animazione dopo il rendering
        setTimeout(() => {
          this.attivo = true;
          this.panelAnimationState = 'in';
        }, 10);
      });
  }

  ngOnDestroy(): void {
    /** Chiudo tutte le subscribe collegate a takeUntil(this.destroy$) */
    this.destroy$.next();
    this.destroy$.complete();
  }

  /* =========================================================================
     Costruzione playlist dal CONFIG
     ========================================================================= */

  /**
   * Ricavo la playlist dalla lista di MediaCollection CONFIG.
   * Ricerco la folder "config/carillon/audio" (case-insensitive) e prendo solo asset audio.
   */
  private buildPlaylistFromConfig(collections: MediaCollection[] | null | undefined): AssetAudio[] {
    if (!Array.isArray(collections) || collections.length === 0) return [];

    // Match robusto: qualunque cartella che includa "config/carillon/audio"
    const isCarillonAudioFolder = (folder: string | undefined) =>
      (folder ?? '').toLowerCase().includes('config/carillon/audio');

    const target = collections.find(c => isCarillonAudioFolder(c.folder));
    if (!target) {
      console.warn('[AudioPlayer] Nessuna cartella "config/carillon/audio" trovata nel CONFIG.');
      return [];
    }

    // Flatten: per ogni item prendo media con estensione audio
    const tracce: AssetAudio[] = [];
    for (const item of target.items ?? []) {
      const ctx: MediaContext = item.context ?? {};
      const medias: MediaMeta[] = Array.isArray(item.media) ? item.media : [];

      const nome = ctx.display_name ?? 'Senza titolo';

      for (const m of medias) {
        if (m?.url && this.isAudioUrl(m.url)) {
          tracce.push({
            nome_canzone: nome,
            url: m.url
          });
        }
      }
    }

    return tracce;
  }

  /** Riconosco URL audio tramite estensione */
  private isAudioUrl(url: string): boolean {
    if (!url) return false;
    const u = url.toLowerCase();
    return (
      u.endsWith('.mp3') ||
      u.endsWith('.wav') ||
      u.endsWith('.ogg') ||
      u.endsWith('.m4a') ||
      u.endsWith('.aac') ||
      u.endsWith('.flac')
    );
  }

  /* =========================================================================
     Controlli pannello e player
     ========================================================================= */

  /** Chiudo il pannello con animazione e notifico il padre a fine transizione */
  closeWindow(): void {
    this.attivo = false;
    this.panelClosing = true;
    this.panelAnimationState = 'out';

    setTimeout(() => {
      this.chiusuraAnimazioneCompleta.emit();
      this.panelClosing = false;
    }, 400); // stesso timing dell'animazione
  }

  /** Play/Pause su una traccia data la URL e l’indice corrente */
  togglePlay(url: string, index: number): void {
    const audioEl = document.querySelector('audio') as HTMLAudioElement | null;
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
