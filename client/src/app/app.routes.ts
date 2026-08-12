import { Routes } from '@angular/router';
import { LandingPage } from '../components/landing-page/landing-page';
import { MyRegistrations } from '../components/my-registrations/my-registrations';
import { ParentLogin } from '../components/parent-login/parent-login';
import { Registration } from '../components/registration/registration';

export const routes: Routes = [
  { path: '', component: LandingPage },
  { path: 'parent-login', component: ParentLogin },
  { path: 'registration', component: Registration },
  { path: 'my-registrations', component: MyRegistrations },
  { path: '**', redirectTo: '' },
];
