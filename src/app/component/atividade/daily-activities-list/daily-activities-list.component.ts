import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { AtividadeService } from '../atividade.service';
import { Atividade } from '../../../models/atividade.model';
import { CommonModule, DatePipe } from '@angular/common';
import { AnotacaoListComponent } from '../../anotacao/anotacao-list/anotacao-list.component';
import { StatusAtividade } from '../../../models/status-atividade.model';
import { UsuarioService } from '../../../services/usuario.service';
import { Usuario } from '../../../models/usuario.model';
import { Subscription } from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-daily-activities-list',
  standalone: true,
  imports: [
    CommonModule
  ],
  providers: [DatePipe],
  templateUrl: './daily-activities-list.component.html',
  styleUrls: ['./daily-activities-list.component.css']
})
export class DailyActivitiesListComponent implements OnInit, OnDestroy {

  atividades: Atividade[] = [];
  isLoading = true;
  dataAtual: string;
  usuario: Usuario | null = null;
  private atividadesSubscription: Subscription | undefined;

  constructor(
    private atividadeService: AtividadeService,
    private usuarioService: UsuarioService,
    private datePipe: DatePipe,
    private router: Router
  ) {
    const hoje = new Date();
    this.dataAtual = hoje.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' });
    this.dataAtual = this.dataAtual.charAt(0).toUpperCase() + this.dataAtual.slice(1);
  }

  ngOnInit(): void {
    this.carregarUsuarioEAtividades();
  }

  ngOnDestroy(): void {
    if (this.atividadesSubscription) {
      this.atividadesSubscription.unsubscribe();
    }
  }

  carregarUsuarioEAtividades(): void {
    this.isLoading = true;
    this.usuarioService.getMeuPerfil().subscribe({
      next: (usuario) => {
        console.log('PERFIL CARREGADO NA LISTA. ID:', usuario.id);
        this.usuario = usuario;
        if (usuario && usuario.id) {
          const statuses = [StatusAtividade.PENDENTE, StatusAtividade.EM_ANDAMENTO];
          this.atividadeService.loadDailyAtividades(statuses);
          this.subscribeToAtividades();
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

  subscribeToAtividades(): void {
    this.atividadesSubscription = this.atividadeService.atividades$.subscribe(atividades => {
      this.atividades = atividades;
      this.isLoading = false;
    });
  }

  iniciarNovaAtividade(): void {
    if (this.usuario && this.usuario.id) {
      this.router.navigate(['/app/atividade-form']);
    } else {
      console.error("Não é possível criar atividade sem ID do usuário.");
    }
  }

  verDetalhesAtividade(atividade: Atividade): void {
    this.router.navigate(['/app/atividade-form', atividade.id], { queryParams: { view: 'true' } });
  }

  editarAtividade(atividade: Atividade): void {
    if (!this.usuario?.id) {
      console.error("Usuário não carregado, não é possível editar a atividade.");
      return;
    }
    this.router.navigate(['/app/atividade-form', atividade.id]);
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