import { Component, OnInit, Input } from '@angular/core'; // Adicione Input
import { AnotacaoService } from '../anotacao.service'; 
import { Anotacao } from '../../../models/anotacao.model';
import { CommonModule } from '@angular/common';
import { AnotacaoDetailComponent } from '../anotacao-detail/anotacao-detail.component';

@Component({
  selector: 'app-anotacao-list',
  standalone: true,
  imports: [
    CommonModule,
    AnotacaoDetailComponent
  ],
  templateUrl: './anotacao-list.component.html',
  styleUrls: ['./anotacao-list.component.css']
})
export class AnotacaoListComponent implements OnInit {

  @Input() atividadeId!: number; 
  anotacaos: Anotacao[] = [];
  isLoading = true;
  isDetailPanelVisible = false;

  anotacaoSelecionada: Anotacao | null = null;

  constructor(private anotacaoService: AnotacaoService) { }

  ngOnInit(): void {
    if (this.atividadeId) {
      this.carregarAnotacaos(this.atividadeId);
    } else {
      console.error('Atividade ID não foi fornecido para AnotacaoListComponent!');
      this.isLoading = false;
    }
  }

  carregarAnotacaos(id: number): void {
    this.isLoading = true;
    
    this.anotacaoService.getAnotacoesByAtividade(id).subscribe({
        next: (dados) => {
          this.anotacaos = dados;
          this.isLoading = false;
        },
        error: (erro) => {
          console.error(`Erro ao buscar anotacaos para atividade ${id}:`, erro);
          this.isLoading = false; 
        }
      });
  }

  abrirPainelDetalhes(anotacao: Anotacao | null = null): void {
    this.anotacaoSelecionada = anotacao;
    this.isDetailPanelVisible = true;
  }

  fecharPainelDetalhes(): void {
    this.isDetailPanelVisible = false;
    this.anotacaoSelecionada = null;
  }

  handleSave(): void {
    this.fecharPainelDetalhes();
    if (this.atividadeId) {
      this.carregarAnotacaos(this.atividadeId);
    }
  }
}