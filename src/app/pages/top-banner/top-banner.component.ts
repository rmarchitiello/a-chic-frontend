import {
  Component,
  OnInit,
  AfterViewInit,
  OnDestroy,
  ElementRef,
  ViewChild,
  HostListener,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { BreakpointObserver } from '@angular/cdk/layout';
import { SharedDataService } from '../../services/shared-data.service';
import { Subject, takeUntil } from 'rxjs';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatIconModule } from '@angular/material/icon';
import {
  TextConfigFromCache,
  PageConfig,
  ComponentBlock,
  DynamicItem,
  RequestUpdateText,
} from '../../app.component';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../services/admin.service';
import { MatSnackBar } from '@angular/material/snack-bar';
@Component({
  selector: 'app-top-banner',
  standalone: true, // componente standalone (niente NgModule dedicato)
  imports: [CommonModule, MatTooltipModule, MatIconModule, FormsModule],
  templateUrl: './top-banner.component.html',
  styleUrls: ['./top-banner.component.scss'],
})
export class TopBannerComponent implements OnInit, AfterViewInit, OnDestroy {
  private homeName: string = 'home';
  private componentName: string = 'TopBannerComponent';
  // ================
  // Stato & riferimenti
  // ================

  /** Notifica di distruzione per cancellare le subscription (pattern takeUntil). */
  private readonly destroy$ = new Subject<void>();

  /** Flag: siamo in modalità editing? (mostra input, ferma animazione, ecc.) */
  imEditing = false;

  /** Riferimento all’input mostrato in editing, per applicare focus/cursore. */
  @ViewChild('bannerInput') bannerInput?: ElementRef<HTMLInputElement>;

  /** Flag: viewport mobile (<= 768px). Gestito via BreakpointObserver. */
  isMobile = false;

  /** Flag: utente è admin? (abilita tooltip, cursor-pointer, edit, ecc.) */
  isAdmin = false;

  /** Testo “vero” del banner (quello che modifichi da input). */
  bannerText = '';

  /**
   * Testo “esteso” per la marquee: è lo stesso messaggio, ma replicato più volte
   * con un separatore per assicurare che un singolo segmento copra almeno la
   * larghezza visibile. Viene usato solo nei due <span> della marquee.
   *
   * ⚠️ Importante:
   * - L’input deve restare legato a `bannerText`.
   * - I due <span> visivi dovrebbero usare `bannerTextLoop` per lo “snake”.
   */
  bannerTextLoop = '';
  bannerBackupText = ''
  /** Separatore tra ripetizioni (trattino lungo con spazi). */
  private readonly sep = ' // ';

  // ================
  // Costruttore & Lifecycle
  // ================

  constructor(
    private readonly breakpointObserver: BreakpointObserver,
    private adminService: AdminService,
    private readonly sharedDataService: SharedDataService,
    private readonly el: ElementRef<HTMLElement>,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    // 1) Sorgente testi condivisi: estrai il testo del banner dalla cache configurazioni.
    this.sharedDataService.configTextShared$
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data: TextConfigFromCache | null) => {
          // Aggiorna il testo “originale”
          this.bannerText = this.getTopBannerText(data) ?? '';
          this.bannerBackupText = this.bannerText;
          // Ricalcola il testo “loop” appena il DOM è pronto per la misura.
          // Usiamo setTimeout per posticipare al prossimo microtask (il DOM può aver appena montato la view).
          setTimeout(() => this.ensureLoopWidth());
        },
        error: (err) => {
          console.error('configTextShared$ error:', err);
          this.bannerText = '';
          this.bannerTextLoop = '';
        },
      });

    // 2) Stato admin: abilita/disabilita UI avanzate.
    this.sharedDataService.isAdmin$
      .pipe(takeUntil(this.destroy$))
      .subscribe((isAdmin) => {
        this.isAdmin = isAdmin;
        // Nessun ricalcolo necessario qui, ma lascio il log utile in debug.
        // console.log('Banner in admin?: ', this.isAdmin);
      });

    // 3) Breakpoint mobile.
    this.breakpointObserver
      .observe(['(max-width: 768px)'])
      .pipe(takeUntil(this.destroy$))
      .subscribe((result) => {
        this.isMobile = result.matches;
        // Se cambia la larghezza disponibile, ricalcola la stringa replicata.
        setTimeout(() => this.ensureLoopWidth());
      });
  }

  ngAfterViewInit(): void {
    // Il DOM è montato: possiamo misurare le larghezze e generare il loop.
    this.ensureLoopWidth();
  }

  ngOnDestroy(): void {
    // Completa il subject per chiudere tutte le subscription.
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ================
  // Eventi UI
  // ================

  /**
   * Abilita la modalità editing (se admin).
   * - Ferma l’animazione (CSS: .marquee.no-anim).
   * - Mostra l’input e porta il focus con il cursore alla fine.
   */
  abilitaModifica(): void {
    if (!this.isAdmin) return; // sicurezza: non entrare in edit se non admin
    if (this.imEditing) return; // già in edit

    this.imEditing = true;
    console.log("Sto editando", this.imEditing);
    // Posticipa il focus: l’input viene creato da *ngIf, serve attendere il tick successivo.
    setTimeout(() => {
      const el = this.bannerInput?.nativeElement;
      if (el) {
        el.focus();
        try {
          const v = el.value ?? '';
          el.setSelectionRange(v.length, v.length); // cursore a fine testo
        } catch {
          // no-op: alcuni browser possono lanciare eccezioni se il campo non è focusable.
        }
      }
    });
  }

  /**
   * Conferma l’editing e ricostruisce la stringa replicata per la marquee.
   * Puoi chiamarlo su blur, Enter, pulsante “Salva”, ecc.
   */
  terminaModifica(): void {
  // Evita doppie submit o chiamate fuori contesto
  if (!this.imEditing) return;

  const requestUpdateText: RequestUpdateText = {
    page: this.homeName,
    component: this.componentName,
    id: 'banner1',
    campiDaEditare: { text: this.bannerText }
  };

  this.adminService.updateText(requestUpdateText)
    .pipe(takeUntil(this.destroy$))
    .subscribe({
      next: (res: any) => {
        // Avvisa l’app che la cache testo è cambiata (trigghera il subscribe in OnInit)
        this.sharedDataService.notifyCacheIsChanged();

        // Congela questo testo come “ultimo buono”
        this.bannerBackupText = this.bannerText;

        // Esci dall’editing SOLO dopo successo
        this.imEditing = false;

        this.mostraMessaggioSnakBar('Banner aggiornato correttamente', false);

        // Ricalcola il loop dopo che l’UI ha applicato gli aggiornamenti
        setTimeout(() => this.ensureLoopWidth());
      },
      error: (err) => {
        console.error('Errore ricevuto dal backend', err);
        this.imEditing = false;
        // Ripristina il testo precedente e RESTA in edit
        this.bannerText = this.bannerBackupText;

        this.mostraMessaggioSnakBar("Errore durante l'aggiornamento del banner", true);

        // (opzionale) riporta il focus all’input per far riprovare subito
        setTimeout(() => {
          const el = this.bannerInput?.nativeElement;
          if (el) {
            el.focus();
            try {
              const v = el.value ?? '';
              el.setSelectionRange(v.length, v.length);
            } catch {}
          }
        });
        // Niente ensureLoopWidth qui: in edit la marquee è ferma e il metodo fa early return.
      },
    });
}


  /**
   * (Opzionale) Chiamalo da (ngModelChange) se vuoi ricalcolare “live”
   * mentre l’utente digita. Altrimenti basta ricalcolare in terminaModifica().
   */
  onBannerTextChange(value: string): void {
    this.bannerText = value ?? '';
    // Se vuoi l’aggiornamento live del loop, decommenta la riga sotto:
    // this.ensureLoopWidth();
  }

  /** Ricalcola quando cambia la larghezza della finestra (evita “buchi” in snake). */
  @HostListener('window:resize')
  onResize(): void {
    this.ensureLoopWidth();
  }

  /** Testo tooltip dinamico in base allo stato. */
  getTooltipText(): string {
    if (!this.isAdmin) return '';
    return this.imEditing
      ? 'Clicca fuori per confermare la modifica al banner'
      : 'Clicca per modificare il banner';
  }

  // ================
  // Logica di contenuto
  // ================

  /**
   * Estrae e concatena tutti i testi del componente “TopBannerComponent”
   * dalla pagina “home” presenti nella cache condivisa.
   * - Deduplica le stringhe non vuote.
   * - Concatena con separatore configurabile (default: " // ").
   */
  private getTopBannerText(
    cfg: TextConfigFromCache | null,
    sep = ' // '
  ): string {
    if (!cfg) return '';

    const homePage = cfg.pages.find((p: PageConfig) => p.name === this.homeName);
    if (!homePage) return '';

    const topBannerComp = homePage.components.find(
      (c: ComponentBlock) => c.type === this.componentName
    );
    if (!topBannerComp || !Array.isArray(topBannerComp.items)) return '';

    const texts = topBannerComp.items
      .map((it: DynamicItem) => {
        const raw = it['text'];
        return typeof raw === 'string' ? raw.trim() : '';
      })
      .filter((t) => t.length > 0);

    const unique = Array.from(new Set(texts));
    return unique.join(sep);
  }

  // ================
  // Cuore dello “snake”
  // ================

  /**
   * Garantisce che **un singolo segmento** della marquee (cioè il contenuto
   * di UNO dei due <span>) sia largo almeno quanto la maschera visibile
   * (.top-banner). Così quando la riga trasla a -50% non compaiono “buchi”.
   *
   * Implementazione:
   * - Misura la larghezza del contenitore (.top-banner).
   * - Costruisce progressivamente `bannerTextLoop` ripetendo `bannerText`
   *   con un separatore (this.sep) finché un segmento non copre la maschera.
   * - Non tocca `bannerText`: l’input continua a mostrare l’originale.
   *
   * Note:
   * - In editing (`imEditing = true`) la marquee è ferma e mostra un input,
   *   quindi il loop non serve (early return).
   * - Usa un “measurer” offscreen che eredita lo stile reale
   *   (classe .marquee-segment) per misurazioni attendibili.
   */
  private ensureLoopWidth(): void {
    // In edit mostri l’input e la marquee è ferma: nessun calcolo necessario.
    if (this.imEditing) return;

    const base = (this.bannerText || '').trim();
    if (!base) {
      this.bannerTextLoop = '';
      return;
    }

    // Trova il contenitore “maschera” (quello con overflow: hidden).
    const container = this.el.nativeElement.querySelector(
      '.top-banner'
    ) as HTMLElement | null;

    if (!container) {
      // Se per qualche motivo il DOM non è pronto, usa il testo base.
      this.bannerTextLoop = base;
      return;
    }

    const containerWidth = container.clientWidth || 0;

    // Crea un misuratore invisibile per calcolare la larghezza del segmento.
    // NB: stessa classe dei segmenti reali per ereditare font, padding, ecc.
    const measurer = document.createElement('span');
    measurer.className = 'marquee-segment';
    measurer.style.visibility = 'hidden';
    measurer.style.position = 'absolute';
    measurer.style.whiteSpace = 'nowrap';
    measurer.style.pointerEvents = 'none';

    // Append temporaneo nel container per ereditare gli stili corretti (media query incluse).
    container.appendChild(measurer);

    let loopText = base;
    let guard = 0;

    // Prima misura (aggiungo anche il separatore per simulare la reale spaziatura a destra).
    measurer.textContent = loopText + this.sep;
    let segmentWidth = measurer.offsetWidth;

    // Continua a replicare finché un segmento non copre la maschera.
    // Il "guard" evita loop infiniti su casi patologici.
    while (segmentWidth < containerWidth && guard < 50) {
      loopText += this.sep + base;
      measurer.textContent = loopText + this.sep;
      segmentWidth = measurer.offsetWidth;
      guard++;
    }

    // Pulizia: rimuovi il misuratore dal DOM.
    container.removeChild(measurer);

    // Aggiorna il testo “esteso” usato dai due <span> della marquee.
    this.bannerTextLoop = loopText;
  }

  annullaModifica() {
    this.bannerText = this.bannerBackupText;
  }


    //snackbar
  mostraMessaggioSnakBar(messaggio: string, isError: boolean) {
    let panelClassCustom;
    let duration;
    if (isError) {
      panelClassCustom = 'snackbar-errore';
      duration = 1000;
    }
    else {
      panelClassCustom = 'snackbar-ok';
      duration = 500;
    }
    this.snackBar.open(messaggio, 'Chiudi', {
      duration: duration, // durata in ms
      panelClass: panelClassCustom, // classe CSS personalizzata
      horizontalPosition: 'center',
      verticalPosition: 'top'
    });
  }

  onInputBlur(){
    console.log("Blur esterno cliccato");
    this.terminaModifica();
  }
}
