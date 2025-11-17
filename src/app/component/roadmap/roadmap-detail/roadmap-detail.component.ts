import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { RoadmapService } from '../../../services/roadmap.service';
import { Roadmap } from '../../../models/roadmap.model';
import { Atividade } from '../../../models/atividade.model';
import { CommonModule } from '@angular/common';
import { AtividadeService } from '../../atividade/atividade.service';

@Component({
  selector: 'app-roadmap-detail',
  standalone: true,
  imports: [
    CommonModule
  ],
  templateUrl: './roadmap-detail.component.html',
  styleUrls: ['./roadmap-detail.component.css']
})
export class RoadmapDetailComponent implements OnInit {

  roadmap: Roadmap | null = null;
  atividades: Atividade[] = [];
  isLoadingRoadmap = true;
  isLoadingAtividades = true;

  dataAtual: string;

  constructor(
    private route: ActivatedRoute,
    private roadmapService: RoadmapService,
    private atividadeService: AtividadeService // Terá de injetar o seu AtividadeService
  ) {
    const hoje = new Date();
    this.dataAtual = hoje.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' });
    this.dataAtual = this.dataAtual.charAt(0).toUpperCase() + this.dataAtual.slice(1);
   }

  ngOnInit(): void {
    // 1. Obter o ID da URL
    const roadmapId = Number(this.route.snapshot.paramMap.get('id'));

    if (roadmapId) {
      // 2. Carregar os dados do Roadmap
      this.roadmapService.getRoadmap(roadmapId).subscribe({
        next: (dados) => {
          this.roadmap = dados;
          this.isLoadingRoadmap = false;
        },
        error: (err) => {
          console.error('Erro ao carregar roadmap:', err);
          this.isLoadingRoadmap = false;
        }
      });

      // 3. Carregar as atividades desse Roadmap
      this.atividadeService.getAtividadesByRoadmap(roadmapId).subscribe({
        next: (dados) => {
          this.atividades = dados;
          this.isLoadingAtividades = false;
        },
        error: (err) => {
          console.error('Erro ao carregar atividades:', err);
          this.isLoadingAtividades = false;
        }
      });
    }
  }

  // Futuramente, esta função abrirá o painel que criámos
  adicionarAtividade(): void {
    console.log("Abrir painel de nova atividade...");
    // Aqui você implementaria a lógica para mostrar o painel de detalhes da tarefa
  }
}