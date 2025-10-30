import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { ResponseParrain } from '../models/parrain.model';

@Injectable({ providedIn: 'root' })
export class ParrainsService {
  private baseUrl = `${environment.apiBaseUrl}/api/parrains`;

  constructor(private http: HttpClient) {}

  getAllParrains(): Observable<ResponseParrain[]> {
    return this.http.get<ResponseParrain[]>(`${this.baseUrl}`);
  }

  getParrainsActifs(): Observable<ResponseParrain[]> {
    return this.http.get<ResponseParrain[]>(`${this.baseUrl}/actifs`);
  }

  getParrainById(id: number): Observable<ResponseParrain> {
    return this.http.get<ResponseParrain>(`${this.baseUrl}/${id}`);
  }
}


