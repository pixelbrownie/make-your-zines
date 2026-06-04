import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { debounceTime, distinctUntilChanged, Subject, switchMap, of, catchError } from 'rxjs';
import { UserService } from '../../core/services/user.service';
import { AuthService, User } from '../../core/services/auth.service';

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="search-page stars-bg">
      <div class="search-inner">
        <div class="search-header fade-up">
          <h1>find creators ✦</h1>
          <p>Search by username to follow and explore their zines</p>
        </div>

        <div class="search-bar card">
          <span class="search-icon">⌕</span>
          <input
            class="search-input"
            [(ngModel)]="query"
            (ngModelChange)="onQueryChange($event)"
            placeholder="Search usernames..."
            autocomplete="off"
          />
        </div>

        <div class="results" *ngIf="query.length > 0">
          <p class="results-hint" *ngIf="!loading() && results().length === 0">No users found for "{{ query }}"</p>

          <div class="user-row card" *ngFor="let user of results()">
            <a [routerLink]="['/user', user.username]" class="user-link">
              <div class="user-avatar">
                <img *ngIf="user.avatar" [src]="user.avatar" alt="" />
                <span *ngIf="!user.avatar">{{ user.username[0].toUpperCase() }}</span>
              </div>
              <div class="user-meta">
                <span class="user-name">&#64;{{ user.username }}</span>
                <span class="user-stats">{{ user.followers_count ?? 0 }} followers · {{ user.zine_count ?? 0 }} zines</span>
                <p class="user-bio" *ngIf="user.bio">{{ user.bio }}</p>
              </div>
            </a>
            <button
              *ngIf="auth.isLoggedIn() && user.username !== auth.currentUser()?.username"
              class="btn"
              [class.btn-primary]="!user.is_following"
              [class.btn-secondary]="user.is_following"
              (click)="toggleFollow(user, $event)"
            >
              {{ user.is_following ? 'Following' : 'Follow' }}
            </button>
          </div>
        </div>

        <div class="search-empty card" *ngIf="query.length === 0">
          <span class="empty-icon">🔍</span>
          <p>Start typing a username above</p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .search-page { min-height: 100vh; padding: 100px 24px 60px; }
    .search-inner { max-width: 640px; margin: 0 auto; }
    .search-header { text-align: center; margin-bottom: 32px; }
    .search-header h1 { font-size: clamp(1.75rem, 4vw, 2.5rem); margin-bottom: 8px; }
    .search-header p { color: var(--gray); }

    .search-bar {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 14px 20px;
      margin-bottom: 24px;
    }

    .search-icon { font-size: 1.25rem; color: var(--gray); }
    .search-input {
      flex: 1;
      border: none;
      outline: none;
      font-size: 1rem;
      font-family: var(--font-body);
      background: transparent;
    }

    .results-hint { color: var(--gray); text-align: center; margin-bottom: 16px; }

    .user-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
      padding: 16px 20px;
      margin-bottom: 12px;
    }

    .user-link {
      display: flex;
      align-items: center;
      gap: 14px;
      text-decoration: none;
      color: inherit;
      flex: 1;
      min-width: 0;
    }

    .user-avatar {
      width: 52px;
      height: 52px;
      border-radius: 50%;
      background: var(--pink);
      overflow: hidden;
      flex-shrink: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: var(--font-heading);
      font-weight: 700;
      border: 2px solid var(--pink-dark);
    }

    .user-avatar img { width: 100%; height: 100%; object-fit: cover; }
    .user-name { font-family: var(--font-heading); font-weight: 700; display: block; }
    .user-stats { font-size: 0.8rem; color: var(--gray); }
    .user-bio {
      font-size: 0.85rem;
      color: var(--gray);
      margin-top: 4px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .search-empty {
      text-align: center;
      padding: 48px;
      color: var(--gray);
    }

    .empty-icon { font-size: 2rem; display: block; margin-bottom: 12px; }
  `],
})
export class SearchComponent {
  query = '';
  results = signal<User[]>([]);
  loading = signal(false);
  private search$ = new Subject<string>();

  constructor(
    private userService: UserService,
    public auth: AuthService,
  ) {
    this.search$.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap((q) => {
        if (!q.trim()) {
          this.loading.set(false);
          this.results.set([]);
          return of(null);
        }
        this.loading.set(true);
        return this.userService.searchUsers(q.trim()).pipe(
          catchError(() => {
            this.results.set([]);
            this.loading.set(false);
            return of(null);
          })
        );
      })
    ).subscribe((users) => {
      if (users !== null) {
        this.results.set(users);
        this.loading.set(false);
      }
    });
  }

  onQueryChange(q: string) {
    this.search$.next(q);
  }

  toggleFollow(user: User, event: Event) {
    event.preventDefault();
    event.stopPropagation();
    const req = user.is_following
      ? this.userService.unfollow(user.username)
      : this.userService.follow(user.username);

    req.subscribe({
      next: (res) => {
        this.results.update((list) =>
          list.map((u) =>
            u.username === user.username
              ? { ...u, is_following: res.following, followers_count: res.followers_count }
              : u,
          ),
        );
      },
    });
  }
}
