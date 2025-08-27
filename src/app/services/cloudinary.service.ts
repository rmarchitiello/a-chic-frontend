import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { HttpParams } from '@angular/common/http';


@Injectable({
  providedIn: 'root'
})
export class CloudinaryService {

  private baseUrl = environment.apiBaseUrl + 'api/cache';
  private images = '/medias';
  private textPath = '/text/get-text'
  constructor(private http: HttpClient) {}

  // Recupera tutte le immagini
getMediaFromCache(pathImages?: string, config?: boolean): Observable<any> {
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


//leggo dalla cache text
/* Cosa succede, tramite questo servizio andiamo a chiamare il backend che legge la cache dei test 
viene utilizzato una volta nell oninit di app component, Una volta caricata la cache text di tipo TextConfigFromCache 
andiamo a settare un subject (dentro admin service)*/
getTextFromCache(): Observable<any> {
  console.log("Start chiamata a get text dalla cache: . . . ");
  const url = `${this.baseUrl}${this.textPath}`;

  

  
  // Esegui la richiesta con o senza parametri
  return this.http.get<any>(url);
}



}

