import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

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
  private newsLetter = environment.apiBaseUrl +  'a-chic/send-mail-news-letter'
  constructor(private http: HttpClient) {}

  inviaEmail(payload: EmailPayload): Observable<any> {
    const url = `${this.baseUri}`;
    return this.http.post(url, payload);
  }
  inviaNewsLetterEmail(email: string): Observable<any> {
    const url = `${this.newsLetter}`;
    const request = {
      email: email
    }
    return this.http.post(url, request);
  }
}
