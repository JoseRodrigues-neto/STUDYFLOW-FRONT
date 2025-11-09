import { Component, OnInit } from '@angular/core';
import { AtividadeService } from '../atividade.service'; // Importe o serviço
import { Atividade } from '../../../models/atividade.model'; // Importe o model
import { CommonModule } from '@angular/common';
import { AtividadeDetailComponent } from '../atividade-detail/atividade-detail.component';

@Component({
  selector: 'app-atividade-list',
  imports: [
    CommonModule,
    AtividadeDetailComponent
  ],
  templateUrl: './atividade-list.component.html',
  styleUrls: ['./atividade-list.component.css']
})
export class AtividadeListComponent implements OnInit {

  atividades: Atividade[] = [];
  isLoading = true;
  isDetailPanelVisible = false;

  constructor(private atividadeService: AtividadeService) { }

  ngOnInit(): void {
    this.carregarAtividades();
  }

  carregarAtividades(): void {
    const roadmapIdParaTeste = 1; 

    this.atividadeService.getAtividadesByRoadmap(roadmapIdParaTeste).subscribe({
      next: (dados) => {
        this.atividades = dados;
        this.isLoading = false;
        console.log('Atividades carregadas:', this.atividades);
      },
      error: (erro) => {
        console.error('Erro ao buscar atividades:', erro);
        this.isLoading = false; 
      }
    });
  }

  abrirPainelDetalhes(): void {
    this.isDetailPanelVisible = true;
  }

  fecharPainelDetalhes(): void {
    this.isDetailPanelVisible = false;
  }
}