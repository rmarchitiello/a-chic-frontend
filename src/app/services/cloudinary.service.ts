import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { HttpParams } from '@angular/common/http';


@Injectable({
  providedIn: 'root'
})
export class CloudinaryService {

  private baseUrl = environment.apiBaseUrl + 'cloudinary';
  private images = '/images';

  constructor(private http: HttpClient) {}

  // Recupera tutte le immagini
getImmagini(pathImages?: string, config?: boolean): Observable<any> {
  console.log("Start chiamata a get media dalla cache: . . . ");
  const url = `${this.baseUrl}${this.images}`;

  // Se è stato passato un path, aggiungilo ai parametri della richiesta implica che la chiamata viene dal cms
  let params = new HttpParams();
  if (pathImages) {
    params = params.set('pathImages', pathImages);
  }
  if(config){
    params = params.set('config', config)
    console.log("Leggo dalla config")
  }
  
  // Esegui la richiesta con o senza parametri
  return this.http.get<any>(url, { params });
}


}

