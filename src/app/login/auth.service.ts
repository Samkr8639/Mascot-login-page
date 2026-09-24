import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { delay, switchMap } from 'rxjs/operators';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthResult {
  success: boolean;
  token?: string;
  user?: { name: string; email: string };
  error?: string;
}

// ── Mock credentials — change these to match your real backend later ──
const MOCK_EMAIL = 'admin@company.com';
const MOCK_PASSWORD = 'Admin@123';

@Injectable({ providedIn: 'root' })
export class AuthService {
  /**
   * Mock authentication.
   * Replace the body of this method with a real HTTP call when ready.
   * E.g.: return this.http.post<AuthResult>('/api/auth/login', credentials);
   *
   * Test credentials:
   *   Email:    admin@company.com
   *   Password: Admin@123
   */
  login(credentials: LoginCredentials): Observable<AuthResult> {
    const simulatedDelay = 500; // ms — realistic API feel

    return of(credentials).pipe(
      delay(simulatedDelay),
      switchMap(({ email, password }) => {
        // ── Success: only exact credentials match ──
        if (
          email.trim().toLowerCase() === MOCK_EMAIL.toLowerCase() &&
          password === MOCK_PASSWORD
        ) {
          return of<AuthResult>({
            success: true,
            token: 'mock-jwt-token-' + Date.now(),
            user: { name: email.split('@')[0], email },
          });
        }

        // ── Failure: wrong email or wrong password → error state + ErrorVideo.mp4 ──
        return throwError(() => ({
          success: false,
          error: 'Invalid email or password. Please try again.',
        }));
      })
    );
  }
}
