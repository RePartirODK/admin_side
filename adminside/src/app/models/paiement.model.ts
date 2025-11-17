import { Jeune } from './jeune.model';
import { ResponseParrain } from './parrain.model';

export enum StatutPaiement {
  EN_ATTENTE = 'EN_ATTENTE',
  VALIDE = 'VALIDE',
  REFUSE = 'REFUSE'
}

export interface Formation {
  id: number;
  titre: string;
  centre?: {
    id: number;
    nom: string;
  };
}

export interface Paiement {
  id: number;
  reference: string;
  datePaiement: Date;
  montant: number;
  statut: StatutPaiement;
  jeune: Jeune;
  formation: Formation;
  parrain?: ResponseParrain;
  motifRefus?: string;
}

export interface PaiementDto {
  id: number;
  reference: string;
  datePaiement: string;
  montant: number;
  statut: StatutPaiement;
  jeune: any;
  formation: any;
  motifRefus?: string;
}
