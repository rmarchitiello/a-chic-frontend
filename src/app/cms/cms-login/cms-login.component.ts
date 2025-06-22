import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { BreakpointObserver } from '@angular/cdk/layout';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-cms-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule
  ],
  templateUrl: './cms-login.component.html',
  styleUrls: ['./cms-login.component.scss']
})
export class CmsLoginComponent implements OnInit {

  // FormGroup per la gestione reattiva del form di login
  loginForm!: FormGroup;

  // Stato booleano per determinare se l'utente è su dispositivo mobile
  isMobile: boolean = false;



  constructor(
    private fb: FormBuilder,
    private breakpointObserver: BreakpointObserver
  ) {}

  ngOnInit(): void {


    // Inizializza il form con validatori
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],          // Campo email obbligatorio e con validazione formato email
      password: ['', [Validators.required, Validators.minLength(6)]] // Campo password obbligatorio, minimo 6 caratteri
    });

    // Rileva se la finestra è in modalità mobile (<=768px)
    this.breakpointObserver
      .observe(['(max-width: 768px)'])
      .subscribe(result => {
        this.isMobile = result.matches;
      });
  }

  // Metodo chiamato al submit della form
  onSubmit(): void {
    if (this.loginForm.valid) {
      console.log('Valori del form inviato:', this.loginForm.value);
      // Qui puoi inviare i dati al tuo backend per l'autenticazione
    } else {
      this.loginForm.markAllAsTouched(); // Mostra errori se i campi sono non validi
    }
  }
}
