import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';


@Injectable({
  providedIn: 'root'
})
export class CloudinaryService {

  private baseUrl = environment.apiBaseUrl + 'cloudinary';
  private images = '/images';
  private config = '/get-config';

  constructor(private http: HttpClient) {}

  // Recupera tutte le immagini
  getImmagini(): Observable<any> {
    const url = `${this.baseUrl}${this.images}`;
    return this.http.get<any>(url);
  }


}

