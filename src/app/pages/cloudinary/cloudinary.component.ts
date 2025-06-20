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
  import { DettagliComponent } from '../../pages/dettagli/dettagli.component';
  import { BreakpointObserver } from '@angular/cdk/layout';

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
      FormsModule,
      DettagliComponent
    ],
    templateUrl: './cloudinary.component.html',
    styleUrl: './cloudinary.component.scss'
  })
  export class CloudinaryComponent implements OnInit, OnDestroy {
    categoria: string | null = null;
    sottoCategoria: string | null = null;
    selectedAudioUrl: string | null = null;
    isPlaying = false;
    isMobile = false;
    filtroSelezionato: string = 'Tutte';
    filtriAttivi: string[] = [];
    filtriRicevuti: string[] = [];

immaginiFrontali: any[] = [];
altreImmagini: any[] = [];
immaginiFrontaliPaginata: any[] = []; // usata per la visualizzazione paginata

  //praticamente è una variabile che contiene tutte le immagini di quel dipsplay name che non sia frontale passata a dettagli component per mostrare in scroll le altre immagini
altreImmaginiSelezionate: string[] = [];


    //paginazione prendo le prime 10 foto
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
      private route: ActivatedRoute,
      private breakpointObserver: BreakpointObserver

    ) {}



/* Passo a dettagli component tramite input param nel senso non uso routing per passare i dettagli 
a DettagliComponent che è il componente figlio di ClaudinaryComponent, ma uso @Input */

immagineSelezionata: any | null = null; //variabile da passare a DettagliComponent per l'immagine selezionata

//al click dell immagine passo la singola immagine a questa funzione
onImmagineClick(item: any): void {
  console.log("Immagine cliccata:", item);

  // Salva l'immagine frontale selezionata da mostrare nel pannello
  this.immagineSelezionata = item.url;

  // Cerca le immagini correlate nel gruppo "altreImmagini", confrontando il display_name
  const immaginiCorrelate = this.altreImmagini.find(
    (a: { display_name: string }) =>
      a.display_name?.trim().toLowerCase() === item.display_name?.trim().toLowerCase()
  );

  // Estrae solo gli URL da ciascuna immagine angolata (laterale, obliqua, ecc.)
  this.altreImmaginiSelezionate = immaginiCorrelate?.meta.map(
    (m: { url: string }) => m.url
  ) || [];

  console.log("Altre immagini selezionate:", this.altreImmaginiSelezionate);

  // Blocca lo scroll della pagina mentre il pannello dettagli è aperto
  document.body.style.overflow = 'hidden';
  document.documentElement.style.overflow = 'hidden';
}


/*ora devo passare l'immagine selezionata al figlio e come si fa ? devo passarla dal template
Ovvero, nel DettagliComponent definisco @Input nomeVariabile!: any in pratica è come se DettagliComponent sta 
esponendo un campo che il Padre gli deve mandare
Il campo figlio di chiama @Input() dettaglio!: { display_name: string; url: string };
ora nel template devo passare dettaglio
        <app-dettagli [dettaglio]="immagineSelezionata"></app-dettagli>
Ovvero in DettagliComponent ci sarà una variabile dettaglio che vale immagineSelezionata passata dal padre nel template
*/

//questo serve per eliminare il ghosting tra l animazione del pannello che scompare e il tag html <app-dettagli questo perche il comando di eliminare il tag ovvero quando immagine selezionata e null e tra 400 secondi e non subito
handleChiudiDettaglio() {
  // Attendi la fine dell'animazione
  setTimeout(() => {
    this.immagineSelezionata = null;

    // Riabilita lo scroll del body
    document.body.style.overflow = '';
        document.documentElement.style.overflow = '';

  }, 400); // tempo identico all'animazione di chiusura
}

ngOnInit(): void {

//rilevo disp mobile anziche pc
  this.breakpointObserver
    .observe(['(max-width: 768px)'])
    .subscribe(result => {
      this.isMobile = result.matches;
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
  });
}





    ngOnDestroy(): void {
      this.stopAudio();
    }







caricaImmagini(): void {
  // Esce dalla funzione se non è presente la categoria
  if (!this.categoria) return;

  // Costruisce il percorso base usando categoria e sottocategoria
  const basePath = this.sottoCategoria
    ? `${this.categoria}/${this.sottoCategoria}`.toLowerCase()
    : this.categoria.toLowerCase();

  // Esegue il log del path generato
  console.log('Base path per il caricamento immagini:', basePath);

  // Chiama il servizio per ottenere tutte le immagini
  this.cloudinaryService.getImmagini().subscribe({
    next: (data: Record<string, any[]>) => {
      console.log("Dati ricevuti:", JSON.stringify(data));

      // Inizializza l’array contenente tutte le immagini della chiave
      let immaginiComplessive: any[] = [];

      // Se siamo su mobile, imposta il filtro selezionato come il primo disponibile
      if (this.isMobile) {
        this.filtroSelezionato = this.filtriRicevuti[0] || 'Tutte';
        console.log('Filtro selezionato (mobile):', this.filtroSelezionato);
      }

      if (this.filtroSelezionato === 'Tutte') {
        // Se il filtro è "Tutte", recupera tutte le immagini compatibili con il path
        immaginiComplessive = Object.keys(data)
          .filter(key =>
            key.toLowerCase() === basePath ||
            key.toLowerCase().startsWith(`${basePath}/`)
          )
          .flatMap(key => data[key]);
      } else {
        // Cerca la chiave esatta nel dataset con filtro applicato
        const chiaveFiltroCompleta = `${basePath}/${this.filtroSelezionato}`.toLowerCase();
        const chiaveReale = Object.keys(data).find(
          k => k.toLowerCase().trim() === chiaveFiltroCompleta.trim()
        );

        console.log('Chiave reale trovata:', chiaveReale);

        // Se la chiave è trovata, assegna i dati
        if (chiaveReale) {
          immaginiComplessive = data[chiaveReale];
        } else {
          console.warn('Nessuna immagine trovata per il filtro selezionato.');
        }
      }



      // Unisce tutti i meta (array di immagini per ogni voce)
const tutteLeImmagini = immaginiComplessive.flatMap(item =>
  (item.meta || []).map((img: any) => ({
    ...img,
    display_name: item.display_name,
    quantita: item.quantita
  }))
);


      
      // Estrae solo le immagini con angolazione "frontale"
      this.immaginiFrontali = tutteLeImmagini.filter(img => img.angolazione === 'frontale');

      // Salva le immagini con angolazioni diverse dalla "frontale"
      //sempre diviso per display_name da passare poi a DettagliComponent
this.altreImmagini = immaginiComplessive
  .map((item: any) => {
    const altre = (item.meta || []).filter((img: any) => img.angolazione !== 'frontale');
    if (altre.length > 0) {
      return {
        display_name: item.display_name,
        meta: altre
      };
    }
    return null;
  })
  .filter((item: any) => item !== null); // Rimuove i null





      // Calcola la paginazione sulle immagini frontali
      this.paginaCorrente = 1;
      this.numeroDiPagine = Math.ceil(this.immaginiFrontali.length / this.fotoPerPagina);
      this.immaginiFrontaliPaginata = this.immaginiFrontali.slice(0, this.fotoPerPagina);


      console.log('Immagini frontali:', this.immaginiFrontali);
      console.log("Immagini paginate frontali: ", JSON.stringify(this.immaginiFrontaliPaginata))
      console.log('Altre immagini:', JSON.stringify(this.altreImmagini));
      
    },
    error: err => console.error('Errore durante il recupero delle immagini:', err)
  });
}


caricaAltreImmagini(): void {
  // Calcola gli indici per la pagina corrente
  const inizio = (this.paginaCorrente - 1) * this.fotoPerPagina;
  const fine = this.paginaCorrente * this.fotoPerPagina;

  // Estrae la porzione paginata delle immagini frontali
  this.immaginiFrontaliPaginata = this.immaginiFrontali.slice(inizio, fine);

  console.log("Immagini frontali visibili nella pagina corrente:", JSON.stringify(this.immaginiFrontaliPaginata));

  // Scroll automatico in cima alla finestra dopo il rendering
  setTimeout(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, 100);
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
