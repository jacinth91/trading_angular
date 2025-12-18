import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'dashboard', component: DashboardComponent },
  {
    path: 'stocks',
    loadComponent: () => import('./components/stocks/stocks.component').then(m => m.StocksComponent)
  },
  { path: '**', redirectTo: '/login' }
];
