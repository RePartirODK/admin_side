import { Role } from './enums';

export interface Admin {
  id: number;
  prenom: string;
  nom: string;
  email: string;
  role: Role;
}

export interface AdminDto {
  prenom: string;
  nom: string;
  email: string;
  motDePasse: string;
}

export interface UpdateAdminDto {
  prenom?: string;
  nom?: string;
  email?: string;
  motDePasse?: string;
}

export interface AdminResponseDto {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  role: string;
}

