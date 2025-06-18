import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-mobile-footer',
  imports: [],
  templateUrl: './mobile-footer.component.html',
  styleUrl: './mobile-footer.component.scss'
})
export class MobileFooterComponent {
  constructor(private router: Router) {}

  goToContatti(percorso: string) {
    this.router.navigate([percorso]);
  }
}
