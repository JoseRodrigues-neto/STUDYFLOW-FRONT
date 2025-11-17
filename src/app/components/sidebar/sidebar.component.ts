import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router'; // Imports para os links
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog'; // Para o "Sair"
import { filter, switchMap } from 'rxjs';
import { MatTooltipModule } from '@angular/material/tooltip';
// Nossos Serviços
import { AuthService } from '../../services/auth.service';
import { UsuarioService } from '../../services/usuario.service';
import { Usuario } from '../../models/usuario.model';
import { ConfirmDialogComponent } from '../../dialogs/confimar/confirm-dialog.component'; // (Ajuste o caminho)

@Component({
  selector: 'app-sidebar',
  standalone: true, // Garanta que seu componente é standalone
  imports: [
    CommonModule,
    RouterLink,        // <-- Adicionado
    RouterLinkActive,  // <-- Adicionado
    MatIconModule,
    MatDialogModule,
    MatTooltipModule
 
  ],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css'] // Vamos criar este CSS
})
export class SidebarComponent implements OnInit {

  // --- NOVO: Recebe o estado do "pai" ---
  @Input() isCollapsed = false;
  // --- NOVO: Emissor de evento para o "pai" ---
 // @Output() toggleRequest = new EventEmitter<void>();

  usuario: Usuario | null = null;

  constructor(
    private router: Router,
    private authService: AuthService,
    private usuarioService: UsuarioService,
    private dialog: MatDialog
  ) { }

  ngOnInit(): void {
    // Carrega os dados do usuário para mostrar a foto de perfil
    this.usuarioService.getMeuPerfil().subscribe(dados => {
      this.usuario = dados;
    });
  }
  // onToggleClick(): void {
  //   this.toggleRequest.emit();
  // }

  // Lógica de Sair (movida para cá)
  sair(): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '450px',
      panelClass: 'dialog-custom-panel',
      data: {
        title: 'Deseja sair?',
        message: 'Tem certeza de que deseja se desconectar?',
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
}