import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment';

interface LoginResponse {
  access_token: string;
  refresh_token: string;
  email: string;
  role: unknown;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private baseUrl = `${environment.apiBaseUrl}/api/auth`;

  constructor(private http: HttpClient) {}

  login(email: string, motDePasse: string): Observable<LoginResponse> {
    return this.http
      .post<LoginResponse>(`${this.baseUrl}/login`, { email, motDePasse })
      .pipe(
        tap((res) => {
          localStorage.setItem('access_token', res.access_token);
          localStorage.setItem('refresh_token', res.refresh_token);
          localStorage.setItem('auth_email', res.email);
          // Invalidate any cached name from previous sessions
          localStorage.removeItem('auth_name');
          localStorage.removeItem('auth_name_email');
        })
      );
  }

  refresh(refreshToken: string): Observable<Pick<LoginResponse, 'access_token' | 'refresh_token'>> {
    return this.http.post<Pick<LoginResponse, 'access_token' | 'refresh_token'>>(
      `${this.baseUrl}/refresh`,
      { refreshToken }
    ).pipe(
      tap((res) => {
        localStorage.setItem('access_token', res.access_token);
        localStorage.setItem('refresh_token', res.refresh_token);
      })
    );
  }

  logout(): void {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('auth_email');
    localStorage.removeItem('auth_name');
    localStorage.removeItem('auth_name_email');
  }
}


