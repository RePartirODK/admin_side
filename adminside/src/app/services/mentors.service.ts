import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { MentorResponseDto } from '../models/mentor.model';

@Injectable({ providedIn: 'root' })
export class MentorsService {
  private baseUrl = `${environment.apiBaseUrl}/api/mentors`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<MentorResponseDto[]> {
    return this.http.get<MentorResponseDto[]>(`${this.baseUrl}`);
  }

  getById(id: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/${id}`);
  }
}


