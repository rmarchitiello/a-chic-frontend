import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { BreakpointObserver } from '@angular/cdk/layout';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatIconModule } from '@angular/material/icon';
import { AdminService } from '../../services/admin.service';
import { SharedDataService } from '../../services/shared-data.service';

@Component({
  selector: 'app-login-admin',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule
  ],
  templateUrl: './login-admin.component.html',
  styleUrls: ['./login-admin.component.scss']
})
export class LoginAdminComponent implements OnInit {

  // Reactive Form che conterrà email e password
  loginForm!: FormGroup;

  // Flag per capire se siamo su mobile
  isMobile: boolean = false;

  hide = true;
  loading = false;


  constructor(
    private fb: FormBuilder,
    private breakpointObserver: BreakpointObserver,
    private router: Router,
    private adminService: AdminService,
    private sharedDataService: SharedDataService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
  // Inizializza il form reattivo con validazioni base
  this.loginForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]]
  });

  // Rileva se il dispositivo è mobile (<= 768px)
  this.breakpointObserver
    .observe(['(max-width: 768px)'])
    .subscribe(result => {
      this.isMobile = result.matches;
    });
}

onSubmit(): void {
  // Evita invii multipli
  if (this.loading) return;

  const { email, password } = this.loginForm.value;

  if (this.loginForm.valid && email && password) {
    this.loading = true;

    this.adminService.login(email, password).subscribe({
      next: (data) => {
        this.sharedDataService.setAdminToken(data.accessToken);
        this.mostraMessaggioSnakBar('Login effettuato con successo', false);
        this.router.navigate(['/home']);
        this.loading = false;
      },
      error: () => {
        this.mostraMessaggioSnakBar('Credenziali non valide', true);
        this.loading = false;
      }
    });

  } else {
    // Mostra errori se il form è incompleto o invalido
    this.loginForm.markAllAsTouched();
    this.mostraMessaggioSnakBar('Compila correttamente tutti i campi', true);
  }
}




  // Mostra un messaggio snackbar con stile personalizzato
  mostraMessaggioSnakBar(messaggio: string, isError: boolean) {
    let panelClassCustom = isError ? 'snackbar-errore' : 'snackbar-ok';
    let duration = isError ? 2000 : 1000;

    this.snackBar.open(messaggio, 'Chiudi', {
      duration: duration,
      panelClass: panelClassCustom,
      horizontalPosition: 'center',
      verticalPosition: 'top'
    });
  }
}
