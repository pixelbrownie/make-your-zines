import { Component, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="auth-page stars-bg">
      <div class="auth-card card">
        <div class="auth-header">
          <div class="auth-logo">✦</div>
          <h1>Join ziinly!</h1>
          <p>Start making your zine collection</p>
        </div>

        <form [formGroup]="form" (ngSubmit)="submit()">
          <div class="field">
            <label>Username</label>
            <input class="input" formControlName="username" placeholder="cool_username" autocomplete="username" />
            <span class="field-error" *ngIf="form.get('username')?.invalid && form.get('username')?.touched">
              Username must be at least 3 characters
            </span>
          </div>

          <div class="field">
            <label>Email</label>
            <input class="input" type="email" formControlName="email" placeholder="you@example.com" autocomplete="email" />
            <span class="field-error" *ngIf="form.get('email')?.invalid && form.get('email')?.touched">
              Please enter a valid email address
            </span>
          </div>

          <div class="field">
            <label>Password</label>
            <input class="input" type="password" formControlName="password" placeholder="min. 6 characters" autocomplete="new-password" />
            <span class="field-error" *ngIf="form.get('password')?.invalid && form.get('password')?.touched">
              Password must be at least 6 characters
            </span>
          </div>

          <div class="field">
            <label>Confirm Password</label>
            <input class="input" type="password" formControlName="password2" placeholder="same as above" autocomplete="new-password" />
            <span class="field-error" *ngIf="form.hasError('mismatch') && form.get('password2')?.touched">
              Passwords do not match
            </span>
          </div>

          <button type="submit" class="btn btn-primary submit-btn" [disabled]="loading()">
            {{ loading() ? 'Creating account...' : 'Create account ♡' }}
          </button>
        </form>

        <div class="auth-footer">
          Already have an account?
          <a routerLink="/login">Sign in</a>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .auth-page {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 24px;
      padding-top: 88px;
    }

    .auth-card {
      width: 100%;
      max-width: 420px;
      padding: 40px;
    }

    .auth-header {
      text-align: center;
      margin-bottom: 32px;
    }

    .auth-logo {
      font-size: 2rem;
      color: var(--pink-dark);
      margin-bottom: 12px;
      animation: pulse 2s ease-in-out infinite;
    }

    .auth-header h1 { font-size: 1.75rem; margin-bottom: 6px; }
    .auth-header p { color: var(--gray); font-size: 0.95rem; }

    .field { margin-bottom: 18px; }

    label {
      display: block;
      font-family: var(--font-heading);
      font-weight: 600;
      font-size: 0.9rem;
      margin-bottom: 6px;
    }

    .field-error {
      display: block;
      color: #ef4444;
      font-size: 0.8rem;
      margin-top: 4px;
    }

    .submit-btn {
      width: 100%;
      margin-top: 8px;
      padding: 14px;
      font-size: 1rem;
    }

    .submit-btn:disabled {
      opacity: 0.7;
      cursor: not-allowed;
    }

    .auth-footer {
      text-align: center;
      margin-top: 24px;
      font-size: 0.9rem;
      color: var(--gray);
    }

    .auth-footer a {
      color: var(--pink-dark);
      font-weight: 600;
      text-decoration: none;
      margin-left: 4px;
    }

    .auth-footer a:hover { text-decoration: underline; }
  `]
})
export class SignupComponent {
  loading = signal(false);

  form = this.fb.group({
    username: ['', [Validators.required, Validators.minLength(3)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    password2: ['', Validators.required],
  }, { validators: this.passwordMatchValidator });

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private router: Router,
    private toast: ToastService,
  ) {}

  passwordMatchValidator(g: any) {
    const password = g.get('password')?.value;
    const password2 = g.get('password2')?.value;
    return password === password2 ? null : { mismatch: true };
  }

  submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.loading.set(true);
    this.auth.register(this.form.value as any).subscribe({
      next: () => {
        this.toast.show('Welcome to ziinly! ✦', 'success');
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        const errors = err?.error;
        const msg = errors?.username?.[0] ?? errors?.email?.[0] ?? errors?.password?.[0] ?? 'Signup failed.';
        this.toast.show(msg, 'error');
        this.loading.set(false);
      },
    });
  }
}
