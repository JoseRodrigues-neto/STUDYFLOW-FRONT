import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { UsuarioService } from '../services/usuario.service';
import { AuthService } from '../services/auth.service';
import { Perfil } from '../models/perfil.enum';
import { UsuarioRequest } from '../models/usuario.model';
import { switchMap } from 'rxjs';

@Component({
  selector: 'app-profile-selection',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './profile-selection.component.html',
  styleUrls: ['./profile-selection.component.css']
})
export class ProfileSelectionComponent {

  constructor(
    private usuarioService: UsuarioService,
    private authService: AuthService,
    private router: Router
  ) {}

  selecionarPerfil(perfil: string) {
    const perfilEnum = perfil === 'ALUNO' ? Perfil.ALUNO : Perfil.PROFESSOR;

    this.authService.authState$.pipe(
      switchMap(user => {
        if (!user) {
          throw new Error('Usuário não autenticado.');
        }
        // Acessamos o usuário atual do AuthService para pegar os dados já existentes
        return this.usuarioService.verificarLoginGuard();
      }),
      switchMap(usuario => {
        // Criamos o request com os dados do usuário e o novo perfil
        const request: UsuarioRequest = {
          nome: usuario.nome,
          email: usuario.email,
          dataNascimento: usuario.dataNascimento,
          perfil: perfilEnum,
          avatarUrl: usuario.avatarUrl || ''
        };
        return this.usuarioService.atualizarPerfil(usuario.uid, request);
      })
    ).subscribe({
      next: () => {
        // Força a atualização do token para pegar o novo custom claim de perfil
        this.authService.forceTokenRefresh().subscribe({
          next: () => {
            console.log('Perfil atualizado e token atualizado com sucesso!');
            this.router.navigate(['/app/dashboard']);
          },
          error: (err) => {
            console.error('Erro ao forçar a atualização do token', err);
            // Mesmo com erro na atualização do token, o perfil foi salvo.
            // Navega para o dashboard, mas pode haver um delay na permissão.
            this.router.navigate(['/app/dashboard']);
          }
        });
      },
      error: (err) => {
        console.error('Erro ao atualizar o perfil', err);
        // Adicionar tratamento de erro para o usuário aqui
      }
    });
  }
}