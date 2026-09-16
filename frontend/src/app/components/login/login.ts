import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../services/auth.service';

declare var google: any;

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})
export class LoginComponent implements OnInit {
  private authService = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  email = '';
  password = '';
  errorMessage = '';
  isLoading = false;
  sessionMessage: string | null = null;

  // Client ID de Google Cloud configurado correctamente
  private clientId = '459323739559-mr6p05eue5kpo6prkl2fjjgftnc2sl5k.apps.googleusercontent.com';

  ngOnInit() {
    const reason = this.route.snapshot.queryParamMap.get('reason');

    if (reason === 'inactivity') {
      this.sessionMessage = 'Tu sesión ha expirado debido a un periodo de inactividad.';
    } else if (reason === 'expired') {
      this.sessionMessage = 'Tu sesión ha caducado por seguridad. Por favor, inicia sesión de nuevo.';
    }

    this.initGoogleSign();
  }

  initGoogleSign() {
    if (typeof google !== 'undefined') {
      google.accounts.id.initialize({
        client_id: this.clientId,
        callback: (resp: any) => this.handleGoogleResponse(resp)
      });

      const googleBtnElement = document.getElementById('google-btn');
      if (googleBtnElement) {
        google.accounts.id.renderButton(
          googleBtnElement,
          { theme: 'outline', size: 'large', width: '100%' }
        );
      }
    }
  }

  handleGoogleResponse(response: any) {
    const idToken = response.credential;
    this.isLoading = true;
    this.errorMessage = '';

    this.authService.googleLogin(idToken).subscribe({
      next: (res) => {
        this.isLoading = false;
        if (res.success) {
          this.router.navigate(['/dashboard']);
        } else {
          this.errorMessage = res.message || 'Error al iniciar sesión con Google';
        }
      },
      error: (error: any) => {
        this.isLoading = false;
        this.errorMessage = error.error?.message || 'Error de conexión con Google';
      }
    });
  }

  login() {
    this.authService.clearSessionExpiredFlag();

    if (!this.email || !this.password) {
      this.errorMessage = 'Email y contraseña son obligatorios.';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    this.authService.login({ email: this.email, password: this.password })
      .subscribe({
        next: (response) => {
          this.isLoading = false;
          if (response.success) {
            this.router.navigate(['/dashboard']);
          } else {
            this.errorMessage = response.message || 'Error al iniciar sesión';
          }
        },
        error: (error: any) => {
          this.isLoading = false;
          this.errorMessage = error.message || 'Error de conexión';
        }
      });
  }
}