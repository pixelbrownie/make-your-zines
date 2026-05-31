import { Component, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="auth-page stars-bg">
      <div class="auth-card card">
        <div class="auth-header">
          <div class="auth-logo">✦</div>
          <h1>Welcome back!</h1>
          <p>Sign in to your zine collection</p>
        </div>

        <form [formGroup]="form" (ngSubmit)="submit()">
          <div class="field">
            <label>Username</label>
            <input class="input" formControlName="username" placeholder="your_username" autocomplete="username" />
            <span class="field-error" *ngIf="form.get('username')?.invalid && form.get('username')?.touched">
              Username is required
            </span>
          </div>

          <div class="field">
            <label>Password</label>
            <input class="input" type="password" formControlName="password" placeholder="••••••••" autocomplete="current-password" />
            <span class="field-error" *ngIf="form.get('password')?.invalid && form.get('password')?.touched">
              Password is required
            </span>
          </div>

          <button type="submit" class="btn btn-primary submit-btn" [disabled]="loading()">
            {{ loading() ? 'Signing in...' : 'Sign in ♡' }}
          </button>
        </form>

        <div class="auth-footer">
          Don't have an account?
          <a routerLink="/signup">Sign up</a>
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

    .auth-header h1 {
      font-size: 1.75rem;
      margin-bottom: 6px;
    }

    .auth-header p {
      color: var(--gray);
      font-size: 0.95rem;
    }

    .field {
      margin-bottom: 18px;
    }

    label {
      display: block;
      font-family: var(--font-heading);
      font-weight: 600;
      font-size: 0.9rem;
      margin-bottom: 6px;
      color: var(--dark);
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
export class LoginComponent implements OnInit {
  loading = signal(false);

  form = this.fb.group({
    username: ['', Validators.required],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private toast: ToastService,
  ) {}

  ngOnInit() {
    if (this.route.snapshot.queryParamMap.get('reason') === 'session') {
      this.toast.show('Your session expired. Please sign in again.', 'info');
    }
  }

  submit() {
    if (this.form.invalid) return;
    this.loading.set(true);
    this.auth.login(this.form.value as any).subscribe({
      next: () => {
        this.toast.show('Welcome back! ♡', 'success');
        const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl');
        this.router.navigateByUrl(returnUrl && returnUrl.startsWith('/') ? returnUrl : '/dashboard');
      },
      error: (err) => {
        const msg = err?.error?.non_field_errors?.[0] ?? 'Login failed. Please try again.';
        this.toast.show(msg, 'error');
        this.loading.set(false);
      },
    });
  }
}
