import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService, RegisterData } from '../services/auth.service';
import { finalize } from 'rxjs/operators';

 
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-cadastro',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './cadastro.component.html',  
  styleUrl: './cadastro.component.css'
})
export class CadastroComponent {
  email = '';
  password = '';
  name = '';
  dataNascimento: string = '';
  perfil: string = 'ALUNO';
  errorMessage: string | null = null;
  successMessage: string | null = null;
  loading = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  cadastrar() {
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
        this.errorMessage = 'Ocorreu um erro. Verifique os dados e tente novamente.';
      }
    });
  }
} 