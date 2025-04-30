import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import {
  RegisterRequest,
  PasswordResetRequest,
} from '../../features/auth/models/auth.model';
import { environment } from '../../../environments/environment';
import { AuthRequest } from "../models/auth-request";
import { User } from "../models/user";
import { AuthResponse } from "../models/auth-response";

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private http = inject(HttpClient);
  private readonly API_URL = `${environment.apiUrl}/auth`;

  private currentUserSubject = new BehaviorSubject<User | null>(null);
  currentUser$ = this.currentUserSubject.asObservable();



  constructor() {
    this.loadUserFromStorage();
  }

  private loadUserFromStorage(): void {
    try {
      const userData = localStorage.getItem('user');
      // Vérifier que userData n'est pas null ou undefined avant de faire le parsing
      if (userData) {
        this.currentUserSubject.next(JSON.parse(userData));
      }
    } catch (error) {
      console.error('Erreur lors du chargement des données utilisateur:', error);
      // En cas d'erreur, nettoyer le localStorage pour éviter de futures erreurs
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
    }
  }

  register(request: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.API_URL}/register`, request)
      .pipe(
        tap(response => this.setSession(response))
      );
  }

  login(request: AuthRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.API_URL}/authenticate`, request)
      .pipe(
        tap(response => this.setSession(response))
      );
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    this.currentUserSubject.next(null);
  }

  verifyAccount(token: string): Observable<string> {
    return this.http.get<string>(`${this.API_URL}/verify?token=${token}`);
  }

  forgotPassword(email: string): Observable<string> {
    return this.http.post<string>(`${this.API_URL}/forgot-password?email=${email}`, {});
  }

  resetPassword(request: PasswordResetRequest): Observable<string> {
    return this.http.post<string>(`${this.API_URL}/reset-password`, request);
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  // private setSession(authResult: AuthResponse): void {
  //   if (authResult && authResult.token) {
  //     localStorage.setItem('token', authResult.token);
  //
  //     if (authResult.refreshToken) {
  //       localStorage.setItem('refreshToken', authResult.refreshToken);
  //     }
  //
  //     if (authResult.user) {
  //       localStorage.setItem('user', JSON.stringify(authResult.user));
  //       this.currentUserSubject.next(authResult.user);
  //     }
  //   }
  // }

  getCurrentUser(): User | null {
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        return JSON.parse(userData);
      } catch (e) {
        return null;
      }
    }
    return null;
  }


  // Dans AuthService
  private decodeToken(token: string): any {
    try {
      // Le token est divisé en trois parties: header.payload.signature
      const payload = token.split('.')[1];
      // Décoder la partie payload qui est en base64
      const decoded = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
      // Parser le JSON
      return JSON.parse(decoded);
    } catch (e) {
      console.error('Erreur lors du décodage du token', e);
      return null;
    }
  }

  private setSession(authResult: AuthResponse): void {
    if (authResult && authResult.token) {
      localStorage.setItem('token', authResult.token);
      if (authResult.refreshToken) {
        localStorage.setItem('refreshToken', authResult.refreshToken);
      }

      // Décoder le token pour extraire les informations utilisateur
      const decodedToken = this.decodeToken(authResult.token);
      if (decodedToken) {
        // Créer un objet utilisateur à partir des claims du token
        const user: any = {
          id: decodedToken.id || decodedToken.userId || decodedToken.sub,
          email: decodedToken.email || decodedToken.sub,
          firstName: decodedToken.firstName || decodedToken.given_name,
          lastName: decodedToken.lastName || decodedToken.family_name,
          role: decodedToken.role || decodedToken.roles

          // Ajoutez d'autres propriétés selon ce qui est dans votre token
        };
        console.log(user);

        console.log("Utilisateur décodé:", user); // Pour débugger
        localStorage.setItem('user', JSON.stringify(user));
        this.currentUserSubject.next(user);
      }
    }
  }
}
