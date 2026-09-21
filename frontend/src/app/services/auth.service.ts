import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, catchError, throwError } from 'rxjs';
import { Router } from '@angular/router';
import { type User, type ApiResponse, type LoginCredentials, type RegisterData } from '../types/auth.types';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private apiUrl = 'http://localhost:3000/api/auth';

  private _user = signal<User | null>(null);
  readonly user = this._user.asReadonly();

  private _authChecked = signal(false);
  readonly authChecked = this._authChecked.asReadonly();

  private _sessionExpired = signal(false);
  readonly sessionExpired = this._sessionExpired.asReadonly();

  checkSession(): Observable<ApiResponse<{ user: User }>> {
    return this.http.get<ApiResponse<{ user: User }>>(
      `${this.apiUrl}/me`,
      { withCredentials: true }
    ).pipe(
      tap(response => {
        if (response.success && response.data?.user) {
          this._user.set(response.data.user);
        } else {
          this._user.set(null);
        }
        this._authChecked.set(true);
      }),
      catchError(error => {
        this._user.set(null);
        this._authChecked.set(true);
        return throwError(() => error);
      })
    );
  }

  login(credentials: LoginCredentials): Observable<ApiResponse<{ user: User }>> {
    localStorage.removeItem('token');
    localStorage.removeItem('user');

    return this.http.post<ApiResponse<{ user: User }>>(
      `${this.apiUrl}/login`,
      credentials,
      { withCredentials: true }
    ).pipe(
      tap(response => {
        if (response.success && response.data?.user) {
          this._user.set(response.data.user);
          const expirationMs = 60 * 60 * 1000;
          const expirationTime = new Date().getTime() + expirationMs;
          localStorage.setItem('tokenExpirationTime', expirationTime.toString());
        }
      })
    );
  }

  /**
   * Inicio de sesión mediante Google OAuth Token.
   */
  googleLogin(idToken: string): Observable<ApiResponse<{ user: User }>> {
    return this.http.post<ApiResponse<{ user: User }>>(
      `${this.apiUrl}/google`,
      { idToken },
      { withCredentials: true }
    ).pipe(
      tap(response => {
        if (response.success && response.data?.user) {
          this._user.set(response.data.user);
          const expirationMs = 60 * 60 * 1000;
          const expirationTime = new Date().getTime() + expirationMs;
          localStorage.setItem('tokenExpirationTime', expirationTime.toString());
        }
      })
    );
  }

  register(userData: RegisterData): Observable<ApiResponse<{ user: User }>> {
    return this.http.post<ApiResponse<{ user: User }>>(
      `${this.apiUrl}/register`,
      userData
    );
  }

  logout(): Observable<ApiResponse<void>> {
    return this.http.post<ApiResponse<void>>(
      `${this.apiUrl}/logout`,
      {},
      { withCredentials: true }
    ).pipe(
      tap(() => {
        this.clearUser();
      })
    );
  }

  isAuthenticated(): boolean {
    return this._user() !== null;
  }

  isAdmin(): boolean {
    return this._user()?.role === 'ADMIN';
  }

  clearUser(): void {
    this._user.set(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('tokenExpirationTime');
  }

  notifySessionExpired(): void {
    this._sessionExpired.set(true);
    this.clearUser();
  }

  clearSessionExpiredFlag(): void {
    this._sessionExpired.set(false);
  }
}