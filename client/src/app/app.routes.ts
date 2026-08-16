import { Routes } from '@angular/router';
import { AdminDashboard } from '../components/admin/admin-dashboard/admin-dashboard';
import { AdminDocuments } from '../components/admin/admin-documents/admin-documents';
import { AdminFamily } from '../components/admin/admin-family/admin-family';
import { AdminSettings } from '../components/admin/admin-settings/admin-settings';
import { LandingPage } from '../components/landing-page/landing-page';
import { MyRegistrations } from '../components/my-registrations/my-registrations';
import { ParentLogin } from '../components/parent-login/parent-login';
import { Registration } from '../components/registration/registration';

export const routes: Routes = [
  { path: '', component: LandingPage },
  { path: 'login', component: ParentLogin },
  { path: 'registration', component: Registration },
  { path: 'my-registrations', component: MyRegistrations },
  { path: 'admin', component: AdminDashboard },
  { path: 'admin/family', component: AdminFamily },
  { path: 'admin/settings', component: AdminSettings },
  { path: 'admin/documents', component: AdminDocuments },
  { path: '**', redirectTo: '' },
];
