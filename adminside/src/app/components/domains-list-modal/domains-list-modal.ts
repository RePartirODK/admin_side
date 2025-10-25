import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface Domain {
  id: number;
  libelle: string;
  dateCreation: Date;
}

@Component({
  selector: 'app-domains-list-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './domains-list-modal.html',
  styleUrl: './domains-list-modal.css'
})
export class DomainsListModalComponent {
  @Input() domains: Domain[] = [];
  @Output() modalClosed = new EventEmitter<void>();
  @Output() domainEdit = new EventEmitter<Domain>();
  @Output() domainDelete = new EventEmitter<Domain>();

  constructor() {}

  closeModal(): void {
    this.modalClosed.emit();
  }

  onBackdropClick(event: Event): void {
    if (event.target === event.currentTarget) {
      this.closeModal();
    }
  }

  editDomain(domain: Domain): void {
    this.domainEdit.emit(domain);
  }

  deleteDomain(domain: Domain): void {
    this.domainDelete.emit(domain);
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}
