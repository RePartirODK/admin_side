import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AdminModalComponent } from '../components/admin-modal/admin-modal';
import { ConfirmationModalComponent } from '../components/confirmation-modal/confirmation-modal';
import { DomainModalComponent } from '../components/domain-modal/domain-modal';
import { DomainsListModalComponent, Domain } from '../components/domains-list-modal/domains-list-modal';
import { EditDomainModalComponent } from '../components/edit-domain-modal/edit-domain-modal';
import { DeleteDomainModalComponent } from '../components/delete-domain-modal/delete-domain-modal';
import { NotificationsModalComponent, Notification } from '../components/notifications-modal/notifications-modal';
import { AdminsService } from '../services/admins.service';
import { DomainsService } from '../services/domains.service';
import { StatisticsService } from '../services/statistics.service';
import { NotificationsService } from '../services/notifications.service';
import { ThemeService, Theme } from '../services/theme.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, AdminModalComponent, ConfirmationModalComponent, DomainModalComponent, DomainsListModalComponent, EditDomainModalComponent, DeleteDomainModalComponent, NotificationsModalComponent],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class DashboardComponent implements OnInit {
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
  centresCount = 0;
  blockedCount = 0;
  pendingCount = 0;
  activeAdminsCount = 0;
  currentUserName = '';
  currentTheme: Theme = 'light';

  constructor(
    private router: Router,
    private adminsService: AdminsService,
    private domainsService: DomainsService,
    private statisticsService: StatisticsService,
    private notificationsService: NotificationsService,
    public themeService: ThemeService
  ) {}

  ngOnInit(): void {
    this.loadDomains();
    this.loadStats();
    // Charger les notifications de manière non-bloquante (ne bloque pas si endpoint n'existe pas)
    try {
      this.loadNotifications();
    } catch (error) {
      console.warn('Impossible de charger les notifications', error);
      this.notifications = [];
    }
    this.loadCurrentUserName();
    // S'abonner au thème
    this.themeService.theme$.subscribe(theme => {
      this.currentTheme = theme;
    });
  }

  toggleTheme(): void {
    this.themeService.toggleTheme();
  }

  addAdmin(): void {
    this.showAdminModal = true;
  }

  private loadCurrentUserName(): void {
    const email = localStorage.getItem('auth_email') || '';
    const cached = localStorage.getItem('auth_name');
    const cachedEmail = localStorage.getItem('auth_name_email');
    
    console.log('=== DEBUG loadCurrentUserName (Dashboard) ===');
    console.log('Email:', email);
    console.log('Cached name:', cached);
    console.log('Cached email:', cachedEmail);
    
    // Nettoyer le cache si la valeur contient "Admin_System" ou est invalide
    if (cached && (cached.toLowerCase().includes('admin_system') || cached.toLowerCase().includes('admin system'))) {
      console.log('⚠️ Cache invalide détecté, nettoyage...');
      localStorage.removeItem('auth_name');
      localStorage.removeItem('auth_name_email');
    }
    
    // Utiliser le cache seulement si valide et ne contient pas "Admin_System"
    const validCache = cached && cachedEmail && cachedEmail.toLowerCase() === email.toLowerCase() 
        && !cached.toLowerCase().includes('admin_system') 
        && !cached.toLowerCase().includes('admin system')
        && cached.trim() !== '';
    
    if (validCache) {
      console.log('✅ Utilisation du cache valide:', cached);
      this.currentUserName = cached;
      return;
    }
    
    if (!email) {
      console.log('❌ Pas d\'email trouvé');
      this.currentUserName = '';
      return;
    }
    
    console.log('🔄 Rechargement depuis l\'API...');
    // Forcer le rechargement depuis l'API
    this.adminsService.listAdmins().subscribe({
      next: (admins: any[]) => {
        console.log('📥 Admins reçus:', admins?.length || 0);
        const me = (admins || []).find(a => (a?.email || '').toLowerCase() === email.toLowerCase());
        console.log('👤 Admin trouvé:', me ? `${me.prenom} ${me.nom}` : 'NON TROUVÉ');
        const name = me ? `${me.prenom || ''} ${me.nom || ''}`.trim() : email;
        this.currentUserName = name || email;
        console.log('✅ Nom défini:', this.currentUserName);
        // Mettre à jour le cache seulement si le nom est valide
        if (name && !name.toLowerCase().includes('admin_system') && !name.toLowerCase().includes('admin system')) {
          localStorage.setItem('auth_name', name);
          localStorage.setItem('auth_name_email', email);
          console.log('💾 Cache mis à jour');
        }
      },
      error: (err) => {
        console.error('❌ Erreur API:', err);
        this.currentUserName = email;
      }
    });
  }

  closeAdminModal(): void {
    this.showAdminModal = false;
  }

  onAdminCreated(adminData: any): void {
    const payload = {
      prenom: adminData.prenom,
      nom: adminData.nom,
      email: adminData.email,
      motDePasse: adminData.password
    };
    this.adminsService.createAdmin(payload).subscribe({
      next: (res) => {
        this.createdAdminName = `${res.prenom} ${res.nom}`;
        this.showAdminModal = false;
    this.showConfirmationModal = true;
      },
      error: (err) => {
        console.error('Erreur création admin', err);
        alert('Erreur lors de la création de l\'admin : ' + (err.error || err.message || 'Erreur inconnue'));
      }
    });
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
    // Réinitialiser le formulaire si nécessaire
  }

  onDomainCreated(domainData: {libelle: string}): void {
    this.domainsService.create({ libelle: domainData.libelle }).subscribe({
      next: (res) => {
        console.log('Domaine créé avec succès:', res);
        this.showDomainModal = false;
        // Petit délai pour s'assurer que le modal se ferme avant de recharger
        setTimeout(() => {
          this.loadDomains(); // Recharger la liste depuis l'API
        }, 100);
      },
      error: (err) => {
        console.error('Erreur création domaine', err);
        const errorMsg = err.error?.message || err.message || err.error || 'Erreur inconnue';
        alert('Erreur lors de la création du domaine : ' + errorMsg);
      }
    });
  }

  viewDomains(): void {
    this.showDomainsListModal = true;
    this.loadDomains();
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
    this.domainsService.update(domainData.id, { libelle: domainData.libelle }).subscribe({
      next: (res) => {
        this.showEditDomainModal = false;
        this.selectedDomain = null;
        this.loadDomains();
      },
      error: (err) => {
        console.error('Erreur mise à jour domaine', err);
        alert('Échec de la mise à jour du domaine');
    }
    });
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
    if (!this.selectedDomain) { return; }
    const id = this.selectedDomain.id;
    this.domainsService.delete(id).subscribe({
      next: () => {
        this.showDeleteDomainModal = false;
        this.selectedDomain = null;
        this.loadDomains();
      },
      error: (err) => {
        console.error('Erreur suppression domaine', err);
        alert('Échec de la suppression du domaine');
      }
    });
  }

  private loadDomains(): void {
    this.domainsService.list().subscribe({
      next: (res) => {
        this.domains = res.map(d => ({ id: d.id, libelle: d.libelle, dateCreation: new Date() }));
      },
      error: (err) => console.error('Erreur chargement domaines', err)
    });
  }

  private loadStats(): void {
    this.statisticsService.getDashboard().subscribe({
      next: (stats) => {
        this.centresCount = stats.centresCount;
        this.blockedCount = stats.blockedAccountsCount;
        this.pendingCount = stats.pendingAccountsCount;
        this.activeAdminsCount = stats.activeAdminsCount;
      },
      error: (err) => {
        console.error('Erreur chargement stats', err);
        // Fallback sur les anciennes méthodes si le endpoint n'existe pas encore
        this.loadStatsFallback();
      }
    });
  }

  private loadStatsFallback(): void {
    // Fallback si l'endpoint de stats n'existe pas encore
    this.adminsService.listAdmins().subscribe({
      next: (admins) => {
        this.activeAdminsCount = Array.isArray(admins) ? admins.length : 0;
      },
      error: () => {
        this.activeAdminsCount = 0;
      }
    });

    this.adminsService.listPendingAccounts().subscribe({
      next: (pending) => {
        this.pendingCount = Array.isArray(pending) ? pending.length : 0;
      },
      error: () => {
        this.pendingCount = 0;
    }
    });
  }

  viewAllActivities(): void {
    console.log('Voir toutes les activités');
  }

  // Méthodes pour les notifications
  openNotificationsModal(): void {
    this.showNotificationsModal = true;
    this.loadNotifications();
  }

  closeNotificationsModal(): void {
    this.showNotificationsModal = false;
  }

  onNotificationRead(notificationId: number): void {
    this.notificationsService.marquerCommeLue(notificationId).subscribe({
      next: () => {
    const notification = this.notifications.find(n => n.id === notificationId);
    if (notification) {
      notification.lu = true;
    }
      },
      error: (err) => console.error('Erreur marquage notif comme lue', err)
    });
  }

  getUnreadNotificationsCount(): number {
    return this.notifications.filter(n => !n.lu).length;
  }

  logout(): void {
    this.router.navigate(['/login']);
  }

  private loadNotifications(): void {
    // Ne charger les notifications que si le service est disponible
    if (!this.notificationsService) {
      console.warn('NotificationsService non disponible');
      this.notifications = [];
      return;
    }

    this.notificationsService.getNonLues().subscribe({
      next: (res) => {
        if (res && Array.isArray(res)) {
          this.notifications = res.map(r => {
            // Détecter le type selon le message
            let type: 'centre' | 'entreprise' | 'jeune' | 'parrain' | 'mentor' = 'centre';
            if (r.message) {
              const msg = r.message.toLowerCase();
              if (msg.includes('entreprise')) {
                type = 'entreprise';
              } else if (msg.includes('centre')) {
                type = 'centre';
              } else if (msg.includes('jeune')) {
                type = 'jeune';
              } else if (msg.includes('parrain')) {
                type = 'parrain';
              } else if (msg.includes('mentor')) {
                type = 'mentor';
              }
            }

            return {
              id: r.id || 0,
              type: type,
              message: r.message || '',
              date: r.dateCreation ? new Date(r.dateCreation) : new Date(),
              lu: r.lue === true
            };
          });
        }
      },
      error: (err) => {
        console.error('Erreur chargement notifications', err);
        // Ne pas bloquer l'application si l'endpoint n'existe pas encore
        this.notifications = [];
      }
    });
  }
}
