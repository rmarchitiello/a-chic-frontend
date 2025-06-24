import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { BodyUploadMedia } from '../cms/cms-upload/cms-upload.component';

@Injectable({
  providedIn: 'root'
})
export class CmsService {

  private baseUrl = environment.apiBaseUrl + 'cms';
  private media = '/media-folder';
  private mediaImages = '/media-images'
  private mediaUpload = '/media-upload'
  constructor(private http: HttpClient) {}

  /**
   * Recupera tutte le folder dal CMS.
   * Se `refresh` è true, forza l’aggiornamento bypassando la cache.
   */
  getFolders(refresh: boolean = false): Observable<any> {
    const url = `${this.baseUrl}${this.media}`;
    
    let params = new HttpParams();
    if (refresh) {
      params = params.set('refresh', 'true'); //se refresh e true bypasso la cache e vado sul cloud
    }

    return this.http.get<any>(url, { params });
  }


    deleteFolder(folderName: string): Observable<any> {
        const url = `${this.baseUrl}${this.media}`;
        const params = new HttpParams().set('folderName', folderName);
       return this.http.delete<any>(url, { params });
}

createFolder(fullPath: string): Observable<any> {
  const url = `${this.baseUrl}${this.media}`; 
  const body = { fullPath }; // Invio come JSON: { "fullPath": "/ciao/prova" }

  return this.http.post<any>(url, body); // Invia il body JSON al backend
}

deleteImages(urlsDaEliminare: string[]): Observable<any> {
  const url = `${this.baseUrl}${this.mediaImages}`; // Assicurati che `this.media` sia tipo '/cms/media-images'
  
  const body = {
    urlImageToDelete: urlsDaEliminare
  };

  return this.http.delete<any>(url, { body });
}


//metodo che mi serve per leggere le immagini dalla cache una volta che cancello un file
getAllImages(): Observable<any> {
  const url = `${this.baseUrl}${this.mediaImages}`;
  return this.http.get<any>(url);
}


updateImageMetadata(urlImmagine: string, context: { descrizione?: string; quantita?: string }): Observable<any> {
  const url = `${this.baseUrl}${this.mediaImages}`;
  
const body = {
  urlImmagine,
  context: {
    descrizione: context.descrizione,
    quantita: context.quantita != null ? String(context.quantita) : undefined
  }
};

  console.log("Request inviata:", JSON.stringify(body));
  return this.http.post<any>(url, body); // 
}


uploadMedia(formData: FormData): Observable<any> {
  const url = `${this.baseUrl}${this.mediaUpload}`;
  


  console.log("Request inviata:", JSON.stringify(formData)); //per forza form data perche sto inviando un file al backend 
  return this.http.post<any>(url, formData); // 
}


}
