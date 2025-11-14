import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class LoginComponent {
  showPassword = false;
  loading = false;
  errorMessage = '';
  
  loginData = {
    email: '',
    password: ''
  };

  constructor(private router: Router, private authService: AuthService) {}

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  onLogin() {
    if (!this.loginData.email || !this.loginData.password) {
      this.errorMessage = 'Veuillez remplir tous les champs';
      return;
    }
    
    this.loading = true;
    this.errorMessage = '';
    
    this.authService.login(this.loginData.email, this.loginData.password).subscribe({
      next: () => {
        this.loading = false;
        this.errorMessage = '';
        this.router.navigate(['/dashboard']);
      },
      error: (err: any) => {
        this.loading = false;
        console.error('Login error', err);
        
        // Gérer différents types d'erreurs
        if (err.status === 401 || err.status === 403) {
          // Identifiants incorrects
          this.errorMessage = 'Email ou mot de passe incorrect';
        } else if (err.status === 0) {
          // Problème de connexion au serveur
          this.errorMessage = 'Impossible de se connecter au serveur. Vérifiez votre connexion.';
        } else if (err.status >= 500) {
          // Erreur serveur
          this.errorMessage = 'Erreur serveur. Veuillez réessayer plus tard.';
        } else if (err.error) {
          // Extraire le message d'erreur du backend
          if (typeof err.error === 'string') {
            this.errorMessage = err.error;
          } else if (err.error.message) {
            this.errorMessage = err.error.message;
          } else if (err.error.error) {
            this.errorMessage = err.error.error;
          } else {
            this.errorMessage = 'Email ou mot de passe incorrect';
          }
        } else {
          this.errorMessage = 'Email ou mot de passe incorrect';
        }
      }
    });
  }
}