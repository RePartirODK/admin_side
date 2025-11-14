import { UtilisateurResponseDto } from './utilisateur.model';

export interface Jeune {
  id: number;
  prenom: string;
  nom: string;
  email: string;
  telephone: string;
  age?: number;
  genre?: string;
  a_propos?: string;
  utilisateur?: UtilisateurResponseDto;
}

