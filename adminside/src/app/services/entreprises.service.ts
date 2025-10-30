import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Entreprise } from '../models/entreprise.model';

@Injectable({ providedIn: 'root' })
export class EntreprisesService {
  private baseUrl = `${environment.apiBaseUrl}/api/entreprises`;

  constructor(private http: HttpClient) {}

  getAllEntreprises(): Observable<Entreprise[]> {
    // Ajouter un timestamp pour éviter le cache
    const timestamp = new Date().getTime();
    return this.http.get<Entreprise[]>(`${this.baseUrl}?t=${timestamp}`);
  }
}

