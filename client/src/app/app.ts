import { Component, computed, inject, signal } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs';
import { BrnSonnerImports } from '@spartan-ng/brain/sonner';
import { AuthFacade } from './facades/auth.facade';
import { GlobalStore } from './stores/global.store';
import { AppHeader, AppHeaderVariant } from '../components/shared/app-header/app-header';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, AppHeader, BrnSonnerImports],
  templateUrl: './app.html',
})
export class App {
  private readonly authFacade = inject(AuthFacade);
  private readonly globalStore = inject(GlobalStore);
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
    if (path.startsWith('/home')) return 'יציאה';
    return '';
  });

  protected readonly headerActionRoute = computed(() => {
    const path = this.currentPath();
    if (path === '/') return '/login';
    if (path.startsWith('/home')) return '/';
    return '';
  });

  constructor() {
    void this.restoreSession();

    this.router.events.pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd)).subscribe((event) => {
      this.currentPath.set(event.urlAfterRedirects.split('?')[0].split('#')[0]);
    });
  }

  private async restoreSession(): Promise<void> {
    const session = await this.authFacade.getMe();

    if (session) {
      this.globalStore.setUser(session.user);
      return;
    }

    this.globalStore.clearUser();
  }
}
