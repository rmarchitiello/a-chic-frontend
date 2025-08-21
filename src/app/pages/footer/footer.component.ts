import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { BreakpointObserver } from '@angular/cdk/layout';
import { FormsModule } from '@angular/forms';
import { EmailService } from '../../services/email.service';
import { MatIconModule } from '@angular/material/icon';
@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule,FormsModule,MatIconModule],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.scss'
})
export class FooterComponent implements OnInit {
  constructor(private router: Router, 
    private breakpointObserver: BreakpointObserver,
    private emailService: EmailService
) {}

    email: string = '';
    isMobile = false;

  goTo(percorso: string) {
    this.router.navigate([percorso]);
  }

  ngOnInit(): void {
    this.breakpointObserver
    .observe(['(max-width: 768px)'])
    .subscribe(result => {
      this.isMobile = result.matches;
    });
  }

responseEmail = '';
loadingNewsLetter = false;

iscrivitiNewsletter(email: string): void {
  if (!email || this.loadingNewsLetter) { return; }   // evita doppio invio

  this.loadingNewsLetter = true;     // attiva spinner / disabilita bottone
  this.responseEmail = '';           // pulisci vecchi messaggi

  this.emailService.inviaNewsLetterEmail(email.trim()).subscribe({
    next: () => {
      this.loadingNewsLetter = false;
      this.responseEmail = 'Grazie mille! Riceverai informazioni all’indirizzo inserito.';
      this.email = '';             // svuota il campo input
    },
    error: () => {
      this.loadingNewsLetter = false;
      this.responseEmail = 'Errore di invio, riprova più tardi.';
    }
  });
}
}
