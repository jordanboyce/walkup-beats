import { Routes } from '@angular/router';
import { HomeComponent } from './views/home/home.component';
import { TeamDetailsComponent } from './views/team-details/team-details.component';
import { LandingComponent } from './views/landing/landing.component';
import { AuthGuard } from './guards/auth.guard';
import { NotFoundComponent } from './views/not-found/not-found.component';
import { ForgotComponent } from './views/forgot/forgot.component';
import { AlreadyLoggedInGuard } from './guards/already-logged-in.guard';

export const routes: Routes = [
    { path: '', component: LandingComponent, canActivate: [AlreadyLoggedInGuard] },
    { path: 'forgot', component: ForgotComponent, canActivate: [AlreadyLoggedInGuard] },
    { path: 'home', component: HomeComponent, canActivate: [AuthGuard] },
    { path: ':teamName/:id', component: TeamDetailsComponent },
    { path: '**', component: NotFoundComponent }
];
