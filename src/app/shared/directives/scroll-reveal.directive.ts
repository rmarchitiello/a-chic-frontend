import {
  Directive,
  ElementRef,
  HostListener,
  Renderer2,
  OnInit
} from '@angular/core';

@Directive({
  selector: '[appScrollReveal]',
  standalone: true
})
export class ScrollRevealDirective implements OnInit {

  constructor(private el: ElementRef, private renderer: Renderer2) {}

  ngOnInit(): void {
    // Nascondi inizialmente l'elemento
    this.renderer.setStyle(this.el.nativeElement, 'opacity', '0');
    this.renderer.setStyle(this.el.nativeElement, 'transform', 'translateY(40px)');
    this.renderer.setStyle(this.el.nativeElement, 'transition', 'all 0.8s ease-out');
  }

  @HostListener('window:scroll', [])
  onScroll(): void {
    const top = this.el.nativeElement.getBoundingClientRect().top;
    const triggerPoint = window.innerHeight * 0.85;

    if (top < triggerPoint) {
      this.renderer.setStyle(this.el.nativeElement, 'opacity', '1');
      this.renderer.setStyle(this.el.nativeElement, 'transform', 'translateY(0)');
    }
  }
}
