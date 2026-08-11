import { Routes } from '@angular/router';
import { LandingPage } from '../components/landing-page/landing-page';
import { MyRegistrations } from '../components/my-registrations/my-registrations';
import { Registration } from '../components/registration/registration';

export const routes: Routes = [
  { path: '', component: LandingPage },
  { path: 'registration', component: Registration },
  { path: 'my-registrations', component: MyRegistrations },
  { path: '**', redirectTo: '' },
];
