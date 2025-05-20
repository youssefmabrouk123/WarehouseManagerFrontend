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
      state('hidden', style({ opacity: 0, transform: 'translateY(100%)' })),
      state('visible', style({ opacity: 1, transform: 'translateY(0)' })),
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
          this.authService.fetchUserDetails(response.token).subscribe({
            next: () => {
              this.isLoading = false;
              const userRole = this.authService.getUserRole();
              if (userRole === 'AGENT') {
                this.router.navigate(['/dashboard']);
              } else if (userRole === 'ADMIN') {
                this.router.navigate(['/admin']);
              }else if (userRole === 'ALIMENTATEUR') {
                this.router.navigate(['/alimentateur']);
              } else {
                this.errorMessage = 'Rôle utilisateur non reconnu';
              }
            },
            error: (error) => {
              this.isLoading = false;
              this.errorMessage = 'Impossible de récupérer les détails de l\'utilisateur';
              console.error('Erreur récupération utilisateur:', error);
            }
          });
        } else {
          this.isLoading = false;
          this.errorMessage = 'Token manquant dans la réponse';
        }
      },
      error: (error) => {
        this.isLoading = false;
        switch (error.status) {
          case 401: this.errorMessage = 'Email ou mot de passe incorrect'; break;
          case 404: this.errorMessage = 'Utilisateur non trouvé'; break;
          case 500: this.errorMessage = 'Erreur serveur. Veuillez réessayer'; break;
          default: this.errorMessage = 'Une erreur est survenue';
        }
        console.error('Erreur lors de la connexion:', error);
      }
    });
  }
}
