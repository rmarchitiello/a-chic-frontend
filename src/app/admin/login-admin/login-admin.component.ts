import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { BreakpointObserver } from '@angular/cdk/layout';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { Router } from '@angular/router';
import { CmsService } from '../../services/cms.service';
import { SharedDataService } from '../../services/shared-data.service';
@Component({
  selector: 'app-login-admin',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule
  ],  templateUrl: './login-admin.component.html',
  styleUrl: './login-admin.component.scss'
})
export class LoginAdminComponent  implements OnInit {

  // FormGroup per la gestione reattiva del form di login
  loginForm!: FormGroup;


  // Stato booleano per determinare se l'utente è su dispositivo mobile
  isMobile: boolean = false;



  constructor(
    private fb: FormBuilder,
    private breakpointObserver: BreakpointObserver,
    private router: Router,
    private cmsService: CmsService,
    private sharedDataService: SharedDataService
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
  const { email, password } = this.loginForm.value;
  console.log("Valore della form:", this.loginForm.value);

  // Verifica se il form è valido
  if (this.loginForm.valid) {
    console.log('Valori del form inviato:', JSON.stringify(this.loginForm.value));

    // Se entrambi i campi sono compilati
    if (email && password) {
      // Chiamata al servizio di login CMS
      this.cmsService.login(email, password).subscribe({
        next: (data) => {
          console.log("Login effettuata con successo");

          // Salva lo stato nel localStorage
          localStorage.setItem('admin-login', 'true');

          // Notifica lo stato admin al servizio condiviso
          this.sharedDataService.setIsAdmin(true);

          // Naviga verso la home (senza forzare reload)
          this.router.navigate(['/home']);
        },
        error: () => {
          alert("Credenziali non valide");
        }
      });
    } else {
      alert("Credenziali non valide");
    }
  } else {
    // Se il form è invalido, mostra gli errori
    this.loginForm.markAllAsTouched();
  }
}


}

