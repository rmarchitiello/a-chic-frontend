  import {
    Component,
    OnInit,
    OnDestroy,
    ViewChild,
    ElementRef
  } from '@angular/core';
  import { CommonModule } from '@angular/common';
  import { CloudinaryService } from '../../services/cloudinary.service';
  import { ActivatedRoute } from '@angular/router';

  import { MatCardModule } from '@angular/material/card';
  import { MatButtonModule } from '@angular/material/button';
  import { MatSelectModule } from '@angular/material/select';
  import { MatFormFieldModule } from '@angular/material/form-field';
  import { MatSidenavModule } from '@angular/material/sidenav';
  import { MatToolbarModule } from '@angular/material/toolbar';
  import { MatListModule } from '@angular/material/list';
  import { MatIconModule } from '@angular/material/icon';
  import { MatExpansionModule } from '@angular/material/expansion';
  import { FormsModule } from '@angular/forms';
  import { combineLatest } from 'rxjs';

  @Component({
    selector: 'app-cloudinary',
    standalone: true,
    imports: [
      CommonModule,
      MatCardModule,
      MatButtonModule,
      MatSelectModule,
      MatFormFieldModule,
      MatSidenavModule,
      MatToolbarModule,
      MatListModule,
      MatIconModule,
      MatExpansionModule,
      FormsModule
    ],
    templateUrl: './cloudinary.component.html',
    styleUrl: './cloudinary.component.scss'
  })
  export class CloudinaryComponent implements OnInit, OnDestroy {
    immagini: any[] = [];
    immaginiVisibili: any[] = [];
    categoria: string | null = null;
    sottoCategoria: string | null = null;
    configurazioni: any[] = [];
    selectedAudioUrl: string | null = null;
    isPlaying = false;
    isMobile = false;
    filtroSelezionato: string = 'Tutte';
    filtriAttivi: string[] = [];
    filtriRicevuti: string[] = [];

    //paginazione prendo le prime 10 foto
    minIndexfotoPerPagina: number = 0;  //con questi due dico prendimi le prime 10 foto
    fotoPerPagina: number = 10;
    numeroDiPagine: number = 0; // da calcolare in carica immagini divisione tra foto trovate tutte / quante foto voglio vedere
    paginaCorrente: number = 1; //setto la pagina corrente ovvio 1 perche mi serve nel metodo carica altri per incrementare la pagina
    @ViewChild('audioPlayer', { static: true }) audioPlayer!: ElementRef<HTMLAudioElement>;

paginaPrecedente(): void {
  if (this.paginaCorrente > 1) {
    this.paginaCorrente--;
    this.caricaAltreImmagini();
  }
}

paginaSuccessiva(): void {
  if (this.paginaCorrente < this.numeroDiPagine) {
    this.paginaCorrente++;
    this.caricaAltreImmagini();
  }
}
    assetAudioUrl: any[] = [
      { nome_canzone: 'Over The Raimbow', url: 'https://res.cloudinary.com/dmf1qtmqd/video/upload/v1750144292/Over_The_Raimbow_o6gs3v_nnaa92.mp3' },
      { nome_canzone: 'Harry Potter', url: 'https://res.cloudinary.com/dmf1qtmqd/video/upload/v1750144294/Harry_Potter_ymoryk_nc4rxa.mp3' },
      { nome_canzone: 'Il Cerchio Della Vita', url: 'https://res.cloudinary.com/dmf1qtmqd/video/upload/v1750144295/Il_Cerchio_Della_Vita_egiyfx_krdqmy.mp3' },
      { nome_canzone: 'La Lelu', url: 'https://res.cloudinary.com/dmf1qtmqd/video/upload/v1750144289/La_Lelu_ailhh7_gyxvvg.mp3' },
      { nome_canzone: 'River Flows In You', url: 'https://res.cloudinary.com/dmf1qtmqd/video/upload/v1750144293/River_Flows_in_You_dcggnx_jfblym.mp3' },
      { nome_canzone: 'La Bella e la Bestia', url: 'https://res.cloudinary.com/dmf1qtmqd/video/upload/v1750144288/La_Bella_e_la_Bestia_zmy4mo_hfmcx2.mp3' },
      { nome_canzone: 'Ninna Nanna', url: 'https://res.cloudinary.com/dmf1qtmqd/video/upload/v1750144290/Ninna_Nanna_vmvcgv_t10gav.mp3' }
    ];

    constructor(
      private cloudinaryService: CloudinaryService,
      private route: ActivatedRoute
    ) {}


ngOnInit(): void {

  this.isMobile = window.innerWidth <= 768;
  window.addEventListener('resize', () => {
    this.isMobile = window.innerWidth <= 768;
  });

  // Unisce parametri di route e query parametri
  combineLatest([
    this.route.paramMap,
    this.route.queryParams
  ]).subscribe(([params, queryParams]) => {
    console.log('Evento route attivo');
        // Scrollo in cima alla finestra
    window.scrollTo({ top: 0, behavior: 'smooth' });  // Rileva se il dispositivo è mobile
    // Ferma l'audio se attivo
    this.stopAudio();

    // Recupera categoria e sottocategoria dalla route
    this.categoria = params.get('categoria');
    this.sottoCategoria = params.get('sottoCategoria');
    console.log('Categoria:', this.categoria);
    console.log('Sottocategoria:', this.sottoCategoria);

    // Recupera filtri da query param
    const raw = queryParams['filtri'];
    const filtriRicevuti = raw ? (Array.isArray(raw) ? raw : [raw]) : [];
    this.filtriRicevuti = filtriRicevuti;
    this.filtroSelezionato = filtriRicevuti[0] || 'Tutte';
    this.filtriAttivi = ['Tutte', ...filtriRicevuti.filter(f => f !== 'Tutte')];

    console.log('Filtri ricevuti:', this.filtriRicevuti);
    console.log('Filtro selezionato:', this.filtroSelezionato);
    console.log('Mobile:', this.isMobile);

    // Carica immagini e configurazioni (sia su mobile che desktop)
    this.caricaImmagini();
    this.caricaConfigurazioni(this.sottoCategoria);
  });
}





    ngOnDestroy(): void {
      this.stopAudio();
    }






    caricaConfigurazioni(sottoCategoria: any): void {
      this.cloudinaryService.getConfig(sottoCategoria).subscribe({
        next: (data) => {
          const chiave = this.primaLetteraGrande(this.sottoCategoria);
          const configurazioniTrovate = data[chiave];
          this.configurazioni = Array.isArray(configurazioniTrovate) ? configurazioniTrovate : [];
        },
        error: () => {
          this.configurazioni = [];
        }
      });
    }

    caricaImmagini(): void {
  // Se non c'è categoria, esce dalla funzione
  if (!this.categoria) return;

  // Costruisce il percorso base in base a categoria e sottocategoria
  const basePath = this.sottoCategoria
    ? `${this.categoria}/${this.sottoCategoria}`.toLowerCase()
    : this.categoria.toLowerCase();

  console.log('Base path per il caricamento immagini:', basePath);

  // Recupera tutte le immagini da Cloudinary
  this.cloudinaryService.getImmagini().subscribe({
    next: (data: Record<string, any[]>) => {
      let immaginiDaMostrare: any[] = [];
      // Se siamo su mobile, selezioniamo il primo filtro ricevuto
      if (this.isMobile) {
        this.filtroSelezionato = this.filtriRicevuti[0] || 'Tutte';
        console.log('Filtro selezionato da mobile:', this.filtroSelezionato);
      }

      // Se il filtro è "Tutte", mostra tutte le immagini della categoria e sottocategorie
      if (this.filtroSelezionato === 'Tutte') {
        immaginiDaMostrare = Object.keys(data)
          .filter(key =>
            key.toLowerCase() === basePath ||
            key.toLowerCase().startsWith(`${basePath}/`)
          )
          .flatMap(key => data[key]);

        console.log('Caricamento immagini con filtro "Tutte" - immagini trovate:', immaginiDaMostrare.length);
      } else {
        // Altrimenti cerca la chiave corrispondente alla categoria/sottocategoria/filtro
        const chiaveFiltroCompleta = `${basePath}/${this.filtroSelezionato}`.toLowerCase();
        const chiaveReale = Object.keys(data).find(
          k => k.toLowerCase().trim() === chiaveFiltroCompleta.trim()
        );

        console.log('Chiave filtro completa cercata:', chiaveFiltroCompleta);
        console.log('Chiave reale trovata:', chiaveReale);

        // Se trovata, carica le immagini associate
        if (chiaveReale) {
          immaginiDaMostrare = data[chiaveReale];
          console.log('Immagini trovate per il filtro specifico:', immaginiDaMostrare.length);
        } else {
          console.warn('Nessuna immagine trovata per il filtro selezionato.');
        }
      }

      // Salva le immagini trovate
      this.immagini = immaginiDaMostrare;
          
      console.log('Immagini assegnate al componente: ', this.immagini.length);

      console.log("Immagini da scaricate: ", JSON.stringify(this.immagini));

      //Paginazione mostro le prime 10 foto
      this.immaginiVisibili = this.immagini.slice(this.minIndexfotoPerPagina, this.fotoPerPagina);
      console.log("Immagini paginate assegnate: ", JSON.stringify(this.immaginiVisibili.length));
      console.log("Immagini paginate: ", JSON.stringify(this.immaginiVisibili));
      this.numeroDiPagine = Math.ceil(this.immagini.length / this.fotoPerPagina)
      console.log("Pagine Calcolate: ", this.numeroDiPagine);



    },

    error: err => console.error('Errore nel recupero delle immagini da Cloudinary:', err)
  });
}

caricaAltreImmagini(){  //1 e la pagina precedente 
      const inizio = (this.paginaCorrente - 1) * this.fotoPerPagina
      const fine = this.paginaCorrente * this.fotoPerPagina
      this.immaginiVisibili = this.immagini.slice(inizio, fine);

      console.log("Immagini successive pagina: ", JSON.stringify(this.immaginiVisibili));

        // Scrollo in cima alla finestra
    window.scrollTo({ top: 0, behavior: 'smooth' });

}


    togglePlayback(): void {
      const player = this.audioPlayer.nativeElement;
      if (!this.selectedAudioUrl) return;
      if (this.isPlaying) {
        player.pause();
        this.isPlaying = false;
      } else {
        player.src = this.selectedAudioUrl;
        player.play()
          .then(() => this.isPlaying = true)
          .catch(err => console.error('Errore audio:', err));
      }
    }

stopAudio(): void {
  // Evita errore se il player non è inizializzato
  if (!this.audioPlayer) return;

  const player = this.audioPlayer.nativeElement;
  player.pause();
  player.currentTime = 0;
  this.isPlaying = false;
}

    onAudioChange(): void {
      this.stopAudio();
      this.isPlaying = false;
    }

    primaLetteraGrande(str: any): string {
      if (!str) return '';
      return str.charAt(0).toUpperCase() + str.slice(1);
    }
  }
