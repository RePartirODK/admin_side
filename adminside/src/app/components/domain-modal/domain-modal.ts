import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-domain-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './domain-modal.html',
  styleUrl: './domain-modal.css'
})
export class DomainModalComponent {
  @Output() modalClosed = new EventEmitter<void>();
  @Output() domainCreated = new EventEmitter<{libelle: string}>();

  libelle: string = '';

  constructor() {}

  closeModal(): void {
    this.modalClosed.emit();
  }

  createDomain(): void {
    if (this.libelle.trim()) {
      this.domainCreated.emit({ libelle: this.libelle.trim() });
      this.libelle = '';
      this.closeModal();
    }
  }

  onBackdropClick(event: Event): void {
    if (event.target === event.currentTarget) {
      this.closeModal();
    }
  }
}


