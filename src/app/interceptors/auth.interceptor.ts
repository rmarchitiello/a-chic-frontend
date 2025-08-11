import { Injectable } from '@angular/core';
import {
  HttpInterceptor,
  HttpHandler,
  HttpRequest,
  HttpEvent,
  HttpErrorResponse
} from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { MatDialog } from '@angular/material/dialog';
import { SharedDataService } from '../services/shared-data.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  constructor(
    private router: Router,
    private dialog: MatDialog,
    private sharedDataService: SharedDataService
  ) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(req).pipe(
      catchError((error: HttpErrorResponse) => {

        // Se ricevo 401 (non autorizzato) o 403 (vietato)
        if (error.status === 401 || error.status === 403) {
          
          // Chiudo eventuali pop-up aperti
          this.dialog.closeAll();

          // Rimuovo il token dalla sessione
          this.sharedDataService.setAdminToken(null);

          // Reindirizzo prima alla login admin
          this.router.navigate(['/admin']);
        }

        // Propago comunque l'errore
        return throwError(() => error);
      })
    );
  }
}
