import { Component, EventEmitter, Output, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-admin-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-modal.html',
  styleUrl: './admin-modal.css'
})
export class AdminModalComponent implements OnInit {
  @Output() modalClosed = new EventEmitter<void>();
  @Output() adminCreated = new EventEmitter<any>();

  showPassword = false;
  adminData = {
    nom: '',
    prenom: '',
    email: '',
    password: ''
  };
  
  errors = {
    nom: '',
    prenom: '',
    email: '',
    password: ''
  };

  ngOnInit() {
    this.resetForm();
  }

  resetForm() {
    this.adminData = {
      nom: '',
      prenom: '',
      email: '',
      password: ''
    };
    this.errors = {
      nom: '',
      prenom: '',
      email: '',
      password: ''
    };
    this.showPassword = false;
  }

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  closeModal() {
    this.resetForm();
    this.modalClosed.emit();
  }

  validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  validateForm(): boolean {
    this.errors = { nom: '', prenom: '', email: '', password: '' };
    let isValid = true;

    // Validation nom
    if (!this.adminData.nom.trim()) {
      this.errors.nom = 'Le nom est requis';
      isValid = false;
    }

    // Validation prénom
    if (!this.adminData.prenom.trim()) {
      this.errors.prenom = 'Le prénom est requis';
      isValid = false;
    }

    // Validation email
    if (!this.adminData.email.trim()) {
      this.errors.email = 'L\'email est requis';
      isValid = false;
    } else if (!this.validateEmail(this.adminData.email)) {
      this.errors.email = 'Veuillez entrer un email valide';
      isValid = false;
    }

    // Validation mot de passe
    if (!this.adminData.password.trim()) {
      this.errors.password = 'Le mot de passe est requis';
      isValid = false;
    } else if (this.adminData.password.length < 6) {
      this.errors.password = 'Le mot de passe doit contenir au moins 6 caractères';
      isValid = false;
    }

    return isValid;
  }

  createAdmin() {
    if (this.validateForm()) {
      this.adminCreated.emit(this.adminData);
      this.resetForm();
      this.closeModal();
    }
  }
}