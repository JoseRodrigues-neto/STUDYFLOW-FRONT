import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { RoadmapService } from '../../../services/roadmap.service';
import { Roadmap } from '../../../models/roadmap.model';
import { CommonModule } from '@angular/common';
import { UsuarioService } from '../../../services/usuario.service';
import { Usuario } from '../../../models/usuario.model';

@Component({
  selector: 'app-roadmap-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink
  ],
  templateUrl: './roadmap-form.component.html',
  styleUrls: ['./roadmap-form.component.css']
})
export class RoadmapFormComponent implements OnInit {
  roadmapForm: FormGroup;
  roadmapId?: number;
  currentUser!: Usuario;
  isLoading = true; // Flag para controlar o estado de carregamento
  errorMessage: string | null = null; // Para exibir mensagens de erro

  constructor(
    private fb: FormBuilder,
    private roadmapService: RoadmapService,
    private usuarioService: UsuarioService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.roadmapForm = this.fb.group({
      titulo: ['', Validators.required],
      descricao: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    const idParam = this.route.snapshot.params['id'];
    this.isLoading = true; // Inicia o carregamento
    this.errorMessage = null; // Limpa erros anteriores
    if (idParam) {
      this.roadmapId = +idParam;
      this.loadRoadmapData();
    } else {
      this.loadCurrentUser();
    }
  }

  loadRoadmapData(): void {
    if (this.roadmapId) {
      this.roadmapService.getRoadmap(this.roadmapId).subscribe({
        next: roadmap => {
          this.roadmapForm.patchValue(roadmap);
          this.currentUser = roadmap.usuario;
          this.isLoading = false;
        },
        error: err => {
          console.error('Erro ao carregar dados do roadmap:', err);
          this.errorMessage = 'Falha ao carregar os dados do roadmap. Por favor, tente novamente mais tarde.';
          this.isLoading = false;
        }
      });
    }
  }

  loadCurrentUser(): void {
    this.usuarioService.getMeuPerfil().subscribe({
      next: user => {
        this.currentUser = user;
        this.isLoading = false;
      },
      error: err => {
        console.error('Erro ao carregar dados do usuário:', err);
        this.errorMessage = 'Não foi possível carregar os dados do usuário. Sem isso, não é possível criar um roadmap.';
        this.isLoading = false;
      }
    });
  }

  onSubmit(): void {
    if (this.roadmapForm.invalid) {
      return;
    }

    const formValues = this.roadmapForm.value;
    const roadmapData: Partial<Roadmap> = {
      titulo: formValues.titulo,
      descricao: formValues.descricao,
      usuario: this.currentUser
    };

    const returnUrl = '/app/roadmaps';

    if (this.roadmapId) {
      this.roadmapService.updateRoadmap(this.roadmapId, roadmapData as Roadmap).subscribe(() => {
        this.router.navigate([returnUrl]);
      });
    } else {
      this.roadmapService.createRoadmap(roadmapData as Roadmap).subscribe(() => {
        this.router.navigate([returnUrl]);
      });
    }
  }
}