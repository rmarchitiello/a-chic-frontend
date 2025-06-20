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

  isMobile = false;
  currentIndex: number | null = null;
  isPlaying = false;
  attivo = false;    // Apre pannello con animazione
  chiusura = false;  // Chiude pannello con animazione

  // Lista audio disponibili
  assetCarllonAudioUrl = [
    { nome_canzone: 'Over The Raimbow', url: 'https://res.cloudinary.com/dmf1qtmqd/video/upload/v1750144292/Over_The_Raimbow_o6gs3v_nnaa92.mp3' },
    { nome_canzone: 'Harry Potter', url: 'https://res.cloudinary.com/dmf1qtmqd/video/upload/v1750144294/Harry_Potter_ymoryk_nc4rxa.mp3' },
    { nome_canzone: 'Il Cerchio Della Vita', url: 'https://res.cloudinary.com/dmf1qtmqd/video/upload/v1750144295/Il_Cerchio_Della_Vita_egiyfx_krdqmy.mp3' },
    { nome_canzone: 'La Lelu', url: 'https://res.cloudinary.com/dmf1qtmqd/video/upload/v1750144289/La_Lelu_ailhh7_gyxvvg.mp3' },
    { nome_canzone: 'River Flows In You', url: 'https://res.cloudinary.com/dmf1qtmqd/video/upload/v1750144293/River_Flows_in_You_dcggnx_jfblym.mp3' },
    { nome_canzone: 'La Bella e la Bestia', url: 'https://res.cloudinary.com/dmf1qtmqd/video/upload/v1750144288/La_Bella_e_la_Bestia_zmy4mo_hfmcx2.mp3' },
    { nome_canzone: 'Ninna Nanna', url: 'https://res.cloudinary.com/dmf1qtmqd/video/upload/v1750144290/Ninna_Nanna_vmvcgv_t10gav.mp3' }
  ];

  constructor(private breakpointObserver: BreakpointObserver) {}

  ngOnInit(): void {
    // Attiva animazione di apertura
    setTimeout(() => this.attivo = true, 10);

    // Disabilita lo scroll globale
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';

    // Rileva se siamo su mobile
    this.breakpointObserver.observe(['(max-width: 768px)']).subscribe(result => {
      this.isMobile = result.matches;
    });
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
