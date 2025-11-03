import { Component, OnInit } from '@angular/core';
import { AtividadeService } from '../atividade.service'; // Importe o serviço
import { Atividade } from '../../../models/atividade.model'; // Importe o model
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-atividade-list',
  imports: [
    CommonModule
  ],
  templateUrl: './atividade-list.component.html',
  styleUrls: ['./atividade-list.component.css']
})
export class AtividadeListComponent implements OnInit {

  // Uma propriedade para guardar a lista de atividades que virá da API
  atividades: Atividade[] = [];
  isLoading = true; // Uma variável para mostrar uma mensagem de "carregando"

  // Injetamos o nosso serviço no construtor. O Angular cuida do resto.
  constructor(private atividadeService: AtividadeService) { }

  // O método ngOnInit é executado uma vez quando o componente é iniciado.
  // É o lugar perfeito para buscar dados iniciais.
  ngOnInit(): void {
    this.carregarAtividades();
  }

  carregarAtividades(): void {
    // Para este teste, vamos buscar as atividades de um roadmap com ID fixo, por exemplo, o ID 1.
    // Mais tarde, esse ID virá da URL ou de outro componente.
    const roadmapIdParaTeste = 1; 

    this.atividadeService.getAtividadesByRoadmap(roadmapIdParaTeste).subscribe({
      next: (dados) => {
        // Quando os dados chegarem com sucesso...
        this.atividades = dados;
        this.isLoading = false; // Esconde a mensagem de "carregando"
        console.log('Atividades carregadas:', this.atividades);
      },
      error: (erro) => {
        // Se der algum erro...
        console.error('Erro ao buscar atividades:', erro);
        this.isLoading = false; // Esconde a mensagem de "carregando" também no erro
      }
    });
  }
}