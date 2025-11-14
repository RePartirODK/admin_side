import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface Notification {
  id: number;
  type: 'centre' | 'entreprise' | 'jeune' | 'parrain' | 'mentor';
  message: string;
  date: Date;
  lu: boolean;
}

@Component({
  selector: 'app-notifications-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './notifications-modal.html',
  styleUrl: './notifications-modal.css'
})
export class NotificationsModalComponent {
  @Input() notifications: Notification[] = [];
  @Output() modalClosed = new EventEmitter<void>();
  @Output() notificationRead = new EventEmitter<number>();

  constructor() {}

  closeModal(): void {
    this.modalClosed.emit();
  }

  markAsRead(notificationId: number): void {
    this.notificationRead.emit(notificationId);
  }

  getNotificationIcon(type: string): string {
    switch (type) {
      case 'centre':
        return 'fas fa-building';
      case 'entreprise':
        return 'fas fa-industry';
      case 'jeune':
        return 'fas fa-user-graduate';
      case 'parrain':
        return 'fas fa-hands-helping';
      case 'mentor':
        return 'fas fa-chalkboard-teacher';
      default:
        return 'fas fa-bell';
    }
  }

  getNotificationColor(type: string): string {
    switch (type) {
      case 'centre':
        return '#3EB2FF';
      case 'entreprise':
        return '#9B59B6';
      case 'jeune':
        return '#F39C12';
      case 'parrain':
        return '#1ABC9C';
      case 'mentor':
        return '#E74C3C';
      default:
        return '#95A5A6';
    }
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  onBackdropClick(event: Event): void {
    if (event.target === event.currentTarget) {
      this.closeModal();
    }
  }
}








