import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-edit-admin-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './edit-admin-modal.html',
  styleUrl: './edit-admin-modal.css'
})
export class EditAdminModalComponent implements OnInit {
  @Input() adminData: any = null;
  @Output() modalClosed = new EventEmitter<void>();
  @Output() adminUpdated = new EventEmitter<any>();

  showPassword = false;
  adminForm = {
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
    if (this.adminData) {
      this.adminForm = {
        nom: this.adminData.nom || '',
        prenom: this.adminData.prenom || '',
        email: this.adminData.email || '',
        password: ''
      };
    }
  }

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  closeModal() {
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
    if (!this.adminForm.nom.trim()) {
      this.errors.nom = 'Le nom est requis';
      isValid = false;
    }

    // Validation prénom
    if (!this.adminForm.prenom.trim()) {
      this.errors.prenom = 'Le prénom est requis';
      isValid = false;
    }

    // Validation email
    if (!this.adminForm.email.trim()) {
      this.errors.email = 'L\'email est requis';
      isValid = false;
    } else if (!this.validateEmail(this.adminForm.email)) {
      this.errors.email = 'Veuillez entrer un email valide';
      isValid = false;
    }

    // Validation mot de passe (optionnel pour la modification)
    if (this.adminForm.password && this.adminForm.password.length < 6) {
      this.errors.password = 'Le mot de passe doit contenir au moins 6 caractères';
      isValid = false;
    }

    return isValid;
  }

  updateAdmin() {
    if (this.validateForm()) {
      const updatedData = {
        ...this.adminData,
        nom: this.adminForm.nom,
        prenom: this.adminForm.prenom,
        email: this.adminForm.email,
        password: this.adminForm.password || undefined // Ne pas envoyer si vide
      };
      this.adminUpdated.emit(updatedData);
      this.closeModal();
    }
  }
}