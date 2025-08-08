import { Injectable } from '@angular/core';
import { HttpClient, HttpParams,HttpHeaders  } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { MediaContext } from '../pages/home/home.component';
import { UpdateAngolazioneMedia } from '../admin/editor/edit/editor-admin-popup.component';
@Injectable({
  providedIn: 'root'
})
export class AdminService {

  private baseUrl = environment.apiBaseUrl + 'admin';
  private loginUrl = '/login'
  private media = '/media-folder';
  private mediaImages = '/media-images'
  private mediaUpload = '/media-upload'
  private mediaUpdateAngolazione = '/media-update-angolazione'
  private mediaUploadOnExistFrontale = '/media-upload-exist-frontale'

  constructor(private http: HttpClient) {}


  /* login admin */
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
  const token = sessionStorage.getItem('admin');
  return {
    Authorization: `Bearer ${token}`
  };
}



  /**
   * Recupera tutte le folder dal admin.
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
   renameFolder(request: any, config?: boolean): Observable<any> {
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
  const url = `${this.baseUrl}${this.mediaImages}`; // Assicurati che `this.media` sia tipo '/admin/media-images'
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

//da cambiare in obbligatorio config per capire se e cartella config o no
updateImageMetadata(urlImmagine: string, context: MediaContext, config: boolean): Observable<any> {
  const url = `${this.baseUrl}${this.mediaImages}`;
  let params = new HttpParams();
  if(config){
         params = new HttpParams().set('config', config);

  }
const body = {
  urlImmagine,
  context
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

//da cambiare in obbligatorio config per capire se e cartella config o no
updateAngolazioneMedia(request: UpdateAngolazioneMedia, config: boolean): Observable<any> {
  const url = `${this.baseUrl}${this.mediaUpdateAngolazione}`;
  let params = new HttpParams();
  if(config){
         params = new HttpParams().set('config', config);

  }
const body = request;

  console.log("Request inviata per aggiornare l'angolazione", JSON.stringify(body));
  return this.http.put<any>(url, body, {params,headers: this.getAuthHeaders()}); // 
}

/* 
  Metodo che chiama un backend che carica una media non frontale se esiste il frontale
  Praticamente abbiamo un area di drop sui media che se carico li, posso andare a caricare altre angolazioni 
  Tranne quella frontale. Gli do in pasto anche la url per recuperare ovviamente il public id dal cloud
*/
uploadMediaExistFrontale(formData: FormData,   config?: boolean): Observable<any> {
  const url = `${this.baseUrl}${this.mediaUploadOnExistFrontale}`;
  let params = new HttpParams();

  // Se richiesto, aggiungo il flag "config=true" per indicare al backend che si tratta di una configurazione speciale
  if (config) {
    params = params.set('config', 'true');
  }

  // Log dettagliato del contenuto del FormData
  console.log("📤 Avvio uploadMediaExistFrontale() con il seguente contenuto:");
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
