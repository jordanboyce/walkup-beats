import { Routes } from '@angular/router';
import { HomeComponent } from './views/home/home.component';
import { TeamDetailsComponent } from './views/team-details/team-details.component';
import { LandingComponent } from './views/landing/landing.component';
import { AuthGuard } from './guards/auth.guard';
import { NotFoundComponent } from './views/not-found/not-found.component';
import { ForgotComponent } from './views/forgot/forgot.component';

export const routes: Routes = [
    { path: '', component: LandingComponent },
    { path: 'forgot', component: ForgotComponent },
    { path: 'home', component: HomeComponent, canActivate: [AuthGuard] },
    { path: 'details/:id', component: TeamDetailsComponent, canActivate: [AuthGuard] },
    { path: '**', component: NotFoundComponent }
];
