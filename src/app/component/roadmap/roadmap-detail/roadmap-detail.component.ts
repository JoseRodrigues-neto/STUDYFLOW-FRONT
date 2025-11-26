import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { RoadmapService } from '../../../services/roadmap.service';
import { Roadmap } from '../../../models/roadmap.model';
import { Atividade } from '../../../models/atividade.model';
import { CommonModule } from '@angular/common';
import { AtividadeService } from '../../atividade/atividade.service';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ConfirmDialogComponent, ConfirmDialogData } from '../../../dialogs/confimar/confirm-dialog.component';
import { StatusAtividade } from '../../../models/status-atividade.model';
import { UsuarioService } from '../../../services/usuario.service';
import { Usuario } from '../../../models/usuario.model';
import { Subscription } from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-roadmap-detail',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule
  ],
  templateUrl: './roadmap-detail.component.html',
  styleUrls: ['./roadmap-detail.component.css']
})
export class RoadmapDetailComponent implements OnInit, OnDestroy {

  roadmap: Roadmap | null = null;
  atividades: Atividade[] = [];
  isLoadingRoadmap = true;
  isLoadingAtividades = true;
  usuario: Usuario | null = null;
  private atividadesSubscription: Subscription | undefined;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private roadmapService: RoadmapService,
    private atividadeService: AtividadeService,
    private usuarioService: UsuarioService,
    private dialog: MatDialog
  ) { }

  ngOnInit(): void {
    this.isLoadingRoadmap = true;
    this.isLoadingAtividades = true;

    this.usuarioService.getMeuPerfil().subscribe(usuario => {
      this.usuario = usuario;
      const roadmapId = Number(this.route.snapshot.paramMap.get('id'));

      if (usuario && usuario.id && roadmapId) {
        this.atividadeService.loadAtividadesByRoadmap(roadmapId);
        
        this.roadmapService.getRoadmap(roadmapId).subscribe({
          next: (dados) => {
            this.roadmap = dados;
            this.isLoadingRoadmap = false;
            this.subscribeToAtividades();
          },
          error: (err) => {
            console.error('Erro ao carregar roadmap:', err);
            this.isLoadingRoadmap = false;
          }
        });
      } else {
        this.isLoadingRoadmap = false;
        this.isLoadingAtividades = false;
        console.error('Usuário ou ID do Roadmap não encontrado.');
      }
    });
  }

  ngOnDestroy(): void {
    if (this.atividadesSubscription) {
      this.atividadesSubscription.unsubscribe();
    }
  }

  subscribeToAtividades(): void {
    this.atividadesSubscription = this.atividadeService.atividades$.subscribe(atividades => {
      this.atividades = atividades;
      this.isLoadingAtividades = false;
    });
  }

  adicionarAtividade(): void {
    if (this.roadmap && this.usuario) {
      this.router.navigate(['/app/atividade-form'], { queryParams: { roadmapId: this.roadmap.id, usuarioId: this.usuario.id } });
    } else {
      console.error('Roadmap ou usuário não carregado, não é possível adicionar atividade.');
    }
  }

  verDetalhesAtividade(atividade: Atividade): void {
    this.router.navigate(['/app/atividade-form', atividade.id], { queryParams: { view: 'true' } });
  }

  editarAtividade(atividade: Atividade): void {
     if (!this.usuario?.id) {
      console.error("Usuário não carregado, não é possível editar a atividade.");
      return;
    }
    this.router.navigate(['/app/atividade-form', atividade.id], { queryParams: { usuarioId: this.usuario.id, roadmapId: this.roadmap?.id } });
  }

  excluirAtividade(atividade: Atividade): void {
    const dialogData: ConfirmDialogData = {
      title: 'Confirmar Exclusão',
      message: `Tem certeza de que deseja excluir a atividade "${atividade.titulo}"?`,
      confirmText: 'Excluir',
      cancelText: 'Cancelar'
    };

    const dialogRef = this.dialog.open(ConfirmDialogComponent, { data: dialogData });

    dialogRef.afterClosed().subscribe(result => {
      if (result && this.usuario && this.usuario.id && this.roadmap) {
        this.atividadeService.delete(atividade.id, this.usuario.id, this.roadmap.id).subscribe({
          error: (err) => console.error('Erro ao excluir atividade:', err)
        });
      }
    });
  }

  getStatusClass(status: StatusAtividade): string {
    switch (status) {
      case StatusAtividade.PENDENTE:
        return 'status-pendente';
      case StatusAtividade.EM_ANDAMENTO:
        return 'status-andamento';
      case StatusAtividade.CONCLUIDO:
        return 'status-concluida';
      default:
        return '';
    }
  }
}