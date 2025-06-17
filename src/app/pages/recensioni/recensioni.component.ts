import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { CloudinaryService } from '../../services/cloudinary.service';

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

  constructor(private cloudinaryService: CloudinaryService) {}

  ngOnInit(): void {
    this.cloudinaryService.getImmagini().subscribe(response => {
      const immagini = response?.Recensioni;

      if (Array.isArray(immagini)) {
        this.recensioni = immagini.map((item: any) => item.url);

        if (this.recensioni.length > 0) {
          // Inizio animazione sequenziale (ordine naturale)
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
