import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Formation {
  id: number;
  titre: string;
  description?: string;
  motifAnnulation?: string;
  centre?: {
    id: number;
    nom: string;
  };
}

@Injectable({ providedIn: 'root' })
export class FormationsService {
  private baseUrl = `${environment.apiBaseUrl}/api/formations`;

  constructor(private http: HttpClient) {}

  getAllFormations(): Observable<Formation[]> {
    return this.http.get<Formation[]>(`${this.baseUrl}`);
  }

  getFormationById(id: number): Observable<Formation> {
    return this.http.get<Formation>(`${this.baseUrl}/${id}`);
  }
}



