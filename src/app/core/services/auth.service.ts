import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { Router } from '@angular/router';
import {
  LoginRequest,
  RegisterRequest,
  AuthResponse,
  PasswordResetRequest,
  UserProfile
} from '../../features/auth/models/auth.model';
import { environment } from '../../../environments/environment';
@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private http = inject(HttpClient);
  private router = inject(Router);

  private readonly apiUrl = `${environment.apiUrl}/api/auth`;
  private readonly tokenKey = 'auth_token';
  private readonly refreshTokenKey = 'refresh_token';

  private currentUserSubject = new BehaviorSubject<UserProfile | null>(null);
  currentUser$ = this.currentUserSubject.asObservable();

  private isAuthenticatedSubject = new BehaviorSubject<boolean>(this.hasValidToken());
  isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  constructor() {
    this.initializeCurrentUser();
  }
  private initializeCurrentUser(): void {
    if (this.hasValidToken()) {
      this.fetchCurrentUser().subscribe();
    }
  }
  login(credentials: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/authenticate`, credentials)
      .pipe(
        tap(response => this.handleAuthSuccess(response)),
        catchError(error => {
          console.error('Login error', error);
          return throwError(() => new Error(error.error?.message || 'Échec de connexion'));
        })
      );
  }

  register(userData: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/register`, userData)
      .pipe(
        tap(response => this.handleAuthSuccess(response)),
        catchError(error => {
          console.error('Registration error', error);
          return throwError(() => new Error(error.error?.message || 'Échec d\'inscription'));
        })
      );
  }

  logout(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.refreshTokenKey);
    this.currentUserSubject.next(null);
    this.isAuthenticatedSubject.next(false);
    this.router.navigate(['/auth/login']);
  }

  forgotPassword(email: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/forgot-password?email=${email}`, {})
      .pipe(
        catchError(error => {
          console.error('Forgot password error', error);
          return throwError(() => new Error(error.error?.message || 'Échec de demande de réinitialisation'));
        })
      );
  }

  resetPassword(data: PasswordResetRequest): Observable<any> {
    return this.http.post(`${this.apiUrl}/reset-password`, data)
      .pipe(
        catchError(error => {
          console.error('Reset password error', error);
          return throwError(() => new Error(error.error?.message || 'Échec de réinitialisation du mot de passe'));
        })
      );
  }

  verifyAccount(token: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/verify?token=${token}`)
      .pipe(
        catchError(error => {
          console.error('Verification error', error);
          return throwError(() => new Error(error.error?.message || 'Échec de vérification du compte'));
        })
      );
  }
  refreshToken(): Observable<AuthResponse> {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      return throwError(() => new Error('Refresh token not found'));
    }

    return this.http.post<AuthResponse>(`${this.apiUrl}/refresh-token`, { refreshToken })
      .pipe(
        tap(response => this.handleAuthSuccess(response)),
        catchError(error => {
          console.error('Token refresh error', error);
          this.logout();
          return throwError(() => new Error('Session expirée. Veuillez vous reconnecter.'));
        })
      );
  }
  fetchCurrentUser(): Observable<UserProfile> {
    return this.http.get<UserProfile>(`${environment.apiUrl}/api/users/me`)
      .pipe(
        tap(user => {
          this.currentUserSubject.next(user);
          this.isAuthenticatedSubject.next(true);
        }),
        catchError(error => {
          console.error('Fetch user error', error);
          this.logout();
          return throwError(() => new Error('Impossible de récupérer les informations utilisateur'));
        })
      );
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  private getRefreshToken(): string | null {
    return localStorage.getItem(this.refreshTokenKey);
  }

  private hasValidToken(): boolean {
    const token = this.getToken();
    if (!token) return false;

    // Simple check for non-expired token (would be better with JWT decoder)
    // This is just a basic implementation
    try {
      const tokenData = JSON.parse(atob(token.split('.')[1]));
      const expirationTime = tokenData.exp * 1000; // Convert to milliseconds
      return Date.now() < expirationTime;
    } catch (e) {
      return false;
    }
  }

  private handleAuthSuccess(response: AuthResponse): void {
    localStorage.setItem(this.tokenKey, response.token);
    localStorage.setItem(this.refreshTokenKey, response.refreshToken);
    this.fetchCurrentUser().subscribe();
  }


}
