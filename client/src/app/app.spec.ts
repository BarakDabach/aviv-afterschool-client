import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AuthFacade } from './facades/auth.facade';
import { NotificationService } from './services/notification.service';
import { GlobalStore } from './stores/global.store';
import { App } from './app';

@Component({
  template: '',
})
class EmptyRouteComponent {}

describe('App', () => {
  let fixture: ComponentFixture<App>;
  let authFacade: {
    getMe: ReturnType<typeof vi.fn>;
  };
  let globalStore: InstanceType<typeof GlobalStore>;

  beforeEach(async () => {
    localStorage.clear();

    authFacade = {
      getMe: vi.fn().mockResolvedValue({
        user: {
          id: 'parent-1',
          role: 'parent',
          fullName: 'דנה לוי',
          email: 'dana@example.com',
          phoneNumber: '0501234567',
        },
        expiresAtIso: new Date(Date.now() + 60_000).toISOString(),
      }),
    };

    await TestBed.configureTestingModule({
      imports: [App],
      providers: [
        {
          provide: AuthFacade,
          useValue: authFacade,
        },
        {
          provide: NotificationService,
          useValue: {
            success: vi.fn(),
            info: vi.fn(),
            warning: vi.fn(),
            error: vi.fn(),
          },
        },
        provideRouter([
          { path: '', component: EmptyRouteComponent },
          { path: 'login', component: EmptyRouteComponent },
          { path: 'home', component: EmptyRouteComponent },
        ]),
      ],
    }).compileComponents();

    globalStore = TestBed.inject(GlobalStore);
    globalStore.clearUser();
    fixture = TestBed.createComponent(App);
  });

  it('restores the current auth session on startup', async () => {
    fixture.detectChanges();
    await fixture.whenStable();

    expect(authFacade.getMe).toHaveBeenCalledTimes(1);
    expect(globalStore.loggedIn()).toBe(true);
    expect(globalStore.email()).toBe('dana@example.com');
  });
});
