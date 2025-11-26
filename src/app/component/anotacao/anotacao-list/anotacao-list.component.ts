import { Component, OnInit, Input, OnChanges, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AnotacaoService } from '../anotacao.service';
import { Anotacao } from '../../../models/anotacao.model';

@Component({
  selector: 'app-anotacao-list',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule
  ],
  templateUrl: './anotacao-list.component.html',
  styleUrls: ['./anotacao-list.component.css']
})
export class AnotacaoListComponent implements OnChanges {

  @Input() atividadeId!: number;
  
  anotacoes: Anotacao[] = [];
  isLoading = true;
  
  newAnotacaoForm: FormGroup;

  editAnotacaoForm: FormGroup;
  editingAnotacaoId: number | null = null;

  constructor(
    private anotacaoService: AnotacaoService,
    private fb: FormBuilder
  ) {
    this.newAnotacaoForm = this.fb.group({
      conteudo: ['', Validators.required]
    });

    this.editAnotacaoForm = this.fb.group({
      conteudo: ['', Validators.required]
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['atividadeId'] && this.atividadeId) {
      this.carregarAnotacoes();
    }
  }

  carregarAnotacoes(): void {
    this.isLoading = true;
    this.anotacaoService.getAnotacoesByAtividade(this.atividadeId).subscribe({
      next: (dados) => {
        console.log(`Anotações recebidas para atividade ${this.atividadeId}:`, dados);
        this.anotacoes = dados;
        this.isLoading = false;
      },
      error: (erro) => {
        console.error(`Erro ao buscar anotações para atividade ${this.atividadeId}:`, erro);
        this.isLoading = false;
      }
    });
  }

  createAnotacao(): void {
    if (this.newAnotacaoForm.invalid) return;

    const novaAnotacao = {
      conteudo: this.newAnotacaoForm.value.conteudo,
      atividadeId: this.atividadeId
    };

    this.anotacaoService.create(novaAnotacao as Anotacao).subscribe((anotacaoCriada) => {
      this.anotacoes.push(anotacaoCriada);
      this.newAnotacaoForm.reset();
    });
  }

  startEdit(anotacao: Anotacao): void {
    this.editingAnotacaoId = anotacao.id!;
    this.editAnotacaoForm.setValue({ conteudo: anotacao.conteudo });
  }

  cancelEdit(): void {
    this.editingAnotacaoId = null;
  }

  saveEdit(anotacao: Anotacao): void {
    if (this.editAnotacaoForm.invalid) return;

    const anotacaoAtualizada = {
      ...anotacao,
      conteudo: this.editAnotacaoForm.value.conteudo
    };

    this.anotacaoService.update(anotacaoAtualizada).subscribe((anotacaoRetornada) => {
      const index = this.anotacoes.findIndex(a => a.id === anotacaoRetornada.id);
      if (index !== -1) {
        this.anotacoes[index] = anotacaoRetornada;
      }
      this.editingAnotacaoId = null;
    });
  }

  deleteAnotacao(id: number): void {
    if (confirm('Tem certeza que deseja excluir esta anotação?')) {
      this.anotacaoService.delete(id).subscribe(() => {
        this.anotacoes = this.anotacoes.filter(a => a.id !== id);
      });
    }
  }

  exportarAnotacao(anotacao: Anotacao): void {
    this.anotacaoService.exportAnotacaoAsTxt(anotacao.id!).subscribe(response => {
      // O backend já nos dá um header para sugerir o nome do arquivo
      const header = response.headers.get('Content-Disposition');
      const match = header && header.match(/filename="(.+)"/);
      const filename = match ? match[1] : `anotacao-${anotacao.id}.txt`;

      // Cria um Blob com o conteúdo de texto
      const blob = new Blob([response.body!], { type: 'text/plain' });

      // Cria uma URL para o Blob e simula o clique em um link para baixar
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      
      // Limpa a URL e o elemento
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    });
  }
}