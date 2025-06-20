import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { CloudinaryService } from '../../services/cloudinary.service';
import { BreakpointObserver } from '@angular/cdk/layout';

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

this.cloudinaryService.getImmagini().subscribe(response => {
  const immagini = response?.Recensioni;
  console.log("recensioni", immagini);

  if (Array.isArray(immagini)) {
    // Estrae tutti gli URL delle immagini contenute in meta[]
    this.recensioni = immagini.flatMap((item: any) =>
      item.meta.map((m: { url: string }) => m.url)
    );

    if (this.recensioni.length > 0) {
      // Avvia l'animazione sequenziale dopo un breve delay
      setTimeout(() => this.showNext(0), 800);
    }
  }
});

  }

  showNext(pos: number): void {
    if (pos >= this.recensioni.length) return;

    this.visibleIndexes.push(pos); // animazione in ordine
    setTimeout(() => this.showNext(pos + 1), 400);
  }
}
