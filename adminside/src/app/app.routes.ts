import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login';
import { DashboardComponent } from './dashboard/dashboard';
import { CentresFormationComponent } from './pages/centres-formation/centres-formation';
import { ListeAdminComponent } from './pages/liste-admin/liste-admin';
import { StatistiquesComponent } from './pages/statistiques/statistiques';

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'centres-formation', component: CentresFormationComponent },
  { path: 'liste-admin', component: ListeAdminComponent },
  { path: 'statistiques', component: StatistiquesComponent }
];
