import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { finalize } from 'rxjs/operators';
// Remova NgForm se não for mais usado em nenhum outro lugar
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { AuthService, RegisterData } from '../services/auth.service';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-cadastro',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    MatProgressSpinnerModule
  ],
  templateUrl: './cadastro.component.html',
  styleUrl: './cadastro.component.css'
})
export class CadastroComponent {
  email = '';
  password = '';
  confirmPassword = '';
  name = '';
  dataNascimento: string = '';
  perfil: string = ''; // Deixei vazio para forçar o usuário a selecionar
  errorMessage: string | null = null;
  successMessage: string | null = null;
  loading = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

 
  cadastrar(form: NgForm) {
  
    if (this.password !== this.confirmPassword) {
      this.errorMessage = 'As senhas não coincidem. Verifique novamente.';
      return;
    }
    
    this.errorMessage = null;
    this.successMessage = null;
    this.loading = true;

    const userData: RegisterData = {
        email: this.email,
        password: this.password,
        name: this.name,
        dataNascimento: this.dataNascimento,
        perfil: this.perfil
    };

    this.authService.register(userData).pipe(
      finalize(() => this.loading = false)
    ).subscribe({
      next: () => {
        this.successMessage = 'Cadastro realizado com sucesso!';
        setTimeout(() => this.router.navigate(['/login']), 2000);
      },
      error: (error) => {
        console.error('Erro no processo de cadastro:', error);

        if (error.code) {
        this.errorMessage = this.getFirebaseErrorMessage(error.code);
        } else {
          // Fallback para a mensagem do seu backend
          this.errorMessage = error.error?.message || 'Ocorreu um erro. Verifique os dados e tente novamente.';
        }
      }
    });
  }
  private getFirebaseErrorMessage(errorCode: string): string {
    switch (errorCode) {
      case 'auth/email-already-in-use':
        return 'Este e-mail já está em uso. Por favor, tente outro.';
      case 'auth/invalid-email':
        return 'O formato do e-mail é inválido.';
      case 'auth/weak-password':
        return 'A senha é muito fraca. Tente uma com pelo menos 6 caracteres.';
      default:
        return 'Ocorreu um erro. Verifique os dados e tente novamente.';
    }
  }

  
}