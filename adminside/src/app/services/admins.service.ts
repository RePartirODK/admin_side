import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Admin, AdminDto, UpdateAdminDto, AdminResponseDto } from '../models/admin.model';
import { UtilisateurResponseDto } from '../models/utilisateur.model';

@Injectable({ providedIn: 'root' })
export class AdminsService {
  private baseUrl = `${environment.apiBaseUrl}/administrateurs`;

  constructor(private http: HttpClient) {}

  createAdmin(adminDto: AdminDto): Observable<AdminResponseDto> {
    return this.http.post<AdminResponseDto>(`${this.baseUrl}/creer`, adminDto);
  }

  listAdmins(): Observable<Admin[]> {
    return this.http.get<Admin[]>(`${this.baseUrl}/lister`);
  }

  updateAdmin(adminId: number, updateAdminDto: UpdateAdminDto): Observable<AdminResponseDto> {
    return this.http.put<AdminResponseDto>(`${this.baseUrl}/modifier/${adminId}`, updateAdminDto);
  }

  listPendingAccounts(): Observable<UtilisateurResponseDto[]> {
    return this.http.get<UtilisateurResponseDto[]>(`${this.baseUrl}/comptes-en-attente`);
  }

  approveUser(userId: number): Observable<UtilisateurResponseDto> {
    return this.http.put<UtilisateurResponseDto>(`${this.baseUrl}/valider-compte/${userId}`, {});
  }

  refuseUser(userId: number): Observable<UtilisateurResponseDto> {
    return this.http.put<UtilisateurResponseDto>(`${this.baseUrl}/refuser-compte/${userId}`, {});
  }

  blockUser(userId: number): Observable<UtilisateurResponseDto> {
    return this.http.put<UtilisateurResponseDto>(`${this.baseUrl}/bloquer-utilisateur/${userId}`, {});
  }

  unblockUser(userId: number): Observable<UtilisateurResponseDto> {
    return this.http.put<UtilisateurResponseDto>(`${this.baseUrl}/debloquer-utilisateur/${userId}`, {});
  }
}


