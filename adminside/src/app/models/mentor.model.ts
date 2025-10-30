export interface MentorResponseDto {
  id: number;
  nomComplet: string;
  email: string;
  annee_experience: number;
  a_propos: string;
  profession: string;
  urlPhoto: string | null;
  utilisateur?: {
    id: number;
  };
}

