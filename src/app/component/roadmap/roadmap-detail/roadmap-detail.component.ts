import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
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

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private roadmapService: RoadmapService,
    private atividadeService: AtividadeService
  ) {
   }

  ngOnInit(): void {
    const roadmapId = Number(this.route.snapshot.paramMap.get('id'));

    if (roadmapId) {
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

  adicionarAtividade(): void {
    if (this.roadmap) {
      this.router.navigate(['/app/atividade-form'], { queryParams: { roadmapId: this.roadmap.id } });
    } else {
      console.error('Roadmap não carregado, não é possível adicionar atividade.');
    }
  }

  verDetalhesAtividade(atividade: Atividade): void {
    this.router.navigate(['/app/atividade-form', atividade.id], { queryParams: { view: 'true' } });
  }

  editarAtividade(atividade: Atividade): void {
    this.router.navigate(['/app/atividade-form', atividade.id]);
  }
}