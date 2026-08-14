import { Component, computed, inject, signal } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs';
import { AppHeader, AppHeaderVariant } from '../components/shared/app-header/app-header';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, AppHeader],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  private readonly router = inject(Router);
  protected readonly currentPath = signal(this.router.url.split('?')[0].split('#')[0]);

  protected readonly headerVariant = computed<AppHeaderVariant>(() => {
    const path = this.currentPath();
    if (path.startsWith('/admin')) return 'admin';
    if (path === '/') return 'public';
    return 'back';
  });

  protected readonly headerActionLabel = computed(() => {
    const path = this.currentPath();
    if (path === '/') return 'התחברות';
    if (path === '/my-registrations') return 'יציאה';
    return 'חזרה';
  });

  protected readonly headerActionRoute = computed(() => {
    const path = this.currentPath();
    if (path === '/') return '/parent-login';
    if (path === '/my-registrations') return '/';
    return '/';
  });

  constructor() {
    this.router.events.pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd)).subscribe((event) => {
      this.currentPath.set(event.urlAfterRedirects.split('?')[0].split('#')[0]);
    });
  }
}
