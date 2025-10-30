import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService, ToastItem } from '../../services/toast.service';

@Component({
  selector: 'app-toast-container',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './toast-container.html',
  styleUrl: './toast-container.css'
})
export class ToastContainerComponent {
  toasts: ToastItem[] = [];

  constructor(private toastService: ToastService) {
    this.toastService.toasts$.subscribe(list => {
      this.toasts = list;
    });
  }

  close(id: number): void {
    this.toastService.dismiss(id);
  }
}


