import { Component } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { finalize } from 'rxjs/operators';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule
  ],
  templateUrl: './forgot-password.component.html',
  styleUrl: './forgot-password.component.css'
})
export class ForgotPasswordComponent {
  email: string = '';
  errorMessage: string | null = null;
  successMessage: string | null = null;
  loading = false;

  constructor(private authService: AuthService) {}

  solicitarRedefinicao() {
    this.errorMessage = null;
    this.successMessage = null;
    this.loading = true;

    this.authService.redefinirSenha(this.email).pipe(
      finalize(() => this.loading = false)
    ).subscribe({
      next: () => {
        this.successMessage = 'Um link para redefinição de senha foi enviado para o seu e-mail, caso ele esteja cadastrado.';
      },
      error: (error) => {
        this.errorMessage = 'Ocorreu um erro ao tentar redefinir a senha. Verifique o e-mail e tente novamente.';
        console.error('Erro ao solicitar redefinição:', error);
      }
    });
  }
}