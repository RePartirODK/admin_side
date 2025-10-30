import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { ResponseCentre } from '../models/centre-formation.model';

@Injectable({ providedIn: 'root' })
export class CentresService {
  private baseUrl = `${environment.apiBaseUrl}/api/centres`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<ResponseCentre[]> {
    // Ajouter un timestamp pour éviter le cache
    const timestamp = new Date().getTime();
    return this.http.get<ResponseCentre[]>(`${this.baseUrl}?t=${timestamp}`);
  }

  getActifs(): Observable<ResponseCentre[]> {
    return this.http.get<ResponseCentre[]>(`${this.baseUrl}/actifs`);
  }

  getById(id: number): Observable<ResponseCentre> {
    return this.http.get<ResponseCentre>(`${this.baseUrl}/${id}`);
  }

  activer(id: number): Observable<any> {
    return this.http.put(`${this.baseUrl}/${id}/activer`, {});
  }

  desactiver(id: number): Observable<any> {
    return this.http.put(`${this.baseUrl}/${id}/desactiver`, {});
  }

  delete(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${id}`);
  }
}


