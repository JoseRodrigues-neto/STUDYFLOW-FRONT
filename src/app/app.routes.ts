import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { CadastroComponent } from './cadastro/cadastro.component';
import { ForgotPasswordComponent } from './forgot-password/forgot-password.component';
import { AtividadeListComponent } from './component/atividade/atividade-list/atividade-list.component';

export const routes: Routes = [

   { path: '', component: CadastroComponent },
  { path: 'login', component: LoginComponent },
  { path: 'cadastro', component: CadastroComponent },
  { path: 'forgot-password', component: ForgotPasswordComponent },
  { path: 'atividades', component: AtividadeListComponent },
];
