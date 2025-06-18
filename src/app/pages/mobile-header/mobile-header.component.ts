import { Component,EventEmitter, Output  } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { Router } from '@angular/router'; 

@Component({
  selector: 'app-mobile-header',
  standalone: true,
  imports: [
    CommonModule,
    MatToolbarModule,
    MatIconModule,
    MatButtonModule
  ],
  templateUrl: './mobile-header.component.html',
  styleUrl: './mobile-header.component.scss'
})
export class MobileHeaderComponent {
  
  // emette un evento da passare a un component
  /* Quando in mobile component clicco il menu,   <button mat-icon-button (click)="toggleMenu()">
viene chiamato toggle menu che emette un evento come websocket*/
  @Output() menuToggle = new EventEmitter<void>();

  toggleMenu(): void {
        this.menuToggle.emit(); // Notifica al genitore: "cliccato il menu!"

}

  constructor(private router: Router) {} 

goToHome(home: string){
this.router.navigate([home]);
}

}
