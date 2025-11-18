import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { StatisticsService } from '../../services/statistics.service';
import { AdminsService } from '../../services/admins.service';
import { MONTH_LABELS_FR } from '../../utils/month-labels';
import { NotificationsModalComponent, Notification } from '../../components/notifications-modal/notifications-modal';
import { NotificationsService } from '../../services/notifications.service';
import { ThemeService, Theme } from '../../services/theme.service';

@Component({
  selector: 'app-statistiques',
  standalone: true,
  imports: [CommonModule, RouterLink, NotificationsModalComponent],
  templateUrl: './statistiques.html',
  styleUrl: './statistiques.css'
})
export class StatistiquesComponent implements OnInit {
  // Données dynamiques une fois l'endpoint disponible
  monthlyData: { month: string; value: number }[] = [];

  showTooltip = false;
  tooltipData = { month: '', value: 0 };
  tooltipPosition = { x: 0, y: 0 };

  year = new Date().getFullYear();
  loading = true;

  // Notifications
  showNotificationsModal = false;
  notifications: Notification[] = [];
  currentUserName = '';
  currentTheme: Theme = 'light';

  constructor(
    private router: Router,
    private statisticsService: StatisticsService,
    private notificationsService: NotificationsService,
    private adminsService: AdminsService,
    public themeService: ThemeService
  ) {}

  ngOnInit(): void {
    this.loadStats();
    this.loadCurrentUserName();
    // S'abonner au thème
    this.themeService.theme$.subscribe(theme => {
      this.currentTheme = theme;
    });
  }

  toggleTheme(): void {
    this.themeService.toggleTheme();
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

  loadStats(): void {
    this.loading = true;
    this.statisticsService.getDashboard(this.year).subscribe({
      next: (stats) => {
        this.monthlyData = stats.monthlyRegistrations.map((m: any) => ({
          month: MONTH_LABELS_FR[m.month - 1] || '',
          value: m.count
        }));
        this.loading = false;
      },
      error: (err) => {
        console.error('Erreur chargement statistiques', err);
        this.loading = false;
      }
    });
  }

  getMaxValue(): number {
    if (!this.monthlyData || this.monthlyData.length === 0) return 100;
    const max = Math.max(...this.monthlyData.map(d => d.value), 0);
    if (max <= 25) return 25;
    if (max <= 50) return 50;
    if (max <= 75) return 75;
    return 100;
  }

  getBarHeight(value: number): string {
    const maxValue = this.getMaxValue();
    return `${(value / maxValue) * 100}%`;
  }

  showBarTooltip(event: MouseEvent, data: any): void {
    this.tooltipData = data;
    this.tooltipPosition = {
      x: event.clientX,
      y: event.clientY
    };
    this.showTooltip = true;
  }

  hideTooltip(): void {
    this.showTooltip = false;
  }

  logout(): void {
    this.router.navigate(['/login']);
  }
}