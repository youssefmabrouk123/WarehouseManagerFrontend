import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean {
    // Check if the user is authenticated
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/signin']);
      return false;
    }

    // Get the user's role
    const userRole = this.authService.getUserRole();
    const expectedRole = route.data['role']; // Role expected for this route

    // Check if the user has the expected role
    if (expectedRole && userRole !== expectedRole) {
      // Redirect based on the user's role
      if (userRole === 'USER') {
        this.router.navigate(['/dashboard']);
      } else if (userRole === 'ADMIN') {
        this.router.navigate(['/admin']);
      }
      return false;
    }

    return true;
  }
}