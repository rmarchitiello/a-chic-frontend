import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnInit,
  OnDestroy,
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
  transition,
  AnimationEvent,
} from '@angular/animations';
import { Subject, takeUntil, map } from 'rxjs';

@Component({
  selector: 'app-dettagli',
  standalone: true, // rendo il componente autonomo (senza modulo)
  imports: [
    CommonModule,     // *ngIf, *ngFor, [ngClass], ecc.
    MatIconModule,    // <mat-icon> per le frecce
    MatButtonModule,  // eventuali pulsanti Material
  ],
  animations: [
    // Gestisco lo slide orizzontale del media (uscita → cambio indice → entrata)
    trigger('slideAnimation', [
      state('in',        style({ opacity: 1, transform: 'translateX(0)' })),
      state('out-left',  style({ opacity: 0, transform: 'translateX(-40px)' })),
      state('out-right', style({ opacity: 0, transform: 'translateX(40px)' })),
      transition('* => in',        animate('300ms ease-out')),
      transition('in => out-left', animate('300ms ease-in')),
      transition('in => out-right',animate('300ms ease-in')),
    ]),
  ],
  templateUrl: './dettagli.component.html',
  styleUrl: './dettagli.component.scss',
})
export class DettagliComponent implements OnInit, OnDestroy {
  // ===========================================================================
  // 1) COSTANTI / CONFIG
  // ===========================================================================
  /** Durata di chiusura pannello in ms: la tengo allineata con lo SCSS */
  private readonly CLOSE_MS = 400;
  /** Soglia minima (px) per riconoscere uno swipe orizzontale */
  private readonly SWIPE_THRESHOLD = 50;

  // ===========================================================================
  // 2) INPUT DAL PADRE
  // ===========================================================================
  /**
   * Media “frontale” (in genere un’immagine). Lo tratto come facoltativo per
   * evitare errori in fase di costruzione dell’array.
   */
  @Input() immagineFrontale: string | null | undefined = null;

  /** Descrizione testuale sotto al media (facoltativa). */
  @Input() descrizioneImmagineFrontale: string | null | undefined = '';

  /**
   * Altri media correlati (immagini / video / audio). Mantengo il nome che usi
   * nel padre per non rompere il binding.
   */
  @Input() altreImmaginiDellaFrontale: string[] | null | undefined = [];

  // ===========================================================================
  // 3) OUTPUT AL PADRE
  // ===========================================================================
  /** Emesso quando l’animazione di chiusura è terminata e posso smontare. */
  @Output() chiudiDettaglio = new EventEmitter<void>();

  // ===========================================================================
  // 4) STATO INTERNO
  // ===========================================================================
  /** Collezione completa dei media che mostro nel carosello (frontale + altri). */
  totaleImmagini: string[] = [];

  /** Indice del media attualmente visibile. */
  currentIndexOtherImage = 0;

  /** Overlay/pannello: stato per classi CSS di apertura/chiusura. */
  attivo = false;
  panelClosing = false;

  /** Responsive */
  isMobile = false;

  /** Stato corrente per le Angular Animations. */
  animationState: 'in' | 'out-left' | 'out-right' = 'in';

  /**
   * Quando avvio una transizione, memorizzo qui la direzione richiesta.
   * Aggiorno l’indice nel callback `onSlideDone` (quando l’animazione finisce).
   */
  private pendingDelta: 1 | -1 | 0 = 0;

  /** Swipe: coord X di partenza del tocco. */
  private startX = 0;

  /** Pattern di cleanup per le subscription. */
  private readonly destroy$ = new Subject<void>();

  // ===========================================================================
  // 5) GETTER DI COMODO
  // ===========================================================================
  /**
   * Ritorno sempre una stringa valida per il media corrente, così nel template
   * passo sempre una `string` a [src] ed evito errori di tipo.
   */
  get currentMediaUrl(): string {
    const i = this.currentIndexOtherImage;
    return this.totaleImmagini[i] ?? '';
  }

  // ===========================================================================
  // 6) COSTRUTTORE
  // ===========================================================================
  constructor(private breakpointObserver: BreakpointObserver) {}

  // ===========================================================================
  // 7) LIFECYCLE
  // ===========================================================================
  ngOnInit(): void {
    // a) Preparo l’array di navigazione: frontale + altri media, filtrando i falsy
    const front = this.immagineFrontale ? [this.immagineFrontale] : [];
    const extra = Array.isArray(this.altreImmaginiDellaFrontale)
      ? this.altreImmaginiDellaFrontale
      : [];
    this.totaleImmagini = [...front, ...extra].filter((u): u is string => !!u);

    // b) Responsive
    this.breakpointObserver
      .observe(['(max-width: 768px)'])
      .pipe(map(s => s.matches), takeUntil(this.destroy$))
      .subscribe(isMob => (this.isMobile = isMob));

    // c) Attivo overlay dopo il paint per far partire la transizione in ingresso
    setTimeout(() => (this.attivo = true), 10);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ===========================================================================
  // 8) NAVIGAZIONE: FRECCE + SWIPE
  // ===========================================================================
  /** Vado al media successivo (se possibile). */
  vaiImmagineSuccessiva(): void {
    if (this.canGoNext()) this.startSlide(+1);
  }

  /** Vado al media precedente (se possibile). */
  vaiImmaginePrecedente(): void {
    if (this.canGoPrev()) this.startSlide(-1);
  }

  /** Posso andare avanti? (no wrap) */
  private canGoNext(): boolean {
    return this.currentIndexOtherImage < this.totaleImmagini.length - 1;
  }

  /** Posso andare indietro? (no wrap) */
  private canGoPrev(): boolean {
    return this.currentIndexOtherImage > 0;
  }

  /**
   * Avvio la transizione. Non cambio subito l’indice: aspetto che l’animazione
   * finisca e lo aggiorno in `onSlideDone`, poi rientro in stato `in`.
   */
  private startSlide(delta: 1 | -1): void {
    this.pendingDelta = delta;
    this.animationState = delta > 0 ? 'out-left' : 'out-right';
  }

  /**
   * Mi aggancio al “done” dell’animazione:
   * - se stavo uscendo (out-left/out-right), aggiorno l’indice in base a pendingDelta
   * - poi imposto `animationState = 'in'` per l’animazione di entrata
   */
  onSlideDone(e: AnimationEvent): void {
    if (e.toState !== 'out-left' && e.toState !== 'out-right') return;

    if (!this.totaleImmagini.length || this.pendingDelta === 0) {
      this.animationState = 'in';
      return;
    }

    if (this.pendingDelta > 0 && this.canGoNext()) {
      this.currentIndexOtherImage++;
    } else if (this.pendingDelta < 0 && this.canGoPrev()) {
      this.currentIndexOtherImage--;
    }
    this.pendingDelta = 0;

    // Rientro
    this.animationState = 'in';
  }

  /** Inizio swipe: memorizzo la X di partenza. */
  onTouchStart(ev: TouchEvent): void {
    this.startX = ev.changedTouches[0]?.screenX ?? 0;
  }

  /** Fine swipe: valuto la distanza e decido la direzione. */
  onTouchEnd(ev: TouchEvent): void {
    const endX = ev.changedTouches[0]?.screenX ?? 0;
    const dx = endX - this.startX;
    if (Math.abs(dx) < this.SWIPE_THRESHOLD) return;

    if (dx < 0) this.vaiImmagineSuccessiva();
    else        this.vaiImmaginePrecedente();
  }

  // ===========================================================================
  // 9) CHIUSURA PANNELLO
  // ===========================================================================
  /**
   * Avvio la chiusura: applico lo stato per la classe CSS e
   * dopo la durata della transizione emetto l’evento al padre.
   */
  closeWindow(): void {
    this.attivo = false;
    this.panelClosing = true;
    setTimeout(() => this.chiudiDettaglio.emit(), this.CLOSE_MS);
  }

  // ===========================================================================
  // 10) UTILITY TIPO MEDIA (per lo switch nel template)
  // ===========================================================================
  /**
   * Verifico il tipo del media via estensione. Accetto null/undefined e
   * ritorno false in quei casi, così il template non va in errore.
   */
  checkEstensione(
    url: string | null | undefined,
    tipo: 'image' | 'video' | 'audio'
  ): boolean {
    if (!url) return false;
    const u = url.toLowerCase();
    const mapExt = {
      image: ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.avif'],
      video: ['.mp4', '.webm', '.ogg', '.mov', '.m4v'],
      audio: ['.mp3', '.wav', '.ogg', '.m4a', '.aac', '.flac'],
    } as const;
    return mapExt[tipo].some(ext => u.endsWith(ext));
  }

  // ===========================================================================
  // 11) TRACKBY PER INDICATORI
  // ===========================================================================
  /** TrackBy minimo per i pallini degli indicatori. */
  trackByIndex = (index: number) => index;
}
