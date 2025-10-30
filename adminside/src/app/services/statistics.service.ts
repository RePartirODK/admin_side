import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { DashboardStatsDto } from '../models/dashboard-stats.model';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class StatisticsService {
  private readonly baseUrl = `${environment.apiBaseUrl}/administrateurs/statistiques`;

  constructor(private http: HttpClient) {}

  getDashboard(year?: number): Observable<DashboardStatsDto> {
    let params = new HttpParams();
    if (year) params = params.set('year', String(year));

    return this.http.get<DashboardStatsDto>(
      `${this.baseUrl}/dashboard`,
      { params }
    );
  }
}

