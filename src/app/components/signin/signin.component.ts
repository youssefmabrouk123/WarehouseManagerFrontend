import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { trigger, state, style, animate, transition } from '@angular/animations';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-signin',
  templateUrl: './signin.component.html',
  styleUrls: ['./signin.component.css'],
  animations: [
    trigger('toastAnimation', [
      state('hidden', style({
        opacity: 0,
        transform: 'translateY(100%)'
      })),
      state('visible', style({
        opacity: 1,
        transform: 'translateY(0)'
      })),
      transition('hidden => visible', animate('300ms ease-out')),
      transition('visible => hidden', animate('200ms ease-in'))
    ])
  ]
})
export class SigninComponent {
  credentials = { email: '', password: '' };
  isLoading: boolean = false;
  errorMessage: string = '';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  onSubmit() {
    this.isLoading = true;
    this.errorMessage = '';

    this.authService.signIn(this.credentials).subscribe({
      next: (response) => {
        if (response.token) {
          // Fetch user details after successful sign-in
          this.authService.fetchUserDetails(response.token).subscribe({
            next: (userDetails) => {
              this.isLoading = false;
              // Redirect based on the user's role
              const userRole = this.authService.getUserRole();
              if (userRole === 'USER') {
                this.router.navigate(['/dashboard']);
              } else if (userRole === 'ADMIN') {
                this.router.navigate(['/admin']);
              } else {
                this.errorMessage = 'Rôle utilisateur non reconnu';
              }
            },
            error: (error) => {
              this.isLoading = false;
              this.errorMessage = 'Impossible de récupérer les détails de l\'utilisateur';
              console.error('Erreur lors de la récupération des détails de l\'utilisateur', error);
            }
          });
        }
      },
      error: (error) => {
        this.isLoading = false;
        switch (error.statusCode) {
          case 401: this.errorMessage = 'Email ou mot de passe incorrect'; break;
          case 404: this.errorMessage = 'Utilisateur non trouvé'; break;
          case 500: this.errorMessage = 'Erreur serveur. Veuillez réessayer'; break;
          default: this.errorMessage = 'Une erreur est survenue';
        }
      }
    });
  }
}