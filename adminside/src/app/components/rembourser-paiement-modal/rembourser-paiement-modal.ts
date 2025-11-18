import { Component, EventEmitter, Output, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Paiement } from '../../models/paiement.model';

@Component({
  selector: 'app-rembourser-paiement-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './rembourser-paiement-modal.html',
  styleUrl: './rembourser-paiement-modal.css'
})
export class RembourserPaiementModalComponent {
  @Input() paiement: Paiement | null = null;
  @Output() modalClosed = new EventEmitter<void>();
  @Output() paiementRembourse = new EventEmitter<number>();

  closeModal(): void {
    this.modalClosed.emit();
  }

  confirmerRemboursement(): void {
    if (this.paiement) {
      this.paiementRembourse.emit(this.paiement.id);
    }
  }

  getNomCompletJeune(): string {
    if (!this.paiement?.jeune) return 'N/A';
    const prenom = this.paiement.jeune.prenom || '';
    const nom = this.paiement.jeune.nom || '';
    return `${prenom} ${nom}`.trim() || 'N/A';
  }
}

