import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AtividadeService } from '../atividade.service';
import { Atividade } from '../../../models/atividade.model';
import { CommonModule, DatePipe } from '@angular/common';
import { StatusAtividade } from '../../../models/status-atividade.model';
import { TimerComponent } from '../../../components/timer/timer.component';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { UsuarioService } from '../../../services/usuario.service';
import { Usuario } from '../../../models/usuario.model';
import { Observable } from 'rxjs';
import { AnotacaoListComponent } from '../../anotacao/anotacao-list/anotacao-list.component';

@Component({
  selector: 'app-atividade-list',
  standalone: true,
  imports: [
    CommonModule,
    AnotacaoListComponent,
    TimerComponent,
    MatIconModule,
    MatButtonModule
  ],
  providers: [DatePipe],
  templateUrl: './atividade-list.component.html',
  styleUrls: ['./atividade-list.component.css']
})
export class AtividadeListComponent implements OnInit {

  atividades$: Observable<Atividade[]>;
  isLoading = true;
  dataAtual: string;
  isTimerCollapsed = false;
  usuario: Usuario | null = null; // Adicionado propriedade de usuário

  constructor(
    private atividadeService: AtividadeService,
    private usuarioService: UsuarioService, // Injetado UsuarioService
    private datePipe: DatePipe,
    private router: Router
  ) {
    const hoje = new Date();
    this.dataAtual = hoje.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' });
    this.dataAtual = this.dataAtual.charAt(0).toUpperCase() + this.dataAtual.slice(1);
    this.atividades$ = this.atividadeService.atividades$;
  }

  ngOnInit(): void {
    this.carregarAtividades();
  }

    toggleTimer(): void {
    this.isTimerCollapsed = !this.isTimerCollapsed;
  }
  

carregarAtividades(): void {
    this.isLoading = true;

 
    this.usuarioService.getMeuPerfil().subscribe({
      next: (usuario) => {
        this.usuario = usuario;
        
        if (usuario && usuario.id) {
           
          this.atividadeService.loadInitialAtividades();
        
          this.atividades$.subscribe(() => this.isLoading = false);
        } else {
          console.error('ID do usuário não encontrado.');
          this.isLoading = false;
        }
      },
      error: (erro) => {
        console.error('Erro ao buscar perfil do usuário:', erro);
        this.isLoading = false;
      }
    });
  }

  iniciarNovaAtividade(): void {
    const roadmapIdParaTeste = 1;
    if (this.usuario && this.usuario.id) {
      this.router.navigate(['/app/atividade-form'], { queryParams: { roadmapId: roadmapIdParaTeste } });
    } else {
      console.error("Não é possível criar atividade sem ID do usuário.");
    }
  }

  verDetalhesAtividade(atividade: Atividade): void {
    this.router.navigate(['/app/atividade-form', atividade.id], { queryParams: { view: 'true' } });
  }

  editarAtividade(atividade: Atividade): void {
    if (this.usuario && this.usuario.id) {
      this.router.navigate(['/app/atividade-form', atividade.id]);
    } else {
      console.error("Não é possível editar atividade sem ID do usuário.");
    }
  }

  excluirAtividade(id: number): void {
    if (confirm('Tem certeza que deseja excluir esta atividade?') && this.usuario && this.usuario.id) {
      this.atividadeService.delete(id).subscribe({
        error: (err) => console.error('Erro ao excluir atividade', err)
      });
    }
  }

  getStatusClass(status: StatusAtividade): string {
    switch (status) {
      case StatusAtividade.PENDENTE: return 'status-pendente';
      case StatusAtividade.EM_ANDAMENTO: return 'status-andamento';
      case StatusAtividade.CONCLUIDO: return 'status-concluido';
      default: return '';
    }
  }

  formatarData(data: Date | string | undefined): string {
    if (!data) return 'Não definida';
    try {
      return this.datePipe.transform(data, 'dd/MM/yyyy') || 'Inválida';
    } catch (e) {
      return 'Data inválida';
    }
  }
}