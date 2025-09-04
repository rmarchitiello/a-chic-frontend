/* Uso questo metodo dove voglio per editare il contenuto dei media di quella*/
/* come funzionano i pop up
 
Quanod apro un pop up nel mio home component html viene generato un <div class="cdk-overlay-pane popup-edit-admin"> con un   <div class="mat-dialog-container">

ovvero questo templattino qua 
<div class="cdk-overlay-pane popup-edit-admin">
<div class="mat-dialog-container">
  <!-- il tuo template -->
</div>
</div>
Ora quando indico un panelClass quindi una classe personalizzata devo scrivere nel scss home component 
🔍 ::ng-deep .popup-edit-admin .mat-dialog-container { ... }
il che vuol dire :

::ng-deep
→ Dice ad Angular:
“Applica questi stili anche ai componenti figli, anche se sono incapsulati.”
(Serve perché Angular normalmente isola gli stili di ogni componente.)

.popup-edit-admin
→ È la classe personalizzata che hai specificato in panelClass quando hai aperto il dialog. Cioe non la definisco nel mio scss ma:
“Quando crei il popup, aggiungi la classe popup-edit-admin al contenitore principale del dialog.”
Ottenendo quest html:

<div class="cdk-overlay-pane popup-edit-admin">
<mat-dialog-container>
  <!-- Qui dentro c'è il tuo template -->
</mat-dialog-container>
</div>


.mat-dialog-container
→ È il contenitore interno usato da Angular Material per il contenuto del dialog.
Tu non lo scrivi, ma Angular Material lo crea automaticamente.

ORA LA PARTE IMPORTANTE E MAT-DIALOG-CONTAINER PERCHE LI ASSEGNAMO LA CLASSE 
/* Stili per il contenitore esterno del dialog: cdk-overlay-pane */
//      ::ng-deep .popup-edit-admin {
//          display: flex !important;
//          justify-content: center;
//          align-items: center;
//          background: rgba(0, 0, 0, 0.6); /* Sfondo scuro se vuoi */
//}

/* Stili per il contenitore interno del contenuto del dialog */
//  ::ng-deep .popup-edit-admin .mat-dialog-container {
//      width: 90vh !important;
//      height: 90vh !important;
//      max-width: 100vw !important;
//      max-height: 100vh !important;
//      border-radius: 20px;
//      background-color: white;
//      padding: 2rem;
//      overflow: auto;
//      box-shadow: 0 0 20px rgba(0, 0, 0, 0.2);
//}

/*quindi con il primo stile sto dicendo ng deep definisco la classe popup-edit-admin questa classe per poi fare 
::ng-deep .popup-edit-admin .mat-dialog-container { CIOE IL MATDIALOG CONTAINER DI POP UP EDIT ADMIN DEVE ESSERE COSI
PER DEFINIRE POI IL MIO POP UP <div class="cdk-overlay-pane popup-edit-admin">
<mat-dialog-container class="mat-dialog-container">
  <!-- Qui va il tuo componente -->
</mat-dialog-container>
</div>
MAGARI PER DARE UNA BORDATURA ECC

se non metto panel class non posso dire il pop up lo voglio quadrato

in definitiva popup-admin-color  quando viene passato serve per settare il contenitore del pop up se quello e piccolo tutto il pop up sara piccolo
e quindi si fa questa cosa:

::ng-deep .popup-admin-color {
display: flex !important;
justify-content: center;
align-items: center;
background: rgba(0, 0, 0, 0.6); // Sfondo dietro la modale
padding: 1rem; // Importante per evitare che il contenitore tocchi i bordi
box-sizing: border-box;
}
*/

/* INIZIO SPIEGAZIONE CAROSELLI CON NGX-FLICKING*/


/* Per i caroselli installo 
• @egjs/ngx-flicking (il componente Angular del carosello)
• @egjs/flicking-plugins (autoplay, frecce, pallini, ecc.)

npm i @egjs/ngx-flicking @egjs/flicking-plugins

Come faccio a vedere i plugin a disposizione?
vado qui C:\aChicConsole\a-chic-frontend\node_modules\@egjs\flicking-plugins\dist
ci sono vari css se voglio utilizzare per esempio i pagination faccio nel ts cosi 

import { Pagination } from '@egjs/flicking-plugins';
e in plugin faccio
plugins: Plugin[] = [
  new Arrow(),
  new Pagination({ type: 'bullet' })
];

Pero se poi voglio usare i pallini devo importare anche il css dei pallini e questo mi conviene farlo nello style.css
@import "@egjs/flicking-plugins/dist/pagination.css";

per mettere i pallini uso questo tag html
<div in-viewport class="flicking-pagination"></div>

Se voglio sovrascrivere questo stile basta andare in a-chic-console ecc e prendere il css pagination.css
prendo la classe flicking-pagination e magari voglio cambiare come devono essewre i bullet quindi la copio dal  file 
.flicking-pagination-bullet {
  display: inline-block;
  width: 8px;
  height: 8px;
  margin: 0 4px;
  border-radius: 50%;
  background-color: rgb(10 10 10 / 10%); --> imposto red !important per esempio cosi vado a sovrascrivere
  cursor: pointer;
  font-size: 1rem;
}

Come funziona ngx-flicking
si inserisce questo tag e poi tutto sotto di lui deve avere tag flicking-panel per collegarlo al pannello di sopra
      <ngx-flicking
        #flickingTag
        [options]="car.options"
        [plugins]="car.plugins"
        [ngClass]="car.otherOption.wrapperClass" 
        (changed)="onChangedCarosello($event, car.otherOption.onChangedCarosello)"
        (mousedown)="saveAsseX($event)"
        (mouseup)="checkIfScrollDxorSx($event, i)"
        (touchstart)="saveAsseX($event)"
        (touchend)="checkIfScrollDxorSx($event, i)"
        aria-roledescription="carousel"
        [attr.aria-label]="car.otherOption.titoloSezione || 'Carosello'"
      >
  <div
    flicking-panel
    *ngFor="let n of slides"
    style="
      width:100%;
      height:220px;
      display:flex;
      cursor: pointer;
      align-items:center;
      justify-content:center;
      background:#eee;
      border-radius:12px;
      margin:0 8px;
      font-weight:600;
    "
  >
    Slide {{ n }}
  </div>

  // ScrollOption è tipizzato come Partial<FlickingOptions>
  // → significa che puoi definire solo le proprietà che ti servono
  //   senza dover scrivere tutte quelle disponibili in FlickingOptions.
  scrollOption: Partial<FlickingOptions> = {
    // rende il carosello "circolare" (loop infinito)
    // → se sei all’ultima slide e vai avanti, torni alla prima
    // → se sei alla prima e vai indietro, vai all’ultima
    circular: true,

    // durata dell’animazione della *camera* quando cambia slide
    // valore predefinito = 500 (ms)
    // se lo imposti a 0:
    //   → disattivi l’animazione della camera
    //   → la camera salta subito alla nuova posizione
    //   → utile insieme al plugin Fade, perché così non vedi lo "scorrimento" laterale
    duration: 0, //funziona al click subito cambia slide con inputType[] che non imposto nulla non slida piu

    // tipo di movimento usato quando fai swipe o cambi slide
    // - "snap" (default): la slide si "aggancia" sempre alla più vicina
    // - "freeScroll": scorrimento libero con inerzia (puoi fermarti a metà slide)
    // - "strict": simile a snap, ma più rigido sul conteggio delle slide
    // NB: se usi "freeScroll", il plugin Fade perde senso perché la camera continuerà a muoversi
    moveType: "snap", 
    inputType: [] //se faccio cosi il carosello non è slideabile ma solo cliccando prev e next
  };

  Il move type puo essere
  "snap" → scatta sempre alla slide più vicina (default).
  "freeScroll" → scorrimento libero con inerzia; puoi fermarti “a metà” tra le slide.
  "strict" → simile a snap ma con controllo più rigido del cambio slide (utile con changeOnHold). 

  //occhio che ogni plugin si attacca a un solo flicking quindi piu flicking piu plugin
  plugins: Plugin[] = [
    new Fade(),   // gestisce la transizione a dissolvenza
    new Arrow(),
    new Pagination({ type: 'bullet' }),
    new AutoPlay({ duration: 3000 })
  ];



  /* Esempio, come ottengo l indice corrente? 
  voglio fare in modo da ottenere l indice corrente del carosello
  purtroppo non esiste un opzione index quindi cosa faccio, 
  intercetto l'evento NON NATIVO di angular ma NATIVO DI ngx-flicking
  quest evento si chiama (changed)="getIndiceCorrente($event)"
  e in questo evento ci sono N proprita una di queste e index. ogni volta che cambia quel tag
  assegno l index a una variabile di classe
  Se la voglio leggere per esempio al click, creo un evento in questo caso NATIVO di angular (click)="ottengoIndiceCorrente()" ma non faccio $event
  perche altrimenti catturo l'evento di click. Al click vado a leggere esempioIndex
  di seguito l'html  di esempio
  <ngx-flicking
    [options]="scrollOption"
    (changed)="getIndiceCorrente($event)"
    (click)="ottengoIndiceCorrente()"
    [plugins]="plugins"
    style="display:block; width:100%;"
  >
  Supponiamo che al click voglio andare nell indice 4   
  
  ottengoIndiceCorrente(){
    console.log("Sono nell indice: ", this.esempioIndex)
    //voglio andare all indice 3 faccio
    this.esempioIndex = 3
    pero devo dire al tag guarda devi andare all indice 3 allora uso view child quindi inizio a lavorare sul tag tramite #flickingTag 
  
    <ngx-flicking
    #flickingTag
    [options]="scrollOption"
    (changed)="getIndiceCorrente($event)"
    (click)="ottengoIndiceCorrente()"
    [plugins]="plugins"
    style="display:block; width:100%;"
  >
    import import { ViewChild } from "@angular/core";
  import { NgxFlickingComponent } from "@egjs/ngx-flicking";
  
  poi   @ViewChild("flickingTag") flickingTag?: NgxFlickingComponent;
  e nella
  
  ottengoIndiceCorrente(){
    console.log("Sono nell indice: ", this.esempioIndex)
    //voglio andare all indice 3 faccio
    this.esempioIndex = 3
    this.flickingTag?.moveTo(this.esempioIndex)
  }
  */
/* ORA QUESTI VIEWCHILD NON SERVONO PIU PERCHE PASSIAMO IL RIFERIMENTO DIRETTAMENTE NEI METODI SENZA LEGGERLO DA QUA
@ViewChild("flickingTag") flickingTag?: NgxFlickingComponent;
@ViewChild("flickingTag2") flickingTag2?: NgxFlickingComponent;
 
Occhio nu ngx-flicking abbiamo anche l evento (ready)="onReadyCarosello($event)" possiamo leggere gli indici appena starta carosello, applicare classi ecc...
 


/* Essendo che ho inserito adesso dei caroselli dinamici, per recupeare tutte le ref dei miei caroselli devo creare un query list di flickingTag
  Quindi flickingRefs contiene tutte le reference nel dom di quanti flickingTag ci sono questo perche ogni carosello ha una sua reference e abbiamo visto
  che con le reference posso agire sugli indici del carosello su classi attributi e cosi via  
  @ViewChildren('flickingTag') flickingRefs!: QueryList<NgxFlickingComponent>;


  // IMPORTANTE SPIEGAZIONE //
   Definisco un array di flickingRefs per convertire il query list in array perche . . . 
  Inizialmente il metodo checkIfScrollDxorSx( $event, flickingTag) prendeva in ingresso l'evento e la reference statica esempio ho due caroselli allora
  checkIfScrollDxorSx( $event, flickingTagCarosello1) e checkIfScrollDxorSx( $event, flickingTagCarosello2), invece ora faccio checkIfScrollDxorSx( $event, 0)
  o checkIfScrollDxorSx( $event, 1) e cosi via in base a quanti caroselli ho allora cosa faccio nell afterview initi quando non tutto il dom e caricato
  prendo la reference dei flickingTag e costruisco prima la query list e converto l'array di quanti flicking component di tipo flickingTag esistono nel dom
  cosi che nel metodo checkIfScrollDxorSx recupero esempio flickingRefsArray[0] cosi che da passarlo a prev index ecc per fare cose 
  flickingRefsArray: NgxFlickingComponent[] = [];
  O meglio La regola è questa quando ho una reference in ngx-flicking nell afterViewInit posso convertire quella lista in un array di NgxFlickingComponent
  però se poi voglio recuperare il singolo NgxFlickingComponent non lo posso fare nell afterViewInit perche i pannelli interni (cioe le slide interne )
  non sono ancora caricate perche i pannelli interni vengono renderizzati dopo allora cosa si fa si crea un evento (ready) dove li dice OK è tutto pronto
  tutto inizializzato adesso possiamo calcolare la lunghezza di ogni pannello recuperare indici in maniera piu corretta.

  " ******In definitiva *****
  1)  Tutte le reference ovvero tutti i ViewChild o ViewChildre, li salvo nell afterviewinit perche prende i riferimenti angular
  2)  Tutti i pannelli figli ecc ecc li devo caricare in un evento (ready) 
  
  Quindi di solito le reference vengono messe nella after view init ma ora, le metto nell on ready perche la reference e su ngx-flicking carosello dinamico

  Se voglio conoscere in ogni carosello quanta roba ce allora nell evento ready inserisco tutto quello che voglio sapere per esempio loggare 
  this.console.log("aaaaaa", this.flickingTagsArray[0]?.panels.length);
  oppure se non voglio caricare subito allora, in un metodo a parte magari in mousedown chiamo la console.log("aaaaaa", this.flickingTagsArray[0]?.panels); e 
  il valore esiste perche il pannello è caricato e cosi via

  ""

  // FINE IMPORTANTE SPIEGAZIONE //




   Contesto: Flicking con { duration: 0, inputType: [] }.
     Lo swipe è simulato con eventi nativi mouse/touch.
     Obiettivo: bloccare lo scroll del body solo quando l’utente sta realmente “agendo col carosello”
     (swipe orizzontale deciso), ma consentire sempre lo scroll verticale del body quando lo scostamento su Y è alto. 

  // Coordinate iniziali del gesto (start)
  asseX: number = 0;
  asseY: number = 0;

  // Soglia in px per distinguere tap/movimento minimo da gesto intenzionale
  private readonly THRESHOLD = 15;

  // Stato interno per la durata del gesto corrente
  private _bodyLocked = false; // true se è stato bloccato lo scroll del body durante il gesto
  private _decided = false;    // true quando è stata decisa l’intenzione (orizzontale vs verticale)

  
   * START gesto (mousedown/touchstart)
   * - Salva X/Y iniziali.
   * - Su touch, attacca un listener temporaneo a touchmove (passive:false) per decidere presto
   *   se il gesto è orizzontale o verticale:
   *     • Orizzontale oltre soglia → blocca body per evitare scroll della pagina.
   *     • Verticale oltre soglia → non bloccare, lascia scorrere il body.
   
  saveAsseX(event: any) {
    // reset stato a ogni nuovo gesto
    this._decided = false;
    this._bodyLocked = false;

    if (event instanceof TouchEvent) {
      // Punto iniziale del dito
      this.asseX = event.touches[0].clientX;
      this.asseY = event.touches[0].clientY;

      // Listener temporanei legati al solo gesto corrente
      const onMove = (e: TouchEvent) => {
        const x = e.touches[0].clientX;
        const y = e.touches[0].clientY;
        const dx = Math.abs(x - this.asseX);
        const dy = Math.abs(y - this.asseY);

        // Decidi una sola volta quando si supera la soglia di intenzione
        if (!this._decided && (dx > this.THRESHOLD || dy > this.THRESHOLD)) {
          this._decided = true;

          if (dx > dy) {
            // Gesto prevalentemente orizzontale → si sta “agendo col carosello”
            // Blocca lo scroll verticale del body durante il trascinamento
            document.body.style.overflow = 'hidden';
            this._bodyLocked = true;

            // Impedisci lo scroll del body mentre si trascina orizzontalmente
            e.preventDefault();
          } else {
            // Gesto prevalentemente verticale → non bloccare lo scroll del body
            // Puoi staccare subito onMove: la decisione è presa
            window.removeEventListener('touchmove', onMove as any, { capture: false } as any);
          }
        } else if (this._bodyLocked) {
          // Se il body è già lockato (gesto orizzontale deciso), continua a prevenire lo scroll del body
          e.preventDefault();
        }
      };

      const onEnd = () => {
        // Pulizia listener a fine gesto
        window.removeEventListener('touchmove', onMove as any, { capture: false } as any);
        window.removeEventListener('touchend', onEnd as any, { capture: false } as any);
        window.removeEventListener('touchcancel', onEnd as any, { capture: false } as any);
      };

      // Registra i listener SOLO per questo gesto
      // Importante: passive:false su touchmove per poter chiamare preventDefault()
      window.addEventListener('touchmove', onMove as any, { passive: false });
      window.addEventListener('touchend', onEnd as any);
      window.addEventListener('touchcancel', onEnd as any);

    } else if (event instanceof MouseEvent) {
      // Punto iniziale del mouse (di norma non si blocca lo scroll del body su desktop)
      this.asseX = event.clientX;
      this.asseY = event.clientY;
    }
    console.log('Start X/Y:', this.asseX, this.asseY);
  }

  
   * END gesto (mouseup/touchend)
   * - Confronta le coordinate finali con quelle iniziali.
   * - Regole:
   *    • Se lo scostamento verticale è prevalente e sopra soglia → non muovere il carosello, lascia scorrere il body.
   *    • Se lo scostamento orizzontale è prevalente e sopra soglia → muovi il carosello (prev/next).
   *    • Se movimento minimo → nessuna azione (click/tap).
   * - Sblocca sempre il body se era stato bloccato durante il gesto.
   
  checkIfScrollDxorSx(event: any, indexCurrentFlickingRefs: number) {
    // Se il target è una freccia, lascia gestire al plugin Arrow
    const isArrow = (event.target as HTMLElement)?.closest('.flicking-arrow-prev, .flicking-arrow-next');
    if (isArrow) return;

    const totale = this.flickingRefsArray[indexCurrentFlickingRefs]?.panels.length;

    console.log("Totale slide: ", totale)
    // Coordinate finali
    let endX = 0;
    let endY = 0;
    if (event instanceof MouseEvent) {
      endX = event.clientX;
      endY = event.clientY;
    } else if (event instanceof TouchEvent) {
      endX = event.changedTouches[0].clientX;
      endY = event.changedTouches[0].clientY;
    }

    // Delta rispetto al punto iniziale
    const deltaX = endX - this.asseX;
    const deltaY = endY - this.asseY;

    // Decisione finale:
    // 1) Prevalgono i movimenti verticali oltre soglia → non muovere il carosello, lascia scorrere la pagina.
    if (Math.abs(deltaY) > Math.abs(deltaX) && Math.abs(deltaY) > this.THRESHOLD) {
      // Sblocco body se era stato bloccato per errore
      if (this._bodyLocked) {
        document.body.style.overflow = '';
        this._bodyLocked = false;
      }
      // console.log('Gesto verticale → scroll body');
      return;
    }

    // 2) Prevalgono i movimenti orizzontali oltre soglia → naviga nel carosello
    if (Math.abs(deltaX) > this.THRESHOLD) {
      if (deltaX > 0) {
        // Gesto da sinistra verso destra → slide precedente
        this.prevIndex(totale, this.flickingRefsArray[indexCurrentFlickingRefs]);
        // console.log('Swipe orizzontale → prev');
      } else {
        // Gesto da destra verso sinistra → slide successiva
        this.nextIndex(totale, this.flickingRefsArray[indexCurrentFlickingRefs]);
        // console.log('Swipe orizzontale → next');
      }
    } else {
      // 3) Movimento minimo → nessuna azione (click/tap)
      // console.log('Movimento minimo → nessuna navigazione');
    }

    // In ogni caso, a fine gesto sblocca il body se era stato bloccato
    if (this._bodyLocked) {
      document.body.style.overflow = '';
      this._bodyLocked = false;
    }
  }





  prevIndex(totaleElementiCarosello: number | undefined, refFlickingComponent: NgxFlickingComponent) {
    // Leggo l'indice corrente del carosello
    const currentIndex = refFlickingComponent?.index;

    // Controllo che currentIndex e totale siano definiti
    if (currentIndex !== undefined && totaleElementiCarosello !== undefined) {
      // Calcolo il nuovo indice andando indietro di 1
      // Aggiungo totaleElementiCarosello per evitare valori negativi
      // E poi faccio il modulo per restare nel range 0..(totale-1)
      const nuovoIndex = (currentIndex - 1 + totaleElementiCarosello) % totaleElementiCarosello;

      // Muovo il carosello al nuovo indice
      refFlickingComponent?.moveTo(nuovoIndex);
      console.log(`Prev: da ${currentIndex} a ${nuovoIndex}`);
    }
  }

  nextIndex(totaleElementiCarosello: number | undefined, refFlickingComponent: NgxFlickingComponent) {
    // Leggo l'indice corrente del carosello
    const currentIndex = refFlickingComponent?.index;

    // Controllo che currentIndex e totale siano definiti
    if (currentIndex !== undefined && totaleElementiCarosello !== undefined) {
      // Calcolo il nuovo indice andando avanti di 1
      // Uso il modulo per tornare a 0 quando supero l'ultima slide
      const nuovoIndex = (currentIndex + 1) % totaleElementiCarosello;

      // Muovo il carosello al nuovo indice
      refFlickingComponent?.moveTo(nuovoIndex);
      console.log(`Next: da ${currentIndex} a ${nuovoIndex}`);
    }
  } 

  */









import {
  Component,
  OnInit,
  AfterViewInit,
  HostListener,
  QueryList
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { BreakpointObserver } from '@angular/cdk/layout';
import { Meta, Title } from '@angular/platform-browser';
import { SharedDataService } from '../../services/shared-data.service';
import { MatDialog } from '@angular/material/dialog';
import { EditorAdminPopUpComponent } from '../../admin/editor/edit/editor-admin-popup.component';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MediaCollection, MediaContext, MediaMeta, MediaItems } from '../../app.component';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

/* Rispetto a quanto spiegato sopra ora è tutto diverso
  Per creare un carosello basta importare questi tre .ts
  Poi ci pensano le factory plugins/options e create-caroselli-factory a creare un semplice carosello
*/
import { NgxFlickingModule } from '@egjs/ngx-flicking';
import { ImieiCaroselli } from '../../shared/factories/manage-carousel/flicking/create-caroselli-factory';
import { createCarousel} from '../../shared/factories/manage-carousel/flicking/create-caroselli-factory';

/* 
  Gestire il singolo carosello 
  Quando il carosello cambia e ci sono le arrow voglio che "Se l'indice del carosello è 0 oppure il massimo deve applicare la classe class.none
  In modo da non mostrare la freccia o desta se l'indicde del carosello corrente == carosello.length oppure non mostarre la sinistra se 
  indiceCorrente == 0"

*/
import { ViewChildren } from '@angular/core';
import { NgxFlickingComponent } from '@egjs/ngx-flicking';

import { RevealOnScrollDirective } from '../../directives/reveal-on-scroll.directive';
import { AggiungiCaroselloComponent } from '../../admin/caroselli/aggiungi-carosello/aggiungi-carosello.component';
@Component({
  selector: 'app-home',
  standalone: true,
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule,
    MatCardModule,
    MatTooltipModule,
    NgxFlickingModule,
    RevealOnScrollDirective   
  ]
})
export class HomeComponent implements OnInit, AfterViewInit {

  //Leggo tutte le reference di questo flickingTag
   @ViewChildren('flickingTags') flickingTagRefs!: QueryList<NgxFlickingComponent>;
  
  //Variabile per convertire i flickingTagsRefs in flickingTagsArray quindi avere un array di NgxFlickingComponent[] cosi da gestire ogni tag   <ngx-flicking>
  /* Variabile che setto in afterViewInit in modo da caricare tutto il template e quindi tutti i tag per poi settare la variabile*/
  flickingTagsArray: NgxFlickingComponent[] = [];



  // --- MAPPE STATO FRECCE PER OGNI CAROSELLO ---
// Creo due mappe indicizzate per `index` del carosello, così ogni carosello
// ha il proprio stato indipendente delle frecce (sx/dx). Le userò nel template
// come `setArrowSxMap[i]` e `setArrowDxMap[i]`.

// Semantica che voglio rispettare (coerente col mio template):
// - sinistra:  [class.none]="(!car.hasArrow || !setArrowSxMap[i])"
//   → se setArrowSxMap[i] = true  MOSTRO la freccia sinistra
//   → se setArrowSxMap[i] = false NASCONDO la freccia sinistra
// - destra:    [class.none]="(!car.hasArrow || setArrowDxMap[i])"
//   → se setArrowDxMap[i] = true  NASCONDO la freccia destra
//   → se setArrowDxMap[i] = false MOSTRO la freccia destra

// Le inizializzo vuote: le valorizzerò su (ready) e le aggiornerò su (changed).
setArrowSxMap: Record<number, boolean> = {};
setArrowDxMap: Record<number, boolean> = {};



onReadyCarosello($event: any, car: ImieiCaroselli, i: number) {
      /* Recupero i NgxFlickingComponent[]*/
    this.flickingTagsArray = this.flickingTagRefs.toArray();
    console.log("Count di quanti <ngx-flicking> con ref flickingTags abbiamo: ", this.flickingTagsArray.length);
  // Prendo la ref del carosello corrente dalla mia QueryList.
  const flick = this.flickingTagsArray?.[i];
  // Se per qualsiasi motivo non ho la ref, imposto uno stato sicuro e termino.
  if (!flick) {
    this.setArrowSxMap[i] = false; // prev nascosta
    this.setArrowDxMap[i] = true;  // next nascosta
    return;
  }

  // Calcolo quanti pannelli ho e se il carosello è circolare.
  const total = Array.isArray(flick.panels) ? flick.panels.length : 0;
  const circular = !!car?.options?.circular;

  // Leggo l’indice corrente direttamente dalla ref Angular (niente getIndex).
  const currentIndex = (flick as any).index ?? 0;

  // Se ho 0 o 1 pannello, spengo entrambe le frecce.
  if (total <= 1) {
    this.setArrowSxMap[i] = false; // prev nascosta
    this.setArrowDxMap[i] = true;  // next nascosta
    return;
  }

  // Se è circolare, voglio entrambe visibili (rispettando la semantica del template).
  if (circular) {
    this.setArrowSxMap[i] = true;  // prev visibile
    this.setArrowDxMap[i] = false; // next visibile
    return;
  }

  // Caso non circolare: gestisco in base all’indice.
  this.setArrowSxMap[i] = currentIndex > 0;            // mostro prev se non sono al primo
  this.setArrowDxMap[i] = currentIndex >= (total - 1); // nascondo next se sono all’ultimo
}


  /* Questo metodo prende il carosello corrente in ingresso ed applica la classe onChangedCarosello se presente ed in più
   aggiorno lo stato delle frecce:
   - Se circle == false: nascondo la freccia destra quando arrivo all’ultimo pannello,
     altrimenti nascondo la sinistra se sono all’indice 0.
   - Se circle == true: tengo entrambe le frecce visibili (se ci sono > 1 pannelli).
*/
onChangedCarosello(event: any, car: ImieiCaroselli, i: number) {
  // 1) Applico l’animazione (se definita). Uso la classe CSS indicata in car.otherOption.onChangedCarosello.
  const animationClass = car?.otherOption?.onChangedCarosello as string | undefined;
  const el = event?.panel?.element as HTMLElement | undefined;
  if (animationClass && el) {
    // Resetto la classe per poter ri-triggerare l’animazione ad ogni change.
    el.classList.remove(animationClass);
    void el.offsetWidth; // forzo un reflow
    el.classList.add(animationClass);
  }

  // 2) Aggiorno le frecce per questo carosello (uso le mie mappe per non interferire con altri caroselli).
  const flick = this.flickingTagsArray?.[i];
  if (!flick) {
    // Se non ho la ref, imposto uno stato "sicuro" e termino.
    this.setArrowSxMap[i] = false; // prev nascosta
    this.setArrowDxMap[i] = true;  // next nascosta
    return;
  }

  const total = Array.isArray(flick.panels) ? flick.panels.length : 0;
  const circular = !!car?.options?.circular;
  const currentIndex = (flick as any).index ?? 0;

  // Se ho 0 o 1 pannello, non mostro frecce.
  if (total <= 1) {
    this.setArrowSxMap[i] = false; // prev nascosta
    this.setArrowDxMap[i] = true;  // next nascosta
    return;
  }

  // Se è circolare, tengo entrambe le frecce visibili.
  if (circular) {
    this.setArrowSxMap[i] = true;   // prev visibile
    this.setArrowDxMap[i] = false;  // next visibile
    return;
  }

  // Non circolare: gestisco in base all’indice corrente.
  // - a indice 0 nascondo la sinistra
  // - all’ultimo indice nascondo la destra
  // - in mezzo mostro entrambe
  this.setArrowSxMap[i] = currentIndex > 0;             // true = mostro prev
  this.setArrowDxMap[i] = currentIndex >= (total - 1);  // true = NASCONDO next
}



  


  /**
   * Stato admin reattivo.
   */
  isAdmin = false;

  /**
   * Sezioni della home. Ogni sezione è una MediaCollection.
   */
  carosello: MediaCollection = { folder: '', items: [] };
  recensioni: MediaCollection = { folder: '', items: [] };
  modelliInEvidenza: MediaCollection = { folder: '', items: [] };
  creazioni: MediaCollection = { folder: '', items: [] };



  /**
   * Stato responsive e visibilità contenuti successivi.
   */
  isMobile = false;
  mostraContenutoDopoCarosello = false;

  /**
   * Teardown delle subscribe.
   */
  private destroy$ = new Subject<void>();

  constructor(
    private breakpointObserver: BreakpointObserver,
    private titleService: Title,
    private metaService: Meta,
    private sharedDataService: SharedDataService,
    private dialog: MatDialog
  ) { }




  /* In base alla folder di ingresso recupero tutti i display name*/
  getDisplaysNameFromFolder(folder: string): string[]{
    console.log("Folder in ingresso: ", folder)
    //recuperata la collection di quella folder recupero il context
    const getMediaCollection: MediaCollection | undefined = this.saveDataHomeInput.find(data => data.folder.toLowerCase() === folder.toLowerCase());
    
    let displayNames: string[] = [];
    //mappo l'items 
    if(getMediaCollection){
         displayNames = getMediaCollection.items
          .map(item => item.context.display_name ?? '');
    }

    return displayNames;
     

     
  }


    //array dove salviamo tutti i caroselli cosi cicliamo questi nel template
  carousels: ImieiCaroselli[] = [];


caricaTuttiICaroselli(): void {
  // Helper per comporre le classi del wrapper carosello:
  // grid(1) -> ['wrapper-carosello','by-1'], grid(3) -> ['wrapper-carosello','by-3'], ecc.
  const grid = (n: 1 | 2 | 3 | 4) => ['wrapper-carosello', `by-${n}`];

  this.carousels = [
    // ──────────────────────────────── HERO (1 per viewport) ────────────────────────────────
    createCarousel({
      data: this.carosello,
      mode: 'no-scroll',                // autoplay, niente input utente
      circular: true,
      align: 'center',
      duration: 0,
      plugins: { fade: true, arrow: true, pagination: false, autoplay: 3500 },

      editKey: 'carosello',
      tooltip: 'Modifica carosello',

      // Titolo di sezione SOPRA il carosello
      titoloSezione: 'Hero',
      wrapperTitoloSezioneClass: ['wrapper-titolo'],
      titoloSezioneClass: ['titolo'],

      // Classi del wrapper e dei pannelli (vedi SCSS: by-1 = hero full)
      wrapperClass: grid(1),
      panelClass: ['pannelli-carosello'],

      panelsName: this.getDisplaysNameFromFolder(this.carosello.folder),
      onChangedCarosello: 'zoom-enter',
    }),

    // ─────────────────────────── Modelli in evidenza (3 per viewport) ─────────────────────
    createCarousel({
      data: this.modelliInEvidenza,
      mode: 'snap',
      circular: false,
      align: 'prev',
      duration: 600,
      plugins: { fade: false, arrow: true, pagination: 'bullet' },

      editKey: 'modelliEvidenza',
      tooltip: 'Modifica Modelli in Evidenza',

      titoloSezione: 'Modelli in evidenza',
      wrapperTitoloSezioneClass: ['wrapper-titolo'],
      titoloSezioneClass: ['titolo'],

      wrapperClass: grid(2),                 // << by-3 su desktop
      panelClass: ['pannelli-carosello'],

      panelsName: this.getDisplaysNameFromFolder(this.modelliInEvidenza.folder),
      onChangedCarosello: '',
    }),

    // ──────────────────────────────── Best seller (4 per viewport) ─────────────────────────
    createCarousel({
      data: this.creazioni,
      mode: 'freeScroll',
      circular: false,
      align: 'prev',
      duration: 0,
      plugins: { fade: true, arrow: false, pagination: false },

      editKey: 'creazioni',
      tooltip: 'Modifica le mie creazioni',

      titoloSezione: 'Best seller',
      wrapperTitoloSezioneClass: ['wrapper-titolo'],
      titoloSezioneClass: ['titolo'],

      wrapperClass: grid(2),                 // << by-4 su desktop
      panelClass: ['pannelli-carosello'],

      panelsName: this.getDisplaysNameFromFolder(this.creazioni.folder),
      onChangedCarosello: 'zoom-enter',
    }),

    // ───────────────────────────────── Recensioni (1 per viewport) ─────────────────────────
    createCarousel({
      data: this.recensioni,
      mode: 'snap',
      circular: false,
      align: 'prev',
      duration: 400,
      plugins: { fade: true, arrow: true, pagination: false },

      editKey: 'recensioni',
      tooltip: 'Modifica recensioni',

      titoloSezione: 'Dicono di noi',
      wrapperTitoloSezioneClass: ['wrapper-titolo'],
      titoloSezioneClass: ['titolo'],

      wrapperClass: grid(1),                 // << by-1 (slide singola a viewport)
      panelClass: ['pannelli-carosello'],

      panelsName: this.getDisplaysNameFromFolder(this.recensioni.folder),
      onChangedCarosello: '',
    }),
  ];

  // Log compatto per controllo classi applicate
  console.log(
    'Caroselli creati:', JSON.stringify(this.carousels));
}


saveDataHomeInput: MediaCollection[] = [];

/* FINE SPIEGAZIONE */

  ngOnInit(): void {
    // Scroll iniziale in alto.
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Stato admin derivato dal token salvato nello SharedDataService.
    this.sharedDataService.isAdmin$
      .pipe(takeUntil(this.destroy$))
      .subscribe(isAdmin => {
        this.isAdmin = isAdmin;
      });

    // SEO di base. updateTag evita duplicazioni tra ricreazioni del componente.
    this.titleService.setTitle('A-Chic | Borse all\'uncinetto e Accessori artigianali');
    this.metaService.updateTag({ name: 'description', content: 'Borse fatte a mano...' });
    this.metaService.updateTag({ name: 'keywords', content: 'borse, artigianato, carillon...' });
    this.metaService.updateTag({ property: 'og:image', content: 'https://www.a-chic.it/assets/og-image.jpg' });
    this.metaService.updateTag({ property: 'og:url', content: 'https://www.a-chic.it/home' });
    this.metaService.updateTag({ name: 'twitter:image', content: 'https://www.a-chic.it/assets/og-image.jpg' });

    // Breakpoint per adattare il layout.
    this.breakpointObserver
      .observe(['(max-width: 768px)'])
      .pipe(takeUntil(this.destroy$))
      .subscribe(result => {
        this.isMobile = result.matches;
      });

    /**
     * Lettura reattiva della cache media.
     * Si ricavano le chiavi delle quattro sezioni direttamente dalle folder in input.
     * Il confronto è basato sulla parte finale della folder (tail), senza hard-coding di stringhe intere.
     */


    
    this.sharedDataService.mediasCollectionsConfig$
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data: MediaCollection[]) => {
                    if (!Array.isArray(data)) return;
                    if(data.length === 0) return; //evito lazy loading
                    this.saveDataHomeInput = data;
          // Funzione locale: trova una collezione la cui folder termina con il tail indicato.
          // Esempio: tail "config/home/carosello" o semplicemente "/carosello".
          const findByTail = (tail: string) =>
            data.find(c => c.folder.toLowerCase().endsWith(tail.toLowerCase()));

          // Tails attesi per le quattro sezioni. Si usano i segmenti finali per tollerare prefissi diversi.
          const tailCarosello = '/carosello';
          const tailRecensioni = '/recensioni';
          const tailModelli = '/modelli in evidenza';
          const tailCreazioni = '/le mie creazioni';

          // Carosello
          const cCarosello = findByTail(tailCarosello);
          this.carosello = {
            folder: cCarosello?.folder ?? 'config/home/carosello',
            items: cCarosello?.items ?? []
          };

          console.log("Carosello main caricato: ", JSON.stringify(this.carosello));

          // Recensioni
          const cRecensioni = findByTail(tailRecensioni);
          this.recensioni = {
            folder: cRecensioni?.folder ?? 'config/home/recensioni',
            items: cRecensioni?.items ?? []
          };

          // Modelli in evidenza
          const cModelli = findByTail(tailModelli);
          this.modelliInEvidenza = {
            folder: cModelli?.folder ?? 'config/home/modelli in evidenza',
            items: cModelli?.items ?? []
          };

          // Mie creazioni
          const cCreazioni = findByTail(tailCreazioni);
          this.creazioni = {
            folder: cCreazioni?.folder ?? 'config/home/le mie creazioni',
            items: cCreazioni?.items ?? []
          };

          this.caricaTuttiICaroselli();

        },
        error: err => console.error('Errore caricamento media config', err)
      });
    

    // Valutazione iniziale dello scroll per mostrare il contenuto dopo il carosello.
    this.checkScroll();
  }


  



  trackByIndex(index: number, _: any): number {
    return index;
  }

  //variabile che serve per disattivare l'ui delle frecce

  ngAfterViewInit(): void {



    // Avvio silenzioso dei video dopo il rendering, con fallback in caso di policy browser.
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

  /**
   * Mostra il blocco successivo al carosello quando si supera il 60% dell'altezza viewport.
   */
  private checkScroll() {
    const soglia = window.innerHeight * 0.6;
    this.mostraContenutoDopoCarosello = window.scrollY > soglia;
  }



  /**
   * Restituisce la URL del media con angolazione "frontale", se presente.
   */
  getMediaFrontale(mediaItems: MediaMeta[]): string | null {
    return mediaItems.find(a => a.angolazione?.toLowerCase() === 'frontale')?.url ?? null;
  }

  /**
   * Verifica per evitare errori nei *ngFor* quando l'array non è definito o vuoto.
   */
  hasMedia(media: MediaMeta[]): boolean {
    return Array.isArray(media) && media.length > 0;
  }

  /**
   * Apre il popup editor admin per la sezione richiesta.
   * Passa la MediaCollection scelta tramite SharedDataService e applica una panelClass
   * che potrà essere stilizzata via SCSS con selettore ::ng-deep legato alla classe stessa.
   */
  apriPopUpEditorAdmin(valoreDaEditare: string): void {
    let toEdit: MediaCollection;
    if (valoreDaEditare === 'carosello') {
      toEdit = this.carosello;
    } else if (valoreDaEditare === 'creazioni') {
      toEdit = this.creazioni;
    } else if (valoreDaEditare === 'recensioni') {
      toEdit = this.recensioni;
    } else if (valoreDaEditare === 'modelliEvidenza') {
      toEdit = this.modelliInEvidenza;
    } else {
      toEdit = this.carosello;
    }

    console.log("Invio i dati all editor, ", JSON.stringify(toEdit));
    this.sharedDataService.setMediaCollectionConfig(toEdit);
    this.dialog.open(EditorAdminPopUpComponent, {
      disableClose: false,
      data: { isConfigMode: true },

      panelClass: 'popup-admin-editor'
    });
  }


  checkEstensione(url: string, tipo: 'image' | 'video' | 'audio'): boolean {
    if (!url) return false;

    const lowerUrl = url.toLowerCase();

    const estensioni = {
      image: ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.avif'],
      video: ['.mp4', '.webm', '.ogg', '.mov', '.m4v'],
      audio: ['.mp3', '.wav', '.ogg', '.m4a', '.aac', '.flac']
    };

    return estensioni[tipo].some(ext => lowerUrl.endsWith(ext));
  }


  apriPopUpAddCaroselloAdmin(){
      const ref = this.dialog.open(AggiungiCaroselloComponent, {
        autoFocus: false, // quando apro il pop up non c e nessun focus su nessun elemento
        panelClass: 'popup-caroselli-editor'
      });
  }

}
