import { Routes } from '@angular/router';
import { InicioComponent } from './inicio/inicio.component';
import { LoginComponent } from './login/login.component';
import { CadastroComponent } from './cadastro/cadastro.component';
import { ForgotPasswordComponent } from './forgot-password/forgot-password.component';
import { PerfilComponent } from './usuario/perfil/perfil.component';
import { SegurancaComponent } from './usuario/seguranca/seguranca.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { AtividadeListComponent } from './component/atividade/atividade-list/atividade-list.component';

export const routes: Routes = [
  // Rotas públicas com lazy loading
  {
    path: 'inicio',
    component: InicioComponent
  },
  {
    path: 'login',
    component: LoginComponent
  },
  {
    path: 'cadastro',
    component: CadastroComponent
  },
  {
    path: 'forgot-password',
    component: ForgotPasswordComponent
  },
   
  {
    path: 'seguranca',
    component: SegurancaComponent
  },

  // Rotas da aplicação interna (dentro do Layout)
  {
    path: 'app',
    loadComponent: () => import('./components/layout/layout.component').then(m => m.LayoutComponent),
    children: [
      {
        path: 'dashboard',
        component: DashboardComponent
      },{
    path: 'perfil',
    component: PerfilComponent
  },
      {
        path: 'atividades',
        component: AtividadeListComponent
      },
      {
        path: '',
        redirectTo: 'atividades',
        pathMatch: 'full'
      }
    ]
  },

  // Redirecionamento padrão para a página de início
  {
    path: '',
    redirectTo: '/inicio',
    pathMatch: 'full'
  },

  // Rota curinga para páginas não encontradas
  {
    path: '**',
    redirectTo: '/inicio'
  }
];
