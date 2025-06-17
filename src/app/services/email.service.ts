import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../src/environments/environments';

export interface EmailPayload {
  nome: string;
  cognome: string;
  email: string;
  messaggio: string;
}

@Injectable({
  providedIn: 'root'
})
export class EmailService {

  private baseUri = environment.apiBaseUrl + 'a-chic/send-mail'; // corretto: singolare

  constructor(private http: HttpClient) {}

  inviaEmail(payload: EmailPayload): Observable<any> {
    const url = `${this.baseUri}`;
    console.log("email ", url)
    return this.http.post(url, payload);
  }
}
