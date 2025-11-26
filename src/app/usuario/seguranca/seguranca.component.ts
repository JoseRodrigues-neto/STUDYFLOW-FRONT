import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms'; // Para o input de email
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { filter, switchMap } from 'rxjs';

// Serviços
import { AuthService } from '../../services/auth.service';
import { ConfirmDialogComponent } from '../../dialogs/confimar/confirm-dialog.component'; // (Ajuste o caminho se necessário)
import { DeleteAccountDialogComponent } from '../../dialogs/delete/delete-account-dialog.component';

import { UsuarioService } from '../../services/usuario.service';
import { Usuario } from '../../models/usuario.model';

@Component({
  selector: 'app-seguranca',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule, // Importa o FormsModule
    MatIconModule,
    MatDialogModule
  ],
  templateUrl: './seguranca.component.html',
  // Vamos REUTILIZAR o mesmo CSS da página de perfil!
  styleUrls: ['./seguranca.component.css'] 
})
export class SegurancaComponent implements OnInit {

  usuario: Usuario | null = null;
  // Propriedades para o formulário
  email: string = '';
  loading = false;
  errorMessage: string | null = null;
  successMessage: string | null = null;

  constructor(
    private router: Router,
    private authService: AuthService,
    private dialog: MatDialog,
    private usuarioService: UsuarioService
  ) { }

  ngOnInit(): void {
    // Busca o email do usuário logado no Firebase
    this.authService.authState$.subscribe(user => {
      if (user && user.email) {
        this.email = user.email;
      }
    });
    this.usuarioService.getMeuPerfil().subscribe(dadosDoUsuario => {
      this.usuario = dadosDoUsuario;
    });
  }

  /**
   * Envia o email de redefinição de senha usando o AuthService.
   */
  enviarEmailRedefinicao(): void {
    if (!this.email) {
      this.errorMessage = "Email não encontrado.";
      return;
    }

    this.loading = true;
    this.errorMessage = null;
    this.successMessage = null;

    this.authService.redefinirSenha(this.email).subscribe({
      next: () => {
        this.loading = false;
        this.successMessage = `Email de redefinição enviado para ${this.email}. Verifique sua caixa de entrada.`;
      },
      error: (err) => {
        this.loading = false;
        console.error("Erro ao redefinir senha:", err);
        this.errorMessage = "Falha ao enviar o email. Tente novamente.";
      }
    });
  }

  // --- Funções de Navegação (Reutilizadas do Perfil) ---

  navigateTo(route: string): void {
    this.router.navigate([`/${route}`]);
  }

  sair(): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '450px',
      panelClass: 'dialog-custom-panel', // (A classe do tema escuro)
      data: {
        title: 'Deseja sair?',
        message: 'Tem certeza de que deseja se desconectar?',
        secondaryMessage: 'Se preferir, você pode ativar o <a href="#">bloqueio do app</a>.',
        confirmText: 'Desconectar',
        cancelText: 'Cancelar'
      }
    });

    dialogRef.afterClosed().pipe(
      filter(result => result === true),
      switchMap(() => this.authService.logout())
    ).subscribe({
      next: () => {
        this.router.navigate(['/login']);
      },
      error: (err) => {
        console.error('Erro ao fazer logout', err);
        this.router.navigate(['/login']);
      }
    });
  }

  /**
   * Abre o pop-up que pede a senha para confirmar a exclusão.
   */
  abrirDialogExclusao(): void {
    const dialogRef = this.dialog.open(DeleteAccountDialogComponent, {
      width: '500px',
      panelClass: 'dialog-custom-panel', // Usa nosso tema escuro
      data: { email: this.email } // Passa o email para o diálogo
    });

    dialogRef.afterClosed().pipe(
      // 1. Filtra: só continua se o usuário retornou uma senha (não clicou em "Cancelar")
      filter(password => password), 
      
      // 2. Tenta re-autenticar com a senha
      switchMap(password => {
        this.loading = true; // Ativa o loading da página
        this.errorMessage = null;
        this.successMessage = null;
        return this.authService.reauthenticate(password);
      }),
      
      // 3. Se a re-autenticação deu certo, deleta a conta
      switchMap(() => this.authService.deleteUserAccount())
    ).subscribe({
      next: () => {
        // 4. Sucesso! Desloga e vai para a tela inicial.
        this.loading = false;
        this.router.navigate(['/inicio']);
      },
      error: (err) => {
        // 5. Falha
        this.loading = false;
        // Pega o código de erro específico do Firebase
        if (err.code === 'auth/wrong-password') {
          this.errorMessage = 'Senha incorreta. A exclusão foi cancelada.';
        } else {
          this.errorMessage = 'Erro ao tentar excluir a conta. Tente novamente.';
        }
        console.error(err);
      }
    });
  }
}