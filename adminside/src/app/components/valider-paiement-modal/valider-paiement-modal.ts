import { Component, EventEmitter, Output, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Paiement } from '../../models/paiement.model';

@Component({
  selector: 'app-valider-paiement-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './valider-paiement-modal.html',
  styleUrl: './valider-paiement-modal.css'
})
export class ValiderPaiementModalComponent {
  @Input() paiement: Paiement | null = null;
  @Output() modalClosed = new EventEmitter<void>();
  @Output() paiementValide = new EventEmitter<number>();

  closeModal(): void {
    this.modalClosed.emit();
  }

  confirmerValidation(): void {
    if (this.paiement) {
      this.paiementValide.emit(this.paiement.id);
    }
  }
}



