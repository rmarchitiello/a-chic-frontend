import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CmsService {

  private baseUrl = environment.apiBaseUrl + 'cms';
  private images = '/media-folder';

  constructor(private http: HttpClient) {}

  /**
   * Recupera tutte le folder dal CMS.
   * Se `refresh` è true, forza l’aggiornamento bypassando la cache.
   */
  getFolders(refresh: boolean = false): Observable<any> {
    const url = `${this.baseUrl}${this.images}`;
    
    let params = new HttpParams();
    if (refresh) {
      params = params.set('refresh', 'true'); //se refresh e true bypasso la cache e vado sul cloud
    }

    return this.http.get<any>(url, { params });
  }


    deleteFolder(folderName: string): Observable<any> {
        const url = `${this.baseUrl}${this.images}`;
        const params = new HttpParams().set('folderName', folderName);
       return this.http.delete<any>(url, { params });
}


}
