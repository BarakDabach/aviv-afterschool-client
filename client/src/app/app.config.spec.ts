import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import { appConfig } from './app.config';
import { AuthFacade } from './facades/auth.facade';
import { MockAuthFacade } from './facades/mock-auth.facade';
import { DataService } from './services/data.service';
import { MockDataService } from './services/mock-data.service';

describe('appConfig', () => {
  it('provides swappable mock implementations for backend-facing contracts', () => {
    TestBed.configureTestingModule({
      providers: appConfig.providers,
    });

    expect(TestBed.inject(AuthFacade)).toBeInstanceOf(MockAuthFacade);
    expect(TestBed.inject(DataService)).toBeInstanceOf(MockDataService);
  });
});
