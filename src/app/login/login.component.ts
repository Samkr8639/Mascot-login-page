import {
  Component,
  computed,
  effect,
  inject,
  signal,
  OnInit,
  DestroyRef,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CharacterComponent, CharacterState } from './character/character.component';
import { AuthService } from './auth.service';

interface FormErrors {
  email?: string;
  password?: string;
  general?: string;
}

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, CharacterComponent],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent implements OnInit {
  // ── DI via inject() — Angular 14+ pattern ────────────────────
  private readonly authService = inject(AuthService);
  private readonly destroyRef   = inject(DestroyRef);

  // ── Form signals ─────────────────────────────────────────────
  readonly email        = signal('');
  readonly password     = signal('');
  readonly showPassword = signal(false);
  readonly rememberMe   = signal(false);
  readonly errors       = signal<FormErrors>({});

  // ── Submission state signals ──────────────────────────────────
  readonly isSubmitting  = signal(false);
  readonly isSuccess     = signal(false);
  readonly hasLoginError = signal(false);   // sticky error — loops ErrorVideo

  // ── Character state signal ────────────────────────────────────
  readonly characterState = signal<CharacterState>('idle');

  // ── Visibility ────────────────────────────────────────────────
  readonly isVisible = signal(true);

  // ── Computed subtitle — auto-updates whenever signals change ──
  readonly subtitleText = computed(() => {
    if (this.isSuccess())                             return 'Welcome back, friend! 🎉';
    if (this.isSubmitting())                          return 'Verifying credentials...';
    if (this.characterState() === 'error')            return 'Oops! Wrong credentials 😬';
    if (this.characterState() === 'password-focus')   return 'Shh! Looking away... 🙈';
    if (this.characterState() === 'email-focus')      return 'Watching you type ✨';
    return 'Sign in to continue your journey';
  });

  // ── Computed disabled flag for inputs/buttons ─────────────────
  readonly isDisabled = computed(() => this.isSubmitting() || this.isSuccess());

  // ── Computed button state for @switch in template ─────────────
  readonly btnState = computed<'idle' | 'loading' | 'success'>(() => {
    if (this.isSuccess())    return 'success';
    if (this.isSubmitting()) return 'loading';
    return 'idle';
  });

  ngOnInit(): void {
    this.isVisible.set(true);
  }

  // ── Input handlers ────────────────────────────────────────────
  onEmailFocus(): void {
    if (this.isDisabled()) return;
    this.characterState.set('email-focus');
  }

  onPasswordFocus(): void {
    if (this.isDisabled()) return;
    this.characterState.set('password-focus');
  }

  onInputBlur(): void {
    if (this.isDisabled()) return;
    // Sticky error: return to error state so ErrorVideo keeps looping
    this.characterState.set(this.hasLoginError() ? 'error' : 'idle');
  }

  togglePasswordVisibility(): void {
    this.showPassword.update(v => !v);
  }

  // ── Reset — called when user clicks "Create one" after success ──
  resetForm(): void {
    this.email.set('');
    this.password.set('');
    this.showPassword.set(false);
    this.rememberMe.set(false);
    this.errors.set({});
    this.isSubmitting.set(false);
    this.isSuccess.set(false);
    this.hasLoginError.set(false);
    this.characterState.set('idle');
  }

  // ── Two-way signal bindings for [(ngModel)] ───────────────────
  // Template uses (input) + [value] pattern to bridge ngModel ↔ signal
  setEmail(val: string):    void { this.email.set(val); }
  setPassword(val: string): void { this.password.set(val); }
  setRememberMe(val: boolean): void { this.rememberMe.set(val); }

  // ── Validation ────────────────────────────────────────────────
  private validate(): boolean {
    const errs: FormErrors = {};
    let valid = true;

    const emailVal = this.email().trim();
    if (!emailVal) {
      errs.email = 'Email is required.';
      valid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailVal)) {
      errs.email = 'Please enter a valid email address.';
      valid = false;
    }

    const pwVal = this.password();
    if (!pwVal) {
      errs.password = 'Password is required.';
      valid = false;
    } else if (pwVal.length < 6) {
      errs.password = 'Password must be at least 6 characters.';
      valid = false;
    }

    this.errors.set(errs);
    return valid;
  }

  // ── Submit ────────────────────────────────────────────────────
  onSubmit(): void {
    if (this.isDisabled()) return;
    if (!this.validate()) return;

    this.isSubmitting.set(true);
    this.hasLoginError.set(false);
    this.errors.set({});
    this.characterState.set('loading');

    this.authService
      .login({ email: this.email(), password: this.password() })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          // ── Success ──
          this.hasLoginError.set(false);
          this.isSuccess.set(true);
          this.isSubmitting.set(false);
          this.characterState.set('success');
          // Replace with router navigation when ready:
          // inject(Router).navigate(['/dashboard']);
          console.log('✅ Login successful — navigate to dashboard here');
        },
        error: (err) => {
          // ── Failure — ErrorVideo loops until correct credentials ──
          this.hasLoginError.set(true);
          this.isSubmitting.set(false);
          this.characterState.set('error');
          this.errors.update(e => ({
            ...e,
            general: err?.error ?? 'Invalid email or password. Please try again.',
          }));
        },
      });
  }
}
