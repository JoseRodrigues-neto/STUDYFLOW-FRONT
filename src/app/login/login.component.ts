import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { finalize } from 'rxjs/operators';

 
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule
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

  login() {
    this.errorMessage = null;
    this.successMessage = null;
    this.loading = true;

    this.authService.login(this.email, this.password).pipe(
      finalize(() => this.loading = false)
    ).subscribe({
      next: () => {
        this.successMessage = "Login realizado com sucesso!";
      },
      error: (error) => {
        this.errorMessage = this.getFirebaseErrorMessage(error.code);
      }
    });
  }
  loginComGoogle() {
    this.errorMessage = null;
    this.successMessage = null;
    this.loading = true;  

    this.authService.loginComGoogle().pipe(
      finalize(() => this.loading = false)
    ).subscribe({
      next: () => {
        this.successMessage = "Login com Google realizado com sucesso!";
      },
      error: (error) => {
        console.error("Erro no login com Google:", error);
        this.errorMessage = "Ocorreu um erro ao tentar fazer login com o Google.";
      }
    });
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