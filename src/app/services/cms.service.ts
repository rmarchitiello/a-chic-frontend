import { Injectable } from '@angular/core';
import { HttpClient, HttpParams,HttpHeaders  } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { RenameFolder } from '../cms/cms-media/cms-media.component';
@Injectable({
  providedIn: 'root'
})
export class CmsService {

  private baseUrl = environment.apiBaseUrl + 'cms';
  private loginUrl = '/login'
  private media = '/media-folder';
  private mediaImages = '/media-images'
  private mediaUpload = '/media-upload'
  constructor(private http: HttpClient) {}


  /* login CMS */
    //rename folder
   login(email: string, password: string): Observable<any> {
    const url = `${this.baseUrl}${this.loginUrl}`;
    const requestLogin = {
      email: email,
      password: password
    }
    


    return this.http.post<any>(url, requestLogin);
  }

  //metodo per passare il token a ogni metodo sotto lo prendo dal localstorage
  private getAuthHeaders() {
  const token = sessionStorage.getItem('admin-cms');
  return {
    Authorization: `Bearer ${token}`
  };
}



  /**
   * Recupera tutte le folder dal CMS.
   * Se `refresh` è true, forza l’aggiornamento bypassando la cache.
   */
  getFolders(config?: boolean): Observable<any> {
    const url = `${this.baseUrl}${this.media}`;

    let params = new HttpParams();
    if (config) {
      params = params.set('config', config); //se config, carico la cache delle config altrimenti la cache folder normale
    }

    return this.http.get<any>(url, { params, headers: this.getAuthHeaders() }); //invio query poaram e header
  }


  //rename folder
   renameFolder(request: RenameFolder, config?: boolean): Observable<any> {
    const url = `${this.baseUrl}${this.media}`;

        let params = new HttpParams();
    if (config) {
      params = params.set('config', config); //se config, carico la cache delle config altrimenti la cache folder normale
    }


    return this.http.put<any>(url, request, {params, headers: this.getAuthHeaders()});
  }

    deleteFolder(folderName: string, config?: boolean): Observable<any> {
        const url = `${this.baseUrl}${this.media}`;
          let params = new HttpParams().set('folderName', folderName);

          if (config !== undefined) {
                params = params.set('config', String(config));
        }       
        return this.http.delete<any>(url, { params, headers: this.getAuthHeaders()  });
}

createFolder(fullPath: string, config?: boolean): Observable<any> {
  const url = `${this.baseUrl}${this.media}`; 
  const body = { fullPath }; // Invio come JSON: { "fullPath": "/ciao/prova" }

  //se invece passo config crea direttamente la cartella e aggiorna la cache delle config folder
  let params = new HttpParams();
  if(config){
         params = new HttpParams().set('config', config);

  }

  return this.http.post<any>(url, body, {params, headers: this.getAuthHeaders()}); // Invia il body JSON al backend
}

deleteImages(urlsDaEliminare: string[], config?: boolean ): Observable<any> {
  const url = `${this.baseUrl}${this.mediaImages}`; // Assicurati che `this.media` sia tipo '/cms/media-images'
    let params = new HttpParams();
  if(config){
         params = new HttpParams().set('config', config);

  }
  const body = {
    urlImageToDelete: urlsDaEliminare
  };

  return this.http.delete<any>(url, { params, body, headers: this.getAuthHeaders() });
}


//metodo che mi serve per leggere le immagini dalla cache una volta che cancello un file
getAllImages(config?: boolean): Observable<any> {
  const url = `${this.baseUrl}${this.mediaImages}`;

      let params = new HttpParams();
  if(config){
         params = new HttpParams().set('config', config);

  }

  return this.http.get<any>(url, {params,headers: this.getAuthHeaders()});
}


updateImageMetadata(urlImmagine: string, context: { descrizione?: string; quantita?: string, nome_file?: string }, config?: boolean): Observable<any> {
  const url = `${this.baseUrl}${this.mediaImages}`;
  let params = new HttpParams();
  if(config){
         params = new HttpParams().set('config', config);

  }
const body = {
  urlImmagine,
  context: {
    nome_file: context.nome_file,
    descrizione: context.descrizione,
    quantita: context.quantita != null ? String(context.quantita) : undefined
  }
};

  console.log("Request inviata:", JSON.stringify(body));
  return this.http.put<any>(url, body, {params,headers: this.getAuthHeaders()}); // 
}

uploadMedia(formData: FormData, config?: boolean): Observable<any> {
  const url = `${this.baseUrl}${this.mediaUpload}`;
  let params = new HttpParams();

  // Se richiesto, aggiungo il flag "config=true" per indicare al backend che si tratta di una configurazione speciale
  if (config) {
    params = params.set('config', 'true');
  }

  // Log dettagliato del contenuto del FormData
  console.log("📤 Avvio uploadMedia() con il seguente contenuto:");
  for (const [key, value] of formData.entries()) {
    if (value instanceof File) {
      console.log(`📎 ${key}: FILE - ${value.name} (${value.type}, ${value.size} bytes)`);
    } else {
      console.log(`📝 ${key}:`, value);
    }
  }

  // Uso i miei headers con token recuperato da sessionStorage
  const headers = this.getAuthHeaders(); // ✅ Metodo già esistente nella classe

  // Invio la richiesta POST con FormData e parametri eventuali
  return this.http.post<any>(url, formData, {
    params,
    headers
  });
}





}
