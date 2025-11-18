import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { AdminsService } from '../../services/admins.service';
import { AdminModalComponent } from '../../components/admin-modal/admin-modal';
import { ConfirmationModalComponent } from '../../components/confirmation-modal/confirmation-modal';
import { EditAdminModalComponent } from '../../components/edit-admin-modal/edit-admin-modal';
import { NotificationsModalComponent, Notification } from '../../components/notifications-modal/notifications-modal';
import { NotificationsService } from '../../services/notifications.service';
import { ThemeService, Theme } from '../../services/theme.service';

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
  imports: [CommonModule, AdminModalComponent, ConfirmationModalComponent, EditAdminModalComponent, NotificationsModalComponent],
  templateUrl: './liste-admin.html',
  styleUrl: './liste-admin.css'
})
export class ListeAdminComponent implements OnInit {
  showAdminModal = false;
  showConfirmationModal = false;
  showEditModal = false;
  showNotificationsModal = false;
  createdAdminName = '';
  selectedAdmin: Admin | null = null;

  admins: Admin[] = [];

  notifications: Notification[] = [];
  currentUserName = '';
  currentTheme: Theme = 'light';

  constructor(
    private router: Router,
    private adminsService: AdminsService,
    private notificationsService: NotificationsService,
    public themeService: ThemeService
  ) {}

  ngOnInit(): void {
    this.loadAdmins();
    this.loadCurrentUserName();
    // S'abonner au thème
    this.themeService.theme$.subscribe(theme => {
      this.currentTheme = theme;
    });
  }

  toggleTheme(): void {
    this.themeService.toggleTheme();
  }

  private loadAdmins(): void {
    // Vérifier que le token existe
    const token = localStorage.getItem('access_token');
    if (!token) {
      console.error('Aucun token d\'accès trouvé');
      alert('Vous n\'êtes pas connecté. Redirection vers la page de connexion...');
      this.router.navigate(['/login']);
      return;
    }

    console.log('Chargement des admins...');
    this.adminsService.listAdmins().subscribe({
      next: (res: any) => {
        console.log('Réponse brute du backend:', res);
        
        // Gérer différents types de réponses
        let adminList: any[] = [];
        if (Array.isArray(res)) {
          adminList = res;
        } else if (res && typeof res === 'object') {
          // Peut-être une réponse avec une propriété "data" ou "admins"
          adminList = res.data || res.admins || res.content || [];
        }
        
        console.log('Liste d\'admins extraite:', adminList);
        
        this.admins = (adminList || []).map((a: any) => {
          // Gérer différents formats de nom
          let prenom = '';
          let nom = '';
          
          if (a.prenom && a.nom) {
            prenom = a.prenom;
            nom = a.nom;
          } else if (a.nomComplet) {
            const parts = a.nomComplet.split(' ');
            prenom = parts[0] || '';
            nom = parts.slice(1).join(' ') || '';
          } else if (a.nom) {
            nom = a.nom;
          }
          
          return {
            id: a.id || 0,
            nom: nom,
            prenom: prenom,
            role: a.role || 'Admin',
      avatar: 'assets/pp.png',
            email: a.email || '',
            bloque: a.bloque || a.estActive === false || false
          };
        });
        
        console.log('Admins mappés pour l\'affichage:', this.admins);
      },
      error: (err) => {
        console.error('Erreur chargement admins - Détails complets:', {
          status: err.status,
          statusText: err.statusText,
          message: err.message,
          error: err.error,
          url: err.url,
          headers: err.headers
        });
        
        // Afficher le message d'erreur du backend si disponible
        let errorMsg = 'Erreur inconnue';
        if (err.error) {
          if (typeof err.error === 'string') {
            errorMsg = err.error;
          } else if (err.error.message) {
            errorMsg = err.error.message;
          } else if (err.error.error) {
            errorMsg = err.error.error;
          }
        } else if (err.message) {
          errorMsg = err.message;
        }
        
        if (err.status === 401 || err.status === 403) {
          alert('Erreur d\'authentification. Veuillez vous reconnecter.');
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          this.router.navigate(['/login']);
        } else if (err.status === 400) {
          console.error('Erreur 400 - Problème de sérialisation côté backend');
          console.error('Le backend essaie de sérialiser l\'entité Admin avec la collection notifications (lazy loading)');
          console.error('Solution: Le backend doit retourner un DTO ou utiliser @JsonIgnore sur notifications');
          console.error('Message d\'erreur backend:', errorMsg);
          
          // Message plus clair pour l'utilisateur
          if (errorMsg.includes('lazily initialize') || errorMsg.includes('notifications')) {
            alert(`Erreur backend (400): Problème de sérialisation des données.\n\n` +
                  `Le backend doit corriger l'endpoint /administrateurs/lister pour retourner un DTO ` +
                  `ou ignorer la propriété 'notifications'.\n\n` +
                  `Message technique: ${errorMsg}`);
          } else {
            alert(`Erreur de requête (400): ${errorMsg}\n\nVérifiez la console (F12) pour plus de détails.`);
          }
        } else {
          alert(`Erreur lors du chargement des admins (${err.status}): ${errorMsg}`);
        }
        
        // Mettre une liste vide pour éviter les erreurs d'affichage
        this.admins = [];
      }
    });
  }

  private loadCurrentUserName(): void {
    const email = localStorage.getItem('auth_email') || '';
    const cached = localStorage.getItem('auth_name');
    const cachedEmail = localStorage.getItem('auth_name_email');
    
    // Nettoyer le cache si la valeur contient "Admin_System" ou est invalide
    if (cached && (cached.toLowerCase().includes('admin_system') || cached.toLowerCase().includes('admin system'))) {
      localStorage.removeItem('auth_name');
      localStorage.removeItem('auth_name_email');
    }
    
    // Utiliser le cache seulement si valide et ne contient pas "Admin_System"
    const validCache = cached && cachedEmail && cachedEmail.toLowerCase() === email.toLowerCase() 
        && !cached.toLowerCase().includes('admin_system') 
        && !cached.toLowerCase().includes('admin system')
        && cached.trim() !== '';
    
    if (validCache) {
      this.currentUserName = cached;
      return;
    }
    
    if (!email) {
      this.currentUserName = '';
      return;
    }
    
    // Forcer le rechargement depuis l'API
    this.adminsService.listAdmins().subscribe({
      next: (admins: any[]) => {
        const me = (admins || []).find(a => (a?.email || '').toLowerCase() === email.toLowerCase());
        const name = me ? `${me.prenom || ''} ${me.nom || ''}`.trim() : email;
        this.currentUserName = name || email;
        // Mettre à jour le cache seulement si le nom est valide
        if (name && !name.toLowerCase().includes('admin_system') && !name.toLowerCase().includes('admin system')) {
          localStorage.setItem('auth_name', name);
          localStorage.setItem('auth_name_email', email);
        }
      },
      error: () => {
        this.currentUserName = email;
      }
    });
  }

  // Notifications
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
        const n = this.notifications.find(x => x.id === notificationId);
        if (n) { n.lu = true; }
      },
      error: (err) => console.error('Erreur marquage notif comme lue', err)
    });
  }

  getUnreadNotificationsCount(): number {
    return this.notifications.filter(n => !n.lu).length;
  }

  private loadNotifications(): void {
    this.notificationsService.getNonLues().subscribe({
      next: (res) => {
        if (res && Array.isArray(res)) {
          this.notifications = res.map(r => ({
            id: r.id || 0,
            type: 'centre',
            message: r.message || '',
            date: r.dateCreation ? new Date(r.dateCreation) : new Date(),
            lu: r.lue === true
          }));
        }
      },
      error: (err) => {
        console.error('Erreur chargement notifications', err);
        this.notifications = [];
      }
    });
  }

  openAddAdminModal(): void {
    this.showAdminModal = true;
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
        this.loadAdmins();
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
    if (!updatedData?.id) { return; }
    this.adminsService.updateAdmin(updatedData.id, {
      prenom: updatedData.prenom,
      nom: updatedData.nom,
      email: updatedData.email,
      motDePasse: updatedData.motDePasse
    }).subscribe({
      next: () => {
        this.showEditModal = false;
        this.selectedAdmin = null;
        this.loadAdmins();
      },
      error: (err) => {
        console.error('Erreur mise à jour admin', err);
        alert('Échec de la mise à jour de l\'admin');
      }
    });
  }

  logout(): void {
    this.router.navigate(['/login']);
  }
}