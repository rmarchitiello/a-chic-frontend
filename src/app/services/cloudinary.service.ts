import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CloudinaryService {
  private protocol = 'http';
  private host = 'localhost';
  private port = '3000';
  private baseUri = '/cloudinary';

  private images = '/images';
  private config = '/get-config';

  constructor(private http: HttpClient) {}

  // Recupera tutte le immagini
  getImmagini(): Observable<any> {
    const url = `${this.protocol}://${this.host}:${this.port}${this.baseUri}${this.images}`;
    return this.http.get<any>(url);
  }

  // Recupera la configurazione per una categoria
  getConfig(sottoCategoria: string): Observable<any> {
    const categoriaCapitalizzata = capitalizeFirstLetter(sottoCategoria);
    const url = `${this.protocol}://${this.host}:${this.port}${this.baseUri}${this.config}`;
    const params = new HttpParams().set('sottoCategoria', categoriaCapitalizzata);

    return this.http.get<any>(url, { params });
  }
}

// Funzione esterna per rendere maiuscola la prima lettera
function capitalizeFirstLetter(str: string): string {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}
