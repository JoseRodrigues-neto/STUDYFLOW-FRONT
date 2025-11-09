import { Component, OnInit } from '@angular/core';
import { AtividadeService } from '../atividade.service';
import { Atividade } from '../../../models/atividade.model';
import { CommonModule, DatePipe } from '@angular/common';
import { AnotacaoListComponent } from '../../anotacao/anotacao-list/anotacao-list.component';
import { StatusAtividade } from '../../../models/status-atividade.model';
import { AtividadeFormComponent } from '../atividade-form/atividade-form.component'; // Importar o novo formulário

@Component({
  selector: 'app-atividade-list',
  standalone: true,
  imports: [
    CommonModule,
    AnotacaoListComponent,
    AtividadeFormComponent
  ],
  providers: [DatePipe],
  templateUrl: './atividade-list.component.html',
  styleUrls: ['./atividade-list.component.css']
})
export class AtividadeListComponent implements OnInit {

  atividades: Atividade[] = [];
  isLoading = true;
  
  isDetailPanelVisible = false;
  isFormPanelVisible = false;

  atividadeSelecionada: Atividade | null = null;
  atividadeParaEditar: Atividade | null = null;

  dataAtual: string;

  constructor(
    private atividadeService: AtividadeService,
    private datePipe: DatePipe
  ) {
    const hoje = new Date();
    this.dataAtual = this.datePipe.transform(hoje, 'EEEE, d \'de\' MMMM') || '';
    this.dataAtual = this.dataAtual.charAt(0).toUpperCase() + this.dataAtual.slice(1);
  }

  ngOnInit(): void {
    this.carregarAtividades();
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

  selecionarAtividade(atividade: Atividade): void {
    this.atividadeSelecionada = atividade;
    this.isDetailPanelVisible = true;
    this.isFormPanelVisible = false;
  }

  fecharPainelDetalhes(): void {
    this.isDetailPanelVisible = false;
    this.atividadeSelecionada = null;
  }

  iniciarNovaAtividade(): void {
    this.atividadeParaEditar = null;
    this.isFormPanelVisible = true;
    this.isDetailPanelVisible = false;
  }

  editarAtividade(atividade: Atividade): void {
    this.atividadeParaEditar = atividade;
    this.isFormPanelVisible = true;
    this.isDetailPanelVisible = false;
  }

  handleFormSave(): void {
    this.isFormPanelVisible = false;
    this.atividadeParaEditar = null;
    this.carregarAtividades();
  }

  handleFormClose(): void {
    this.isFormPanelVisible = false;
    this.atividadeParaEditar = null;
  }

  excluirAtividade(id: number): void {
    // Adicionar um dialog 
    if (confirm('Tem certeza que deseja excluir esta atividade?')) {
      this.atividadeService.delete(id).subscribe({
        next: () => {
          this.fecharPainelDetalhes();
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