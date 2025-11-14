import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Jeune } from '../models/jeune.model';

@Injectable({ providedIn: 'root' })
export class JeunesService {
  private baseUrl = `${environment.apiBaseUrl}/api/jeunes`;

  constructor(private http: HttpClient) {}

  getAllJeunes(): Observable<Jeune[]> {
    return this.http.get<Jeune[]>(`${this.baseUrl}`);
  }

  getJeuneById(id: number): Observable<Jeune> {
    return this.http.get<Jeune>(`${this.baseUrl}/${id}`);
  }
}

