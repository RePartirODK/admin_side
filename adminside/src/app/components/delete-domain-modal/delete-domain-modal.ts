import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-delete-domain-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './delete-domain-modal.html',
  styleUrl: './delete-domain-modal.css'
})
export class DeleteDomainModalComponent {
  @Input() domainName: string = '';
  @Output() modalClosed = new EventEmitter<void>();
  @Output() domainDeleted = new EventEmitter<void>();

  constructor() {}

  closeModal(): void {
    this.modalClosed.emit();
  }

  confirmDelete(): void {
    this.domainDeleted.emit();
    this.closeModal();
  }

  onBackdropClick(event: Event): void {
    if (event.target === event.currentTarget) {
      this.closeModal();
    }
  }
}










