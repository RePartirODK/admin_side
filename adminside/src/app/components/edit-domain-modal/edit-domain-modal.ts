import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface Domain {
  id: number;
  libelle: string;
  dateCreation: Date;
}

@Component({
  selector: 'app-edit-domain-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './edit-domain-modal.html',
  styleUrl: './edit-domain-modal.css'
})
export class EditDomainModalComponent {
  @Input() domain: Domain | null = null;
  @Output() modalClosed = new EventEmitter<void>();
  @Output() domainUpdated = new EventEmitter<{id: number, libelle: string}>();

  libelle: string = '';

  constructor() {}

  ngOnInit(): void {
    if (this.domain) {
      this.libelle = this.domain.libelle;
    }
  }

  closeModal(): void {
    this.modalClosed.emit();
  }

  updateDomain(): void {
    if (this.libelle.trim() && this.domain) {
      this.domainUpdated.emit({ 
        id: this.domain.id, 
        libelle: this.libelle.trim() 
      });
      this.closeModal();
    }
  }

  onBackdropClick(event: Event): void {
    if (event.target === event.currentTarget) {
      this.closeModal();
    }
  }
}


