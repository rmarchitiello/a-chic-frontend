import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';                // ✅ Import necessario per *ngIf
import { MatCardModule } from '@angular/material/card';
import { MatListModule } from '@angular/material/list';
import { Router } from '@angular/router';
import { BreakpointObserver } from '@angular/cdk/layout';

@Component({
  selector: 'app-privacy-policy',
  standalone: true,                                            // ✅ Questo abilita l’uso di imports nei componenti standalone
  imports: [
    CommonModule,                                              // ✅ Abilita *ngIf, *ngFor, ecc.
    MatCardModule,
    MatListModule
  ],
  templateUrl: './privacy-policy.component.html',
  styleUrl: './privacy-policy.component.scss'
})
export class PrivacyPolicyComponent implements OnInit {

  email: string = 'achicnapoli@gmail.com';
  isMobile: boolean = false;

  constructor(
    private router: Router,
    private breakpointObserver: BreakpointObserver
  ) {}

  goHome() {
    this.router.navigate(['/home']);
  }

  goToCookie(cookies: string) {
    this.router.navigate([cookies]);
  }

  ngOnInit(): void {
        // Esegue scroll in alto all'apertura del componente
    window.scrollTo({ top: 0, behavior: 'smooth' });
    // Rileva se il dispositivo è mobile in base alla larghezza dello schermo
    this.breakpointObserver
      .observe(['(max-width: 768px)'])
      .subscribe(result => {
        this.isMobile = result.matches;
      });

    // Scroll automatico in alto all'apertura
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}
