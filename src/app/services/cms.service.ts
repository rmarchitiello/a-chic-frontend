import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CmsService {

  private baseUrl = environment.apiBaseUrl + 'cms';
  private images = '/media-folder';

  constructor(private http: HttpClient) {}


    // Recupera tutte le folder dal cms
  getFolders(): Observable<any> {
    const url = `${this.baseUrl}${this.images}`;
    return this.http.get<any>(url);
  }

}
