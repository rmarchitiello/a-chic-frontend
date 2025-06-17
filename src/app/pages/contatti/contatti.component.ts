import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

import { EmailService, EmailPayload } from '../../services/email.service'; // ✅ percorso relativo corretto

@Component({
  selector: 'app-contatti',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    HttpClientModule, // ✅ necessario per HttpClient usato dal servizio
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule
  ],
  templateUrl: './contatti.component.html',
  styleUrls: ['./contatti.component.scss']
})
export class ContattiComponent {
  contatto = {
    nome: '',
    cognome: '',
    email: '',
    messaggio: ''
  };

  constructor(private emailService: EmailService) {}

  onSubmit(): void {
    if (!this.contatto.nome || !this.contatto.email || !this.contatto.messaggio) {
      alert('Per favore compila tutti i campi obbligatori.');
      return;
    }

    const payload: EmailPayload = { ...this.contatto };

    this.emailService.inviaEmail(payload).subscribe({
      next: () => {
        alert('Messaggio inviato con successo!');
        this.contatto = { nome: '', cognome: '', email: '', messaggio: '' }; // reset form
      },
      error: () => {
        alert('Errore durante l\'invio. Riprova più tardi.');
      }
    });
  }
}
