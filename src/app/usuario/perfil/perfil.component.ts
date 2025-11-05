import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

 
import { MatIconModule } from '@angular/material/icon';

 
import { AuthService } from '../../services/auth.service';
import { UsuarioService } from '../../services/usuario.service';
import { Usuario, UsuarioRequest } from '../../models/usuario.model';
import { FormsModule } from '@angular/forms';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { filter, switchMap } from 'rxjs';
import { ConfirmDialogComponent } from '../../dialogs/confirm-dialog.component';

@Component({
  selector: 'app-perfil-editar', 
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    FormsModule,
    MatDialogModule
  ],
  templateUrl: './perfil.component.html',
  styleUrls: ['./perfil.component.css']  
})
export class PerfilComponent implements OnInit {

  loading = true;
  loadingSave = false;
  errorMessage: string | null = null;
  usuario: Usuario | null = null;

   isEditing = false;
  formData: { nome: string, email: string } = { nome: '', email: '' };

  tempoLogadoFormatado: string = 'Calculando...';
  private timerInterval: any = null;

  constructor(
    private router: Router,
    private authService: AuthService,
    private usuarioService: UsuarioService,
    private dialog: MatDialog
  ) { }

  ngOnInit(): void {
    this.carregarDadosUsuario();
    this.iniciarContadorTempoLogado();
  }

  carregarDadosUsuario(): void {
    this.loading = true;
    this.errorMessage = null;

    this.usuarioService.getMeuPerfil().subscribe({
      next: (dadosDoUsuario: Usuario) => {
        this.usuario = dadosDoUsuario;
        this.loading = false;
      },
      error: (erro: any) => {
        console.error('Erro ao carregar perfil:', erro);
        this.errorMessage = 'Não foi possível carregar seus dados. Tente novamente.';
        this.loading = false;
      }
    });
  }

  formatarData(dataISO: string | null | undefined): string {
    if (!dataISO) {

      return 'Data não informada';
    }
    
    try {

      const data = new Date(dataISO);
      
      if (isNaN(data.getTime())) {
        return 'Data inválida';
      }

      // Adiciona +1 dia (se a data vier como '2023-10-01' ela pode ser interpretada como UTC 00:00, 
      // o que no fuso -3 vira dia 30/09. Isso corrige.)
      data.setUTCDate(data.getUTCDate() + 1);

      return data.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch (e) {
      return 'Erro ao formatar data';
    }
  }

  navigateTo(route: string): void {
    this.router.navigate([`/${route}`]);
  }

  irParaEdicao(): void {
    console.log('Navegando para a página de edição...');
    // this.router.navigate(['/perfil-editar-form']);
  }

sair(): void {
 
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
 
      
      data: {
        title: 'Confirmar Saída',
        message: 'Deseja realmente sair da sua conta?',
        confirmText: 'Sair',
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
 
 
  iniciarEdicao(): void {
    if (!this.usuario) return;
    
    this.isEditing = true;
    this.formData.nome = this.usuario.nome;
    this.formData.email = this.usuario.email;
  }


  cancelarEdicao(): void {
    this.isEditing = false;
    this.errorMessage = null; 
  }

  salvarAlteracoes(): void {
    if (!this.usuario) return;

    this.loadingSave = true;
    this.errorMessage = null;


    const dadosParaSalvar: UsuarioRequest = {
      nome: this.formData.nome,
      email: this.formData.email,
      dataNascimento: this.usuario.dataNascimento,
      perfil: this.usuario.perfil               
    };

 
    this.usuarioService.atualizarPerfil(this.usuario.id, dadosParaSalvar).subscribe({
      next: (usuarioAtualizado) => {
        this.usuario = usuarioAtualizado; 
        this.isEditing = false;
        this.loadingSave = false;
      },
      error: (erro) => {
        console.error('Erro ao salvar:', erro);
        this.errorMessage = 'Não foi possível salvar as alterações.';
        this.loadingSave = false;
      }
    });
  }

iniciarContadorTempoLogado(): void {
  
    const loginTimeStr = localStorage.getItem('sessionLoginTime');
    
    if (!loginTimeStr) {
      this.tempoLogadoFormatado = 'N/D';  
      return;
    }

    const loginTime = Number(loginTimeStr);

     const atualizarTempo = () => {
      const agora = Date.now();
      const diffMs = agora - loginTime; 
      this.tempoLogadoFormatado = this.formatarDuracao(msToTime(diffMs));
    };

    
    atualizarTempo();

     this.timerInterval = setInterval(atualizarTempo, 30000); 
  }

   
  formatarDuracao(ms: number): string {
    if (ms < 0) ms = 0;

    const totalMinutos = Math.floor(ms / 60000);
    const horas = Math.floor(totalMinutos / 60);
    const minutos = totalMinutos % 60;

     
    const minutosFormatados = minutos < 10 ? '0' + minutos : minutos;

    return `${horas}h ${minutosFormatados}m`;
  }
}function msToTime(duration: number) {
  return duration; 
}