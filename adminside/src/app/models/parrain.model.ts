import { Role } from './enums';

export interface ResponseParrain {
  id?: number;
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  urlPhoto: string | null;
  role: Role;
  estActive: boolean;
  profession: string;
  dateInscription: string;
  utilisateur?: {
    id: number;
  };
}

