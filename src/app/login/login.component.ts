import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { finalize } from 'rxjs/operators';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { RouterLink } from '@angular/router'; 
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    RouterLink
  ],
  templateUrl: './login.component.html',  
  styleUrl: './login.component.css'
})
export class LoginComponent {
  email = '';
  password = '';
  errorMessage: string | null = null;
  successMessage: string | null = null;
  loading = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) { }

  // Login com Email/Senha (Continua igual, pois usa Observable)
  login() {
    this.errorMessage = null;
    this.successMessage = null;
    this.loading = true;

    this.authService.login(this.email, this.password).pipe(
      finalize(() => this.loading = false)
    ).subscribe({
      next: () => {
        this.successMessage = "Login realizado com sucesso!";
        localStorage.setItem('sessionLoginTime', Date.now().toString());
        this.router.navigate(['/app']);
      },
      error: (error) => {
        this.errorMessage = this.getFirebaseErrorMessage(error.code);
      }
    });
  }
  
  // Login com Google (ALTERADO PARA REDIRECT)
  async loginComGoogle() {
    this.errorMessage = null;
    this.successMessage = null;
    this.loading = true;   

    try {
      // Aqui usamos await porque agora retorna uma Promise<void>
      // O navegador vai sair desta página e ir para o Google
      await this.authService.loginComGoogle();
      
      // Se chegar aqui, o redirecionamento começou.
      // Não precisamos fazer nada, nem navegar, pois a página vai recarregar.
    } catch (error: any) {
      // Só entramos aqui se falhar AO TENTAR abrir o Google (ex: erro de config)
      console.error("Erro ao iniciar login com Google:", error);
      this.loading = false;
      this.errorMessage = "Não foi possível conectar ao Google. Tente novamente.";
    }
  }

  private getFirebaseErrorMessage(errorCode: string): string {
    switch (errorCode) {
      case 'auth/user-not-found':
        return 'Nenhum usuário encontrado com este e-mail.';
      case 'auth/wrong-password':
        return 'Senha incorreta.';
      case 'auth/invalid-email':
      case 'auth/invalid-credential':
        return 'Email ou senha inválidos.';
      default:
        return 'Ocorreu um erro. Por favor, tente novamente.';
    }
  }
}