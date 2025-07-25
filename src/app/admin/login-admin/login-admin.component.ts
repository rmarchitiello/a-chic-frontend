import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { BreakpointObserver } from '@angular/cdk/layout';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { Router } from '@angular/router';
import { AdminService } from '../../services/admin.service';
@Component({
  selector: 'app-login-admin',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule
  ],
  templateUrl: './login-admin.component.html',
  styleUrls: ['./login-admin.component.scss']
})
export class LoginAdminComponent implements OnInit {

  loginForm!: FormGroup;
  isMobile: boolean = false;

  constructor(
    private fb: FormBuilder,
    private breakpointObserver: BreakpointObserver,
    private router: Router,
    private adminService: AdminService
  ) {}

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });

    this.breakpointObserver
      .observe(['(max-width: 768px)'])
      .subscribe(result => {
        this.isMobile = result.matches;
      });
  }

  onSubmit(): void {
    const { email, password } = this.loginForm.value;

    if (this.loginForm.valid) {
      if (email && password) {
        this.adminService.login(email, password).subscribe({
          next: (data) => {
            console.log("Login Admin effettuata con successo");
            sessionStorage.setItem('admin', data.accessToken);  // Salva il token come nel admin
            this.router.navigate(['/home']);                        // Redirect dopo login Admin
          },
          error: () => {
            alert("Credenziali non valide");
          }
        });
      } else {
        alert("Credenziali non valide");
      }
    } else {
      this.loginForm.markAllAsTouched();
    }
  }
}
