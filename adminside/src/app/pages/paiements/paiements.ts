import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { PaiementsService } from '../../services/paiements.service';
import { Paiement, StatutPaiement, PaiementDto } from '../../models/paiement.model';
import { ValiderPaiementModalComponent } from '../../components/valider-paiement-modal/valider-paiement-modal';
import { RefuserPaiementModalComponent } from '../../components/refuser-paiement-modal/refuser-paiement-modal';
import { NotificationsModalComponent, Notification } from '../../components/notifications-modal/notifications-modal';
import { NotificationsService } from '../../services/notifications.service';
import { JeunesService } from '../../services/jeunes.service';
import { FormationsService } from '../../services/formations.service';
import { CentresService } from '../../services/centres.service';

@Component({
  selector: 'app-paiements',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    ValiderPaiementModalComponent,
    RefuserPaiementModalComponent,
    NotificationsModalComponent
  ],
  templateUrl: './paiements.html',
  styleUrl: './paiements.css'
})
export class PaiementsComponent implements OnInit {
  paiements: Paiement[] = [];
  paiementsFiltres: Paiement[] = [];
  
  // Filtres
  filtreStatut: string = 'TOUS';
  filtreJeune: string = '';
  filtreDate: string = '';

  // Modales
  showValiderModal = false;
  showRefuserModal = false;
  showNotificationsModal = false;
  selectedPaiement: Paiement | null = null;

  // Notifications
  notifications: Notification[] = [];
  currentUserName = '';

  // Enum pour le template
  StatutPaiement = StatutPaiement;

  constructor(
    private router: Router,
    private paiementsService: PaiementsService,
    private notificationsService: NotificationsService,
    private jeunesService: JeunesService,
    private formationsService: FormationsService,
    private centresService: CentresService
  ) {}

  ngOnInit(): void {
    this.loadPaiements();
    this.loadCurrentUserName();
  }

  private loadPaiements(): void {
    const token = localStorage.getItem('access_token');
    if (!token) {
      console.error('Aucun token d\'accès trouvé');
      alert('Vous n\'êtes pas connecté. Redirection vers la page de connexion...');
      this.router.navigate(['/login']);
      return;
    }

    console.log('Chargement des paiements...');
    
    // Charger toutes les données en parallèle
    forkJoin({
      paiements: this.paiementsService.getAllPaiements(),
      jeunes: this.jeunesService.getAllJeunes(),
      formations: this.formationsService.getAllFormations(),
      centres: this.centresService.getAll()
    }).subscribe({
      next: ({ paiements, jeunes, formations, centres }) => {
        console.log('Réponse brute du backend:', paiements);
        console.log('Jeunes chargés:', jeunes);
        console.log('Formations chargées:', formations);
        console.log('Centres chargés:', centres);
        
        // Afficher les IDs disponibles
        console.log('IDs des formations disponibles:', formations.map((f: any) => f.id));
        console.log('IDs des jeunes disponibles:', jeunes.map(j => j.id));
        console.log('IDs des centres disponibles:', centres.map((c: any) => c.id));
        
        // Créer des maps pour accès rapide
        const jeunesMap = new Map(jeunes.map(j => [j.id, j]));
        const centresMap = new Map(centres.map((c: any) => [c.id, c]));
        
        // Enrichir les formations avec les centres
        const formationsEnrichies = formations.map((f: any) => {
          const centre = centresMap.get(f.idCentre);
          return {
            ...f,
            centre: centre ? { id: centre.id, nom: centre.nom } : undefined
          };
        });
        
        const formationsMap = new Map(formationsEnrichies.map((f: any) => [f.id, f]));
        
        this.paiements = (paiements || []).map((p: any) => {
          const jeune = jeunesMap.get(p.idJeune);
          const formation = formationsMap.get(p.idFormation);
          
          console.log(`Paiement ${p.id} - Jeune trouvé:`, jeune);
          console.log(`Paiement ${p.id} - Formation trouvée:`, formation);
          
          // Si la formation n'existe pas, essayer de la récupérer depuis le backend
          if (!formation && p.idFormation) {
            console.warn(`⚠️ Formation #${p.idFormation} n'existe pas dans la liste des formations disponibles`);
          }
          
          return {
            id: p.id || 0,
            reference: p.reference || '',
            datePaiement: p.date ? new Date(p.date) : new Date(),
            montant: p.montant || 0,
            statut: p.status || 'EN_ATTENTE',
            jeune: jeune || {
              id: p.idJeune || 0,
              prenom: '',
              nom: `Jeune #${p.idJeune || 'N/A'}`,
              email: '',
              telephone: ''
            },
            formation: formation || {
              id: p.idFormation || 0,
              titre: `Formation #${p.idFormation} (non trouvée)`,
              centre: { id: 0, nom: 'Centre inconnu' }
            },
            motifRefus: p.motifRefus || ''
          };
        });

        this.paiementsFiltres = [...this.paiements];
        console.log('Paiements après enrichissement:', this.paiements);
      },
      error: (err) => {
        console.error('Erreur chargement paiements:', err);
        
        if (err.status === 401 || err.status === 403) {
          alert('Erreur d\'authentification. Veuillez vous reconnecter.');
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          this.router.navigate(['/login']);
        } else {
          alert('Erreur lors du chargement des paiements');
        }
        
        this.paiements = [];
        this.paiementsFiltres = [];
      }
    });
  }

  private loadCurrentUserName(): void {
    const email = localStorage.getItem('auth_email') || '';
    const cached = localStorage.getItem('auth_name');
    if (cached) {
      this.currentUserName = cached;
      return;
    }
    this.currentUserName = email;
  }

  appliquerFiltres(): void {
    this.paiementsFiltres = this.paiements.filter(p => {
      let matchStatut = true;
      let matchJeune = true;
      let matchDate = true;

      // Filtre statut
      if (this.filtreStatut !== 'TOUS') {
        matchStatut = p?.statut === this.filtreStatut;
      }

      // Filtre jeune
      if (this.filtreJeune && p?.jeune) {
        const nomComplet = `${p.jeune.prenom || ''} ${p.jeune.nom || ''}`.toLowerCase();
        matchJeune = nomComplet.includes(this.filtreJeune.toLowerCase());
      }

      // Filtre date
      if (this.filtreDate && p?.datePaiement) {
        const dateStr = p.datePaiement.toISOString().split('T')[0];
        matchDate = dateStr === this.filtreDate;
      }

      return matchStatut && matchJeune && matchDate;
    });
  }

  reinitialiserFiltres(): void {
    this.filtreStatut = 'TOUS';
    this.filtreJeune = '';
    this.filtreDate = '';
    this.paiementsFiltres = [...this.paiements];
  }

  getStatutClass(statut: StatutPaiement | undefined): string {
    if (!statut) return 'badge-orange';
    switch (statut) {
      case StatutPaiement.EN_ATTENTE:
        return 'badge-orange';
      case StatutPaiement.VALIDE:
        return 'badge-vert';
      case StatutPaiement.REFUSE:
        return 'badge-rouge';
      default:
        return 'badge-orange';
    }
  }

  getStatutLabel(statut: StatutPaiement | undefined): string {
    if (!statut) return 'En attente';
    switch (statut) {
      case StatutPaiement.EN_ATTENTE:
        return 'En attente';
      case StatutPaiement.VALIDE:
        return 'Validé';
      case StatutPaiement.REFUSE:
        return 'Refusé';
      default:
        return statut || 'N/A';
    }
  }

  openValiderModal(paiement: Paiement): void {
    this.selectedPaiement = paiement;
    this.showValiderModal = true;
  }

  closeValiderModal(): void {
    this.showValiderModal = false;
    this.selectedPaiement = null;
  }

  onPaiementValide(id: number): void {
    this.paiementsService.validerPaiement(id).subscribe({
      next: (response) => {
        if (response.success) {
          this.showSnackbar(response.message || 'Paiement validé avec succès', 'success');
          this.closeValiderModal();
          this.loadPaiements();
        } else {
          this.showSnackbar(response.message || 'Erreur lors de la validation', 'error');
        }
      },
      error: (err: any) => {
        console.error('Erreur validation paiement:', err);
        const errorMessage = err.error?.message || err.error?.error || 'Erreur lors de la validation du paiement';
        this.showSnackbar(errorMessage, 'error');
      }
    });
  }

  openRefuserModal(paiement: Paiement): void {
    this.selectedPaiement = paiement;
    this.showRefuserModal = true;
  }

  closeRefuserModal(): void {
    this.showRefuserModal = false;
    this.selectedPaiement = null;
  }

  onPaiementRefuse(data: { id: number; motif: string }): void {
    this.paiementsService.refuserPaiement(data.id, data.motif).subscribe({
      next: (response) => {
        if (response.success) {
          this.showSnackbar(response.message || 'Paiement refusé avec succès', 'success');
          this.closeRefuserModal();
          this.loadPaiements();
        } else {
          this.showSnackbar(response.message || 'Erreur lors du refus', 'error');
        }
      },
      error: (err: any) => {
        console.error('Erreur refus paiement:', err);
        const errorMessage = err.error?.message || err.error?.error || 'Erreur lors du refus du paiement';
        this.showSnackbar(errorMessage, 'error');
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
            type: 'jeune',
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

  getCountByStatut(statut: string): number {
    return this.paiementsFiltres.filter(p => p.statut === statut).length;
  }

  private showSnackbar(message: string, type: 'success' | 'error'): void {
    // Simple implementation - you can enhance this with a toast service
    const snackbar = document.createElement('div');
    snackbar.className = `snackbar snackbar-${type}`;
    snackbar.textContent = message;
    snackbar.style.cssText = `
      position: fixed;
      bottom: 24px;
      right: 24px;
      padding: 16px 24px;
      background: ${type === 'success' ? '#10b981' : '#ef4444'};
      color: white;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      z-index: 9999;
      animation: slideInRight 0.3s ease-out;
    `;
    document.body.appendChild(snackbar);

    setTimeout(() => {
      snackbar.style.animation = 'slideOutRight 0.3s ease-out';
      setTimeout(() => {
        document.body.removeChild(snackbar);
      }, 300);
    }, 3000);
  }

  logout(): void {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    this.router.navigate(['/login']);
  }
}

