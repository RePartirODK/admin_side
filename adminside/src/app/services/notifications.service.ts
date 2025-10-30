import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface AdminNotificationDto {
  id: number;
  message: string;
  lue: boolean;
  dateCreation: string;
}

@Injectable({ providedIn: 'root' })
export class NotificationsService {
  private baseUrl = `${environment.apiBaseUrl}/api/notifications/admin`;

  constructor(private http: HttpClient) {}

  getNonLues(): Observable<AdminNotificationDto[]> {
    const t = Date.now();
    return this.http.get<AdminNotificationDto[]>(`${this.baseUrl}/non-lues?t=${t}`);
  }

  marquerCommeLue(id: number): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/${id}/marquer-comme-lue`, {});
  }
}


