import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { AdminModalComponent } from '../../components/admin-modal/admin-modal';
import { ConfirmationModalComponent } from '../../components/confirmation-modal/confirmation-modal';
import { EditAdminModalComponent } from '../../components/edit-admin-modal/edit-admin-modal';

interface Admin {
  id: number;
  nom: string;
  prenom: string;
  role: string;
  avatar: string;
  email: string;
  bloque: boolean;
}

@Component({
  selector: 'app-liste-admin',
  standalone: true,
  imports: [CommonModule, AdminModalComponent, ConfirmationModalComponent, EditAdminModalComponent],
  templateUrl: './liste-admin.html',
  styleUrl: './liste-admin.css'
})
export class ListeAdminComponent {
  showAdminModal = false;
  showConfirmationModal = false;
  showEditModal = false;
  createdAdminName = '';
  selectedAdmin: Admin | null = null;

  admins: Admin[] = [
    {
      id: 1,
      nom: 'Diallo',
      prenom: 'Amadou',
      role: 'Admin',
      avatar: 'assets/pp.png',
      email: 'amadou.diallo@repartir.com',
      bloque: false
    },
    {
      id: 2,
      nom: 'Diallo',
      prenom: 'Booba',
      role: 'Admin',
      avatar: 'assets/pp.png',
      email: 'booba.diallo@repartir.com',
      bloque: true
    },
    {
      id: 3,
      nom: 'Diawara',
      prenom: 'Fatoumata',
      role: 'Admin',
      avatar: 'assets/pp.png',
      email: 'fatoumata.diawara@repartir.com',
      bloque: false
    },
    {
      id: 4,
      nom: 'Diallo',
      prenom: 'Ramarta',
      role: 'Admin',
      avatar: 'assets/pp.png',
      email: 'ramarta.diallo@repartir.com',
      bloque: false
    },
    {
      id: 5,
      nom: 'Diallo',
      prenom: 'Bakary',
      role: 'Admin',
      avatar: 'assets/pp.png',
      email: 'bakary.diallo@repartir.com',
      bloque: true
    },
    {
      id: 6,
      nom: 'Traoré',
      prenom: 'Aminata',
      role: 'Admin',
      avatar: 'assets/pp.png',
      email: 'aminata.traore@repartir.com',
      bloque: false
    }
  ];

  constructor(private router: Router) {}

  openAddAdminModal(): void {
    this.showAdminModal = true;
  }

  closeAdminModal(): void {
    this.showAdminModal = false;
  }

  onAdminCreated(adminData: any): void {
    console.log('Admin créé:', adminData);
    this.createdAdminName = `${adminData.prenom} ${adminData.nom}`;
    this.showConfirmationModal = true;
  }

  closeConfirmationModal(): void {
    this.showConfirmationModal = false;
    this.createdAdminName = '';
  }

  getRoleClass(role: string): string {
    return 'admin';
  }

  getRoleIcon(role: string): string {
    return 'fas fa-user-shield';
  }

  modifierAdmin(admin: Admin): void {
    this.selectedAdmin = admin;
    this.showEditModal = true;
  }

  closeEditModal(): void {
    this.showEditModal = false;
    this.selectedAdmin = null;
  }

  onAdminUpdated(updatedData: any): void {
    const index = this.admins.findIndex(a => a.id === updatedData.id);
    if (index > -1) {
      this.admins[index] = { ...this.admins[index], ...updatedData };
      console.log(`Admin ${updatedData.nom} mis à jour`);
    }
  }

  logout(): void {
    this.router.navigate(['/login']);
  }
}