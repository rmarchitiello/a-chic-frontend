import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { CloudinaryService } from '../../services/cloudinary.service';
import { BreakpointObserver } from '@angular/cdk/layout';
import { ImmagineCloudinary } from '../home/home.component';



@Component({
  selector: 'app-recensioni',
  standalone: true,
  imports: [CommonModule, MatCardModule],
  templateUrl: './recensioni.component.html',
  styleUrls: ['./recensioni.component.scss']
})
export class RecensioniComponent implements OnInit {
  recensioni: string[] = [];             // Contiene solo URL delle immagini
  visibleIndexes: number[] = [];         // Indici delle card visibili
  isMobile: boolean = false;
  constructor(private cloudinaryService: CloudinaryService, private breakpointObserver: BreakpointObserver) {}

  ngOnInit(): void {
    //rilevo disp mobile anziche pc
  this.breakpointObserver
    .observe(['(max-width: 768px)'])
    .subscribe(result => {
      this.isMobile = result.matches;
    });
        window.scrollTo({ top: 0, behavior: 'smooth' });  // Rileva se il dispositivo è mobile



// Carico la sezione “Recensioni” e ne estraggo tutti gli URL
this.cloudinaryService.getImmagini('', true).subscribe(
  (response: Record<string, ImmagineCloudinary[]>) => {
    // 1. Recupero in modo sicuro l’array di recensioni
    const recensioniKey = Object.keys(response).find(d => d.toLocaleLowerCase().includes('recensioni'));

    if(!recensioniKey){
          console.warn("Nessuna chiave trovate");
          return
        }


    this.recensioni = response[recensioniKey].flatMap(item => item.meta).map(m => m.url);


    console.log('recensioni', this.recensioni);

    

    // 2. Se ho almeno un URL, avvio l’animazione dopo 800 ms
    if (this.recensioni.length > 0) {
      setTimeout(() => this.showNext(0), 800);
    }
  },
  error => console.error('Errore caricamento Recensioni', error)
);




  }

  showNext(pos: number): void {
    if (pos >= this.recensioni.length) return;

    this.visibleIndexes.push(pos); // animazione in ordine
    setTimeout(() => this.showNext(pos + 1), 400);
  }
}
