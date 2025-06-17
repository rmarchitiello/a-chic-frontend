import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

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
  private protocol = 'http';
  private host = 'localhost';
  private port = '3000';
  private baseUri = '/a-chic/send-mail'; // corretto: singolare

  constructor(private http: HttpClient) {}

  inviaEmail(payload: EmailPayload): Observable<any> {
    const url = `${this.protocol}://${this.host}:${this.port}${this.baseUri}`;
    return this.http.post(url, payload);
  }
}
