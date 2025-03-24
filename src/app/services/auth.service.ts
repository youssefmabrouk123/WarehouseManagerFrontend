import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';

// Define the response interface
interface AuthResponse {
  statusCode: number;
  token?: string;
  refreshToken?: string;
  expirationTime?: string;
  message?: string;
  error?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:7070/auth/signin'; // API endpoint for authentication
  private userApiUrl = 'http://localhost:7070/public/api/users/user'; // API endpoint for user details

  constructor(private http: HttpClient) {}

  // Handle user sign-in, sending credentials to the server
  signIn(credentials: { email: string; password: string }): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(this.apiUrl, credentials).pipe(
      tap((response: AuthResponse) => {
        if (response.statusCode === 200) {
          // Store tokens securely in localStorage if response is successful
          if (response.token) {
            localStorage.setItem('token', response.token);
          }
          if (response.refreshToken) {
            localStorage.setItem('refreshToken', response.refreshToken);
          }
        }
      }),
      catchError(this.handleError)
    );
  }

  // Fetch user details after successful sign-in
  fetchUserDetails(token: string): Observable<any> {
    const headers = {
      'Authorization': `Bearer ${token}`
    };
    return this.http.get(this.userApiUrl, { headers }).pipe(
      tap((userDetails: any) => {
        // Store user details (including role) in localStorage
        localStorage.setItem('userDetails', JSON.stringify(userDetails));
      }),
      catchError(this.handleError)
    );
  }

  // Check if the user is authenticated
  isAuthenticated(): boolean {
    const token = localStorage.getItem('token');
    return !!token; // Returns true if token exists, false otherwise
  }

  // Get the user's role
  getUserRole(): string | null {
    const userDetails = localStorage.getItem('userDetails');
    if (userDetails) {
      const parsedDetails = JSON.parse(userDetails);
      return parsedDetails.role || null; // Assumes the role is a field in userDetails
    }
    return null;
  }

  // Logout the user
  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('userDetails');
  }

  // Error handling for HTTP requests
  private handleError(error: HttpErrorResponse): Observable<never> {
    const errorResponse: Partial<AuthResponse> = {
      statusCode: error.status
    };

    if (error.error instanceof ErrorEvent) {
      // Client-side error (e.g., network error)
      errorResponse.message = 'Une erreur réseau est survenue';
      errorResponse.error = error.error.message;
    } else {
      // Server-side error (API issues)
      errorResponse.message = error.error?.message || 'Une erreur est survenue sur le serveur';
      errorResponse.error = error.error?.error || error.message;
    }

    return throwError(() => errorResponse);
  }
}