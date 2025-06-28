import {
  Component,
  OnInit,
  OnDestroy
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


export interface ImmagineMeta {
  url: string;
  angolazione: string;
}

export interface ImmagineCloudinary {
  display_name: string;
  descrizione: string;
  quantita: string;
  meta: ImmagineMeta[];
}

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
    MatCardModule
  ],
animations: [
  trigger('fadeInOut', [
    transition(':enter', [
      style({ opacity: 0 }),
      animate('2000ms ease-out', style({ opacity: 1 })),
    ]),
    transition(':leave', [
      animate('2000ms ease-out', style({ opacity: 0 })),
    ]),
  ])
]

})



export class HomeComponent implements OnInit, OnDestroy {


caroselloImmagini: string[] = [];




modelliVideoInEvidenza: ModelloEvidenza[] = [];
  constructor( private cloudinaryService: CloudinaryService,private breakpointObserver: BreakpointObserver) {}



  currentIndex = 0;
  intervalId!: ReturnType<typeof setInterval>;
  playedOnce = false;






      isMobile = false;


        // OGNI 4 secondi per oppure il tempo definito sotto dal timer chiama nextImage che cambia sempre current index cosi nel template mostro solo un immagine alla volta
    nextImage(): void {
    if (this.caroselloImmagini.length === 0) return;
    this.currentIndex = (this.currentIndex + 1) % this.caroselloImmagini.length;
  }

  ngOnInit(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });  // Rileva se il dispositivo è mobile

    //timer per avviare il carosello
      this.intervalId = setInterval(() => this.nextImage(), 2000);

//rilevo disp mobile anziche pc
  this.breakpointObserver
    .observe(['(max-width: 768px)'])
    .subscribe(result => {
      this.isMobile = result.matches;
    });

    //Carico il carosello dalla cache config
    this.cloudinaryService.getImmagini('',true).subscribe({
next: (data: Record<string, ImmagineCloudinary[]>) => {
        console.log("aa", data)
        const caroselloKey = Object.keys(data).find(d => d.toLocaleLowerCase().includes('home/carosello'));
        const videoEvidenzaHomeKey = Object.keys(data).find(d => d.toLocaleLowerCase().includes('home/video'));

// Estrae tutte le immagini dal gruppo "Carosello" nel risultato ricevuto
// Utilizza flatMap per ottenere un array piatto di URL (string[])
// Ogni elemento 'item' rappresenta un oggetto con proprietà 'display_name', 'descrizione', 'quantita' e un array 'meta'
// Per ogni elemento, mappa l'array 'meta' estraendo il campo 'url' di ciascuna immagine
// Il risultato finale è un array contenente solo gli URL delle immagini del carosello
        if(!caroselloKey){
          console.warn("Nessuna chiave trovate");
          return
        }

        console.log("Carosello immagini: ", data[caroselloKey].flatMap(item => item.meta).map(m => m.url));
        this.caroselloImmagini = data[caroselloKey].flatMap(item => item.meta).map(m => m.url);

        if(!videoEvidenzaHomeKey){
                    console.warn("Nessuna chiave trovate");
            return;
        }

        console.log("Modelli in evidenza immagini: ", data[videoEvidenzaHomeKey].flatMap(item => item.meta).map(m => m.url));
this.modelliVideoInEvidenza = data[videoEvidenzaHomeKey].flatMap(item =>
  item.meta.map(metaItem => ({
    url: metaItem.url,
    display_name: item.display_name,
    descrizione: item.descrizione
  }))
  
);

      },
      error: (err) => {
        console.error('Errore nel caricamento delle immagini', err);
      }
    });

    this.intervalId = setInterval(() => this.nextImage(), 4000);

  }


  ngOnDestroy(): void {
      clearInterval(this.intervalId);
  }


}
