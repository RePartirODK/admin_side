import { Role, Etat } from './enums';

export interface UtilisateurResponseDto {
  id: number;
  nom: string;
  email: string;
  telephone: string;
  role: Role;
  etat: Etat;
  estActive: boolean;
}

