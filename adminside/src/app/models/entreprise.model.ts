import { UtilisateurResponseDto } from './utilisateur.model';

export interface Entreprise {
  id: number;
  adresse: string;
  agrement: string;
  utilisateur: UtilisateurResponseDto;
}

