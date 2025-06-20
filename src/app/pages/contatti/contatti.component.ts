import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { BreakpointObserver } from '@angular/cdk/layout'; // ✅ IMPORT MANCANTE

// Angular Material modules
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

// Servizio email personalizzato
import { EmailService, EmailPayload } from '../../services/email.service';

@Component({
  selector: 'app-contatti',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    HttpClientModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule
  ],
  templateUrl: './contatti.component.html',
  styleUrls: ['./contatti.component.scss']
})
export class ContattiComponent implements OnInit {
  // Oggetto che raccoglie i dati inseriti nel form
  contatto = {
    nome: '',
    cognome: '',
    email: '',
    messaggio: ''
  };

  // Flag per distinguere dispositivi mobili da desktop
  isMobile: boolean = false;

  constructor(
    private emailService: EmailService,
    private breakpointObserver: BreakpointObserver
  ) {}

  ngOnInit(): void {
    // Osserva la larghezza dello schermo e imposta isMobile su true se <= 768px
    this.breakpointObserver
      .observe(['(max-width: 768px)'])
      .subscribe(result => {
        this.isMobile = result.matches;
      });
  }

  // Gestione invio form
  onSubmit(): void {
    if (!this.contatto.nome || !this.contatto.email || !this.contatto.messaggio) {
      alert('Per favore compila tutti i campi obbligatori.');
      return;
    }

    const payload: EmailPayload = { ...this.contatto };

    this.emailService.inviaEmail(payload).subscribe({
      next: () => {
        alert('Messaggio inviato con successo!');
        this.contatto = { nome: '', cognome: '', email: '', messaggio: '' }; // Reset del form
      },
      error: () => {
        alert('Errore durante l\'invio. Riprova più tardi.');
      }
    });
  }
}
