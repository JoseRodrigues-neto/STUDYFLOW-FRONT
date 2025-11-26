import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AtividadeService } from '../atividade.service';
import { Atividade } from '../../../models/atividade.model';
import { CommonModule, DatePipe } from '@angular/common';
import { AnotacaoListComponent } from '../../anotacao/anotacao-list/anotacao-list.component';
import { StatusAtividade } from '../../../models/status-atividade.model';
import { TimerComponent } from '../../../components/timer/timer.component';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

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

  atividades: Atividade[] = [];
  isLoading = true;
  dataAtual: string;
  isTimerCollapsed = false;

  constructor(
    private atividadeService: AtividadeService,
    private datePipe: DatePipe,
    private router: Router
  ) {
    const hoje = new Date();
    this.dataAtual = hoje.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' });
    this.dataAtual = this.dataAtual.charAt(0).toUpperCase() + this.dataAtual.slice(1);
  }

  ngOnInit(): void {
    this.carregarAtividades();
  }

    toggleTimer(): void {
    this.isTimerCollapsed = !this.isTimerCollapsed;
  }
  

  carregarAtividades(): void {
    this.isLoading = true;
    const roadmapIdParaTeste = 1; 

    this.atividadeService.getAtividadesByRoadmap(roadmapIdParaTeste).subscribe({
      next: (dados) => {
        this.atividades = dados;
        this.isLoading = false;
      },
      error: (erro) => {
        console.error('Erro ao buscar atividades:', erro);
        this.isLoading = false; 
      }
    });
  }

  iniciarNovaAtividade(): void {
    const roadmapIdParaTeste = 1;
    this.router.navigate(['/app/atividade-form'], { queryParams: { roadmapId: roadmapIdParaTeste } });
  }

  verDetalhesAtividade(atividade: Atividade): void {
    this.router.navigate(['/app/atividade-form', atividade.id], { queryParams: { view: 'true' } });
  }

  editarAtividade(atividade: Atividade): void {
    this.router.navigate(['/app/atividade-form', atividade.id]);
  }

  excluirAtividade(id: number): void {
    if (confirm('Tem certeza que deseja excluir esta atividade?')) {
      this.atividadeService.delete(id).subscribe({
        next: () => {
          this.carregarAtividades();
        },
        error: (err) => console.error('Erro ao excluir atividade', err)
      });
    }
  }

  getStatusClass(status: StatusAtividade): string {
    switch (status) {
      case StatusAtividade.PENDENTE: return 'status-pendente';
      case StatusAtividade.EM_ANDAMENTO: return 'status-andamento';
      case StatusAtividade.CONCLUIDA: return 'status-concluida';
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