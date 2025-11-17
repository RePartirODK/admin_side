import { Component, EventEmitter, Output, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Paiement } from '../../models/paiement.model';

@Component({
  selector: 'app-refuser-paiement-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './refuser-paiement-modal.html',
  styleUrl: './refuser-paiement-modal.css'
})
export class RefuserPaiementModalComponent {
  @Input() paiement: Paiement | null = null;
  @Output() modalClosed = new EventEmitter<void>();
  @Output() paiementRefuse = new EventEmitter<{ id: number; motif: string }>();

  motifRefus: string = '';
  errorMessage: string = '';

  closeModal(): void {
    this.modalClosed.emit();
  }

  confirmerRefus(): void {
    if (!this.motifRefus.trim()) {
      this.errorMessage = 'Le motif du refus est obligatoire';
      return;
    }

    if (this.paiement) {
      this.paiementRefuse.emit({
        id: this.paiement.id,
        motif: this.motifRefus.trim()
      });
    }
  }

  onMotifChange(): void {
    if (this.motifRefus.trim()) {
      this.errorMessage = '';
    }
  }
}


