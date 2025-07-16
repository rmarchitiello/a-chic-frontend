import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { BreakpointObserver } from '@angular/cdk/layout';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { Router } from '@angular/router';
import { CmsService } from '../../services/cms.service';

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
    private cmsService: CmsService
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

  if (this.loginForm.valid) {
    console.log('Valori del form inviato:', JSON.stringify(this.loginForm.value));

    if (email  && password ) {

        //quando la form è valida chiamo la cms login
          this.cmsService.login(email,password).subscribe({
              next: (data) => {
                  console.log("Login effettuata: ");
                  localStorage.setItem('admin-login', "true"); //salvo l access token che dura 1 ora
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
    // Se il form non è valido, forza la visualizzazione degli errori
    this.loginForm.markAllAsTouched();
  }



}

}

