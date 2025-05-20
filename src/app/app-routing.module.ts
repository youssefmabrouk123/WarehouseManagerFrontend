import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router'; 
import { SigninComponent } from './components/signin/signin.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { DashboardAdminComponent } from './components/dashboard-admin/dashboard-admin.component';
import { AuthGuard } from './guards/auth.guard';
import { AlimentateurComponent } from './components/alimentateur/alimentateur.component';

const routes: Routes = [
  { path: 'signin', component: SigninComponent },
  { 
    path: 'dashboard', 
    component: DashboardComponent,
    canActivate: [AuthGuard],
    data: { role: 'AGENT' } // Only users with role 'USER' can access this route
  },
  { 
    path: 'alimentateur', 
    component: AlimentateurComponent,
    canActivate: [AuthGuard],
    data: { role: 'ALIMENTATEUR' } // Only users with role 'USER' can access this route
  },
  { 
    path: 'admin', 
    component: DashboardAdminComponent,
    canActivate: [AuthGuard],
    data: { role: 'ADMIN' } // Only users with role 'ADMIN' can access this route
  },
  { path: '', redirectTo: '/signin', pathMatch: 'full' }, // Redirect to signin by default
  { path: '**', redirectTo: '/signin' } // Redirect to signin for unknown routes
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
