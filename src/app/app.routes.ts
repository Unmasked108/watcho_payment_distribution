import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { LayoutComponent } from './layout/layout.component';
import { TeamsComponent } from './teams/teams.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { UsersComponent } from './users/users.component';
import { TeamManagerComponent } from './team-manager/team-manager.component';
import { HistoryComponent } from './history/history.component';

export const routes: Routes = [
    { path: 'login', component: LoginComponent },  // Login page
    { path: '', redirectTo: 'login', pathMatch: 'full' },  // Default to login
    { path: 'users', component: UsersComponent },
    {
        path: 'layout',
        component: LayoutComponent,
        children: [
            { path: '', redirectTo: 'dashboard', pathMatch: 'full' }, // Default to dashboard within layout
            { path: 'dashboard', component: DashboardComponent },
            { path: 'teams', component: TeamsComponent },
            {path:  'history',component : HistoryComponent}
           
        ],
    },
    { path: 'TeamsManager', component: TeamManagerComponent}
];
