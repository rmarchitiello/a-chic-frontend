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
    state('in', style({ transform: 'translateY(0)', opacity: 1 })),
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
  // Stato per attivare la sfocatura e lo sfondo dell’overlay
  attivo = false;

  // Stato per attivare l’animazione CSS di sfocatura in uscita
  panelClosing = false;

  // Stato per attivare l’animazione Angular del pannello audio
  panelAnimationState: 'in' | 'out' = 'in';

  // Stato responsive
  isMobile = false;

  // Output verso il padre: notifico che l’animazione è finita e può togliere il componente
  @Output() chiusuraAnimazioneCompleta = new EventEmitter<void>();

  currentIndex: number | null = null;
  isPlaying = false;

  // Lista di melodie disponibili
  assetCarllonAudioUrl = [
    { nome_canzone: 'Over The Raimbow', url: 'https://res.cloudinary.com/dmf1qtmqd/video/upload/v1750585255/Audio/Over_The_Raimbow_vyzoko.mp3' },
    { nome_canzone: 'Harry Potter', url: 'https://res.cloudinary.com/dmf1qtmqd/video/upload/v1750585254/Audio/Harry_Potter_jv8kjx.mp3' },
    { nome_canzone: 'Il Cerchio Della Vita', url: 'https://res.cloudinary.com/dmf1qtmqd/video/upload/v1750585254/Audio/Il_Cerchio_Della_Vita_awkrzg.mp3' },
    { nome_canzone: 'La Lelu', url: 'https://res.cloudinary.com/dmf1qtmqd/video/upload/v1750585255/Audio/La_Lelu_fhkzum.mp3' },
    { nome_canzone: 'River Flows In You', url: 'https://res.cloudinary.com/dmf1qtmqd/video/upload/v1750585255/Audio/River_Flows_in_You_dj3gid.mp3' },
    { nome_canzone: 'La Bella e la Bestia', url: 'https://res.cloudinary.com/dmf1qtmqd/video/upload/v1750585254/Audio/La_Bella_e_La_Bestia_pvsvs2.mp3' },
    { nome_canzone: 'Ninna Nanna', url: 'https://res.cloudinary.com/dmf1qtmqd/video/upload/v1750585255/Audio/Ninna_Nanna_ikcinv.mp3' }
  ];
  constructor(private breakpointObserver: BreakpointObserver) {}

  ngOnInit(): void {
    // Imposta "mobile" se la viewport è inferiore a 768px
    this.breakpointObserver
      .observe(['(max-width: 768px)'])
      .subscribe(result => {
        this.isMobile = result.matches;
      });

    // Attiva la classe .attiva (overlay visibile) dopo il rendering iniziale
    setTimeout(() => {
      this.attivo = true;
      this.panelAnimationState = 'in';
    }, 10);
  }

  /**
   * Chiude il pannello:
   * - Rimuove la classe .attiva per l’overlay
   * - Avvia l’animazione Angular "out" verso il basso
   * - Dopo 400ms notifica il padre con chiusuraAnimazioneCompleta
   */

closeWindow(): void {
  this.attivo = false;
  this.panelClosing = true;
  this.panelAnimationState = 'out';

  setTimeout(() => {
    this.chiusuraAnimazioneCompleta.emit();  // Notifica il padre dopo animazione
    this.panelClosing = false;
  }, 400); // Deve combaciare con la durata SCSS + Angular
}


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
