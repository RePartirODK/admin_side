import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface ToastItem {
  id: number;
  type: ToastType;
  message: string;
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  private counter = 0;
  private toastsSubject = new BehaviorSubject<ToastItem[]>([]);
  toasts$ = this.toastsSubject.asObservable();

  private push(type: ToastType, message: string, durationMs = 4000): void {
    const id = ++this.counter;
    const item: ToastItem = { id, type, message };
    const current = this.toastsSubject.getValue();
    this.toastsSubject.next([...current, item]);
    setTimeout(() => this.dismiss(id), durationMs);
  }

  dismiss(id: number): void {
    const current = this.toastsSubject.getValue();
    this.toastsSubject.next(current.filter(t => t.id !== id));
  }

  success(message: string, durationMs?: number): void { this.push('success', message, durationMs); }
  error(message: string, durationMs?: number): void { this.push('error', message, durationMs); }
  info(message: string, durationMs?: number): void { this.push('info', message, durationMs); }
  warning(message: string, durationMs?: number): void { this.push('warning', message, durationMs); }
}


