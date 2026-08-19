import { Routes } from '@angular/router';
import { AdminDashboard } from '../components/admin/admin-dashboard/admin-dashboard';
import { AdminDocuments } from '../components/admin/admin-documents/admin-documents';
import { AdminFamily } from '../components/admin/admin-family/admin-family';
import { AdminSettings } from '../components/admin/admin-settings/admin-settings';
import { AdminYears } from '../components/admin/admin-years/admin-years';
import { LandingPage } from '../components/landing-page/landing-page';
import { Home } from '../components/home/home';
import { ParentLogin } from '../components/parent-login/parent-login';
import { Registration } from '../components/registration/registration';
import { adminAuthGuard, guestOnlyGuard, parentAuthGuard, parentRegistrationAvailabilityGuard } from './guards/parent-route.guard';

export const routes: Routes = [
  { path: '', component: LandingPage },
  { path: 'login', component: ParentLogin, canActivate: [guestOnlyGuard] },
  { path: 'registration', component: Registration, canActivate: [parentRegistrationAvailabilityGuard] },
  { path: 'home/:registrationId', component: Home, canActivate: [parentAuthGuard] },
  { path: 'home', component: Home, canActivate: [parentAuthGuard] },
  { path: 'admin', component: AdminDashboard, canActivate: [adminAuthGuard] },
  { path: 'admin/years', component: AdminYears, canActivate: [adminAuthGuard] },
  { path: 'admin/current-year', redirectTo: 'admin/years', pathMatch: 'full' },
  { path: 'admin/family', component: AdminFamily, canActivate: [adminAuthGuard] },
  { path: 'admin/settings', component: AdminSettings, canActivate: [adminAuthGuard] },
  { path: 'admin/documents', component: AdminDocuments, canActivate: [adminAuthGuard] },
  { path: '**', redirectTo: '' },
];
