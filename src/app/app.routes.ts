import { Routes } from '@angular/router';

// padrão
import { InicioComponent } from './inicio/inicio.component';
import { LoginComponent } from './login/login.component';
import { CadastroComponent } from './cadastro/cadastro.component';
import { ForgotPasswordComponent } from './forgot-password/forgot-password.component';

// navegação interna
import { LayoutComponent } from './components/layout/layout.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { AtividadeListComponent } from './component/atividade/atividade-list/atividade-list.component';
import { SegurancaComponent } from './usuario/seguranca/seguranca.component';
import { AnotacaoListComponent } from './component/anotacao/anotacao-list/anotacao-list.component';

 
export const routes: Routes = [

// ROTAS PÚBLICAS
  { path: 'inicio', component: InicioComponent },
  { path: 'login', component: LoginComponent },
  { path: 'cadastro', component: CadastroComponent },
  { path: 'forgot-password', component: ForgotPasswordComponent },
   { path: 'dashboard', component: DashboardComponent },
   { path: 'inicio', component: InicioComponent },
   
   {   path: 'perfil', loadComponent: () => import('./usuario/perfil/perfil.component').then(m => m.PerfilComponent) },

   { path: 'seguranca', component: SegurancaComponent },
   // ROTAS DA APLICAÇÃO INTERNA
  {
    path: 'app',
    component: LayoutComponent,
    children: [
      {
        path: 'dashboard', 
        component: DashboardComponent 
      },
      { 
        path: 'atividades',
        component: AtividadeListComponent 
      },
      {
        path: 'anotacoes',
        component: AnotacaoListComponent
      },
      { 
        path: '', 
        redirectTo: 'atividades', 
        pathMatch: 'full' 
      }
    ]
  },

  // REDIRECIONAMENTO PADRÃO
  { 
    path: '', 
    redirectTo: '/inicio', 
    pathMatch: 'full' 
  },

  // Se a URL não corresponder a nenhuma rota acima, redireciona para a página de início.
  { 
    path: '**', 
    redirectTo: '/inicio' 
  }
];
