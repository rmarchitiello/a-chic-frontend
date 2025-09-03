import { Directive, ElementRef, Input, OnDestroy, OnInit, Renderer2 } from '@angular/core';

type RevealOpts = {
  rootMargin?: string;                 // margine viewport per far scattare l'osservazione
  threshold?: number | number[];       // porzione visibile richiesta
  once?: boolean;                      // true = rivela una volta e basta
  addClass?: string | string[];        // classe/i da applicare quando visibile (es. 'reveal-up')
  initialClass?: string | string[];    // classe/i iniziali (default: 'is-reveal-init')
};

@Directive({
  selector: '[appRevealOnScroll]',
  standalone: true   // <— fondamentale se vuoi importarla nel componente standalone
})
export class RevealOnScrollDirective implements OnInit, OnDestroy {
  @Input('appRevealOnScroll') opts: RevealOpts | string | string[] = 'reveal-up';

  private observer?: IntersectionObserver;
  private revealed = false;
  private initialClasses: string[] = [];

  constructor(private el: ElementRef<HTMLElement>, private r: Renderer2) {}

  ngOnInit(): void {
    const o: RevealOpts =
      typeof this.opts === 'string' || Array.isArray(this.opts)
        ? { addClass: this.opts, once: true, threshold: 0.15, rootMargin: '0px 0px -10% 0px' }
        : { once: true, threshold: 0.15, rootMargin: '0px 0px -10% 0px', ...this.opts };

    // stato iniziale (nascosto)
    const initial = o.initialClass ?? 'is-reveal-init';
    this.initialClasses = Array.isArray(initial) ? initial : [initial];
    this.initialClasses.forEach(c => this.r.addClass(this.el.nativeElement, c));

    // fallback o SSR
    const canUseIO =
      typeof window !== 'undefined' &&
      'IntersectionObserver' in window;

    if (!canUseIO) {
      this.apply(o.addClass);
      return;
    }

    this.observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        this.apply(o.addClass);
        if (o.once || this.revealed) this.disconnect();
        this.revealed = true;
      } else if (!o.once) {
        this.reset(o.addClass);
      }
    }, { rootMargin: o.rootMargin, threshold: o.threshold });

    this.observer.observe(this.el.nativeElement);
  }

  private apply(cls: string | string[] | undefined) {
    (Array.isArray(cls) ? cls : [cls])
      .filter(Boolean)
      .forEach(c => this.r.addClass(this.el.nativeElement, c!));

    // rimuovo TUTTE le classi iniziali effettivamente applicate
    this.initialClasses.forEach(c => this.r.removeClass(this.el.nativeElement, c));
  }

  private reset(cls: string | string[] | undefined) {
    (Array.isArray(cls) ? cls : [cls])
      .filter(Boolean)
      .forEach(c => this.r.removeClass(this.el.nativeElement, c!));

    this.initialClasses.forEach(c => this.r.addClass(this.el.nativeElement, c));
  }

  private disconnect() {
    this.observer?.disconnect();
    this.observer = undefined;
  }

  ngOnDestroy(): void {
    this.disconnect();
  }
}
