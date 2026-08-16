import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { AuthFacade } from './facades/auth.facade';
import { MockAuthFacade } from './facades/mock-auth.facade';
import { DataService } from './services/data.service';
import { MockDataService } from './services/mock-data.service';

import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    {
      provide: AuthFacade,
      useClass: MockAuthFacade,
    },
    {
      provide: DataService,
      useClass: MockDataService,
    },
  ],
};
