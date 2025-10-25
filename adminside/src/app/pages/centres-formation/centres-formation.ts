import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

interface User {
  id: number;
  nom: string;
  email: string;
  statut: 'Actif' | 'En attente' | 'Refusé';
  etat: 'Actif' | 'Bloqué';
}

@Component({
  selector: 'app-centres-formation',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './centres-formation.html',
  styleUrl: './centres-formation.css'
})
export class CentresFormationComponent {
  activeTab: string = 'centres';

  centres: User[] = [
    {
      id: 1,
      nom: 'Centre Formation Paris',
      email: 'contact@devtoulouse.fr',
      statut: 'Actif',
      etat: 'Actif'
    },
    {
      id: 2,
      nom: 'Formation Pro Lyon',
      email: 'info@codelille.fr',
      statut: 'Actif',
      etat: 'Actif'
    },
    {
      id: 3,
      nom: 'Tech Academy Marseille',
      email: 'admin@techmarseille.fr',
      statut: 'En attente',
      etat: 'Actif'
    },
    {
      id: 4,
      nom: 'Digital Learning Bordeaux',
      email: 'contact@cfparis.fr',
      statut: 'Refusé',
      etat: 'Actif'
    },
    {
      id: 5,
      nom: 'Code School Lille',
      email: 'contact@dbordeaux.fr',
      statut: 'En attente',
      etat: 'Actif'
    },
    {
      id: 6,
      nom: 'Dev Institute Toulouse',
      email: 'info@fplyon.fr',
      statut: 'Actif',
      etat: 'Bloqué'
    }
  ];

  entreprises: User[] = [
    {
      id: 1,
      nom: 'TechCorp Solutions',
      email: 'contact@techcorp.fr',
      statut: 'Actif',
      etat: 'Actif'
    },
    {
      id: 2,
      nom: 'Digital Innovations',
      email: 'info@digitalinnov.fr',
      statut: 'Actif',
      etat: 'Actif'
    },
    {
      id: 3,
      nom: 'StartupHub Paris',
      email: 'admin@startuphub.fr',
      statut: 'Actif',
      etat: 'Bloqué'
    },
    {
      id: 4,
      nom: 'Innovation Lab',
      email: 'contact@innovationlab.fr',
      statut: 'Actif',
      etat: 'Actif'
    }
  ];

  jeunes: User[] = [
    {
      id: 1,
      nom: 'Marie Dubois',
      email: 'marie.dubois@email.fr',
      statut: 'Actif',
      etat: 'Actif'
    },
    {
      id: 2,
      nom: 'Ahmed Benali',
      email: 'ahmed.benali@email.fr',
      statut: 'Actif',
      etat: 'Actif'
    },
    {
      id: 3,
      nom: 'Sophie Martin',
      email: 'sophie.martin@email.fr',
      statut: 'Actif',
      etat: 'Bloqué'
    },
    {
      id: 4,
      nom: 'Kevin Silva',
      email: 'kevin.silva@email.fr',
      statut: 'Actif',
      etat: 'Actif'
    }
  ];

  parrains: User[] = [
    {
      id: 1,
      nom: 'Jean-Pierre Moreau',
      email: 'jp.moreau@email.fr',
      statut: 'Actif',
      etat: 'Actif'
    },
    {
      id: 2,
      nom: 'Fatima Alami',
      email: 'fatima.alami@email.fr',
      statut: 'Actif',
      etat: 'Actif'
    },
    {
      id: 3,
      nom: 'Robert Durand',
      email: 'robert.durand@email.fr',
      statut: 'Actif',
      etat: 'Bloqué'
    },
    {
      id: 4,
      nom: 'Aïcha Traoré',
      email: 'aicha.traore@email.fr',
      statut: 'Actif',
      etat: 'Actif'
    }
  ];

  mentors: User[] = [
    {
      id: 1,
      nom: 'Dr. Sarah Johnson',
      email: 'sarah.johnson@email.fr',
      statut: 'Actif',
      etat: 'Actif'
    },
    {
      id: 2,
      nom: 'Prof. Michel Bernard',
      email: 'michel.bernard@email.fr',
      statut: 'Actif',
      etat: 'Actif'
    },
    {
      id: 3,
      nom: 'Dr. Amina Ouali',
      email: 'amina.ouali@email.fr',
      statut: 'Actif',
      etat: 'Bloqué'
    },
    {
      id: 4,
      nom: 'Prof. Thomas Leroy',
      email: 'thomas.leroy@email.fr',
      statut: 'Actif',
      etat: 'Actif'
    }
  ];

  constructor(private router: Router) {}

  setActiveTab(tab: string): void {
    this.activeTab = tab;
  }

  getStatusClass(statut: string): string {
    switch (statut) {
      case 'Actif':
        return 'status-active';
      case 'En attente':
        return 'status-pending';
      case 'Refusé':
        return 'status-refused';
      default:
        return '';
    }
  }

  getStateClass(etat: string): string {
    switch (etat) {
      case 'Actif':
        return 'state-active';
      case 'Bloqué':
        return 'state-blocked';
      default:
        return '';
    }
  }

  // Actions pour les centres de formation
  accepterCentre(centre: User): void {
    centre.statut = 'Actif';
    console.log(`Centre ${centre.nom} accepté`);
  }

  refuserCentre(centre: User): void {
    centre.statut = 'Refusé';
    console.log(`Centre ${centre.nom} refusé`);
  }

  bloquerCentre(centre: User): void {
    centre.etat = 'Bloqué';
    console.log(`Centre ${centre.nom} bloqué`);
  }

  debloquerCentre(centre: User): void {
    centre.etat = 'Actif';
    console.log(`Centre ${centre.nom} débloqué`);
  }

  // Actions pour les entreprises
  bloquerEntreprise(entreprise: User): void {
    entreprise.etat = 'Bloqué';
    console.log(`Entreprise ${entreprise.nom} bloquée`);
  }

  debloquerEntreprise(entreprise: User): void {
    entreprise.etat = 'Actif';
    console.log(`Entreprise ${entreprise.nom} débloquée`);
  }

  // Actions pour les jeunes
  bloquerJeune(jeune: User): void {
    jeune.etat = 'Bloqué';
    console.log(`Jeune ${jeune.nom} bloqué`);
  }

  debloquerJeune(jeune: User): void {
    jeune.etat = 'Actif';
    console.log(`Jeune ${jeune.nom} débloqué`);
  }

  // Actions pour les parrains
  bloquerParrain(parrain: User): void {
    parrain.etat = 'Bloqué';
    console.log(`Parrain ${parrain.nom} bloqué`);
  }

  debloquerParrain(parrain: User): void {
    parrain.etat = 'Actif';
    console.log(`Parrain ${parrain.nom} débloqué`);
  }

  // Actions pour les mentors
  bloquerMentor(mentor: User): void {
    mentor.etat = 'Bloqué';
    console.log(`Mentor ${mentor.nom} bloqué`);
  }

  debloquerMentor(mentor: User): void {
    mentor.etat = 'Actif';
    console.log(`Mentor ${mentor.nom} débloqué`);
  }

  logout(): void {
    this.router.navigate(['/login']);
  }
}