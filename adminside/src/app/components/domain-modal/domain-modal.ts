import { Component, Output, EventEmitter, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-domain-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './domain-modal.html',
  styleUrl: './domain-modal.css'
})
export class DomainModalComponent implements OnDestroy {
  @Output() modalClosed = new EventEmitter<void>();
  @Output() domainCreated = new EventEmitter<{libelle: string}>();

  libelle: string = '';

  constructor() {}
  
  ngOnDestroy(): void {
    this.resetForm();
  }

  closeModal(): void {
    this.modalClosed.emit();
  }

  createDomain(): void {
    if (this.libelle.trim()) {
      const libelleValue = this.libelle.trim();
      this.domainCreated.emit({ libelle: libelleValue });
      // Ne pas fermer le modal ici, le parent le fera après la création réussie
      // Le libelle sera réinitialisé quand le modal sera fermé
    }
  }
  
  resetForm(): void {
    this.libelle = '';
  }

  onBackdropClick(event: Event): void {
    if (event.target === event.currentTarget) {
      this.closeModal();
    }
  }
}



