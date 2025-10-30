import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { DomaineDto, DomaineResponseDto } from '../models/domaine.model';

@Injectable({ providedIn: 'root' })
export class DomainsService {
  private baseUrl = `${environment.apiBaseUrl}/api/domaines`;

  constructor(private http: HttpClient) {}

  list(): Observable<DomaineResponseDto[]> {
    return this.http.get<DomaineResponseDto[]>(`${this.baseUrl}/lister`);
  }

  create(domaineDto: DomaineDto): Observable<any> {
    return this.http.post(`${this.baseUrl}/creer`, domaineDto);
  }

  update(id: number, domaineDto: DomaineDto): Observable<DomaineResponseDto> {
    return this.http.put<DomaineResponseDto>(`${this.baseUrl}/modifier/${id}`, domaineDto);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/supprimer/${id}`);
  }
}


