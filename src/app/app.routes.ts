import { Routes } from '@angular/router';
import { InicioComponent } from './inicio/inicio.component';
import { LoginComponent } from './login/login.component';
import { CadastroComponent } from './cadastro/cadastro.component';
import { ForgotPasswordComponent } from './forgot-password/forgot-password.component';
import { PerfilComponent } from './usuario/perfil/perfil.component';
import { SegurancaComponent } from './usuario/seguranca/seguranca.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { AtividadeListComponent } from './component/atividade/atividade-list/atividade-list.component';
import { loginGuard } from './guards/login.guard';
import { authGuard } from './guards/auth.guard';
import { RoadmapListComponent } from './component/roadmap/roadmap-list/roadmap-list.component';
import { RoadmapDetailComponent } from './component/roadmap/roadmap-detail/roadmap-detail.component';
import { RoadmapFormComponent } from './component/roadmap/roadmap-form/roadmap-form.component';
import { AtividadeFormComponent } from './component/atividade/atividade-form/atividade-form.component';

export const routes: Routes = [
  {
    path: 'inicio',
    component: InicioComponent
  },
  {
    path: 'login',
    component: LoginComponent,
   
  },
  {
    path: 'cadastro',
    component: CadastroComponent,
 
  },
  {
    path: 'forgot-password',
    component: ForgotPasswordComponent,
    canActivate: [loginGuard]
  },
  {
    path: 'selecionar-perfil',
    loadComponent: () => import('./profile-selection/profile-selection.component').then(m => m.ProfileSelectionComponent),
    canActivate: [authGuard]
  },

  {
    path: 'app',
    loadComponent: () => import('./components/layout/layout.component').then(m => m.LayoutComponent),
    canActivate: [authGuard], 
    children: [
      {
        path: 'dashboard',
        component: DashboardComponent
      },
      {
        path: 'perfil',
        component: PerfilComponent
      },
      {
        path: 'atividades',
        component: AtividadeListComponent
      },
      {
        path: 'atividades-diarias',
        loadComponent: () => import('./component/atividade/daily-activities-list/daily-activities-list.component').then(m => m.DailyActivitiesListComponent)
      },
      {
        path: 'atividades-concluidas',
        loadComponent: () => import('./component/atividade/completed-activities-list/completed-activities-list.component').then(m => m.CompletedActivitiesListComponent)
      },
      {
        path: 'seguranca',
        component: SegurancaComponent
      },
      {
        path: 'roadmaps',
        component: RoadmapListComponent
      },
      { 
        path: 'roadmap/:id',
        component: RoadmapDetailComponent 
      },
      {
        path: 'roadmap-form',
        component: RoadmapFormComponent
      },
      {
        path: 'roadmap-form/:id',
        component: RoadmapFormComponent
      },
      {
        path: 'atividade-form',
        component: AtividadeFormComponent
      },
      {
        path: 'atividade-form/:id',
        component: AtividadeFormComponent
      },
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      }
    ]
  },


  {
    path: '',
    redirectTo: '/inicio', 
    pathMatch: 'full'
  }
];
