import { Routes } from '@angular/router';
import { InicioComponent } from './inicio/inicio.component';
import { LoginComponent } from './login/login.component';
import { CadastroComponent } from './cadastro/cadastro.component';
import { ForgotPasswordComponent } from './forgot-password/forgot-password.component';
import { PerfilComponent } from './usuario/perfil/perfil.component';
import { SegurancaComponent } from './usuario/seguranca/seguranca.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { AtividadeListComponent } from './component/atividade/atividade-list/atividade-list.component';
import { authGuard } from './guards/auth.guard';
import { loginGuard } from './guards/login.guard';
import { NotFoundComponent } from './error/nao-encontrado/not-found.component';
 export const routes: Routes = [

  {
    path: 'inicio',
    component: InicioComponent
  },
  {
    path: 'login',
    component: LoginComponent,
    canActivate: [loginGuard]
  },
  {
    path: 'cadastro',
    component: CadastroComponent,
    canActivate: [loginGuard] 
  },
  {
    path: 'forgot-password',
    component: ForgotPasswordComponent,
    canActivate: [loginGuard]
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
        path: 'seguranca',
        component: SegurancaComponent
      },
      {
        path: '',
        redirectTo: 'atividades',
        pathMatch: 'full'
      }
    ]
  },


  {
    path: '',
    redirectTo: '/inicio', 
    pathMatch: 'full'
  },
  {
    path: '**',
   component: NotFoundComponent
  }
];
