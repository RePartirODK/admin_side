import { Role, Etat } from './enums';

export interface ResponseCentre {
  id: number;
  nom: string;
  adresse: string;
  telephone: string;
  email: string;
  urlPhoto: string | null;
  role: Role;
  estActive: boolean;
  agrement: string;
  // Le backend peut retourner etat et estActive soit à la racine, soit dans utilisateur
  etat?: Etat | string; // À la racine si utilisateur n'existe pas
  utilisateur?: {
    id: number;
    etat?: Etat;
    estActive?: boolean;
  };
}

