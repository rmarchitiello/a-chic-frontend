import {
  Component,
  OnInit,
  OnDestroy,
  AfterViewInit,
  HostListener
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
import { ScrollRevealDirective } from '../../shared/directives/scroll-reveal.directive';
import { Meta, Title } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { SharedDataService } from '../../services/shared-data.service';
import { MatDialog } from '@angular/material/dialog';
import { EditAdminPopUpComponent } from '../../admin/edit/edit-admin-popup.component';



/* DEFINISCO LE INTERFACCE */
/**
 * Descrive un singolo asset (immagine, video o audio) associato a un media.
 * Include l'URL e l'angolazione dell'asset.
 */
export interface MediaAsset {
  url: string;              // URL diretto al file su Cloudinary
  angolazione: string;      // Es. 'frontale', 'laterale', 'retro'
  format?: string;          // Facoltativo: estensione (es. jpg, mp4)
}


/**
 * Descrive un media (una borsa, un video, un audio, ecc.) con tutti i suoi metadati.
 * Ogni media può avere più angolazioni (MediaAsset[]).
 */
export interface MediaItem {
  display_name: string;                    // Nome logico del media (es. "carosello1")
  type?: 'image' | 'video' | 'audio';      // Tipo del media (dedotto dal file)
  descrizione: string;                     // Descrizione testuale dell’elemento
  quantita: string;                        // Quantità disponibile (se applicabile)
  meta: MediaAsset[];                      // Lista delle angolazioni (es. frontale, laterale...)
}


/**
 * Collezione di media appartenenti a una determinata cartella Cloudinary.
 * Oggetto principale per ogni sezione (es. Carosello, Recensioni, Video in evidenza).
 */
export interface MediaCollection {
  folder: string;            // Path Cloudinary della cartella (es. "Config/Home/Carosello")
  media: MediaItem[];        // Elenco di media da mostrare nella UI
}


/*
 * ESEMPIO JSON corrispondente:

{
  "folder": "Config/Home/Carosello",
  "media": [
    {
      "display_name": "carosello1",
      "type": "image",
      "descrizione": "Borsa con dettagli dorati",
      "quantita": "5",
      "meta": [
        {
          "url": "https://res.cloudinary.com/.../image1.jpg",
          "angolazione": "frontale"
        },
        {
          "url": "https://res.cloudinary.com/.../image2.jpg",
          "angolazione": "laterale"
        }
      ]
    },
    {
      "display_name": "carosello2",
      "type": "image",
      "descrizione": "Modello nuovo estate",
      "quantita": "3",
      "meta": [
        {
          "url": "https://res.cloudinary.com/.../image3.jpg",
          "angolazione": "frontale"
        }
      ]
    }
  ]
}
*/






@Component({
  selector: 'app-home',
  standalone: true,
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule,
    MatCardModule,
    ScrollRevealDirective
  ],
  animations: [
    trigger('fadeInOut', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('2000ms ease-out', style({ opacity: 1 }))
      ]),
      transition(':leave', [
        animate('2000ms ease-out', style({ opacity: 0 }))
      ])
    ])
  ]
})
export class HomeComponent implements OnInit, OnDestroy, AfterViewInit {
  isAdmin = false;

  carosello: MediaCollection[] = [];
  recensioni: MediaCollection[] = [];
  modelliInEvidenza: MediaCollection[] = [];
  creazioni: MediaCollection[] = [];

  currentIndex = 0;
  currentRecensioneIndex = 0;
  intervalId!: ReturnType<typeof setInterval>;
  recensioneIntervalId!: ReturnType<typeof setInterval>;
  isMobile = false;
  mostraContenutoDopoCarosello = false;
  strutturaCategorie: { [key: string]: string[] | undefined } = {};
  categorieSottoCategorie: string[] = [];
  filtriSottoCategorie: Record<string, string[]> = {};
  onlyUrlBorse: string[] = [];

  constructor(
    private cloudinaryService: CloudinaryService,
    private breakpointObserver: BreakpointObserver,
    private titleService: Title,
    private metaService: Meta,
    private router: Router,
    private sharedDataService: SharedDataService,
    private dialog: MatDialog
  ) { }

  ngOnInit(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });

    this.sharedDataService.isAdmin$.subscribe((token: string | null) => {
      this.isAdmin = !!token;
    });

    this.sharedDataService.strutturaCategorie$.subscribe(data => {
      if (Object.keys(data).length > 0) this.strutturaCategorie = data;
    });

    this.sharedDataService.categorieSottoCategorie$.subscribe(data => {
      if (data.length > 0) this.categorieSottoCategorie = data;
    });

    this.sharedDataService.filtriSottoCategorie$.subscribe(data => {
      if (Object.keys(data).length > 0) this.filtriSottoCategorie = data;
    });

    setTimeout(() => {
      const result = this.mapUrlBorseCompletamente().find(mB => mB.includes("borse"));
      this.onlyUrlBorse = result ? [result] : [];
    });

    this.titleService.setTitle('A-Chic | Borse all\'uncinetto e Accessori artigianali');
    this.metaService.addTags([
      { name: 'description', content: 'Borse fatte a mano...' },
      { name: 'keywords', content: 'borse, artigianato, carillon...' },
      { property: 'og:image', content: 'https://www.a-chic.it/assets/og-image.jpg' },
      { property: 'og:url', content: 'https://www.a-chic.it/home' },
      { name: 'twitter:image', content: 'https://www.a-chic.it/assets/og-image.jpg' }
    ]);


    this.breakpointObserver.observe(['(max-width: 768px)']).subscribe(result => {
      this.isMobile = result.matches;
    });

    this.intervalId = setInterval(() => this.nextImage(), 2000);
    this.recensioneIntervalId = setInterval(() => this.nextRecensione(), 2000);

    this.cloudinaryService.getImmagini('', true).subscribe({
      next: (data: Record<string, MediaCollection[]>) => {
        const caroselloKey = Object.keys(data).find(k => k.toLowerCase().includes('home/carosello'));
        console.log("Carosellokey: ", caroselloKey);
        const recensioniKey = Object.keys(data).find(k => k.toLowerCase().includes('home/recensioni'));
        console.log("RecensioniKey: ", recensioniKey);
        const modelliEvidenzaKey = Object.keys(data).find(k => k.toLowerCase().includes('home/modelli evidenza'));
        console.log("VideoEvidenzaKey: ", modelliEvidenzaKey);
        const creazioniKey = Object.keys(data).find(k => k.toLowerCase().includes('/home/mie creazioni'));
        console.log("MieCreazioniKey: ", creazioniKey);


        // Trasformo i dati del carosello raggruppando tutte le angolazioni (meta[]) per ogni media
        // Ricostruisco this.carosello come un array di un solo oggetto MediaCollection
        if(caroselloKey){
        this.carosello = [
          {
            folder: 'Config/Home/Carosello',
            media: (data[caroselloKey] || []).map((item: any) => ({
              display_name: item.display_name,
              descrizione: item.descrizione,
              quantita: item.quantita,
              type: this.detectType(item.meta?.[0]?.url || ''),
              meta: (item.meta || []).map((meta: any) => ({
                url: meta.url,
                angolazione: meta.angolazione || 'default'
              }))
            }))
          }
        ];
        }


        console.log("[HomeComponent] -  Carosello Immagini ", this.carosello);
        if(recensioniKey){

        this.recensioni = [
          {
            folder: 'Config/Recensioni',
            media: (data[recensioniKey] || []).map((item: any) => ({
              display_name: item.display_name,
              descrizione: item.descrizione,
              quantita: item.quantita,
              type: this.detectType(item.meta?.[0]?.url || ''),
              meta: (item.meta || []).map((meta: any) => ({
                url: meta.url,
                angolazione: meta.angolazione || 'default'
              }))
            }))
          }
        ];
      }


        console.log("[HomeComponent] -  Recensioni  ", this.recensioni);

      if(modelliEvidenzaKey){
        this.modelliInEvidenza = [
          {
            folder: 'Config/Home/Video',
            media: (data[modelliEvidenzaKey] || []).map((item: any) => ({
              display_name: item.display_name,
              descrizione: item.descrizione,
              quantita: item.quantita,
              type: this.detectType(item.meta?.[0]?.url || ''),
              meta: (item.meta || []).map((meta: any) => ({
                url: meta.url,
                angolazione: meta.angolazione || 'default'
              }))
            }))
          }
        ];
      }



        console.log("[HomeComponent] -  Modelli in Evidenza  ", this.modelliInEvidenza);


        if(creazioniKey){
        this.creazioni = [
          {
            folder: 'Config/Home/MieCreazioni',
            media: (data[creazioniKey] || []).map((item: any) => ({
              display_name: item.display_name,
              descrizione: item.descrizione,
              quantita: item.quantita,
              type: this.detectType(item.meta?.[0]?.url || ''),
              meta: (item.meta || []).map((meta: any) => ({
                url: meta.url,
                angolazione: meta.angolazione || 'default'
              }))
            }))
          }
        ];
        }
        // Trasformo i dati della sezione "Mie Creazioni" in un unico oggetto MediaCollection

        
        console.log("[HomeComponent] -  creazioni  ", this.creazioni);




      },
      error: err => console.error('Errore caricamento media', err)
    });

    this.checkScroll();
  }

  detectType(url: string): 'image' | 'video' | 'audio' {
    if (url.match(/\.(mp4|webm)$/i)) return 'video';
    if (url.match(/\.(mp3|wav|ogg)$/i)) return 'audio';
    return 'image';
  }

  mapUrlBorseCompletamente(): string[] {
    const urlSet: Set<string> = new Set();
    this.categorieSottoCategorie.forEach(path => {
      const [categoria, sottoCategoria] = path.split('/');
      const url = `/${categoria.toLowerCase()}/${sottoCategoria.toLowerCase()}`;
      urlSet.add(url);
    });
    return Array.from(urlSet);
  }

  goTo(urlOrFilter: string, fromModelliInEvidenza?: boolean): void {
    if (fromModelliInEvidenza) {
      const url = `${this.onlyUrlBorse}?filtri=${encodeURIComponent(urlOrFilter)}`;
      this.router.navigateByUrl(url);
      return;
    }
    this.router.navigate([urlOrFilter]);
  }

  /* Uso questo metodo dove voglio per editare il contenuto dei media di quella*/
  apriPopUpEditorAdmin(): void {
    console.log("[HomeComponent] sto passando il carosello da editare: ", this.carosello);
    this.dialog.open(EditAdminPopUpComponent, {
      width: '90vw',
      disableClose: false,
      data: this.carosello, //ovviamente ora sto passando il carosello ma questo deve essere dinamico in base a cosa voglio editare
      panelClass: 'popup-edit-admin',
      backdropClass: 'popup-edit-admin' // importante per lo sfondo trasparente
    });


  }



  ngAfterViewInit(): void {
    setTimeout(() => {
      const videos: NodeListOf<HTMLVideoElement> = document.querySelectorAll('video');
      videos.forEach(video => {
        video.muted = true;
        video.play().catch(err => console.warn('Video non avviato:', err));
      });
    }, 300);
  }

  @HostListener('window:scroll', [])
  onWindowScroll() {
    this.checkScroll();
  }

  checkScroll() {
    const soglia = window.innerHeight * 0.6;
    this.mostraContenutoDopoCarosello = window.scrollY > soglia;
  }

  nextImage(): void {
    if (this.carosello.length === 0 || this.carosello[0].media.length === 0) return;
    const total = this.carosello[0].media.length;
    this.currentIndex = (this.currentIndex + 1) % total;
  }

  nextRecensione(): void {
    if (this.recensioni.length === 0 || this.recensioni[0].media.length === 0) return;
    const total = this.recensioni[0].media.length;
    this.currentRecensioneIndex = (this.currentRecensioneIndex + 1) % total;
  }


  ngOnDestroy(): void {
    clearInterval(this.intervalId);
    clearInterval(this.recensioneIntervalId);
  }



  //di immagine cloduinary ottengo solo quelle con angolazione frontale
  getMediaFrontale(mediaItems: MediaItem[]): MediaAsset | null {
    const item = mediaItems.find(m =>
      m.meta?.some(asset => asset.angolazione?.toLowerCase() === 'frontale')
    );
    return item?.meta.find(asset => asset.angolazione?.toLowerCase() === 'frontale') || null;
  }

  //controllo se esitono media per non far andare ngFor in errore
  hasMedia(collection: any[]): boolean {
    return Array.isArray(collection)
      && collection.length > 0
      && Array.isArray(collection[0]?.media)
      && collection[0].media.length > 0;
  }


}
