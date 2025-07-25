/**
 * Interceptor globale:
 *  • intercetta tutte le risposte HTTP
 *  • se il backend restituisce 401 (token scaduto / assente / non valido)
 *    - rimuove il token dal localStorage
 *    - reindirizza alla pagina di login
 * lo importo nel main
 */

import { Injectable } from '@angular/core';
import {
  HttpInterceptor,
  HttpHandler,
  HttpRequest,
  HttpEvent,
  HttpErrorResponse,
  HTTP_INTERCEPTORS                // << serve per la registrazione nel main
} from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  constructor(private router: Router) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(req).pipe(
      catchError((error: HttpErrorResponse) => {

        //  Se il backend risponde 401 -> token scaduto / assente
        if (error.status === 403) {
          localStorage.removeItem('admin');   // pulisco il token
          this.router.navigate(['/admin']);   // redirect alla login
        }

        // Rilancio comunque l'errore al chiamante
        return throwError(() => error);
      })
    );
  }
}
