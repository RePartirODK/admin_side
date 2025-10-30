import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { CentresService } from '../../services/centres.service';
import { MentorsService } from '../../services/mentors.service';
import { ParrainsService } from '../../services/parrains.service';
import { EntreprisesService } from '../../services/entreprises.service';
import { JeunesService } from '../../services/jeunes.service';
import { AdminsService } from '../../services/admins.service';
import { NotificationsModalComponent, Notification } from '../../components/notifications-modal/notifications-modal';
import { ToastContainerComponent } from '../../components/toast/toast-container';
import { ToastService } from '../../services/toast.service';
import { NotificationsService } from '../../services/notifications.service';
import { ResponseCentre } from '../../models/centre-formation.model';
import { MentorResponseDto } from '../../models/mentor.model';
import { ResponseParrain } from '../../models/parrain.model';
import { Entreprise } from '../../models/entreprise.model';
import { Jeune } from '../../models/jeune.model';
import { Etat } from '../../models/enums';

interface UserDisplay {
  id: number;
  entityId: number;
  userId: number;
  nom: string;
  email: string;
  statut: 'Actif' | 'En attente' | 'Refusé';
  etat: 'Actif' | 'Bloqué';
}

@Component({
  selector: 'app-centres-formation',
  standalone: true,
  imports: [CommonModule, NotificationsModalComponent, ToastContainerComponent],
  templateUrl: './centres-formation.html',
  styleUrl: './centres-formation.css'
})
export class CentresFormationComponent implements OnInit {
  activeTab: string = 'centres';
  // Mapping email -> userId pour les centres qui n'ont pas utilisateur.id dans la réponse
  emailToUserIdMap: Map<string, number> = new Map();

  centres: UserDisplay[] = [];
  entreprises: UserDisplay[] = [];
  jeunes: UserDisplay[] = [];
  parrains: UserDisplay[] = [];
  mentors: UserDisplay[] = [];

  // Notifications
  showNotificationsModal = false;
  notifications: Notification[] = [];
  currentUserName = '';

  constructor(
    private router: Router,
    private centresService: CentresService,
    private mentorsService: MentorsService,
    private parrainsService: ParrainsService,
    private entreprisesService: EntreprisesService,
    private jeunesService: JeunesService,
    private adminsService: AdminsService,
    private notificationsService: NotificationsService,
    private toast: ToastService
  ) {}

  ngOnInit(): void {
    // Vérifier le token avant de charger les données
    const token = localStorage.getItem('access_token');
    if (!token) {
      console.error('Aucun token trouvé, redirection vers login');
      alert('Vous devez vous connecter pour accéder à cette page.');
      this.router.navigate(['/login']);
      return;
    }
    
    // Charger d'abord la liste des comptes en attente pour créer le mapping email->userId
    this.loadPendingAccountsForMapping(() => {
      this.loadCentres();
      this.loadMentors();
      this.loadParrains();
      this.loadEntreprises();
      this.loadJeunes();
    });
    this.loadCurrentUserName();
  }

  // Notifications
  openNotificationsModal(): void {
    this.showNotificationsModal = true;
    this.loadNotifications();
  }

  private loadCurrentUserName(): void {
    const email = localStorage.getItem('auth_email') || '';
    const cached = localStorage.getItem('auth_name');
    const cachedEmail = localStorage.getItem('auth_name_email');
    if (cached && cachedEmail && cachedEmail.toLowerCase() === email.toLowerCase()) {
      this.currentUserName = cached;
      return;
    }
    if (!email) {
      this.currentUserName = '';
      return;
    }
    this.adminsService.listAdmins().subscribe({
      next: (admins: any[]) => {
        const me = (admins || []).find(a => (a?.email || '').toLowerCase() === email.toLowerCase());
        const name = me ? `${me.prenom || ''} ${me.nom || ''}`.trim() : email;
        this.currentUserName = name;
        localStorage.setItem('auth_name', name);
        localStorage.setItem('auth_name_email', email);
      },
      error: () => {
        this.currentUserName = email;
      }
    });
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
  
  private loadPendingAccountsForMapping(callback: () => void): void {
    // Charger tous les utilisateurs pour créer le mapping email -> userId
    this.adminsService.listPendingAccounts().subscribe({
      next: (accounts) => {
        // Remplir le mapping avec tous les utilisateurs (pas seulement ceux en attente)
        // Pour l'instant, on utilise listPendingAccounts, mais idéalement il faudrait une liste complète
        accounts.forEach(account => {
          if (account.email) {
            this.emailToUserIdMap.set(account.email, account.id);
          }
        });
        console.log('=== MAPPING EMAIL->USERID CRÉÉ ===');
        console.log('Nombre de mappings:', this.emailToUserIdMap.size);
        console.log('Mappings:', Array.from(this.emailToUserIdMap.entries()));
        callback();
      },
      error: (err) => {
        console.warn('Impossible de charger les comptes pour le mapping, utilisation du fallback', err);
        callback(); // Continuer même en cas d'erreur
      }
    });
  }

  private loadCentres(): void {
    console.log('=== DÉBUT CHARGEMENT CENTRES ===');
    console.log('Timestamp:', new Date().toISOString());
    this.centresService.getAll().subscribe({
      next: (res: ResponseCentre[]) => {
        console.log('=== CENTRES REÇUS DU BACKEND ===');
        console.log('Nombre de centres:', res?.length || 0);
        console.log('Données brutes complètes:', JSON.stringify(res, null, 2));
        
        this.centres = (res || []).map((c) => {
          // Log pour chaque centre
          console.log(`Centre [${c.id}] ${c.nom}:`, {
            'utilisateur.id': c.utilisateur?.id,
            'utilisateur.etat': c.utilisateur?.etat,
            'utilisateur.estActive': c.utilisateur?.estActive,
            'type etat': typeof c.utilisateur?.etat
          });
          
          // Déterminer le statut basé sur utilisateur.etat (priorité absolue)
          let statut: 'Actif' | 'En attente' | 'Refusé' = 'En attente';
          let etat: 'Actif' | 'Bloqué' = 'Actif';

          if (c.utilisateur?.etat) {
            // Vérifier si c'est une string (depuis JSON) ou un enum
            const etatValue = typeof c.utilisateur.etat === 'string' 
              ? c.utilisateur.etat 
              : (c.utilisateur.etat as any)?.toString?.() || c.utilisateur.etat;
            
            console.log(`  → etatValue pour ${c.nom}:`, etatValue, '| Match VALIDE?', etatValue === Etat.VALIDE || etatValue === 'VALIDE');
            
            // Comparer avec les valeurs de l'enum (gérer les cas où c'est une string depuis JSON)
            if (etatValue === Etat.VALIDE || etatValue === 'VALIDE') {
              statut = 'Actif';
              etat = c.utilisateur.estActive === false ? 'Bloqué' : 'Actif';
              console.log(`  → Résultat ${c.nom}: Statut=Actif, État=${etat}`);
            } else if (etatValue === Etat.EN_ATTENTE || etatValue === 'EN_ATTENTE') {
              statut = 'En attente';
              etat = 'Actif';
              console.log(`  → Résultat ${c.nom}: Statut=En attente, État=Actif`);
            } else if (etatValue === Etat.REFUSE || etatValue === 'REFUSE') {
              statut = 'Refusé';
              etat = 'Bloqué';
              console.log(`  → Résultat ${c.nom}: Statut=Refusé, État=Bloqué`);
            } else {
              console.warn(`  → État inconnu pour ${c.nom}:`, etatValue);
              statut = 'En attente';
              etat = 'Actif';
            }
          } else {
            console.warn(`  → Pas d'état utilisateur pour ${c.nom}, fallback sur estActive`);
            // Fallback: si utilisateur.etat n'est pas disponible, utiliser estActive
            if (c.estActive === true) {
              statut = 'Actif';
              etat = 'Actif';
            } else if (c.estActive === false) {
              // Si estActive est false, on considère que c'est en attente (pas refusé)
              statut = 'En attente';
              etat = 'Actif';
            } else {
              statut = 'En attente';
              etat = 'Actif';
            }
          }

          return {
            id: c.utilisateur?.id || c.id,
            entityId: c.id,
            userId: c.utilisateur?.id || c.id,
            nom: c.nom || '—',
            email: c.email || '—',
            statut: statut,
            etat: etat
          };
        });
        console.log('=== CENTRES MAPPÉS FINAUX ===');
        console.log('Centres chargés dans l\'interface:', JSON.stringify(this.centres, null, 2));
      },
      error: (err) => {
        this.handleApiError(err, 'centres');
        this.centres = [];
      }
    });
  }

  private loadMentors(): void {
    this.mentorsService.getAll().subscribe({
      next: (res: MentorResponseDto[]) => {
        this.mentors = (res || []).map((m) => ({
          id: m.utilisateur?.id || m.id,
          entityId: m.id,
          userId: m.utilisateur?.id || m.id,
          nom: m.nomComplet || '—',
          email: m.email || '—',
      statut: 'Actif',
      etat: 'Actif'
        }));
      },
      error: (err) => {
        this.handleApiError(err, 'mentors');
        this.mentors = [];
      }
    });
  }

  private loadParrains(): void {
    this.parrainsService.getAllParrains().subscribe({
      next: (res: ResponseParrain[]) => {
        this.parrains = (res || []).map((p) => ({
          id: p.utilisateur?.id || p.id || 0,
          entityId: p.id || 0,
          userId: p.utilisateur?.id || p.id || 0,
          nom: `${p.prenom} ${p.nom}`.trim() || '—',
          email: p.email || '—',
          statut: p.estActive ? 'Actif' : (p.estActive === false ? 'Refusé' : 'En attente'),
          etat: p.estActive ? 'Actif' : 'Bloqué'
        }));
      },
      error: (err) => {
        this.handleApiError(err, 'parrains');
        this.parrains = [];
      }
    });
  }

  private loadEntreprises(): void {
    this.entreprisesService.getAllEntreprises().subscribe({
      next: (res: Entreprise[]) => {
        console.log('=== DEBUG ENTREPRISES - Données brutes du backend ===');
        console.log('Réponse brute API:', JSON.stringify(res, null, 2));
        
        this.entreprises = (res || []).map((e) => {
          // Log pour debug
          console.log('Entreprise:', e.utilisateur?.nom || '—', 
                      '| utilisateur.etat:', e.utilisateur?.etat, 
                      '| utilisateur.estActive:', e.utilisateur?.estActive,
                      '| Type etat:', typeof e.utilisateur?.etat);
          
          // Déterminer le statut basé sur utilisateur.etat (priorité absolue)
          let statut: 'Actif' | 'En attente' | 'Refusé' = 'En attente';
          let etat: 'Actif' | 'Bloqué' = 'Actif';

          if (e.utilisateur?.etat) {
            // Vérifier si c'est une string (depuis JSON) ou un enum
            const etatValue = typeof e.utilisateur.etat === 'string' 
              ? e.utilisateur.etat 
              : (e.utilisateur.etat as any)?.toString?.() || e.utilisateur.etat;
            
            console.log('  → etatValue:', etatValue, '| Etat.VALIDE:', Etat.VALIDE, '| Match?', etatValue === Etat.VALIDE || etatValue === 'VALIDE');
            
            // Comparer avec les valeurs de l'enum (gérer les cas où c'est une string depuis JSON)
            if (etatValue === Etat.VALIDE || etatValue === 'VALIDE') {
              statut = 'Actif';
              etat = e.utilisateur.estActive === false ? 'Bloqué' : 'Actif';
              console.log('  → Résultat: Actif /', etat);
            } else if (etatValue === Etat.EN_ATTENTE || etatValue === 'EN_ATTENTE') {
              statut = 'En attente';
              etat = 'Actif';
              console.log('  → Résultat: En attente / Actif');
            } else if (etatValue === Etat.REFUSE || etatValue === 'REFUSE') {
              statut = 'Refusé';
              etat = 'Bloqué';
              console.log('  → Résultat: Refusé / Bloqué');
            } else {
              console.warn('  → État inconnu:', etatValue, '→ Par défaut: En attente');
              statut = 'En attente';
              etat = 'Actif';
            }
          } else {
            console.warn('  → Pas d\'état utilisateur, fallback sur estActive');
            // Fallback sur estActive
            if (e.utilisateur?.estActive === true) {
              statut = 'Actif';
              etat = 'Actif';
            } else {
              statut = 'En attente';
              etat = 'Actif';
            }
          }

          return {
            id: e.utilisateur?.id || e.id,
            entityId: e.id,
            userId: e.utilisateur?.id || e.id,
            nom: e.utilisateur?.nom || '—',
            email: e.utilisateur?.email || '—',
            statut: statut,
            etat: etat
          };
        });
        console.log('=== FIN DEBUG ENTREPRISES ===');
        console.log('Entreprises chargées:', this.entreprises);
        console.log('Détails entreprises depuis API:', res);
      },
      error: (err) => {
        this.handleApiError(err, 'entreprises');
        this.entreprises = [];
      }
    });
  }

  private loadJeunes(): void {
    this.jeunesService.getAllJeunes().subscribe({
      next: (res: Jeune[]) => {
        this.jeunes = (res || []).map((j) => {
          let statut: 'Actif' | 'En attente' | 'Refusé' = 'En attente';
          let etat: 'Actif' | 'Bloqué' = 'Actif';
          
          if (j.utilisateur?.etat) {
            const etatValue = typeof j.utilisateur.etat === 'string' 
              ? j.utilisateur.etat 
              : (j.utilisateur.etat as any)?.toString?.() || j.utilisateur.etat;
            
            if (etatValue === Etat.VALIDE || etatValue === 'VALIDE') {
              statut = 'Actif';
              etat = j.utilisateur.estActive === false ? 'Bloqué' : 'Actif';
            } else if (etatValue === Etat.EN_ATTENTE || etatValue === 'EN_ATTENTE') {
              statut = 'En attente';
              etat = 'Actif';
            } else if (etatValue === Etat.REFUSE || etatValue === 'REFUSE') {
              statut = 'Refusé';
              etat = 'Bloqué';
            } else {
              statut = 'En attente';
              etat = 'Actif';
            }
          } else {
            statut = j.utilisateur.estActive === true ? 'Actif' : 'En attente';
            etat = j.utilisateur.estActive === true ? 'Actif' : 'Bloqué';
          }
          
          return {
            id: j.utilisateur.id,
            entityId: j.id,
            userId: j.utilisateur.id,
            nom: j.utilisateur.nom || '—',
            email: j.utilisateur.email || '—',
            statut: statut,
            etat: etat
          };
        });
      },
      error: (err) => {
        this.handleApiError(err, 'jeunes');
        this.jeunes = [];
      }
    });
  }

  /**
   * Gère les erreurs API de manière centralisée
   * Redirige vers login si erreur 401/403
   */
  private handleApiError(err: any, context: string): void {
    console.error(`Erreur ${context} - Détails complets:`, {
      status: err.status,
      statusText: err.statusText,
      message: err.message,
      error: err.error,
      url: err.url
    });
    
    // Gérer les erreurs d'authentification
    if (err.status === 401 || err.status === 403) {
      alert('Votre session a expiré. Veuillez vous reconnecter.');
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('auth_email');
      this.router.navigate(['/login']);
      return;
    }
    
    // Vérifier si l'endpoint existe (404)
    if (err.status === 404) {
      const endpoint = err.url?.match(/\/[a-z-]+\/[a-z-]+\/[a-z-]+/i)?.[0] || 'endpoint';
      alert(`Erreur 404: L'endpoint ${endpoint} n'existe pas côté backend.\n\nVérifiez que l'endpoint est bien créé dans le contrôleur.`);
      return;
    }
    
    // Gérer les erreurs de lazy loading
    const errorMessage = err.error?.message || err.message || err.toString();
    if (errorMessage.includes('lazily initialize') || errorMessage.includes('userDomaineList') || errorMessage.includes('offreEmploiList')) {
      alert('Erreur backend (Lazy Loading): Une collection lazy n\'est pas initialisée.\n\nVérifiez que @JsonIgnore est bien ajouté sur toutes les collections @OneToMany dans les entités.');
      return;
    }
    
    // Erreur serveur (500)
    if (err.status === 500) {
      alert(`Erreur serveur (500) lors de ${context}:\n\n${errorMessage}\n\nVérifiez les logs du serveur backend pour plus de détails.`);
      return;
    }
    
    // Erreur générique
    alert(`Erreur lors de ${context} (${err.status || 'inconnu'}):\n\n${errorMessage}\n\nVérifiez la console (F12) pour plus de détails.`);
  }

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
  accepterCentre(centre: UserDisplay): void {
    
    this.adminsService.approveUser(centre.userId).subscribe({
      next: (response) => {
        console.log('=== CENTRE ACCEPTÉ ===');
        console.log('Réponse API complète:', JSON.stringify(response, null, 2));
        console.log('État dans la réponse:', response.etat);
        console.log('estActive dans la réponse:', response.estActive);
        
        // Mettre à jour immédiatement le statut localement pour feedback visuel
        const centreIndex = this.centres.findIndex(c => c.userId === centre.userId);
        if (centreIndex !== -1) {
          this.centres[centreIndex].statut = 'Actif';
          this.centres[centreIndex].etat = 'Actif';
        }
        this.toast.success(`Le centre "${centre.nom}" a été accepté avec succès.`);
        
        // Recharger les données depuis le backend pour synchroniser (délai plus long pour laisser le backend commit la transaction)
        setTimeout(() => {
          console.log('=== RECHARGEMENT CENTRES APRÈS ACCEPTATION ===');
          console.log('Délai de 2.5 secondes pour laisser le backend commit la transaction');
          this.loadCentres();
        }, 2500);
      },
      error: (err) => {
        console.error('Erreur validation centre - Détails complets:', {
          status: err.status,
          statusText: err.statusText,
          message: err.message,
          error: err.error,
          url: err.url,
          headers: err.headers
        });
        
        // Gérer les erreurs d'authentification
        if (err.status === 401 || err.status === 403) {
          this.toast.error('Votre session a expiré. Veuillez vous reconnecter.');
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          this.router.navigate(['/login']);
          return;
        }
        
        // Vérifier si l'endpoint existe
        if (err.status === 404) {
          this.toast.error('Erreur 404: endpoint /administrateurs/valider-compte introuvable côté backend.');
          return;
        }
        
        const errorMessage = err.error?.message || err.message || err.statusText || 'Erreur inconnue';
        this.toast.error(`Erreur acceptation centre (${err.status}): ${errorMessage}`);
      }
    });
  }

  refuserCentre(centre: UserDisplay): void {
    
    this.adminsService.refuseUser(centre.userId).subscribe({
      next: (response) => {
        console.log('Centre refusé avec succès, réponse API:', response);
        // Mettre à jour immédiatement le statut localement pour feedback visuel
        const centreIndex = this.centres.findIndex(c => c.userId === centre.userId);
        if (centreIndex !== -1) {
          this.centres[centreIndex].statut = 'Refusé';
          this.centres[centreIndex].etat = 'Bloqué';
        }
        this.toast.info(`Le centre "${centre.nom}" a été refusé.`);
        // Recharger les données depuis le backend pour synchroniser (délai pour laisser le backend sauvegarder)
        setTimeout(() => {
          this.loadCentres();
        }, 1500);
      },
      error: (err) => {
        console.error('Erreur refus centre - Détails complets:', {
          status: err.status,
          statusText: err.statusText,
          message: err.message,
          error: err.error,
          url: err.url
        });
        this.handleApiError(err, 'refus du centre');
      }
    });
  }

  bloquerCentre(centre: UserDisplay): void {
    
    this.adminsService.blockUser(centre.userId).subscribe({
      next: (response) => {
        console.log('Centre bloqué avec succès, réponse API:', response);
        setTimeout(() => {
          this.loadCentres();
          this.toast.warning(`Le centre "${centre.nom}" a été bloqué avec succès.`);
        }, 500);
      },
      error: (err) => {
        console.error('Erreur blocage centre - Détails complets:', {
          status: err.status,
          statusText: err.statusText,
          message: err.message,
          error: err.error,
          url: err.url
        });
        this.handleApiError(err, 'blocage du centre');
      }
    });
  }

  debloquerCentre(centre: UserDisplay): void {
    this.adminsService.unblockUser(centre.userId).subscribe({
      next: (response) => {
        console.log('Centre débloqué avec succès, réponse API:', response);
        setTimeout(() => {
          this.loadCentres();
          this.toast.success(`Le centre "${centre.nom}" a été débloqué avec succès.`);
        }, 500);
      },
      error: (err) => {
        console.error('Erreur déblocage centre - Détails complets:', {
          status: err.status,
          statusText: err.statusText,
          message: err.message,
          error: err.error,
          url: err.url
        });
        this.handleApiError(err, 'déblocage du centre');
      }
    });
  }

  // Actions pour les entreprises
  accepterEntreprise(entreprise: UserDisplay): void {
    
    this.adminsService.approveUser(entreprise.userId).subscribe({
      next: (response) => {
        console.log('=== ENTREPRISE ACCEPTÉE ===');
        console.log('Réponse API complète:', JSON.stringify(response, null, 2));
        console.log('État dans la réponse:', response.etat);
        console.log('estActive dans la réponse:', response.estActive);
        
        // Mettre à jour immédiatement le statut localement pour feedback visuel
        const entrepriseIndex = this.entreprises.findIndex(e => e.userId === entreprise.userId);
        if (entrepriseIndex !== -1) {
          this.entreprises[entrepriseIndex].statut = 'Actif';
          this.entreprises[entrepriseIndex].etat = 'Actif';
        }
        this.toast.success(`L'entreprise "${entreprise.nom}" a été acceptée avec succès.`);
        
        // Recharger les données depuis le backend pour synchroniser (délai plus long pour laisser le backend commit la transaction)
        setTimeout(() => {
          console.log('=== RECHARGEMENT ENTREPRISES APRÈS ACCEPTATION ===');
          console.log('Délai de 2.5 secondes pour laisser le backend commit la transaction');
          this.loadEntreprises();
        }, 2500);
      },
      error: (err) => {
        console.error('Erreur validation entreprise', err);
        this.toast.error('Erreur lors de l\'acceptation de l\'entreprise: ' + (err.error?.message || err.message || 'Erreur inconnue'));
      }
    });
  }

  refuserEntreprise(entreprise: UserDisplay): void {
    
    this.adminsService.refuseUser(entreprise.userId).subscribe({
      next: (response) => {
        console.log('Entreprise refusée avec succès, réponse API:', response);
        // Mettre à jour immédiatement le statut localement pour feedback visuel
        const entrepriseIndex = this.entreprises.findIndex(e => e.userId === entreprise.userId);
        if (entrepriseIndex !== -1) {
          this.entreprises[entrepriseIndex].statut = 'Refusé';
          this.entreprises[entrepriseIndex].etat = 'Bloqué';
        }
        this.toast.info(`L'entreprise "${entreprise.nom}" a été refusée.`);
        // Recharger les données depuis le backend pour synchroniser (délai pour laisser le backend sauvegarder)
        setTimeout(() => {
          this.loadEntreprises();
        }, 1500);
      },
      error: (err) => {
        console.error('Erreur refus entreprise', err);
        this.toast.error('Erreur lors du refus de l\'entreprise: ' + (err.error?.message || err.message || 'Erreur inconnue'));
      }
    });
  }

  bloquerEntreprise(entreprise: UserDisplay): void {
    
    this.adminsService.blockUser(entreprise.userId).subscribe({
      next: (response) => {
        console.log('Entreprise bloquée avec succès, réponse API:', response);
        setTimeout(() => {
          this.loadEntreprises();
          this.toast.warning(`L'entreprise "${entreprise.nom}" a été bloquée avec succès.`);
        }, 500);
      },
      error: (err) => {
        console.error('Erreur blocage entreprise', err);
        this.toast.error('Erreur lors du blocage de l\'entreprise: ' + (err.error?.message || err.message || 'Erreur inconnue'));
      }
    });
  }

  debloquerEntreprise(entreprise: UserDisplay): void {
    this.adminsService.unblockUser(entreprise.userId).subscribe({
      next: (response) => {
        console.log('Entreprise débloquée avec succès, réponse API:', response);
        setTimeout(() => {
          this.loadEntreprises();
          this.toast.success(`L'entreprise "${entreprise.nom}" a été débloquée avec succès.`);
        }, 500);
      },
      error: (err) => {
        console.error('Erreur déblocage entreprise', err);
        this.toast.error('Erreur lors du déblocage de l\'entreprise: ' + (err.error?.message || err.message || 'Erreur inconnue'));
      }
    });
  }

  // Actions pour les jeunes
  bloquerJeune(jeune: UserDisplay): void {
    
    this.adminsService.blockUser(jeune.userId).subscribe({
      next: (response) => {
        console.log('Jeune bloqué avec succès:', response);
        this.toast.warning(`Le jeune "${jeune.nom}" a été bloqué avec succès.`);
        this.loadJeunes();
      },
      error: (err) => {
        console.error('Erreur blocage jeune', err);
        this.toast.error('Erreur lors du blocage du jeune: ' + (err.error?.message || err.message || 'Erreur inconnue'));
      }
    });
  }

  debloquerJeune(jeune: UserDisplay): void {
    this.adminsService.unblockUser(jeune.userId).subscribe({
      next: (response) => {
        console.log('Jeune débloqué avec succès:', response);
        this.toast.success(`Le jeune "${jeune.nom}" a été débloqué avec succès.`);
        this.loadJeunes();
      },
      error: (err) => {
        console.error('Erreur déblocage jeune', err);
        this.toast.error('Erreur lors du déblocage du jeune: ' + (err.error?.message || err.message || 'Erreur inconnue'));
      }
    });
  }

  // Actions pour les parrains
  bloquerParrain(parrain: UserDisplay): void {
    
    this.adminsService.blockUser(parrain.userId).subscribe({
      next: (response) => {
        console.log('Parrain bloqué avec succès:', response);
        this.toast.warning(`Le parrain "${parrain.nom}" a été bloqué avec succès.`);
        this.loadParrains();
      },
      error: (err) => {
        console.error('Erreur blocage parrain', err);
        this.toast.error('Erreur lors du blocage du parrain: ' + (err.error?.message || err.message || 'Erreur inconnue'));
      }
    });
  }

  debloquerParrain(parrain: UserDisplay): void {
    this.adminsService.unblockUser(parrain.userId).subscribe({
      next: (response) => {
        console.log('Parrain débloqué avec succès:', response);
        this.toast.success(`Le parrain "${parrain.nom}" a été débloqué avec succès.`);
        this.loadParrains();
      },
      error: (err) => {
        console.error('Erreur déblocage parrain', err);
        this.toast.error('Erreur lors du déblocage du parrain: ' + (err.error?.message || err.message || 'Erreur inconnue'));
      }
    });
  }

  // Actions pour les mentors
  bloquerMentor(mentor: UserDisplay): void {
    
    this.adminsService.blockUser(mentor.userId).subscribe({
      next: (response) => {
        console.log('Mentor bloqué avec succès:', response);
        this.toast.warning(`Le mentor "${mentor.nom}" a été bloqué avec succès.`);
        this.loadMentors();
      },
      error: (err) => {
        console.error('Erreur blocage mentor', err);
        this.toast.error('Erreur lors du blocage du mentor: ' + (err.error?.message || err.message || 'Erreur inconnue'));
      }
    });
  }

  debloquerMentor(mentor: UserDisplay): void {
    this.adminsService.unblockUser(mentor.userId).subscribe({
      next: (response) => {
        console.log('Mentor débloqué avec succès:', response);
        this.toast.success(`Le mentor "${mentor.nom}" a été débloqué avec succès.`);
        this.loadMentors();
      },
      error: (err) => {
        console.error('Erreur déblocage mentor', err);
        this.toast.error('Erreur lors du déblocage du mentor: ' + (err.error?.message || err.message || 'Erreur inconnue'));
      }
    });
  }

  logout(): void {
    this.router.navigate(['/login']);
  }
}