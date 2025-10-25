import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AdminModalComponent } from '../components/admin-modal/admin-modal';
import { ConfirmationModalComponent } from '../components/confirmation-modal/confirmation-modal';
import { DomainModalComponent } from '../components/domain-modal/domain-modal';
import { DomainsListModalComponent, Domain } from '../components/domains-list-modal/domains-list-modal';
import { EditDomainModalComponent } from '../components/edit-domain-modal/edit-domain-modal';
import { DeleteDomainModalComponent } from '../components/delete-domain-modal/delete-domain-modal';
import { NotificationsModalComponent, Notification } from '../components/notifications-modal/notifications-modal';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, AdminModalComponent, ConfirmationModalComponent, DomainModalComponent, DomainsListModalComponent, EditDomainModalComponent, DeleteDomainModalComponent, NotificationsModalComponent],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class DashboardComponent {
  showAdminModal = false;
  showConfirmationModal = false;
  showDomainModal = false;
  showDomainsListModal = false;
  showEditDomainModal = false;
  showDeleteDomainModal = false;
  showNotificationsModal = false;
  createdAdminName = '';
  domains: Domain[] = [];
  selectedDomain: Domain | null = null;
  notifications: Notification[] = [];

  constructor(private router: Router) {
    // Initialiser avec moins de domaines d'exemple pour optimiser
    this.domains = [
      {
        id: 1,
        libelle: 'Informatique',
        dateCreation: new Date('2024-01-15')
      },
      {
        id: 2,
        libelle: 'Marketing',
        dateCreation: new Date('2024-01-20')
      }
    ];

    // Initialiser les notifications d'exemple
    this.notifications = [
      {
        id: 1,
        type: 'centre',
        message: 'Un nouveau centre de formation "Tech Academy Marseille" a créé son compte',
        date: new Date(),
        lu: false
      },
      {
        id: 2,
        type: 'entreprise',
        message: 'Une nouvelle entreprise "Digital Innovations" a créé son compte',
        date: new Date(Date.now() - 3600000),
        lu: false
      },
      {
        id: 3,
        type: 'jeune',
        message: 'Le jeune "Marie Dubois" a créé son compte',
        date: new Date(Date.now() - 7200000),
        lu: true
      }
    ];
  }

  addAdmin(): void {
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

  // Méthodes pour les domaines
  addDomain(): void {
    this.showDomainModal = true;
  }

  closeDomainModal(): void {
    this.showDomainModal = false;
  }

  onDomainCreated(domainData: {libelle: string}): void {
    const newDomain: Domain = {
      id: this.domains.length + 1,
      libelle: domainData.libelle,
      dateCreation: new Date()
    };
    this.domains.push(newDomain);
    console.log('Domaine créé:', newDomain);
  }

  viewDomains(): void {
    this.showDomainsListModal = true;
  }

  closeDomainsListModal(): void {
    this.showDomainsListModal = false;
  }

  // Méthodes pour l'édition des domaines
  editDomain(domain: Domain): void {
    this.selectedDomain = domain;
    this.showEditDomainModal = true;
    this.showDomainsListModal = false;
  }

  closeEditDomainModal(): void {
    this.showEditDomainModal = false;
    this.selectedDomain = null;
  }

  onDomainUpdated(domainData: {id: number, libelle: string}): void {
    const domainIndex = this.domains.findIndex(d => d.id === domainData.id);
    if (domainIndex !== -1) {
      this.domains[domainIndex].libelle = domainData.libelle;
      console.log('Domaine mis à jour:', this.domains[domainIndex]);
    }
  }

  // Méthodes pour la suppression des domaines
  deleteDomain(domain: Domain): void {
    this.selectedDomain = domain;
    this.showDeleteDomainModal = true;
    this.showDomainsListModal = false;
  }

  closeDeleteDomainModal(): void {
    this.showDeleteDomainModal = false;
    this.selectedDomain = null;
  }

  confirmDomainDeletion(): void {
    if (this.selectedDomain) {
      const domainIndex = this.domains.findIndex(d => d.id === this.selectedDomain!.id);
      if (domainIndex !== -1) {
        const deletedDomain = this.domains.splice(domainIndex, 1)[0];
        console.log('Domaine supprimé:', deletedDomain);
      }
    }
  }

  viewAllActivities(): void {
    console.log('Voir toutes les activités');
  }

  // Méthodes pour les notifications
  openNotificationsModal(): void {
    this.showNotificationsModal = true;
  }

  closeNotificationsModal(): void {
    this.showNotificationsModal = false;
  }

  onNotificationRead(notificationId: number): void {
    const notification = this.notifications.find(n => n.id === notificationId);
    if (notification) {
      notification.lu = true;
      console.log('Notification marquée comme lue:', notificationId);
    }
  }

  getUnreadNotificationsCount(): number {
    return this.notifications.filter(n => !n.lu).length;
  }

  logout(): void {
    this.router.navigate(['/login']);
  }
}
