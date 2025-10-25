import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';

@Component({
  selector: 'app-statistiques',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './statistiques.html',
  styleUrl: './statistiques.css'
})
export class StatistiquesComponent {
  // Données pour le graphique en barres - Inscriptions mensuelles
  monthlyData = [
    { month: 'Jan', value: 35 },
    { month: 'Fev', value: 65 },
    { month: 'Mar', value: 65 },
    { month: 'Avr', value: 75 },
    { month: 'Mai', value: 25 },
    { month: 'Jun', value: 80 },
    { month: 'Jul', value: 65 },
    { month: 'Aou', value: 95 },
    { month: 'Sep', value: 70 },
    { month: 'Oct', value: 95 },
    { month: 'Nov', value: 0 },
    { month: 'Dec', value: 0 }
  ];

  showTooltip = false;
  tooltipData = { month: '', value: 0 };
  tooltipPosition = { x: 0, y: 0 };

  constructor(private router: Router) {}

  getMaxValue(): number {
    return Math.max(...this.monthlyData.map(d => d.value));
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