import { Component, OnInit } from '@angular/core';
import { RoadmapService } from '../../../services/roadmap.service';
import { Roadmap } from '../../../models/roadmap.model';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-roadmap-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './roadmap-list.component.html',
  styleUrls: ['./roadmap-list.component.css']
})
export class RoadmapListComponent implements OnInit {
  roadmaps: Roadmap[] = [];

  constructor(private roadmapService: RoadmapService, private router: Router) { }

  ngOnInit(): void {
    this.loadRoadmaps();
  }

  loadRoadmaps(): void {
    this.roadmapService.getRoadmaps().subscribe(roadmaps => {
      this.roadmaps = roadmaps;
    });
  }

  deleteRoadmap(id: number): void {
    this.roadmapService.deleteRoadmap(id).subscribe(() => {
      this.loadRoadmaps();
    });
  }

  editRoadmap(id: number): void {
    // ATUALIZADO: Usar a rota correta com /app
    this.router.navigate(['/app/roadmap-form', id]); 
  }

  // Navega para o formulário de CRIAÇÃO
  createRoadmap(): void {
    // ATUALIZADO: Usar a rota correta com /app
    this.router.navigate(['/app/roadmap-form']); 
  }

  // NOVO: Navega para a página de DETALHE (a sua imagem)
  openRoadmap(id: number): void {
    this.router.navigate(['/app/roadmap', id]);
  }
}
