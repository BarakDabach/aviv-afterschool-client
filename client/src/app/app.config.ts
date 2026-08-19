import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter, withInMemoryScrolling } from '@angular/router';
import { NotificationService } from './services/notification.service';
import { AuthFacade } from './facades/auth.facade';
import { MockAuthFacade } from './facades/mock-auth.facade';
import { DataService } from './services/data.service';
import { MockDataService } from './services/mock-data.service';
import { SonnerNotificationService } from './services/sonner-notification.service';
import { provideSpartanHlm } from '@spartan-ng/helm/utils';

import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(
      routes,
      withInMemoryScrolling({
        scrollPositionRestoration: 'top',
        anchorScrolling: 'enabled',
      }),
    ),
    provideSpartanHlm(),
    {
      provide: AuthFacade,
      useClass: MockAuthFacade,
    },
    {
      provide: NotificationService,
      useClass: SonnerNotificationService,
    },
    {
      provide: DataService,
      useClass: MockDataService,
    },
  ],
};
