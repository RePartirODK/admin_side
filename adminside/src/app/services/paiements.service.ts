import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { PaiementDto } from '../models/paiement.model';

@Injectable({ providedIn: 'root' })
export class PaiementsService {
  private baseUrl = `${environment.apiBaseUrl}/api/paiements`;

  constructor(private http: HttpClient) {}

  getAllPaiements(): Observable<PaiementDto[]> {
    return this.http.get<PaiementDto[]>(`${this.baseUrl}/tous`);
  }

  validerPaiement(id: number): Observable<{message: string; success: boolean; details?: string}> {
    // Le backend retourne maintenant un objet JSON
    return this.http.put<{message: string; success: boolean; details?: string}>(
      `${this.baseUrl}/valider/${id}`, 
      {}
    );
  }

  refuserPaiement(id: number, motif: string): Observable<{message: string; success: boolean; details?: string}> {
    // Le backend retourne maintenant un objet JSON
    return this.http.put<{message: string; success: boolean; details?: string}>(
      `${this.baseUrl}/refuser/${id}`, 
      { motif }
    );
  }

  rembourserPaiement(id: number): Observable<{message: string; success: boolean; details?: string}> {
    return this.http.put<{message: string; success: boolean; details?: string}>(
      `${this.baseUrl}/rembourser/${id}`, 
      {}
    );
  }
}

