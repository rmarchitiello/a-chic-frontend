import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BreakpointObserver } from '@angular/cdk/layout';
import { SharedDataService } from '../../services/shared-data.service';
import { Subject, takeUntil } from 'rxjs';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatIconModule } from '@angular/material/icon';
import { TextConfigFromCache, PageConfig, ComponentBlock, DynamicItem } from '../../app.component';
import { FormsModule } from '@angular/forms';
import { ViewChild } from '@angular/core';
import { ElementRef } from '@angular/core';
@Component({
  selector: 'app-top-banner',
  standalone: true,               // componente standalone (senza modulo dedicato)
  imports: [CommonModule,MatTooltipModule,MatIconModule,FormsModule],        // importa CommonModule per *ngIf, *ngFor ecc.
  templateUrl: './top-banner.component.html',
  styleUrls: ['./top-banner.component.scss']
})
export class TopBannerComponent implements OnInit {
  // Subject usato come notifica di distruzione per cancellare le subscription
  private readonly destroy$ = new Subject<void>();

imEditing = false;
@ViewChild('bannerInput') bannerInput?: ElementRef<HTMLInputElement>;

abilitaModifica(): void {
  this.imEditing = !this.imEditing;
  setTimeout(() => {
    const el = this.bannerInput?.nativeElement;
    if (el) {
      el.focus();
      el.setSelectionRange(el.value.length, el.value.length); // cursore a fine testo (facoltativo)
    }
  });
  console.log("Banner text: ", this.bannerText);
}
  // Flag che indica se l’utente è su mobile (<= 768px)
  isMobile = false;
  isAdmin: boolean = false;
  // Testo da mostrare nel banner (duplicato in HTML per lo scroll continuo)
  bannerText: string =
    '🚧 Sito in aggiornamento // Tutti gli articoli sono sold out // Seguici sui social per restare aggiornati sulle prossime novità ✨';

  constructor(private breakpointObserver: BreakpointObserver, private readonly sharedDataService: SharedDataService) {}

  ngOnInit(): void {

        // Sottoscrizione ai testi condivisi. Si assume che l'observable emetta TextConfigFromCache.
    this.sharedDataService.configTextShared$
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data: TextConfigFromCache | null) => {

          // Estrazione del testo del banner dalla pagina "home" e dal componente "TopBannerComponent"
          this.bannerText = this.getTopBannerText(data) ?? '';
        },
        error: (err) => {
          // Gestione semplice dell'errore. In produzione valuta un logger centralizzato.
          console.error('configTextShared$ error:', err);
          this.bannerText = '';
        },
      });

          this.sharedDataService.isAdmin$
      .pipe(takeUntil(this.destroy$))
      .subscribe(isAdmin => {
        this.isAdmin = isAdmin;
        console.log("Banner in admin?: ", this.isAdmin);
      });


    // Osserva i cambi di dimensione dello schermo
    // Se la viewport è <= 768px imposta isMobile = true
    this.breakpointObserver
      .observe(['(max-width: 768px)'])
      .subscribe(result => {
        this.isMobile = result.matches;
      });
  }


  /**
 * Ritorna tutti il testo dei banner (TopBannerComponent) della pagina "home".
 */
private getTopBannerText(cfg: TextConfigFromCache | null, sep = ' // '): string {
  if (!cfg) return '';

  const homePage = cfg.pages.find((p: PageConfig) => p.name === 'home');
  if (!homePage) return '';

  const topBannerComp = homePage.components.find(
    (c: ComponentBlock) => c.type === 'TopBannerComponent'
  );
  if (!topBannerComp || !Array.isArray(topBannerComp.items)) return '';

  const texts = topBannerComp.items
    .map((it: DynamicItem) => {
      const raw = it['text'];
      return typeof raw === 'string' ? raw.trim() : '';
    })
    .filter(t => t.length > 0);

  // deduplica e concatena
  const unique = Array.from(new Set(texts));
  return unique.join(sep);
}


}
