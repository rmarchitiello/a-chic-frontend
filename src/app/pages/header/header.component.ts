import { Component,EventEmitter, Output, OnInit  } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { Router } from '@angular/router'; 
import { BreakpointObserver } from '@angular/cdk/layout';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    CommonModule,
    MatToolbarModule,
    MatIconModule,
    MatButtonModule
  ],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent implements OnInit {
  
  isMobile: boolean = false;
  // emette un evento da passare a un component
  /* Quando in mobile component clicco il menu,   <button mat-icon-button (click)="toggleMenu()">
viene chiamato toggle menu che emette un evento come websocket*/
  @Output() menuToggle = new EventEmitter<void>();

  toggleMenu(): void {
        this.menuToggle.emit(); // Notifica al genitore: "cliccato il menu!"

}

  constructor(private router: Router,private breakpointObserver: BreakpointObserver,
) {} 

goToHome(home: string){
this.router.navigate([home]);
}

ngOnInit(): void {
  this.breakpointObserver
    .observe(['(max-width: 768px)'])
    .subscribe(result => {
      this.isMobile = result.matches;
    });
}
}
