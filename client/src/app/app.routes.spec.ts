import { describe, expect, it } from 'vitest';
import { AdminYears } from '../components/admin/admin-years/admin-years';
import { adminAuthGuard } from './guards/parent-route.guard';
import { routes } from './app.routes';

describe('admin years routes', () => {
  it('protects the working-years screen with the admin guard', () => {
    const route = routes.find((candidate) => candidate.path === 'admin/years');

    expect(route?.component).toBe(AdminYears);
    expect(route?.canActivate).toEqual([adminAuthGuard]);
  });

  it('redirects the legacy current-year route to working years', () => {
    const route = routes.find((candidate) => candidate.path === 'admin/current-year');

    expect(route).toMatchObject({
      redirectTo: 'admin/years',
      pathMatch: 'full',
    });
  });
});
